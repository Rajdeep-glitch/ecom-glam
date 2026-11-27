import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { UserSession } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'artisanal-honey-secret-key-2026-production';

export function signToken(payload: UserSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch (error) {
    return null;
  }
}

export function getUserFromRequest(req: NextRequest): UserSession | null {
  // Check Authorization Bearer header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const session = verifyToken(token);
    if (session) return session;
  }

  // Check Cookie
  const cookie = req.cookies.get('honey_session');
  if (cookie?.value) {
    return verifyToken(cookie.value);
  }

  return null;
}

export function requireRole(req: NextRequest, allowedRoles: string[]): { user: UserSession | null; errorResponse?: NextResponse } {
  const user = getUserFromRequest(req);
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 }),
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 }),
    };
  }

  return { user };
}

