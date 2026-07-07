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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <span className="font-black text-lg tracking-tight">
            <span style={{ color: "#8B1A6B" }}>COM</span>
            <span style={{ color: "#2A5C27", fontStyle: "italic", fontFamily: "Georgia, serif" }}>ingle</span>
          </span>
        </Link>

        <div className="flex items-center gap-0.5">
          {[
            { href: "/", icon: Home, label: "Home" },
            { href: "/communities", icon: Users, label: "Communities" },
            { href: "/communities/create", icon: PlusCircle, label: "Create" },
            ...(navUser?.username ? [{ href: `/profile/${navUser.username}`, icon: User, label: "Profile" }] : []),
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                pathname === href
                  ? "text-[#8B1A6B] bg-[#8B1A6B]/8"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:block">{label}</span>
            </Link>
          ))}

          {navUser ? (
            <div className="flex items-center gap-1 ml-1">
              <Link href={`/profile/${navUser.username}`}>
                <Avatar src={navUser.avatar_url} name={navUser.full_name || "U"} size="sm" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/login" className="text-xs font-medium text-gray-600 px-3 py-1.5 hover:text-gray-900">
                Log in
              </Link>
              <Link href="/signup" className="text-xs font-semibold bg-[#1E2952] text-white px-4 py-2 rounded-full hover:bg-[#16203D] transition-colors">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
