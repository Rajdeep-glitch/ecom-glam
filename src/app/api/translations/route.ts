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
    const all = searchParams.get('all') === 'true';
    const ifNoneMatch = req.headers.get('if-none-match');

    const cacheKey = `translations:${lang}:${all}`;
    const cached = cacheManager.get<any>(cacheKey);

    if (cached) {
      endRequestMetric(cached.isStale ? 200 : 304);
      return cachedJsonResponse(cached.data, cached.etag, ifNoneMatch, {
        maxAge: 300, // 5 minutes CDN cache
        staleWhileRevalidate: 1200,
        customHeaders: rateCheck.headers,
      });
    }

    // If 'all' is requested (for Admin UI CMS editor), return dictionary grouped by key
    if (all) {
      const allTranslations = await prisma.uiTranslation.findMany({
        orderBy: [{ group: 'asc' }, { key: 'asc' }],
      });

      const grouped: Record<string, { key: string; group: string; translations: Record<string, string> }> = {};
      for (const t of allTranslations) {
        if (!grouped[t.key]) {
          grouped[t.key] = {
            key: t.key,
            group: t.group,
            translations: {},
          };
        }
        grouped[t.key].translations[t.langCode] = t.value;
      }

      const result = Object.values(grouped);
      const etag = cacheManager.set(cacheKey, result, 600, ['translations']);
      endRequestMetric(200);
      return cachedJsonResponse(result, etag, ifNoneMatch, {
        maxAge: 300,
        staleWhileRevalidate: 1200,
        customHeaders: rateCheck.headers,
      });
    }

    // Default: Return key-value dictionary for requested language, with fallback to English
    const fallbackTranslations = await prisma.uiTranslation.findMany({
      where: { langCode: 'en' },
    });

    const requestedTranslations = lang === 'en' ? fallbackTranslations : await prisma.uiTranslation.findMany({
      where: { langCode: lang },
    });

    const dictionary: Record<string, string> = {};
    for (const item of fallbackTranslations) {
      dictionary[item.key] = item.value;
    }
    for (const item of requestedTranslations) {
      if (item.value) {
        dictionary[item.key] = item.value;
      }
    }

    const etag = cacheManager.set(cacheKey, dictionary, 600, ['translations']);
    endRequestMetric(200);
    return cachedJsonResponse(dictionary, etag, ifNoneMatch, {
      maxAge: 300,
      staleWhileRevalidate: 1200,
      customHeaders: rateCheck.headers,
    });
  } catch (error) {
    endRequestMetric(500);
    console.error('Error fetching UI translations:', error);
    return NextResponse.json({ error: 'Failed to fetch translations' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const endRequestMetric = recordRequestStart();
  try {
    const { user, errorResponse } = requireRole(req, ['SUPER_ADMIN']);
    if (errorResponse) {
      endRequestMetric(403);
      return errorResponse;
    }

    const { key, group, translations } = await req.json();

    if (!key || !translations || typeof translations !== 'object') {
      endRequestMetric(400);
      return NextResponse.json({ error: 'Invalid translation payload' }, { status: 400 });
    }

    for (const [langCode, value] of Object.entries(translations)) {
      if (typeof value === 'string') {
        await prisma.uiTranslation.upsert({
          where: {
            key_langCode: {
              key,
              langCode,
            },
          },
          update: { value, group: group || 'common' },
          create: {
            key,
            langCode,
            value,
            group: group || 'common',
          },
        });
      }
    }

    // Invalidate cached translations
    cacheManager.invalidateTag('translations');

    endRequestMetric(200);
    return NextResponse.json({ success: true, message: 'Translation updated successfully' });
  } catch (error: any) {
    endRequestMetric(500);
    console.error('Error updating translation:', error);
    return NextResponse.json({ error: error.message || 'Failed to update translation' }, { status: 500 });
  }
}

