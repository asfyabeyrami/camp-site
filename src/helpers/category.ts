import { Category } from "@/components/CategorySlider";

interface RawCategory {
  id: string;
  title: string;
  slug: string;
  fatherId: string | null;
  mediaOnCat?: {
    media?: {
      url: string;
    };
  }[];
}
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${NEXT_PUBLIC_BASE_URL}/category/getAllCategory`, {
      headers: { accept: "*/*" },
    });
    const data = await res.json();
    const root =
      (data?.data as RawCategory[])?.filter((c) => c.fatherId === null) || [];

    return root.map((cat) => ({
      id: cat.id,
      title: cat.title,
      slug: cat.slug,
      image: cat.mediaOnCat?.[0]?.media?.url
        ? `${NEXT_PUBLIC_BASE_URL}/media/${cat.mediaOnCat[0].media.url}`
        : "/no-category.png",
    }));
  } catch {
    return [];
  }
}
// next: { revalidate: 3600 }
