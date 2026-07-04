"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { BsArrowUpRight } from "react-icons/bs";
import { FiX, FiImage } from "react-icons/fi";

const AchievementsSection = ({ portfolio }) => {
  const achievements = portfolio.achievements || [];
  const [active, setActive] = useState(null);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 1.2, duration: 0.4, ease: "easeIn" } }}
      className="min-h-[80vh] py-12 xl:py-6"
    >
      <div className="container mx-auto">
        <div className="flex flex-col gap-3 text-center xl:text-left mb-10">
          <h2 className="text-4xl xl:text-5xl font-bold">
            Achievements & <span className="text-accent">Contributions</span>
          </h2>
          <p className="max-w-[640px] text-white/60 mx-auto xl:mx-0">
            A snapshot of highlights, contributions and impact.
          </p>
        </div>

        {achievements.length === 0 ? (
          <p className="text-white/50">No achievements added yet.</p>
        ) : (
          <motion.ul
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {achievements.map((item, index) => (
              <motion.li
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
                }}
                onClick={() => item.image && setActive(item)}
                className="group relative cursor-pointer rounded-2xl bg-[#232329] border border-white/5 overflow-hidden
                           transition-all duration-300 hover:border-accent/60 hover:-translate-y-2"
              >
                <div className="relative h-[190px] overflow-hidden bg-[#1c1c22] flex items-center justify-center">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <FiImage className="text-white/20 text-6xl" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#232329] via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 text-5xl font-extrabold text-white/10 leading-none select-none">
                    {item.num}
                  </span>
                  <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-accent text-primary flex items-center justify-center opacity-0 -translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    <BsArrowUpRight className="text-lg" />
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-3">
                  <span className="text-accent text-xs font-semibold uppercase tracking-wider">
                    {item.category}
                  </span>
                  <h3 className="text-lg font-semibold leading-snug group-hover:text-accent transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">{item.description}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(item.tags || []).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-white/70 border border-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-[#232329] rounded-2xl border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => setActive(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-primary/80 text-white flex items-center justify-center hover:bg-accent hover:text-primary transition-colors"
                aria-label="Close"
              >
                <FiX className="text-xl" />
              </button>
              <div className="relative w-full bg-[#1c1c22]">
                <Image
                  src={active.image}
                  alt={active.title}
                  width={1100}
                  height={700}
                  className="w-full h-auto object-contain"
                />
              </div>
              <div className="p-5 flex flex-col gap-2">
                <span className="text-accent text-xs font-semibold uppercase tracking-wider">
                  {active.category}
                </span>
                <h3 className="text-xl font-semibold">{active.title}</h3>
                <p className="text-sm text-white/60">{active.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default AchievementsSection;
