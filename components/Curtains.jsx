import { motion } from "framer-motion";
import { transitionTiming } from "@/lib/pageTransitions";

const T = transitionTiming("curtains");

const EASE = [0.65, 0, 0.35, 1];

// variants — each slat slides down out of its clipped row to reveal the
// page, and drops back in from above on exit, so both the reveal and the
// close sweep top-to-bottom (https://motion.dev/examples/js-curtains-blinds).
// The reveal waits `revealDelay` so the route content has already swapped
// behind the closed curtain (see PageTransition) — the slats open directly
// onto the new page. y overshoots past ±100% because parking exactly at the
// clip edge leaves a subpixel sliver of each slat visible as a hairline.
const curtainAnimation = {
  initial: {
    y: "0%",
  },
  animate: (index) => ({
    y: "105%",
    transition: {
      duration: T.duration,
      ease: EASE,
      delay: T.revealDelay + index * T.stagger,
    },
  }),
  exit: (index) => ({
    y: ["-105%", "0%"],
    transition: {
      duration: T.duration,
      ease: EASE,
      delay: index * T.stagger,
    },
  }),
};

const Curtains = () => {
  return (
    // own flex-col wrapper so the slats stack top-to-bottom, full width each
    <div className="h-full w-full flex flex-col">
      {[...Array(T.panels)].map((_, index) => {
        return (
          // overflow-hidden row so the slat vanishes as it slides out
          <div key={index} className="h-full w-full overflow-hidden">
            <motion.div
              custom={index}
              variants={curtainAnimation}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full w-full bg-white"
            />
          </div>
        );
      })}
    </div>
  );
};

export default Curtains;
