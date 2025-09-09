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
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="lo0s8OThTxZlZXhPc+IWSw"
          async
        ></script>
      </body>
    </html>
  );
}
