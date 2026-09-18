"use client";

import { useEffect, useState } from "react";

export default function Topbar({ title, sub }: { title: string; sub: string }) {
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => {
      setClock(
        new Date().toLocaleString(undefined, {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="mb-5 flex items-end justify-between">
      <div>
        <h1 className="font-display text-[26px] font-semibold">{title}</h1>
        <p className="mt-1 text-[13.5px] text-text-muted">{sub}</p>
      </div>
      <div
        className="rounded-full border px-3.5 py-1.5 font-mono text-[13px] tracking-wide"
        style={{
          color: "#ff3b57",
          borderColor: "rgba(255,59,87,0.35)",
          background: "rgba(255,59,87,0.06)",
          textShadow: "0 0 6px rgba(255,59,87,0.85), 0 0 16px rgba(255,59,87,0.45)",
        }}
      >
        {clock}
      </div>
    </header>
  );
}
