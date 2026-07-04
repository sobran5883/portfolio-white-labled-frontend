"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FiImage } from "react-icons/fi";

const CertificatesSection = ({ portfolio }) => {
  const certificates = portfolio.certificates || [];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 1.5, duration: 0.4, ease: "easeIn" } }}
    >
      <div className="container mx-auto">
        <div className="flex flex-col gap-3 text-center xl:text-left mb-10">
          <h2 className="text-4xl xl:text-5xl font-bold">
            My <span className="text-accent">Certificates</span>
          </h2>
        </div>
        {certificates.length === 0 ? (
          <p className="text-white/50">No certificates added yet.</p>
        ) : (
          <ul className="w-full flex flex-col gap-10">
            {certificates.map((certificate, index) => (
              <li key={index} className="w-full">
                <h2 className="text-xl xl:text-2xl font-semibold">{certificate.category}</h2>
                <div className="flex flex-col xl:flex-row w-full gap-4 mt-2">
                  <p className="xl:w-6/12 text-white/60">{certificate.description}</p>
                  <div className="xl:w-6/12 overflow-auto">
                    {certificate.image ? (
                      <Image
                        src={certificate.image}
                        width={800}
                        height={600}
                        alt={certificate.category || "certificate"}
                        className="w-full h-auto object-contain rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-[220px] rounded-lg bg-[#232329] flex items-center justify-center">
                        <FiImage className="text-white/20 text-6xl" />
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.section>
  );
};

export default CertificatesSection;
