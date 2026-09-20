"use client";

import { notFound } from "next/navigation";
import WorkSection from "@/components/portfolio/WorkSection";
import { usePreviewPortfolio } from "../PreviewProvider";

export default function PreviewWork() {
  const portfolio = usePreviewPortfolio();
  if (portfolio.visibility?.work === false) notFound();
  return <WorkSection portfolio={portfolio} />;
}
