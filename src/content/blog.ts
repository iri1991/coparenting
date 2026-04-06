export type BlogCategory = {
  slug: string;
  title: string;
  description: string;
  badgeClassName: string;
  surfaceClassName: string;
};

export type BlogSource = {
  title: string;
  publisher: string;
  url: string;
  note: string;
};

export type BlogSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type BlogArticle = {
  slug: string;
  title: string;
  summary: string;
  intro: string;
  image?: {
    src: string;
    alt: string;
  };
  categorySlug: string;
  publishedAt: string;
  readingTimeMinutes: number;
  featured?: boolean;
  sections: BlogSection[];
  takeaways: string[];
  sources: BlogSource[];
};

export type BlogArticleWithCategory = BlogArticle & {
  category: BlogCategory;
};

export const blogTitle = "Blog HomeSplit";
export const blogDescription =
  "Articole în limba română despre co-parenting, reglare emoțională, rutine și activități de conectare, construite din surse psihologice și pediatrice credibile.";

export const blogCategories: BlogCategory[] = [
  {
    slug: "coparenting",
    title: "Co-parenting",
    description: "Limite clare, comunicare între adulți și protejarea copilului de conflict.",
    badgeClassName: "bg-[#dff3ec] text-[#114538]",
    surfaceClassName: "from-[#effaf5] to-[#f8fcfb]",
  },
  {
    slug: "emotii-si-siguranta",
    title: "Emoții & siguranță",
    description: "Cum vorbim cu copilul despre schimbări fără să-i mutăm pe umeri conflictul adult.",
    badgeClassName: "bg-[#f8e5c8] text-[#7b4f11]",
    surfaceClassName: "from-[#fff5e6] to-[#fffaf2]",
  },
  {
    slug: "rutine-si-tranzitii",
    title: "Rutine & tranziții",
    description: "Idei concrete pentru două case, handover-uri mai line și predictibilitate reală.",
    badgeClassName: "bg-[#dceffd] text-[#17456a]",
    surfaceClassName: "from-[#edf7ff] to-[#f8fbff]",
  },
  {
    slug: "activitati-si-conectare",
    title: "Activități & conectare",
    description: "Joc, reconectare și micro-ritualuri care reduc tensiunea după zile încărcate.",
    badgeClassName: "bg-[#f7dfe3] text-[#7a2d3d]",
    surfaceClassName: "from-[#fff1f3] to-[#fff9fa]",
  },
];

