import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { Role } from '@/lib/types';
import { checkRateLimit, RATE_LIMIT_TIERS } from '@/lib/rateLimit';
import { recordRequestStart } from '@/lib/metrics';

export async function POST(req: NextRequest) {
  const endRequestMetric = recordRequestStart();
  try {
    // Enforce anti-brute-force rate limiting on login
    const rateCheck = checkRateLimit(req, RATE_LIMIT_TIERS.AUTH);
    if (!rateCheck.allowed && rateCheck.response) {
      endRequestMetric(429);
      return rateCheck.response;
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      endRequestMetric(400);
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      endRequestMetric(401);
      return NextResponse.json({ error: 'Invalid email or credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      endRequestMetric(401);
      return NextResponse.json({ error: 'Invalid email or credentials' }, { status: 401 });
    }

    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
    };

    const token = signToken(sessionPayload);

    const response = NextResponse.json(
      {
        success: true,
        user: sessionPayload,
        token,
      },
      {
        headers: rateCheck.headers,
      }
    );

    response.cookies.set('honey_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    endRequestMetric(200);
    return response;
  } catch (error: any) {
    endRequestMetric(500);
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}


