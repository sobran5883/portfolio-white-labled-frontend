import { notFound } from "next/navigation";
import { getPublicPortfolio } from "@/lib/server/getPublicPortfolio";
import ResumeSection from "@/components/portfolio/ResumeSection";

export default async function ResumePage({ params }) {
  const { slug } = await params;
  const portfolio = await getPublicPortfolio(slug);
  if (!portfolio) notFound();
  return <ResumeSection portfolio={portfolio} />;
}
