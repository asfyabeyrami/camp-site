// import Header from "@/components/header/Header";
// import Footer from "@/components/Footer";

// const ABOUT_DATA = {
//   title: "درباره فروشگاه ما",
//   subtitle: "تجربه‌ای متفاوت در خرید قطعات یدکی",
//   description: `
//     فروشگاه ما با تکیه بر سال‌ها تجربه و تخصص، تلاش می‌کند بهترین قطعات یدکی را با قیمتی مناسب و کیفیتی تضمین‌شده به مشتریان عزیز ارائه دهد.
//     ما با مجموعه‌ای متنوع از محصولات اصل، مسیر خرید قطعات را برای شما آسان‌تر و مطمئن‌تر کرده‌ایم.
//   `,
//   features: [
//     "ارسال سریع به سراسر کشور",
//     "ضمانت اصالت کالا",
//     "پشتیبانی تخصصی و دوستانه",
//     "قیمت مناسب و رقابتی",
//   ],
//   image: "/myLogo.jpg",
//   contact: {
//     phone: "09182574184",
//     email: "abeyrami2005@gmail.com",
//   },
// };

// // ----- صفحه اصلی -----
// export default function AboutPage() {
//   return (
//     <div className="min-h-screen flex flex-col bg-gray-50">
//       <Header />
//       <main className="flex-grow flex flex-col items-center px-4 py-8">
//         <div className="bg-white w-full max-w-3xl shadow-xl rounded-xl p-8 flex flex-col items-center">
//           <img
//             src={ABOUT_DATA.image}
//             alt="درباره ما"
//             className="w-28 h-28 md:w-40 md:h-40 object-cover rounded-full border-4 border-black-600 -mt-16 mb-4 shadow-lg"
//           />
//           <h1 className="text-3xl font-bold mb-2 text-rose-600 text-center">
//             {ABOUT_DATA.title}
//           </h1>
//           <h2 className="text-lg md:text-xl text-gray-700 mb-4 text-center">
//             {ABOUT_DATA.subtitle}
//           </h2>
//           <p className="text-base md:text-lg text-gray-700 leading-relaxed text-center mb-8">
//             {ABOUT_DATA.description}
//           </p>
//           <div className="w-full flex flex-col items-center mb-6">
//             <h3 className="font-semibold text-rose-500 mb-3 text-xl">
//               مزایای ما
//             </h3>
//             <ul className="space-y-2 w-full text-gray-600 text-center">
//               {ABOUT_DATA.features.map((f, i) => (
//                 <li key={i} className="flex items-center justify-center gap-2">
//                   <span className="inline-block w-2 h-2 bg-rose-500 rounded-full"></span>
//                   {f}
//                 </li>
//               ))}
//             </ul>
//           </div>
//           <div className="w-full mt-8">
//             <div className="flex flex-col md:flex-row justify-center items-center gap-6">
//               <div className="flex items-center gap-2 text-rose-600 font-bold">
//                 <svg
//                   className="w-5 h-5"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M3 5a2 2 0 012-2h3.28a2 2 0 011.94 1.47L12.34 7.6a2 2 0 01-.45 2.11l-2.2 2.2a11.05 11.05 0 005.64 5.64l2.2-2.2a2 2 0 012.11-.45l3.13 1.12A2 2 0 0121 18.72V21a2 2 0 01-2 2h-.72C8.61 23 1 15.39 1 6.72V6a2 2 0 012-1z"
//                   />
//                 </svg>
//                 <span>{ABOUT_DATA.contact.phone}</span>
//               </div>
//               <div className="flex items-center gap-2 text-rose-600 font-bold">
//                 <svg
//                   className="w-5 h-5"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M16 12H8m8 0l-4 4m4-4l-4-4"
//                   />
//                 </svg>
//                 <span>{ABOUT_DATA.contact.email}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   );
// }
