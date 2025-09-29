import Link from "next/link";

const ABOUT_DATA = {
  title: "کوه نگار",
  subtitle: "تجربه‌ای متفاوت در خرید .....",
  description: `.............................  `,
  features: [
    "ارسال سریع به سراسر کشور",
    "ضمانت اصالت کالا",
    "پشتیبانی تخصصی و دوستانه",
    "قیمت مناسب و رقابتی",
  ],
  image: "/myLogo.jpg",
  contact: {
    asfya_phone: ".........",
    aria_phone: "..........",
    email: "........@gmail.com",
    telegram: "https://t.me/......",
    instagram: "https://instagram.com/......",
    // اگر جای دیگر خواستی اضافه کن
  },
};

export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 border-t border-gray-100 mt-10 text-gray-200 shadow-sm z-40 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row md:justify-between gap-8">
          {/* --- برند و توضیح مختصر --- */}
          <div className="flex-1 flex flex-col items-start mb-6 md:mb-0">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={ABOUT_DATA.image}
                alt="کوه نگار لوگو"
                width={48}
                height={48}
                className="w-12 h-12 object-cover rounded-full border-2 border-rose-400 shadow-sm bg-white"
              />
              <span className="font-extrabold text-xl text-rose-600 leading-tight select-none">
                {ABOUT_DATA.title}
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-3 max-w-xs">
              {ABOUT_DATA.subtitle}
            </p>
            <p className="text-xs text-gray-500 mb-3 hidden md:block">
              {ABOUT_DATA.description}
            </p>

            {/* شبکه های اجتماعی */}
            <div className="flex gap-3 mt-3">
              <a
                href={ABOUT_DATA.contact.telegram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="تلگرام"
                className="hover:bg-rose-50 rounded-full p-2 border border-rose-100 transition"
              >
                {/* تلگرام */}
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21.89 3.551c-.248-.208-.598-.267-.903-.154l-18 6.499c-.312.113-.528.393-.573.719-.046.326.112.653.392.822l4.708 2.916 2.096 6.89c.104.342.393.59.737.615.019.002.038.003.056.003.327 0 .638-.195.772-.504l2.502-5.724 6.425 4.829a.771.771 0 00.88.041.79.79 0 00.36-.664l1.5-14c.037-.352-.129-.695-.448-.888zM16.626 18.946L9.217 13.93a.77.77 0 01-.303-.809l1.089-5.405 8.114 11.23a.77.77 0 01-1.491.8z"
                    fill="#229ED9"
                  />
                </svg>
              </a>
              <a
                href={ABOUT_DATA.contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="اینستاگرام"
                className="hover:bg-rose-50 rounded-full p-2 border border-rose-100 transition"
              >
                {/* اینستاگرام */}
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <rect
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="6"
                    fill="url(#paint0_linear_instagram)"
                  />
                  <circle cx="12" cy="12" r="5" fill="white" />
                  <circle cx="17" cy="7" r="1.2" fill="white" />
                  <defs>
                    <linearGradient
                      id="paint0_linear_instagram"
                      x1="2"
                      y1="2"
                      x2="22"
                      y2="22"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#FD5B60" />
                      <stop offset="1" stopColor="#FFC371" />
                    </linearGradient>
                  </defs>
                </svg>
              </a>
            </div>
          </div>
          {/* --- دسترسی سریع --- */}
          <div className="mb-6 md:mb-0 flex-1">
            <div className="font-semibold text-gray-700 text-lg mb-3">
              دسترسی سریع
            </div>
            <ul className="space-y-3 text-gray-600 text-base">
              <li>
                <Link href="#" className="hover:text-rose-600 transition">
                  حساب کاربری
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-rose-600 transition">
                  درباره ما
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-rose-600 transition">
                  تماس با ما
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-rose-600 transition">
                  جدید ترین ها
                </Link>
              </li>
            </ul>
          </div>
          {/* --- تماس و نماد --- */}
          <div className="flex-1 flex flex-col items-start gap-6 mt-4 md:mt-0">
            <div>
              <div className="font-semibold text-gray-700 text-lg mb-2">
                راه های ارتباطی
              </div>
              <div className="flex flex-col gap-2 text-rose-600 font-semibold text-sm">
                <a
                  href={`tel:${ABOUT_DATA.contact.aria_phone}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a2 2 0 011.94 1.47L12.34 7.6a2 2 0 01-.45 2.11l-2.2 2.2a11.05 11.05 0 005.64 5.64l2.2-2.2a2 2 0 012.11-.45l3.13 1.12A2 2 0 0121 18.72V21a2 2 0 01-2 2h-.72C8.61 23 1 15.39 1 6.72V6a2 2 0 012-1z"
                    />
                  </svg>
                  {ABOUT_DATA.contact.aria_phone}
                </a>
                <a
                  href={`tel:${ABOUT_DATA.contact.asfya_phone}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a2 2 0 011.94 1.47L12.34 7.6a2 2 0 01-.45 2.11l-2.2 2.2a11.05 11.05 0 005.64 5.64l2.2-2.2a2 2 0 012.11-.45l3.13 1.12A2 2 0 0121 18.72V21a2 2 0 01-2 2h-.72C8.61 23 1 15.39 1 6.72V6a2 2 0 012-1z"
                    />
                  </svg>
                  {ABOUT_DATA.contact.asfya_phone}
                </a>
                <a
                  href={`mailto:${ABOUT_DATA.contact.email}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 12H8m8 0l-4 4m4-4l-4-4"
                    />
                  </svg>
                  {ABOUT_DATA.contact.email}
                </a>
              </div>
            </div>
            {/* نماد اعتماد */}
            <div className="flex gap-2 items-center mt-4">
              <a
                referrerPolicy="origin"
                target="_blank"
                href="https://trustseal.enamad.ir/?id=652299&Code=x3MAKQLhYpVXpaAMwnDcInuSeEzq7xM3"
              >
                <img
                  referrerPolicy="origin"
                  src="https://trustseal.enamad.ir/logo.aspx?id=652299&Code=x3MAKQLhYpVXpaAMwnDcInuSeEzq7xM3"
                  alt="نماد اعتماد الکترونیکی"
                  width={88}
                  height={44}
                  className="h-11 object-contain"
                />
              </a>
              {/* می‌تونی سایر نمادها (ساماندهی، لوگوی شخصی و...) رو اضافه کنی */}
            </div>
          </div>
        </div>
        {/* --- پایین: کپی‌رایت --- */}
        <div className="border-t border-gray-200 mt-8 pt-5 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} {ABOUT_DATA.title} | تمامی حقوق محفوظ
          است.
          <br />
          طراحی و توسعه توسط{" "}
          <span className="font-semibold text-rose-600">تیم فنی کوه نگار</span>
        </div>
      </div>
    </footer>
  );
}
