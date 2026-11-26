"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BookText, Flower2, LayoutDashboard, Loader2, LogOut, Mail, ScrollText, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABELS, can, type Actor } from "@/lib/cms/model";
import { signInWithGoogle, signOut } from "@/lib/practice/sync";
import { api } from "./api";
import { Button, Card } from "./ui";

const ActorContext = createContext<Actor | null>(null);

/** The signed-in CMS user (always set inside the CMS pages). */
export function useActor(): Actor {
  const actor = useContext(ActorContext);
  if (!actor) throw new Error("useActor outside CmsShell");
  return actor;
}

function SignIn({ email, onSignedIn }: { email: string | null; onSignedIn: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#885F19]">WePray</p>
        <h1 className="mt-1 text-2xl font-bold text-[#2A1A1C]">Content management</h1>
        {email ? (
          <p className="mt-3 text-sm text-[#7A2A24]">
            {`${email} doesn't have access to the CMS yet. Ask a Super Admin to add this email under Access, or sign in with the admin password below.`}
          </p>
        ) : (
          <p className="mt-2 text-sm text-[#5B5350]">Sign in with the Google account your administrator added, or with the admin password.</p>
        )}
        <Button
          className="mt-5 w-full py-2.5"
          variant="secondary"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            if (email) await signOut();
            const err = await signInWithGoogle();
            if (err) {
              setBusy(false);
              setError(err);
            }
          }}
        >
          {email ? "Use a different Google account" : "Continue with Google"}
        </Button>
        <form
          className="mt-5 border-t border-[#E7DCC8] pt-5 space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError(null);
            const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
            setBusy(false);
            if (res.ok) onSignedIn();
            else setError("That password isn't right.");
          }}
        >
          <label className="block text-xs font-semibold text-[#5B5350]" htmlFor="cms-password">
            Admin password
          </label>
          <input
            id="cms-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[#E7DCC8] bg-[#FFFCF6] px-3 py-2 text-sm focus:outline-none focus:border-[#6D252C]"
          />
          <Button type="submit" className="w-full py-2.5" disabled={busy || !password}>
            Sign in
          </Button>
        </form>
        {error && (
          <p role="alert" className="mt-3 text-sm text-[#7A2A24]">
            {error}
          </p>
        )}
      </Card>
    </div>
  );
}

export function CmsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<{ actor: Actor | null; email: string | null } | null>(null);

  const load = () =>
    api<{ actor: Actor | null; email: string | null }>("/api/cms/me")
      .then(setState)
      .catch(() => setState({ actor: null, email: null }));
  useEffect(() => {
    void load();
  }, []);

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#6D645D]" aria-label="Loading" />
      </div>
    );
  }
  if (!state.actor) return <SignIn email={state.email} onSignedIn={load} />;

  const actor = state.actor;
  const nav = [
    { href: "/cms", label: "Dashboard", icon: LayoutDashboard, show: true },
    { href: "/cms/prayer", label: "Prayers", icon: BookOpen, show: true },
    { href: "/cms/meditation", label: "Meditations", icon: Flower2, show: true },
    { href: "/cms/verse", label: "Daily Dhamma", icon: Sparkles, show: true },
    { href: "/cms/story", label: "Jātaka tales", icon: BookText, show: true },
    { href: "/cms/subscribers", label: "Subscribers", icon: Mail, show: can(actor, "manage_roles") },
    { href: "/cms/access", label: "Access", icon: Users, show: can(actor, "manage_roles") },
    { href: "/cms/audit", label: "Audit log", icon: ScrollText, show: can(actor, "publish") },
  ].filter((n) => n.show);

  return (
    <ActorContext.Provider value={actor}>
      <header className="sticky top-0 z-30 bg-[#F7F2E8]/95 backdrop-blur border-b border-[#E7DCC8]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/cms" className="font-bold text-[#6D252C] whitespace-nowrap">
            WePray CMS
          </Link>
          <nav aria-label="CMS" className="flex-1 flex gap-1 overflow-x-auto [scrollbar-width:none]">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = href === "/cms" ? pathname === "/cms" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap",
                    active ? "bg-[#6D252C] text-[#F7F2E8]" : "text-[#5B5350] hover:bg-[#6D252C]/5",
                  )}
                >
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden sm:block text-right leading-tight">
            <p className="text-sm font-semibold text-[#2A1A1C] truncate max-w-[12rem]">{actor.name}</p>
            <p className="text-xs text-[#6D645D]">{ROLE_LABELS[actor.role]}</p>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              await signOut();
              setState({ actor: null, email: null });
            }}
            className="rounded-full p-2 text-[#6D645D] hover:bg-[#6D252C]/5"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </ActorContext.Provider>
  );
}
