"use client";

import { notFound } from "next/navigation";
import AchievementsSection from "@/components/portfolio/AchievementsSection";
import { usePreviewPortfolio } from "../PreviewProvider";

export default function PreviewAchievements() {
  const portfolio = usePreviewPortfolio();
  if (portfolio.visibility?.achievements === false) notFound();
  return <AchievementsSection portfolio={portfolio} />;
}
