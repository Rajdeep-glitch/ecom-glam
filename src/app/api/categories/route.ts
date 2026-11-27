import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { checkRateLimit, RATE_LIMIT_TIERS } from '@/lib/rateLimit';
import { cacheManager, cachedJsonResponse } from '@/lib/cache';
import { recordRequestStart } from '@/lib/metrics';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const endRequestMetric = recordRequestStart();
  try {
    const rateCheck = checkRateLimit(req, RATE_LIMIT_TIERS.BROWSE);
    if (!rateCheck.allowed && rateCheck.response) {
      endRequestMetric(429);
      return rateCheck.response;
    }

    const { searchParams } = new URL(req.url);
    const lang = searchParams.get('lang') || 'en';
    const includeAll = searchParams.get('all') === 'true';
    const ifNoneMatch = req.headers.get('if-none-match');

    const cacheKey = `categories:${lang}:${includeAll}`;
    const cached = cacheManager.get<any[]>(cacheKey);

    if (cached) {
      endRequestMetric(cached.isStale ? 200 : 304);
      return cachedJsonResponse(cached.data, cached.etag, ifNoneMatch, {
        maxAge: 180, // 3 minutes CDN cache
        staleWhileRevalidate: 600,
        customHeaders: rateCheck.headers,
      });
    }

    const categories = await prisma.category.findMany({
      where: includeAll ? {} : { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: true,
        _count: {
          select: { products: true },
        },
      },
    });

    const localized = categories.map((cat) => {
      const match = cat.translations.find((t) => t.langCode === lang);
      const fallback = cat.translations.find((t) => t.langCode === 'en') || cat.translations[0];
      const activeTranslation = match || fallback;

      return {
        id: cat.id,
        parentId: cat.parentId,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
        imageUrl: cat.imageUrl,
        name: activeTranslation?.name || 'Untitled Category',
        slug: activeTranslation?.slug || cat.id,
        description: activeTranslation?.description || '',
        metaTitle: activeTranslation?.metaTitle || '',
        metaDescription: activeTranslation?.metaDescription || '',
        productCount: cat._count.products,
        translations: cat.translations,
      };
    });

    const etag = cacheManager.set(cacheKey, localized, 300, ['categories']);
    endRequestMetric(200);
    return cachedJsonResponse(localized, etag, ifNoneMatch, {
      maxAge: 180,
      staleWhileRevalidate: 600,
      customHeaders: rateCheck.headers,
    });
  } catch (error) {
    endRequestMetric(500);
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const endRequestMetric = recordRequestStart();
  try {
    const { errorResponse } = requireRole(req, ['SUPER_ADMIN']);
    if (errorResponse) {
      endRequestMetric(403);
      return errorResponse;
    }

    const body = await req.json();
    const { parentId, sortOrder, isActive, imageUrl, translations } = body;

    if (!translations || !translations.en || !translations.en.name) {
      endRequestMetric(400);
      return NextResponse.json({ error: 'English translation with name is required' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        parentId: parentId || null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== false,
        imageUrl: imageUrl || null,
      },
    });

    for (const [langCode, t] of Object.entries(translations as Record<string, any>)) {
      if (t.name) {
        const slug = (t.slug || t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) + `-${langCode}`;
        await prisma.categoryTranslation.create({
          data: {
            categoryId: category.id,
            langCode,
            name: t.name,
            slug,
            description: t.description || '',
            metaTitle: t.metaTitle || t.name,
            metaDescription: t.metaDescription || t.description || '',
          },
        });
      }
    }

    // Invalidate cached categories on mutation
    cacheManager.invalidateTag('categories');

    const created = await prisma.category.findUnique({
      where: { id: category.id },
      include: { translations: true },
    });

    endRequestMetric(201);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    endRequestMetric(500);
    console.error('Error creating category:', error);
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
  }
}