const blogArticles: BlogArticle[] = [
  {
    slug: "copilul-explodeaza-dupa-schimbarea-de-casa",
    title: "Când copilul explodează după schimbarea de casă",
    summary:
      "Iritarea, plânsul sau opoziția de după handover nu cer mai întâi corectare, ci un adult care încetinește ritmul și co-reglează.",
    intro:
      "Unii părinți se sperie sau se enervează când copilul ajunge din cealaltă casă și pare brusc dificil: răspunde tăios, plânge din nimic, refuză reguli simple sau caută conflict. Reacția firească este să corectezi imediat comportamentul. Dar de multe ori nu vezi lipsă de respect, ci un sistem nervos deja încărcat de schimbare. În acele momente, copilul are nevoie întâi de co-reglare, apoi de limite și conversație.",
    image: {
      src: "/blog/child-after-handover.svg",
      alt: "Părinte și copil care se așază împreună după o tranziție între două case",
    },
    categorySlug: "emotii-si-siguranta",
    publishedAt: "2026-04-06",
    readingTimeMinutes: 6,
    featured: true,
    sections: [
      {
        title: "De ce apare descărcarea tocmai după sosire",
        paragraphs: [
          "Schimbarea de casă poate cere multă adaptare internă chiar și atunci când programul este bun și relația cu ambii părinți contează. Copilul a schimbat ritm, reguli, stimulare, poate și felul în care s-a ținut tare pe parcursul zilei. Când ajunge într-un loc sigur, tensiunea strânsă poate ieși la suprafață.",
          "Child Mind Institute explică faptul că reglarea emoțională se învață treptat și că, în momentele de supraîncărcare, copilul împrumută din calmul adultului apropiat. Cu alte cuvinte, reacția părintelui nu este decorul scenei, ci una dintre piesele care mută situația spre escaladare sau spre liniștire.",
        ],
      },
      {
        title: "Ce faci în primele minute",
        paragraphs: [
          "Înainte să corectezi tonul sau să ceri explicații, verifică-ți propriul corp. Dacă intri și tu în alertă, copilul primește încă un semnal de pericol. Primul pas este să încetinești.",
          "Nu ai nevoie de un discurs lung. Ajută mai mult o prezență calmă, puține cuvinte și o invitație simplă spre reglare.",
        ],
        bullets: [
          "Coboară fizic la nivelul copilului în loc să vorbești din picioare peste el.",
          "Numește ce vezi fără judecată: pari foarte tensionat sau cred că ți-a fost mult.",
          "Vorbește mai încet și mai jos decât îți vine natural în momentul acela.",
          "Oferă o punte scurtă: apă, duș, schimbat hainele, stat lipiți pe canapea, câteva respirații împreună.",
        ],
      },
      {
        title: "Co-reglare nu înseamnă lipsă de limite",
        paragraphs: [
          "Validarea emoției nu înseamnă că orice comportament devine acceptabil. Poți transmite simultan două lucruri: te ajut să te liniștești și nu te las să lovești, să jignești sau să strici lucruri.",
          "Ordinea contează. Când copilul este puternic activat, explicațiile lungi și lecțiile morale intră greu. Întâi reduci intensitatea, apoi revii la limită și la reparație: ce facem acum, cum reparăm, ce putem încerca data viitoare.",
        ],
      },
      {
        title: "Semne că ai intrat prea repede pe corectare",
        paragraphs: [
          "Dacă vezi că volumul crește după ce pui multe întrebări, ceri imediat recunoștință sau compari cu cealaltă casă, probabil copilul nu era încă disponibil pentru conversație. Uneori părintele interpretează greșit descărcarea ca pe o alegere conștientă de a provoca.",
          "Un reper util este acesta: dacă după 10-20 de minute de calm, rutină și contact reacția scade, cel mai probabil ai avut în față o problemă de reglare, nu una care se rezolvă prin presiune.",
        ],
      },
      {
        title: "Când merită cerut ajutor suplimentar",
        paragraphs: [
          "Dacă după aproape fiecare schimb de casă apar izbucniri foarte intense, somn dereglat, frică persistentă, autoînvinovățire, refuz puternic al tranziției sau regres clar, merită discutat cu un psiholog de copii ori cu pediatrul. Scopul nu este să alegi vinovați, ci să înțelegi mai repede de unde vine supraîncărcarea și ce sprijin concret ajută copilul.",
        ],
      },
    ],
    takeaways: [
      "După handover, comportamentul dificil poate fi o descărcare de stres, nu o provocare calculată.",
      "Mai întâi reglezi ritmul și relația, apoi corectezi comportamentul.",
      "Poți valida emoția și păstra limita în același timp.",
    ],
    sources: [
      {
        title: "What Is Co-Regulation?",
        publisher: "Child Mind Institute",
        url: "https://childmind.org/article/what-is-co-regulation/",
        note: "Explică de ce calmul adultului influențează reglarea copilului și oferă pași concreți: nivelul ochilor, numirea emoției, ton calm și exerciții de liniștire. Ultima actualizare indicată pe pagină: 21 ianuarie 2026.",
      },
    ],
  },
  {
    slug: "tranzitii-intre-doua-case-mai-putin-stres",
    title: "Cum faci tranzițiile între două case mai puțin stresante pentru copil",
    summary:
      "Mutările frecvente nu devin mai ușoare prin grabă, ci prin predictibilitate, semnale clare și un ritual de reconectare după handover.",
    intro:
      "Pentru mulți copii, mutarea între două case nu înseamnă doar schimbarea unui loc, ci schimbarea ritmului, a regulilor și a felului în care se simt în corp. Când adulții tratează handover-ul ca pe un simplu transfer logistic, copilul rămâne să proceseze singur toată schimbarea. Când există structură și o aterizare blândă, tensiunea scade vizibil.",
    categorySlug: "rutine-si-tranzitii",
    publishedAt: "2026-04-06",
    readingTimeMinutes: 6,
    sections: [
      {
        title: "De ce tranzițiile consumă atât de mult",
        paragraphs: [
          "Copiii reacționează intens la tranziții fiindcă li se cere să oprească ceva familiar și să intre repede într-un alt context. Child Mind Institute explică exact acest mecanism: trecerea de la o activitate sau un loc la altul cere reglare emoțională și flexibilitate cognitivă, iar acestea sunt încă în formare.",
          "În familiile cu două case, schimbarea nu este doar de activitate, ci de mediu întreg. Raising Children Network observă că unii copii se agită, plâng mai ușor, refuză cooperarea sau au probleme cu somnul și pofta de mâncare tocmai pentru că tranziția le activează stresul, chiar și atunci când ambii părinți sunt importanți și siguri pentru ei.",
        ],
      },
      {
        title: "Ce merită pregătit înainte de handover",
        paragraphs: [
          "Copilul are nevoie de predictibilitate mai mult decât de discursuri. Un orar stabil, același tip de mesaj înainte de plecare și aceeași ordine a pașilor reduc surpriza și scad rezistența.",
          "Dacă apare mereu aceeași mică rutină înainte de plecare, copilul învață că știe ce urmează și corpul lui intră mai ușor în tranziție.",
        ],
        bullets: [
          "Anunță schimbarea din timp și repetă-o simplu: astăzi mergi la tata/mama după școală.",
          "Folosește aceeași listă scurtă înainte de plecare: ghiozdan, haine, medicamente, obiect de confort.",
          "Păstrează duplicate pentru lucrurile importante de somn sau reglare, când se poate: carte, pluș, muzică.",
          "Evită discuțiile tensionate sau negocierea programului în fața copilului, chiar dacă logistica se schimbă.",
        ],
      },
      {
        title: "Primele 30 de minute după sosire contează mai mult decât întrebările",
        paragraphs: [
          "Raising Children recomandă o perioadă de așezare înainte de avalanșa de întrebări. Unii copii au nevoie să citească, să se joace în liniște sau să facă ceva fizic înainte să vorbească.",
          "HealthyChildren arată că lipsa cooperării între case și diferențele mari de rutină se văd adesea în somn și comportament. Un mic ritual de reconectare reduce exact acest șoc: gustare, baie, 10 minute de joacă sau o plimbare scurtă, apoi conversație.",
        ],
        bullets: [
          "Nu întreba imediat ce s-a întâmplat la celălalt părinte.",
          "Oferă ceva recognoscibil: gustare, duș, pijama, joacă liberă, poveste.",
          "Numește starea fără presiune: pari obosit, te văd, putem sta puțin liniștiți.",
          "Lasă informațiile logistice importante să circule adult la adult, nu prin copil.",
        ],
      },
      {
        title: "Când nu mai vorbim doar despre o tranziție grea",
        paragraphs: [
          "Dacă vezi săptămâni la rând somn dereglat, refuz repetat al tranziției, izbucniri intense, scădere în activități sau dificultăți la școală, merită o discuție cu pediatrul sau un psiholog de copii. Scopul nu este etichetarea copilului, ci reducerea stresului înainte ca el să se cronicizeze.",
        ],
      },
    ],
    takeaways: [
      "Predictibilitatea reduce stresul mai mult decât explicațiile lungi.",
      "Copilul are nevoie de aterizare după handover, nu de interogatoriu.",
      "Semnele persistente din somn, școală sau dispoziție merită urmărite din timp.",
    ],
    sources: [
      {
        title: "Separation, divorce, children in two homes",
        publisher: "Raising Children Network",
        url: "https://raisingchildren.net.au/grown-ups/family-diversity/parenting-after-separation-divorce/helping-children-adjust-two-homes",
        note: "Recomandări practice despre reglarea după mutarea între două case și semne că un copil se chinuie cu tranziția.",
      },
      {
        title: "Why Do Kids Have Trouble With Transitions?",
        publisher: "Child Mind Institute",
        url: "https://childmind.org/article/why-do-kids-have-trouble-with-transitions/",
        note: "Explică de ce schimbarea de context activează rezistență, whining sau meltdown și de ce ajută preview-ul și rutina.",
      },
      {
        title: "Sleep Problems After Separation or Divorce",
        publisher: "HealthyChildren.org / American Academy of Pediatrics",
        url: "https://www.healthychildren.org/English/healthy-living/sleep/Pages/Sleep-Problems-After-Separation-or-Divorce.aspx?form=HealthyChildren",
        note: "Leagă somnul, cooperarea între case și consistența rutinelor în familiile cu două locuințe.",
      },
    ],
  },
  {
    slug: "cum-vorbim-cu-copilul-despre-separare-si-schimbari",
    title: "Cum vorbim cu copilul despre separare și schimbări de program",
    summary:
      "Mesajele simple, repetate și fără detalii de conflict îi dau copilului un cadru de siguranță când familia se schimbă.",
    intro:
      "Copiii nu au nevoie de versiunea completă a conflictului dintre adulți. Au nevoie să afle, de mai multe ori și în cuvinte potrivite vârstei lor, că sunt în siguranță, iubiți și că deciziile grele rămân la adulți. O conversație bună nu rezolvă totul într-o singură seară, dar pune fundația pentru încredere.",
    categorySlug: "emotii-si-siguranta",
    publishedAt: "2026-04-05",
    readingTimeMinutes: 6,
    sections: [
      {
        title: "Mesajul de bază trebuie să fie scurt și foarte clar",
        paragraphs: [
          "HealthyChildren recomandă un mesaj simplu: aceasta este o decizie a adulților, nu este vina copilului, iar dragostea părinților nu dispare. Când explicațiile devin haotice sau prea detaliate, copilul începe să creadă că trebuie să înțeleagă, să repare sau să ia partea cuiva.",
          "Copilul are nevoie de aceeași coloană vertebrală a mesajului chiar dacă nu aveți încă toate detaliile logistice. Siguranța emoțională vine mai întâi din ton și coerență, apoi din plan.",
        ],
      },
      {
        title: "Întrebările importante sunt adesea nespuse",
        paragraphs: [
          "Mulți copii nu întreabă direct dacă e vina lor, dacă se mută, dacă își vor mai vedea ambii părinți sau dacă familia mai are bani. HealthyChildren subliniază că tocmai aceste frici tacite trebuie adresate explicit.",
          "Poți răspunde înainte să apară întrebarea: nu ai făcut nimic greșit, nu trebuie să repari tu situația, ambii părinți rămân părinții tăi, iar noi îți vom spune din timp ce se schimbă în programul tău.",
        ],
      },
      {
        title: "Tonul potrivit e calm, repetabil și adecvat vârstei",
        paragraphs: [
          "CDC amintește că relația de siguranță se construiește prin ascultare activă, atenție și limbaj simplu. Nu ai nevoie de un discurs perfect. Ai nevoie să nu te aperi, să nu intri în justificări și să lași loc reacției copilului.",
          "Un copil mic are nevoie de propoziții concrete și de repetare. Un adolescent are nevoie de respect, mai mult context și spațiu pentru emoții contradictorii. În ambele cazuri, copilul nu trebuie să ducă povestea conflictului de cuplu.",
        ],
        bullets: [
          "Spune adevărul pe măsura vârstei, fără detalii intime sau acuzații.",
          "Lasă pauze și întreabă: ce ai înțeles? ce te îngrijorează cel mai mult?",
          "Revino la discuție după câteva zile; nu trata prima conversație ca pe un eveniment unic.",
          "Dacă nu știi încă un detaliu logistic, spune asta direct și promite când revii cu informația.",
        ],
      },
      {
        title: "Ce evităm",
        paragraphs: [
          "Nu transformăm copilul în confident și nu îi cerem să valideze cine a greșit. Nu promitem lucruri pe care nu le controlăm și nu minimalizăm emoția cu replici de tipul nu ai de ce să fii trist. Validarea și claritatea merg mai bine decât optimismul forțat.",
        ],
      },
    ],
    takeaways: [
      "Copilul are nevoie să audă explicit că nu este vina lui.",
      "Detaliile de conflict nu îl ajută; îl încarcă.",
      "O conversație bună este una la care te întorci de mai multe ori.",
    ],
    sources: [
      {
        title: "How to Talk to Your Children about Divorce",
        publisher: "HealthyChildren.org / American Academy of Pediatrics",
        url: "https://www.healthychildren.org/English/healthy-living/emotional-wellness/Building-Resilience/Pages/How-to-Talk-to-Your-Children-about-Divorce.aspx?form=HealthyChildren",
        note: "Cadru foarte clar pentru mesajul inițial, reasigurare și întrebările pe care copiii le poartă în tăcere.",
      },
      {
        title: "How to Support Children after Their Parents Separate or Divorce",
        publisher: "HealthyChildren.org / American Academy of Pediatrics",
        url: "https://www.healthychildren.org/English/healthy-living/emotional-wellness/Building-Resilience/Pages/How-to-Support-Children-after-Parents-Separate-or-Divorce.aspx",
        note: "Arată ce factori protejează copilul după separare: conflict redus, părinți implicați și rutine menținute.",
      },
      {
        title: "Tips for Communicating With Your Child",
        publisher: "Centers for Disease Control and Prevention",
        url: "https://www.cdc.gov/parenting-toddlers/communication/index.html",
        note: "Nu este despre separare, dar oferă principii utile de ascultare activă, atenție și comunicare caldă.",
      },
    ],
  },
  {
    slug: "copilul-nu-este-mesager-reguli-de-coparenting",
    title: "Copilul nu este mesager: 5 reguli de bază în co-parenting",
    summary:
      "Când copilul transportă mesaje, tensiune sau informații între adulți, el ajunge în mijlocul conflictului chiar dacă nimeni nu spune asta direct.",
    intro:
      "Una dintre cele mai frecvente erori în co-parenting apare când logistica și frustrarea adulților trec prin copil. Pe termen scurt pare convenabil. Pe termen lung, copilul rămâne prins între loialități, cu senzația că trebuie să administreze starea emoțională a părinților. Co-parentingul bun începe exact aici: copilul nu devine interfață.",
    categorySlug: "coparenting",
    publishedAt: "2026-04-04",
    readingTimeMinutes: 5,
    sections: [
      {
        title: "De ce rolul de mesager îl apasă atât de tare",
        paragraphs: [
          "HealthyChildren insistă că separarea merge mai bine pentru copii când ei nu sunt puși în mijlocul resentimentelor dintre adulți. Când copilul trebuie să transmită program, bani, reproșuri sau informații sensibile, el nu mai este doar copil, ci devine purtător de tensiune.",
          "Asta afectează siguranța relației cu ambii părinți. Copilul începe să filtreze ce spune, să ascundă, să calmeze, să ghicească reacții. Chiar și întrebările aparent inocente despre celălalt părinte îl pot pune într-o poziție de loialitate imposibilă.",
        ],
      },
      {
        title: "Cele 5 reguli care reduc mult fricțiunea",
        paragraphs: [
          "Nu există sistem perfect, dar câteva reguli simple schimbă radical climatul copilului. Ele nu cer iubire între foști parteneri, ci disciplină relațională minimă.",
        ],
        bullets: [
          "Toată logistica importantă circulă adult la adult, în scris când e nevoie.",
          "Nu ceri copilului rapoarte despre casa celuilalt părinte.",
          "Nu vorbești depreciativ despre celălalt părinte în prezența copilului.",
          "Nu folosești copilul ca sprijin emoțional pentru propria ta suferință.",
          "Mesajele despre reguli, sănătate, școală și program sunt clare și factuale, fără sarcasm.",
        ],
      },
      {
        title: "Ce faci când comunicarea dintre adulți e deja deteriorată",
        paragraphs: [
          "În multe familii, contactul verbal crește conflictul. Atunci ajută o comunicare foarte scurtă, predictibilă și orientată pe copil: ce s-a schimbat, până când, ce trebuie să știe celălalt părinte. Atât.",
          "Poți folosi același mini-format de fiecare dată: context, nevoie, propunere, termen de răspuns. Când formatul rămâne constant, scade tentația de a relua istoria relației.",
        ],
      },
      {
        title: "Excepția importantă: siguranța",
        paragraphs: [
          "Dacă există violență, abuz, intimidare sau teamă reală, problema nu mai este doar stilul de comunicare. În astfel de situații, merită implicat imediat cadrul legal sau profesionistul potrivit, iar regulile obișnuite de co-parenting trebuie adaptate la siguranță.",
        ],
      },
    ],
    takeaways: [
      "Confortul logistic al adultului nu justifică presiunea pusă pe copil.",
      "Adult la adult pentru informație; copil la copil pentru viața lui.",
      "Un format scurt și repetabil scade conflictul mai bine decât discuțiile lungi.",
    ],
    sources: [
      {
        title: "Traps Divorced or Separating Parents Should Avoid",
        publisher: "HealthyChildren.org / American Academy of Pediatrics",
        url: "https://www.healthychildren.org/English/healthy-living/emotional-wellness/Building-Resilience/Pages/Traps-Divorced-or-Separating-Parents-Should-Avoid.aspx",
        note: "Sursă foarte directă despre evitarea punerii copilului în mijloc și despre a nu-l folosi ca intermediar.",
      },
      {
        title: "How to Support Children after Their Parents Separate or Divorce",
        publisher: "HealthyChildren.org / American Academy of Pediatrics",
        url: "https://www.healthychildren.org/English/healthy-living/emotional-wellness/Building-Resilience/Pages/How-to-Support-Children-after-Parents-Separate-or-Divorce.aspx",
        note: "Leagă adaptarea mai bună a copilului de conflict redus și de cooperarea părinților în jurul nevoilor lui.",
      },
      {
        title: "Separation, divorce, children in two homes",
        publisher: "Raising Children Network",
        url: "https://raisingchildren.net.au/grown-ups/family-diversity/parenting-after-separation-divorce/helping-children-adjust-two-homes",
        note: "Recomandă evitarea interogatoriilor despre ce se întâmplă în cealaltă casă și menținerea liniilor de comunicare deschise.",
      },
    ],
  },
  {
    slug: "rutine-paralele-care-reduc-stresul-in-doua-case",
    title: "Rutine paralele care reduc stresul în două case",
    summary:
      "Casele nu trebuie să fie identice, dar copilul câștigă enorm când pilonii zilei rămân recognoscibili în ambele locuri.",
    intro:
      "Mulți părinți cad în două extreme: ori vor aceleași reguli la milimetru, ori cred că nu contează deloc diferențele dintre case. În practică, copilul are nevoie de ceva intermediar: suficientă coerență încât să știe cum arată o zi sigură, dar și suficientă flexibilitate încât fiecare casă să rămână o casă reală, nu o copie.",
    categorySlug: "rutine-si-tranzitii",
    publishedAt: "2026-04-03",
    readingTimeMinutes: 6,
    sections: [
      {
        title: "Ce merită să fie cât de cât la fel",
        paragraphs: [
          "HealthyChildren și CDC converg pe aceeași idee: copiii se reglează mai bine când există consistență, predictibilitate și follow-through. În două case, asta nu înseamnă aceleași perdele sau același meniu, ci aceiași piloni ai zilei.",
        ],
        bullets: [
          "ora aproximativă de somn și ordinea de seară",
          "regula de bază pentru ecrane în zilele de școală",
          "locul și ritmul temelor",
          "medicația, alergiile și obiectele obligatorii",
          "felul în care anunțați o schimbare de program",
        ],
      },
      {
        title: "Ce poate fi diferit fără să dăuneze",
        paragraphs: [
          "Copilul poate tolera diferențe sănătoase: decor, meniuri, ritualuri de weekend, felul în care se petrece joaca sau cine citește povestea. Nu orice diferență este instabilitate.",
          "Problema începe când diferențele lovesc exact zonele de reglare: somn, hrană, ecrane, limite sau predictibilitatea trecerilor. Acolo apar adesea conflicte, regresii și refuzuri.",
        ],
      },
      {
        title: "Cum setați rutinile fără să intrați în control reciproc",
        paragraphs: [
          "CDC recomandă puține reguli clare și un mod consecvent de a le urma. În co-parenting, asta poate însemna o foaie comună cu 4-5 repere nenegociabile și restul lăsat la stilul fiecărei case.",
          "Dacă încercați să controlați tot la celălalt părinte, discuția explodează. Dacă definiți câțiva piloni și îi respectați, copilul primește exact ce are nevoie: structură.",
        ],
      },
      {
        title: "Un exemplu util de minim comun",
        paragraphs: [
          "Puteți avea o singură pagină comună: oră de culcare, medicamente, ce face copilul când ajunge dintr-o casă în alta, cum circulă informația despre școală și cine anunță schimbările de program. Atât. Nu este un contract perfect; este un instrument de reducere a haosului.",
        ],
      },
    ],
    takeaways: [
      "Copilul nu are nevoie de două case identice, ci de doi adulți care protejează câțiva piloni esențiali.",
      "Somnul, ecranele și tranzițiile merită aliniate înaintea altor diferențe.",
      "Puține reguli comune, bine respectate, sunt mai utile decât un document lung pe care nu-l urmează nimeni.",
    ],
    sources: [
      {
        title: "Tips for Building Structure",
        publisher: "Centers for Disease Control and Prevention",
        url: "https://www.cdc.gov/parenting-toddlers/structure-rules/structure.html",
        note: "Explică pe scurt de ce consistența, predictibilitatea și follow-through formează structura de care au nevoie copiii.",
      },
      {
        title: "How to Support Children after Their Parents Separate or Divorce",
        publisher: "HealthyChildren.org / American Academy of Pediatrics",
        url: "https://www.healthychildren.org/English/healthy-living/emotional-wellness/Building-Resilience/Pages/How-to-Support-Children-after-Parents-Separate-or-Divorce.aspx",
        note: "Leagă adaptarea mai bună a copilului de reguli și așteptări mai consistente între case.",
      },
      {
        title: "Sleep Problems After Separation or Divorce",
        publisher: "HealthyChildren.org / American Academy of Pediatrics",
        url: "https://www.healthychildren.org/English/healthy-living/sleep/Pages/Sleep-Problems-After-Separation-or-Divorce.aspx?form=HealthyChildren",
        note: "Arată concret cât de repede se vede lipsa de rutină în somnul și comportamentul copilului.",
      },
    ],
  },
  {
    slug: "10-minute-de-conectare-dupa-o-zi-grea",
    title: "10 minute de conectare după o zi grea",
    summary:
      "5-10 minute de joc ghidat de copil pot coborî tensiunea mai bine decât întrebările în rafală sau corectarea continuă.",
    intro:
      "După o zi încărcată, mulți părinți intră direct în funcția de management: cum a fost, ai mâncat, ai făcut tema, de ce ești așa. Problema e că un copil tensionat are adesea nevoie mai întâi să se reconecteze, nu să dea raportul. Jocul scurt, condus de el, este una dintre cele mai eficiente punți spre reglare și relație.",
    categorySlug: "activitati-si-conectare",
    publishedAt: "2026-04-02",
    readingTimeMinutes: 5,
    sections: [
      {
        title: "De ce funcționează atât de bine jocul scurt și atent",
        paragraphs: [
          "CDC descrie special playtime ca pe un timp scurt în care copilul conduce activitatea, iar adultul oferă atenție plină, laudă specifică, imitație, descriere și ascultare activă. Asta schimbă rapid tonul relației: copilul nu mai simte că este corectat sau grăbit, ci că este văzut.",
          "Harvard Center on the Developing Child numește aceste schimburi serve and return. Când adultul răspunde interesului copilului și pune în cuvinte ce vede și ce simte, relația susține dezvoltarea socială, emoțională și de limbaj.",
        ],
      },
      {
        title: "Regulile simple pentru 10 minute bune",
        paragraphs: [
          "Nu ai nevoie de multe materiale și nici de o activitate spectaculoasă. Ai nevoie de prezență și de un cadru constant.",
        ],
        bullets: [
          "Alege același interval al zilei când se poate: după sosire, înainte de cină sau înainte de somn.",
          "Lasă telefonul deoparte și intră doar în activitatea copilului.",
          "Descrie și oglindește mai mult decât întrebi sau corectezi.",
          "Evită să preiei controlul jocului sau să-l transformi în lecție.",
          "Dacă ziua a fost grea, păstrează totuși cele 5 minute; consecvența contează.",
        ],
      },
      {
        title: "8 idei simple care merg în ambele case",
        paragraphs: [
          "UNICEF amintește că jocul împreună întărește apropierea și reduce stresul familiei. Nu trebuie să fie elaborat. Contează să fie suficient de ușor încât să îl poți repeta.",
        ],
        bullets: [
          "desen pe aceeași foaie, fiecare adăugând pe rând ceva",
          "Lego sau piese magnetice, fără obiectiv final",
          "joc de rol cu figurine ori plușuri",
          "o plimbare de 10 minute în care copilul decide traseul",
          "muzică și mișcare în sufragerie",
          "gătit foarte simplu: spălat fructe, amestecat, decorat",
          "poveste inventată pe rând, câte o propoziție fiecare",
          "cutie senzorială sau joacă liniștită cu materiale pe care le aveți deja",
        ],
      },
      {
        title: "Semnul că merge",
        paragraphs: [
          "Nu este că devine brusc perfect cooperant. Semnul bun este că tensiunea scade: corpul copilului se înmoaie, apare contact vizual, răspunde mai ușor sau trece mai lin către rutină. Conectarea nu înlocuiește limitele; le face mai ușor de primit.",
        ],
      },
    ],
    takeaways: [
      "5-10 minute de atenție reală au adesea efect mai bun decât 30 de minute de corectat.",
      "Lasă copilul să conducă activitatea și intră în ritmul lui.",
      "Conectarea repetată este o formă de reglare, nu doar de distracție.",
    ],
    sources: [
      {
        title: "Tips for Special Playtime",
        publisher: "Centers for Disease Control and Prevention",
        url: "https://www.cdc.gov/parenting-toddlers/communication/special-playtime.html",
        note: "Descrie foarte concret cum arată 5-10 minute de joacă ghidată de copil și ce comportamente ale adultului ajută.",
      },
      {
        title: "Serve and Return",
        publisher: "Center on the Developing Child at Harvard University",
        url: "https://developingchild.harvard.edu/key-concept/serve-and-return/",
        note: "Fundamentează științific răspunsul adultului la inițiativa copilului și efectul lui asupra dezvoltării.",
      },
      {
        title: "The Playbox / How play strengthens your child’s mental health",
        publisher: "UNICEF Parenting",
        url: "https://www.unicef.org/parenting/playbox",
        note: "Leagă jocul împreună de apropiere, reducerea stresului și bunăstarea emoțională a copilului.",
      },
    ],
  },
];

function compareArticlesByDate(a: BlogArticle, b: BlogArticle) {
  return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
}

function enrichArticle(article: BlogArticle): BlogArticleWithCategory {
  const category = blogCategories.find((item) => item.slug === article.categorySlug);
  if (!category) {
    throw new Error(`Missing blog category for article ${article.slug}`);
  }

  return { ...article, category };
}

export function formatBlogDate(date: string) {
  return new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${date}T12:00:00Z`)
  );
}

export function getAllBlogArticles() {
  return [...blogArticles].sort(compareArticlesByDate).map(enrichArticle);
}

export function getBlogArticleBySlug(slug: string) {
  const article = blogArticles.find((item) => item.slug === slug);
  return article ? enrichArticle(article) : null;
}

export function getFeaturedBlogArticle() {
  const featured = blogArticles.find((item) => item.featured);
  return featured ? enrichArticle(featured) : getAllBlogArticles()[0] ?? null;
}

export function getBlogCategoryBySlug(slug: string) {
  return blogCategories.find((item) => item.slug === slug) ?? null;
}

export function getArticlesForCategory(categorySlug: string) {
  return getAllBlogArticles().filter((article) => article.category.slug === categorySlug);
}
