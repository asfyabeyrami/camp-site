"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 text-center">
      <div className="max-w-md p-8 bg-white rounded-xl shadow-md">
        <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
        <p className="text-gray-700 text-lg mb-6">
          متأسفیم، صفحه‌ای که دنبالش هستید پیدا نشد.
        </p>
        <Link href="/">بازگشت به خانه</Link>
      </div>
    </div>
  );
}
