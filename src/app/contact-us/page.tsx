import Header from "@/components/header/Header";
import Footer from "@/components/Footer";
import React from "react";
import ContactForm from "@/components/ContactForm";

const CONTACT_DATA = {
  address:
    "دفتر مرکزی تیم پشتیبانی فنی : استان مرکزی , اراک , خیابان ملک، خیابان شهیدرجایی، خیابان شهید قدوسی، پارک علم وفناوری استان مرکزی، طبقه:3 ",
  phone: "09182574184",
  email: "abeyrami2005@gmail.com",
  worktime: "همه روزه ۹ الی ۱۸",
  mapLink: "https://maps.app.goo.gl/W8kXrcn67hL93fS3A",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow flex flex-col items-center px-4 py-8">
        <div className="bg-white w-full max-w-3xl shadow-xl rounded-xl p-8 flex flex-col items-center mb-10">
          <h1 className="text-3xl font-bold mb-2 text-rose-600 text-center">
            تماس با ما
          </h1>
          <h2 className="text-lg md:text-xl text-gray-700 mb-7 text-center">
            منتظر شنیدن صدای گرم شما هستیم!
          </h2>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-8">
            <div className="space-y-4 text-gray-700 text-center md:text-right">
              <div>
                <span className="font-semibold text-rose-500">آدرس: </span>
                {CONTACT_DATA.address}
              </div>
              <div>
                <span className="font-semibold text-rose-500">تلفن: </span>
                {CONTACT_DATA.phone}
              </div>
              <div>
                <span className="font-semibold text-rose-500">ایمیل: </span>
                {CONTACT_DATA.email}
              </div>
              <div>
                <span className="font-semibold text-rose-500">
                  ساعات کاری:{" "}
                </span>
                {CONTACT_DATA.worktime}
              </div>
              {CONTACT_DATA.mapLink && (
                <a
                  href={CONTACT_DATA.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-blue-500 underline"
                >
                  مشاهده روی نقشه
                </a>
              )}
            </div>
            <div>
              <img
                src="/myLogo.jpg"
                alt="تماس با ما"
                className="w-28 h-28 md:w-40 md:h-40 object-cover rounded-full border-4 border-black-600 -mt-16 mb-4 shadow-lg"
              />
            </div>
          </div>
          {/* فرم تماس */}
          <ContactForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
