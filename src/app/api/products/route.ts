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
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    // Throttling: Search queries have specific rate limit tier to protect against scraper spikes
    const rateCheck = checkRateLimit(req, search ? RATE_LIMIT_TIERS.SEARCH : RATE_LIMIT_TIERS.BROWSE);
    if (!rateCheck.allowed && rateCheck.response) {
      endRequestMetric(429);
      return rateCheck.response;
    }

    const ifNoneMatch = req.headers.get('if-none-match');
    const cacheKey = `products:${searchParams.toString()}`;
    const cached = cacheManager.get<any[]>(cacheKey);

    if (cached) {
      endRequestMetric(cached.isStale ? 200 : 304);
      return cachedJsonResponse(cached.data, cached.etag, ifNoneMatch, {
        maxAge: 0,
        staleWhileRevalidate: 0,
        customHeaders: rateCheck.headers,
      });
    }

    const lang = searchParams.get('lang') || 'en';
    const categoryId = searchParams.get('category');
    const packaging = searchParams.get('packaging'); // GLASS_JAR, PET_JAR
    const weight = searchParams.get('weight'); // 500, 1000
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock') === 'true';
    const featured = searchParams.get('featured');

    const whereClause: any = {
      isActive: true,
    };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (featured === 'true') {
      whereClause.isFeatured = true;
    }

    // Search filter across titles, summaries, and descriptions
    if (search) {
      whereClause.translations = {
        some: {
          OR: [
            { title: { contains: search } },
            { summary: { contains: search } },
            { description: { contains: search } },
            { floralOrigin: { contains: search } },
          ],
        },
      };
    }

    // Variant-level conditions (packaging, weight, price, inStock)
    const variantWhere: any = {
      isActive: true,
    };

    if (packaging) {
      variantWhere.packagingType = packaging;
    }

    if (weight) {
      variantWhere.netWeightGrams = parseInt(weight, 10);
    }

    if (minPrice || maxPrice) {
      variantWhere.salePrice = {};
      if (minPrice) variantWhere.salePrice.gte = parseFloat(minPrice);
      if (maxPrice) variantWhere.salePrice.lte = parseFloat(maxPrice);
    }

    if (inStock) {
      variantWhere.stockQuantity = { gt: 0 };
    }

    if (Object.keys(variantWhere).length > 1) {
      whereClause.variants = {
        some: variantWhere,
      };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          include: {
            translations: true,
          },
        },
        translations: true,
        variants: {
          orderBy: [{ packagingType: 'asc' }, { netWeightGrams: 'asc' }],
        },
        media: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const localizedProducts = products.map((prod) => {
      const match = prod.translations.find((t) => t.langCode === lang);
      const fallback = prod.translations.find((t) => t.langCode === 'en') || prod.translations[0];
      const activeTranslation = match || fallback;

      const catMatch = prod.category.translations.find((t) => t.langCode === lang);
      const catFallback = prod.category.translations.find((t) => t.langCode === 'en') || prod.category.translations[0];

      // Find lowest and highest sale prices across available variants
      const prices = prod.variants.map((v) => v.salePrice);
      const minSalePrice = prices.length ? Math.min(...prices) : prod.basePrice;
      const maxSalePrice = prices.length ? Math.max(...prices) : prod.basePrice;
      const totalStock = prod.variants.reduce((acc, v) => acc + v.stockQuantity, 0);

      return {
        id: prod.id,
        categoryId: prod.categoryId,
        categoryName: catMatch?.name || catFallback?.name || 'Category',
        isFeatured: prod.isFeatured,
        isActive: prod.isActive,
        hsnCode: prod.hsnCode,
        taxRate: prod.taxRate,
        basePrice: prod.basePrice,
        minSalePrice,
        maxSalePrice,
        totalStock,
        title: activeTranslation?.title || 'Artisanal Honey',
        slug: activeTranslation?.slug || prod.id,
        summary: activeTranslation?.summary || '',
        description: activeTranslation?.description || '',
        floralOrigin: activeTranslation?.floralOrigin || '',
        purityNotes: activeTranslation?.purityNotes || '',
        storageTips: activeTranslation?.storageTips || '',
        media: prod.media,
        primaryImage: prod.media.find((m) => m.isPrimary)?.url || prod.media[0]?.url || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
        variants: prod.variants,
        translations: prod.translations,
      };
    });

    const etag = cacheManager.set(cacheKey, localizedProducts, 60, ['products']);
    endRequestMetric(200);
    return cachedJsonResponse(localizedProducts, etag, ifNoneMatch, {
      maxAge: 60,
      staleWhileRevalidate: 180,
      customHeaders: rateCheck.headers,
    });
  } catch (error) {
    endRequestMetric(500);
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const endRequestMetric = recordRequestStart();
  try {
    const { errorResponse } = requireRole(req, ['SUPER_ADMIN', 'OPERATIONS_STAFF']);
    if (errorResponse) {
      endRequestMetric(403);
      return errorResponse;
    }

    const body = await req.json();
    const { categoryId, isFeatured, isActive, hsnCode, taxRate, basePrice, translations, variants, media } = body;

    if (!categoryId || !translations || !translations.en || !translations.en.title) {
      endRequestMetric(400);
      return NextResponse.json({ error: 'Category and English product title are required' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        categoryId,
        isFeatured: Boolean(isFeatured),
        isActive: isActive !== false,
        hsnCode: hsnCode || '04090000',
        taxRate: taxRate !== undefined ? parseFloat(taxRate) : 5.0,
        basePrice: basePrice !== undefined ? parseFloat(basePrice) : 499.0,
      },
    });

    // Create Translations
    for (const [langCode, t] of Object.entries(translations as Record<string, any>)) {
      if (t.title) {
        const slug = (t.slug || t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')) + `-${langCode}`;
        await prisma.productTranslation.create({
          data: {
            productId: product.id,
            langCode,
            title: t.title,
            slug,
            summary: t.summary || '',
            description: t.description || '',
            floralOrigin: t.floralOrigin || '',
            purityNotes: t.purityNotes || '',
            storageTips: t.storageTips || '',
            seoKeywords: t.seoKeywords || '',
          },
        });
      }
    }

    // Create 2x2 Variant Matrix
    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            packagingType: v.packagingType,
            netWeightGrams: parseInt(v.netWeightGrams, 10),
            grossShippingWeightGrams: parseInt(v.grossShippingWeightGrams, 10),
            isFragile: Boolean(v.isFragile),
            sku: v.sku,
            mrp: parseFloat(v.mrp),
            salePrice: parseFloat(v.salePrice),
            stockQuantity: parseInt(v.stockQuantity, 10) || 0,
            variantImageUrl: v.variantImageUrl || null,
          },
        });
      }
    }

    // Media
    if (media && Array.isArray(media)) {
      for (let i = 0; i < media.length; i++) {
        await prisma.productMedia.create({
          data: {
            productId: product.id,
            url: media[i].url,
            altText: media[i].altText || null,
            sortOrder: i + 1,
            isPrimary: i === 0,
            variantId: media[i].variantId || null,
          },
        });
      }
    }

    // Invalidate product cache
    cacheManager.invalidateTag('products');

    const created = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        translations: true,
        variants: true,
        media: true,
      },
    });

    endRequestMetric(201);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    endRequestMetric(500);
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}

