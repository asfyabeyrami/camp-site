"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function ContactForm() {
  const [subject, setSubject] = useState("");
  const [messege, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.replace("/auth?redirect=" + encodeURIComponent("/contact")); // برگرداندن به همین صفحه پس از لاگین
    }
  }, [router]);

  const getToken = () => Cookies.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSent(false);
    if (!subject || !messege) {
      setError("لطفا همه‌ی فیلدها را پر کنید.");
      setLoading(false);
      return;
    }
    const token = getToken();
    if (!token) {
      setError("شما وارد نشده‌اید. لطفا ابتدا ورود کنید.");
      setLoading(false);
      router.replace("/auth?redirect=" + encodeURIComponent("/contact"));
      return;
    }
    try {
      const res = await fetch("https://api..com/ticket/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
        body: JSON.stringify({ subject, messege }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          data?.message || "خطا در ارسال پیام. لطفا دوباره امتحان کنید."
        );
      }
      setSent(true);
      setSubject("");
      setMessage("");
    } catch (err) {
      console.log(err);
      setError("خطا در ارسال پیام.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="w-full flex flex-col items-center space-y-4"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        className="w-full border px-4 py-2 rounded-lg"
        placeholder="موضوع"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        disabled={loading}
      />
      <textarea
        className="w-full border px-4 py-2 rounded-lg h-32 resize-none"
        placeholder="متن پیام"
        value={messege}
        onChange={(e) => setMessage(e.target.value)}
        disabled={loading}
      />
      {error && <div className="text-red-600">{error}</div>}
      {sent && (
        <div className="text-green-600">پیام شما با موفقیت ارسال شد!</div>
      )}
      <button
        type="submit"
        className={`bg-rose-600 text-white rounded-lg px-8 py-2 hover:bg-rose-700 shadow ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? "در حال ارسال..." : "ارسال پیام"}
      </button>
    </form>
  );
}
