"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const COUNTRY_CODES = [
  { code: "IN", dial: "+91", label: "IND" },
  { code: "US", dial: "+1", label: "USA" },
  { code: "GB", dial: "+44", label: "GBR" },
  { code: "ID", dial: "+62", label: "INA" },
  { code: "AE", dial: "+971", label: "UAE" },
  { code: "SG", dial: "+65", label: "SGP" },
  { code: "CA", dial: "+1", label: "CAN" },
  { code: "AU", dial: "+61", label: "AUS" },
];

interface PhoneInputProps {
  value: string;
  onChange: (phone: string, dialCode: string) => void;
  error?: string;
}

export function PhoneInput({ value, onChange, error }: PhoneInputProps) {
  const [selected, setSelected] = useState(COUNTRY_CODES[0]);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">Phone Number</label>
      <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden focus-within:border-[#8B1A6B] focus-within:ring-2 focus-within:ring-[#8B1A6B]/15 transition-all">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1 px-3 py-3 text-sm font-semibold text-gray-700 border-r border-gray-200 hover:bg-gray-50 transition-colors min-w-[80px]"
          >
            <span>{selected.label}</span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>
          {open && (
            <div className="absolute top-full left-0 z-50 mt-1 w-40 bg-white rounded-xl shadow-lg py-1 max-h-52 overflow-y-auto">
              {COUNTRY_CODES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { setSelected(c); setOpen(false); onChange(value, c.dial); }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <span className="font-semibold text-gray-800">{c.dial}</span>
                  <span className="text-gray-500">{c.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center px-2 text-sm text-gray-400 font-medium">
          {selected.dial}
        </div>
        <input
          type="tel"
          inputMode="numeric"
          placeholder="00000 00000"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""), selected.dial)}
          className="flex-1 px-2 py-3 text-sm bg-transparent focus:outline-none text-gray-900"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
