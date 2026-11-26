"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function Unsubscribe() {
  const params = useSearchParams();
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const confirm = async () => {
    setState("sending");
    const res = await fetch("/api/unsubscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: params.get("id"), t: params.get("t") }) }).catch(() => null);
    setState(res?.ok ? "done" : "error");
  };
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 text-center">
      <Link href="/" className="text-xl font-bold text-[#6D252C]">
        WePray
      </Link>
      {state === "done" ? (
        <>
          <h1 className="mt-6 text-2xl font-bold text-[#2A1A1C]">You&apos;re unsubscribed</h1>
          <p className="mt-2 text-[#5B5350]">We won&apos;t email you again. आपको अब ईमेल नहीं भेजे जाएँगे।</p>
        </>
      ) : (
        <>
          <h1 className="mt-6 text-2xl font-bold text-[#2A1A1C]">Unsubscribe from WePray emails?</h1>
          <p className="mt-2 text-[#5B5350]">WePray के ईमेल बंद करें?</p>
          <button type="button" onClick={confirm} disabled={state === "sending"} className="mt-6 rounded-full bg-[#6D252C] px-6 py-3 font-bold text-[#F7F2E8] disabled:opacity-60">
            Unsubscribe · सदस्यता छोड़ें
          </button>
          {state === "error" && <p className="mt-3 text-sm text-[#B4442F]">This link isn&apos;t valid. Please write to us from the Contact page.</p>}
        </>
      )}
    </main>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense>
      <Unsubscribe />
    </Suspense>
  );
}
