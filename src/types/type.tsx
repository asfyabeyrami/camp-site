// Product inside basket/cart
export type ProductInBasket = {
  name: string;
  price: number;
};

// آیتم سبد خرید
export type CartItem = {
  id: string;
  basketId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: ProductInBasket;
};

// سبد خرید
export type Cart = {
  items: CartItem[];
};

// جواب افزودن به سبد خرید
export type AddToBasketResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: CartItem;
  timestamp: string;
};
export type OrderResult = {
  orderNumber: string;
  totalAmount: number;
};
export type UserProfileResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: UserProfile;
  timestamp: string;
};

// src/types/checkout.ts
export enum PaymentType {
  ONLINE = "ONLINE",
  CASH_ON_DELIVERY = "CASH_ON_DELIVERY",
  BANK_TRANSFER = "BANK_TRANSFER",
}
export type Province = { id: string; name: string };
export type City = { id: string; provinceId: string; name: string };
export type UserAddress = {
  id: string;
  address: string;
  postalCode: string;
  provinceId?: string;
  cityId?: string;
};
export type UserProfile = {
  id: string;
  name: string;
  lastName: string;
  mobile: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  role: string;
  address: UserAddress[];
};
export type ProductListResponse = { data: Product[] };

export type Dimensions = { value: number; unit: string };
export type Media = { id: string; url: string; type: string };
export type MediaItem = {
  id: string;
  alt?: string;
  description: string;
  media: Media;
};
export type CategoryObj = {
  id: string;
  title: string;
  slug: string;
  fatherId: string | null;
};
export type CategoryOnProduct = {
  productId: string;
  categoryId: string;
  category: CategoryObj;
};
export type Category = {
  id: string;
  title: string;
  slug: string;
  children?: Category[];
  mediaOnCat?: {
    media?: {
      url: string;
      type?: string;
    };
  }[];
};
export type TagObj = { id: string; title: string };
export type TagOnProduct = { productId: string; tagId: string; tag: TagObj };
export type FeatureValue = {
  id: string;
  featureId: string;
  name: string;
  rate?: string;
  Length?: Dimensions;
  Width?: Dimensions;
  Height?: Dimensions;
  stock_quantity?: number;
};
export type Feature = {
  id: string;
  productId: string;
  feature: string;
  FeatureValue: FeatureValue[];
};
export type Delivery = { id: string; name: string };
export type Product = {
  id: string;
  code: number;
  name: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  altText?: string;
  structuredData?: StructuredProductData;
  deliveryId?: string | null;
  isAvailable: boolean;
  count: number;
  price: number;
  off: number;
  description: { text: string };
  createdAt: string;
  updatedAt: string;
  media_item: MediaItem[];
  CategoriesOnProduct: CategoryOnProduct[];
  tagOnProduct: TagOnProduct[];
  Delivery: Delivery;
  Feature: Feature[];
};
export type CategoryRes = {
  id: string;
  title: string | { text: string };
  slug: string;
  description?: string | { text: string };
  metaTitle?: string | { text: string };
  metaDescription?: string | { text: string };
  metaKeywords?: string | { text: string };
  ogTitle?: string | { text: string };
  ogDescription?: string | { text: string };
  canonicalUrl?: string | { text: string };
  fatherId?: string | null;
  children?: CategoryRes[];
  structuredData?: StructuredProductData;
};
export type StructuredProductData = {
  "@context": "https://schema.org/";
  "@type": "Product";
  name: string;
  image: string | string[];
  description: string;
  sku?: string;
  brand?: {
    "@type": "Brand";
    name: string;
  };
  offers?: {
    "@type": "Offer";
    url?: string;
    priceCurrency: string;
    price: number;
    itemCondition?:
      | "https://schema.org/NewCondition"
      | "https://schema.org/UsedCondition";
    availability:
      | "https://schema.org/InStock"
      | "https://schema.org/OutOfStock";
  };
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
  };
  review?: {
    "@type": "Review";
    author: { "@type": "Person"; name: string };
    datePublished: string;
    reviewBody: string;
    name?: string;
    reviewRating: {
      "@type": "Rating";
      ratingValue: number;
    };
  }[];
};
