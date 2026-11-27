import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireRole(req, ['SUPER_ADMIN', 'OPERATIONS_STAFF']);
    if (errorResponse) return errorResponse;

    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const nonCancelledOrders = orders.filter((o) => o.status !== 'CANCELLED');
    const totalOrders = orders.length;
    const grossRevenue = nonCancelledOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const netRevenue = nonCancelledOrders.reduce((sum, o) => sum + o.subtotal, 0);
    const averageOrderValue = nonCancelledOrders.length > 0 ? grossRevenue / nonCancelledOrders.length : 0;
    const totalGrossWeightShippedKg = Math.round((nonCancelledOrders.reduce((sum, o) => sum + o.totalGrossWeightGrams, 0) / 1000) * 10) / 10;

    // Glass vs PET Jar analysis
    let glassJarsSold = 0;
    let petJarsSold = 0;
    let weight500gCount = 0;
    let weight1kgCount = 0;
    const categoryVolumeMap: Record<string, { title: string; count: number; revenue: number }> = {};

    for (const order of nonCancelledOrders) {
      for (const item of order.items) {
        if (item.packagingType === 'GLASS_JAR') {
          glassJarsSold += item.quantity;
        } else {
          petJarsSold += item.quantity;
        }

        if (item.netWeightGrams === 500) {
          weight500gCount += item.quantity;
        } else {
          weight1kgCount += item.quantity;
        }

        const catKey = item.productTitle;
        if (!categoryVolumeMap[catKey]) {
          categoryVolumeMap[catKey] = { title: catKey, count: 0, revenue: 0 };
        }
        categoryVolumeMap[catKey].count += item.quantity;
        categoryVolumeMap[catKey].revenue += item.totalPrice;
      }
    }

    const topCategories = Object.values(categoryVolumeMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Low stock items (< 15 units)
    const lowStockVariants = await prisma.productVariant.findMany({
      where: {
        stockQuantity: { lte: 25 },
        isActive: true,
      },
      include: {
        product: {
          include: {
            translations: {
              where: { langCode: 'en' },
            },
          },
        },
      },
      orderBy: { stockQuantity: 'asc' },
    });

    const lowStockAlerts = lowStockVariants.map((v) => ({
      variantId: v.id,
      sku: v.sku,
      productTitle: v.product.translations[0]?.title || 'Artisanal Honey',
      packagingType: v.packagingType,
      netWeightGrams: v.netWeightGrams,
      stockQuantity: v.stockQuantity,
      isCritical: v.stockQuantity <= 5,
    }));

    // Status counts
    const statusCounts: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      PACKED: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    for (const o of orders) {
      if (statusCounts[o.status] !== undefined) {
        statusCounts[o.status]++;
      }
    }

    return NextResponse.json({
      summary: {
        totalOrders,
        grossRevenue: Math.round(grossRevenue * 100) / 100,
        netRevenue: Math.round(netRevenue * 100) / 100,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        totalGrossWeightShippedKg,
      },
      packagingSplit: {
        glassJarsSold,
        petJarsSold,
        glassPercent: glassJarsSold + petJarsSold > 0 ? Math.round((glassJarsSold / (glassJarsSold + petJarsSold)) * 100) : 0,
        petPercent: glassJarsSold + petJarsSold > 0 ? Math.round((petJarsSold / (glassJarsSold + petJarsSold)) * 100) : 0,
      },
      weightSplit: {
        weight500gCount,
        weight1kgCount,
      },
      topCategories,
      lowStockAlerts,
      statusCounts,
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch analytics' }, { status: 500 });
  }
}

