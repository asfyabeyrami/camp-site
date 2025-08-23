"use client";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { UserIcon } from "@heroicons/react/24/outline";
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function UserBox() {
  const [user, setUser] = useState<{ name: string; lastName: string } | null>(
    null
  );
  const router = useRouter();
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;
    fetch(`${NEXT_PUBLIC_BASE_URL}/user/whoAmI`, {
      headers: { Accept: "*/*", Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data?.data)
          setUser({ name: data.data.name, lastName: data.data.lastName });
      })
      .catch(() => Cookies.remove("token"));
  }, []);

  if (!user)
    return (
      <button
        onClick={() => router.push("/auth")}
        className="border border-gray-200 px-3 py-2 rounded-lg font-semibold flex items-center gap-1 text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition"
      >
        <UserIcon className="w-5 h-5" />
        ورود / ثبت‌نام
      </button>
    );

  // اگر لاگین بود، دکمه به صفحه پروفایل می‌برد:
  return (
    <button
      type="button"
      onClick={() => router.push("/profile")}
      className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-gray-700 hover:bg-rose-100 cursor-pointer transition"
      title="حساب کاربری من"
    >
      <UserIcon className="w-5 h-5" />
      <span className="font-semibold truncate max-w-[90px]">
        {user.name} {user.lastName}
      </span>
    </button>
  );
}
