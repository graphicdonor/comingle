"use client";
import { Search, X } from "lucide-react";
import { useState } from "react";

interface SearchFieldProps {
  defaultValue?: string;
  placeholder: string;
  onSubmit: (value: string) => void;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
}

export function SearchField({
  defaultValue = "",
  placeholder,
  onSubmit,
  className = "flex items-center gap-2 bg-white rounded-full px-4 py-2.5 border border-gray-200 shadow-sm",
  inputClassName = "flex-1 text-sm bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400",
  autoFocus,
}: SearchFieldProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <form
      role="search"
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value.trim());
      }}
    >
      <Search className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
        autoFocus={autoFocus}
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            onSubmit("");
          }}
          aria-label="Clear search"
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
