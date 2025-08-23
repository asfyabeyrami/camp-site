"use client";
import Link from "next/link";
import {
  ShoppingCartIcon,
  XMarkIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

type BasketItem = { id: string; name: string; price: number; quantity: number };

export default function CartButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  function getBasketList() {
    try {
      return JSON.parse(localStorage.getItem("basket") || "[]") as BasketItem[];
    } catch {
      return [];
    }
  }

  const handleCheckout = async () => {
    setError("");
    const token = Cookies.get("token");
    if (!token) {
      window.location.href = "/auth?redirect=/cart";
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${NEXT_PUBLIC_BASE_URL}/card/addToBasket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          products: basket.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });
      if (res.status === 401) {
        window.location.href = "/auth?redirect=/cart";
        return;
      }
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.removeItem("basket");
        window.location.href = "/checkout";
      } else {
        setError(data.message || "خطا در ارسال سبد");
      }
    } catch {
      setError("مشکل در ارتباط با سرور.");
    }
    setLoading(false);
  };

  function getBasketCount(items?: BasketItem[]) {
    const basketList = items || getBasketList();
    return basketList.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
  }

  function totalPrice(items?: BasketItem[]) {
    const basketList = items || getBasketList();
    return basketList.reduce((s, i) => s + i.price * i.quantity, 0);
  }

  // ذخیره و اعلام به سایر کامپوننت ها
  function save(basketList: BasketItem[]) {
    localStorage.setItem("basket", JSON.stringify(basketList));
    window.dispatchEvent(new Event("basket-changed"));
  }

  // حذف آیتم
  function handleRemove(id: string) {
    const newBasket = basket.filter((item) => item.id !== id);
    setBasket(newBasket);
    setCount(getBasketCount(newBasket));
    save(newBasket);
  }

  // کاهش یا افزایش مقدار
  function handleQuantity(id: string, delta: number) {
    const newBasket = basket.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    setBasket(newBasket);
    setCount(getBasketCount(newBasket));
    save(newBasket);
  }

  useEffect(() => {
    function getBasketList() {
      try {
        return JSON.parse(
          localStorage.getItem("basket") || "[]"
        ) as BasketItem[];
      } catch {
        return [];
      }
    }
    function getBasketCount(items?: BasketItem[]) {
      const basketList = items || getBasketList();
      return basketList.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
    }

    const update = () => {
      const basketList = getBasketList();
      setBasket(basketList);
      setCount(getBasketCount(basketList));
    };

    update();
    window.addEventListener("basket-changed", update);

    function handleStorage(e: StorageEvent) {
      if (e.key === "basket") update();
    }
    window.addEventListener("storage", handleStorage);

    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("basket-changed", update);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="سبد خرید"
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center px-3 py-2 hover:bg-rose-50 rounded-xl transition group font-bold text-base text-gray-700"
      >
        <div className="relative">
          <ShoppingCartIcon className="w-7 h-7 text-gray-600 group-hover:text-rose-500 transition" />
          {count > 0 && (
            <span
              className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs min-w-5 h-5 rounded-full flex items-center justify-center px-1 border border-white shadow"
              style={{ fontFamily: "inherit" }}
            >
              {count}
            </span>
          )}
        </div>
        <span className="mx-2 hidden md:inline group-hover:text-rose-600">
          سبد خرید
        </span>
      </button>

      {/* Mini Cart Dropdown */}
      {open && (
        <div
          className="absolute shadow-lg left-0 mt-2 z-30 w-[320px] sm:w-[380px] bg-white rounded-xl px-3 py-3 border border-rose-100"
          style={{ minWidth: 220 }}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-base">سبد خرید</span>
            <button
              type="button"
              className="rounded hover:bg-gray-200 p-1 transition"
              onClick={() => setOpen(false)}
              aria-label="بستن"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          {basket.length === 0 ? (
            <div className="text-gray-400 text-center p-6">
              سبد خرید خالی است
            </div>
          ) : (
            <>
              <ul className="divide-y">
                {basket.map((item) => (
                  <li key={item.id} className="flex items-center py-2 text-sm">
                    <div className="flex-1 truncate">
                      <span title={item.name}>{item.name}</span>
                      <div className="mt-1 flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="کم کردن"
                          className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded"
                          onClick={() => handleQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="px-2">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="افزایش"
                          className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded"
                          onClick={() => handleQuantity(item.id, +1)}
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="حذف"
                          className="ml-2 px-2 py-1 bg-rose-100 text-rose-600 rounded text-xs hover:bg-rose-200 transition"
                          onClick={() => handleRemove(item.id)}
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 font-semibold text-[13px]">
                      {(item.price * item.quantity).toLocaleString()}{" "}
                      <span className="text-xs">تومان</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span>جمع کل:</span>
                <span className="text-rose-600">
                  {totalPrice().toLocaleString()} تومان
                </span>
              </div>
              {error && (
                <div className="text-rose-500 text-center my-2">{error}</div>
              )}
              <Link
                href="/cart"
                className="block mt-3 bg-rose-500 hover:bg-rose-600 text-center py-2 px-4 rounded-xl font-bold text-white transition"
                onClick={() => setOpen(false)}
              >
                مشاهده سبد خرید
              </Link>
              <button
                className="block mt-2 bg-emerald-500 hover:bg-emerald-600 text-center py-2 px-4 rounded-xl font-bold text-white transition w-full"
                onClick={handleCheckout}
                disabled={loading}
                style={{
                  opacity: loading ? 0.7 : 1,
                  pointerEvents: loading ? "none" : "auto",
                }}
              >
                {loading ? "در حال انتقال..." : "ثبت سفارش"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
