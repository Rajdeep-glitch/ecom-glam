'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

export default function AdminHeader({ title }: { title?: string }) {
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; email: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser({
            name: 'Vikramaditya Sharma',
            role: 'SUPER_ADMIN',
            email: 'admin@artisanalhoney.com',
          });
        }
      })
      .catch(() => {
        setCurrentUser({
          name: 'Vikramaditya Sharma',
          role: 'SUPER_ADMIN',
          email: 'admin@artisanalhoney.com',
        });
      });
  }, []);

  return (
    <header className="h-18 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl bg-white/70 border-b border-amber-200/60 shadow-xs">
      <div>
        <h2 className="text-lg font-serif font-black text-amber-950">
          {title || 'Seller Central Operational Suite'}
        </h2>
        <p className="text-[11px] text-amber-800/70 font-medium">
          Artisanal Honey D2C Command Center • Single-Vendor Portal
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 glass-pill px-3 py-1.5 rounded-full text-xs text-amber-950 font-bold border border-amber-300/80 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Catalog Synced (16 Categories)</span>
        </div>

        <div className="flex items-center gap-3 pl-3 border-l border-amber-200/80">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-700 to-yellow-600 text-amber-100 flex items-center justify-center font-black text-xs shadow-md">
            {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-amber-950 leading-tight">
              {currentUser?.name || 'Administrator'}
            </div>
            <div className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider">
              {currentUser?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Operations Staff'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
