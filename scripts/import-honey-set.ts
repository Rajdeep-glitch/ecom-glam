import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mammoth from 'mammoth';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

// Load .env manually if needed
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const idx = line.indexOf('=');
    if (idx > 0 && !line.trim().startsWith('#')) {
      const k = line.slice(0, idx).trim();
      const v = line.slice(idx + 1).trim().replace(/^"|"$/g, '');
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const BUCKET = 'product-media';
const IMG_SET_DIR = path.resolve(process.cwd(), '..', 'img set');

const MIME_MAP: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

const FOLDER_META: Record<
  string,
  { categorySlug: string; origin: string; price500: number; price1000: number; featured?: boolean; fallbackTitle?: string; fallbackDesc?: string }
> = {
  Ajwain: { categorySlug: 'medicinal-ayurvedic', origin: 'Rajasthan & Madhya Pradesh Wild Ajwain Flora', price500: 449, price1000: 849, featured: true },
  'Bee Pollen': { categorySlug: 'superfood-bee-products', origin: 'Himalayan & Wildflower Apiary Pollen', price500: 599, price1000: 1099, featured: true },
  'Ber Honey': { categorySlug: 'monofloral-raw', origin: 'Arid Foothills Ziziphus (Ber) Blossoms', price500: 549, price1000: 999 },
  Coriander: { categorySlug: 'monofloral-raw', origin: 'Central India Organic Coriander Fields', price500: 399, price1000: 749 },
  Fennel: { categorySlug: 'medicinal-ayurvedic', origin: 'Gujarat & Rajasthan Fennel Blossoms', price500: 429, price1000: 799 },
  Ginger: { categorySlug: 'medicinal-ayurvedic', origin: 'Raw Wildflower Honey Infused with Organic Ginger', price500: 479, price1000: 899 },
  Jamun: { categorySlug: 'medicinal-ayurvedic', origin: 'Wild Jamun (Java Plum) Forest Groves', price500: 499, price1000: 949, featured: true },
  Kashmiri: { categorySlug: 'himalayan-exotic', origin: 'High-Altitude Kashmir Valley White Acacia & Wild Flora', price500: 699, price1000: 1299, featured: true },
  Kesar: {
    categorySlug: 'himalayan-exotic',
    origin: 'Kashmiri Pampore Saffron Infused with Raw Himalayan Honey',
    price500: 749,
    price1000: 1399,
    featured: true,
    fallbackTitle: 'Vidyami 100% Pure Kesar (Saffron) Infused Raw Honey | Unprocessed Natural Immunity & Skin Glow Superfood',
    fallbackDesc:
      'Experience royal wellness with Vidyami 100% Pure Kesar Honey, crafted by infusing authentic Kashmiri saffron strands into raw, unprocessed Himalayan multiflora honey. Rich in natural antioxidants, crocin, and active enzymes, it supports immunity, radiant skin, restful sleep, and daily vitality with zero added sugar or preservatives.',
  },
  Lichi: { categorySlug: 'monofloral-raw', origin: 'Muzaffarpur & Himalayan Foothill Litchi Orchards', price500: 399, price1000: 749 },
  Lotus: { categorySlug: 'himalayan-exotic', origin: 'Sacred Lotus Wetlands & Wild Aquatic Flora', price500: 649, price1000: 1199 },
  Neem: {
    categorySlug: 'medicinal-ayurvedic',
    origin: 'Wild Neem (Azadirachta indica) Forest Blossoms',
    price500: 499,
    price1000: 949,
    fallbackTitle: 'Vidyami 100% Pure Raw Neem Honey | Unprocessed Ayurvedic Immunity & Detox Honey | No Added Sugar',
    fallbackDesc:
      'Harvested from bees foraging on wild Neem blossoms, Vidyami Pure Neem Honey is a dark, rich, and therapeutic Ayurvedic superfood. Naturally antibacterial and packed with antioxidants, it supports blood purification, throat comfort, digestion, and everyday immunity without any added sugar, heat processing, or preservatives.',
  },
  'Pure Honey': { categorySlug: 'monofloral-raw', origin: 'Pristine Wild Forest Multiflora', price500: 349, price1000: 649, featured: true },
  'Pure Mustard': { categorySlug: 'monofloral-raw', origin: 'Northern Plains Winter Mustard Blossoms', price500: 349, price1000: 649 },
  Sunflower: { categorySlug: 'monofloral-raw', origin: 'Sun-Drenched Organic Sunflower Meadows', price500: 379, price1000: 699 },
  Tulsi: { categorySlug: 'medicinal-ayurvedic', origin: 'Sacred Holy Basil (Tulsi) Herb Gardens', price500: 479, price1000: 899, featured: true },
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseDocxText(raw: string, folderName: string) {
  const clean = raw.replace(/\r/g, '').trim();
  const lines = clean
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // Extract Product Title if labeled
  let title = '';
  const titleMatch = clean.match(/Product Title[^:\n]*:\s*\n+([^\n]+)/i);
  if (titleMatch?.[1]) {
    title = titleMatch[1].trim();
  } else {
    title =
      lines.find((l) => l.toLowerCase().includes('vidyami') || l.toLowerCase().includes(folderName.toLowerCase())) ||
      `Vidyami 100% Pure ${folderName} Honey`;
  }
  if (title.length > 160) title = title.slice(0, 157) + '...';

  // Extract Product Description paragraph
  let description = '';
  const descMatch = clean.match(/Product Description[^:\n]*:\s*\n+([\s\S]*?)(?=\n+(?:Bullet Points|Key Features|SEO Keywords|Keywords|Storage|Benefits)\b|$)/i);
  if (descMatch?.[1]) {
    description = descMatch[1].trim();
  } else {
    description = lines.slice(1, 10).join('\n\n');
  }

  // Append bullet points if present
  const bulletsMatch = clean.match(/Bullet Points[^:\n]*:\s*\n+([\s\S]*?)(?=\n+(?:SEO Keywords|Keywords|Backend|Search Terms)\b|$)/i);
  if (bulletsMatch?.[1]) {
    description = `${description}\n\n${bulletsMatch[1].trim()}`;
  }

  const kwMatch = clean.match(/(?:SEO Keywords|Keywords|Search Terms)[^:\n]*:\s*\n+([^\n]+)/i);
  const seoKeywords = kwMatch?.[1]?.trim() || `Vidyami, ${folderName} Honey, Raw Honey, Organic Honey, Pure Natural Honey`;

  const firstSentence = description.split(/(?<=[.!?])\s+/)[0] || description.slice(0, 180);
  const summary = firstSentence.length > 220 ? firstSentence.slice(0, 217) + '...' : firstSentence;

  return { title, summary, description: description || clean, seoKeywords };
}

function sortImages(files: string[]): string[] {
  const score = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('front') && !n.includes('tr')) return 0;
    if (n.includes('front')) return 1;
    if (n.includes('ls')) return 2;
    if (n.includes('rs')) return 3;
    if (n.includes('cr1') || n.includes('cr 1') || n.includes('c1')) return 4;
    if (n.includes('cr2') || n.includes('cr 2') || n.includes('c2')) return 5;
    if (n.includes('cr3') || n.includes('cr 3') || n.includes('c3')) return 6;
    if (n.includes('cr4') || n.includes('cr 4') || n.includes('c4')) return 7;
    return 10;
  };
  return [...files].sort((a, b) => score(a) - score(b) || a.localeCompare(b));
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 52428800,
    });
    if (error) throw error;
  }
}

