import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function tokensMatch(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const guestToken = searchParams.get('token') || req.headers.get('x-order-token');

    if (!user && !guestToken) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication or order access token required' },
        { status: 401 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: params.id },
          { orderNumber: params.id },
        ],
      },
      include: {
        items: true,
        invoice: true,
        shippingLabel: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isStaffOrAdmin = user && (user.role === 'SUPER_ADMIN' || user.role === 'OPERATIONS_STAFF');
    const isOwner = user && order.userId && order.userId === user.id;
    const hasValidGuestToken = tokensMatch(guestToken, order.guestAccessToken);

    if (!isStaffOrAdmin && !isOwner && !hasValidGuestToken) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view this order' },
        { status: 403 }
      );
    }

    const { guestAccessToken: _omitted, ...safeOrder } = order;
    return NextResponse.json(safeOrder);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}

