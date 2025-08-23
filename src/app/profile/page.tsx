"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { UserProfile } from "@/types/type";
import Header from "@/components/header/Header";
import Footer from "@/components/Footer";
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function UserProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchUser(token: string): Promise<UserProfile> {
    let userId = "";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.id;
    } catch {
      throw new Error("token_invalid");
    }
    const res = await fetch(`${NEXT_PUBLIC_BASE_URL}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("unauthorized");
      throw new Error("خطا در دریافت اطلاعات کاربر");
    }
    const data = await res.json();
    return data?.data as UserProfile;
  }

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      window.location.href = "/auth?redirect=/profile";
      return;
    }
    fetchUser(token)
      .then(setUser)
      .catch((e) => {
        if (
          e instanceof Error &&
          (e.message === "unauthorized" || e.message === "token_invalid")
        ) {
          window.location.href = "/auth?redirect=/profile";
        } else {
          setError(e instanceof Error ? e.message : "خطای ناشناخته!");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-rose-600 text-center text-xl font-bold">
          {error}
        </div>
      </div>
    );
  if (loading || !user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-xl">در حال دریافت اطلاعات...</div>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow flex flex-col items-center px-2 py-8 sm:py-16 bg-gradient-to-b from-indigo-50/40 to-white">
        <section className="w-full max-w-xl mx-auto">
          <div className="border border-gray-200 bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* هدر پروفایل */}
            <div className="bg-gradient-to-l from-sky-100 via-blue-50 to-white px-8 py-7 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 justify-center">
              <div className="flex-shrink-0">
                <div className="rounded-full border-2 border-indigo-400 w-24 h-24 flex items-center justify-center shadow-lg bg-white text-indigo-500 text-4xl font-bold select-none">
                  {user.name?.[0]?.toUpperCase() ||
                    user.mobile?.slice(-2) ||
                    "U"}
                </div>
              </div>
              <div className="flex-1 text-center sm:text-right">
                <h2 className="text-2xl font-extrabold text-indigo-800 mb-2">
                  {user.name && user.lastName
                    ? `${user.name} ${user.lastName}`
                    : user.mobile}
                </h2>
                <div className="text-indigo-500 text-base mb-1">
                  {user.mobile}
                </div>
                <div className="flex flex-col text-gray-700 text-sm">
                  <span>
                    <span className="font-semibold">ایمیل:</span>&nbsp;
                    {user.email || <span className="text-gray-400">—</span>}
                  </span>
                </div>
              </div>
            </div>
            {/* بادی پروفایل */}
            <div className="px-7 py-7">
              <div className="mb-8">
                <h3 className="font-bold text-gray-700 mb-3 text-lg">
                  آدرس‌های من
                </h3>
                {user.address && user.address.length > 0 ? (
                  <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white">
                    {user.address.map((a) => (
                      <li
                        key={a.id}
                        className="py-3 px-2 flex flex-col sm:flex-row sm:items-center"
                      >
                        <span className="flex-1 text-gray-700">
                          {a.address}
                        </span>
                        <span className="text-xs text-gray-400 mt-1 sm:mt-0 sm:ml-3">
                          کدپستی: {a.postalCode || "-"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-rose-500 text-base">
                    شما هنوز هیچ آدرسی ثبت نکردید!
                  </div>
                )}
                <div className="mt-4">
                  <Link
                    href="/complete-info"
                    className="inline-block text-blue-600 text-sm font-bold hover:underline hover:text-blue-800 transition"
                  >
                    + افزودن یا ویرایش آدرس جدید
                  </Link>
                </div>
              </div>

              {/* دکمه‌ها */}
              <div className="flex flex-col sm:flex-row gap-3 w-full mt-5">
                <Link
                  href="/orders"
                  className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition text-center shadow"
                >
                  پیگیری سفارشات من
                </Link>
                <Link
                  href="/complete-info"
                  className="flex-1 py-3 px-6 bg-indigo-500 hover:bg-indigo-700 text-white font-bold rounded-lg transition text-center shadow"
                >
                  ویرایش / تکمیل پروفایل
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
