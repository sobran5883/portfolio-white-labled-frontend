"use client";

import { Typewriter } from "react-simple-typewriter";
import { Button } from "@/components/ui/button";
import { FiDownload } from "react-icons/fi";

import Social from "./Social";
import Photo from "./Photo";
import Stats from "./Stats";

const HomeSection = ({ portfolio }) => {
  const home = portfolio.home || {};
  const words =
    Array.isArray(home.typewriter) && home.typewriter.length
      ? home.typewriter
      : ["Welcome to my portfolio."];

  return (
    <section className="h-full">
      <div className="container mx-auto h-full">
        <div className="flex flex-col xl:flex-row items-center justify-between xl:pt-4 xl:pb-8">
          <div className="text-center xl:text-left order-2 xl:order-none">
            {home.role && <span className="text-xl">{home.role}</span>}
            <h1 className="h2">
              Hello I&apos;m <br />{" "}
              <span className="text-accent">{home.name || "Your Name"}</span>
            </h1>
            <p className="max-w-[350px] min-h-24 mb-9 text-white/80">
              <span>
                <Typewriter
                  words={words}
                  loop
                  cursor
                  cursorStyle="|"
                  typeSpeed={50}
                  deleteSpeed={50}
                  delaySpeed={3000}
                />
              </span>
            </p>
            <div>
              <div className="flex flex-col xl:flex-row items-center gap-8">
                {home.resumeUrl && (
                  <a
                    href={home.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="uppercase flex items-center gap-2"
                  >
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <span>Download Resume</span>
                      <FiDownload className="text-xl" />
                    </Button>
                  </a>
                )}
                <div className="mb-8 xl:mb-0">
                  <Social
                    socials={portfolio.socials}
                    containerStyles="flex gap-6"
                    iconStyles="w-9 h-9 border border-accent rounded-full flex justify-center items-center text-accent text-base hover:bg-accent hover:text-primary hover:transition-all duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 xl:order-none mb-8 xl:mb-0">
            <Photo src={home.photoUrl} />
          </div>
        </div>
        <Stats stats={portfolio.stats} />
      </div>
    </section>
  );
};

export default HomeSection;
