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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
