import { notFound } from "next/navigation";
import { getPublicPortfolio } from "@/lib/server/getPublicPortfolio";
import CertificatesSection from "@/components/portfolio/CertificatesSection";

export default async function CertificatesPage({ params }) {
  const { slug } = await params;
  const portfolio = await getPublicPortfolio(slug);
  if (!portfolio) notFound();
  return <CertificatesSection portfolio={portfolio} />;
}
