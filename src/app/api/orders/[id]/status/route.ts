import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { errorResponse } = requireRole(req, ['SUPER_ADMIN', 'OPERATIONS_STAFF']);
    if (errorResponse) return errorResponse;

    const { status } = await req.json();

    const validStatuses = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const previousStatus = order.status;

    // If order is transitioning to CANCELLED or RETURNED and wasn't already cancelled, restore inventory
    if ((status === 'CANCELLED' || status === 'RETURNED') && previousStatus !== 'CANCELLED' && previousStatus !== 'RETURNED') {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stockQuantity: {
                  increment: item.quantity,
                },
              },
            });
          }
        }

        await tx.order.update({
          where: { id: params.id },
          data: { status },
        });
      });
    } else {
      await prisma.order.update({
        where: { id: params.id },
        data: { status },
      });
    }

    const updated = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        invoice: true,
        shippingLabel: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order status' }, { status: 500 });
  }
}

