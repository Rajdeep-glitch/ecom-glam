import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { calculateShippingDetails } from '@/lib/shipping';
import { CartItem } from '@/lib/types';
import { checkRateLimit, RATE_LIMIT_TIERS } from '@/lib/rateLimit';
import { cacheManager } from '@/lib/cache';
import { recordRequestStart } from '@/lib/metrics';

export async function POST(req: NextRequest) {
  const endRequestMetric = recordRequestStart();
  try {
    // 1. Enforce strict checkout rate limiting (Anti-bot / Anti-carding / Scalper protection)
    const rateCheck = checkRateLimit(req, RATE_LIMIT_TIERS.CHECKOUT);
    if (!rateCheck.allowed && rateCheck.response) {
      endRequestMetric(429);
      return rateCheck.response;
    }

    const userSession = getUserFromRequest(req);
    const body = await req.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      billingAddress,
      paymentMethod = 'ONLINE_UPI_CARD',
      paymentTransactionId,
      items,
    } = body;

    const idempotencyKey =
      (req.headers.get('x-idempotency-key') || body.idempotencyKey || '').toString().trim() || null;

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress) {
      endRequestMetric(400);
      return NextResponse.json({ error: 'Customer contact details and shipping address are required' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      endRequestMetric(400);
      return NextResponse.json({ error: 'Shopping cart is empty' }, { status: 400 });
    }

    // Validate quantities strictly on the server
    for (const item of items) {
      if (!item.variantId || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
        endRequestMetric(400);
        return NextResponse.json(
          { error: 'Invalid cart item or quantity (must be an integer between 1 and 100)' },
          { status: 400 }
        );
      }
    }

    // Idempotency check: prevent duplicate orders on retries or double-clicks
    if (idempotencyKey) {
      const existingOrder = await prisma.order.findUnique({
        where: { idempotencyKey },
        include: {
          items: true,
          invoice: true,
          shippingLabel: true,
        },
      });
      if (existingOrder) {
        endRequestMetric(200);
        return NextResponse.json(
          {
            success: true,
            idempotentReplay: true,
            order: existingOrder,
            message: 'Order already processed for this idempotency key',
          },
          { status: 200, headers: rateCheck.headers }
        );
      }
    }

    // 2. Process checkout in an ACID-compliant Prisma transaction with Atomic Compare-and-Swap
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch and validate all product variants and check inventory
      const variantIds = items.map((i: CartItem) => i.variantId);
      const variantsInDb = await tx.productVariant.findMany({
        where: { id: { in: variantIds }, isActive: true },
        include: {
          product: {
            include: {
              translations: true,
            },
          },
        },
      });

      const variantMap = new Map(variantsInDb.map((v) => [v.id, v]));

      // Build server-verified cart items strictly from DB values (never trust client price/weight)
      const serverVerifiedItems: CartItem[] = [];
      for (const item of items) {
        const v = variantMap.get(item.variantId);
        if (!v) {
          throw new Error(`Variant not found or inactive for ID: ${item.variantId}`);
        }
        if (v.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${v.sku}. Only ${v.stockQuantity} units available.`);
        }
        serverVerifiedItems.push({
          variantId: v.id,
          productId: v.productId,
          title: v.product.translations.find((t) => t.langCode === 'en')?.title || 'Artisanal Honey',
          packagingType: v.packagingType as 'GLASS_JAR' | 'PET_JAR',
          netWeightGrams: v.netWeightGrams as 500 | 1000,
          grossWeightGrams: v.grossShippingWeightGrams,
          isFragile: v.isFragile,
          sku: v.sku,
          price: v.salePrice,
          mrp: v.mrp,
          quantity: item.quantity,
          imageUrl: v.variantImageUrl || '',
        });
      }

      // 2. Compute accurate price, weight, and shipping strictly from server-verified items
      const shippingCalc = calculateShippingDetails(serverVerifiedItems);
      const subtotal = shippingCalc.subtotal;
      const taxAmount = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
      const shippingFee = shippingCalc.shippingFee;
      const totalAmount = Math.round((subtotal + taxAmount + shippingFee) * 100) / 100;

      // 3. Atomic sequential order & invoice number generation (zero collision under concurrency)
      const existingSeq = await tx.orderSequence.findUnique({ where: { id: 'order_seq' } });
      let seqNum: number;
      if (!existingSeq) {
        const initialCount = await tx.order.count();
        const createdSeq = await tx.orderSequence.create({
          data: { id: 'order_seq', currentNumber: 1000 + initialCount + 1 },
        });
        seqNum = createdSeq.currentNumber;
      } else {
        const updatedSeq = await tx.orderSequence.update({
          where: { id: 'order_seq' },
          data: { currentNumber: { increment: 1 } },
        });
        seqNum = updatedSeq.currentNumber;
      }

      const nextOrderNum = seqNum.toString();
      const orderNumber = `ORD-2026-${nextOrderNum}`;
      const invoiceNumber = `INV-2026-${nextOrderNum}`;
      const trackingNumber = `AWB-${crypto.randomInt(1000000000, 9999999999)}`;
      const guestAccessToken = crypto.randomBytes(24).toString('hex');

      // 4. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: userSession?.id || null,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          billingAddress: billingAddress || shippingAddress,
          totalGrossWeightGrams: shippingCalc.totalGrossWeightGrams,
          hasGlassPackaging: shippingCalc.hasGlassPackaging,
          subtotal,
          taxAmount,
          shippingFee,
          totalAmount,
          paymentMethod,
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
          paymentTransactionId: paymentTransactionId || (paymentMethod === 'COD' ? null : `TXN-${Date.now()}`),
          status: 'CONFIRMED',
          idempotencyKey,
          guestAccessToken,
          notes: shippingCalc.hasGlassPackaging ? 'Fragile Glass packaging - protect with safety air-cushioning' : 'Standard packaging',
        },
      });

      // 5. Create Order Items and ATOMICALLY decrement stock using Compare-and-Swap (prevents overselling)
      for (const item of items) {
        const v = variantMap.get(item.variantId)!;
        const enTitle = v.product.translations.find((t) => t.langCode === 'en')?.title || 'Artisanal Honey';
        const packagingLabel = v.packagingType === 'GLASS_JAR' ? 'Glass Jar (Tamper-Evident)' : 'Food-Grade PET Jar';
        const variantLabel = `${v.netWeightGrams}g - ${packagingLabel}`;

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            variantId: v.id,
            productTitle: enTitle,
            variantTitle: variantLabel,
            packagingType: v.packagingType,
            netWeightGrams: v.netWeightGrams,
            grossWeightGrams: v.grossShippingWeightGrams,
            sku: v.sku,
            unitPrice: v.salePrice,
            quantity: item.quantity,
            totalPrice: Math.round(v.salePrice * item.quantity * 100) / 100,
          },
        });

        // Atomic decrement with condition: only decrement if stockQuantity >= item.quantity
        const updateResult = await tx.productVariant.updateMany({
          where: {
            id: v.id,
            stockQuantity: {
              gte: item.quantity,
            },
          },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });

        if (updateResult.count === 0) {
          throw new Error(
            `High traffic race condition: ${v.sku} sold out during checkout. Inventory preserved.`
          );
        }
      }

      // 6. Generate 1-Click Tax Invoice
      const cgst = Math.round((subtotal * 0.025) * 100) / 100;
      const sgst = Math.round((taxAmount - cgst) * 100) / 100;

      await tx.invoice.create({
        data: {
          orderId: newOrder.id,
          invoiceNumber,
          hsnSummary: '04090000 - Natural Honey (5% GST)',
          taxBreakupJson: JSON.stringify({
            hsnCode: '04090000',
            cgstRate: 2.5,
            sgstRate: 2.5,
            cgstAmount: cgst,
            sgstAmount: sgst,
            totalTax: taxAmount,
          }),
          sellerGstNumber: '07AAAAA0000A1Z5',
          sellerCompanyName: 'Artisanal Royal Honey Co. Ltd.',
          sellerAddress: 'Suite 104, Apiary Heights, Western Ghats Reserve, Karnataka 577101',
        },
      });

      // 7. Generate 1-Click Shipping Label
      await tx.shippingLabel.create({
        data: {
          orderId: newOrder.id,
          trackingNumber,
          courierPartner: shippingCalc.hasGlassPackaging ? 'HoneyExpress Fragile Secure Cargo' : 'Delhivery Speed Express',
          barcodeData: trackingNumber,
          qrCodeData: `https://track.honeyexpress.com/shipment/${trackingNumber}?order=${orderNumber}`,
          totalWeightGrams: shippingCalc.totalGrossWeightGrams,
          isFragileGlass: shippingCalc.hasGlassPackaging,
          handlingInstructions: shippingCalc.hasGlassPackaging
            ? 'HANDLE WITH CARE - FRAGILE GLASS ENCLOSED'
            : 'STANDARD HANDLING',
          labelFormat: '4x6_THERMAL',
        },
      });

      return newOrder;
    });

    // Invalidate product catalog cache immediately so storefront reflects updated stock
    cacheManager.invalidateTag('products');

    const populatedOrder = await prisma.order.findUnique({
      where: { id: result.id },
      include: {
        items: true,
        invoice: true,
        shippingLabel: true,
      },
    });

    endRequestMetric(201);
    return NextResponse.json(
      {
        success: true,
        order: populatedOrder,
        message: 'Order placed successfully and inventory updated',
      },
      {
        status: 201,
        headers: rateCheck.headers,
      }
    );
  } catch (error: any) {
    endRequestMetric(400);
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 400 });
  }
}


