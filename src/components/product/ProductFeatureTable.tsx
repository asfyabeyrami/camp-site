"use client";
import { Feature, FeatureValue } from "@/types/type";
import React from "react";

// ---- کامپوننت ----
export default function ProductFeatureTable({
  features,
}: {
  features: Feature[];
}) {
  if (!Array.isArray(features) || !features.length) return null;

  // فهرست تمام FeatureValueها (فلت)
  const allValues = features.flatMap((f) => f.FeatureValue || []);

  // لیست نام ستون‌ها (بروزرسانی اگر فیلد جدید اضافه کردی)
  const FIELD_MAP: { key: keyof FeatureValue; label: string }[] = [
    { key: "Length", label: "طول" },
    { key: "Width", label: "عرض" },
    { key: "Height", label: "ارتفاع" },
    { key: "stock_quantity", label: "تعداد موجودی" },
  ];

  // فقط ستون‌هایی که حداقل تو یکی از مقادیر این فیلد را دارند
  const shownFields = FIELD_MAP.filter(({ key }) =>
    allValues.some((fv) => {
      const val = fv[key];
      if (val === undefined || val === null) return false;

      if (typeof val === "object" && val !== null && "value" in val) {
        // ابعاد: Dimensions { value: number; unit: string }
        return (
          val.value !== null &&
          val.value !== undefined &&
          // اگر عدد است، فقط null/undefined را چک کن، نه ""
          (typeof val.value === "number" ? true : val.value !== "")
        );
      }
      // اگر عدد یا رشته است (مثل stock_quantity یا rate)
      if (typeof val === "number") return true;
      if (typeof val === "string") return val.trim() !== "";
      return false;
    })
  );

  return (
    <section className="w-full max-w-7xl mx-auto bg-white rounded-2xl px-7 py-6 flex flex-col gap-8 overflow-x-auto">
      <h2 className="font-bold text-lg text-gray-800 mb-5">ویژگی‌ها</h2>
      <table className="min-w-[420px] border-collapse w-full text-sm bg-white rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-white">
            <th className="p-2 font-bold border border-gray-200 text-sky-800">
              ویژگی
            </th>
            <th className="p-2 font-bold border border-gray-200 text-sky-800">
              مقدار
            </th>
            {shownFields.map((field) => (
              <th
                key={field.key}
                className={
                  "font-bold border border-gray-200 text-sky-800 " +
                  (field.key === "stock_quantity"
                    ? "w-20 p-1 text-center"
                    : "p-2")
                }
              >
                {field.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((f) =>
            (f.FeatureValue || []).length === 0
              ? null
              : f.FeatureValue.map((fv, idx) => (
                  <tr
                    key={fv.id || `${f.feature}_${idx}`}
                    className="hover:bg-blue-50/70 transition"
                  >
                    <td className="border border-gray-200 p-2 text-sky-900 font-semibold">
                      {f.feature}
                    </td>
                    <td className="border border-gray-200 p-2">
                      {fv.name || "-"}
                    </td>
                    {shownFields.map(({ key }) => (
                      <td
                        key={key}
                        className={
                          "border border-gray-200 whitespace-nowrap " +
                          (key === "stock_quantity"
                            ? "w-20 p-1 text-center"
                            : "p-2")
                        }
                      >
                        {(() => {
                          const val = fv[key];
                          if (val === undefined || val === "" || val === null)
                            return "";
                          if (
                            typeof val === "object" &&
                            val !== null &&
                            "value" in val
                          ) {
                            return `${val.value ?? ""}${val.unit ?? ""}`;
                          }
                          return val;
                        })()}
                      </td>
                    ))}
                  </tr>
                ))
          )}
        </tbody>
      </table>
    </section>
  );
}
