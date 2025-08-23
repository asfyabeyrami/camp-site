"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import UserCompleteInfo from "@/components/UserCompleteInfo";
import { UserProfile } from "@/types/type";
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function CompleteInfoPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
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
    if (token) {
      fetchUser(token)
        .then(setUser)
        .catch((e) => {
          // خطاهای 401 یا توکن نامعتبر، ریدایرکت کن به لاگین
          if (
            e instanceof Error &&
            (e.message === "unauthorized" || e.message === "token_invalid")
          ) {
            window.location.href = "/auth?redirect=/complete-info";
          } else {
            setError(e instanceof Error ? e.message : "خطای ناشناخته!");
            setUser(null);
          }
        });
    } else {
      window.location.href = "/auth?redirect=/complete-info";
    }
  }, []);

  if (error)
    return <div className="text-rose-600 text-center mt-8">{error}</div>;
  if (!user)
    return <div className="text-center mt-8">درحال دریافت اطلاعات...</div>;

  return <UserCompleteInfo user={user} />;
}
