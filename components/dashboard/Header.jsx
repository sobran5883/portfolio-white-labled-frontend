"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { FiUsers, FiLink, FiEdit, FiDroplet } from "react-icons/fi";

/**
 * Sticky dashboard top bar with nav tabs. The current page's tab is filled,
 * the rest are outlined.
 */
export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isAdmin = user?.userType === "admin";

  const tabs = [
    { href: "/dashboard", label: "Editor", Icon: FiEdit },
    { href: "/dashboard/theme", label: "Theme", Icon: FiDroplet },
    ...(isAdmin ? [{ href: "/dashboard/users", label: "Users", Icon: FiUsers }] : []),
    { href: "/dashboard/portfolio-link", label: "Portfolio link", Icon: FiLink },
  ];

  return (
    <header className="sticky top-0 z-40 bg-primary/95 backdrop-blur border-b border-white/5 py-4 mb-8">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <Link href="/" className="text-2xl font-semibold">
            Folionce<span className="text-accent">.</span>
          </Link>
          <p className="text-white/50 text-sm mt-1">Signed in as {user?.email}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {tabs.map(({ href, label, Icon }) => (
            <Link key={href} href={href}>
              <Button
                variant={pathname === href ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                {label} <Icon />
              </Button>
            </Link>
          ))}
          <Button onClick={logout} variant="outline" size="sm">Log out</Button>
        </div>
      </div>
    </header>
  );
}
