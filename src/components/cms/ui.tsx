"use client";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, type Status } from "@/lib/cms/model";

const STATUS_STYLE: Record<Status, string> = {
  draft: "bg-[#EFE7D8] text-[#5B5350]",
  submitted: "bg-[#FBF0DA] text-[#885F19]",
  in_review: "bg-[#FBF0DA] text-[#885F19]",
  changes_requested: "bg-[#FBEDEA] text-[#7A2A24]",
  approved: "bg-[#E9EFE3] text-[#56634A]",
  scheduled: "bg-[#E6ECF5] text-[#3B5B8A]",
  published: "bg-[#56634A] text-white",
  archived: "bg-[#E5E1DC] text-[#6D645D]",
};

export function StatusBadge({ status }: { status: Status }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", STATUS_STYLE[status])}>{STATUS_LABELS[status]}</span>;
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl bg-white border border-[#E7DCC8] p-5", className)}>{children}</div>;
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50",
        variant === "primary" && "bg-[#6D252C] text-[#F7F2E8] hover:bg-[#5E1F25]",
        variant === "secondary" && "border border-[#6D252C]/30 text-[#6D252C] hover:bg-[#6D252C]/5",
        variant === "danger" && "border border-[#7A2A24]/30 text-[#7A2A24] hover:bg-[#FBEDEA]",
        variant === "ghost" && "text-[#6D252C] hover:bg-[#6D252C]/5",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-[#5B5350] mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-[#6D645D] mt-1">{hint}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#E7DCC8] bg-[#FFFCF6] px-3 py-2 text-sm text-[#2A1A1C] focus:outline-none focus:border-[#6D252C] focus:ring-2 focus:ring-[#6D252C]/10 disabled:opacity-70";

export function TextInput({ value, onChange, className, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & { value: string; onChange: (v: string) => void }) {
  return <input {...props} value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputClass, className)} />;
}

export function TextArea({ value, onChange, className, ...props }: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value"> & { value: string; onChange: (v: string) => void }) {
  return <textarea rows={2} {...props} value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputClass, "resize-y", className)} />;
}

export function Problems({ problems, message }: { problems: string[]; message?: string | null }) {
  if (!message && !problems.length) return null;
  return (
    <div role="alert" className="rounded-xl bg-[#FBEDEA] border border-[#EDC9C2] px-4 py-3 text-sm text-[#7A2A24]">
      {message && <p className="font-semibold">{message}</p>}
      {problems.length > 0 && (
        <ul className="mt-1 list-disc pl-5 space-y-0.5">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
