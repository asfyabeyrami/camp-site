"use client";
import Footer from "@/components/Footer";
import Header from "@/components/header/Header";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center">
        <div className="max-w-2xl m-auto py-20 text-center text-2xl text-gray-400">
          صفحه مورد نظر یافت نشد!
        </div>
        <Link href="/">بازگشت به خانه</Link>
      </main>
      <Footer />
    </div>
  );
}
