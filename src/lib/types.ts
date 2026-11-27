export type Role = 'SUPER_ADMIN' | 'OPERATIONS_STAFF' | 'CUSTOMER';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type PackagingType = 'GLASS_JAR' | 'PET_JAR';
export type NetWeightGrams = 500 | 1000;

export interface VariantMatrixItem {
  id?: string;
  packagingType: PackagingType;
  netWeightGrams: NetWeightGrams;
  grossShippingWeightGrams: number;
  isFragile: boolean;
  sku: string;
  mrp: number;
  salePrice: number;
  stockQuantity: number;
  variantImageUrl?: string | null;
  isActive?: boolean;
}

export interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  packagingType: PackagingType;
  netWeightGrams: NetWeightGrams;
  grossWeightGrams: number;
  isFragile: boolean;
  sku: string;
  price: number;
  mrp: number;
  quantity: number;
  imageUrl?: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type PaymentMethod = 'ONLINE_UPI_CARD' | 'COD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