async function ensureBaseData() {
  const langs = [
    { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', isDefault: true, sortOrder: 1 },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', isDefault: false, sortOrder: 2 },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr', isDefault: false, sortOrder: 3 },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', isDefault: false, sortOrder: 4 },
  ];
  for (const l of langs) {
    await prisma.language.upsert({ where: { code: l.code }, update: l, create: l });
  }

  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('AdminPassword123!', salt);
  await prisma.user.upsert({
    where: { email: 'admin@artisanalhoney.com' },
    update: {},
    create: {
      name: 'Vikramaditya Sharma (Super Admin)',
      email: 'admin@artisanalhoney.com',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      phone: '+91 98765 43210',
    },
  });

  const categories = [
    { slug: 'monofloral-raw', name: 'Monofloral Raw Honey', sortOrder: 1 },
    { slug: 'medicinal-ayurvedic', name: 'Medicinal & Ayurvedic Honey', sortOrder: 2 },
    { slug: 'himalayan-exotic', name: 'Himalayan & Exotic Honey', sortOrder: 3 },
    { slug: 'superfood-bee-products', name: 'Superfood & Bee Products', sortOrder: 4 },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const existingTrans = await prisma.categoryTranslation.findFirst({
      where: { langCode: 'en', slug: cat.slug },
    });
    if (existingTrans) {
      categoryMap[cat.slug] = existingTrans.categoryId;
    } else {
      const created = await prisma.category.create({
        data: {
          sortOrder: cat.sortOrder,
          isActive: true,
          translations: {
            create: {
              langCode: 'en',
              name: cat.name,
              slug: cat.slug,
              description: `${cat.name} harvested by Vidyami`,
            },
          },
        },
      });
      categoryMap[cat.slug] = created.id;
    }
  }
  return categoryMap;
}

