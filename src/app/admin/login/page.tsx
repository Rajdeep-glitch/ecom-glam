'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@artisanalhoney.com');
  const [password, setPassword] = useState('AdminPassword123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const setRoleDemo = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-950 to-stone-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full rounded-[2.5rem] glass-card-dark border border-amber-400/30 p-8 sm:p-10 shadow-2xl relative z-10 backdrop-blur-2xl">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-3">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-white flex items-center justify-center text-3xl shadow-xl shadow-amber-600/40">
              🍯
            </div>
            <div className="absolute inset-0 rounded-3xl bg-amber-400/30 blur-md -z-10" />
          </div>
          <h1 className="text-2xl font-serif font-black text-amber-200">
            Seller Central Portal
          </h1>
          <p className="text-xs text-amber-300/70 mt-1">
            Artisanal Honey D2C Operations & Command Suite
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-amber-200/80 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs text-white bg-white/5 focus:bg-white/10 shadow-inner"
                placeholder="admin@artisanalhoney.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-amber-200/80 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs text-white bg-white/5 focus:bg-white/10 shadow-inner"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white font-black text-xs transition-all shadow-xl shadow-amber-600/30 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 shimmer-button"
          >
            {loading ? 'Authenticating Command Access...' : 'Sign In to Seller Central'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-amber-500/20">
          <div className="text-[10px] text-amber-300/60 font-mono font-bold mb-3 text-center uppercase tracking-widest">
            1-Click Demo Access
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setRoleDemo('admin@artisanalhoney.com', 'AdminPassword123!')}
              className="p-3 rounded-2xl border border-amber-500/30 bg-white/5 hover:bg-white/10 text-left text-xs transition-all"
            >
              <div className="font-bold text-amber-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Super Admin
              </div>
              <div className="text-[10px] text-amber-300/60 truncate mt-0.5">admin@artisanalhoney.com</div>
            </button>

            <button
              type="button"
              onClick={() => setRoleDemo('dispatch@artisanalhoney.com', 'StaffPassword123!')}
              className="p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-left text-xs transition-all"
            >
              <div className="font-bold text-stone-200">Dispatch Staff</div>
              <div className="text-[10px] text-stone-400 truncate mt-0.5">dispatch@artisanalhoney.com</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
