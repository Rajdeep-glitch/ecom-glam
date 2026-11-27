import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = {
  title: 'Amazon Seller Central Suite | Artisanal Honey D2C',
  description: 'Operations command suite for artisanal and commercial honey store.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}

