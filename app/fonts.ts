import { Sora, Recursive } from "next/font/google";

export const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora",
});

export const recursive = Recursive({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});
