import ProductGridWithFilters from "@/components/category/ProductGridWithFilters";
import Footer from "@/components/Footer";
import Header from "@/components/header/Header";
import dynamic from "next/dynamic";
import Link from "next/link";

import ProductCard from "@/components/category/ProductCard";
import type {
  CategoryRes,
  Media,
  Product,
  ProductListResponse,
} from "@/types/type";
import { CommentSection } from "@/components/comments/CommentSection";
import { notFound } from "next/navigation";
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

function buildProductSchema(
  product: Product,
  finalPrice: number,
  images: { src: string }[]
) {
  const priceIRR = finalPrice * 10; // تبدیل تومان به ریال
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: images.length ? images.map((img) => img.src) : undefined,
    description: product.description?.text,
    sku: product.code,
    brand: {
      "@type": "Brand",
      name: "کوه نگار",
    },
    offers: {
      "@type": "Offer",
      price: priceIRR,
      priceCurrency: "IRR",
      availability: product.isAvailable
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      ...(product.count ? { inventoryLevel: product.count } : {}),
    },
  };
}
function buildCategorySchema(category: CategoryRes, products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.title,
    description: category.description,
    url: `https://pooladmotor.com/${category.slug}`,
    hasPart: products.slice(0, 20).map((product) => ({
      "@type": "Product",
      name: product.name,
      image: product.media_item?.[0]?.media?.url
        ? product.media_item[0].media.url.startsWith("http")
          ? product.media_item[0].media.url
          : `${NEXT_PUBLIC_BASE_URL}/media/${product.media_item[0].media.url}`
        : undefined,
      sku: product.code,
      url: `https://pooladmotor.com/${product.slug}`,
      offers: {
        "@type": "Offer",
        price: Number(product.price) * 10,
        priceCurrency: "IRR",
        availability: product.isAvailable
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        ...(product.count ? { inventoryLevel: product.count } : {}),
      },
    })),
  };
}

// -- Helpers
function stringVal(
  input: string | { text: string } | undefined | null
): string {
  if (typeof input === "string") return input;
  if (input && typeof (input as { text?: unknown }).text === "string")
    return (input as { text: string }).text;
  return "";
}

const ProductGallery = dynamic(() =>
  import("@/components/product/Gallery").then((mod) => mod.ProductGallery)
);
const AddToCartButton = dynamic(
  () => import("@/components/add-card/AddToCartButton")
);
const ProductMobileBottomBar = dynamic(
  () => import("@/components/add-card/ProductMobileBottomBar")
);

async function getCategory(slug: string): Promise<CategoryRes | null> {
  const res = await fetch(`${NEXT_PUBLIC_BASE_URL}/category/slug/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const { data } = await res.json();
  return data as CategoryRes;
}

async function getAllCategories(): Promise<CategoryRes[]> {
  const res = await fetch(`${NEXT_PUBLIC_BASE_URL}/category`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const { data } = await res.json();
  return Array.isArray(data) ? (data as CategoryRes[]) : [];
}

function flattenCategories(categories: CategoryRes[]): CategoryRes[] {
  const flat: CategoryRes[] = [];
  function recur(cats: CategoryRes[]) {
    for (const cat of cats) {
      flat.push(cat);
      if (Array.isArray(cat.children) && cat.children.length > 0) {
        recur(cat.children);
      }
    }
  }
  recur(categories);
  return flat;
}
function buildCategoryPath(
  allCats: CategoryRes[],
  cat: CategoryRes
): CategoryRes[] {
  const path: CategoryRes[] = [];
  let current: CategoryRes | undefined = cat;
  while (current) {
    path.unshift(current);
    current = current.fatherId
      ? allCats.find((c) => c.id === current!.fatherId)
      : undefined;
  }
  return path;
}

// برای محصول
async function getProductBySlug(slug: string): Promise<Product | null> {
  const url = `${NEXT_PUBLIC_BASE_URL}/product/sort?slug=${slug}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.data || !Array.isArray(data.data) || !data.data[0]) return null;
  return data.data[0] as Product;
}
function getMediaUrl(media: Media): string {
  if (!media?.url) return "";
  if (media.url.startsWith("http")) return media.url;
  return `${NEXT_PUBLIC_BASE_URL}/media/${media.url}`;
}
async function getRelatedProducts(
  categoryIds: string[],
  currentProductId: string
): Promise<Product[]> {
  if (!categoryIds.length) return [];
  const promises = categoryIds.map((catId) =>
    fetch(`${NEXT_PUBLIC_BASE_URL}/product/sort?take=15&categoryId=${catId}`, {
      next: { revalidate: 60 },
    }).then(
      (resp) =>
        (resp.ok ? resp.json() : { data: [] }) as Promise<ProductListResponse>
    )
  );
  const results = await Promise.all(promises);
  const merged: Product[] = results.flatMap((r) => r.data ?? []);
  const related = merged.filter((p) => p.id !== currentProductId);
  // حذف تکراری‌ها
  const uniqueRelated: Product[] = [];
  const seenIds = new Set();
  for (const prod of related) {
    if (!seenIds.has(prod.id)) {
      seenIds.add(prod.id);
      uniqueRelated.push(prod);
    }
  }
  return uniqueRelated;
}

