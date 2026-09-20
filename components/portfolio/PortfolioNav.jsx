"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  { name: "home", path: "" },
  { name: "resume", path: "/resume" },
  { name: "work", path: "/work" },
  { name: "achievements", path: "/achievements" },
  { name: "certificates", path: "/certificates" },
  { name: "contact", path: "/contact" },
];

const PortfolioNav = ({ slug, base, visibility }) => {
  const pathname = usePathname();
  const rootPath = base || `/${slug}`;

  // Hide links for pages the owner turned off. Missing visibility → show all.
  const visibleSections = sections.filter((s) => visibility?.[s.name] !== false);

  return (
    <nav className="flex gap-8">
      {visibleSections.map((link) => {
        const href = `${rootPath}${link.path}`;
        const active = pathname === href;
        return (
          <Link
            href={href}
            key={link.name}
            className={`${active ? "text-accent border-b-2 border-accent" : ""} capitalize font-medium hover:text-accent transition-all`}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
};

export default PortfolioNav;
