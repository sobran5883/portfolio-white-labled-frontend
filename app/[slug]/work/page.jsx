import { notFound } from "next/navigation";
import { getPublicPortfolio } from "@/lib/server/getPublicPortfolio";
import WorkSection from "@/components/portfolio/WorkSection";

export default async function WorkPage({ params }) {
  const { slug } = await params;
  const portfolio = await getPublicPortfolio(slug);
  if (!portfolio) notFound();
  return <WorkSection portfolio={portfolio} />;
}