// محصولات دسته برای SSR اولیه
async function getProducts({ categoryId }: { categoryId: string }) {
  const url = `${NEXT_PUBLIC_BASE_URL}/product/sort?categoryId=${categoryId}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const { data } = await res.json();
  if (!Array.isArray(data)) return [];
  return data;
}

// Metadata = سئو بهبود یافته
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (product) {
    const metaTitle =
      stringVal(product.metaTitle) ||
      stringVal(product.ogTitle) ||
      stringVal(product.name) ||
      "محصول";
    const metaDescription =
      stringVal(product.metaDescription) ||
      stringVal(product.ogDescription) ||
      stringVal(product.description?.text) ||
      "";
    const canonicalUrl = stringVal(product.canonicalUrl) || `/${slug}`;
    const ogImages =
      Array.isArray(product.media_item) && product.media_item.length > 0
        ? product.media_item
            .filter((item) => item.media && item.media.url)
            .map((item) => ({
              url: item.media.url.startsWith("http")
                ? item.media.url
                : `${NEXT_PUBLIC_BASE_URL}/media/${item.media.url}`,
              alt: item.alt || product.name,
            }))
        : [];
    return {
      title: metaTitle,
      description: metaDescription,
      openGraph: {
        title: stringVal(product.ogTitle) || metaTitle,
        description: stringVal(product.ogDescription) || metaDescription,
        type: "website",
        url: canonicalUrl,
        images: ogImages,
      },
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  const category = await getCategory(slug);
  if (category) {
    const metaTitle =
      stringVal(category.metaTitle) ||
      stringVal(category.ogTitle) ||
      stringVal(category.title) ||
      "دسته بندی";
    const metaDescription =
      stringVal(category.metaDescription) ||
      stringVal(category.ogDescription) ||
      stringVal(category.description) ||
      "";
    const canonicalUrl = stringVal(category.canonicalUrl) || `/${slug}`;
    // OpenGraph Image
    const ogImage =
      category.structuredData && category.structuredData.image
        ? Array.isArray(category.structuredData.image)
          ? category.structuredData.image.map((url: string) => ({ url }))
          : [{ url: category.structuredData.image }]
        : undefined;
    return {
      title: metaTitle,
      description: metaDescription,
      openGraph: {
        title: stringVal(category.ogTitle) || metaTitle,
        description: stringVal(category.ogDescription) || metaDescription,
        type: "website",
        url: canonicalUrl,
        images: ogImage,
      },
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  return {
    title: "محصول یا دسته مورد نظر یافت نشد",
    description: "اطلاعاتی یافت نشد",
  };
}

// ---- MAIN PAGE ----
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // اول بررسی کن دسته هست؟
  const category = await getCategory(slug);
  if (!category || !category.title || Object.keys(category).length === 0) {
    notFound();
  }

  if (category) {
    const nestedCategories = await getAllCategories();
    const allCategories = flattenCategories(nestedCategories);
    const path = buildCategoryPath(allCategories, category);
    const initialProducts = await getProducts({ categoryId: category.id });
    const descriptionText = stringVal(category.description);

    // SEO Structred Data: Breadcrumbs
    const breadcrumbStructured = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "خانه",
          item: "https://pooladmotor.com/",
        },
        ...path.map((item, i) => ({
          "@type": "ListItem",
          position: i + 2,
          name: stringVal(item.title),
          item: `https://pooladmotor.com/${encodeURIComponent(
            stringVal(item.slug)
          )}`,
        })),
      ],
    };
    const categorySchema = buildCategorySchema(category, initialProducts);
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow flex flex-col items-center px-1 md:px-4 xl:px-6 py-8">
          <div className="w-full max-w-[1700px] mx-auto">
            {/* STRUCTURED DATA FOR BREADCRUMB */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(breadcrumbStructured),
              }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(categorySchema),
              }}
            />
            {/* Breadcrumb */}
            <nav className="mb-4 px-4 text-sm font-semibold text-gray-600 flex flex-row gap-1 items-center">
              <Link href="/">خانه</Link>
              <span className="mx-1 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 18 18"
                >
                  <path
                    d="M11.75 14.25L6.25 9L11.75 3.75"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {path.map((cat, idx) =>
                idx !== path.length - 1 ? (
                  <span key={cat.id} className="flex items-center">
                    <Link
                      href={`/${encodeURIComponent(stringVal(cat.slug))}`}
                      className="hover:text-rose-500 transition"
                    >
                      {stringVal(cat.title)}
                    </Link>
                    <span className="mx-1">
                      <span className="mx-1 text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          fill="none"
                          viewBox="0 0 18 18"
                        >
                          <path
                            d="M11.75 14.25L6.25 9L11.75 3.75"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </span>
                  </span>
                ) : (
                  <span key={cat.id} className="text-rose-600">
                    {stringVal(cat.title)}
                  </span>
                )
              )}
            </nav>
            <section className="mb-6 px-4">
              <h1 className="font-extrabold text-2xl md:text-3xl mb-3 text-rose-600">
                {category?.title ? `${stringVal(category.title)}` : ""}
              </h1>
            </section>
            <ProductGridWithFilters
              categoryId={category.id}
              initialProducts={initialProducts}
            />
            {/* توضیحات دسته */}
            {descriptionText && descriptionText.trim().length > 0 && (
              <section className="w-full max-w-[1700px] mx-auto bg-white rounded-2xl px-4 py-6 flex flex-col gap-8 ">
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-gray-700 text-base leading-relaxed pb-10">
                  <h3 className="font-bold text-lg text-gray-800 mb-5 mt-5 mr-4 ml-4">
                    توضیحات
                  </h3>
                  <div
                    className="text-[#888888] leading-[2.2] mx-4"
                    dangerouslySetInnerHTML={{ __html: descriptionText }}
                  />
                </div>
              </section>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // اگر دسته نبود: حالا محصول رو بگیر!
  const product = await getProductBySlug(slug);

  if (!product || !product.name || Object.keys(product).length === 0) {
    notFound();
  }
  if (product) {
    const off = Number(product.off) || 0;
    const price = Number(product.price) || 0;
    const finalPrice = price - Math.floor((price * off) / 100);
    // ساخت تصاویر اصلی گالری محصول (remote: placeholder=empty)
    const images =
      product.media_item?.map((mi) => ({
        src: getMediaUrl(mi.media),
        alt: mi.alt || product.name,
        width: 800,
        height: 800,
        // blurDataURL: mi.media.blurDataURL // اگر داری بگذار
      })) || [];

    // SEO STRUCTURED DATA: breadcrumb and product
    const firstCat =
      product.CategoriesOnProduct && product.CategoriesOnProduct[0]
        ? product.CategoriesOnProduct[0].category
        : null;
    const breadcrumbStructured = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "خانه",
          item: "https://pooladmotor.com/",
        },
        ...(firstCat
          ? [
              {
                "@type": "ListItem",
                position: 2,
                name: stringVal(firstCat.title),
                item: `https://pooladmotor.com/${firstCat.slug}`,
              },
            ]
          : []),
        {
          "@type": "ListItem",
          position: firstCat ? 3 : 2,
          name: product.name,
          item: `https://pooladmotor.com/${product.slug}`,
        },
      ],
    };

    const productSchema = buildProductSchema(product, finalPrice, images);

    const categoryIds = product.CategoriesOnProduct.map((c) => c.categoryId);
    const relatedProducts = await getRelatedProducts(categoryIds, product.id);

    const featuresFromData =
      Array.isArray(product.Feature) && product.Feature.length ? (
        <aside className="w-full lg:w-[440px] flex flex-col relative">
          <h2 className="font-bold text-lg text-gray-800 mb-5">ویژگی‌ها</h2>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
            {product.Feature.map((f) =>
              f.FeatureValue.length === 0
                ? null
                : f.FeatureValue.map((fv) => (
                    <div
                      key={fv.id}
                      className="bg-[#f5f6fa] rounded-xl px-4 py-3 flex flex-col justify-center min-h-[56px]"
                    >
                      <span className="text-xs text-[#999999] font-bold mb-2">
                        {f.feature}
                      </span>
                      <span className="text-sm truncate">
                        {fv.name}
                        {fv.Length &&
                          ` | طول: ${fv.Length.value}${fv.Length.unit}`}
                        {fv.Width &&
                          ` | عرض: ${fv.Width.value}${fv.Width.unit}`}
                        {fv.Height &&
                          ` | ارتفاع: ${fv.Height.value}${fv.Height.unit}`}
                      </span>
                    </div>
                  ))
            )}
          </div>
        </aside>
      ) : null;

    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow flex flex-col items-center px-1 md:px-4 xl:px-6 py-8">
          <h1 className="sr-only">{product.name}</h1>

          {/* STRUCTURED DATA FOR BREADCRUMB + PRODUCT */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(breadcrumbStructured),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(productSchema),
            }}
          />
          <section className="w-full max-w-7xl mx-auto bg-white rounded-2xl px-7 py-6 flex flex-col gap-8">
            <nav className="flex items-center text-xs sm:text-sm gap-1 font-medium text-gray-500">
              <Link href="/" className="hover:underline shrink-0">
                خانه
              </Link>
              {(product.CategoriesOnProduct || []).map((c) => (
                <span
                  key={c.category.id}
                  className="flex items-center gap-1 shrink-0"
                >
                  <span className="mx-1 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="none"
                      viewBox="0 0 18 18"
                    >
                      <path
                        d="M11.75 14.25L6.25 9L11.75 3.75"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <Link
                    href={`/${c.category.slug}`}
                    className="hover:underline text-rose-600"
                  >
                    {c.category.title}
                  </Link>
                </span>
              ))}
            </nav>
            <div className="w-full flex flex-col md:flex-row gap-7 items-stretch">
              {/* موبایل */}
              <div className="block md:hidden w-full">
                <div className="flex flex-col">
                  <div className="w-full flex justify-center mb-3">
                    <ProductGallery images={images} alt={product.name} />
                  </div>
                  <span className="text-base font-bold text-right text-black leading-7 mb-1 px-2">
                    {product.name}
                  </span>
                  <div className="text-xs text-slate-600 mt-2 text-right flex flex-col gap-1">
                    <span>
                      کد کالا: <b>{product.code}</b>
                    </span>
                    {featuresFromData}
                  </div>
                </div>
              </div>
              {/* دسکتاپ */}
              <div className="hidden md:flex flex-1 flex-row gap-10 border border-gray-200 rounded-2xl">
                <div className="w-[340px] flex flex-col items-center justify-start flex-shrink-0">
                  <ProductGallery images={images} alt={product.name} />
                </div>
                <div className="flex-1 flex flex-col justify-start mt-6">
                  <span className="text-black text-2xl mt-1 mb-6 text-right">
                    {product.name}
                  </span>
                  <div className="flex flex-row flex-wrap items-center text-xs sm:text-sm gap-3 text-slate-500 mb-6">
                    <span>
                      کد کالا: <b>{product.code}</b>
                    </span>
                  </div>
                  {featuresFromData}
                </div>
              </div>
              {/* سایدبار فروشنده و قیمت و دکمه (دسکتاپ) */}
              <aside className="w-full lg:w-[330px] hidden md:block">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-10 lg:sticky lg:top-6">
                  {/* فروشنده و نمادها */}
                  <div className="rounded-xl bg-gray-50 border border-gray-100 py-3 px-4 flex flex-col gap-2">
                    <div className="flex gap-2 items-center justify-between text-sm font-bold text-gray-700">
                      <span>کوه نگار</span>
                    </div>
                    <div className="flex gap-2 items-center justify-between text-sm text-gray-500 pt-2 mb-4 border-t border-gray-100">
                      <svg
                        className="w-5 h-5 text-green-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <circle cx="10" cy="10" r="10" />
                      </svg>
                    </div>
                    <div className="flex gap-2 items-center justify-between mb-4 text-sm text-gray-500">
                      <span>ارزیابی عملکرد:</span>
                      <span>عالی</span>
                    </div>
                  </div>
                  {/* قیمت و تخفیف */}
                  <div className="flex flex-col gap-3 items-end">
                    {off > 0 && (
                      <span className="inline-block bg-rose-100 border border-rose-400 text-rose-600 font-extrabold text-base px-5 py-1 leading-6 rounded-full mb-1">
                        {off.toLocaleString()} درصد تخفیف
                      </span>
                    )}
                    <div className="flex gap-2 items-end">
                      {off > 0 && (
                        <span className="line-through font-bold text-gray-400 text-xl">
                          {price.toLocaleString()}
                          <span className="text-xs ml-1">تومان</span>
                        </span>
                      )}
                      <span className="font-extrabold text-2xl text-rose-600">
                        {finalPrice.toLocaleString()}
                        <span className="text-xs ml-1 font-bold text-gray-700">
                          تومان
                        </span>
                      </span>
                    </div>
                    {product.count && product.isAvailable && (
                      <span className="text-[13px] text-rose-500 mt-1 font-bold flex items-center gap-1">
                        {product.count} عدد در انبار باقی مانده
                      </span>
                    )}
                    {!product.isAvailable && (
                      <span className="text-xs text-rose-400 mt-1 font-bold">
                        ناموجود
                      </span>
                    )}
                  </div>
                  <AddToCartButton
                    product={{
                      id: product.id,
                      name: product.name,
                      price: finalPrice,
                    }}
                    disabled={!product.isAvailable}
                  />
                </div>
              </aside>
            </div>
          </section>
          {product.description.text &&
            product.description.text.trim().length > 0 && (
              <section className="w-full max-w-7xl mx-auto bg-white rounded-2xl px-7 py-6 flex flex-col gap-8 ">
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-gray-700 text-base leading-relaxed pb-10">
                  <h3 className="font-bold text-lg text-gray-800 mb-5 mt-5 mr-4 ml-4">
                    توضیحات محصول
                  </h3>
                  <div
                    className="text-[#888888] leading-[2.2] mx-4"
                    dangerouslySetInnerHTML={{
                      __html: product.description.text,
                    }}
                  />
                </div>
              </section>
            )}
          <section className="w-full max-w-7xl mx-auto bg-white rounded-2xl px-7 py-6 flex flex-col gap-8">
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-5 mt-5 mr-4 ml-4">
                محصولات مرتبط
              </h3>
              {relatedProducts.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  محصول مرتبطی یافت نشد
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {relatedProducts.slice(0, 10).map((rp) => (
                    <ProductCard key={rp.id} product={rp} />
                  ))}
                </div>
              )}
            </div>
          </section>
          <section className="w-full max-w-7xl mx-auto bg-white rounded-2xl px-7 py-6 flex flex-col gap-8">
            <div className="w-full flex flex-col md:flex-row gap-10">
              {/* نظرات */}
              <div className="flex-1 border border-gray-200 rounded-2xl">
                <CommentSection productId={product.id} />
              </div>
              {/* فقط دسکتاپ (باکس خرید چسبیده!) */}
              <aside className="hidden md:block md:w-[320px] lg:w-[330px] shrink-0">
                <div className="sticky top-28 z-10">
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow flex flex-col gap-7">
                    {/* فروشنده و نمادها */}
                    <div className="rounded-xl bg-gray-50 border border-gray-100 py-3 px-4 flex flex-col gap-2">
                      <div className="flex gap-2 items-center justify-between text-sm font-bold text-gray-700">
                        <span>کوه نگار</span>
                      </div>
                      <div className="flex gap-2 items-center justify-between text-sm text-gray-500 pt-2 mb-4 border-t border-gray-100">
                        <svg
                          className="w-5 h-5 text-green-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <circle cx="10" cy="10" r="10" />
                        </svg>
                      </div>
                      <div className="flex gap-2 items-center justify-between mb-4 text-sm text-gray-500">
                        <span>ارزیابی عملکرد:</span>
                        <span>عالی</span>
                      </div>
                    </div>
                    {/* قیمت و تخفیف و دکمه */}
                    <div className="flex flex-col gap-2 items-end mb-2">
                      {off > 0 && (
                        <span className="inline-block bg-rose-100 border border-rose-400 text-rose-600 font-extrabold text-base px-4 py-1 leading-6 rounded-full mb-1">
                          {off.toLocaleString()} درصد تخفیف
                        </span>
                      )}
                      <div className="flex gap-2 items-end mt-1">
                        {off > 0 && (
                          <span className="line-through font-bold text-gray-400 text-lg">
                            {price.toLocaleString()}
                            <span className="text-xs ml-1">تومان</span>
                          </span>
                        )}
                        <span className="font-extrabold text-xl text-rose-600">
                          {finalPrice.toLocaleString()}
                          <span className="text-xs ml-1 font-bold text-gray-700">
                            تومان
                          </span>
                        </span>
                      </div>
                      {product.count && product.isAvailable && (
                        <span className="text-[13px] text-rose-500 mt-1 font-bold flex items-center gap-1">
                          {product.count} عدد در انبار باقی مانده
                        </span>
                      )}
                      {!product.isAvailable && (
                        <span className="text-xs text-rose-400 mt-1 font-bold">
                          ناموجود
                        </span>
                      )}
                    </div>
                    <AddToCartButton
                      product={{
                        id: product.id,
                        name: product.name,
                        price: finalPrice,
                      }}
                      disabled={!product.isAvailable}
                    />
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </main>
        <ProductMobileBottomBar
          id={product.id}
          name={product.name}
          price={finalPrice}
          oldPrice={price}
          off={off}
          available={product.isAvailable}
          count={product.count}
        />
        <Footer />
      </div>
    );
  }
}
