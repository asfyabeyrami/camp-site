"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export type Category = {
  id: string;
  title: string;
  slug: string;
  children?: Category[];
};
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function CategoryDropdown() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoot, setSelectedRoot] = useState<Category | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`${NEXT_PUBLIC_BASE_URL}/category`, {
      headers: { Accept: "*/*" },
    })
      .then((res) => res.json())
      .then((data) => setCategories(data.data || []));
  }, []);

  return (
    <div
      className="relative z-50 select-none"
      onPointerEnter={() => setIsOpen(true)}
      onPointerLeave={() => {
        setIsOpen(false);
        setSelectedRoot(null);
      }}
    >
      {/* دکمه اصلی */}
      <button
        className={clsx(
          "flex items-center gap-1 px-4 py-2 text-base font-bold rounded-xl",
          "border border-transparent",
          isOpen
            ? "bg-rose-50 text-rose-600 shadow ring-2 ring-rose-200"
            : "hover:bg-gray-50 text-gray-800 transition"
        )}
        type="button"
        tabIndex={0}
      >
        <ChevronDownIcon className="w-5 h-5" />
        دسته‌بندی کالاها
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 bg-white w-[850px] min-h-[320px] shadow-lg rounded-xl border border-gray-100 flex overflow-hidden animate-fadeIn">
          {/* ستون راست - دسته‌های اصلی */}
          <div className="w-[210px] max-h-[420px] overflow-y-auto border-l bg-white px-1 py-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => router.push(`/${cat.slug}`)}
                onMouseEnter={() => setSelectedRoot(cat)}
                className={clsx(
                  "flex justify-between items-center px-4 py-2 my-1 rounded-lg cursor-pointer text-sm",
                  selectedRoot?.id === cat.id
                    ? "bg-rose-50 text-rose-600 font-bold shadow-sm"
                    : "hover:bg-gray-50 text-gray-800"
                )}
                tabIndex={0}
                role="button"
              >
                <span>{cat.title}</span>
                {Array.isArray(cat.children) && cat.children.length > 0 && (
                  <ChevronLeftIcon className="w-4 h-4 text-gray-400" />
                )}
              </div>
            ))}
          </div>
          {/* ستون چپ - زیرمجموعه‌ها */}
          <div className="flex-1 bg-white px-7 py-6 overflow-y-auto grid grid-cols-2 gap-5 text-[15px]">
            {selectedRoot?.children?.map((group) => (
              <div key={group.id}>
                <div
                  className="text-rose-600 font-semibold border-b-2 border-rose-400 pb-1 mb-2 text-[15.5px] cursor-pointer hover:bg-rose-50 px-2 rounded transition"
                  onClick={() => router.push(`/${group.slug}`)}
                  tabIndex={0}
                  role="button"
                >
                  {group.title}
                </div>
                <ul className="space-y-1.5">
                  {group.children?.map((sub) => (
                    <li
                      key={sub.id}
                      className="text-gray-600 hover:text-rose-600 cursor-pointer transition-colors px-2 py-1 rounded hover:bg-rose-50 text-[14.5px]"
                      onClick={() => router.push(`/${sub.slug}`)}
                      tabIndex={0}
                      role="button"
                    >
                      {sub.title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
