'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '@/lib/types';
import { calculateShippingDetails, ShippingCalculation } from '@/lib/shipping';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
}

interface StoreContextType {
  lang: string;
  setLang: (code: string) => void;
  direction: 'ltr' | 'rtl';
  languages: LanguageOption[];
  t: (key: string, fallback?: string) => string;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  deliveryLocation: string;
  setDeliveryLocation: (location: string) => void;
  shipping: ShippingCalculation;
  isTranslating: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<string>('en');
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [languages, setLanguages] = useState<LanguageOption[]>([
    { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
  ]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Cart State (persisted in Neon Postgres via /api/cart)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [deliveryLocation, setDeliveryLocationState] = useState<string>('');
  const [sessionLoaded, setSessionLoaded] = useState<boolean>(false);

  // Load languages and stored session (lang / cart / delivery location) from Neon Postgres on mount
  useEffect(() => {
    fetch('/api/languages')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLanguages(data);
        }
      })
      .catch(() => {});

    fetch('/api/cart')
      .then((res) => res.json())
      .then((data) => {
        if (data?.lang) setLangState(data.lang);
        if (Array.isArray(data?.items)) setCart(data.items);
        if (typeof data?.deliveryLocation === 'string') setDeliveryLocationState(data.deliveryLocation);
      })
      .catch(() => {})
      .finally(() => setSessionLoaded(true));
  }, []);

  // Fetch UI translations whenever language changes
  useEffect(() => {
    setIsTranslating(true);
    fetch(`/api/translations?lang=${lang}`)
      .then((res) => res.json())
      .then((data) => {
        setTranslations(data);
        setIsTranslating(false);
      })
      .catch(() => {
        setIsTranslating(false);
      });

    // Update document direction and HTML lang attribute
    const currentLangObj = languages.find((l) => l.code === lang);
    const newDir = currentLangObj?.direction || (lang === 'ar' ? 'rtl' : 'ltr');
    setDirection(newDir);
    document.documentElement.dir = newDir;
    document.documentElement.lang = lang;
  }, [lang, languages]);

  // Save cart changes to Neon Postgres
  useEffect(() => {
    if (!sessionLoaded) return;
    fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart }),
    }).catch(() => {});
  }, [cart, sessionLoaded]);

  const setLang = (code: string) => {
    setLangState(code);
    fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang: code }),
    }).catch(() => {});
  };

  const t = (key: string, fallback?: string): string => {
    return translations[key] || fallback || key;
  };

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.variantId === item.variantId);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
    );
  };

  const removeFromCart = (variantId: string) => {
    setCart((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const setDeliveryLocation = (location: string) => {
    setDeliveryLocationState(location);
    fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveryLocation: location }),
    }).catch(() => {});
  };

  const shipping = calculateShippingDetails(cart);

  return (
    <StoreContext.Provider
      value={{
        lang,
        setLang,
        direction,
        languages,
        t,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        deliveryLocation,
        setDeliveryLocation,
        shipping,
        isTranslating,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

