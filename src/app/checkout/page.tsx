"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Footer from "@/components/Footer";
import Header from "@/components/header/Header";
import Link from "next/link";

// ---- Types ----
type Product = { id: string; name: string; price: number; finalPrice: number };
type BasketItem = {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
};
type Address = { id: string; address: string; postalCode: string };
type UserProfile = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  mobile: string;
  address: Address[];
};
type OrderResponse = { orderNumber: string; totalAmount: number; id: string };
type PaymentType = "ONLINE" | "CASH_ON_DELIVERY" | "BANK_TRANSFER";
type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
};

type PaymentInitiationResponse = {
  success: boolean;
  paymentUrl: string;
  authority: string;
  message: string;
};

type PaymentVerificationResponse = {
  success: boolean;
  refId?: string;
  orderId?: string;
  message: string;
};
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// ---- API Functions ----
async function fetchUser(token: string): Promise<UserProfile> {
  let userId = "";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    userId = payload.id;
  } catch (e: unknown) {
    if (e instanceof Error) {
      throw new Error("token_invalid");
    }
  }
  const res = await fetch(`${NEXT_PUBLIC_BASE_URL}/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("unauthorized");
    throw new Error("خطا در دریافت اطلاعات کاربر");
  }

  const data: ApiResponse<UserProfile> = await res.json();
  return data.data;
}

async function submitOrder(
  token: string,
  addressId: string,
  paymentType: PaymentType
): Promise<OrderResponse> {
  const res = await fetch(`${NEXT_PUBLIC_BASE_URL}/card/createOrder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ addressId, paymentType }),
  });

  if (res.status === 401) throw new Error("unauthorized");

  const data: ApiResponse<OrderResponse> = await res.json();

  if (!data.success) {
    throw new Error(data.message || "خطای ثبت سفارش");
  }

  return data.data;
}

async function initiatePayment(
  token: string,
  orderId: string,
  callbackUrl: string
): Promise<PaymentInitiationResponse> {
  const res = await fetch(`${NEXT_PUBLIC_BASE_URL}/payments/initiate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId, callbackUrl }),
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("unauthorized");
    throw new Error("خطا در شروع پرداخت");
  }

  const apiResponse: ApiResponse<PaymentInitiationResponse> = await res.json();

  if (!apiResponse.data.success) {
    throw new Error(apiResponse.message || "خطا در شروع پرداخت");
  }

  return apiResponse.data;
}

async function verifyPayment(
  token: string,
  authority: string
): Promise<PaymentVerificationResponse> {
  const res = await fetch(
    `${NEXT_PUBLIC_BASE_URL}/payments/verify?authority=${authority}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    if (res.status === 401) throw new Error("unauthorized");
    throw new Error("خطا در تایید پرداخت");
  }

  const apiResponse: ApiResponse<PaymentVerificationResponse> =
    await res.json();

  if (!apiResponse.data.success) {
    throw new Error(apiResponse.message || "خطا در تایید پرداخت");
  }

  return apiResponse.data;
}

