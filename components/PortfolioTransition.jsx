"use client";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

// Panel components — one per entry in lib/pageTransitions.js
import Stairs from "./Stairs";
import Curtains from "./Curtains";

const OVERLAYS = {
  stairs: Stairs,
  curtains: Curtains,
};

/**
 * Full-screen overlay played on every route change inside a public
 * portfolio. The panel style is picked by the portfolio owner on the
 * dashboard Theme page (`theme.pageTransition`).
 */
const PortfolioTransition = ({ variant }) => {
  const pathname = usePathname();
  const Overlay = OVERLAYS[variant] || Stairs;
  return (
    <>
      <AnimatePresence mode="wait">
        <div key={pathname}>
          {/* Panels cover the screen themselves and open straight onto the
              page content — no dark holding layer for any variant */}
          <div className="h-screen w-screen fixed top-0 left-0 right-0 pointer-events-none z-40 flex">
            <Overlay />
          </div>
        </div>
      </AnimatePresence>
    </>
  );
};

export default PortfolioTransition;
