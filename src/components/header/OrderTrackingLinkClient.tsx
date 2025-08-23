"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Link from "next/link";

export default function OrderTrackingLinkClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    setIsAuthenticated(!!token);
  }, []);
  const orderTrackingHref = isAuthenticated
    ? "/orders"
    : "/auth?redirect=/orders";

  return (
    <Link
      href={orderTrackingHref}
      className="px-2 hover:text-rose-600 transition"
    >
      پیگیری سفارشات
    </Link>
  );
}
