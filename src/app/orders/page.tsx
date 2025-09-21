"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Header from "@/components/header/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Helpers
function getMediaUrl(media: { url: string }) {
  if (!media?.url) return "/images/no-image.webp";
  if (media.url.startsWith("http")) return media.url;
  return `${NEXT_PUBLIC_BASE_URL}/media/${media.url}`;
}

// --- Types ---
interface MediaItem {
  id: string;
  media: {
    id: string;
    url: string;
    type: string;
  };
  alt?: string;
}
type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  discount: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    media_item?: MediaItem[];
  };
};
type Order = {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentType: string;
  createdAt: string;
  orderItems: OrderItem[];
  addressId?: string;
  userId?: string;
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const token = Cookies.get("token");

      if (!token) {
        router.replace("/auth?redirect=/orders");
        return;
      }

      try {
        const who = await fetch(`${NEXT_PUBLIC_BASE_URL}/user/whoAmI`, {
          headers: { Accept: "*/*", Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (!who.ok) {
          Cookies.remove("token");
          router.replace("/auth?redirect=/orders");
          return;
        }
      } catch (err) {
        console.error(err);
        router.replace("/auth?redirect=/orders");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${NEXT_PUBLIC_BASE_URL}/card/myOrders`, {
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) throw new Error("cannot fetch orders");
        const data = await res.json();
        setOrders(Array.isArray(data.data) ? data.data : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const renderStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-block bg-yellow-100 text-yellow-800 font-bold rounded-full px-3 py-1 text-xs">
            در انتظار پرداخت/بررسی
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-block bg-green-100 text-green-800 font-bold rounded-full px-3 py-1 text-xs">
            پرداخت شده /درحال ارسال
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-block bg-blue-100 text-blue-800 font-bold rounded-full px-3 py-1 text-xs">
            ارسال شده
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-block bg-blue-100 text-blue-800 font-bold rounded-full px-3 py-1 text-xs">
            تحویل داده شده
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-block bg-rose-100 text-rose-800 font-bold rounded-full px-3 py-1 text-xs">
            لغو شده
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-block bg-rose-100 text-rose-800 font-bold rounded-full px-3 py-1 text-xs">
            باز پرداخت
          </span>
        );
      default:
        return (
          <span className="inline-block bg-gray-100 text-gray-800 font-bold rounded-full px-3 py-1 text-xs">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow flex flex-col items-center px-1 md:px-4 xl:px-6 py-8">
        <section className="w-full max-w-7xl mx-auto bg-white rounded-2xl px-7 py-6 flex flex-col gap-8">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 font-semibold mb-2">
            <Link href="/" className="hover:underline text-rose-600">
              خانه
            </Link>
            <span className="inline-block mx-1 text-gray-400">/</span>
            <span className="text-gray-700">پیگیری سفارش</span>
          </nav>
          <h1 className="font-bold text-2xl md:text-3xl text-gray-800 text-center mb-4">
            سفارش‌های من
          </h1>
          {loading && (
            <div className="w-full text-center py-24">
              <span className="loader inline-block w-8 h-8 border-4 border-gray-300 border-t-rose-500 rounded-full animate-spin" />
              <span className="block mt-4 text-gray-500">
                در حال دریافت اطلاعات سفارش‌ها ...
              </span>
            </div>
          )}
          {!loading && orders.length === 0 && (
            <div className="w-full text-center py-20 text-xl text-gray-400">
              هیچ سفارشی یافت نشد.
            </div>
          )}
          {!loading && orders.length > 0 && (
            <div className="flex flex-col gap-10">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col gap-5"
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-2 border-b pb-3">
                    <div>
                      <span className="text-xs text-gray-400 font-semibold ml-2">
                        شماره سفارش:
                      </span>
                      <span className="font-bold text-gray-800">
                        {order.orderNumber}
                      </span>
                    </div>
                    <div>{renderStatus(order.status)}</div>
                  </div>
                  {/* زمان و مبلغ و پرداخت */}
                  <div className="flex flex-row flex-wrap text-sm gap-3 text-gray-500 mt-2">
                    <span>
                      تاریخ ثبت:{" "}
                      <b className="text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                      </b>
                    </span>
                    <span>
                      مبلغ کل:{" "}
                      <b className="text-black">
                        {order.totalAmount.toLocaleString()} تومان
                      </b>
                    </span>
                    <span>
                      روش پرداخت:{" "}
                      <b>
                        {order.paymentType === "ONLINE"
                          ? "آنلاین"
                          : order.paymentType}
                      </b>
                    </span>
                  </div>
                  {/* محصولات */}
                  <div>
                    <h3 className="font-bold text-base text-gray-800 mb-2">
                      محصولات سفارش
                    </h3>
                    <ul className="flex flex-col gap-3">
                      {order.orderItems.map((item) => {
                        const img = item.product.media_item?.[0]?.media?.url
                          ? getMediaUrl(item.product.media_item[0].media)
                          : "/images/no-image.webp";
                        const alt =
                          item.product.media_item?.[0]?.alt ||
                          item.product.name;

                        return (
                          <li
                            key={item.id}
                            className="flex flex-wrap md:flex-nowrap items-center border border-gray-200 rounded-xl p-3 gap-4 bg-white"
                          >
                            <div className="w-16 h-16 flex items-center justify-center overflow-hidden">
                              <Image
                                src={img}
                                alt={alt}
                                width={64}
                                height={64}
                                className="object-contain w-14 h-14"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex-1 flex flex-col gap-1 min-w-0">
                              <Link
                                href={`/product/${encodeURIComponent(
                                  item.product.slug
                                )}`}
                                className="font-bold text-sm text-blue-700 hover:underline truncate max-w-full"
                              >
                                {item.product.name}
                              </Link>
                              <span className="text-gray-500 text-xs">
                                تعداد:{" "}
                                <b className="text-gray-800">{item.quantity}</b>
                              </span>
                              <span className="text-gray-500 text-xs">
                                قیمت واحد:{" "}
                                <b className="text-gray-800">
                                  {item.price.toLocaleString()} تومان
                                </b>
                                {item.discount > 0 && (
                                  <span className="ml-2 text-[#f43f5e] font-bold text-xs bg-rose-50 py-1 px-2 rounded-full">
                                    {item.discount}% تخفیف
                                  </span>
                                )}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  {/* مبلغ کل و وضعیت */}
                  <div className="flex flex-row items-center justify-between border-t border-dashed pt-3 mt-1 gap-4">
                    <span className="text-gray-700">
                      جمع کل این سفارش:{" "}
                      <b className="text-rose-600 text-lg">
                        {order.totalAmount.toLocaleString()} تومان
                      </b>
                    </span>
                    <div>{renderStatus(order.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
      <style jsx>{`
        .loader {
          border-bottom-color: transparent;
        }
      `}</style>
    </div>
  );
}
