// "use client";
// import { useRouter } from "next/navigation";
// import { useState } from "react";

// interface Props {
//   productId: string;
//   productName: string;
//   redirectSlug: string;
// }
// export default function AddToWishlistButton({
//   productId,
//   productName,
//   redirectSlug,
// }: Props) {
//   const [loading, setLoading] = useState(false);
//   const [added, setAdded] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   const handleClick = async () => {
//     if (loading || added) return; // جلوگیری از دو بار کلیک

//     // --------- دریافت توکن کاربر
//     let token = "";
//     if (typeof window !== "undefined") {
//       token = localStorage.getItem("token") || "";
//     }
//     // اگر توکن نبود:
//     if (!token) {
//       router.push(`/auth?redirect=/product/${redirectSlug}`);
//       return;
//     }
//     setError(null);
//     setLoading(true);

//     try {
//       const resp = await fetch(`https://api.koohnegar.com/wish/addWish`, {
//         method: "POST",
//         headers: {
//           accept: "*/*",
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ productId }),
//       });
//       const data = await resp.json();
//       if (!resp.ok || data.success === false) {
//         // JWT نامعتبر/اتمام اعتبار/نه مجاز → ریدایرکت به لاگین!
//         if (resp.status === 401 || data.statusCode === 401) {
//           router.push(`/auth?redirect=/product/${redirectSlug}`);
//           return;
//         }
//         setError(data.message || "خطا در افزودن به علاقه‌مندی‌ها.");
//       } else {
//         setAdded(true);
//       }
//     } catch (er: any) {
//       setError("خطا در افزودن به علاقه‌مندی‌ها.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <button
//       aria-label="اضافه به علاقه‌مندی‌ها"
//       type="button"
//       disabled={loading || added}
//       onClick={handleClick}
//       className={`
//         flex items-center gap-1 px-4 py-1.5 rounded-xl border
//         border-rose-200 transition
//         hover:bg-rose-50 hover:border-rose-400
//         text-rose-600 font-bold shadow
//         ${added ? "bg-rose-100 border-rose-500 text-rose-700" : ""}
//         ${loading ? "opacity-50 pointer-events-none" : ""}
//       `}
//       style={{ minWidth: 48 }}
//     >
//       <span className="text-xl">
//         {added ? (
//           <svg className="w-5 h-5 fill-rose-600" viewBox="0 0 20 20">
//             <path d="M10 18l-1.45-1.32C4.4 12.36 2 10.28 2 7.91 2 5.62 3.81 4 6.06 4c1.22 0 2.41.54 3.19 1.61C10.53 4.54 11.72 4 12.94 4 15.19 4 17 5.62 17 7.91c0 2.37-2.4 4.45-6.55 8.77L10 18z" />
//           </svg>
//         ) : (
//           <svg
//             className="w-5 h-5"
//             fill="none"
//             viewBox="0 0 20 20"
//             stroke="currentColor"
//             strokeWidth={1.6}
//           >
//             <path
//               d="M10 18l-1.45-1.32C4.4 12.36 2 10.28 2 7.91 2 5.62 3.81 4 6.06 4c1.22 0 2.41.54 3.19 1.61C10.53 4.54 11.72 4 12.94 4 15.19 4 17 5.62 17 7.91c0 2.37-2.4 4.45-6.55 8.77L10 18z"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </svg>
//         )}
//       </span>
//       <span className="ml-1">
//         {added ? "افزوده شد!" : loading ? "در حال ذخیره..." : "ذخیره"}
//       </span>
//       {error && <span className="text-xs text-rose-500 mr-2">{error}</span>}
//     </button>
//   );
// }
