import type { Metadata } from "next";
import "./globals.css";
// import Script from "next/script";
export const metadata: Metadata = {
  title: "کوه نگار",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="text-slate-800 antialiased">
        {children}
        {/* <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="PkHQf/4BXF8Qe0k4AoF7hQ"
          strategy="afterInteractive"
        /> */}
      </body>
    </html>
  );
}
