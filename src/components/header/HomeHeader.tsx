import Head from "next/head";
import { BellIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import CategoryDropdown from "./CategoryDropdown";
import HeaderSearch from "./HeaderSearch";
import MobileDrawerClient from "./MobileDrawerClient";
import UserBox from "./UserBox";
import CartButton from "../add-card/CartButton";
import MobileHeaderSearch from "./MobileHeaderSearch";
import OrderTrackingLinkClient from "./OrderTrackingLinkClient";

const MyLogo = () => (
  <Link
    href="/"
    className="font-extrabold text-2xl text-rose-600 flex items-center"
  >
    کوه نگار
  </Link>
);

export default function HomeHeader() {
  return (
    <>
      {/* SEO HEAD TAGS */}

      <div className="w-full h-1 bg-amber-200" />
      <header
        className="sticky top-0 z-50 bg-white shadow-sm flex flex-col"
        dir="rtl"
      >
        <div className="flex items-center justify-between py-3 px-4 lg:px-10">
          {/* --- Mobile Drawer (فقط کلاینت) --- */}
          <div className="flex lg:hidden">
            <MobileDrawerClient />
          </div>
          {/* --- Logo --- */}
          <div className="flex-1 flex justify-center lg:justify-start">
            <MyLogo />
          </div>

          {/* --- Desktop Menu --- */}
          <nav className="hidden lg:flex items-center text-gray-800 font-semibold space-x-reverse rtl:space-x-reverse">
            <CategoryDropdown />
            <Link
              href="/about-us"
              className="px-2 hover:text-rose-600 transition"
            >
              درباره ما
            </Link>
            <Link
              href="/contact-us"
              className="px-2 hover:text-rose-600 transition"
            >
              تماس با ما
            </Link>
            <OrderTrackingLinkClient />
          </nav>

          {/* --- Desktop Searchbar (صرفا کلاینت) --- */}
          <HeaderSearch />

          {/* --- Desktop Actions --- */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              className="p-2 hover:bg-rose-50 rounded-full transition"
              aria-label="اعلان"
            >
              <BellIcon className="w-7 h-7 text-gray-600 hover:text-rose-500 transition" />
            </button>
            <CartButton />
            <UserBox />
          </div>
          {/* --- Cart Icon for Mobile --- */}
          <div className="lg:hidden flex items-center">
            <CartButton />
          </div>
        </div>
        <div className="block lg:hidden w-full px-4 pb-2 ">
          <MobileHeaderSearch />
        </div>{" "}
      </header>
    </>
  );
}
