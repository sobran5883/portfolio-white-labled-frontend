import Link from "next/link";
import { Button } from "@/components/ui/button";
import PortfolioNav from "./PortfolioNav";
import PortfolioMobileNav from "./PortfolioMobileNav";

const PortfolioHeader = ({ slug, logoText = "Portfolio" }) => {
  const base = `/${slug}`;
  return (
    <header className="pt-4 pb-8 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href={base}>
          <h1 className="text-2xl xl:text-4xl font-semibold">
            {logoText}
            <span className="text-accent">.</span>
          </h1>
        </Link>

        <div className="hidden xl:flex items-center gap-8">
          <PortfolioNav slug={slug} />
          <Link href={`${base}/contact`}>
            <Button>Hire me</Button>
          </Link>
        </div>

        <div className="xl:hidden">
          <PortfolioMobileNav slug={slug} logoText={logoText} />
        </div>
      </div>
    </header>
  );
};

export default PortfolioHeader;
