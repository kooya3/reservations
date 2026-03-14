import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import "./animations.css";
import "./mobile.css";
import "./product-card.css";
import "./category-tabs.css";
import "./hamburger-menu.css";
import "./processing.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "POS - AM | PM Lounge",
  description: "Point of Sale System for AM | PM Lounge",
};

export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Root app layout already wraps the tree with <ClerkProvider />,
  // so we only need a visual/layout wrapper here.
  return (
    <div
      className={`min-h-screen bg-neutral-950 transition-smooth prevent-pull-refresh ${inter.className}`}
    >
      {children}
    </div>
  );
}
