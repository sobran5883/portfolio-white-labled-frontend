"use client";

import { notFound } from "next/navigation";
import ResumeSection from "@/components/portfolio/ResumeSection";
import { usePreviewPortfolio } from "../PreviewProvider";

export default function PreviewResume() {
  const portfolio = usePreviewPortfolio();
  if (portfolio.visibility?.resume === false) notFound();
  return <ResumeSection portfolio={portfolio} />;
}
