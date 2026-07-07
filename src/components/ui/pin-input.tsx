"use client";
import { useRef, KeyboardEvent, ClipboardEvent } from "react";
import { cn } from "@/lib/utils";

interface PinInputProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
  disabled?: boolean;
}

export function PinInput({ value, onChange, length = 4, disabled }: PinInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return;
    const arr = value.split("");
    arr[index] = char.slice(-1);
    const next = arr.join("").slice(0, length);
    onChange(next);
    if (char && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (value[index]) {
        const arr = value.split("");
        arr[index] = "";
        onChange(arr.join(""));
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
        const arr = value.split("");
        arr[index - 1] = "";
        onChange(arr.join(""));
      }
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(text);
    refs.current[Math.min(text.length, length - 1)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            "pin-box",
            value[i] && "filled"
          )}
        />
      ))}
    </div>
  );
}
