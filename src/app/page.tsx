import BannerSlider from "@/components/BannerSlider";
import CategorySlider from "@/components/CategorySlider";
import Footer from "@/components/Footer";
import SaleProductsSlider from "@/components/SaleProductsSlider";
import TriplePromoBanners from "@/components/TriplePromoBanners";

import HomeHeader from "@/components/header/HomeHeader";
import { getCategories } from "@/helpers/category";
import { getSaleProducts } from "@/helpers/product";

export default async function Home() {
  const [categories, saleProducts] = await Promise.all([
    getCategories(),
    getSaleProducts(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <HomeHeader />

      <main className="flex-grow w-full mx-auto flex flex-col items-center">
        <BannerSlider />

        {/* اسلایدر دسته‌بندی */}
        {categories.length > 0 && <CategorySlider categories={categories} />}
        <section className="relative w-full rounded-md border border-gray-200 py-6 max-w-7xl mx-auto">
          <div className="rounded-3xl py-8 px-6 flex flex-col items-center text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black mb-2 drop-shadow-lg">
              <p>فروشگاه</p>
              <p className="text-rose-600 py-6">کوه نگار</p>
            </h1>
            <p className="text-md sm:text-lg md:text-xl text-black/90 font-medium leading-relaxed">
              ارائه‌دهنده بهترین و متنوع‌ترین ..............
            </p>
          </div>
        </section>

        {/* محصولات ویژه */}
        {saleProducts.length > 0 && (
          <>
            <SaleProductsSlider title="اسنوهاک" products={saleProducts} />
            <TriplePromoBanners />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
