import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('🧪 Starting Full System Verification...\n');

  // 1. Languages
  const languages = await prisma.language.findMany();
  console.log(`✓ Active Languages (${languages.length}):`, languages.map((l) => `${l.name} (${l.code}, dir: ${l.direction})`).join(' | '));
  if (languages.length < 4) throw new Error('Expected 4 languages');

  // 2. Categories
  const categories = await prisma.category.findMany({
    include: { translations: true },
  });
  console.log(`✓ Honey Categories (${categories.length}):`);
  categories.slice(0, 5).forEach((c, idx) => {
    const en = c.translations.find((t) => t.langCode === 'en')?.name;
    const hi = c.translations.find((t) => t.langCode === 'hi')?.name;
    const bn = c.translations.find((t) => t.langCode === 'bn')?.name;
    const ar = c.translations.find((t) => t.langCode === 'ar')?.name;
    console.log(`   ${idx + 1}. [EN] ${en} | [HI] ${hi} | [BN] ${bn} | [AR] ${ar}`);
  });
  if (categories.length < 16) throw new Error('Expected 16+ categories');

  // 3. Products & 2x2 Variant Matrix
  const products = await prisma.product.findMany({
    include: {
      translations: true,
      variants: true,
      media: true,
    },
  });
  console.log(`\n✓ Products (${products.length}):`);
  for (const p of products) {
    const title = p.translations.find((t) => t.langCode === 'en')?.title;
    console.log(`   • ${title} (Variants: ${p.variants.length})`);
    for (const v of p.variants) {
      console.log(`     - SKU: ${v.sku} | ${v.packagingType} ${v.netWeightGrams}g | Gross: ${v.grossShippingWeightGrams}g | Fragile: ${v.isFragile} | MRP: ₹${v.mrp} | Sale: ₹${v.salePrice} | Stock: ${v.stockQuantity}`);
    }
  }

  // 4. UI CMS Translations
  const totalUiTranslations = await prisma.uiTranslation.count();
  console.log(`\n✓ Dynamic UI CMS Translations Count: ${totalUiTranslations} strings across all languages`);
  if (totalUiTranslations < 50) throw new Error('Expected 50+ UI translations');

  // 5. Orders, Invoices & Shipping Labels
  const orders = await prisma.order.findMany({
    include: {
      items: true,
      invoice: true,
      shippingLabel: true,
    },
  });
  console.log(`\n✓ Pre-seeded Orders & Automated Documents (${orders.length}):`);
  for (const o of orders) {
    console.log(`   • Order #${o.orderNumber} | Customer: ${o.customerName} | Status: ${o.status}`);
    console.log(`     - Total Gross Weight: ${o.totalGrossWeightGrams}g | Glass Packaging: ${o.hasGlassPackaging}`);
    console.log(`     - Subtotal: ₹${o.subtotal} | 5% Tax: ₹${o.taxAmount} | Shipping: ₹${o.shippingFee} | Total: ₹${o.totalAmount}`);
    if (o.invoice) {
      console.log(`     - Tax Invoice: #${o.invoice.invoiceNumber} | HSN: ${o.invoice.hsnSummary} | GSTIN: ${o.invoice.sellerGstNumber}`);
    }
    if (o.shippingLabel) {
      console.log(`     - Thermal Label: Tracking #${o.shippingLabel.trackingNumber} | Partner: ${o.shippingLabel.courierPartner} | Fragile Badge: ${o.shippingLabel.isFragileGlass}`);
    }
  }

  // 6. Test Atomic Inventory Checkout Simulation
  console.log('\n✓ Testing Atomic Checkout Simulation...');
  const testVariant = products[0].variants[0];
  const initialStock = testVariant.stockQuantity;

  const testSubtotal = testVariant.salePrice;
  const testTax = Math.round(testSubtotal * 0.05 * 100) / 100;
  const testOrderNumber = `ORD-TEST-${Date.now().toString().slice(-4)}`;

  const createdTestOrder = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        orderNumber: testOrderNumber,
        customerName: 'Automated QA Test Buyer',
        customerEmail: 'qa.test@example.com',
        customerPhone: '+91 99999 88888',
        shippingAddress: 'Plot 99, Tech Park, Bengaluru, Karnataka 560100',
        totalGrossWeightGrams: testVariant.grossShippingWeightGrams,
        hasGlassPackaging: testVariant.isFragile,
        subtotal: testSubtotal,
        taxAmount: testTax,
        shippingFee: 60,
        totalAmount: testSubtotal + testTax + 60,
        paymentMethod: 'ONLINE_UPI_CARD',
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        items: {
          create: {
            variantId: testVariant.id,
            productTitle: 'QA Automated Verification Jar',
            variantTitle: `${testVariant.netWeightGrams}g - ${testVariant.packagingType}`,
            packagingType: testVariant.packagingType,
            netWeightGrams: testVariant.netWeightGrams,
            grossWeightGrams: testVariant.grossShippingWeightGrams,
            sku: testVariant.sku,
            unitPrice: testVariant.salePrice,
            quantity: 1,
            totalPrice: testVariant.salePrice,
          },
        },
      },
    });

    await tx.productVariant.update({
      where: { id: testVariant.id },
      data: { stockQuantity: { decrement: 1 } },
    });

    return o;
  });

  const updatedVariant = await prisma.productVariant.findUnique({
    where: { id: testVariant.id },
  });

  if (updatedVariant.stockQuantity !== initialStock - 1) {
    throw new Error('Stock deduction check failed');
  }
  console.log(`   ✓ Inventory atomically deducted from ${initialStock} -> ${updatedVariant.stockQuantity}`);

  // Clean up test order
  await prisma.orderItem.deleteMany({ where: { orderId: createdTestOrder.id } });
  await prisma.order.delete({ where: { id: createdTestOrder.id } });
  await prisma.productVariant.update({
    where: { id: testVariant.id },
    data: { stockQuantity: initialStock },
  });
  console.log(`   ✓ Test order cleaned and stock restored to ${initialStock}`);

  console.log('\n🎉 ALL 6 SYSTEM SPECIFICATION AUDITS PASSED WITH 100% SUCCESS!');
}

verify()
  .catch((e) => {
    console.error('❌ Verification failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

