"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, PlusCircle, User, LogOut, Menu, Bell, Settings, FileText, ShieldCheck, UserCog, X, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { DEV_MODE, getDevProfile, clearDevSession } from "@/lib/dev-auth";

interface NavUser {
  username: string;
  full_name: string;
  avatar_url: string | null;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [navUser, setNavUser] = useState<NavUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (DEV_MODE) {
      const profile = getDevProfile();
      if (profile?.username) {
        setNavUser({
          username: profile.username,
          full_name: profile.full_name || profile.username,
          avatar_url: profile.avatar_url,
        });
      }
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from("profiles").select("username, avatar_url, full_name")
          .eq("id", data.user.id).single()
          .then(({ data: p }) => {
            if (p) setNavUser({ username: p.username, full_name: p.full_name || p.username, avatar_url: p.avatar_url });
          });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) setNavUser(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (DEV_MODE) {
      clearDevSession();
      setNavUser(null);
      router.push("/onboarding");
      return;
    }
    await supabase.auth.signOut();
    router.push("/onboarding");
    router.refresh();
  };

  const navItems: { href: string; icon: LucideIcon; label: string; isCreate?: boolean }[] = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/communities", icon: Users, label: "Communities" },
    { href: "/communities/create", icon: PlusCircle, label: "Create", isCreate: true },
    navUser?.username
      ? { href: `/profile/${navUser.username}`, icon: User, label: "Profile" }
      : { href: "/login", icon: User, label: "Profile" },
  ];

  return (
    <>
      {/* ── Top bar: hamburger, logo, notifications, avatar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="w-9 h-9 -ml-1.5 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center">
              <span className="font-black text-xl tracking-tight">
                <span style={{ color: "#8B1A6B" }}>COM</span>
                <span style={{ color: "#2A5C27", fontStyle: "italic", fontFamily: "Georgia, serif" }}>ingle</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={navUser ? "/notifications" : "/login"}
              aria-label="Notifications"
              className="w-9 h-9 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Bell className="h-5 w-5" />
            </Link>

            {!navUser && (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-xs font-medium text-gray-600 px-3 py-1.5 hover:text-gray-900">
                  Log in
                </Link>
                <Link href="/signup" className="text-xs font-semibold bg-[#1E2952] text-white px-4 py-2 rounded-full hover:bg-[#16203D] transition-colors">
                  Sign up
                </Link>
              </div>
            )}

            {navUser && (
              <Link href={`/profile/${navUser.username}`}>
                <Avatar src={navUser.avatar_url} name={navUser.full_name || "U"} size="sm" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Hamburger drawer ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div
            className="absolute inset-0 bg-gray-900/50"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80%] h-full bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
              {navUser ? (
                <Link
                  href={`/profile/${navUser.username}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 min-w-0"
                >
                  <Avatar src={navUser.avatar_url} name={navUser.full_name || "U"} size="md" />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{navUser.full_name}</p>
                    <p className="text-xs text-gray-400 truncate">@{navUser.username}</p>
                  </div>
                </Link>
              ) : (
                <div>
                  <p className="font-bold text-gray-900 text-sm mb-2">Welcome to Comingle</p>
                  <div className="flex gap-2">
                    <Link href="/login" onClick={() => setMenuOpen(false)} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50">
                      Log in
                    </Link>
                    <Link href="/signup" onClick={() => setMenuOpen(false)} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#1E2952] text-white hover:bg-[#16203D]">
                      Sign up
                    </Link>
                  </div>
                </div>
              )}
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-2">
              {navUser && (
                <>
                  <DrawerLink href="/profile/edit" icon={UserCog} label="Edit Profile" onNavigate={() => setMenuOpen(false)} />
                  <DrawerLink href="/settings" icon={Settings} label="Settings" onNavigate={() => setMenuOpen(false)} />
                  <div className="my-2 border-t border-gray-100" />
                </>
              )}
              <DrawerLink href="/terms" icon={FileText} label="Terms & Conditions" onNavigate={() => setMenuOpen(false)} />
              <DrawerLink href="/privacy" icon={ShieldCheck} label="Privacy Policy" onNavigate={() => setMenuOpen(false)} />
            </nav>

            {navUser && (
              <div className="p-3 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium text-sm transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Bottom floating nav ── */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100 px-2 py-2 flex items-center justify-around">
          {navItems.map(({ href, icon: Icon, label, isCreate }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px]",
                  isCreate
                    ? "bg-[#8B1A6B] text-white shadow-md scale-110 -mt-3"
                    : active
                    ? "text-[#8B1A6B]"
                    : "text-gray-400 hover:text-gray-700"
                )}
              >
                <Icon className={cn("h-5 w-5", isCreate && "h-6 w-6")} strokeWidth={active || isCreate ? 2.5 : 1.8} />
                <span className={cn("text-[10px] font-medium leading-none", isCreate && "text-[9px]")}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function DrawerLink({
  href,
  icon: Icon,
  label,
  onNavigate,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <Icon className="h-4 w-4 text-gray-400" />
      {label}
    </Link>
  );
}
