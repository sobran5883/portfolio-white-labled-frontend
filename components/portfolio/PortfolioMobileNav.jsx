"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CiMenuFries } from "react-icons/ci";

const sections = [
  { name: "home", path: "" },
  { name: "resume", path: "/resume" },
  { name: "work", path: "/work" },
  { name: "achievements", path: "/achievements" },
  { name: "certificates", path: "/certificates" },
  { name: "contact", path: "/contact" },
];

const PortfolioMobileNav = ({ slug, logoText }) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const base = `/${slug}`;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="flex justify-center items-center">
        <CiMenuFries className="text-2xl text-accent" />
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <div className="mt-24 mb-10 text-center text-2xl">
          <Link onClick={() => setOpen(false)} href={base}>
            <h1>
              {logoText}
              <span className="text-accent">.</span>
            </h1>
          </Link>
        </div>
        <nav className="flex flex-col justify-center items-center gap-8">
          {sections.map((link) => {
            const href = `${base}${link.path}`;
            return (
              <Link
                onClick={() => setOpen(false)}
                href={href}
                key={link.name}
                className={`${pathname === href ? "text-accent border-b-2 border-accent" : ""} text-xl capitalize hover:text-accent transition-all`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default PortfolioMobileNav;
