import ProductGridWithFilters from "@/components/category/ProductGridWithFilters";
import Footer from "@/components/Footer";
import Header from "@/components/header/Header";
import { Product } from "@/types/type";
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// فانکشن گرفتن جدیدترین محصولات/قطعات
async function getLatestProducts(): Promise<Product[]> {
  // از بک‌اند بر اساس بیشترین تاریخ ایجاد شده
  const res = await fetch(
    `${NEXT_PUBLIC_BASE_URL}/product/sort?sortField=createdAt&sortOrder=desc&take=20`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return [];
  const { data } = await res.json();
  if (!Array.isArray(data)) return [];
  return data;
}

// --------- Main Page -----------
export default async function NewsPage() {
  const products = await getLatestProducts();

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center">
          <div className="max-w-2xl m-auto py-20 text-center text-2xl text-gray-400">
            قطعه جدیدی یافت نشد!
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow flex flex-col items-center px-1 md:px-4 xl:px-6 py-8">
        <div className="w-full max-w-[1700px] mx-auto">
          <section className="mb-6 px-4">
            <h1 className="font-extrabold text-2xl md:text-3xl mb-3 text-rose-600">
              جدیدترین ها
            </h1>
          </section>
          <ProductGridWithFilters
            initialProducts={products}
            mode="clientOnly"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
