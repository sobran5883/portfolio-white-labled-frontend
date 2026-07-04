"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { FiArrowRight, FiEdit3, FiImage, FiGlobe } from "react-icons/fi";

const features = [
  {
    icon: <FiEdit3 />,
    title: "Edit everything",
    description: "Fill in your bio, experience, skills, projects and more from one simple dashboard.",
  },
  {
    icon: <FiImage />,
    title: "Upload your images",
    description: "Add your profile photo, project thumbnails and certificates — stored securely.",
  },
  {
    icon: <FiGlobe />,
    title: "Publish at your link",
    description: "Pick a custom slug and share your portfolio at yoursite.com/your-name.",
  },
];

export default function Landing() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Logged-in users go straight to the dashboard.
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  return (
    <main className="min-h-screen">
      <header className="container mx-auto flex items-center justify-between py-6">
        <h1 className="text-2xl xl:text-3xl font-semibold">
          Folionce<span className="text-accent">.</span>
        </h1>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline" size="sm">Log in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <section className="container mx-auto pt-16 pb-20 text-center xl:text-left">
        <div className="max-w-[760px] mx-auto xl:mx-0">
          <span className="text-accent uppercase tracking-widest text-sm">White-label portfolio builder</span>
          <h2 className="h1 mt-4">
            Your portfolio,<br /> <span className="text-accent">your link.</span>
          </h2>
          <p className="text-white/70 mt-6 max-w-[560px] mx-auto xl:mx-0">
            Sign up, fill in your details, upload your images and publish a polished developer
            portfolio at a custom URL — no code required.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-9 justify-center xl:justify-start">
            <Link href="/register">
              <Button size="lg" className="flex items-center gap-2">
                Build your portfolio <FiArrowRight />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">I already have an account</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-[#232329] rounded-2xl p-6 border border-white/5">
              <div className="text-accent text-3xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
