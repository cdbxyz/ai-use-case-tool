import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Use Case Tool",
  description: "Internal tool for submitting and reviewing AI use case requests.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
