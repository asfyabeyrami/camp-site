import { NextRequest, NextResponse } from "next/server";

// تابع برای تشخیص اینکه آیا اسلاگ یک محصول است یا نه
async function isProduct(slug: string): Promise<boolean> {
  console.log("Checking slug in middleware:", slug);
  const res = await fetch(
    `https://www.api.koohnegar.com/product/sort?slug=${slug}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  return Array.isArray(data.data) && data.data.length > 0;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // فقط اگر /something (بدون /product/) بود (نه static, api و ...)
  const match = /^\/([^\/]+)$/.exec(pathname);
  if (match && match[1] && !pathname.startsWith("/product")) {
    const slug = match[1];

    if (await isProduct(slug)) {
      // پیدا شد، پس 301 کن
      return NextResponse.redirect(
        new URL(`/product/${slug}`, request.url),
        301
      );
    }
  }

  return NextResponse.next();
}

// تعیین مسیری که middleware فعال باشد:
export const config = {
  matcher: [
    // فقط روی صفحات اصلی بجز product و api و ... (امنیت!)
    "/((?!api|_next|product|static|assets|favicon.ico).*)",
  ],
};
