import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-7xl font-extrabold text-accent">404</h1>
        <p className="text-white/70 mt-4">
          This page or portfolio doesn&apos;t exist (or isn&apos;t published yet).
        </p>
        <Link href="/" className="inline-block mt-6">
          <Button>Back home</Button>
        </Link>
      </div>
    </main>
  );
}
