import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const orderNumber = searchParams.get('orderNumber');
    const guestToken = searchParams.get('token') || req.headers.get('x-order-token');
    const limitParam = parseInt(searchParams.get('limit') || '50', 10);
    const take = Math.min(Math.max(1, isNaN(limitParam) ? 50 : limitParam), 100);

    const where: any = {};

    // Require authenticated user or valid (orderNumber + guestAccessToken) pair
    if (!user) {
      if (orderNumber && guestToken) {
        where.orderNumber = orderNumber;
        where.guestAccessToken = guestToken;
      } else {
        return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
      }
    } else if (user.role === 'CUSTOMER') {
      where.userId = user.id;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        invoice: true,
        shippingLabel: true,
      },
    });

    const sanitizedOrders = orders.map(({ guestAccessToken: _omitted, ...rest }) => rest);
    return NextResponse.json(sanitizedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

