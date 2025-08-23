import { Product } from "@/types/type";
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function getSaleProducts(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${NEXT_PUBLIC_BASE_URL}/product/sort?take=12&tagId=d3aafab9-df68-4c07-9caf-99da6f3b50e5`,
      { next: { revalidate: 60 } }
    );
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}
