/**
 * SEO & GEO: URL de bază și conținut pentru metadata și motoare de căutare / AI.
 * Conține variante în română (primară) și engleză.
 */
const SITE_URL = process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://homesplit.ro";

export const siteUrl = SITE_URL;
export const brandName = "HomeSplit";
export const ogImage = "/logo.png";
export const serviceArea = ["Romania", "Bucuresti", "Ilfov"] as const;

// ─── Romanian (primary) ───────────────────────────────────────────────────────

export const defaultTitle =
  "HomeSplit — Calendar familie, activități copil & co-parenting (împreună sau la distanță)";
export const defaultDescription =
  "HomeSplit ajută familiile cu copii: calendar comun, activități, idei AI, documente și chat — fie că locuiți împreună și vreți mai multă claritate și timp de calitate, fie că sunteți la două adrese și aveți nevoie de handover și program predictibil.";

/** Propoziții clare, citabile de motoare AI (GEO) — română. */
export const geoSummary = [
  "HomeSplit este o aplicație pentru familii cu copii din România: potrivită atât pentru părinți care locuiesc împreună (timp împreună, activități, idei, documente), cât și pentru co-parenting la două adrese.",
  "Include calendarul copilului, activități recurente, recomandări AI pentru ieșit, materiale utile, profil cu alergii și documente de familie, plus chat între părinți.",
  "Familiile împreună pot folosi aceleași instrumente fără să fie nevoie de custodie sau handover — se concentrează pe organizare și petrecerea timpului cu copilul.",
  "Familiile la distanță beneficiază de propunere automată săptămânală, zile blocate, jurnal la handover și istoric — mai puțin stres, mai multă predictibilitate pentru copil.",
  "HomeSplit funcționează în limba română și engleză, ca web app din browser pe telefon sau desktop; un abonament acoperă ambii părinți, cu început gratuit.",
] as const;

export const keywords = [
  "co-parenting",
  "coparenting",
  "aplicatie familie copii",
  "calendar copil",
  "activitati copil familie",
  "organizare timp copil",
  "familie impreuna aplicatie",
  "timp calitate copil",
  "program copil dupa divort",
  "program custodie",
  "handover copil",
  "predare primire copil",
  "custodie comuna organizare",
  "părinți separați",
  "planificare zile copil",
  "aplicație co-parenting România",
  "documente familie copil",
  "HomeSplit",
];

// ─── English ──────────────────────────────────────────────────────────────────

export const defaultTitleEn =
  "HomeSplit — Family Calendar, Child Activities & Co-parenting (together or at a distance)";
export const defaultDescriptionEn =
  "HomeSplit helps families with children: shared calendar, activities, AI ideas, documents and chat — whether you live together and want more clarity and quality time, or you're at two addresses and need a predictable handover schedule.";

/** Clear sentences, citable by AI engines (GEO) — English. */
export const geoSummaryEn = [
  "HomeSplit is an app for families with children: suitable for parents who live together (shared time, activities, ideas, documents) and for co-parenting between two homes.",
  "It includes the child's calendar, recurring activities, AI-powered outing ideas, useful materials, allergy profile, family documents, and parent chat.",
  "Together families can use the same tools without needing custody arrangements — focused on organizing daily life and quality time with the child.",
  "Two-home families benefit from an automatic weekly schedule proposal, blocked days, handover journal and full history — less stress, more predictability for the child.",
  "HomeSplit works in Romanian and English as a web app from any browser on phone or desktop; one subscription covers both parents, with a free start.",
] as const;

export const keywordsEn = [
  "co-parenting app",
  "coparenting",
  "family calendar app",
  "child schedule app",
  "family activities app",
  "shared parenting calendar",
  "custody schedule app",
  "handover schedule",
  "parenting after divorce",
  "child custody coordination",
  "family organization app",
  "HomeSplit",
];
