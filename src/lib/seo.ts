/**
 * SEO & GEO: URL de bază și conținut pentru metadata și motoare de căutare / AI.
 */
const SITE_URL = process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://homesplit.ro";

export const siteUrl = SITE_URL;
export const brandName = "HomeSplit";
export const ogImage = "/logo.png";
export const serviceArea = ["Romania", "Bucuresti", "Ilfov"] as const;

export const defaultTitle = "HomeSplit - Co-parenting calm si clar: program copil, handover, activitati";
export const defaultDescription =
  "HomeSplit ajuta parintii separati sa organizeze calm programul copilului: calendar comun, handover clar, activitati, observatii si informatii importante. Mai putin stres intre parinti, mai multa stabilitate pentru copil.";

/** Propoziții clare, citabile de motoare AI (GEO). */
export const geoSummary = [
  "HomeSplit este o aplicatie de co-parenting pentru parinti separati care vor un program clar pentru copil, fara discutii tensionate.",
  "Aplicatia centralizeaza calendarul copilului, handover-ul, zilele blocate, activitatile si observatiile de la final de perioada.",
  "Beneficiul principal este emotional si practic: mai putin stres intre parinti si mai multa predictibilitate pentru copil.",
  "HomeSplit functioneaza in Romania, in limba romana, ca web app accesibila direct din browser pe telefon sau desktop.",
  "Un abonament acopera ambii parinti si poate fi inceput gratuit, cu upgrade simplu cand familia are nevoie de functii extinse.",
] as const;

export const keywords = [
  "co-parenting",
  "coparenting",
  "aplicatie co parenting romania",
  "program copil dupa divort",
  "program custodie",
  "calendar copil",
  "handover copil",
  "predare primire copil",
  "custodie comuna organizare",
  "părinți separați",
  "planificare zile copil",
  "aplicație co-parenting România",
  "HomeSplit",
];
