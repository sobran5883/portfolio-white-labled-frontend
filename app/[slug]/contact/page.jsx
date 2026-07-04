import { notFound } from "next/navigation";
import { getPublicPortfolio } from "@/lib/server/getPublicPortfolio";
import ContactSection from "@/components/portfolio/ContactSection";

export default async function ContactPage({ params }) {
  const { slug } = await params;
  const portfolio = await getPublicPortfolio(slug);
  if (!portfolio) notFound();
  return <ContactSection portfolio={portfolio} />;
}
