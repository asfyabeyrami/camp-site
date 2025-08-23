"use client";
import { useState } from "react";
import MobileDrawer from "./MobileDrawer";
import { Bars3Icon } from "@heroicons/react/24/outline";

export default function MobileDrawerClient() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        aria-label="باز کردن منو"
        onClick={() => setOpen(true)}
        className="rounded-full p-2 hover:bg-rose-50 active:bg-rose-100 transition"
      >
        <Bars3Icon className="w-7 h-7 text-rose-500" />
      </button>
      <MobileDrawer open={open} setOpen={setOpen} />
    </>
  );
}
