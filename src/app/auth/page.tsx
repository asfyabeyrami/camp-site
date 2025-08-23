"use client";
import { Suspense } from "react";
import AuthForm from "@/components/auth/page";

export default function Page() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
