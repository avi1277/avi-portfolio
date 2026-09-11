import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Avi Patel — Observatory",
  description:
    "Computer Engineering @ Brown University. Explore my projects through the stars.",
};

export const viewport: Viewport = {
  themeColor: "#081229",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-navy text-white antialiased">{children}</body>
    </html>
  );
}
