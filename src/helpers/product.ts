import { Product } from "@/types/type";
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function getSaleProducts(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${NEXT_PUBLIC_BASE_URL}/product/sort?categoryId=bd571c5c-8455-4646-9a85-e8941986b644`,
      { next: { revalidate: 60 } }
    );
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}
