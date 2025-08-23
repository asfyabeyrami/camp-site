"use client";
import Footer from "@/components/Footer";
import Header from "@/components/header/Header";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

type BasketItem = { id: string; name: string; price: number; quantity: number };

export default function CartPage() {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let basket: BasketItem[] = [];
    try {
      basket = JSON.parse(
        localStorage.getItem("basket") || "[]"
      ) as BasketItem[];
    } catch {}
    setItems(basket);
    window.dispatchEvent(new Event("basket-changed"));
  }, []);

  const total =
    items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    ) || 0;

  // هندل ارسال سبد به سرور
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
          products: items.map((item) => ({
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
        // پاک کردن سبد بعد از موفقیت
        localStorage.removeItem("basket");
        // بعد از موفقیت، برو checkout
        window.location.href = "/checkout";
      } else {
        setError(data.message || "خطا در ارسال سبد");
      }
    } catch {
      setError("مشکل در ارتباط با سرور.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
      <Header />
      <main className="flex-1 container mx-auto max-w-3xl p-5">
        <h2 className="font-black text-xl mb-4">سبد خرید شما</h2>
        {error && <div className="text-rose-500 mb-4">{error}</div>}
        {items.length === 0 ? (
          <div>سبد خرید خالی است.</div>
        ) : (
          <>
            <ul className="divide-y mb-6">
              {items.map((item) => (
                <li key={item.id} className="py-3 flex justify-between gap-4">
                  <span>
                    {item.name} &ndash;{" "}
                    <span className="text-xs">({item.quantity} عدد)</span>
                  </span>
                  <span>
                    {Number(item.price * item.quantity).toLocaleString()} تومان
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 font-bold flex justify-between">
              <span>جمع کل:</span>
              <span>{total.toLocaleString()} تومان</span>
            </div>
            <button
              type="button"
              className="btn btn-primary mt-7 w-full flex justify-center py-3 bg-rose-500 text-white rounded-xl font-bold"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? "در حال انتقال..." : "ادامه ثبت سفارش"}
            </button>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