async function main() {
  console.log('Clearing existing products...');
  await prisma.orderItem.deleteMany();
  await prisma.productMedia.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productTranslation.deleteMany();
  await prisma.product.deleteMany();

  await ensureBucket();
  const categoryMap = await ensureBaseData();

  const folders = fs
    .readdirSync(IMG_SET_DIR)
    .filter((f) => fs.statSync(path.join(IMG_SET_DIR, f)).isDirectory())
    .sort();

  console.log(`Found ${folders.length} honey folders in img set.`);

  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i];
    const folderPath = path.join(IMG_SET_DIR, folder);
    const meta = FOLDER_META[folder] || {
      categorySlug: 'monofloral-raw',
      origin: `${folder} Floral Reserve`,
      price500: 499,
      price1000: 899,
    };

    // Parse .docx SEO content
    const docxFiles = fs
      .readdirSync(folderPath)
      .filter((f) => f.toLowerCase().endsWith('.docx') && !f.startsWith('~$') && !f.startsWith('~'));

    let parsed = {
      title: meta.fallbackTitle || `Vidyami 100% Pure ${folder} Honey`,
      summary: `${meta.origin} — 100% raw, unprocessed & NMR tested.`,
      description: meta.fallbackDesc || `Pure unprocessed ${folder} honey harvested from ${meta.origin}.`,
      seoKeywords: `Vidyami, ${folder}, Raw Honey, Pure Honey, Organic Honey`,
    };

    if (docxFiles.length > 0) {
      const { value } = await mammoth.extractRawText({ path: path.join(folderPath, docxFiles[0]) });
      if (value && value.trim().length > 20) {
        parsed = parseDocxText(value, folder);
      }
    }

    // Upload images to Supabase Storage
    const imgFiles = sortImages(
      fs.readdirSync(folderPath).filter((f) => {
        const ext = path.extname(f).toLowerCase();
        return Boolean(MIME_MAP[ext]);
      })
    );

    const baseSlug = slugify(folder);
    const mediaRecords: { url: string; altText: string; sortOrder: number; isPrimary: boolean }[] = [];

    for (let m = 0; m < imgFiles.length; m++) {
      const imgName = imgFiles[m];
      const ext = path.extname(imgName).toLowerCase();
      const buffer = fs.readFileSync(path.join(folderPath, imgName));
      const storagePath = `honey/${baseSlug}/${imgName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
        contentType: MIME_MAP[ext],
        upsert: true,
      });

      if (upErr) {
        console.error(`  Failed uploading ${imgName}:`, upErr.message);
        continue;
      }

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
      mediaRecords.push({
        url: pub.publicUrl,
        altText: `${folder} - ${imgName}`,
        sortOrder: m,
        isPrimary: m === 0,
      });
    }

    const skuPrefix = `VID-${baseSlug.toUpperCase().replace(/-/g, '').slice(0, 6)}`;
    const glass500 = meta.price500;
    const glass1000 = meta.price1000;
    const pet500 = Math.max(249, glass500 - 40);
    const pet1000 = Math.max(499, glass1000 - 70);

    const created = await prisma.product.create({
      data: {
        categoryId: categoryMap[meta.categorySlug],
        isFeatured: Boolean(meta.featured),
        isActive: true,
        hsnCode: '04090000',
        taxRate: 5.0,
        basePrice: pet500,
        translations: {
          create: {
            langCode: 'en',
            title: parsed.title,
            slug: `${baseSlug}-en`,
            summary: parsed.summary,
            description: parsed.description,
            floralOrigin: meta.origin,
            purityNotes: '100% Raw, Unprocessed, NMR Lab Certified, Zero Added Sugar',
            storageTips: 'Store in a cool, dry place away from direct sunlight. Do not refrigerate.',
            seoKeywords: parsed.seoKeywords,
          },
        },
        variants: {
          create: [
            {
              packagingType: 'GLASS_JAR',
              netWeightGrams: 500,
              grossShippingWeightGrams: 820,
              isFragile: true,
              sku: `${skuPrefix}-500G-GLS`,
              mrp: glass500 + 100,
              salePrice: glass500,
              stockQuantity: 60,
              variantImageUrl: mediaRecords[0]?.url || null,
            },
            {
              packagingType: 'GLASS_JAR',
              netWeightGrams: 1000,
              grossShippingWeightGrams: 1480,
              isFragile: true,
              sku: `${skuPrefix}-1KGG-GLS`,
              mrp: glass1000 + 200,
              salePrice: glass1000,
              stockQuantity: 45,
              variantImageUrl: mediaRecords[0]?.url || null,
            },
            {
              packagingType: 'PET_JAR',
              netWeightGrams: 500,
              grossShippingWeightGrams: 555,
              isFragile: false,
              sku: `${skuPrefix}-500P-PET`,
              mrp: pet500 + 100,
              salePrice: pet500,
              stockQuantity: 80,
              variantImageUrl: mediaRecords[0]?.url || null,
            },
            {
              packagingType: 'PET_JAR',
              netWeightGrams: 1000,
              grossShippingWeightGrams: 1085,
              isFragile: false,
              sku: `${skuPrefix}-1KGP-PET`,
              mrp: pet1000 + 200,
              salePrice: pet1000,
              stockQuantity: 55,
              variantImageUrl: mediaRecords[0]?.url || null,
            },
          ],
        },
        media: {
          create: mediaRecords,
        },
      },
    });

    console.log(`[${i + 1}/${folders.length}] Imported ${folder} (${created.id}) with ${mediaRecords.length} images.`);
  }

  console.log('Done importing all 16 honey varieties to Supabase!');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
