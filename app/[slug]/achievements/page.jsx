import { notFound } from "next/navigation";
import { getPublicPortfolio } from "@/lib/server/getPublicPortfolio";
import AchievementsSection from "@/components/portfolio/AchievementsSection";

export default async function AchievementsPage({ params }) {
  const { slug } = await params;
  const portfolio = await getPublicPortfolio(slug);
  if (!portfolio) notFound();
  return <AchievementsSection portfolio={portfolio} />;
}
