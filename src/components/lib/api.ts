const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const sendOtp = async (mobile: string) => {
  const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/auth/send-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify({ mobile }),
  });
  return await response.json();
};

export const verifyOtp = async (code: number) => {
  const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify({ code }),
  });
  return await response.json();
};
