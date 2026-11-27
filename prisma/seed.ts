import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records in correct relation order
  await prisma.shippingLabel.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.uiTranslation.deleteMany();
  await prisma.productMedia.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productTranslation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.categoryTranslation.deleteMany();
  await prisma.category.deleteMany();
  await prisma.language.deleteMany();

  // 2. Seed Languages
  console.log('Creating Languages (en, hi, bn, ar)...');
  const languagesData = [
    { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', isDefault: true, sortOrder: 1 },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', isDefault: false, sortOrder: 2 },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr', isDefault: false, sortOrder: 3 },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', isDefault: false, sortOrder: 4 },
  ];

  for (const lang of languagesData) {
    await prisma.language.create({ data: lang });
  }

  // 3. Seed Users
  console.log('Creating Users with RBAC...');
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('AdminPassword123!', salt);
  const staffPassword = await bcrypt.hash('StaffPassword123!', salt);
  const customerPassword = await bcrypt.hash('CustomerPass123!', salt);

  const admin = await prisma.user.create({
    data: {
      name: 'Vikramaditya Sharma (Super Admin)',
      email: 'admin@artisanalhoney.com',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      phone: '+91 98765 43210',
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: 'Rohan Deshmukh (Dispatch Lead)',
      email: 'dispatch@artisanalhoney.com',
      password: staffPassword,
      role: 'OPERATIONS_STAFF',
      phone: '+91 98765 12345',
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'Ananya Sen',
      email: 'ananya.sen@example.com',
      password: customerPassword,
      role: 'CUSTOMER',
      phone: '+91 91234 56789',
      addresses: {
        create: {
          fullName: 'Ananya Sen',
          phone: '+91 91234 56789',
          street: 'Apartment 4B, Heritage Enclave, Salt Lake Sector 2',
          city: 'Kolkata',
          state: 'West Bengal',
          postalCode: '700091',
          country: 'India',
          isDefault: true,
        },
      },
    },
  });

  // 4. Seed UI CMS Translations
  console.log('Creating Dynamic UI CMS Translations...');
  const uiTranslationsList = [
    // Navigation & Common
    { key: 'nav.store_name', en: 'Royal Nectar Apiaries', hi: 'रॉयल नेक्टर एपियरीज़', bn: 'রয়্যাল নেক্টার মৌচাক', ar: 'مناحل رويال نكتار الملكية' },
    { key: 'nav.tagline', en: '100% Raw Artisanal Honey • Farm to Spoon', hi: '१००% शुद्ध प्राकृतिक शहद • खेत से सीधे आपकी थाली तक', bn: '১০০% খাঁটি বন্য মধু • প্রকৃতি থেকে সরাসরি টেবিলে', ar: 'عسل نحل نقي ١٠٠٪ خام • من الخلية إلى مائدتك' },
    { key: 'nav.home', en: 'Home', hi: 'होम', bn: 'হোম', ar: 'الرئيسية' },
    { key: 'nav.catalog', en: 'Honey Varieties', hi: 'शहद की किस्में', bn: 'মধুর ধরন', ar: 'أصناف العسل' },
    { key: 'nav.purity', en: 'Lab Purity & Traceability', hi: 'लैब शुद्धता और गुणवत्ता', bn: 'ল্যাব পরীক্ষা ও বিশুদ্ধতা', ar: 'فحص النقاء والمختبر' },
    { key: 'nav.about', en: 'Our Story', hi: 'हमारी कहानी', bn: 'আমাদের কথা', ar: 'قصتنا' },
    { key: 'nav.admin_portal', en: 'Seller Central', hi: 'सेलर सेंट्रल', bn: 'সেলার সেন্ট্রাল', ar: 'بوابة البائع' },
    { key: 'nav.search_placeholder', en: 'Search floral origins, sidr, wild forest...', hi: 'शहद, फूलों के स्रोत या सिद्र खोजें...', bn: 'মধু, ফুলের উৎস বা সিদর অনুসন্ধান করুন...', ar: 'ابحث عن أنواع العسل، السدر، الغابات...' },
    { key: 'nav.cart', en: 'Cart', hi: 'कार्ट', bn: 'কার্ট', ar: 'عربة التسوق' },
    { key: 'nav.account', en: 'Account', hi: 'खाता', bn: 'অ্যাকাউন্ট', ar: 'حسابي' },

    // Hero & Features
    { key: 'hero.badge', en: 'Bespoke Single-Origin Harvest • Winter 2026', hi: 'विशिष्ट एकल-स्रोत कटाई • शीतकालीन २०२६', bn: 'বিশেষ সংগৃহীত নতুন মধু • শীতকালীন ২০২৬', ar: 'حصاد شتوي فاخر وحصري • شتاء ۲۰۲٦' },
    { key: 'hero.title', en: 'Pure Unprocessed Nectar From Untamed Flora', hi: 'प्रकृति के अछूते वनों से शुद्ध, अपरिष्कृत अमृत', bn: 'অরণ্যের বুক থেকে সংগৃহীত অপরিশোধিত খাঁটি অমৃত', ar: 'رحيق نقي طبيعي غير معالج من أزهار الطبيعة العذراء' },
    { key: 'hero.subtitle', en: 'Explore rare floral mono-honeys packaged in eco-friendly tamper-evident Glass and lightweight PET jars.', hi: 'पर्यावरण-अनुकूल सीलबंद ग्लास जार और हल्के पीईटी जार में पैक किए गए दुर्लभ फूलों के शहद का अन्वेषण करें।', bn: 'কাঁচ ও হালকা পিইটি জারে সংরক্ষিত বিরল ফুলের খাঁটি ও প্রাকৃতিক মধুর সম্ভার।', ar: 'استكشف أنواعاً نادرة من العسل الطبيعي في مرطبانات زجاجية آمنة ومرطبانات بلاستيكية خفيفة الوزن.' },
    { key: 'hero.cta_shop', en: 'Browse Varieties', hi: 'किस्में देखें', bn: 'মধুর সম্ভার দেখুন', ar: 'تصفح الأصناف' },
    { key: 'hero.cta_purity', en: 'View NMR Lab Reports', hi: 'एनएमआर लैब रिपोर्ट देखें', bn: 'এনএমআর ল্যাব রিপোর্ট', ar: 'شهادات الفحص المخبري' },

    // Value Props
    { key: 'usp.purity_title', en: 'Zero Adulteration Guarantee', hi: 'शून्य मिलावट की गारंटी', bn: 'শূন্য ভেজাল নিশ্চয়তা', ar: 'ضمان خلو تام من الإضافات' },
    { key: 'usp.purity_desc', en: 'Nuclear Magnetic Resonance (NMR) tested for sugar syrup absence and organic floral enzymes.', hi: 'चीनी सिरप की अनुपस्थिति और जैविक एंजाइमों के लिए एनएमआर प्रमाणित।', bn: 'কোনো কৃত্রিম চিনি বা সিরাম নেই, এনএমআর দ্বারা পরীক্ষিত।', ar: 'مفحوص بالرنين المغناطيسي النووي (NMR) لضمان النقاء الطبيعي.' },
    { key: 'usp.packaging_title', en: 'Glass & PET Variant Matrix', hi: 'ग्लास और पीईटी जार विकल्प', bn: 'কাঁচ ও পিইটি জারের পছন্দ', ar: 'خيارات الزجاج والعبوات البلاستيكية' },
    { key: 'usp.packaging_desc', en: 'Choose protective tamper-proof luxury glass or shatterproof lightweight food-grade PET jars.', hi: 'सुरक्षित विलासिता ग्लास जार या अटूट हल्के खाद्य-ग्रेड पीईटी जार चुनें।', bn: 'পছন্দ করুন প্রিমিয়াম সুরক্ষিত কাঁচের জার অথবা ওজনে হালকা টেকসই পিইটি জার।', ar: 'اختر الزجاج الفاخر المحكم أو العبوات البلاستيكية الغذائية الآمنة الخفيفة.' },
    { key: 'usp.shipping_title', en: 'Precision Weight Logistics', hi: 'सटीक वजन आधारित शिपिंग', bn: 'সঠিক ওজন ও দ্রুত ডেলিভারি', ar: 'شحن دقيق حسب الوزن والأمان' },
    { key: 'usp.shipping_desc', en: 'Weight-aware shipping rates with automated "Fragile Glass" protection badges on courier labels.', hi: 'कूरियर लेबल पर स्वचालित "फ्रैजाइल ग्लास" सुरक्षा बैज के साथ सटीक वजन दरें।', bn: 'কাঁচের পণ্যের জন্য স্বয়ংক্রিয় "সাবধান - কাঁচ" সতর্কতাসহ নিরাপদ কুরিয়ার ব্যবস্থা।', ar: 'حساب دقيق لوزن الشحنة مع ملصقات تحذير للتعامل بحذر مع الزجاج.' },

    // Filter & Catalog
    { key: 'filter.title', en: 'Filter & Refine', hi: 'फ़िल्टर और खोज', bn: 'ফিল্টার করুন', ar: 'تصفية وبحث' },
    { key: 'filter.all_categories', en: 'All Honey Varieties', hi: 'सभी शहद किस्में', bn: 'সকল মধুর প্রকার', ar: 'جميع أصناف العسل' },
    { key: 'filter.packaging', en: 'Packaging Type', hi: 'पैकेजिंग प्रकार', bn: 'প্যাকেজিং প্রকার', ar: 'نوع العبوة' },
    { key: 'filter.glass', en: 'Glass Jar (Tamper-Evident)', hi: 'ग्लास जार (सीलबंद)', bn: 'কাঁচের জার (সুরক্ষিত)', ar: 'مرطبان زجاجي (فاخر)' },
    { key: 'filter.pet', en: 'Food-Grade PET Jar', hi: 'खाद्य-ग्रेड पीईटी जार', bn: 'ফুড-গ্রেড পিইটি জার', ar: 'مرطبان بلاستيكي صحي' },
    { key: 'filter.weight', en: 'Net Weight', hi: 'शुद्ध वजन', bn: 'মোট ওজন', ar: 'الوزن الصافي' },
    { key: 'filter.weight_500g', en: '500g (Pint Jar)', hi: '५०० ग्राम', bn: '৫০০ গ্রাম', ar: '٥٠٠ غرام' },
    { key: 'filter.weight_1kg', en: '1kg (Family Pack)', hi: '१ किग्रा (फैमिली पैक)', bn: '১ কেজি (ফ্যামিলি প্যাক)', ar: '١ كغ (حجم عائلي)' },
    { key: 'filter.price_range', en: 'Price Range', hi: 'मूल्य सीमा', bn: 'মূল্য পরিসীমা', ar: 'نطاق السعر' },
    { key: 'filter.in_stock_only', en: 'In Stock Only', hi: 'केवल स्टॉक में उपलब्ध', bn: 'শুধুমাত্র স্টকে বিদ্যমান', ar: 'المتوفر في المخزن فقط' },
    { key: 'filter.clear_all', en: 'Reset Filters', hi: 'फ़िल्टर रीसेट करें', bn: 'রিসেট করুন', ar: 'إعادة تعيين الفلاتر' },

    // Product Card & PDP
    { key: 'product.view_details', en: 'Explore Jar', hi: 'विवरण देखें', bn: 'বিস্তারিত দেখুন', ar: 'عرض التفاصيل' },
    { key: 'product.add_to_cart', en: 'Add to Cart', hi: 'कार्ट में जोड़ें', bn: 'কার্টে যোগ করুন', ar: 'أضف إلى السلة' },
    { key: 'product.buy_now', en: 'Buy Now', hi: 'अभी खरीदें', bn: 'এখনই কিনুন', ar: 'شراء فوري' },
    { key: 'product.mrp', en: 'MRP', hi: 'अधिकतम खुदरा मूल्य', bn: 'সর্বোচ্চ মূল্য', ar: 'السعر الأصلي' },
    { key: 'product.you_save', en: 'You Save', hi: 'आपकी बचत', bn: 'আপনার সাশ্রয়', ar: 'وفرت' },
    { key: 'product.sku', en: 'SKU Code', hi: 'एसकेयू कोड', bn: 'এসকেইউ কোড', ar: 'رمز المنتج' },
    { key: 'product.floral_origin', en: 'Floral Source', hi: 'पुष्प स्रोत', bn: 'ফুলের উৎস', ar: 'المصدر الزهري' },
    { key: 'product.lab_notes', en: 'Purity & NMR Analysis', hi: 'शुद्धता और एनएमआर जांच', bn: 'বিশুদ্ধতা ও ল্যাব পরীক্ষা', ar: 'تحليل النقاء المخبري' },
    { key: 'product.storage', en: 'Storage Guidelines', hi: 'संग्रहण निर्देश', bn: 'সংরক্ষণ পদ্ধতি', ar: 'طريقة الحفظ' },
    { key: 'product.gross_shipping_weight', en: 'Gross Courier Weight', hi: 'कुल कूरियर वजन', bn: 'মোট কুরিয়ার ওজন', ar: 'وزن الشحن الإجمالي' },
    { key: 'product.fragile_alert', en: 'Fragile Glass: Packed with extra shock-absorbent eco-cushioning', hi: 'नाजुक ग्लास: अतिरिक्त सुरक्षात्मक कुशनिंग के साथ पैक किया गया', bn: 'কাঁচের সামগ্রী: অতিরিক্ত সুরক্ষামূলক মোড়কে পাঠানো হবে', ar: 'تنبيه: عبوة زجاجية هشة مع تغليف واقٍ مضاد للصدمات' },
    { key: 'product.stock_status', en: 'Inventory Status', hi: 'स्टॉक स्थिति', bn: 'স্টক তথ্য', ar: 'حالة المخزون' },
    { key: 'product.in_stock', en: 'Ready to Dispatch', hi: 'डिस्पैच के लिए तैयार', bn: 'স্টকে প্রস্তুত', ar: 'جاهز للشحن الفوري' },
    { key: 'product.low_stock', en: 'Hurry, only a few left in stock!', hi: 'जल्दी करें, केवल कुछ ही शेष!', bn: 'দ্রুত করুন, অল্প কয়েকটি অবশিষ্ট আছে!', ar: 'سارع، لم يتبق سوى كمية محدودة!' },

    // Cart Drawer
    { key: 'cart.title', en: 'Your Honey Consignment', hi: 'आपकी शहद कार्ट', bn: 'আপনার শপিং কার্ট', ar: 'سلة مشترياتك' },
    { key: 'cart.empty', en: 'Your cart is empty. Indulge in raw natural honey today!', hi: 'आपकी कार्ट खाली है। आज ही शुद्ध शहद का आनंद लें!', bn: 'আপনার কার্ট খালি। আজই খাঁটি মধু অর্ডার করুন!', ar: 'سلتك فارغة حالياً. تذوق أفضل أنواع العسل الطبيعي اليوم!' },
    { key: 'cart.subtotal', en: 'Subtotal', hi: 'उप-योग', bn: 'উপ-মোট', ar: 'المجموع الفرعي' },
    { key: 'cart.estimated_tax', en: 'GST (5% Included)', hi: 'जीएसटी (५% शामिल)', bn: 'জিএসটি (৫% অন্তর্ভুক্ত)', ar: 'ضريبة القيمة المضافة (٥٪)' },
    { key: 'cart.total_weight', en: 'Total Gross Consignment Weight', hi: 'कुल शिपिंग वजन', bn: 'মোট পার্সেল ওজন', ar: 'إجمالي وزن الشحنة' },
    { key: 'cart.shipping_est', en: 'Calculated Shipping', hi: 'अनुमानित शिपिंग शुल्क', bn: 'কুরিয়ার চার্জ', ar: 'تكلفة الشحن' },
    { key: 'cart.free_shipping_notice', en: 'Free shipping on orders above ₹999!', hi: '₹९९९ से अधिक के ऑर्डर पर मुफ्त शिपिंग!', bn: '৯৯৯ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি!', ar: 'شحن مجاني للطلبات التي تزيد عن ٩٩٩ روبية!' },
    { key: 'cart.proceed_to_checkout', en: 'Proceed to Secure Checkout', hi: 'सुरक्षित चेकआउट पर जाएं', bn: 'চেকআউটে এগিয়ে যান', ar: 'متابعة الدفع الآمن' },
    { key: 'cart.glass_warning_banner', en: 'Glass Protection Enabled: Your order contains fragile glass jars and will receive reinforced thermal sealing.', hi: 'ग्लास सुरक्षा सक्रिय: आपके ऑर्डर में ग्लास जार शामिल हैं और इसे सुरक्षित थर्मल पैकेजिंग मिलेगी।', bn: 'কাঁচের সুরক্ষা নিশ্চিত: আপনার অর্ডারে কাঁচের জার থাকায় বিশেষ সুরক্ষামূলক প্যাকিং করা হবে।', ar: 'تغليف زجاجي آمن: طلبك يحتوي على مرطبانات زجاجية وسيتم تغليفها بعناية فائقة.' },

    // Checkout & Order
    { key: 'checkout.title', en: 'Complete Your Order', hi: 'अपना ऑर्डर पूरा करें', bn: 'অর্ডার সম্পন্ন করুন', ar: 'إتمام الطلب' },
    { key: 'checkout.shipping_details', en: 'Shipping Destination', hi: 'डिलिवरी पता', bn: 'ডেলিভারি ঠিকানা', ar: 'عنوان التوصيل' },
    { key: 'checkout.name', en: 'Full Name', hi: 'पूरा नाम', bn: 'পুরো নাম', ar: 'الاسم الكامل' },
    { key: 'checkout.email', en: 'Email Address', hi: 'ईमेल पता', bn: 'ইমেল ঠিকানা', ar: 'البريد الإلكتروني' },
    { key: 'checkout.phone', en: 'Phone Number', hi: 'फ़ोन नंबर', bn: 'ফোন নম্বর', ar: 'رقم الهاتف' },
    { key: 'checkout.address', en: 'Street Address & Apartment', hi: 'सड़क का पता और मकान संख्या', bn: 'ঠিকানা ও ফ্ল্যাট নম্বর', ar: 'العنوان بالتفصيل ورقم المبنى' },
    { key: 'checkout.city', en: 'City / District', hi: 'शहर / ज़िला', bn: 'শহর / জেলা', ar: 'المدينة' },
    { key: 'checkout.state', en: 'State / Province', hi: 'राज्य', bn: 'রাজ্য', ar: 'الولاية / المقاطعة' },
    { key: 'checkout.pincode', en: 'Postal PIN Code', hi: 'पिन कोड', bn: 'পোস্টাল পিন কোড', ar: 'الرمز البريدي' },
    { key: 'checkout.payment_method', en: 'Payment Option', hi: 'भुगतान विकल्प', bn: 'পেমেন্ট পদ্ধতি', ar: 'طريقة الدفع' },
    { key: 'checkout.pay_online', en: 'Instant Online Payment (UPI, Credit/Debit Cards, Net Banking)', hi: 'त्वरित ऑनलाइन भुगतान (UPI, कार्ड, नेट बैंकिंग)', bn: 'অনলাইন পেমেন্ট (ইউপিআই, কার্ড, নেট ব্যাংকিং)', ar: 'الدفع الإلكتروني الفوري (بطاقات، مدى، أبل باي)' },
    { key: 'checkout.pay_cod', en: 'Cash on Delivery (COD)', hi: 'कैश ऑन डिलीवरी (COD)', bn: 'ক্যাশ অন ডেলিভারি (সিওডি)', ar: 'الدفع نقداً عند الاستلام' },
    { key: 'checkout.place_order_btn', en: 'Confirm & Place Honey Order', hi: 'ऑर्डर की पुष्टि करें और प्लेस करें', bn: 'অর্ডার কনফার্ম করুন', ar: 'تأكيد ودفع الطلب' },

    // Invoice & Shipping Label
    { key: 'invoice.title', en: 'TAX INVOICE', hi: 'कर चालान (टैक्स इनवॉइस)', bn: 'ট্যাক্স ইনভয়েস', ar: 'فاتورة ضريبية' },
    { key: 'invoice.hsn_code', en: 'HSN / SAC: 04090000 (Natural Honey)', hi: 'एचएसएन: 04090000 (प्राकृतिक शहद)', bn: 'এইচএসএন: 04090000 (প্রাকৃতিক মধু)', ar: 'الرمز الجمركي: 04090000 (عسل طبيعي)' },
    { key: 'label.fragile_badge', en: 'HANDLE WITH CARE - FRAGILE GLASS', hi: 'सावधानी से संभालें - नाजुक कांच', bn: 'সতর্কতা: ভঙ্গুর কাঁচ', ar: 'يرجى التعامل بحذر - زجاج قابل للكسر' },
  ];

  for (const item of uiTranslationsList) {
    const { key, ...langs } = item;
    for (const [langCode, value] of Object.entries(langs)) {
      await prisma.uiTranslation.create({
        data: {
          key,
          langCode,
          value,
          group: key.split('.')[0] || 'common',
        },
      });
    }
  }

  // 5. Seed 16 Dynamic Honey Categories
  console.log('Creating 16+ Honey Taxonomy Categories with Multilingual Translations...');
  const categoriesData = [
    {
      slug: 'multiflora-honey',
      sortOrder: 1,
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
      translations: {
        en: { name: 'Multiflora Honey', desc: 'Blended polyfloral nectar gathered by bees across diverse Himalayan meadows and wild pastures.' },
        hi: { name: 'बहुपुष्पीय शहद (मल्टीफ्लोरा)', desc: 'हिमालय के चरागाहों और विविध जंगली फूलों के पराग से मधुमक्खियों द्वारा संकलित प्राकृतिक अमृत।' },
        bn: { name: 'বহুপুষ্পী মধু (মাল্টিফ্লোরা)', desc: 'হিমালয়ের বিভিন্ন বুনো ফুলের পরাগ থেকে সংগৃহীত সুস্বাদু প্রাকৃতিক মধু।' },
        ar: { name: 'عسل متعدد الأزهار البري', desc: 'رحيق طبيعي خالص تجمعه النحل من مراعي وزهور جبال الهيمالايا المتنوعة.' },
      },
    },
    {
      slug: 'sidr-ber-honey',
      sortOrder: 2,
      image: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=800&q=80',
      translations: {
        en: { name: 'Sidr (Ber) Honey', desc: 'Monofloral luxury nectar harvested from ancient wild Jujube (Ziziphus) trees. Rich caramel notes.' },
        hi: { name: 'सिद्र (बेर) शहद', desc: 'प्राचीन जंगली बेर (सिद्र) के पेड़ों से एकत्रित दुर्लभ और गाढ़ा औषधीय शहद। कारमेल स्वाद।' },
        bn: { name: 'সিদর (কুল) মধু', desc: 'বুনো কুল বা বরই ফুলের অনন্য সুগন্ধযুক্ত প্রিমিয়াম মানের গাঢ় মধু।' },
        ar: { name: 'عسل السدر الملكي الفاخر', desc: 'أجود أنواع عسل السدر المستخرج من أشجار السدر البرية القديمة بنكهة الكراميل الغنية.' },
      },
    },
    {
      slug: 'acacia-honey',
      sortOrder: 3,
      image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=800&q=80',
      translations: {
        en: { name: 'Acacia Honey', desc: 'Crystal clear, ultra-mild sweet honey with very slow crystallization. Perfect for gourmet desserts.' },
        hi: { name: 'बबूल (अकेशिया) शहद', desc: 'पारदर्शी, हल्का मीठा और लंबे समय तक तरल रहने वाला प्रसिद्ध शहद।' },
        bn: { name: 'বাবলা (অ্যাকাশিয়া) মধু', desc: 'স্বচ্ছ ও মিষ্টি স্বাদের মধু, যা সহজে জমাট বাঁধে না।' },
        ar: { name: 'عسل الأكاسيا الصافي', desc: 'عسل شفاف وناعم المذاق بطيء التبلور، ممتاز لتحلية المشروبات والحلويات.' },
      },
    },
    {
      slug: 'wild-forest-honey',
      sortOrder: 4,
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
      translations: {
        en: { name: 'Wild Forest Honey', desc: 'Dark, antioxidant-dense honey foraged by giant rock bees (Apis dorsata) deep in virgin deciduous forests.' },
        hi: { name: 'जंगली वन शहद', desc: 'घने जंगलों में विशाल पहाड़ी मधुमक्खियों द्वारा निर्मित गहरा, एंटीऑक्सीडेंट से भरपूर शहद।' },
        bn: { name: 'গহীন বনের খাঁটি মধু', desc: 'ঘন অরণ্যের মৌচাক থেকে সরাসরি সংগৃহীত খনিজ ও অ্যান্টিঅক্সিডেন্টে ভরপুর প্রাকৃতিক মধু।' },
        ar: { name: 'عسل الغابات البكر الكثيفة', desc: 'عسل داكن اللون غني بالمعادن ومضادات الأكسدة مستخرج من أعماق الغابات العذراء.' },
      },
    },
    {
      slug: 'eucalyptus-honey',
      sortOrder: 5,
      image: 'https://images.unsplash.com/photo-1628102491629-778571d893a3?auto=format&fit=crop&w=800&q=80',
      translations: {
        en: { name: 'Eucalyptus Honey', desc: 'Distinct herbal undertones with refreshing cooling notes. Highly revered for respiratory wellness.' },
        hi: { name: 'नीलगिरी (यूकेलिप्टस) शहद', desc: 'हल्के औषधीय सुगंध और ताजगी से युक्त शहद। श्वसन स्वास्थ्य और गले की खराश के लिए उत्तम।' },
        bn: { name: 'ইউক্যালিপটাস মধু', desc: 'ভেষজ সুবাসযুক্ত সতেজ মধু যা সর্দি-কাশি ও গলার জন্য বিশেষ উপকারী।' },
        ar: { name: 'عسل الكافور والأوكالبتوس', desc: 'نكهة عشبية منعشة معروفة بخصائصها الفعالة لدعم الجهاز التنفسي والحلق.' },
      },
    },
    {
      slug: 'litchi-blossom-honey',
      sortOrder: 6,
      image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=800&q=80',
      translations: {
        en: { name: 'Litchi Blossom Honey', desc: 'Delicate floral aroma reminiscent of sweet summer litchi orchards in the Muzaffarpur valleys.' },
        hi: { name: 'लीची फूल शहद', desc: 'लीची के बागों से परागित सुगन्धित, मीठा और बच्चों का सबसे पसंदीदा शहद।' },
        bn: { name: 'লিচু ফুলের সুস্বাদু মধু', desc: 'মুজাফফরপুরের বিখ্যাত লিচু বাগান থেকে আহরিত মিষ্টি ও ফলের গন্ধযুক্ত মধু।' },
        ar: { name: 'عسل زهر الليتشي العطري', desc: 'عسل ذو رائحة زهرية فواحة وطعم فاكهي ساحر مستوحى من بساتين الليتشي الصيفية.' },
      },
    },
    {
      slug: 'mustard-blossom-honey',
      sortOrder: 7,
      image: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80',
      translations: {
        en: { name: 'Mustard Blossom Honey', desc: 'Naturally creamy texture with rapid crystallization into delicious golden honey butter.' },
        hi: { name: 'सरसों फूल शहद', desc: 'सर्दियों के सरसों खेतों से एकत्रित, प्राकृतिक रूप से मलाईदार और पोषक तत्वों से भरपूर।' },
        bn: { name: 'সরিষা ফুলের মধু', desc: 'শীতের হলুদ সরিষা ক্ষেত থেকে সংগৃহীত মাখনের মতো মসৃণ ও সুস্বাদু ক্রিমি মধু।' },
        ar: { name: 'عسل زهر الخردل الكريمي', desc: 'قوام كريمي مخملي طبيعي سريع التبلور بنكهة دافئة محببة.' },
      },
    },
    {
      slug: 'jamun-honey',
      sortOrder: 8,
      image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80',
      translations: {
        en: { name: 'Jamun (Indian Blackberry) Honey', desc: 'Bitter-sweet woody notes harvested from Jamun blossoms. Traditionally celebrated for glycemic balance.' },
        hi: { name: 'जामुन शहद', desc: 'जामुन के फूलों से प्राप्त कड़वा-मीठा विशिष्ट शहद, जो शुगर संतुलन के लिए आयुर्वेद में विख्यात है।' },
        bn: { name: 'জামের মধু', desc: 'মিষ্টি-তিতা স্বাদের কালো জামের ফুল থেকে তৈরি অত্যন্ত পুষ্টিকর স্বাস্থ্যকর মধু।' },
        ar: { name: 'عسل زهر الجمبولان (التوت البري)', desc: 'مذاق فريد يجمع بين الحلاوة والمرارة الخفيفة، مفضل لتوازن مستويات السكر طبيعياً.' },
      },
    },
    {
      slug: 'sundarban-mangrove-honey',
      sortOrder: 9,
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      translations: {
        en: { name: 'Sundarban Mangrove Honey', desc: 'Raw salty-sweet honey harvested by traditional Mauals in the wild tiger mangrove delta.' },
        hi: { name: 'सुंदरबन मैंग्रोव शहद', desc: 'सुंदरबन के घने जंगलों में परंपरागत मौलियों द्वारा निकाला गया प्राकृतिक नमकीन-मीठा शहद।' },
        bn: { name: 'সুন্দরবনের খাঁটি খলসী মধু', desc: 'সুন্দরবনের গভীর ম্যানগ্রোভ থেকে মৌয়ালদের হাতে সংগৃহীত ঐতিহ্যবাহী লবণাক্ত-মিষ্টি মধু।' },
        ar: { name: 'عسل القرم الطبيعي بسونداربانس', desc: 'عسل فريد يجمع بين الملوحة الخفيفة والحلاوة مستخرج من غابات المانغروف الاستوائية.' },
      },
    },
    {
      slug: 'tulsi-holy-basil-honey',
      sortOrder: 10,
      image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80',
      translations: {
        en: { name: 'Tulsi (Holy Basil) Honey', desc: 'Sacred immunity booster imbued with volatile oils of holy basil flora.' },
        hi: { name: 'तुलसी (पवित्र बासिल) शहद', desc: 'रोग प्रतिरोधक क्षमता बढ़ाने वाला, पवित्र तुलसी के पराग से भरपूर सुवासित शहद।' },
        bn: { name: 'পবিত্র তুলসী মধু', desc: 'রোগ প্রতিরোধ ক্ষমতা বৃদ্ধিকারী তুলসী পাতার ভেষজ গুণে সমৃদ্ধ পবিত্র মধু।' },
        ar: { name: 'عسل الريحان المقدس (تولسي)', desc: 'منشط طبيعي للمناعة غني بالزيوت العطرية لنبات الريحان المقدس المبارك.' },
      },
    },
    {
      slug: 'kashmiri-white-honey',
      sortOrder: 11,
      image: 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=800&q=80',
      translations: {
        en: { name: 'Kashmiri White Honey', desc: 'Rare snow-white creamy honey foraged from Robinia pseudoacacia and Plectranthus in Kashmir valleys.' },
        hi: { name: 'कश्मीरी सफेद शहद', desc: 'कश्मीर की बर्फीली वादियों के फूलों से प्राप्त दुर्लभ, मलाईदार सफेद शहद।' },
        bn: { name: 'কাশ্মীরি সাদা মধু', desc: 'কাশ্মীরের বরফাচ্ছাদিত উপত্যকার ফুল থেকে সংগৃহীত দুষ্প্রাপ্য ক্রিমি দুধ-সাদা মধু।' },
        ar: { name: 'عسل كشمير الأبيض النادر', desc: 'عسل أبيض ثلجي ناعم وفاخر مستخلص من أزهار أودية كشمير الخلابة.' },
      },
    },
    {
      slug: 'ajwain-honey',
      sortOrder: 12,
      image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=800&q=80',
      translations: {
        en: { name: 'Ajwain (Carom) Honey', desc: 'Sharp aromatic honey with strong thymol undertones, excellent for digestive vitality.' },
        hi: { name: 'अजवाइन शहद', desc: 'थाइमोल से भरपूर तेज खुशबूदार शहद, जो पाचन क्रिया को दुरुस्त रखने में अचूक है।' },
        bn: { name: 'জোয়ান ফুলের মধু', desc: 'তীব্র সুগন্ধি ও থাইমলে ভরপুর মধু যা হজম শক্তি বাড়াতে সাহায্য করে।' },
        ar: { name: 'عسل حبة اليانسون والنانخة', desc: 'عسل عطري حاد بنكهة الثيمول الطبيعية الداعمة لصحة الجهاز الهضمي والمعدة.' },
      },
    },
    {
      slug: 'neem-blossom-honey',
      sortOrder: 13,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      translations: {
        en: { name: 'Neem Blossom Honey', desc: 'Rich amber medicinal honey harvested during the brief spring blooming of Indian Neem trees.' },
        hi: { name: 'नीम फूल शहद', desc: 'नीम के वसंत कालीन फूलों से एकत्रित अत्यंत गुणकारी, रक्त शोधक आयुर्वेदिक शहद।' },
        bn: { name: 'নিম ফুলের ভেষজ মধু', desc: 'বসন্তে নিম ফুলের রক্তপরিশোধক ঔষধি গুণসম্পন্ন গাঢ় সোনালি রঙের মধু।' },
        ar: { name: 'عسل زهر النيم العلاجي', desc: 'عسل عنبري مركز يجنى أثناء إزهار أشجار النيم في فصل الربيع المشهور بخصائصه المطهرة.' },
      },
    },
    {
      slug: 'coriander-honey',
      sortOrder: 14,
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
      translations: {
        en: { name: 'Coriander Honey', desc: 'Citrusy warm notes with gentle herbal sweetness from coriander fields in Rajasthan.' },
        hi: { name: 'धनिया शहद', desc: 'राजस्थान के धनिया खेतों से परागित खट्टे-मीठे जायके वाला मनभावन शहद।' },
        bn: { name: 'ধনে ফুলের মিষ্টি মধু', desc: 'লেবু সদৃশ হালকা সুগন্ধ ও ভেষজ মিষ্টতাযুক্ত রাজস্থানি ধনে ফুলের মধু।' },
        ar: { name: 'عسل الكزبرة النقي', desc: 'نكهة حمضية دافئة وحلاوة عشبية لطيفة مستخلصة من حقول الكزبرة الخضراء.' },
      },
    },
    {
      slug: 'raw-unfiltered-comb-honey',
      sortOrder: 15,
      image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80',
      translations: {
        en: { name: 'Raw Unfiltered Comb Honey', desc: 'Intact raw beeswax comb cut straight from the hive, bursting with living enzymes and pollen.' },
        hi: { name: 'कच्चा छत्ते का शहद (कॉम्ब हनी)', desc: 'मधुमक्खी के प्राकृतिक छत्ते के साथ सीधे काटा गया शुद्ध मोम और पराग से भरा अनछना शहद।' },
        bn: { name: 'চাকের অপরিশোধিত মোমযুক্ত মধু', desc: 'সরাসরি মৌচাক থেকে কাটা তাজা প্রাকৃতিক মোম ও পরাগরেণু সমৃদ্ধ কাঁচা মধু।' },
        ar: { name: 'عسل شمع النحل الطبيعي الخام', desc: 'أقراص شمع النحل الطبيعية المقطوعة مباشرة من الخلية المليئة بالإنزيمات وحبوب اللقاح.' },
      },
    },
    {
      slug: 'infused-herbal-honey',
      sortOrder: 16,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      translations: {
        en: { name: 'Infused Herbal Honey', desc: 'Artisanal cold-infusion of raw forest honey with organic Kashmiri saffron, ginger, and cinnamon.' },
        hi: { name: 'जड़ी-बूटी युक्त शहद (हर्बल इन्फ्यूज्ड)', desc: 'कश्मीरी केसर, सौंठ और दालचीनी के साथ धीमी आंच पर तैयार किया गया स्वादिष्ट पाचक शहद।' },
        bn: { name: 'ভেষজ সংমিশ্রিত প্রিমিয়াম মধু', desc: 'জাফরান, আদা ও দারুচিনির নির্যাস সহযোগে তৈরি সুস্বাদু ও পুষ্টিকর ভেষজ মধু।' },
        ar: { name: 'عسل الأعشاب الطبيعية المنقوع', desc: 'منقوع بارد لعسل الغابات النقي مع الزعفران الكشميري الأصلي والزنجبيل والقرفة.' },
      },
    },
  ];

  const createdCategories: Record<string, string> = {};

  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: {
        sortOrder: cat.sortOrder,
        imageUrl: cat.image,
        isActive: true,
      },
    });
    createdCategories[cat.slug] = createdCat.id;

    for (const [langCode, t] of Object.entries(cat.translations)) {
      await prisma.categoryTranslation.create({
        data: {
          categoryId: createdCat.id,
          langCode,
          name: t.name,
          slug: `${cat.slug}-${langCode}`,
          description: t.desc,
          metaTitle: `${t.name} - Royal Artisanal Nectar`,
          metaDescription: t.desc,
        },
      });
    }
  }

  // 6. Seed Products with 2x2 Variant Matrix for Categories
  console.log('Creating Master Honey Products & 2x2 Variant Matrices (Glass/PET x 500g/1kg)...');

  const productsConfig = [
    {
      catSlug: 'sidr-ber-honey',
      code: 'SIDR',
      isFeatured: true,
      basePrice: 599,
      mrp500G: 699, sale500G: 599, mrp1KGG: 1299, sale1KGG: 1099,
      mrp500P: 649, sale500P: 549, mrp1KGP: 1199, sale1KGP: 999,
      images: [
        'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80',
      ],
      t: {
        en: {
          title: 'Royal Sidr (Ber) Reserve Honey',
          summary: 'Ancient wild Jujube nectar known for rich caramel notes and superior antioxidant capacity.',
          desc: 'Our Royal Sidr Honey is sustainably harvested once a year from old-growth Ziziphus trees in pristine semi-arid tracts. Renowned globally for its distinctive golden-amber hue, velvety molasses finish, and high diastase activity.',
          floralOrigin: 'Wild Sidr (Ziziphus mauritiana) Blossoms',
          purityNotes: '100% Raw, Unheated, NMR Spectrometry Certified. Fructose/Glucose ratio > 1.35.',
          storageTips: 'Store at room temperature in a cool dry pantry. Do not refrigerate. Crystallization is a natural hallmark of raw honey.',
        },
        hi: {
          title: 'रॉयल सिद्र (बेर) रिज़र्व शहद',
          summary: 'प्राचीन जंगली बेर के पेड़ों से संकलित, कैरेमल जैसा गाढ़ा और औषधीय गुणों से भरपूर।',
          desc: 'वर्ष में केवल एक बार जंगलों में उगने वाले बेर के पेड़ों से निकाला गया विशिष्ट शहद। यह अपने गाढ़े सुनहरे रंग, अनोखे स्वाद और प्राकृतिक एंजाइमों के लिए जाना जाता है।',
          floralOrigin: 'जंगली सिद्र (बेर) के फूल',
          purityNotes: '१००% कच्चा, बिना गर्म किया हुआ, एनएमआर स्पेक्ट्रोमेट्री प्रमाणित।',
          storageTips: 'कमरे के तापमान पर रखें। फ्रिज में न रखें। जमना शुद्ध शहद की प्राकृतिक विशेषता है।',
        },
        bn: {
          title: 'রয়্যাল সিদর (কুল) প্রিমিয়াম মধু',
          summary: 'বুনো কুল ফুলের অনন্য ক্যারামেল স্বাদের অত্যন্ত পুষ্টিকর ও ঔষধি গুণসম্পন্ন মধু।',
          desc: 'বছরে একবার গভীর অরণ্যের বুনো কুল গাছ থেকে সংগৃহীত। এর গাড় সোনালি রঙ এবং প্রাকৃতিক খনিজের প্রাচুর্য একে যেকোনো কৃত্রিম মধুর চেয়ে শতগুণ শ্রেষ্ঠ করেছে।',
          floralOrigin: 'বুনো কুল বা বরই ফুল',
          purityNotes: '১০০% খাঁটি, হিট-ট্রিটমেন্ট মুক্ত, এনএমআর ল্যাব পরীক্ষিত।',
          storageTips: 'সাধারণ তাপমাত্রায় শুকনা স্থানে রাখুন। ফ্রিজে রাখবেন না।',
        },
        ar: {
          title: 'عسل السدر الملكي الفاخر',
          summary: 'عسل سدر بري نادر من أشجار العلب القديمة ذو نكهة كراميل غنية وقيمة غذائية عالية.',
          desc: 'يتم حصاد هذا العسل الملكي مرة واحدة سنوياً من أشجار السدر البرية العريقة. يتميز بقوامه الكثيف ولونه العنبري ونكهته الاستثنائية التي تدوم طويلاً.',
          floralOrigin: 'أزهار أشجار السدر البرية (النبق)',
          purityNotes: 'خام ١٠٠٪ غير مبستر، مفحوص بالرنين المغناطيسي النووي وخالٍ من السكريات المضافة.',
          storageTips: 'يحفظ في مكان جاف في درجة حرارة الغرفة بعيداً عن أشعة الشمس المباشرة.',
        },
      },
    },
    {
      catSlug: 'wild-forest-honey',
      code: 'WFOR',
      isFeatured: true,
      basePrice: 549,
      mrp500G: 649, sale500G: 549, mrp1KGG: 1199, sale1KGG: 999,
      mrp500P: 599, sale500P: 499, mrp1KGP: 1099, sale1KGP: 899,
      images: [
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1000&q=80',
      ],
      t: {
        en: {
          title: 'Deep Wild Forest Raw Nectar',
          summary: 'Robust, smoky, mineral-rich nectar gathered from deep virgin tiger corridors.',
          desc: 'Harvested ethically by indigenous foraging tribes from towering cliffs and forest canopies. Imbued with bioactive tree resins, medicinal herbs, and forest flora.',
          floralOrigin: 'Multi-canopy Virgin Deciduous Forest Blossom',
          purityNotes: 'Zero micro-filtration. Retains high concentrations of natural bee pollen and propolis.',
          storageTips: 'Keep container tightly sealed in an ambient cupboard. Safe for years without preservatives.',
        },
        hi: {
          title: 'गहरे जंगलों का प्राकृतिक वन शहद',
          summary: 'घने जंगलों के ऊंचे पेड़ों से निकाला गया गहरा, खनिज और पराग से भरपूर अमृत।',
          desc: 'आदिवासी समुदाय द्वारा प्राकृतिक रूप से संरक्षित जंगलों से पारंपरिक पद्धति से संकलित। प्राकृतिक प्रोपोलिस और बी-पॉलेन से परिपूर्ण।',
          floralOrigin: 'जंगली औषधीय वनस्पतियां एवं वन वृक्ष',
          purityNotes: 'बिना किसी फिल्टर के, कच्चा और जीवित एंजाइमों से भरपूर।',
          storageTips: 'सूखी जगह पर कमरे के सामान्य तापमान पर रखें।',
        },
        bn: {
          title: 'গহীন বনের অপরিশোধিত প্রাকৃতিক মধু',
          summary: 'বনজ ঔষধি ও প্রাকৃতিক খনিজে ভরপুর গাঢ় রঙের আদিম অরণ্যের মধু।',
          desc: 'প্রাকৃতিক বনাঞ্চলের মৌচাক থেকে ঐতিহ্যবাহী পদ্ধতিতে সংগৃহীত। এতে রয়েছে প্রাকৃতিক পোলেন ও মৌমাছির তৈরি প্রপোলিস।',
          floralOrigin: 'বুনো শাল, পিয়াল ও ঔষধি গুল্মের ফুল',
          purityNotes: 'ফিল্টার মুক্ত ও সম্পূর্ণ প্রাকৃতিকভাবে সংগ্রহকৃত।',
          storageTips: 'শুষ্ক ও ছায়াযুক্ত স্থানে স্বাভাবিক তাপমাত্রায় সংরক্ষণ করুন।',
        },
        ar: {
          title: 'عسل الغابات البرية البكر الداكن',
          summary: 'عسل كثيف غني بالمعادن وحبوب اللقاح الطبيعية مستخرج من أعالي أشجار الغابات العذراء.',
          desc: 'يجمعه النحالون المحليون بطرق تقليدية مستدامة من أعالي الجبال والغابات المطرية. يحتوي على مضادات أكسدة قوية ومركبات البروبوليس الفعالة.',
          floralOrigin: 'زهور وأشجار الغابات البرية المتنوعة',
          purityNotes: 'غير مصفى بدقة للحفاظ على حبوب اللقاح الحية وغذاء الملكات.',
          storageTips: 'يحفظ محكم الإغلاق في درجة حرارة الغرفة العادية.',
        },
      },
    },
    {
      catSlug: 'kashmiri-white-honey',
      code: 'KASH',
      isFeatured: true,
      basePrice: 699,
      mrp500G: 799, sale500G: 699, mrp1KGG: 1499, sale1KGG: 1299,
      mrp500P: 749, sale500P: 649, mrp1KGP: 1399, sale1KGP: 1199,
      images: [
        'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80',
      ],
      t: {
        en: {
          title: 'Himalayan Kashmiri White Honey',
          summary: 'Silky, pearlescent white honey with a delicate floral bouquet from high-altitude valleys.',
          desc: 'Foraged by bees from high-altitude acacia and Plectranthus wild herbs in the pristine valleys of Kashmir. Naturally crystallizes into a pearlescent white, buttery cream.',
          floralOrigin: 'High Altitude Kashmiri Robinia & Plectranthus',
          purityNotes: 'Naturally white without whipping or aeration. Low glycemic index.',
          storageTips: 'Enjoy straight with a wooden spoon or fold into artisanal yogurt and brioche.',
        },
        hi: {
          title: 'हिमालयी कश्मीरी सफेद शहद',
          summary: 'सफेद मोती जैसा चमकदार, मक्खन जैसा मुलायम और अत्यंत सुवासित कश्मीरी शहद।',
          desc: 'कश्मीर की ऊंची वादियों में खिलने वाले रॉबिनिया और औषधीय जड़ी-बूटियों के रस से बना अनूठा सफेद शहद।',
          floralOrigin: 'कश्मीरी अकेशिया एवं उच्च हिमालयी वन्य पुष्प',
          purityNotes: 'प्राकृतिक रूप से सफेद, बिना किसी मिलावट या मथाई के।',
          storageTips: 'लकड़ी के चम्मच का प्रयोग करें, सामान्य तापमान पर रखें।',
        },
        bn: {
          title: 'হিমালয়ান কাশ্মীরি সাদা মধু',
          summary: 'দুধের মতো সাদা, মাখনের মতো নরম ও অপূর্ব ঘ্রাণযুক্ত কাশ্মীর উপত্যকার মধু।',
          desc: 'কাশ্মীরের উঁচু পার্বত্য অঞ্চলের বিশেষ বুনো ফুলের মধু। প্রাকৃতিকভাবেই এটি সাদা রঙের ক্রিমে রূপান্তরিত হয়।',
          floralOrigin: 'কাশ্মীরি পাহাড়ি রবিনিয়া ও বুনো ফুল',
          purityNotes: 'সম্পূর্ণ প্রাকৃতিক সাদা ক্রিম টেক্সচার, কোনো রাসায়নিক বা হিটিং নেই।',
          storageTips: 'শুষ্ক কাঁচের পাত্রে সাধারণ তাপমাত্রায় রাখুন।',
        },
        ar: {
          title: 'عسل كشمير الأبيض الثلجي النادر',
          summary: 'عسل لؤلؤي المظهر بملمس حريري ومذاق زهري رقيق من قمم جبال الهيمالايا وكشمير.',
          desc: 'تجنى هذه التحفة النادرة من أزهار الروبينيا الجبلية في وديان كشمير الباردة. يتبلور ذاتياً إلى قوام أبيض ثلجي يشبه الزبدة الفاخرة.',
          floralOrigin: 'أزهار جبال كشمير البرية الشاهقة',
          purityNotes: 'أبيض طبيعياً بنسبة ١٠٠٪ دون أي خفق صناعي أو إضافات.',
          storageTips: 'يحفظ في درجة حرارة الغرفة ويقدم مع المعجنات والمشروبات الفاخرة.',
        },
      },
    },
    {
      catSlug: 'multiflora-honey',
      code: 'MULT',
      isFeatured: false,
      basePrice: 449,
      mrp500G: 549, sale500G: 449, mrp1KGG: 999, sale1KGG: 799,
      mrp500P: 499, sale500P: 399, mrp1KGP: 899, sale1KGP: 699,
      images: [
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80',
      ],
      t: {
        en: {
          title: 'Himalayan Multiflora Raw Honey',
          summary: 'Well-balanced everyday wildflower honey with golden amber clarity and gentle floral sweetness.',
          desc: 'Gathered across alpine meadows hosting over 50 varieties of native wild blooming flora. The quintessential pantry staple for natural sweetening and family wellness.',
          floralOrigin: 'Himalayan Sub-Alpine Polyfloral Wildflowers',
          purityNotes: 'NMR Tested, 0% Added Sucrose, Antibiotic residue free.',
          storageTips: 'Store in a dry cupboard away from direct sunshine.',
        },
        hi: {
          title: 'हिमालयी बहुपुष्पीय (मल्टीफ्लोरा) शहद',
          summary: 'सुनहरे रंग का, हर दिन के उपयोग के लिए उत्तम और प्राकृतिक मिठास से भरपूर शहद।',
          desc: '५० से अधिक किस्मों के जंगली फूलों से एकत्रित। सुबह गुनगुने पानी, दूध या हर्बल चाय में मिलाने के लिए सर्वोत्तम।',
          floralOrigin: 'हिमालय के विविध मौसमी जंगली फूल',
          purityNotes: 'एनएमआर प्रमाणित, शून्य अतिरिक्त चीनी, एंटीबायोटिक मुक्त।',
          storageTips: 'धूप से दूर सूखे स्थान पर रखें।',
        },
        bn: {
          title: 'হিমালয়ান বহুপুষ্পী বন্য মধু',
          summary: 'দৈনন্দিন খাওয়ার জন্য আদর্শ সোনালি রঙের মিষ্টি প্রাকৃতিক পাহাড়ি মধু।',
          desc: '৫০টিরও বেশি পাহাড়ি বুনো ফুলের নির্যাস। পরিবার ও শিশুদের নিয়মিত পুষ্টির জন্য সবচেয়ে জনপ্রিয়।',
          floralOrigin: 'হিমালয়ের পাহাড়ি বুনো ফুলের সমাহার',
          purityNotes: 'এনএমআর পরীক্ষিত, কোনো কৃত্রিম চিনি নেই।',
          storageTips: 'স্বাভাবিক তাপমাত্রায় সংরক্ষণ করুন।',
        },
        ar: {
          title: 'عسل متعدد الأزهار البرية الجبلي',
          summary: 'عسل عنبري ذهبي متوازن المذاق للاستخدام اليومي من مراعي الهيمالايا العشبية.',
          desc: 'يجمع هذا العسل المتوازن رحيق أكثر من ٥٠ نوعاً من زهور المراعي الجبلية النقية. مثالي للتحلية اليومية ودعم نشاط وحيوية الجسم.',
          floralOrigin: 'مراعي زهور الألب وجبال الهيمالايا المتنوعة',
          purityNotes: 'مفحوص ومضمون خلوه من أي سكر صناعي أو بقايا أدوية.',
          storageTips: 'يحفظ في مكان مظلم وجاف بدرجة حرارة معتدلة.',
        },
      },
    },
    {
      catSlug: 'sundarban-mangrove-honey',
      code: 'SUND',
      isFeatured: true,
      basePrice: 620,
      mrp500G: 720, sale500G: 620, mrp1KGG: 1350, sale1KGG: 1150,
      mrp500P: 670, sale500P: 570, mrp1KGP: 1250, sale1KGP: 1050,
      images: [
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80',
      ],
      t: {
        en: {
          title: 'Sundarban Khalsi Mangrove Honey',
          summary: 'Intriguing sweet-tart honey with high moisture and unique saline undertones from the world heritage delta.',
          desc: 'Hand-collected by courageous Mauals braving the royal Bengal tiger territory. Sourced primarily from the delicate white blossom of the Khalsi mangrove tree.',
          floralOrigin: 'Khalsi & Gewa Mangrove Blossom',
          purityNotes: 'Completely unheated to preserve volatile mangrove esters and prebiotic bacteria.',
          storageTips: 'Keep tightly sealed. Natural fermentation bubbles may appear which is a sign of living raw honey.',
        },
        hi: {
          title: 'सुंदरबन खलिसी मैंग्रोव शहद',
          summary: 'सुंदरबन के मैंग्रोव से निकाला गया दुर्लभ, अनोखा खट्टा-मीठा और स्वास्थ्यवर्धक शहद।',
          desc: 'विश्व प्रसिद्ध सुंदरबन के जंगलों में खलिसी और गेवा के फूलों से पारंपरिक मौलिया समुदाय द्वारा हाथ से निकाला गया अनमोल शहद।',
          floralOrigin: 'सुंदरबन खलिसी मैंग्रोव वृक्ष के फूल',
          purityNotes: 'कच्चा, अनछना और लाभकारी प्रोबायोटिक्स से भरपूर।',
          storageTips: 'कसकर बंद रखें और नमी से बचाएं।',
        },
        bn: {
          title: 'সুন্দরবনের আদি খাঁটি খলসী মধু',
          summary: 'সুন্দরবনের বাঘের ডেরা থেকে মৌয়ালদের সংগৃহীত অতি দুর্লভ ও সুস্বাদু খলসী মধু।',
          desc: 'বিশ্ব ঐতিহ্য সুন্দরবনের গভীরে খলসী ফুলের মধু সবচেয়ে সুস্বাদু হিসেবে স্বীকৃত। এর মিষ্টি ও হালকা নোনতা স্বাদ এক অনন্য প্রাকৃতিক অভিজ্ঞতা প্রদান করে।',
          floralOrigin: 'সুন্দরবনের খলসী ও গরান ম্যানগ্রোভ ফুল',
          purityNotes: 'কোনো তাপ প্রক্রিয়াজাত ছাড়া সরাসরি সংগৃহীত ১০০% কাঁচা মধু।',
          storageTips: 'বোতলের মুখ শক্ত করে আটকে রাখুন।',
        },
        ar: {
          title: 'عسل القرم الملكي بسونداربانس',
          summary: 'عسل طبيعي فريد يجمع بين الحلاوة والنكهة المالحة الخفيفة من دلتا أشجار القرم العالمية.',
          desc: 'يجمعه النحالون الشجعان يدوياً من أعماق غابات المانغروف الساحلية. غني بالمعادن البحرية والإنزيمات الحية المفيدة للهضم.',
          floralOrigin: 'أزهار أشجار القرم (المانغروف) النادرة',
          purityNotes: 'عسل حي غير مبستر وغير معالج يحتفظ بكافة البكتيريا النافعة.',
          storageTips: 'يحفظ مغلقاً بإحكام في مكان بارد وجاف.',
        },
      },
    },
    {
      catSlug: 'raw-unfiltered-comb-honey',
      code: 'COMB',
      isFeatured: true,
      basePrice: 799,
      mrp500G: 899, sale500G: 799, mrp1KGG: 1699, sale1KGG: 1499,
      mrp500P: 849, sale500P: 749, mrp1KGP: 1599, sale1KGP: 1399,
      images: [
        'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=1000&q=80',
      ],
      t: {
        en: {
          title: 'Freshly Cut Hive Comb Honey',
          summary: 'Pure hexagonal honeycomb cut fresh from the apiary frame, swimming in raw amber nectar.',
          desc: 'The purest form of honey known to mankind. Chew the natural beeswax like natural chewing gum to release microscopic trace propolis, royal jelly, and fresh pollen.',
          floralOrigin: 'Multi-Floral Wilderness Canopy',
          purityNotes: '100% Edible Organic Beeswax Comb. Untouched by human hands or extraction centrifuges.',
          storageTips: 'Serve at room temperature. Slice chunks onto warm toast or cheese boards.',
        },
        hi: {
          title: 'ताज़ा छत्ते का कच्चा कॉम्ब हनी',
          summary: 'प्राकृतिक छत्ते के मोम के साथ ताज़ा काटा गया, पराग और प्रोपोलिस से लबालब शहद।',
          desc: 'शहद का सबसे शुद्ध रूप। प्राकृतिक मोम को चबाने से गले और सांस की नली को तुरंत ताजगी और आराम मिलता है।',
          floralOrigin: 'जंगली वन्य पुष्प एवं जड़ी-बूटियां',
          purityNotes: '१००% खाने योग्य मोम, बिना किसी मशीन निष्कर्षण के।',
          storageTips: 'सीधे जार से चम्मच से काटकर परोसें।',
        },
        bn: {
          title: 'তাজা মৌচাকের খাঁটি কম্ব মধু',
          summary: 'চাকের মোমসহ সরাসরি কেটে বয়ামে ভরা সম্পূর্ণ ভেজালহীন প্রাকৃতিকের চেয়েও প্রাকৃতিক মধু।',
          desc: 'মানুষের হাতের স্পর্শ ছাড়া মৌচাকের ষড়ভুজ ঘরের মধ্যে সুরক্ষিত অমৃত। প্রাকৃতিক মোম চিবিয়ে খেলে দাঁত ও মাড়ির স্বাস্থ্য ভালো থাকে।',
          floralOrigin: 'বুনো ফুলের মিশ্র নির্যাস',
          purityNotes: 'চাকসহ ১০০% ভোজ্য প্রাকৃতিক মোম এবং তাজা পরাগরেণু।',
          storageTips: 'সাধারণ তাপমাত্রায় চামচ দিয়ে কেটে উপভোগ করুন।',
        },
        ar: {
          title: 'عسل شمع النحل الطازج المقطوع يدوياً',
          summary: 'أقراص شمع سداسية طازجة مقطوعة مباشرة من إطار الخلية تسبح في العسل الصافي.',
          desc: 'أنقى صور العسل في الطبيعة. يمكن مضغ شمع النحل العضوي للاستفادة الكاملة من البروبوليس الطبيعي وحبوب اللقاح وغذاء الملكات الطازج.',
          floralOrigin: 'رحيق أزهار الطبيعة العذراء',
          purityNotes: 'شمع نحل نقي وصالح للأكل ١٠٠٪ دون أي تعرض لآلات الطرد المركزي.',
          storageTips: 'يقدم في درجة حرارة الغرفة مع الأجبان الفاخرة والخبز الساخن.',
        },
      },
    },
  ];

  for (const p of productsConfig) {
    const categoryId = createdCategories[p.catSlug] || Object.values(createdCategories)[0];

    const product = await prisma.product.create({
      data: {
        categoryId,
        isFeatured: p.isFeatured,
        isActive: true,
        hsnCode: '04090000',
        taxRate: 5.0,
        basePrice: p.basePrice,
      },
    });

    // Product Translations
    for (const [langCode, t] of Object.entries(p.t)) {
      await prisma.productTranslation.create({
        data: {
          productId: product.id,
          langCode,
          title: t.title,
          slug: `${p.code.toLowerCase()}-${langCode}`,
          summary: t.summary,
          description: t.desc,
          floralOrigin: t.floralOrigin,
          purityNotes: t.purityNotes,
          storageTips: t.storageTips,
          seoKeywords: `honey, raw honey, ${p.code}, artisanal honey, buy online, pure`,
        },
      });
    }

    // Media
    for (let i = 0; i < p.images.length; i++) {
      await prisma.productMedia.create({
        data: {
          productId: product.id,
          url: p.images[i],
          altText: `${p.code} Honey Jar Photo ${i + 1}`,
          sortOrder: i + 1,
          isPrimary: i === 0,
        },
      });
    }

    // 2x2 Variant Matrix Specification:
    // Option A: 500g Glass (gross ~820g, fragile: true)
    // Option B: 1kg Glass (gross ~1480g, fragile: true)
    // Option C: 500g PET (gross ~555g, fragile: false)
    // Option D: 1kg PET (gross ~1085g, fragile: false)
    const variants = [
      {
        packagingType: 'GLASS_JAR',
        netWeightGrams: 500,
        grossShippingWeightGrams: 820,
        isFragile: true,
        sku: `HON-${p.code}-500G-GLS`,
        mrp: p.mrp500G,
        salePrice: p.sale500G,
        stockQuantity: 45,
        variantImageUrl: p.images[0],
      },
      {
        packagingType: 'GLASS_JAR',
        netWeightGrams: 1000,
        grossShippingWeightGrams: 1480,
        isFragile: true,
        sku: `HON-${p.code}-1KGG-GLS`,
        mrp: p.mrp1KGG,
        salePrice: p.sale1KGG,
        stockQuantity: 30,
        variantImageUrl: p.images[0],
      },
      {
        packagingType: 'PET_JAR',
        netWeightGrams: 500,
        grossShippingWeightGrams: 555,
        isFragile: false,
        sku: `HON-${p.code}-500P-PET`,
        mrp: p.mrp500P,
        salePrice: p.sale500P,
        stockQuantity: 60,
        variantImageUrl: p.images[p.images.length > 1 ? 1 : 0],
      },
      {
        packagingType: 'PET_JAR',
        netWeightGrams: 1000,
        grossShippingWeightGrams: 1085,
        isFragile: false,
        sku: `HON-${p.code}-1KGP-PET`,
        mrp: p.mrp1KGP,
        salePrice: p.sale1KGP,
        stockQuantity: 40,
        variantImageUrl: p.images[p.images.length > 1 ? 1 : 0],
      },
    ];

    for (const v of variants) {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          packagingType: v.packagingType,
          netWeightGrams: v.netWeightGrams,
          grossShippingWeightGrams: v.grossShippingWeightGrams,
          isFragile: v.isFragile,
          sku: v.sku,
          mrp: v.mrp,
          salePrice: v.salePrice,
          stockQuantity: v.stockQuantity,
          variantImageUrl: v.variantImageUrl,
        },
      });
    }
  }

  // 7. Seed Sample Orders with Invoices & Shipping Labels
  console.log('Creating Realistic Orders, Invoices and Thermal Shipping Labels...');
  const firstVariant = await prisma.productVariant.findFirst({
    where: { packagingType: 'GLASS_JAR', netWeightGrams: 500 },
    include: { product: { include: { translations: true } } },
  });

  const secondVariant = await prisma.productVariant.findFirst({
    where: { packagingType: 'PET_JAR', netWeightGrams: 1000 },
    include: { product: { include: { translations: true } } },
  });

  if (firstVariant && secondVariant) {
    const order1 = await prisma.order.create({
      data: {
        orderNumber: 'ORD-2026-1001',
        userId: customer.id,
        customerName: 'Ananya Sen',
        customerEmail: 'ananya.sen@example.com',
        customerPhone: '+91 91234 56789',
        shippingAddress: 'Apartment 4B, Heritage Enclave, Salt Lake Sector 2, Kolkata, West Bengal - 700091',
        billingAddress: 'Apartment 4B, Heritage Enclave, Salt Lake Sector 2, Kolkata, West Bengal - 700091',
        totalGrossWeightGrams: 820 + 1085, // 1905g
        hasGlassPackaging: true,
        subtotal: firstVariant.salePrice + secondVariant.salePrice,
        taxAmount: Math.round((firstVariant.salePrice + secondVariant.salePrice) * 0.05 * 100) / 100,
        shippingFee: 0.0, // free shipping above threshold
        totalAmount: (firstVariant.salePrice + secondVariant.salePrice) + Math.round((firstVariant.salePrice + secondVariant.salePrice) * 0.05 * 100) / 100,
        paymentMethod: 'ONLINE_UPI_CARD',
        paymentStatus: 'PAID',
        paymentTransactionId: 'TXN-RAZORPAY-88219472',
        status: 'SHIPPED',
        notes: 'Handle with care - fragile glass items enclosed.',
        items: {
          create: [
            {
              variantId: firstVariant.id,
              productTitle: 'Royal Sidr (Ber) Reserve Honey',
              variantTitle: '500g - Glass Jar (Tamper-Evident)',
              packagingType: 'GLASS_JAR',
              netWeightGrams: 500,
              grossWeightGrams: 820,
              sku: firstVariant.sku,
              unitPrice: firstVariant.salePrice,
              quantity: 1,
              totalPrice: firstVariant.salePrice,
            },
            {
              variantId: secondVariant.id,
              productTitle: 'Deep Wild Forest Raw Nectar',
              variantTitle: '1kg - Food-Grade PET Jar',
              packagingType: 'PET_JAR',
              netWeightGrams: 1000,
              grossWeightGrams: 1085,
              sku: secondVariant.sku,
              unitPrice: secondVariant.salePrice,
              quantity: 1,
              totalPrice: secondVariant.salePrice,
            },
          ],
        },
      },
    });

    // Create Invoice for Order 1
    await prisma.invoice.create({
      data: {
        orderId: order1.id,
        invoiceNumber: 'INV-2026-0001',
        hsnSummary: '04090000 - Natural Honey (5% GST: CGST 2.5% + SGST 2.5%)',
        taxBreakupJson: JSON.stringify({
          cgstRate: 2.5,
          sgstRate: 2.5,
          cgstAmount: Math.round((order1.subtotal * 0.025) * 100) / 100,
          sgstAmount: Math.round((order1.subtotal * 0.025) * 100) / 100,
          totalTax: order1.taxAmount,
        }),
        sellerGstNumber: '07AAAAA0000A1Z5',
        sellerCompanyName: 'Artisanal Royal Honey Co. Ltd.',
        sellerAddress: 'Suite 104, Apiary Heights, Western Ghats Reserve, Karnataka 577101',
      },
    });

    // Create Thermal Shipping Label for Order 1
    await prisma.shippingLabel.create({
      data: {
        orderId: order1.id,
        trackingNumber: 'AWB-8837192401',
        courierPartner: 'HoneyExpress Premium Cargo',
        barcodeData: 'AWB-8837192401',
        qrCodeData: `https://track.honeyexpress.com/shipment/AWB-8837192401?order=${order1.orderNumber}`,
        totalWeightGrams: order1.totalGrossWeightGrams,
        isFragileGlass: true,
        handlingInstructions: 'HANDLE WITH CARE - FRAGILE GLASS ENCLOSED',
        labelFormat: '4x6_THERMAL',
      },
    });

    // Order 2 (Packed, COD)
    const order2 = await prisma.order.create({
      data: {
        orderNumber: 'ORD-2026-1002',
        customerName: 'Kabir Mukherjee',
        customerEmail: 'kabir.m@example.com',
        customerPhone: '+91 98301 23456',
        shippingAddress: 'House 12, Lake View Road, Southern Avenue, Kolkata, West Bengal - 700029',
        billingAddress: 'House 12, Lake View Road, Southern Avenue, Kolkata, West Bengal - 700029',
        totalGrossWeightGrams: 555,
        hasGlassPackaging: false,
        subtotal: 549.0,
        taxAmount: 27.45,
        shippingFee: 50.0,
        totalAmount: 626.45,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        status: 'PACKED',
        items: {
          create: [
            {
              variantId: secondVariant.id,
              productTitle: 'Himalayan Kashmiri White Honey',
              variantTitle: '500g - Food-Grade PET Jar',
              packagingType: 'PET_JAR',
              netWeightGrams: 500,
              grossWeightGrams: 555,
              sku: 'HON-KASH-500P-PET',
              unitPrice: 549.0,
              quantity: 1,
              totalPrice: 549.0,
            },
          ],
        },
      },
    });

    await prisma.invoice.create({
      data: {
        orderId: order2.id,
        invoiceNumber: 'INV-2026-0002',
        hsnSummary: '04090000 - Natural Honey (5% GST)',
        taxBreakupJson: JSON.stringify({
          cgstRate: 2.5,
          sgstRate: 2.5,
          cgstAmount: 13.73,
          sgstAmount: 13.72,
          totalTax: 27.45,
        }),
      },
    });

    await prisma.shippingLabel.create({
      data: {
        orderId: order2.id,
        trackingNumber: 'AWB-7729103982',
        courierPartner: 'Delhivery Surface Logistics',
        barcodeData: 'AWB-7729103982',
        qrCodeData: `https://delhivery.com/track/AWB-7729103982`,
        totalWeightGrams: 555,
        isFragileGlass: false,
        handlingInstructions: 'STANDARD HANDLING - NON-FRAGILE',
        labelFormat: '4x6_THERMAL',
      },
    });
  }

  console.log('✅ Database Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

