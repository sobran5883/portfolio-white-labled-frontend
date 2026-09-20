import { motion } from "framer-motion";
import { transitionTiming } from "@/lib/pageTransitions";

const T = transitionTiming("stairs");

// rightmost column moves first, so the wave sweeps right-to-left in both
// directions (same as the original stairs)
const reverseIndex = (index) => T.panels - index - 1;

// variants — full-height columns slide down out of view to reveal the page
// and rise back up from below on exit. The reveal waits `revealDelay` so the
// route content has already swapped behind the closed columns (see
// PageTransition) — the stairs open directly onto the new page.
const stairAnimation = {
  initial: {
    top: "0%",
  },
  animate: (index) => ({
    top: "100%",
    transition: {
      duration: T.duration,
      ease: "easeInOut",
      delay: T.revealDelay + reverseIndex(index) * T.stagger,
    },
  }),
  exit: (index) => ({
    top: ["100%", "0%"],
    transition: {
      duration: T.duration,
      ease: "easeInOut",
      delay: reverseIndex(index) * T.stagger,
    },
  }),
};

const Stairs = () => {
  return (
    <>
      {[...Array(T.panels)].map((_, index) => {
        return (
          <motion.div
            key={index}
            custom={index}
            variants={stairAnimation}
            initial="initial"
            animate="animate"
            exit="exit"
            className="h-full w-full bg-white relative"
          />
        );
      })}
    </>
  );
};

export default Stairs;
