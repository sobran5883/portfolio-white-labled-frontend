"use client";

import HomeSection from "@/components/portfolio/HomeSection";
import { usePreviewPortfolio } from "./PreviewProvider";

export default function PreviewHome() {
  const portfolio = usePreviewPortfolio();
  return <HomeSection portfolio={portfolio} />;
}
