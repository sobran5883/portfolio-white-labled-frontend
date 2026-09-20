"use client";

import { notFound } from "next/navigation";
import CertificatesSection from "@/components/portfolio/CertificatesSection";
import { usePreviewPortfolio } from "../PreviewProvider";

export default function PreviewCertificates() {
  const portfolio = usePreviewPortfolio();
  if (portfolio.visibility?.certificates === false) notFound();
  return <CertificatesSection portfolio={portfolio} />;
}
