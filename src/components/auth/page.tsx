"use client";
import { useState } from "react";
import Cookies from "js-cookie";
import Image from "next/image";
import logo from "@/../public/myLogo.jpg";
import PhoneStep from "@/components/auth/PhoneStep";
import OtpStep from "@/components/auth/OtpStep";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
export default function AuthForm() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const router = useRouter();
  const searchParams = useSearchParams();

  let redirectRaw = searchParams.get("redirect") || "/";
  try {
    redirectRaw = decodeURIComponent(redirectRaw);
  } catch {}
  const redirect = redirectRaw.startsWith("/")
    ? redirectRaw
    : `/${redirectRaw}`;

  const handlePhoneSuccess = () => {
    setStep("otp");
  };
  const handleOtpSuccess = (token: string) => {
    Cookies.set("token", token, { expires: 7 });
    router.push(redirect);
  };
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* لوگوی دسکتاپ */}
      <div className="hidden md:flex w-2/3 bg-gradient-to-br from-indigo-900 to-purple-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.svg')] bg-cover opacity-30"></div>
        </div>
        <div className="relative z-10 text-center max-w-2xl">
          <div className="mb-8 transition-transform hover:scale-105 duration-500">
            <Image
              src={logo}
              alt="لوگوی کوه نگار"
              width={600}
              height={600}
              className="mx-auto w-full max-w-lg h-auto drop-shadow-2xl"
              priority
            />
          </div>
          <h2 className="text-white text-4xl font-bold mb-6 animate-fade-in">
            به کوه نگار خوش آمدید
          </h2>
          <p className="text-indigo-200 text-xl max-w-lg mx-auto leading-relaxed">
            تجربه‌ای متفاوت و حرفه‌ای در خرید .......
          </p>
        </div>
      </div>
      {/* فرم - دسکتاپ و موبایل */}
      <div className="w-full md:w-1/3 flex items-center justify-center p-6 md:p-12 bg-white shadow-xl">
        <div className="w-full max-w-md">
          {/* لوگوی موبایل */}
          <div className="md:hidden mb-10 flex justify-center">
            <Image
              src={logo}
              alt="لوگوی کوه نگار"
              width={180}
              height={180}
              className="w-40 h-auto"
            />
          </div>
          {/* فرم */}
          <div className="bg-white rounded-2xl">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              {step === "phone" ? "ورود / ثبت نام" : "تأیید کد"}
            </h2>
            {step === "phone" ? (
              <PhoneStep onSuccess={handlePhoneSuccess} />
            ) : (
              <OtpStep onSuccess={handleOtpSuccess} />
            )}
          </div>
          {/* فوتر */}
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500">
              با ادامه فرایند، با{" "}
              <Link href="#" className="text-indigo-600 hover:underline">
                شرایط و قوانین
              </Link>{" "}
              موافقت می‌کنید
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
