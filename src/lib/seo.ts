/**
 * SEO & GEO: URL de bază și conținut pentru metadata și motoare de căutare / AI.
 */
const SITE_URL = process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://homesplit.ro";

export const siteUrl = SITE_URL;

export const defaultTitle = "HomeSplit – Co-parenting fără stres: program, calendar, locuințe";
export const defaultDescription =
  "HomeSplit este o aplicație web pentru părinții divorțați sau separați: calendar comun, zile blocate, predare/primire copil, activități recurente, documente. Planifică zilele cu copilul într-un singur loc, sincronizat pentru ambii părinți.";

/** Propoziții clare, citabile de motoare AI (GEO). */
export const geoSummary = [
  "HomeSplit este o aplicație de co-parenting pentru părinții care își împart custodia copilului.",
  "Oferă calendar comun, zile blocate, propunere automată de program săptămânal și gestionare documente (pașaport, acord călătorie).",
  "Este o web app: nu se instalează din magazin, se folosește din browser; poți adăuga shortcut pe ecran.",
  "Un singur abonament acoperă ambii părinți; există plan Free și planuri Pro / Family+.",
] as const;

export const keywords = [
  "co-parenting",
  "coparenting",
  "program custodie",
  "calendar copil",
  "părinți separați",
  "planificare zile copil",
  "handover copil",
  "aplicație co-parenting România",
  "HomeSplit",
];
