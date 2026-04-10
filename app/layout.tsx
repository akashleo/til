import type { Metadata } from "next";
import "../styles/globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Today I Learned",
  description: "A personal knowledge tracking tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
