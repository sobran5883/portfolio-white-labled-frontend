"use client";

import { notFound } from "next/navigation";
import ContactSection from "@/components/portfolio/ContactSection";
import { usePreviewPortfolio } from "../PreviewProvider";

export default function PreviewContact() {
  const portfolio = usePreviewPortfolio();
  if (portfolio.visibility?.contact === false) notFound();
  return <ContactSection portfolio={portfolio} />;
}
