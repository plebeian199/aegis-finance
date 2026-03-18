"use client";

import { useState, useCallback } from "react";

/**
 * A custom hook for currency inputs with Indonesian thousands separator (dots).
 * - `displayValue`: the formatted string to show in the input (e.g. "1.500.000")
 * - `rawValue`: the numeric string to submit in forms (e.g. "1500000")
 * - `handleChange`: attach to onChange of an <input type="text">
 * - `reset`: clears the field
 */
export function useCurrencyInput(initial = "") {
  const format = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (!digits) return "";
    return Number(digits).toLocaleString("id-ID");
  };

  const [displayValue, setDisplayValue] = useState(format(initial));
  const rawValue = displayValue.replace(/\./g, "");

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(format(e.target.value));
  }, []);

  const reset = useCallback(() => setDisplayValue(""), []);

  return { displayValue, rawValue, handleChange, reset };
}
