import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { cacheManager } from '@/lib/cache';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get('lang') || 'en';

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: {
          include: { translations: true },
        },
        translations: true,
        variants: {
          orderBy: [{ packagingType: 'asc' }, { netWeightGrams: 'asc' }],
        },
        media: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const match = product.translations.find((t) => t.langCode === lang);
    const fallback = product.translations.find((t) => t.langCode === 'en') || product.translations[0];
    const activeTranslation = match || fallback;

    const catMatch = product.category?.translations?.find((t) => t.langCode === lang);
    const catFallback = product.category?.translations?.find((t) => t.langCode === 'en') || product.category?.translations?.[0];

    return NextResponse.json({
      ...product,
      categoryName: catMatch?.name || catFallback?.name || 'Honey Variety',
      primaryImage:
        product.media.find((m) => m.isPrimary)?.url ||
        product.media[0]?.url ||
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
      title: activeTranslation?.title || 'Artisanal Honey',
      slug: activeTranslation?.slug || product.id,
      summary: activeTranslation?.summary || '',
      description: activeTranslation?.description || '',
      floralOrigin: activeTranslation?.floralOrigin || '',
      purityNotes: activeTranslation?.purityNotes || '',
      storageTips: activeTranslation?.storageTips || '',
      seoKeywords: activeTranslation?.seoKeywords || '',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { errorResponse } = requireRole(req, ['SUPER_ADMIN', 'OPERATIONS_STAFF']);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { categoryId, isFeatured, isActive, hsnCode, taxRate, basePrice, translations, variants, media } = body;

    await prisma.product.update({
      where: { id: params.id },
      data: {
        categoryId: categoryId !== undefined ? categoryId : undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        hsnCode: hsnCode !== undefined ? hsnCode : undefined,
        taxRate: taxRate !== undefined ? parseFloat(taxRate) : undefined,
        basePrice: basePrice !== undefined ? parseFloat(basePrice) : undefined,
      },
    });

    // Update translations
    if (translations && typeof translations === 'object') {
      for (const [langCode, t] of Object.entries(translations as Record<string, any>)) {
        if (t.title) {
          const slug = (t.slug || t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')) + `-${langCode}`;
          await prisma.productTranslation.upsert({
            where: {
              productId_langCode: {
                productId: params.id,
                langCode,
              },
            },
            update: {
              title: t.title,
              slug,
              summary: t.summary || '',
              description: t.description || '',
              floralOrigin: t.floralOrigin || '',
              purityNotes: t.purityNotes || '',
              storageTips: t.storageTips || '',
              seoKeywords: t.seoKeywords || '',
            },
            create: {
              productId: params.id,
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
    }

    // Update variants
    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        if (v.id) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: {
              mrp: parseFloat(v.mrp),
              salePrice: parseFloat(v.salePrice),
              stockQuantity: parseInt(v.stockQuantity, 10),
              grossShippingWeightGrams: v.grossShippingWeightGrams ? parseInt(v.grossShippingWeightGrams, 10) : undefined,
              variantImageUrl: v.variantImageUrl,
              isActive: v.isActive !== undefined ? Boolean(v.isActive) : undefined,
            },
          });
        }
      }
    }

    // Invalidate cached product catalog
    cacheManager.invalidateTag('products');

    const updated = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        translations: true,
        variants: true,
        media: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { errorResponse } = requireRole(req, ['SUPER_ADMIN']);
    if (errorResponse) return errorResponse;

    await prisma.product.delete({
      where: { id: params.id },
    });

    // Invalidate cached product catalog
    cacheManager.invalidateTag('products');

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}

