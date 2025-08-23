"use client";
export const dynamic = "force-dynamic";

import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

type Category = {
  id: string;
  title: string;
  slug: string;
  children?: Category[];
};

export default function MobileDrawer({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  /* --------------------------- استِیت‌ها --------------------------- */
  const [categories, setCategories] = useState<Category[]>([]);
  const [activePath, setActivePath] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const router = useRouter();

  /* ------------------- بررسی توکن (یک بار در mount) ------------------ */
  useEffect(() => {
    setIsAuthenticated(!!Cookies.get("token"));
  }, []);

  /* ------------- زمانی که دراور باز شد، دیتا را بگیر ---------------- */
  useEffect(() => {
    if (open && !categories.length) {
      setIsLoading(true);
      fetch(`${NEXT_PUBLIC_BASE_URL}/category`)
        .then((r) => r.json())
        .then((d) => {
          setCategories(d.data || []);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }

    // بروز‌سازی مجدد وضعیت لاگین برای تب‌های دیگر
    if (open) setIsAuthenticated(!!Cookies.get("token"));
  }, [open, categories.length]);

  /* --------------------------- توابع کمکی --------------------------- */
  const handleLogout = () => {
    Cookies.remove("token");
    setIsAuthenticated(false);
    setOpen(false);
    setActivePath([]);
    router.push("/");
  };

  const getCurrentCategories = (level: number): Category[] => {
    if (level === 0) return categories;
    let cur = categories;
    for (let i = 0; i < level; i++) {
      const idx = activePath[i];
      if (idx === undefined || !cur[idx]?.children) return [];
      cur = cur[idx].children!;
    }
    return cur;
  };

  const handleCategoryClick = (level: number, index: number) => {
    const curCats = getCurrentCategories(level);
    const cat = curCats[index];

    if (cat.children?.length) {
      const newPath = activePath.slice(0, level);
      newPath[level] = index;
      setActivePath(newPath);
    } else {
      setOpen(false);
      setActivePath([]);
      router.push(`/${cat.slug}`);
    }
  };

  const goBack = (level: number) => setActivePath(activePath.slice(0, level));

  /* ------------------------ آیتم‌های منو سایت ----------------------- */
  const orderTrackingHref = isAuthenticated
    ? "/orders"
    : "/auth?redirect=/orders";
  const menuItems = [
    { title: "پیگیری سفارشات", href: orderTrackingHref },
    { title: "حساب کاربری", href: "#" },
    { title: "درباره ما", href: "#" },
    { title: "تماس با ما", href: "#" },
  ];

  /* ------------------- رندر هر لِیول از دسته‌بندی ------------------- */
  const renderCategoryLevel = (level: number) => {
    const list = getCurrentCategories(level);

    return (
      <div
        key={level}
        /* اضافه شدن overflow-y-auto! */
        className={`
          absolute inset-0 bg-white overflow-y-auto
          transition-transform duration-300
          z-[${30 + level}]
          ${activePath.length === level ? "translate-x-0" : "translate-x-full"}
          p-0 pt-14
        `}
      >
        {/* دکمهٔ بازگشت برای سطوح بالاتر */}
        {level > 0 && (
          <div className="sticky top-0 z-20 bg-white border-b border-rose-50">
            <button
              onClick={() => goBack(level - 1)}
              className="flex items-center gap-1 w-full px-4 py-3 text-rose-500 text-base border-b border-rose-50 font-semibold hover:bg-rose-50 rounded-t transition"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              <span>بازگشت به قبل</span>
            </button>
          </div>
        )}

        <div className="flex flex-col px-2 py-2">
          {list.map((cat, i) => (
            <div
              key={cat.id}
              className="w-full flex items-center justify-between py-3 px-4 my-1 rounded-xl
                         bg-rose-50/20 hover:bg-rose-50 transition
                         text-[16px] font-medium text-gray-800 hover:text-rose-600
                         shadow-[0_1px_3px_0_rgba(245,56,99,0.04)]
                         border border-transparent hover:border-rose-100"
            >
              {/* کلیک روی اسم دسته -> رفتن به صفحهٔ دسته */}
              <button
                type="button"
                className="flex-1 text-right bg-transparent outline-none"
                onClick={() => {
                  setOpen(false);
                  setActivePath([]);
                  router.push(`/${cat.slug}`);
                }}
              >
                {cat.title}
              </button>

              {/* اگر زیرمجموعه دارد آیکون باز کردن */}
              {cat.children?.length && (
                <button
                  type="button"
                  aria-label="نمایش زیرمجموعه"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick(level, i);
                  }}
                  className="ml-2 flex-shrink-0 bg-white rounded-full p-1 hover:bg-rose-100 transition"
                >
                  <ChevronDownIcon className="w-5 h-5 text-rose-300" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* =================================================================== */
  /* ========================= رندر دراور ============================== */
  /* =================================================================== */

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className={`
        fixed inset-0 z-[9999] bg-black/30 transition-all duration-300
        ${open ? "visible opacity-100" : "invisible opacity-0"}
      `}
      onClick={() => {
        setOpen(false);
        setActivePath([]);
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          fixed top-0 right-0 h-full w-[90vw] max-w-[340px]
          bg-white rounded-s-2xl shadow-2xl
          transition-transform duration-300
          ${open ? "translate-x-0" : "translate-x-full"}
          flex flex-col
        `}
      >
        {/* ------------------------- هِدِر ------------------------- */}
        <div className="sticky top-0 z-20 bg-rose-50/20 border-b border-rose-100 flex items-center justify-between h-14 px-4">
          <span className="font-bold text-gray-800 text-xl">منوی سایت</span>
          <button
            aria-label="بستن"
            onClick={() => {
              setOpen(false);
              setActivePath([]);
            }}
            className="rounded-full p-1 hover:bg-rose-100 transition"
          >
            <XMarkIcon className="w-7 h-7 text-rose-400" />
          </button>
        </div>

        {/* ------------------------- بدنه ------------------------- */}
        <div className="pt-2 flex-1 overflow-y-auto flex flex-col gap-5">
          {/* ---------- بخش دسته‌بندی‌ها ---------- */}
          <div className="px-2">
            <div className="font-semibold text-gray-500 px-2 mb-2 pb-1 border-b border-rose-50/70 text-base">
              <span className="text-rose-400 font-bold">دسته‌بندی‌ها</span>
            </div>

            {/* کانتینر محدودشونده با overflow-hidden  */}
            <div className="relative h-[260px] overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center h-full text-gray-300">
                  در حال بارگذاری...
                </div>
              ) : categories.length ? (
                <>
                  {renderCategoryLevel(0)}
                  {renderCategoryLevel(1)}
                  {renderCategoryLevel(2)}
                </>
              ) : (
                <div className="flex justify-center items-center h-full text-gray-300">
                  دسته‌ای یافت نشد
                </div>
              )}
            </div>
          </div>

          {/* ---------- بخش منوی سایت ---------- */}
          <div className="px-2 pb-5">
            <div className="font-semibold text-gray-500 px-2 mb-2 pb-1 border-b border-rose-50/70 text-base">
              <span className="text-rose-400 font-bold">منو سایت</span>
            </div>

            <div className="flex flex-col gap-0.5">
              {menuItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => {
                    setOpen(false);
                    setActivePath([]);
                  }}
                  className="block py-3 px-4 rounded-xl text-gray-700 text-[16px] font-medium hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* -------------- دکمهٔ ورود / خروج پایین دراور -------------- */}
        <div className="p-4 border-t border-rose-50">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-white bg-rose-500 hover:bg-rose-600 shadow-lg text-lg transition"
            >
              خروج از حساب
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setActivePath([]);
                router.push("/auth");
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-white bg-rose-500 hover:bg-rose-600 shadow-lg text-lg transition"
            >
              {/* آیکون کاربر */}
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="w-6 h-6 text-white"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a6 6 0 00-4.472 9.901c.146.166.31.318.492.454A6.968 6.968 0 003 17.5a1 1 0 002 .056 5 5 0 018 0 1 1 0 002-.056A6.967 6.967 0 0013.98 12.355c.183-.137.346-.29.493-.454A6 6 0 0010 2zm0 2a4 4 0 110 8 4 4 0 010-8z"
                  fill="currentColor"
                />
              </svg>
              ورود / ثبت‌نام
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
