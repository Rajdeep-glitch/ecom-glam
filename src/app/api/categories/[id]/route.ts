import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { cacheManager } from '@/lib/cache';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: { translations: true },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { errorResponse } = requireRole(req, ['SUPER_ADMIN']);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { parentId, sortOrder, isActive, imageUrl, translations } = body;

    await prisma.category.update({
      where: { id: params.id },
      data: {
        parentId: parentId !== undefined ? parentId : undefined,
        sortOrder: sortOrder !== undefined ? sortOrder : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
      },
    });

    if (translations && typeof translations === 'object') {
      for (const [langCode, t] of Object.entries(translations as Record<string, any>)) {
        if (t.name) {
          const slug = (t.slug || t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) + `-${langCode}`;
          await prisma.categoryTranslation.upsert({
            where: {
              categoryId_langCode: {
                categoryId: params.id,
                langCode,
              },
            },
            update: {
              name: t.name,
              slug,
              description: t.description || '',
              metaTitle: t.metaTitle || t.name,
              metaDescription: t.metaDescription || t.description || '',
            },
            create: {
              categoryId: params.id,
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
    }

    // Invalidate cached categories
    cacheManager.invalidateTag('categories');

    const updated = await prisma.category.findUnique({
      where: { id: params.id },
      include: { translations: true },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { errorResponse } = requireRole(req, ['SUPER_ADMIN']);
    if (errorResponse) return errorResponse;

    await prisma.category.delete({
      where: { id: params.id },
    });

    // Invalidate cached categories
    cacheManager.invalidateTag('categories');

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete category' }, { status: 500 });
  }
}

