/**
 * Cross-linking map: blog category → relevant SEO landing pages
 * Used to build topical authority between blog articles and product/guide pages.
 */

export type BlogSeoLink = {
  href: string;
  label: string;
  description: string;
};

export const BLOG_INDEX_SEO_LINKS: BlogSeoLink[] = [
  { href: "/co-parenting", label: "Ghid co-parenting", description: "Tot ce trebuie să știi despre co-parenting și custodie partajată" },
  { href: "/calendar-copil", label: "Calendar copil", description: "Cum organizezi programul copilului în două case" },
  { href: "/program-copil", label: "Program copil", description: "Construiește un program predictibil și sănătos" },
  { href: "/pentru-parinti-separati", label: "Părinți separați", description: "Resurse și sfaturi practice pentru co-parenting" },
  { href: "/aplicatie-co-parenting", label: "Aplicație co-parenting", description: "HomeSplit – aplicația dedicată familiilor cu două case" },
  { href: "/activitati-copil", label: "Activități cu copilul", description: "Idei de reconectare și micro-ritualuri eficiente" },
];

export const CATEGORY_SEO_LINKS: Record<string, BlogSeoLink[]> = {
  coparenting: [
    { href: "/co-parenting", label: "Ghid co-parenting", description: "Fundamente ale co-parentingului care protejează copilul" },
    { href: "/custodie-comuna", label: "Custodie comună", description: "Cum funcționează custodia comună și ce implică ea" },
    { href: "/aplicatie-co-parenting", label: "Aplicație co-parenting", description: "HomeSplit – gestionezi totul dintr-un singur loc" },
    { href: "/pentru-parinti-separati", label: "Părinți separați", description: "Sfaturi practice pentru un co-parenting echilibrat" },
  ],
  "emotii-si-siguranta": [
    { href: "/pentru-parinti-separati", label: "Părinți separați", description: "Cum protejezi copilul emoțional în separare" },
    { href: "/co-parenting", label: "Co-parenting sănătos", description: "Comunicare eficientă fără conflict vizibil" },
    { href: "/activitati-copil", label: "Activități cu copilul", description: "Ritualuri de conectare care reduc anxietatea" },
    { href: "/activitati-copil", label: "Activități cu copilul", description: "Ritualuri de conectare care reduc anxietatea" },
  ],
  "rutine-si-tranzitii": [
    { href: "/calendar-copil", label: "Calendar copil", description: "Organizează programul copilului clar în două case" },
    { href: "/program-copil", label: "Program copil", description: "Construiește rutine predictibile și liniștitoare" },
    { href: "/vacante-si-program", label: "Vacanțe și program", description: "Planifică vacanțele fără conflicte de ultim moment" },
    { href: "/zile-blocate", label: "Zile blocate", description: "Rezervă zilele importante în avans" },
  ],
  "activitati-si-conectare": [
    { href: "/activitati-copil", label: "Activități cu copilul", description: "Joc, reconectare și idei de micro-ritualuri" },
    { href: "/calendar-copil", label: "Calendar copil", description: "Programează activitățile direct în aplicație" },
    { href: "/pentru-parinti-separati", label: "Părinți separați", description: "Construiește conexiunea cu copilul indiferent de distanță" },
    { href: "/co-parenting", label: "Co-parenting armonios", description: "Colaborare care pune copilul pe primul loc" },
  ],
};

export function getSeoLinksForCategory(categorySlug: string): BlogSeoLink[] {
  return CATEGORY_SEO_LINKS[categorySlug] ?? BLOG_INDEX_SEO_LINKS.slice(0, 4);
}
