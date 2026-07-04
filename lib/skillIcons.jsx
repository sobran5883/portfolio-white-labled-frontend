// Maps a stable iconKey (stored in the DB) to a react-icon component.
// Keep keys in sync with the dashboard skill picker.

import {
  FaHtml5,
  FaCss3,
  FaJs,
  FaReact,
  FaFigma,
  FaNodeJs,
  FaVuejs,
  FaAngular,
  FaPython,
  FaJava,
  FaPhp,
  FaGitAlt,
  FaDocker,
  FaAws,
} from "react-icons/fa";
import {
  SiTailwindcss,
  SiNextdotjs,
  SiTypescript,
  SiMongodb,
  SiExpress,
  SiRedux,
  SiPostgresql,
  SiGraphql,
} from "react-icons/si";

export const SKILL_ICONS = {
  html5: FaHtml5,
  css3: FaCss3,
  javascript: FaJs,
  typescript: SiTypescript,
  react: FaReact,
  vue: FaVuejs,
  angular: FaAngular,
  nextjs: SiNextdotjs,
  tailwind: SiTailwindcss,
  nodejs: FaNodeJs,
  express: SiExpress,
  mongodb: SiMongodb,
  postgresql: SiPostgresql,
  graphql: SiGraphql,
  redux: SiRedux,
  python: FaPython,
  java: FaJava,
  php: FaPhp,
  git: FaGitAlt,
  docker: FaDocker,
  aws: FaAws,
  figma: FaFigma,
};

// Ordered list for the dashboard picker.
export const SKILL_ICON_KEYS = Object.keys(SKILL_ICONS);

export function SkillIcon({ iconKey, className }) {
  const Cmp = SKILL_ICONS[iconKey] || FaReact;
  return <Cmp className={className} />;
}
