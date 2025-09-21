"use client";
import { useState, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

type ProductSearchResult = {
  id: string;
  name: string;
  slug: string;
};
const SearchIcon = () => (
  <svg
    className="w-5 h-5 text-white"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
    />
  </svg>
);
export default function ProductSearchBox() {
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
    <div className="relative w-full max-w-lg mx-auto">
      <input
        type="text"
        placeholder="نام محصول، برند، یا کد فنی ..."
        className="w-full h-[48px] rounded-xl bg-gray-100 px-5 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 font-medium transition text-base"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setSearchFocus(true)}
        onBlur={() => setTimeout(() => setSearchFocus(false), 180)}
        autoComplete="off"
        dir="rtl"
      />
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 h-9 bg-rose-600 px-4 py-2 text-white flex items-center gap-2 rounded-xl transition hover:bg-rose-700"
        style={{ direction: "rtl" }}
        onClick={() => {
          if (search.trim().length > 0) {
            router.push(`/search/${encodeURIComponent(search.trim())}`);
            setSearch("");
            setResults([]);
          }
        }}
        type="button"
      >
        <SearchIcon />
        <span className="hidden xs:inline">جستجو</span>
      </button>
      {/* نتایج پیشنهادی */}
      {searchFocus && results.length > 0 && (
        <div className="absolute top-[110%] left-0 w-full bg-white shadow-xl mt-1 rounded-lg py-2 z-40 max-h-60 overflow-y-auto animate-fadeIn border border-gray-100 text-right font-vazir">
          {results.map((item, idx) => (
            <div
              key={item.id + idx}
              onMouseDown={() => {
                setSearch("");
                setResults([]);
                router.push(`product/${item.slug}`);
              }}
              className="px-4 py-2 hover:bg-rose-50 text-right cursor-pointer truncate"
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
      {/* اگر هیچ نتیجه‌ای نیامده */}
      {searchFocus && search.trim().length > 0 && results.length === 0 && (
        <div className="absolute top-[110%] left-0 w-full bg-white shadow-xl mt-1 rounded-lg py-3 z-40 text-gray-400 text-sm text-center border border-gray-100">
          نتیجه‌ای یافت نشد.
        </div>
      )}
    </div>
  );
}
