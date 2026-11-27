import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const COOKIE_NAME = 'honey_cart_sid';

async function getOrCreateSession(req: NextRequest) {
  let sid = req.cookies.get(COOKIE_NAME)?.value;
  let isNew = false;

  if (!sid) {
    sid = crypto.randomUUID();
    isNew = true;
  }

  let session = await prisma.cartSession.findUnique({ where: { id: sid } });
  if (!session) {
    session = await prisma.cartSession.create({
      data: {
        id: sid,
        lang: 'en',
        deliveryLocation: '',
        itemsJson: '[]',
      },
    });
    isNew = true;
  }

  return { session, sid, isNew };
}

export async function GET(req: NextRequest) {
  try {
    const { session, sid, isNew } = await getOrCreateSession(req);
    let items = [];
    try {
      items = JSON.parse(session.itemsJson || '[]');
    } catch {
      items = [];
    }

    const res = NextResponse.json({
      lang: session.lang,
      deliveryLocation: session.deliveryLocation,
      items,
    });

    if (isNew) {
      res.cookies.set(COOKIE_NAME, sid, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });
    }
    return res;
  } catch (error) {
    console.error('Error loading cart session from Neon:', error);
    return NextResponse.json({ lang: 'en', deliveryLocation: '', items: [] });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { sid, isNew } = await getOrCreateSession(req);
    const body = await req.json();

    const data: { lang?: string; deliveryLocation?: string; itemsJson?: string } = {};
    if (typeof body.lang === 'string') data.lang = body.lang;
    if (typeof body.deliveryLocation === 'string') data.deliveryLocation = body.deliveryLocation;
    if (Array.isArray(body.items)) data.itemsJson = JSON.stringify(body.items);

    const updated = await prisma.cartSession.update({
      where: { id: sid },
      data,
    });

    let items = [];
    try {
      items = JSON.parse(updated.itemsJson || '[]');
    } catch {
      items = [];
    }

    const res = NextResponse.json({
      lang: updated.lang,
      deliveryLocation: updated.deliveryLocation,
      items,
    });

    if (isNew) {
      res.cookies.set(COOKIE_NAME, sid, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });
    }
    return res;
  } catch (error) {
    console.error('Error saving cart session to Neon:', error);
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
  }
}
