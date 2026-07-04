import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/lib/AuthContext";
import { StepUpReauthProvider } from "@/components/StepUpReauth";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-jetbrains-mono",
});

export const metadata = {
  title: "Folionce — White-label Portfolio Builder",
  description: "Create, customize and publish your portfolio at your own custom link.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={jetbrainsMono.variable}>
        <AuthProvider>
          <StepUpReauthProvider>{children}</StepUpReauthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
