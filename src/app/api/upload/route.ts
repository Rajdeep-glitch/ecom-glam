import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireRole } from '@/lib/auth';
import { getSupabaseAdminClient, PRODUCT_MEDIA_BUCKET } from '@/lib/supabase';

async function ensureBucket() {
  const supabase = getSupabaseAdminClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === PRODUCT_MEDIA_BUCKET);
  if (!exists) {
    await supabase.storage.createBucket(PRODUCT_MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: 52428800,
    });
  }
  return supabase;
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireRole(req, ['SUPER_ADMIN', 'OPERATIONS_STAFF']);
    if (errorResponse) return errorResponse;

    const formData = await req.formData();
    const files = formData.getAll('file') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const supabase = await ensureBucket();
    const uploaded = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const safeName = (file.name || 'upload.bin').replace(/[^a-zA-Z0-9._-]/g, '_');
      const objectPath = `uploads/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(PRODUCT_MEDIA_BUCKET)
        .upload(objectPath, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from(PRODUCT_MEDIA_BUCKET)
        .getPublicUrl(objectPath);

      uploaded.push({
        path: objectPath,
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: buffer.length,
        url: publicUrlData.publicUrl,
      });
    }

    if (uploaded.length === 0) {
      return NextResponse.json({ error: 'No valid files found' }, { status: 400 });
    }

    return NextResponse.json(
      uploaded.length === 1 ? uploaded[0] : { files: uploaded },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Supabase upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
