"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type AccountType = "Keluarga" | "Vian" | "Marshella";

export function AccountToggle() {
  const [active, setActive] = useState<AccountType>("Keluarga");
  const accounts: AccountType[] = ["Keluarga", "Vian", "Marshella"];

  return (
    <div className="flex items-center justify-center p-1 bg-zinc-900/50 backdrop-blur-md rounded-full border border-white/5 shadow-2xl overflow-hidden w-fit">
      {accounts.map((acc) => (
        <button
          key={acc}
          onClick={() => setActive(acc)}
          className={cn(
            "relative px-6 py-2 text-sm font-medium transition-all duration-300 rounded-full",
            active === acc
              ? "text-white bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          )}
        >
          {acc}
        </button>
      ))}
    </div>
  );
}
