"use client";
import { useState } from "react";
type BasketItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};
type Props = {
  product: {
    id: string;
    name: string;
    price: number;
  };
  disabled?: boolean;
  className?: string; // اضافه شود
};
export default function AddToCartButton({
  product,
  disabled,
  className,
}: Props) {
  const [added, setAdded] = useState(false);
  const handleAdd = () => {
    let basket: BasketItem[] = [];
    try {
      basket = JSON.parse(
        localStorage.getItem("basket") || "[]"
      ) as BasketItem[];
    } catch {}
    const idx = basket.findIndex((item) => item.id === product.id);
    if (idx > -1) {
      basket[idx].quantity += 1;
    } else {
      basket.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("basket", JSON.stringify(basket));
    window.dispatchEvent(new Event("basket-changed"));
    setAdded(true);
    setTimeout(() => setAdded(false), 1300);
  };
  return (
    <button
      onClick={handleAdd}
      disabled={disabled}
      className={`mt-4 bg-rose-500 flex gap-2 text-white text-lg font-bold rounded-lg py-3 transition hover:bg-rose-600 shadow items-center justify-center disabled:opacity-50 ${
        className || ""
      }`}
    >
      {added ? "✅ به سبد اضافه شد!" : "افزودن به سبد خرید"}
    </button>
  );
}
