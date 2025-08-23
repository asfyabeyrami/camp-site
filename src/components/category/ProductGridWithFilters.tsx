"use client";
import { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import Switch from "./Switch";
import { Product } from "@/types/type";
type SortField = "price" | "createdAt" | "off";
const SORTS = [
  { label: "جدیدترین", sortBy: "createdAt", order: "desc" },
  { label: "کمترین قیمت", sortBy: "price", order: "asc" },
  { label: "بیشترین قیمت", sortBy: "price", order: "desc" },
  { label: "بیشترین تخفیف", sortBy: "off", order: "desc" },
];
type Filters = {
  isAvailable?: boolean;
  onlyDiscounted?: boolean;
  fastShipping?: boolean;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  networks?: string[];
  sortBy?: string;
  order?: string;
};
type Props = {
  categoryId?: string;
  tagId?: string;
  initialProducts: Product[];
  mode?: "server" | "clientOnly";
};
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

function getSortableField(product: Product, key: string): number | string {
  switch (key) {
    case "price":
      return Number(product.price);
    case "createdAt":
      return (product as Product).createdAt || "";
    case "off":
      return Number(product.off);
    default:
      return "";
  }
}
const PAGE_SIZE = 20;
export default function ProductGridWithFilters({
  categoryId,
  tagId,
  initialProducts,
  mode = "server",
}: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialProducts.length === PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    sortBy: "createdAt",
    order: "desc",
    isAvailable: undefined,
    onlyDiscounted: false,
    fastShipping: false,
    minPrice: undefined,
    maxPrice: undefined,
    color: undefined,
    networks: [],
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const loader = useRef<HTMLDivElement | null>(null);

  // برای ESLint dependencyها
  const networkDeps = (filters.networks || []).join(",");

  // فقط صفحه را ریست کن؛ products و hasMore را دستی پاک نکن!
  useEffect(() => {
    setPage(1);
  }, [
    categoryId,
    tagId,
    filters.sortBy,
    filters.order,
    filters.isAvailable,
    filters.onlyDiscounted,
    filters.fastShipping,
    filters.minPrice,
    filters.maxPrice,
    filters.color,
    networkDeps,
  ]);

  // فچ محصولات (و همزمان مدیریت products/hasMore)
  useEffect(() => {
    let isCancel = false;
    async function fetchProducts() {
      setLoading(true);
      const url = new URL(`${NEXT_PUBLIC_BASE_URL}/product/sort`);
      if (categoryId) url.searchParams.set("categoryId", categoryId);
      if (tagId) url.searchParams.set("tagId", tagId);
      url.searchParams.set("take", String(PAGE_SIZE));
      url.searchParams.set("skip", String((page - 1) * PAGE_SIZE));
      if (filters.isAvailable !== undefined)
        url.searchParams.set("isAvailable", String(filters.isAvailable));
      if (filters.onlyDiscounted)
        url.searchParams.set("onlyDiscounted", "true");
      if (filters.fastShipping) url.searchParams.set("fastShipping", "true");
      if (filters.minPrice)
        url.searchParams.set("minPrice", String(filters.minPrice));
      if (filters.maxPrice)
        url.searchParams.set("maxPrice", String(filters.maxPrice));
      if (filters.color) url.searchParams.set("color", filters.color);
      if (filters.networks && filters.networks.length > 0)
        url.searchParams.set("networks", filters.networks.join(","));
      if (filters.sortBy) url.searchParams.set("sortBy", filters.sortBy);
      if (filters.order) url.searchParams.set("order", filters.order);
      const res = await fetch(url.toString());
      const json = await res.json();
      const newProducts: Product[] = Array.isArray(json.data) ? json.data : [];
      if (!isCancel) {
        setProducts((prev) => {
          if (page === 1) return newProducts;
          // جلوگیری از محصولات تکراری (id مشابه)
          const uniq = [...prev];
          const prevIds = new Set(prev.map((p) => p.id));
          for (const p of newProducts) {
            if (!prevIds.has(p.id)) uniq.push(p);
          }
          return uniq;
        });
        setHasMore(newProducts.length === PAGE_SIZE);
        setLoading(false);
      }
    }
    fetchProducts();
    return () => {
      isCancel = true;
    };
  }, [
    page,
    categoryId,
    tagId,
    filters.sortBy,
    filters.order,
    filters.isAvailable,
    filters.onlyDiscounted,
    filters.fastShipping,
    filters.minPrice,
    filters.maxPrice,
    filters.color,
    networkDeps,
  ]);

  // Infinite scroll trigger
  useEffect(() => {
    if (loading || !hasMore) return;
    const node = loader.current;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );
    if (node) observer.observe(node);
    return () => {
      if (node) observer.unobserve(node);
    };
  }, [loading, hasMore]);

  // فقط حالت clientOnly برای تست (همان روال)
  useEffect(() => {
    if (mode !== "clientOnly") return;
    let filtered = [...initialProducts];
    if (filters.isAvailable !== undefined)
      filtered = filtered.filter(
        (p) => !!p.isAvailable === !!filters.isAvailable
      );
    if (filters.onlyDiscounted)
      filtered = filtered.filter((p) => Number(p.off) > 0);
    if (filters.minPrice)
      filtered = filtered.filter((p) => Number(p.price) >= filters.minPrice!);
    if (filters.maxPrice)
      filtered = filtered.filter((p) => Number(p.price) <= filters.maxPrice!);
    if (filters.sortBy && filters.order) {
      const sortKey = filters.sortBy as SortField;
      filtered.sort((a, b) => {
        const aVal = getSortableField(a, sortKey);
        const bVal = getSortableField(b, sortKey);
        if (filters.order === "asc") return aVal > bVal ? 1 : -1;
        else return aVal < bVal ? 1 : -1;
      });
    }
    setProducts(filtered);
    setHasMore(false);
    setLoading(false);
  }, [
    initialProducts,
    mode,
    filters.isAvailable,
    filters.onlyDiscounted,
    filters.fastShipping,
    filters.minPrice,
    filters.maxPrice,
    filters.color,
    networkDeps,
    filters.sortBy,
    filters.order,
  ]);

  // فیلتر فرم (بدون تغییر)
  const filterForm = (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-base">فیلتر ها</span>
        <button
          type="button"
          className="text-pink-600 text-xs font-bold hover:underline"
          onClick={() =>
            setFilters({
              sortBy: "createdAt",
              order: "desc",
              isAvailable: undefined,
              onlyDiscounted: false,
              fastShipping: false,
              minPrice: undefined,
              maxPrice: undefined,
              color: undefined,
              networks: [],
            })
          }
        >
          حذف فیلتر ها
        </button>
      </div>
      <div className="flex items-center gap-2 mb-3 p-2 bg-pink-100 rounded-lg">
        <Switch
          checked={!!filters.fastShipping}
          onChange={(checked) =>
            setFilters((f) => ({ ...f, fastShipping: checked }))
          }
        />
        <span className="font-semibold flex-1">ارسال سریع</span>
        <svg width="20" height="20" fill="none">
          <g stroke="#d72660" strokeWidth="1" strokeLinecap="round">
            <rect x="1.5" y="5.5" width="10" height="8" rx="1" fill="#fff" />
            <rect x="11.5" y="8.5" width="5" height="5" rx="1" fill="#fff" />
            <circle cx="5.5" cy="14" r="1" fill="#fff" />
            <circle cx="15.5" cy="14" r="1" fill="#fff" />
          </g>
        </svg>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <Switch
          checked={!!filters.isAvailable}
          onChange={(checked) =>
            setFilters((f) => ({
              ...f,
              isAvailable: checked ? true : undefined,
            }))
          }
        />
        فقط کالاهای موجود
      </div>
      <div className="flex items-center gap-2 mb-3">
        <Switch
          checked={!!filters.onlyDiscounted}
          onChange={(checked) =>
            setFilters((f) => ({ ...f, onlyDiscounted: checked }))
          }
        />
        فقط تخفیف‌دار
      </div>
      <span className="flex justify-between items-center w-full font-semibold py-2 px-1 rounded transition">
        محدوده قیمت
      </span>
      <div className="mb-2 px-2 flex items-center gap-2">
        <input
          type="number"
          min={0}
          className="border p-1 rounded text-sm w-20 text-center"
          placeholder="حداقل"
          value={filters.minPrice ?? ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              minPrice: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
        />
        <span className="text-gray-400 text-xs">تا</span>
        <input
          type="number"
          min={0}
          className="border p-1 rounded text-sm w-20 text-center"
          placeholder="حداکثر"
          value={filters.maxPrice ?? ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              maxPrice: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
        />
        <span className="text-gray-400 text-xs">تومان</span>
      </div>
    </div>
  );
  return (
    <div className="flex flex-row gap-4 w-full relative">
      <aside className="w-72 min-w-[260px] shrink-0 bg-white border border-gray-200 rounded-xl p-4 flex-col gap-2 hidden md:flex sticky top-28 h-[480px] max-h-[80vh] overflow-y-auto">
        {filterForm}
      </aside>
      <main className="flex-1">
        <button
          className="fixed left-4 bottom-4 z-40 md:hidden flex items-center gap-2 text-rose-600 px-4 py-2 bg-white border border-rose-200 shadow rounded-lg font-bold"
          onClick={() => setMobileFilterOpen(true)}
        >
          فیلتر
        </button>
        <div className="text-gray-500 text-sm mb-2">
          {loading && products.length === 0
            ? "در حال بارگذاری..."
            : `${products.length} کالا`}
        </div>
        <div className="flex flex-row items-center justify-between mb-8">
          <div className="flex flex-row gap-2">
            {SORTS.map((s) => (
              <button
                key={s.label}
                className={`px-3 py-1 rounded-lg text-sm ${
                  filters.sortBy === s.sortBy && filters.order === s.order
                    ? "bg-rose-600 text-white"
                    : "bg-gray-50 text-gray-600"
                }`}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    sortBy: s.sortBy,
                    order: s.order,
                  }))
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        {products.length === 0 && !loading && (
          <div className="text-gray-400 text-lg py-20 text-center col-span-full">
            هیچ محصولی یافت نشد.
          </div>
        )}
        <section className="bg-white grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-stretch">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </section>
        {/* infinite load trigger & loader text */}
        <div ref={loader} className="w-full flex justify-center py-6">
          {loading && products.length > 0 ? (
            <span className="text-rose-500">در حال بارگذاری بیشتر...</span>
          ) : null}
          {!hasMore && (
            <span className="text-gray-400 text-sm">
              همه محصولات بارگذاری شد.
            </span>
          )}
        </div>
      </main>
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex md:hidden"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md relative mx-auto mt-auto rounded-t-3xl shadow-xl animate-slideup"
            style={{ minHeight: "330px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-6 px-6">
              {filterForm}
              <button
                className="w-full mt-8 py-3 rounded-xl bg-rose-600 text-white font-bold shadow"
                onClick={() => setMobileFilterOpen(false)}
              >
                اعمال فیلتر
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
