import React from "react";

export default function Switch({
  checked,
  onChange,
  className,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={
        "relative inline-flex items-center cursor-pointer select-none " +
        (className || "")
      }
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div
        className={`
        w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer
        peer-checked:bg-pink-400 transition-all duration-150
        `}
      ></div>
      {/* دایره داخل سوییچ */}
      <div
        className={`
        absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow
        peer-checked:left-6 transition-all duration-150
        `}
        style={{
          boxShadow: "0 1px 4px 0 rgba(0,0,0,0.12)",
        }}
      />
    </label>
  );
}
