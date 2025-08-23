"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Header from "./header/Header";
import Footer from "./Footer";
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

type Province = { id: string; name: string };
type City = { id: string; name: string; provinceId: string };
type Address = {
  id: string;
  address: string;
  postalCode: string;
  provinceId?: string;
  cityId?: string;
};
type UserProfile = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  mobile: string;
  address: Address[];
};
type AddressForm = {
  name: string;
  lastName: string;
  email: string;
  mobile: string;
  postalCode: string;
  address: string;
  provinceId: string;
  cityId: string;
};

async function fetchProvinces(): Promise<Province[]> {
  const res = await fetch(`${NEXT_PUBLIC_BASE_URL}/user/getProvince`);
  const data = await res.json();
  return data?.data || [];
}
async function fetchCities(provinceId?: string): Promise<City[]> {
  const url = provinceId
    ? `${NEXT_PUBLIC_BASE_URL}/user/getCity?provinceId=${provinceId}`
    : `${NEXT_PUBLIC_BASE_URL}/user/getCity`;
  const res = await fetch(url);
  const data = await res.json();
  return data?.data || [];
}

async function completeInfo(
  token: string,
  userId: string,
  body: AddressForm
): Promise<true> {
  const res = await fetch(
    `${NEXT_PUBLIC_BASE_URL}/user/complateInfo/${userId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "خطا در ثبت اطلاعات");
  return true;
}

function getUserId(token: string): string | null {
  try {
    return JSON.parse(atob(token.split(".")[1])).id || null;
  } catch {
    return null;
  }
}

export default function UserCompleteInfo({
  user,
  redirectToCheckout = false,
}: {
  user: UserProfile;
  redirectToCheckout?: boolean;
}) {
  const firstAddress = user?.address?.[0];
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [searchProvince, setSearchProvince] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [form, setForm] = useState<AddressForm>({
    name: user?.name || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    postalCode: firstAddress?.postalCode || "",
    address: firstAddress?.address || "",
    provinceId: firstAddress?.provinceId || "",
    cityId: firstAddress?.cityId || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProvinces().then(setProvinces);
  }, []);
  useEffect(() => {
    if (form.provinceId) fetchCities(form.provinceId).then(setCities);
  }, [form.provinceId]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (e.target.name === "provinceId") setForm((f) => ({ ...f, cityId: "" }));
  }

  const filteredProvinces = provinces.filter((p) =>
    p.name.includes(searchProvince)
  );
  const filteredCities = cities.filter((c) => c.name.includes(searchCity));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const token = Cookies.get("token");
    const userId = getUserId(token || "");
    if (!userId) {
      setError("توکن کاربر نامعتبر است.");
      setLoading(false);
      return;
    }
    try {
      const selectedProvince = provinces.find((p) => p.id === form.provinceId);
      const selectedCity = cities.find((c) => c.id === form.cityId);

      const fullAddress = [
        form.address,
        selectedCity?.name,
        selectedProvince?.name,
      ]
        .filter(Boolean)
        .join("، ");

      await completeInfo(token!, userId, {
        ...form,
        address: fullAddress,
        postalCode: String(Number(form.postalCode)), // یا فقط Number() اگر backend Int هست
      });

      if (
        redirectToCheckout ||
        window.location.search.includes("fromCheckout")
      ) {
        window.location.replace("/checkout?addressAdded=1");
      } else {
        window.location.href = "/profile";
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطای ناشناخته‌ای رخ داد");
    }
    setLoading(false);
  }

  const inputClass =
    "border border-gray-300 focus:border-rose-500 focus:ring-rose-500 transition-all duration-200 rounded-lg px-4 py-2 w-full";

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <form
          className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 my-10"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <h2 className="text-xl font-bold text-rose-600 mb-6 text-center">
            تکمیل اطلاعات فردی و آدرس
          </h2>
          {error && (
            <div className="text-red-600 mb-4 text-center font-medium">
              {error}
            </div>
          )}

          {[
            { label: "نام", name: "name" },
            { label: "نام خانوادگی", name: "lastName" },
            { label: "ایمیل", name: "email", type: "email" },
            { label: "موبایل", name: "mobile", type: "tel" },
          ].map(({ label, name, type = "text" }) => (
            <div className="mb-4" key={name}>
              <label className="block mb-1 font-medium text-sm">{label}</label>
              <input
                name={name}
                className={inputClass}
                required
                type={type}
                value={form[name as keyof AddressForm]}
                onChange={handleChange}
              />
            </div>
          ))}

          <div className="mb-4">
            <label className="block mb-1 font-medium text-sm">استان</label>
            <input
              placeholder="جستجو استان..."
              className={`${inputClass} mb-2`}
              value={searchProvince}
              onChange={(e) => setSearchProvince(e.target.value)}
            />
            <select
              name="provinceId"
              className={inputClass}
              value={form.provinceId}
              required
              onChange={handleChange}
            >
              <option value="">انتخاب استان</option>
              {filteredProvinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium text-sm">شهر</label>
            <input
              placeholder="جستجو شهر..."
              className={`${inputClass} mb-2`}
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              disabled={!form.provinceId}
            />
            <select
              name="cityId"
              className={inputClass}
              value={form.cityId}
              required
              disabled={!form.provinceId}
              onChange={handleChange}
            >
              <option value="">انتخاب شهر</option>
              {filteredCities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium text-sm">آدرس دقیق</label>
            <input
              name="address"
              className={inputClass}
              required
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium text-sm">کد پستی</label>
            <input
              name="postalCode"
              className={inputClass}
              type="text"
              required
              value={form.postalCode}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition duration-200"
          >
            {loading ? "در حال ذخیره..." : "ذخیره و ادامه"}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
