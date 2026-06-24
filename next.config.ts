import type { NextConfig } from "next";

// Fixează rădăcina de workspace la directorul proiectului. Fără asta, un
// package-lock.json rătăcit în directorul părinte (/Users/.../Work) face
// Turbopack să aleagă o rădăcină greșită, iar CSS-ul custom din globals.css e
// scăpat din compilare (login/register apar fără stiluri).
// `process.cwd()` = directorul din care rulează `next dev/build` = proiectul.
const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
