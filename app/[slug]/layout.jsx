import { notFound } from "next/navigation";
import { getPublicPortfolio } from "@/lib/server/getPublicPortfolio";
import { accentStyle } from "@/lib/theme";

import PortfolioHeader from "@/components/portfolio/PortfolioHeader";
import StairTransition from "@/components/StairTransition";
import PageTransition from "@/components/PageTransition";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const portfolio = await getPublicPortfolio(slug);
  if (!portfolio) return { title: "Portfolio not found" };
  const name = portfolio.home?.name || portfolio.theme?.logoText || "Portfolio";
  return {
    title: `${name} — Portfolio`,
    description: portfolio.about?.description?.slice(0, 160) || `${name}'s portfolio`,
  };
}

export default async function PortfolioLayout({ children, params }) {
  const { slug } = await params;
  const portfolio = await getPublicPortfolio(slug);
  if (!portfolio) notFound();

  const theme = portfolio.theme || {};

  return (
    <div style={accentStyle(theme.accentColor)} className="min-h-screen">
      <PortfolioHeader slug={slug} logoText={theme.logoText || "Portfolio"} />
      <StairTransition />
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
