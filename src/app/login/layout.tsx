import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conectare — HomeSplit",
  description:
    "Intră în contul tău HomeSplit: calendar, activități, idei AI, documente și chat — pentru orice tip de familie cu copii.",
};

export const dynamic = "force-dynamic";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
