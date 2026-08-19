import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ENDGEGNER",
  description: "German grammar trainers, one boss at a time.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

interface IRootLayoutProps {
  children: React.ReactNode;
}

export default function CRootLayout({ children }: IRootLayoutProps) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
