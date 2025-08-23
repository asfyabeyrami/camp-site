"use client";
import { useState } from "react";
import { sendOtp } from "../lib/api";

export default function PhoneStep({ onSuccess }: { onSuccess: () => void }) {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  const isValidMobile = (value: string) => {
    // شماره باید دقیقا 10 رقم باشد و با 9 شروع شود
    return /^9\d{9}$/.test(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setMobile(raw);

    if (!isValidMobile(raw)) {
      setValidationError(
        "شماره موبایل معتبر نیست (باید با 9 شروع شود و 10 رقم باشد)"
      );
    } else {
      setValidationError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidMobile(mobile)) return;

    setLoading(true);
    setError("");

    try {
      const result = await sendOtp(mobile);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.message || "خطا در ارسال کد تأیید");
      }
    } catch (err) {
      console.log(err);
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="mobile"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          شماره موبایل
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-gray-500">98+</span>
          </div>
          <input
            id="mobile"
            type="tel"
            value={mobile}
            onChange={handleChange}
            className={`block w-full rounded-lg border ${
              validationError ? "border-red-500" : "border-gray-300"
            } shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 text-gray-800 pl-12`}
            placeholder="9123456789"
            maxLength={10}
            required
          />
        </div>

        {validationError ? (
          <p className="mt-2 text-sm text-red-600">{validationError}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">
            کد تأیید به این شماره ارسال خواهد شد
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !!validationError}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            در حال ارسال...
          </>
        ) : (
          "دریافت کد تأیید"
        )}
      </button>
    </form>
  );
}