async function fetchOrderDetails(
  token: string,
  orderId: string
): Promise<OrderResponse> {
  const res = await fetch(`${NEXT_PUBLIC_BASE_URL}/order/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("خطا در دریافت اطلاعات سفارش");
  }

  const data: ApiResponse<OrderResponse> = await res.json();
  return data.data;
}

async function deleteBasket(token: string, basketId: string): Promise<boolean> {
  const res = await fetch(`${NEXT_PUBLIC_BASE_URL}/card/${basketId}`, {
    method: "DELETE",
    headers: {
      accept: "*/*",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error("خطا در حذف کل سبد");
  return true;
}

// ---- Main Component ----
export default function CheckoutPage() {
  const [loading, setLoading] = useState(true);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("ONLINE");
  const [orderResult, setOrderResult] = useState<OrderResponse | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [error, setError] = useState("");
  const [basketId, setBasketId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "success" | "failed" | null
  >(null);
  const [paymentRefId, setPaymentRefId] = useState("");

  const total = basket.reduce(
    (sum, item) =>
      sum +
      (item.product?.finalPrice ?? item.product?.price ?? 0) *
        (item.quantity ?? 1),
    0
  );

  const totalDiscount = basket.reduce(
    (sum, item) =>
      sum +
      (item.product.price - (item.product.finalPrice ?? item.product.price)) *
        item.quantity,
    0
  );

  // Fetch initial data
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError("");

      const token = Cookies.get("token");
      if (!token) {
        window.location.href = "/auth?redirect=/checkout";
        return;
      }

      try {
        // Fetch basket
        const basketRes = await fetch(`${NEXT_PUBLIC_BASE_URL}/card`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (!basketRes.ok) {
          if (basketRes.status === 401) throw new Error("unauthorized");
          throw new Error("خطا در دریافت سبد خرید");
        }

        const basketData = await basketRes.json();
        setBasket(basketData?.data?.basket_item || []);
        setBasketId(basketData?.data?.id || "");

        // Fetch user
        const userData = await fetchUser(token);
        setUser(userData);

        if (!userData.address || userData.address.length === 0) {
          window.location.href = "/complete-info?fromCheckout=1";
          return;
        }

        setSelectedAddress(userData.address[0]?.id || "");
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (
            err.message === "unauthorized" ||
            err.message === "token_invalid"
          ) {
            window.location.href = "/auth?redirect=/checkout";
          } else {
            setError(err.message);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // Handle payment callback
  useEffect(() => {
    const handlePaymentCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authority = urlParams.get("Authority");
      const status = urlParams.get("Status");

      if (authority && status === "OK") {
        setPaymentStatus("pending");
        setSubmitting(true);
        setError("");

        const token = Cookies.get("token");
        if (!token) {
          window.location.href = "/auth?redirect=/checkout";
          return;
        }

        try {
          const verification = await verifyPayment(token, authority);

          if (verification.success) {
            setPaymentStatus("success");
            setPaymentRefId(verification.refId || "");

            // Fetch order details
            if (verification.orderId) {
              const order = await fetchOrderDetails(
                token,
                verification.orderId
              );
              setOrderResult(order);
            }

            // Clear URL params
            window.history.replaceState({}, "", window.location.pathname);
          } else {
            setPaymentStatus("failed");
            setError(verification.message || "پرداخت با مشکل مواجه شد");
          }
        } catch (err: unknown) {
          setPaymentStatus("failed");
          if (err instanceof Error) {
            setError(err.message);
          }
        } finally {
          setSubmitting(false);
        }
      }
    };

    handlePaymentCallback();
  }, []);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    if (!selectedAddress) {
      setError("لطفا آدرس تحویل را انتخاب کنید");
      setSubmitting(false);
      return;
    }
    const token = Cookies.get("token");
    if (!token) {
      window.location.href = "/auth?redirect=/checkout";
      return;
    }
    try {
      // Submit order
      const order = await submitOrder(token, selectedAddress, paymentType);
      if (paymentType === "ONLINE") {
        // به درگاه برو
        const callbackUrl = `${window.location.origin}${window.location.pathname}`;
        const payment = await initiatePayment(token, order.id, callbackUrl);
        window.location.href = payment.paymentUrl;
      } else if (paymentType === "BANK_TRANSFER") {
        setOrderResult(order);
        setShowCardModal(true); // <-- مودال باز شود
      } else {
        // "پرداخت در محل"
        setOrderResult(order);
        setPaymentStatus("success");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === "unauthorized") {
          window.location.href = "/auth?redirect=/checkout";
        } else {
          setError(err.message);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBasket = async () => {
    if (
      !basketId ||
      !window.confirm("آیا مطمئن هستید که می‌خواهید کل سبد خرید را حذف کنید؟")
    ) {
      return;
    }

    setSubmitting(true);
    setError("");

    const token = Cookies.get("token");
    if (!token) {
      window.location.href = "/auth?redirect=/checkout";
      return;
    }

    try {
      await deleteBasket(token, basketId);
      setBasket([]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-2xl text-gray-500">در حال دریافت اطلاعات...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (
    paymentStatus === "success" ||
    (orderResult && paymentType === "CASH_ON_DELIVERY") ||
    (orderResult && paymentType === "BANK_TRANSFER" && !showCardModal)
  ) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            {/* آیکون موفقیت */}
            <div className="text-green-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            {/* عنوان */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              سفارش شما با موفقیت ثبت شد!
            </h2>

            {/* اطلاعات سفارش */}
            <div className="space-y-4 mb-6">
              {orderResult && (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">شماره سفارش:</p>
                    <p className="font-bold text-lg mt-1">
                      {orderResult.orderNumber}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">مبلغ قابل پرداخت:</p>
                    <p className="font-bold text-lg mt-1">
                      {orderResult.totalAmount.toLocaleString()} تومان
                    </p>
                  </div>
                </>
              )}

              {paymentRefId && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">کد پیگیری پرداخت:</p>
                  <p className="font-bold text-lg mt-1">{paymentRefId}</p>
                </div>
              )}
            </div>

            {/* دکمه‌های اقدام */}
            <div className="flex flex-col space-y-3">
              <Link
                href="/orders"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                    clipRule="evenodd"
                  />
                </svg>
                پیگیری سفارشات
              </Link>
              <Link
                href="/"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                بازگشت به صفحه اصلی
              </Link>
            </div>

            {/* پیام تکمیلی */}
            <p className="text-sm text-gray-500 mt-6">
              جزئیات سفارش به ایمیل و پیامک شما ارسال شد.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (paymentStatus === "failed") {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-red-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              پرداخت ناموفق بود
            </h2>
            {error && (
              <div className="my-4 p-3 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition w-full"
            >
              تلاش مجدد
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">تکمیل سفارش</h1>
              {basket.length > 0 && (
                <button
                  onClick={handleDeleteBasket}
                  disabled={submitting}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                >
                  حذف سبد خرید
                </button>
              )}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            {basket.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-6">سبد خرید شما خالی است</p>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  بازگشت به فروشگاه
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">محصولات</h2>
                  <div className="divide-y">
                    {basket.map((item) => (
                      <div key={item.id} className="py-4 flex justify-between">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <h3 className="text-lg font-medium">
                              {item.product.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {/* قیمت نهایی */}
                              <span className="text-gray-800 font-bold">
                                {(
                                  item.product.finalPrice ?? item.product.price
                                ).toLocaleString()}{" "}
                                تومان
                              </span>
                              {/* قیمت قبل تخفیف (در صورت وجود تخفیف) */}
                              {item.product.finalPrice < item.product.price && (
                                <span className="text-sm text-gray-400 line-through ml-2">
                                  {item.product.price.toLocaleString()} تومان
                                </span>
                              )}
                              {/* درصد تخفیف */}
                              {item.product.finalPrice < item.product.price && (
                                <span className="text-xs text-green-600 ml-2 bg-green-50 px-2 py-0.5 rounded">
                                  {Math.round(
                                    100 -
                                      (item.product.finalPrice /
                                        item.product.price) *
                                        100
                                  )}
                                  ٪ تخفیف
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="mx-4">{item.quantity} عدد</span>
                          <span className="font-medium">
                            {(
                              (item.product.finalPrice ?? item.product.price) *
                              item.quantity
                            ).toLocaleString()}{" "}
                            تومان
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">جمع کل</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span>جمع محصولات:</span>
                      <span>
                        {basket
                          .reduce(
                            (sum, item) =>
                              sum + item.product.price * item.quantity,
                            0
                          )
                          .toLocaleString()}{" "}
                        تومان
                      </span>
                    </div>
                    <div className="flex justify-between mb-2 text-green-700">
                      <span>سود شما از این خرید:</span>
                      <span>
                        {totalDiscount > 0
                          ? `${totalDiscount.toLocaleString()} تومان`
                          : "۰"}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>مبلغ قابل پرداخت:</span>
                      <span>{total.toLocaleString()} تومان</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleOrderSubmit}>
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">آدرس تحویل</h2>
                    <div className="space-y-4">
                      {user?.address.map((addr) => (
                        <label
                          key={addr.id}
                          className="flex items-start p-4 border rounded-lg hover:border-blue-500 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="address"
                            value={addr.id}
                            checked={selectedAddress === addr.id}
                            onChange={() => setSelectedAddress(addr.id)}
                            className="mt-1"
                            required
                          />
                          <div className="mr-3">
                            <p className="font-medium">{addr.address}</p>
                            <p className="text-gray-500">
                              کد پستی: {addr.postalCode}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        (window.location.href = "/complete-info?fromCheckout=1")
                      }
                      className="mt-4 text-blue-500 hover:text-blue-600"
                    >
                      + افزودن آدرس جدید
                    </button>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">روش پرداخت</h2>
                    <div className="space-y-4">
                      <label className="flex items-center p-4 border rounded-lg hover:border-blue-500 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentType"
                          value="ONLINE"
                          checked={paymentType === "ONLINE"}
                          onChange={() => setPaymentType("ONLINE")}
                          className="ml-3"
                        />
                        <span>پرداخت آنلاین (زرین‌پال)</span>
                      </label>
                      {/* <label className="flex items-center p-4 border rounded-lg hover:border-blue-500 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentType"
                          value="BANK_TRANSFER"
                          checked={paymentType === "BANK_TRANSFER"}
                          onChange={() => setPaymentType("BANK_TRANSFER")}
                          className="ml-3"
                        />
                        <span>کارت به کارت</span>
                      </label> */}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !selectedAddress}
                    className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300"
                  >
                    {submitting
                      ? "در حال پردازش..."
                      : paymentType === "ONLINE"
                      ? "پرداخت آنلاین"
                      : "تکمیل سفارش"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
        {showCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl text-center relative">
              <h3 className="text-lg font-bold mb-3 text-gray-800">
                پرداخت کارت به کارت
              </h3>
              <p className="mb-4">لطفا مبلغ سفارش را به کارت زیر واریز کنید:</p>
              <div className="mb-4 flex flex-col items-center">
                <span className="font-mono text-lg bg-gray-100 px-4 py-2 rounded-lg tracking-widest select-all mb-2">
                  6037-9982-7096-0676
                </span>
                <span className="text-gray-600 text-sm">
                  بنام: امیرحسین بیرامی
                </span>
              </div>
              <p className="mb-4 text-red-600 text-sm">
                پس از پرداخت اسکرین‌شات خود را به تلگرام{" "}
                <b>@pooladmotor_support</b> ارسال نمایید.
              </p>
              <button
                className="mt-4 w-full py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
                onClick={() => {
                  setShowCardModal(false);
                  setPaymentStatus("success");
                }}
              >
                پرداخت کردم، ادامه
              </button>
              <button
                onClick={() => setShowCardModal(false)}
                className="absolute top-2 left-2 text-gray-400 hover:text-gray-700 text-lg"
                title="بستن"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
