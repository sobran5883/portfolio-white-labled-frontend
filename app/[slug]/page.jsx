import { notFound } from "next/navigation";
import { getPublicPortfolio } from "@/lib/server/getPublicPortfolio";
import HomeSection from "@/components/portfolio/HomeSection";

export default async function PortfolioHome({ params }) {
  const { slug } = await params;
  const portfolio = await getPublicPortfolio(slug);
  if (!portfolio) notFound();
  return <HomeSection portfolio={portfolio} />;
}
