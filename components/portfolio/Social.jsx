import Link from "next/link";
import { SocialIcon } from "@/lib/socialIcons";

const Social = ({ socials = [], containerStyles, iconStyles }) => {
  const items = socials.filter((s) => s && s.url);
  return (
    <div className={containerStyles}>
      {items.map((item, index) => (
        <Link
          key={index}
          href={item.platform === "email" ? `mailto:${item.url}` : item.url}
          target={item.platform === "email" ? undefined : "_blank"}
          className={iconStyles}
          aria-label={item.platform}
        >
          <SocialIcon platform={item.platform} />
        </Link>
      ))}
    </div>
  );
};

export default Social;
