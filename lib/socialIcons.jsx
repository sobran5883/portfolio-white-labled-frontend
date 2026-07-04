// Maps a social "platform" key to an icon. Keep in sync with the dashboard.

import {
  FaGithub,
  FaLinkedinIn,
  FaTwitter,
  FaInstagram,
  FaFacebookF,
  FaDribbble,
  FaBehance,
  FaYoutube,
  FaMedium,
  FaGlobe,
  FaEnvelope,
} from "react-icons/fa";

export const SOCIAL_ICONS = {
  github: FaGithub,
  linkedin: FaLinkedinIn,
  twitter: FaTwitter,
  instagram: FaInstagram,
  facebook: FaFacebookF,
  dribbble: FaDribbble,
  behance: FaBehance,
  youtube: FaYoutube,
  medium: FaMedium,
  website: FaGlobe,
  email: FaEnvelope,
};

export const SOCIAL_PLATFORMS = Object.keys(SOCIAL_ICONS);

export function SocialIcon({ platform }) {
  const Cmp = SOCIAL_ICONS[platform] || FaGlobe;
  return <Cmp />;
}
