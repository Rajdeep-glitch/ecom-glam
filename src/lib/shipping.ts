import { CartItem } from './types';

export const VARIANT_WEIGHT_SPECS = {
  GLASS_JAR: {
    500: { grossWeightGrams: 820, isFragile: true, tare: 320 },
    1000: { grossWeightGrams: 1480, isFragile: true, tare: 480 },
  },
  PET_JAR: {
    500: { grossWeightGrams: 555, isFragile: false, tare: 55 },
    1000: { grossWeightGrams: 1085, isFragile: false, tare: 85 },
  },
} as const;

export interface ShippingCalculation {
  subtotal: number;
  totalGrossWeightGrams: number;
  totalNetWeightGrams: number;
  hasGlassPackaging: boolean;
  fragileHandlingRequired: boolean;
  shippingFee: number;
  estimatedDeliveryDays: number;
  freeShippingQualified: boolean;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
}

export function calculateShippingDetails(
  items: CartItem[],
  freeShippingThreshold = 999
): ShippingCalculation {
  let subtotal = 0;
  let totalGrossWeightGrams = 0;
  let totalNetWeightGrams = 0;
  let hasGlassPackaging = false;

  for (const item of items) {
    const qty = Math.max(1, item.quantity);
    subtotal += item.price * qty;
    totalGrossWeightGrams += (item.grossWeightGrams || 800) * qty;
    totalNetWeightGrams += (item.netWeightGrams || 500) * qty;

    if (item.packagingType === 'GLASS_JAR' || item.isFragile) {
      hasGlassPackaging = true;
    }
  }

  const freeShippingQualified = subtotal >= freeShippingThreshold && items.length > 0;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  let shippingFee = 0;
  if (items.length > 0 && !freeShippingQualified) {
    // Base tier: ₹60 up to 1000g, plus ₹25 per additional 500g
    if (totalGrossWeightGrams <= 1000) {
      shippingFee = 60;
    } else {
      const extraGrams = totalGrossWeightGrams - 1000;
      const extraUnits = Math.ceil(extraGrams / 500);
      shippingFee = 60 + extraUnits * 25;
    }

    // Glass safety packaging surcharge for heavy glass orders (if not free shipping)
    if (hasGlassPackaging && totalGrossWeightGrams > 2000) {
      shippingFee += 20; // Specialized bubble-wrap layer
    }
  }

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalGrossWeightGrams,
    totalNetWeightGrams,
    hasGlassPackaging,
    fragileHandlingRequired: hasGlassPackaging,
    shippingFee: Math.round(shippingFee * 100) / 100,
    estimatedDeliveryDays: hasGlassPackaging ? 3 : 2,
    freeShippingQualified,
    freeShippingThreshold,
    amountNeededForFreeShipping: Math.round(amountNeededForFreeShipping * 100) / 100,
  };
}

