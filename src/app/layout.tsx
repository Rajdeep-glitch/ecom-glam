import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import CartDrawer from '@/components/storefront/CartDrawer';

export const metadata: Metadata = {
  title: 'Royal Nectar Apiaries | 100% Raw Artisanal Honey D2C',
  description:
    'Bespoke multilingual storefront featuring 16+ rare honey varieties, 2x2 Glass/PET and 500g/1kg variant matrix, and NMR lab certified purity.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased selection:bg-amber-200 selection:text-amber-950">
        <StoreProvider>
          {children}
          <CartDrawer />
        </StoreProvider>
      </body>
    </html>
  );
}
