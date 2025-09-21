import Image from "next/image";
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const BANNERS = [
  {
    id: 1,
    title: "اسنوهاک",
    image: `${NEXT_PUBLIC_BASE_URL}/media/52c4b247-c674-47cb-b2df-9d4edb4bfeb8.jpg`,
    link: "/چادر-اسنوهاک",
  },
  {
    id: 2,
    title: "پکینیو",
    image: `${NEXT_PUBLIC_BASE_URL}/media/aa900901-be86-423c-af9b-37bcc715b38a.jpg`,
    link: "/چادر-پکینیو",
  },
  {
    id: 3,
    title: "جدیدترین ها",
    image: `${NEXT_PUBLIC_BASE_URL}/media/54023595-c41f-420f-8261-3210fde603a7.jpg`,
    link: "/news",
  },
];

export default function TriplePromoBanners() {
  return (
    <section className="relative w-full py-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {BANNERS.map((b) => (
          <a
            key={b.id}
            href={b.link}
            className="relative flex-1 min-h-[180px] md:h-52 rounded-2xl overflow-hidden group"
          >
            <Image
              src={b.image}
              alt={b.title}
              fill
              sizes="(max-width:768px) 100vw, 33vw"
              className="object-cover transition scale-100 group-hover:scale-105"
              priority={b.id === 1}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <h3 className="absolute bottom-4 right-4 text-white text-xl font-extrabold drop-shadow">
              {b.title}
            </h3>
          </a>
        ))}
      </div>
    </section>
  );
}
