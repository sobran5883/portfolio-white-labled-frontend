"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FiUser } from "react-icons/fi";

const Photo = ({ src }) => {
  return (
    <div className="w-full h-full relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 1.5, duration: 0.4, ease: "easeIn" } }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 1.5, duration: 0.4, ease: "easeIn" } }}
          className="w-[248px] h-[248px] xl:w-[400px] xl:h-[400px] absolute rounded-full overflow-hidden flex items-center justify-center"
        >
          {src ? (
            <Image
              src={src}
              priority
              quality={100}
              fill
              sizes="(max-width: 1280px) 248px, 400px"
              alt="profile"
              className="object-cover rounded-full"
            />
          ) : (
            <FiUser className="text-white/20 text-[120px] xl:text-[180px]" />
          )}
        </motion.div>

        <motion.svg
          className="w-[250px] xl:w-[406px] h-[250px] xl:h-[406px]"
          fill="transparent"
          viewBox="0 0 506 506"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.circle
            cx="253"
            cy="253"
            r="250"
            stroke="var(--accent, #00E0F2)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ strokeDasharray: "24 10 0 0" }}
            animate={{
              strokeDasharray: ["15 120 25 25", "16 25 92 72", "4 250 22 22"],
              rotate: [120, 360],
            }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          />
        </motion.svg>
      </motion.div>
    </div>
  );
};

export default Photo;
