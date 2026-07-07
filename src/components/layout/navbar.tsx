"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, PlusCircle, User, LogOut } from "lucide-react";
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

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/communities", icon: Users, label: "Communities" },
    { href: "/communities/create", icon: PlusCircle, label: "Create", isCreate: true },
    ...(navUser?.username
      ? [{ href: `/profile/${navUser.username}`, icon: User, label: "Profile" }]
      : [{ href: "/login", icon: User, label: "Profile" }]),
  ];

  return (
    <>
      {/* ── Top bar: logo only ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="font-black text-xl tracking-tight">
              <span style={{ color: "#8B1A6B" }}>COM</span>
              <span style={{ color: "#2A5C27", fontStyle: "italic", fontFamily: "Georgia, serif" }}>ingle</span>
            </span>
          </Link>

          {/* Show login/signup in top bar only when not logged in */}
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

          {/* Avatar in top bar when logged in */}
          {navUser && (
            <Link href={`/profile/${navUser.username}`}>
              <Avatar src={navUser.avatar_url} name={navUser.full_name || "U"} size="sm" />
            </Link>
          )}
        </div>
      </header>

      {/* ── Bottom floating nav ── */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100 px-2 py-2 flex items-center justify-around">
          {navItems.map(({ href, icon: Icon, label, isCreate }: any) => {
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

          {/* Logout */}
          {navUser && (
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-gray-400 hover:text-red-500 transition-colors min-w-[56px]"
              title="Logout"
            >
              <LogOut className="h-5 w-5" strokeWidth={1.8} />
              <span className="text-[10px] font-medium leading-none">Logout</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
