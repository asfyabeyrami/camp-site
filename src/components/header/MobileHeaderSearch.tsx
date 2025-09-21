"use client";
import { useState, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
type ProductSearchResult = { id: string; name: string; slug: string };
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function MobileHeaderSearch() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [searchFocus, setSearchFocus] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!search.trim().length) return setResults([]);
    const timer = setTimeout(() => {
      fetch(
        `${NEXT_PUBLIC_BASE_URL}/product/sort?search=${encodeURIComponent(
          search
        )}`
      )
        .then((r) => r.json())
        .then((d) => setResults(d?.data || []));
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim().length > 0) {
      router.push(`/search/${encodeURIComponent(search.trim())}`);
      setSearch("");
      setResults([]);
    }
  };

  return (
    <div className="block lg:hidden flex-1 w-full relative ">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setSearchFocus(true)}
        onBlur={() => setTimeout(() => setSearchFocus(false), 180)}
        className="w-full h-[40px] rounded-xl bg-gray-100 px-5 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 font-medium transition"
        placeholder="جستجو در محصولات"
      />
      {/* دکمه جستجو */}
      <button
        type="button"
        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 px-3 py-1 bg-rose-600 text-white rounded-lg flex items-center"
        onClick={() => {
          if (search.trim().length > 0) {
            router.push(`/search/${encodeURIComponent(search.trim())}`);
            setSearch("");
            setResults([]);
          }
        }}
      >
        جستجو
      </button>
      {/* نتایج پیشنهادی */}
      {searchFocus && results.length > 0 && (
        <div className="absolute top-full w-full bg-white shadow-xl mt-1 rounded-lg py-2 z-40 max-h-60 overflow-y-auto animate-fadeIn border border-gray-100">
          {results.map((item, idx) => (
            <div
              key={item.id + idx}
              onMouseDown={() => {
                setSearch("");
                setResults([]);
                router.push(`/product/${item.slug}`);
              }}
              className="px-4 py-2 hover:bg-rose-50 text-right cursor-pointer truncate"
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
      {/* اگر نتیجه‌ای نیست*/}
      {searchFocus && search.trim().length > 0 && results.length === 0 && (
        <div className="absolute top-full w-full bg-white shadow-xl mt-1 rounded-lg py-3 z-40 text-gray-400 text-sm text-center border border-gray-100">
          نتیجه‌ای یافت نشد.
        </div>
      )}
    </div>
  );
}
