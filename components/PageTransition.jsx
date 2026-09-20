"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { transitionTiming } from "@/lib/pageTransitions";

/**
 * The overlay panels (stairs / curtains) reveal the real page directly, so
 * there is no dark holding layer here. The exit is a visual no-op (opacity
 * 1 → 0.99) whose only job is to keep the old page mounted until the panels
 * have fully closed over it; the new page then mounts behind full cover,
 * before the staggered reveal starts.
 */
const PageTransition = ({ children, variant }) => {
  const pathname = usePathname();
  const { contentHold } = transitionTiming(variant);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        exit={{ opacity: 0.99, transition: { duration: contentHold } }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
