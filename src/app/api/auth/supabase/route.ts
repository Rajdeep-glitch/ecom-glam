import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient, getSupabaseBrowserClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const supabase = getSupabaseBrowserClient();

    if (action === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name || email.split('@')[0] },
        },
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ user: data.user, session: data.session });
    }

    if (action === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      const res = NextResponse.json({ user: data.user, session: data.session });
      if (data.session?.access_token) {
        res.cookies.set('sb_access_token', data.session.access_token, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });
      }
      return res;
    }

    return NextResponse.json({ error: 'Invalid action (use signup or signin)' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Supabase auth error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token =
      req.cookies.get('sb_access_token')?.value ||
      req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const admin = getSupabaseAdminClient();
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: data.user });
  } catch {
    return NextResponse.json({ user: null });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete('sb_access_token');
  return res;
}
