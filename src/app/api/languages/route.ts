import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(languages);
  } catch (error) {
    console.error('Failed to fetch languages:', error);
    return NextResponse.json({ error: 'Failed to load languages' }, { status: 500 });
  }
}

