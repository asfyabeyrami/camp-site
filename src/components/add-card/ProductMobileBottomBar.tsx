"use client";
import AddToCartButton from "@/components/add-card/AddToCartButton";

interface Props {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  off?: number;
  available: boolean;
  count: number;
}

export default function ProductMobileBottomBar({
  id,
  name,
  price,
  oldPrice,
  off,
  available,
}: Props) {
  return (
    <div className="fixed z-50 bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 pt-2 pb-2 max-w-[600px] mx-auto md:hidden">
      {/* طبقه اول: قیمت و تعداد و تخفیف */}
      <div className="flex items-center justify-between mb-2">
        <div>
          {off && off > 0 ? (
            <span className="bg-rose-100 text-rose-700 rounded px-2 py-0.5 text-xs font-bold mr-1 ml-2">
              {off}% تخفیف
            </span>
          ) : null}
          {oldPrice && oldPrice > price ? (
            <span className="line-through text-gray-400 text-base ml-1">
              {oldPrice.toLocaleString()} تومان
            </span>
          ) : null}
          <span className="font-extrabold text-lg text-rose-600 ml-2">
            {price.toLocaleString()} <span className="text-xs">تومان</span>
          </span>
        </div>
      </div>
      {/* طبقه دوم: دکمه فول‌سایز */}
      <AddToCartButton
        product={{ id, name, price }}
        disabled={!available}
        className="w-full h-12 text-base rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition"
      />
    </div>
  );
}
