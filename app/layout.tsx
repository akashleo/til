import type { Metadata } from "next";
import "../styles/globals.css";
import Navbar from "@/components/Navbar";
import { sora, recursive } from "./fonts";

export const metadata: Metadata = {
  title: "Today I Learned",
  description: "A personal knowledge tracking tool",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${recursive.variable}`}>
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
