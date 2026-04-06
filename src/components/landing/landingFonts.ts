import { Fraunces, Manrope } from "next/font/google";

export const landingDisplay = Fraunces({
  subsets: ["latin"],
  variable: "--font-landing-display",
  weight: ["600", "700"],
});

export const landingSans = Manrope({
  subsets: ["latin"],
  variable: "--font-landing-sans",
  weight: ["400", "500", "600", "700", "800"],
});
