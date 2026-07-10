"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, PlusCircle, User, LogOut, Menu, Bell, Settings, FileText, ShieldCheck, UserCog, X, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { DEV_MODE, getDevProfile, clearDevSession } from "@/lib/dev-auth";
import { FloatingNav, type FloatingNavItem } from "@/components/floating-nav";

interface NavUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
}

const NOTIFICATIONS_POLL_MS = 20000;

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [navUser, setNavUser] = useState<NavUser | null>(null);
  // Distinct from navUser === null — that's ambiguous between "logged out"
  // and "haven't checked yet". Without this, the header defaults to showing
  // Log in/Sign up on every page load and flashes them away a beat later
  // once an already-logged-in user's session resolves.
  const [authChecked, setAuthChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const hideBottomNav = pathname.startsWith("/services/matrimonial/chat/");

  useEffect(() => {
    if (DEV_MODE) {
      const profile = getDevProfile();
      if (profile?.username) {
        setNavUser({
          id: profile.id,
          username: profile.username,
          full_name: profile.full_name || profile.username,
          avatar_url: profile.avatar_url,
        });
      }
      setAuthChecked(true);
      return;
    }

    // getSession() reads the persisted session from local storage — no
    // network round-trip — so this resolves fast enough to avoid a visible
    // flash. getUser() (which does hit the network to revalidate) still runs
    // for anything security-sensitive; this is just UI state.
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (!user) {
        setAuthChecked(true);
        return;
      }
      supabase.from("profiles").select("username, avatar_url, full_name")
        .eq("id", user.id).single()
        .then(({ data: p }) => {
          if (p) setNavUser({ id: user.id, username: p.username, full_name: p.full_name || p.username, avatar_url: p.avatar_url });
          setAuthChecked(true);
        });
    });

    // A logout is the only case that's immediately final here (no further
    // async work to wait on) — a session appearing is already handled by the
    // getSession() chain above, which gates authChecked on the profile fetch
    // too. Setting authChecked unconditionally in this listener would race
    // that chain: this fires as soon as the session is known, which can be
    // before the profile row has loaded, reintroducing the same flash this
    // effect exists to prevent.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        setNavUser(null);
        setAuthChecked(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Unread notifications badge — DEV_MODE has no real backend to query, same
  // as the rest of the notifications feature. Polled rather than realtime,
  // consistent with how chat itself already refreshes.
  useEffect(() => {
    if (DEV_MODE || !navUser?.id) {
      setUnreadCount(0);
      return;
    }
    const userId = navUser.id;
    let cancelled = false;
    const fetchUnread = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .is("read_at", null);
      if (!cancelled) setUnreadCount(count ?? 0);
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, NOTIFICATIONS_POLL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [navUser?.id]);

  // Opening the notifications page itself marks everything read server-side —
  // clear the badge immediately instead of waiting for the next poll tick.
  useEffect(() => {
    if (pathname === "/notifications") setUnreadCount(0);
  }, [pathname]);

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

  const floatingNavRoutes = [
    { id: "home", href: "/", icon: Home, label: "Home", color: { from: "#60A5FA", to: "#2563EB" } },
    { id: "communities", href: "/communities", icon: Users, label: "Communities", color: { from: "#C084FC", to: "#7E22CE" } },
    { id: "create", href: "/communities/create", icon: PlusCircle, label: "Create", color: { from: "#4ADE80", to: "#15803D" } },
    {
      id: "profile",
      href: navUser?.username ? `/profile/${navUser.username}` : "/login",
      icon: User,
      label: "Profile",
      color: { from: "#F472B6", to: "#BE185D" },
    },
  ];
  const activeNavId = floatingNavRoutes.find((route) => route.href === pathname)?.id;
  const floatingNavItems: FloatingNavItem[] = floatingNavRoutes.map(({ href, ...item }) => ({
    ...item,
    onSelect: () => router.push(href),
  }));

  return (
    <>
      {/* ── Top bar: hamburger, logo, notifications, avatar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F7F7F8]/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="w-9 h-9 -ml-1.5 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* flex-1 on both sides of the logo keeps it centered between the
              hamburger and the right-hand controls, shrinking gracefully
              instead of overlapping them on narrow screens (unlike
              absolute-centering, which ignores sibling widths entirely). */}
          <div className="flex-1 flex justify-center min-w-0">
            <Link href="/" className="flex items-center min-w-0">
              <img src="/comingle-logo.svg" alt="Comingle" className="h-7 w-auto max-w-full" />
            </Link>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Link
              href={navUser ? "/notifications" : "/login"}
              aria-label="Notifications"
              className="relative w-9 h-9 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {authChecked && !navUser && (
              <div className="flex items-center gap-2">
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
              ) : authChecked ? (
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
              ) : null}
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

      {/* ── Floating nav ──
          Hidden on the matrimonial chat thread — it already has its own
          fixed compose bar at the bottom, which would otherwise compete
          with this for the same screen space. */}
      {!hideBottomNav && <FloatingNav items={floatingNavItems} activeId={activeNavId} storageKey="comingle-floating-nav-dock" />}
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
