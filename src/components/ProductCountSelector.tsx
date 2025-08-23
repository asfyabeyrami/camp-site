import { useState } from "react";

function ProductCountSelector({
  max,
  disabled,
  onSave,
}: {
  max?: number;
  disabled?: boolean;
  onSave?: (count: number) => void;
}) {
  const [count, setCount] = useState(1);

  return (
    <div className="flex gap-2 items-center border border-gray-200 rounded-lg px-2 py-1">
      <span className="font-bold text-gray-600">تعداد</span>
      <button
        type="button"
        className="rounded-full w-8 h-8 bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-xl font-extrabold disabled:opacity-40"
        onClick={() => setCount((c) => Math.max(1, c - 1))}
        disabled={disabled || count <= 1}
        aria-label="کم کردن تعداد"
      >
        –
      </button>
      <span className="block text-center font-bold w-10">{count}</span>
      <button
        type="button"
        className="rounded-full w-8 h-8 bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-xl font-extrabold disabled:opacity-40"
        onClick={() => setCount((c) => Math.min(max || 99, c + 1))}
        disabled={disabled || (!!max && count >= max)}
        aria-label="افزایش تعداد"
      >
        +
      </button>
      <button
        type="button"
        className="ml-2 bg-sky-600 px-3 py-1 rounded text-white font-bold text-sm transition hover:bg-sky-700 disabled:bg-gray-300"
        onClick={() => onSave?.(count)}
        disabled={disabled}
      >
        سیو
      </button>
    </div>
  );
}
export default ProductCountSelector;
