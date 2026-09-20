"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import {
  FiUsers,
  FiLink,
  FiEdit,
  FiDroplet,
  FiSettings,
  FiMenu,
  FiX,
  FiLogOut,
} from "react-icons/fi";

/** A single row inside the dropdown menu. */
function MenuRow({ href, label, Icon, active, onClick }) {
  const base =
    "flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors text-left";
  if (href) {
    return (
      <Link
        href={href}
        role="menuitem"
        onClick={onClick}
        className={`${base} ${
          active ? "text-accent bg-white/5" : "text-white/80 hover:bg-white/5 hover:text-white"
        }`}
      >
        <Icon className="text-base shrink-0" /> {label}
      </Link>
    );
  }
  return (
    <button type="button" role="menuitem" onClick={onClick} className={`${base} ${label === "Log out" ? "text-red-300 hover:bg-red-500/10" : "text-white/80 hover:bg-white/5"}`}>
      <Icon className="text-base shrink-0" /> {label}
    </button>
  );
}

/**
 * Sticky dashboard top bar: logo (left), primary editor tabs (center), and a
 * hamburger menu (right) holding account/admin actions. On small screens the
 * center tabs collapse into the same menu so the bar never overflows.
 */
export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isAdmin = user?.userType === "admin";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Center bar: the portfolio-editing tabs.
  const primaryTabs = [
    { href: "/dashboard", label: "Editor", Icon: FiEdit },
    { href: "/dashboard/theme", label: "Theme", Icon: FiDroplet },
    { href: "/dashboard/portfolio-link", label: "Portfolio link", Icon: FiLink },
  ];

  // Menu: account + admin actions.
  const accountLinks = [
    { href: "/dashboard/settings", label: "Settings", Icon: FiSettings },
    ...(isAdmin ? [{ href: "/dashboard/users", label: "Users", Icon: FiUsers }] : []),
  ];

  // Dismiss on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Close whenever navigation happens.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 bg-primary/95 backdrop-blur border-b border-white/5 py-4 mb-8">
      <div className="flex items-center gap-4">
        {/* Left: logo */}
        <Link href="/" className="text-2xl font-semibold shrink-0">
          Folionce<span className="text-accent">.</span>
        </Link>

        {/* Center: primary tabs (hidden on small screens — they move into the menu) */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-2 flex-wrap">
          {primaryTabs.map(({ href, label, Icon }) => (
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
        </nav>

        {/* Right: hamburger menu */}
        <div className="relative shrink-0 ml-auto md:ml-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 text-white/80 hover:text-white hover:border-accent transition-colors"
          >
            {menuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-60 bg-[#232329] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
            >
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-sm text-white/80 truncate">{user?.email}</p>
              </div>

              {/* Primary tabs — only shown here on small screens */}
              <div className="md:hidden py-1 border-b border-white/5">
                {primaryTabs.map((t) => (
                  <MenuRow key={t.href} {...t} active={pathname === t.href} onClick={() => setMenuOpen(false)} />
                ))}
              </div>

              {/* Account + admin */}
              <div className="py-1">
                {accountLinks.map((l) => (
                  <MenuRow key={l.href} {...l} active={pathname === l.href} onClick={() => setMenuOpen(false)} />
                ))}
              </div>

              {/* Log out */}
              <div className="py-1 border-t border-white/5">
                <MenuRow
                  label="Log out"
                  Icon={FiLogOut}
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
