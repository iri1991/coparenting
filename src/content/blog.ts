export type BlogCategory = {
  slug: string;
  title: string;
  description: string;
  badgeClassName: string;
  surfaceClassName: string;
};

export type BlogCategoryWithTranslation = BlogCategory & {
  titleEn?: string;
  descriptionEn?: string;
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

/**
 * Translatable fields of an article (title, body, takeaways).
 * Sources (URLs/publishers) are language-neutral and stay unchanged.
 */
export type BlogArticleLocale = {
  title: string;
  summary: string;
  intro: string;
  sections: BlogSection[];
  takeaways: string[];
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
  /** English translation — only translatable content fields. Add this to any article to unlock English. */
  en?: BlogArticleLocale;
  /**
   * URL-safe English slug used when the article has an English translation.
   * /en/blog/[enSlug] → served by the same [slug] page after middleware rewrite.
   * Leave unset if no English translation exists.
   */
  enSlug?: string;
};

export type BlogArticleWithCategory = BlogArticle & {
  category: BlogCategory;
};

export const blogTitle = "Blog HomeSplit";
export const blogDescription =
  "Articole în limba română despre co-parenting, reglare emoțională, rutine și activități de conectare, construite din surse psihologice și pediatrice credibile.";

export const blogTitleEn = "HomeSplit blog";
export const blogDescriptionEn =
  "Articles on co-parenting, emotional regulation, routines and connection activities — grounded in credible psychology and pediatrics sources.";

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
    slug: "primele-5-minute-dupa-preluare-fara-interogatoriu",
    enSlug: "the-first-5-minutes-after-pickup-without-an-interrogation",
    title: "Primele 5 minute după preluare, fără interogatoriu",
    summary:
      "După școală, grădiniță sau o schimbare între case, reconectarea merge mai bine când începi cu atenție comună și prezență, nu cu o serie de întrebări puse din reflex.",
    intro:
      "Mulți părinți simt nevoia să recupereze imediat tot ce nu au văzut: cum a fost, ce ai mâncat, ai dormit, cine te-a supărat, ce a spus doamna, cum a fost la cealaltă casă. Intenția e firească. Dar pentru copil, primele minute după o preluare sunt adesea un moment de readaptare, nu de raport. Harvard Center on the Developing Child descrie interacțiunile bune ca pe un schimb scurt și receptiv: observi spre ce se întoarce copilul și intri acolo cu el, înainte să ceri mult limbaj sau organizare.",
    image: {
      src: "/blog/reunion-five-minutes.svg",
      alt: "Părinte și copil reconectându-se calm imediat după preluare",
    },
    categorySlug: "activitati-si-conectare",
    publishedAt: "2026-04-14",
    readingTimeMinutes: 5,
    sections: [
      {
        title: "De ce primul contact contează atât de mult",
        paragraphs: [
          "În modelul serve and return, primul pas este să observi ce semnale dă copilul și unde îi este deja atenția. Nu ai nevoie de un moment lung. Ai nevoie să vezi dacă se uită la tine, la sticla de apă, la geantă, la o piatră găsită pe drum sau dacă, pur și simplu, caută să meargă tăcut lângă tine.",
          "Asta scade presiunea. În loc să îi ceri imediat să treacă dintr-o lume în alta prin explicații, îi oferi o punte mai simplă: mai întâi ne sincronizăm puțin, apoi vorbim. Pentru mulți copii, această ordine face diferența dintre apropiere și rezistență.",
        ],
      },
      {
        title: "Ce poți face în primele minute",
        paragraphs: [
          "Harvard recomandă să răspunzi la semnalul copilului prin sprijin și încurajare. Tradus în viața reală, asta înseamnă să intri lângă ce aduce el, nu să schimbi imediat direcția spre agenda adultului.",
        ],
        bullets: [
          "Spune ceva scurt despre ce vedeți amândoi: ai găsit o frunză mare sau văd că ți-ai luat geanta singur.",
          "Oferă contact simplu, nu obligatoriu: un zâmbet, o mână, o îmbrățișare scurtă dacă o caută.",
          "Lasă câteva zeci de secunde fără întrebări, mai ales dacă pare obosit sau plin.",
          "Dacă vrei informații practice, așteaptă până după apă, gustare sau intrarea în mașină/casă.",
        ],
      },
      {
        title: "Ce întrebare ajută mai mult decât zece",
        paragraphs: [
          "Nu este nevoie să taci tot drumul. Dar ajută să alegi o singură întrebare ușoară, nu un chestionar. O întrebare largă și calmă lasă copilului loc să intre în conversație în ritmul lui.",
        ],
        bullets: [
          "Care a fost partea ta preferată de azi?",
          "Ce simți că ai nevoie acum: apă, liniște, să-mi povestești sau doar să stăm puțin?",
          "Vrei să-mi arăți ceva înainte să vorbim?",
        ],
      },
      {
        title: "Ce merită evitat",
        paragraphs: [
          "Când primele minute devin control de informație, copilul poate simți rapid că trebuie să performeze exact când sistemul lui încă se reașază. Asta nu înseamnă că nu îți pasă. Înseamnă că ordinea contează.",
        ],
        bullets: [
          "Nu începe cu cinci întrebări la rând imediat ce l-ai văzut.",
          "Nu cere rezumat emoțional în vârf de oboseală: și cum te-ai simțit exact acolo?",
          "Nu interpreta tăcerea ca respingere; uneori este doar tranziție.",
          "Nu folosi primele minute ca să verifici ce s-a întâmplat în cealaltă casă.",
        ],
      },
      {
        title: "Semnul că merge",
        paragraphs: [
          "Copilul începe să vină spre tine mai moale: arată ceva, respiră mai jos, vorbește puțin mai ușor sau acceptă să tacă fără tensiune. Nu pentru că ai scos informația potrivită, ci pentru că ai construit din nou ritmul relației înainte de a cere conținut.",
        ],
      },
    ],
    takeaways: [
      "Primele minute după preluare merg mai bine cu atenție comună decât cu interogatoriu.",
      "O singură întrebare calmă valorează mai mult decât un șir de verificări.",
      "Reconectarea scurtă înaintea conversației face trecerea dintre lumi mai ușoară pentru copil.",
    ],
    sources: [
      {
        title: "How-to: 5 Steps for Brain-Building Serve and Return",
        publisher: "Center on the Developing Child at Harvard University",
        url: "https://developingchild.harvard.edu/resources/videos/how-to-5-steps-for-brain-building-serve-and-return/",
        note: "Harvard explică observarea semnalului copilului și răspunsul prin atenție comună, sprijin și schimb scurt, receptiv. Resursa este publicată la 15 mai 2019; pașii sunt rezumați și în ghidul asociat „5 Steps for Brain-Building Serve and Return”.",
      },
    ],
    en: {
      title: "The first 5 minutes after pickup, without an interrogation",
      summary: "After school, nursery or a switch between homes, reconnection works better when you begin with shared attention and presence, not a reflex chain of questions.",
      intro: "Many parents feel the urge to immediately recover everything they missed: how was it, what did you eat, did you sleep, who upset you, what did the teacher say, how was it at the other home. The intention makes sense. But for the child, the first minutes after pickup are often a moment of readjustment, not reporting. Harvard Center on the Developing Child describes good interactions as short, responsive exchanges: you notice where the child's attention already is and join them there before asking for lots of language or organisation.",
      sections: [
        {
          title: "Why the first contact matters so much",
          paragraphs: [
            "In the serve and return model, the first step is noticing the child's signals and where their attention already is. You don't need a long moment. You need to see whether they're looking at you, at their water bottle, at the bag, at a stone they found on the way, or whether they simply need to walk quietly beside you.",
            "That lowers the pressure. Instead of asking the child to move from one world into another through explanations, you offer a simpler bridge: first we sync a little, then we talk. For many children, that order makes the difference between closeness and resistance.",
          ],
        },
        {
          title: "What you can do in the first minutes",
          paragraphs: [
            "Harvard recommends returning the child's signal with support and encouragement. In everyday life, that means joining what they bring rather than immediately redirecting toward the adult agenda.",
          ],
          bullets: [
            "Say something brief about what you're both seeing: you found a big leaf or I see you carried your bag by yourself.",
            "Offer simple contact, not forced contact: a smile, a hand, a short hug if they seek it.",
            "Leave a few dozen seconds without questions, especially if they seem tired or full.",
            "If you need practical information, wait until after water, a snack or settling into the car/home.",
          ],
        },
        {
          title: "The one question that helps more than ten",
          paragraphs: [
            "You don't have to stay silent all the way home. But it helps to choose one easy question, not a questionnaire. One broad, calm question gives the child room to enter the conversation at their own pace.",
          ],
          bullets: [
            "What was your favourite part of today?",
            "What do you feel you need right now: water, quiet, to tell me something, or just to sit together a bit?",
            "Do you want to show me something before we talk?",
          ],
        },
        {
          title: "What is worth avoiding",
          paragraphs: [
            "When the first minutes turn into information control, the child can quickly feel they have to perform exactly when their system is still settling. That doesn't mean you don't care. It means the order matters.",
          ],
          bullets: [
            "Don't begin with five questions in a row the moment you see them.",
            "Don't demand an emotional summary at the peak of tiredness: and how exactly did you feel there?",
            "Don't interpret silence as rejection; sometimes it is simply transition.",
            "Don't use the first minutes to check what happened at the other home.",
          ],
        },
        {
          title: "The sign it's working",
          paragraphs: [
            "The child starts coming toward you more softly: they show you something, breathe lower, talk a little more easily or accept silence without tension. Not because you extracted the right information, but because you rebuilt the rhythm of the relationship before asking for content.",
          ],
        },
      ],
      takeaways: [
        "The first minutes after pickup go better with shared attention than with an interrogation.",
        "One calm question is worth more than a string of checks.",
        "Brief reconnection before conversation makes the shift between worlds easier for the child.",
      ],
    },
  },
  {
    slug: "cand-copilul-iti-arata-ceva-mic-dar-important",
    enSlug: "when-your-child-shows-you-something-small-but-important",
    title: "Când copilul îți arată ceva mic, dar important",
    summary:
      "Un desen, o piatră, o glumă sau un detaliu aparent banal poate fi felul în care copilul spune „uite-mă”; răspunsul scurt și atent întărește relația mai mult decât pare.",
    intro:
      "Copilul vine uneori cu lucruri foarte mici: o bucată de plastilină, o frunză, o grimasă, o propoziție repetată prost sau un „mami, uită-te”. Pentru adultul ocupat, tentația este să amâne: imediat, stai puțin, lasă-mă să termin. Desigur, nu poți opri tot de fiecare dată. Dar Harvard arată că aceste mici invitații sunt „serve-uri” relaționale. Când le observi și le întorci măcar puțin, copilul primește semnalul că este văzut și că inițiativa lui contează.",
    image: {
      src: "/blog/little-bids-connection.svg",
      alt: "Copil care îi arată unui părinte un detaliu mic și primește atenție caldă",
    },
    categorySlug: "activitati-si-conectare",
    publishedAt: "2026-04-14",
    readingTimeMinutes: 5,
    sections: [
      {
        title: "De ce lucrurile mici nu sunt deloc mici",
        paragraphs: [
          "În logica serve and return, copilul inițiază adesea contactul prin gesturi simple, nu prin discursuri mari. Arată ceva, repetă un sunet, se uită spre tine, îți atinge brațul. Aceste momente sunt mici, dar dese. Tocmai de aceea construiesc relația în viața reală.",
          "Pentru un copil care merge între două case sau are zile încărcate, experiența de a fi observat în lucrurile mărunte aduce continuitate. Nu trebuie să fie un eveniment mare ca să se simtă aproape de tine.",
        ],
      },
      {
        title: "Cum răspunzi când nu ai timp mult",
        paragraphs: [
          "Harvard recomandă să întorci semnalul și să îi pui nume. Asta poate însemna doar câteva secunde de atenție reală, nu neapărat zece minute de joc.",
        ],
        bullets: [
          "Oprește-te două-trei secunde și privește exact spre ce îți arată.",
          "Pune în cuvinte: ai făcut un turn foarte înalt sau e o piatră netedă și lucioasă.",
          "Adaugă o reacție simplă: văd de ce ai vrut să-mi arăți asta.",
          "Dacă nu poți continua, spune clar când revii: termin mesajul și apoi stau două minute cu tine să-mi mai arăți.",
        ],
      },
      {
        title: "De ce ajută să numești, nu doar să spui bravo",
        paragraphs: [
          "Lauda generică nu este greșită, dar numirea exactă merge mai adânc. Când pui în cuvinte ce vede, face sau simte copilul, îl ajuți să își organizeze experiența și să simtă că tu chiar ai intrat în momentul lui.",
          "Diferența este între un automat frumos și un răspuns care arată prezență: văd că ai pus piesa roșie chiar sus și ai încercat din nou după ce a căzut. Al doilea spune mai clar te-am observat.",
        ],
      },
      {
        title: "Ce faci dacă te caută tocmai când ești prins",
        paragraphs: [
          "Nu vei putea răspunde complet de fiecare dată, iar copiii pot tolera asta dacă primesc totuși un semnal clar. Partea importantă este să nu lași prea des invitația lor să cadă în gol.",
        ],
        bullets: [
          "Ridică privirea și confirmă înainte de a amâna.",
          "Spune cât durează așteptarea în limbaj concret: după ce pun farfuriile sau după ce închid apelul.",
          "Revenirea contează; dacă ai promis două minute, întoarce-te la ele.",
          "Dacă l-ai ratat de tot, repară simplu: nu m-am uitat când mi-ai arătat, vreau să văd acum.",
        ],
      },
      {
        title: "Semnul că relația se hrănește din asta",
        paragraphs: [
          "Copilul continuă să vină spre tine cu inițiativă, nu doar cu cereri mari sau crize. Asta spune mult. Înseamnă că a învățat că între voi există spațiu și pentru lucrurile mărunte, iar tocmai acolo se consolidează multă siguranță relațională.",
        ],
      },
    ],
    takeaways: [
      "Invitațiile mici ale copilului sunt deseori încercări reale de conectare.",
      "Câteva secunde de atenție specifică pot conta mai mult decât un bravo spus automat.",
      "Dacă amâni, ajută să confirmi clar și să revii când ai promis.",
    ],
    sources: [
      {
        title: "5 Steps for Brain-Building Serve and Return",
        publisher: "Center on the Developing Child at Harvard University",
        url: "https://developingchild.harvard.edu/wp-content/uploads/2024/10/HCDC_ServeReturn_for_Parents_Caregivers_2019.pdf",
        note: "Ghidul Harvard rezumă pașii de observare a semnalului copilului, întoarcerea lui prin sprijin și „naming” a ceea ce copilul vede, face sau simte. În pagina accesată la 14 aprilie 2026 apar explicit ideile de a observa, a răspunde și a pune în cuvinte.",
      },
    ],
    en: {
      title: "When your child shows you something small but important",
      summary: "A drawing, a stone, a joke or an apparently trivial detail can be your child's way of saying 'see me'; a short, attentive response strengthens the relationship more than it seems.",
      intro: "Children sometimes come with very small things: a bit of playdough, a leaf, a face, a badly repeated sentence or a \"mum, look\". For the busy adult, the temptation is to postpone: in a second, wait a bit, let me finish. Of course you can't stop everything every time. But Harvard shows that these small invitations are relational serves. When you notice them and return them even briefly, the child gets the signal that they are seen and that their initiative matters.",
      sections: [
        {
          title: "Why small things are not small at all",
          paragraphs: [
            "In serve and return, children often initiate contact through simple gestures, not big speeches. They show something, repeat a sound, look toward you, touch your arm. These moments are small, but frequent. That is exactly why they build the relationship in real life.",
            "For a child moving between two homes or carrying heavy days, being noticed in the little things brings continuity. It doesn't have to be a big event for them to feel close to you.",
          ],
        },
        {
          title: "How to respond when you don't have much time",
          paragraphs: [
            "Harvard recommends returning the signal and naming it. That can mean just a few seconds of real attention, not necessarily ten minutes of play.",
          ],
          bullets: [
            "Pause for two or three seconds and look exactly at what they're showing.",
            "Put it into words: you made a very tall tower or that's a smooth, shiny stone.",
            "Add a simple reaction: I can see why you wanted to show me that.",
            "If you can't continue, say clearly when you'll come back: I'll finish this message and then spend two minutes with you to show me more.",
          ],
        },
        {
          title: "Why naming helps more than just saying good job",
          paragraphs: [
            "Generic praise isn't wrong, but specific naming goes deeper. When you put words to what the child sees, does or feels, you help them organise their experience and feel that you actually entered their moment.",
            "The difference is between an automatic nice and a response that shows presence: I see you put the red piece right on top and tried again after it fell. The second says more clearly: I noticed you.",
          ],
        },
        {
          title: "What to do if they reach for you right when you're busy",
          paragraphs: [
            "You won't be able to respond fully every time, and children can tolerate that if they still receive a clear signal. The important part is not to let their invitation fall into emptiness too often.",
          ],
          bullets: [
            "Look up and acknowledge before postponing.",
            "Say how long the wait is in concrete language: after I put the plates down or after I end this call.",
            "Returning matters; if you promised two minutes, come back to them.",
            "If you missed it completely, repair simply: I didn't look when you showed me, I want to see now.",
          ],
        },
        {
          title: "The sign the relationship is being fed by this",
          paragraphs: [
            "The child keeps coming toward you with initiative, not only with big requests or crises. That says a lot. It means they have learned that between you there is room for small things too, and a lot of relational safety gets strengthened exactly there.",
          ],
        },
      ],
      takeaways: [
        "A child's small invitations are often genuine attempts at connection.",
        "A few seconds of specific attention can matter more than an automatic good job.",
        "If you delay, it helps to clearly acknowledge and then return when you said you would.",
      ],
    },
  },
  {
    slug: "cum-inchizi-o-activitate-fara-lupta-inainte-de-tranzitie",
    enSlug: "how-to-end-an-activity-without-a-fight-before-a-transition",
    title: "Cum închizi o activitate fără luptă înainte de tranziție",
    summary:
      "Schimbările merg mai lin când copilul primește timp de răspuns, un final recognoscibil și un început clar pentru ce urmează, nu o tăiere bruscă din mers.",
    intro:
      "Fie că urmează plecarea spre cealaltă casă, ieșirea din parc, dușul sau somnul, multe conflicte pornesc exact în clipa în care adultul vrea să oprească ceva ce copilul încă trăiește intens. Harvard include în modelul serve and return două idei foarte utile pentru astfel de momente: schimbul are nevoie de timp și așteptare, iar copiii beneficiază când adulții practică începuturi și încheieri recognoscibile. Cu alte cuvinte, tranzițiile nu se rezolvă doar prin anunț; se reglează și prin ritm.",
    image: {
      src: "/blog/calm-transition-ending.svg",
      alt: "Părinte și copil trecând calm de la o activitate la următoarea înainte de tranziție",
    },
    categorySlug: "rutine-si-tranzitii",
    publishedAt: "2026-04-14",
    readingTimeMinutes: 5,
    sections: [
      {
        title: "De ce nu merge bine când tai brusc",
        paragraphs: [
          "Când copilul este absorbit într-un joc sau într-o activitate plăcută, nu schimbă viteza în aceeași secundă cu tine. Dacă adultul trece direct la gata, acum plecăm, rezistența nu spune neapărat lipsă de cooperare. Spune adesea că sistemul lui n-a avut timp să facă trecerea.",
          "Harvard subliniază că așteptarea face parte din schimbul bun. Pauza mică după ce ai spus ce urmează îi dă copilului timp să răspundă, să proceseze și să își adune ideea despre final.",
        ],
      },
      {
        title: "Cum arată un final recognoscibil",
        paragraphs: [
          "Un final bun nu trebuie să fie lung sau spectaculos. Trebuie doar să fie clar și repetabil, astfel încât copilul să poată recunoaște modelul și să nu trăiască fiecare oprire ca pe o ruptură bruscă.",
        ],
        bullets: [
          "Anunță ce urmează și ce mai rămâne: încă două ture, încă o pagină, încă trei minute.",
          "Spune și pasul următor, nu doar ce se oprește: apoi mergem la mașină sau apoi facem baie.",
          "Lasă copilul să închidă activitatea într-un gest simplu: pune ultima piesă, alege ultima alunecare, închide el cartea.",
          "Folosește aceeași formulare de fiecare dată când poți, ca să devină familiară.",
        ],
      },
      {
        title: "De ce ajută să aștepți după ce ai anunțat",
        paragraphs: [
          "Mulți adulți spun că au avertizat, dar în practică avertismentul și smulgerea vin lipite. Diferența reală apare când există câteva secunde sau un minut de spațiu între ele. Acolo copilul poate protesta puțin, poate negocia scurt sau poate începe să se reașeze.",
          "Așteptarea nu slăbește limita. O face mai ușor de dus. Îi arată copilului că are loc și reacția lui, chiar dacă direcția rămâne aceeași.",
        ],
      },
      {
        title: "Cum legi sfârșitul de un nou început",
        paragraphs: [
          "Pasul cinci din ghidul Harvard vorbește despre a practica încheieri și începuturi. Asta este foarte util înainte de plecări și handover-uri: nu lași doar ceva în urmă, ci intri și într-o formă recognoscibilă a ce vine.",
        ],
        bullets: [
          "După parc: ne urcăm, bem apă, punem centura și alegi tu prima melodie.",
          "După joc: strângem trei piese, mergem la baie și alegi tu prosopul.",
          "Înainte de plecare spre cealaltă casă: punem geanta la ușă, facem un salut scurt, apoi alegi tu dacă vrei să iei cartea sau ursulețul.",
          "Începutul clar reduce senzația că totul se rupe deodată.",
        ],
      },
      {
        title: "Semnul că tranziția devine mai ușoară",
        paragraphs: [
          "Nu dispare orice protest. Dar scad surpriza, agățarea și lupta de putere. Copilul începe să recunoască forma schimbării și are mai puțină nevoie să se apere de fiecare dată ca și cum ar fi o tăiere arbitrară.",
        ],
      },
    ],
    takeaways: [
      "Un avertisment util include și timp real de răspuns, nu doar anunțul.",
      "Copiii cooperează mai ușor când pot recunoaște un final și un început familiar.",
      "Așteptarea scurtă nu slăbește limita; o face mai suportabilă.",
    ],
    sources: [
      {
        title: "5 Steps for Brain-Building Serve and Return",
        publisher: "Center on the Developing Child at Harvard University",
        url: "https://developingchild.harvard.edu/wp-content/uploads/2024/10/HCDC_ServeReturn_for_Parents_Caregivers_2019.pdf",
        note: "Harvard precizează că schimbul bun include turn-taking și așteptare, iar copiii semnalizează când sunt gata să încheie și să înceapă altceva. În ghid apar explicit ideile „Take turns…and wait” și „Practice endings and beginnings”.",
      },
    ],
    en: {
      title: "How to end an activity without a fight before a transition",
      summary: "Changes go more smoothly when the child gets response time, a recognisable ending and a clear beginning for what comes next, rather than a sudden cut in motion.",
      intro: "Whether it's leaving for the other home, leaving the park, bath time or bedtime, many conflicts start exactly when the adult wants to stop something the child is still deeply in. Harvard includes two very useful ideas in the serve and return model for these moments: interaction needs time and waiting, and children benefit when adults practise recognisable endings and beginnings. In other words, transitions are not solved only through an announcement; they are also regulated through rhythm.",
      sections: [
        {
          title: "Why it goes badly when you cut it off abruptly",
          paragraphs: [
            "When a child is absorbed in play or a pleasant activity, they do not change speed in the same second you do. If the adult jumps straight to okay, we're leaving now, resistance does not necessarily mean lack of cooperation. It often means their system did not have time to make the shift.",
            "Harvard highlights that waiting is part of good interaction. The small pause after you say what comes next gives the child time to respond, process and gather their own idea about the ending.",
          ],
        },
        {
          title: "What a recognisable ending looks like",
          paragraphs: [
            "A good ending does not have to be long or dramatic. It only has to be clear and repeatable, so the child can recognise the pattern and not experience every stop as a sudden rupture.",
          ],
          bullets: [
            "Announce what comes next and what still remains: two more turns, one more page, three more minutes.",
            "Name the next step too, not only what is stopping: then we go to the car or then we take a bath.",
            "Let the child close the activity with one simple gesture: place the last piece, choose the last slide, close the book themselves.",
            "Use the same wording whenever you can so it becomes familiar.",
          ],
        },
        {
          title: "Why it helps to wait after you've announced it",
          paragraphs: [
            "Many adults say they warned the child, but in practice the warning and the pulling away happen stuck together. The real difference appears when there are a few seconds or a minute of space between them. In that space, the child can protest a little, negotiate briefly or begin to reorganise.",
            "Waiting does not weaken the limit. It makes it easier to carry. It shows the child that their reaction has room too, even if the direction stays the same.",
          ],
        },
        {
          title: "How to link the ending to a new beginning",
          paragraphs: [
            "Step five in Harvard's guide is about practising endings and beginnings. That is very useful before departures and handovers: you are not only leaving something behind, you are also entering a recognisable form of what comes next.",
          ],
          bullets: [
            "After the park: we get in, drink water, buckle up and you choose the first song.",
            "After play: we put away three pieces, go to the bathroom and you choose the towel.",
            "Before leaving for the other home: we put the bag by the door, do a short goodbye, then you choose whether to take the book or the teddy.",
            "A clear beginning reduces the sense that everything is breaking at once.",
          ],
        },
        {
          title: "The sign the transition is getting easier",
          paragraphs: [
            "Not every protest disappears. But surprise, clinging and power struggles decrease. The child starts recognising the shape of the change and needs less protection against it each time as if it were an arbitrary cut.",
          ],
        },
      ],
      takeaways: [
        "A useful warning includes real response time, not just the announcement.",
        "Children cooperate more easily when they can recognise a familiar ending and beginning.",
        "Brief waiting does not weaken the limit; it makes it more bearable.",
      ],
    },
  },
  {
    slug: "geanta-de-tranzitie-care-scade-stresul-intre-doua-case",
    enSlug: "the-transition-bag-that-reduces-stress-between-homes",
    title: "Geanta de tranziție care scade stresul între două case",
    summary:
      "O geantă simplă, previzibilă și împachetată fără grabă poate reduce mult fricțiunea dintre case și sentimentul că ceva important rămâne mereu în urmă.",
    intro:
      "În multe familii cu două case, stresul nu începe la ușă, ci cu zece minute înainte: unde este bluza preferată, cine a luat caietul, dacă ursulețul a rămas în cealaltă casă. Pentru copil, aceste detalii nu sunt doar obiecte. Sunt repere de continuitate. O geantă de tranziție bine gândită nu face viața perfectă, dar poate face schimbarea mai puțin haotică și mai puțin încărcată emoțional.",
    image: {
      src: "/blog/transition-bag.svg",
      alt: "Geantă de tranziție pentru copil, pregătită calm cu obiecte esențiale pentru două case",
    },
    categorySlug: "rutine-si-tranzitii",
    publishedAt: "2026-04-13",
    readingTimeMinutes: 5,
    sections: [
      {
        title: "De ce contează mai mult decât pare",
        paragraphs: [
          "Raising Children Network recomandă explicit ca obiectele esențiale să existe în ambele case, iar bagajul să fie pregătit cu ajutor și din timp. Ideea din spate este simplă: cu cât copilul trebuie să țină minte mai puține lucruri sub presiune, cu atât tranziția consumă mai puțin.",
          "HealthyChildren explică rolul obiectelor de tranziție, precum păturica sau jucăria preferată, în momentele de separare, oboseală ori medii mai puțin familiare. Pentru mulți copii, aceste obiecte nu sunt mofturi. Sunt o formă concretă de siguranță.",
        ],
      },
      {
        title: "Ce merită să rămână în geantă",
        paragraphs: [
          "Scopul nu este să muți toată casa între două adrese. Scopul este să reduci surprizele neplăcute și să păstrezi câteva ancore stabile. De aceea, geanta bună este mai degrabă repetabilă decât perfectă.",
        ],
        bullets: [
          "Un schimb simplu de haine și lenjerie, dacă logistica voastră cere asta.",
          "Obiectul de confort pe care copilul îl caută când este obosit sau neliniștit.",
          "Caietul, agenda sau lucrurile de școală care chiar trebuie mutate.",
          "Orice element greu de înlocuit rapid: ochelari, aparat dentar, medicație sau încărcătorul necesar.",
        ],
      },
      {
        title: "Ce merită dublat între case",
        paragraphs: [
          "Raising Children Network recomandă păstrarea în ambele case a hainelor de bază, pijamalelor, produselor de igienă și încălțămintei. HealthyChildren merge chiar mai departe pentru obiectele de confort și sugerează, când se poate, o dublură rotită din timp.",
          "Cu cât sunt mai multe esențiale deja disponibile în fiecare casă, cu atât geanta rămâne mai mică și mai puțin încărcată emoțional. Copilul nu mai simte că trebuie să poarte continuitatea familiei pe umeri.",
        ],
      },
      {
        title: "Cum pregătești fără să crești tensiunea",
        paragraphs: [
          "Momentul împachetării contează aproape la fel de mult ca lista. Dacă geanta se face pe fugă, cu reproșuri sau cu verificări repetate, copilul intră în tranziție deja tensionat. Ajută mai mult un ritm scurt și previzibil.",
        ],
        bullets: [
          "Împachetați aproximativ la aceeași oră, nu cu două minute înainte de plecare.",
          "Folosește o listă scurtă vizibilă, ca să nu transformi totul într-un interogatoriu.",
          "La copiii mici, pune tu baza și lasă copilul să aleagă doar un element simplu.",
          "Dacă lipsește ceva, notează și rezolvă adult la adult mai târziu; nu descărca tensiunea pe copil.",
        ],
      },
      {
        title: "Semnul că funcționează",
        paragraphs: [
          "Nu vei obține tranziții perfecte de fiecare dată. Dar dacă scad căutările în ultimul minut, plânsul legat de obiecte uitate și reproșurile la predare, geanta începe să-și facă treaba. Nu pentru că a rezolvat relația dintre adulți, ci pentru că a redus o parte inutilă din fricțiunea logistică.",
        ],
      },
    ],
    takeaways: [
      "Geanta de tranziție bună reduce surprizele, nu mută toată casa între adrese.",
      "Obiectele de confort și câteva esențiale bine alese pot scădea mult stresul copilului.",
      "Cu cât dublați mai multe lucruri de bază între case, cu atât tranziția devine mai ușoară.",
    ],
    sources: [
      {
        title: "Separation, divorce, children in two homes",
        publisher: "Raising Children Network",
        url: "https://raisingchildren.net.au/grown-ups/family-diversity/parenting-after-separation-divorce/helping-children-adjust-two-homes",
        note: "Recomandă obiecte esențiale în ambele case, liste de împachetare și păstrarea jucăriei sau păturicii speciale la schimburi. Pagină accesată la 13 aprilie 2026.",
      },
      {
        title: "Transitional Objects: Security Blankets & Beyond",
        publisher: "HealthyChildren.org / American Academy of Pediatrics",
        url: "https://www.healthychildren.org/English/ages-stages/baby/Pages/Transitional-Objects.aspx",
        note: "AAP explică rolul obiectelor de tranziție în separare și recomandă, când este posibil, existența unei dubluri. Ultima actualizare indicată pe pagină: 22 noiembrie 2021.",
      },
    ],
    en: {
      title: "The transition bag that reduces stress between two homes",
      summary: "A simple, predictable bag packed without rushing can significantly reduce friction between homes and the feeling that something important always gets left behind.",
      intro: "In many two-home families, the stress doesn't start at the door — it starts ten minutes before: where is the favourite top, who packed the notebook, did the teddy bear get left at the other house. For the child, these details are not just objects. They are anchors of continuity. A well-thought-out transition bag won't make life perfect, but it can make the switch less chaotic and less emotionally heavy.",
      sections: [
        { title: "Why it matters more than it seems", paragraphs: ["Raising Children Network explicitly recommends keeping essential items in both homes and preparing the bag with help and in advance. The idea is simple: the fewer things the child has to remember under pressure, the less energy the transition consumes.", "HealthyChildren explains the role of transitional objects — like a favourite blanket or toy — during moments of separation, tiredness or less familiar environments. For many children, these objects are not luxuries. They are a concrete form of safety."] },
        { title: "What deserves to stay in the bag", paragraphs: ["The goal is not to move the whole house between two addresses. The goal is to reduce unpleasant surprises and keep a few stable anchors. That is why a good bag is repeatable rather than perfect."], bullets: ["A simple change of clothes and underwear, if your logistics require it.", "The comfort object the child reaches for when tired or anxious.", "The notebook, planner or school items that genuinely need to move.", "Anything hard to replace quickly: glasses, dental brace, medication or a necessary charger."] },
        { title: "What deserves to be doubled between homes", paragraphs: ["Raising Children Network recommends keeping basics in both homes: clothes, pyjamas, toiletries and shoes. HealthyChildren goes further for comfort objects and suggests, where possible, a spare rotated in advance.", "The more essentials are already available in each home, the smaller and less emotionally heavy the bag stays. The child no longer feels they have to carry family continuity on their shoulders."] },
        { title: "How to pack without raising the tension", paragraphs: ["The packing moment matters almost as much as the list. If the bag is done in a rush, with reproaches or repeated checks, the child enters the transition already tense. A short, predictable rhythm helps more."], bullets: ["Pack at roughly the same time, not two minutes before leaving.", "Use a short visible list so you don't turn it all into an interrogation.", "With young children, lay out the basics yourself and let the child choose just one simple item.", "If something is missing, note it and sort it adult to adult later; don't unload the tension onto the child."] },
        { title: "The sign it's working", paragraphs: ["You won't get perfect transitions every time. But if last-minute searches, crying over forgotten items and reproaches at drop-off decrease, the bag is doing its job — not because it fixed the adult relationship, but because it removed an unnecessary slice of logistical friction."] },
      ],
      takeaways: ["A good transition bag reduces surprises; it doesn't move the whole house between addresses.", "Comfort objects and a few well-chosen essentials can significantly lower the child's stress.", "The more basics you duplicate between homes, the easier the transition becomes."],
    },
  },
  {
    slug: "ce-merita-sa-stie-scoala-sau-gradinita-despre-un-copil-cu-doua-case",
    enSlug: "what-school-should-know-about-a-child-with-two-homes",
    title: "Ce merită să știe școala sau grădinița despre un copil cu două case",
    summary:
      "Câteva informații clare date din timp către școală sau grădiniță pot preveni confuzii, rușine pentru copil și multă logistică făcută în ultimul moment.",
    intro:
      "Mulți părinți ezită să spună la școală sau la grădiniță că un copil trăiește între două case. Uneori din dorința de discreție, alteori pentru că situația încă doare. Dar instituția nu are nevoie de detalii intime. Are nevoie de câteva informații practice și stabile, astfel încât copilul să nu fie prins între mesaje contradictorii, întârzieri sau întrebări pe care nu știe cum să le gestioneze.",
    image: {
      src: "/blog/two-homes-school.svg",
      alt: "Părinte discutând calm cu o educatoare despre organizarea copilului între două case",
    },
    categorySlug: "coparenting",
    publishedAt: "2026-04-13",
    readingTimeMinutes: 5,
    sections: [
      {
        title: "De ce ajută să știe",
        paragraphs: [
          "HealthyChildren recomandă explicit ca profesorii sau personalul de sprijin din școală să fie informați despre separare, tocmai pentru a putea observa din timp eventuale dificultăți și pentru a ști pe cine contactează în situații practice sau urgente.",
          "Pentru copil, asta înseamnă mai puține momente stânjenitoare. Nu mai trebuie să explice singur de ce îl ia azi alt părinte, de ce are două adrese sau de ce un mesaj nu a ajuns unde trebuia.",
        ],
      },
      {
        title: "Ce informații sunt utile și suficiente",
        paragraphs: [
          "Nu este nevoie să intri în povestea despărțirii. O comunicare bună către școală este scurtă, neutră și orientată spre ce are nevoie copilul ca să funcționeze bine în fiecare zi.",
        ],
        bullets: [
          "Cine are drept de ridicare și în ce zile se schimbă rutina, dacă există un tipar clar.",
          "Ce numere de telefon și adrese de e-mail trebuie folosite pentru anunțuri și urgențe.",
          "Dacă sunt două seturi de documente sau două persoane care trebuie incluse constant în comunicare.",
          "Orice detaliu practic relevant pentru copil: obiecte de tranziție, reacții la schimbări sau sprijin util la despărțire.",
        ],
      },
      {
        title: "Cum formulezi fără să încarci relația",
        paragraphs: [
          "Tonul face diferența. Dacă mesajul către școală devine locul unde îți exprimi nemulțumirea față de celălalt părinte, copilul va simți asta mai devreme sau mai târziu. Varianta utilă este una administrativă și calmă.",
          "Poți scrie simplu că familia funcționează acum între două case, că vrei o comunicare clară către ambii părinți și că orice schimbare importantă ajută să fie transmisă direct adulților, nu prin copil.",
        ],
      },
      {
        title: "Semne că merită un contact mai apropiat cu educatorul sau învățătorul",
        paragraphs: [
          "HealthyChildren amintește că separarea poate veni cu schimbări de dispoziție, atenție sau adaptare. Dacă apar frecvent plâns la predare, uitare accentuată, scădere la școală sau retragere, merită să ceri feedback regulat, nu doar să aștepți următoarea problemă.",
        ],
        bullets: [
          "Copilul pare dezorganizat exact în zilele de schimbare între case.",
          "Apar frecvent obiecte sau teme uitate în contextul tranzițiilor.",
          "Există reacții puternice la despărțire ori la schimbări de plan în timpul programului.",
          "Școala poate deveni un reper de predictibilitate dacă adulții din jur comunică coerent.",
        ],
      },
      {
        title: "Ce merită evitat",
        paragraphs: [
          "Nu lăsa copilul să fie canalul principal pentru informațiile dintre casă și instituție. Nu cere nici școlii să medieze conflictul dintre adulți. Rolul ei este să sprijine copilul, nu să arbitreze relația dintre părinți.",
        ],
      },
    ],
    takeaways: [
      "Școala sau grădinița are nevoie de informații practice, nu de povestea conflictului.",
      "O comunicare scurtă și neutră poate preveni multe confuzii pentru copil.",
      "Dacă apar semne de stres la predare sau în învățare, feedback-ul timpuriu ajută mult.",
    ],
    en: {
      title: "What the school or nursery should know about a child with two homes",
      summary: "A few clear pieces of information given in time to school or nursery can prevent confusion, embarrassment for the child and a lot of last-minute logistics.",
      intro: "Many parents hesitate to tell school or nursery that a child lives between two homes. Sometimes out of a desire for privacy, sometimes because the situation still hurts. But the institution doesn't need intimate details. It needs a few practical, stable pieces of information so the child isn't caught between contradictory messages, delays or questions they don't know how to handle.",
      sections: [
        { title: "Why it helps them to know", paragraphs: ["HealthyChildren explicitly recommends that teachers or school support staff be informed about the separation, precisely so they can spot difficulties early and know who to contact in practical or urgent situations.", "For the child, this means fewer awkward moments. They no longer have to explain alone why a different parent is picking them up today, why they have two addresses or why a message didn't reach the right person."] },
        { title: "What information is useful and sufficient", paragraphs: ["There is no need to get into the story of the separation. Good communication to school is short, neutral and focused on what the child needs to function well every day."], bullets: ["Who has collection rights and on which days the routine changes, if there is a clear pattern.", "Which phone numbers and email addresses to use for notices and emergencies.", "Whether there are two sets of documents or two people who need to be consistently included in communication.", "Any practical detail relevant to the child: transitional objects, reactions to changes or useful support at drop-off."] },
        { title: "How to frame it without loading the relationship", paragraphs: ["Tone makes a difference. If the message to school becomes the place where you express your frustration with the other parent, the child will feel that sooner or later. The useful version is administrative and calm.", "You can write simply that the family now operates between two homes, that you want clear communication directed to both parents, and that any important change is helpful to send directly to the adults, not through the child."] },
        { title: "Signs that a closer contact with the teacher is warranted", paragraphs: ["HealthyChildren notes that separation can come with changes in mood, attention or adjustment. If crying at drop-off, increased forgetfulness, academic decline or withdrawal appear frequently, it's worth requesting regular feedback rather than waiting for the next problem."], bullets: ["The child seems disorganised specifically on home-switching days.", "Items or homework are frequently forgotten in the context of transitions.", "There are strong reactions at drop-off or to plan changes during the school day.", "School can become a predictability anchor if the surrounding adults communicate coherently."] },
        { title: "What to avoid", paragraphs: ["Don't let the child be the main channel for information between home and the institution. Don't ask school to mediate the conflict between adults either. Its role is to support the child, not to arbitrate the parental relationship."] },
      ],
      takeaways: ["School or nursery needs practical information, not the story of the conflict.", "A short, neutral message can prevent a lot of confusion for the child.", "If signs of stress appear at drop-off or in learning, early feedback helps a great deal."],
    },
    sources: [
      {
        title: "Adjusting to Divorce",
        publisher: "HealthyChildren.org / American Academy of Pediatrics",
        url: "https://www.healthychildren.org/English/family-life/family-dynamics/types-of-families/Pages/adjusting-to-divorce.aspx",
        note: "AAP recomandă ca profesorii sau asistenții sociali școlari să fie informați și precizează că școala trebuie să știe pe cine contactează pentru permisiuni și urgențe. Ultima actualizare indicată pe pagină: 16 decembrie 2025.",
      },
      {
        title: "How to Support Children after Their Parents Separate or Divorce",
        publisher: "HealthyChildren.org / American Academy of Pediatrics",
        url: "https://www.healthychildren.org/English/healthy-living/emotional-wellness/Building-Resilience/Pages/How-to-Support-Children-after-Parents-Separate-or-Divorce.aspx",
        note: "Completează cu ideea că adaptarea copilului merge mai bine când adulții colaborează și păstrează rutina copilului cât mai stabilă. Pagina indică ultima actualizare la 29 septembrie 2020.",
      },
    ],
  },
  {
    slug: "cand-lucrurile-raman-in-cealalta-casa-fara-sa-pui-copilul-la-mijloc",
    enSlug: "when-things-get-left-at-the-other-home",
    title: "Când lucrurile rămân în cealaltă casă, fără să pui copilul la mijloc",
    summary:
      "Obiectele uitate între două case se rezolvă mai bine prin sisteme simple și comunicare adult la adult decât prin reproșuri sau presiune pusă pe copil.",
    intro:
      "La prima vedere, o geacă uitată, un caiet rămas în cealaltă casă sau pijamalele dispărute par probleme mici. În practică, ele se transformă repede în tensiune, mai ales când fiecare uitare vine la pachet cu grabă, presupuneri și replici tăioase. Pentru copil, însă, problema nu este doar obiectul lipsă. Este felul în care adulții se schimbă la față în jurul lui. De aceea, merită un sistem calm înainte să devină un nou loc de conflict.",
    image: {
      src: "/blog/forgotten-items.svg",
      alt: "Doi părinți organizând calm obiectele copilului uitate între două case",
    },
    categorySlug: "coparenting",
    publishedAt: "2026-04-13",
    readingTimeMinutes: 5,
    sections: [
      {
        title: "De ce problema se amplifică atât de repede",
        paragraphs: [
          "Raising Children Network recomandă păstrarea obiectelor esențiale în ambele case tocmai pentru a reduce presiunea logistică de la schimburi. Când fiecare casă depinde de ce a ajuns din cealaltă, orice uitare se simte mai mare decât este.",
          "În același timp, aceeași rețea subliniază că modul în care părinții gestionează conflictul îi afectează direct pe copii. Dacă obiectele uitate devin pretext pentru ironii, cereri transmise prin copil sau dispute la ușă, problema reală nu mai este geaca, ci tensiunea relațională din jurul ei.",
        ],
      },
      {
        title: "Ce ajută concret",
        paragraphs: [
          "Soluțiile bune sunt mai degrabă plictisitoare decât spectaculoase: dubluri, o listă scurtă și un canal clar de comunicare între adulți. Exact asta le face utile. Ele scad numărul de decizii luate pe fugă și reduc șansele ca copilul să devină curier emoțional.",
        ],
        bullets: [
          "Păstrează în ambele case lucrurile de bază: pijamale, încălțăminte, produse de igienă și haine simple.",
          "Folosește un mesaj scurt adult la adult pentru lucrurile importante, fără explicații sau reproșuri inutile.",
          "Ține o listă de obiecte care chiar trebuie transferate regulat: teme, medicație, aparat dentar, echipament sportiv.",
          "Dacă ceva lipsește des, ajustați sistemul, nu tonul conversației.",
        ],
      },
      {
        title: "Ce să nu ceri copilului",
        paragraphs: [
          "Nu îl transforma în detectiv, avocat sau martor. Replici precum spune-i mamei să-mi dea geaca, vezi dacă tata a uitat iar sau data viitoare să fii atent mută asupra copilului o grijă care nu îi aparține.",
          "Copilul poate participa la rutină în funcție de vârstă, dar nu ar trebui să poarte responsabilitatea relației dintre adulți. Una este să bifeze o listă alături de tine. Alta este să gestioneze tensiunea când ceva lipsește.",
        ],
      },
      {
        title: "Cum arată o comunicare bună între adulți",
        paragraphs: [
          "Raising Children Network recomandă o abordare calmă, respectuoasă și cât mai apropiată de un schimb între colegi. În practica de zi cu zi, asta înseamnă mesaj factual, fără subînțelesuri și cu accent pe rezolvare.",
        ],
        bullets: [
          "Scrie ce lipsește și când ar ajuta să ajungă, fără comentarii despre trecut.",
          "Dacă față în față escaladează repede, mutați logistica pe text sau e-mail.",
          "Rezolvă problema în afara urechilor copilului ori de câte ori se poate.",
          "Când observați un tipar, discutați sistemul într-un moment neutru, nu în plină grabă.",
        ],
      },
      {
        title: "Când e semn că sistemul trebuie schimbat",
        paragraphs: [
          "Dacă aproape în fiecare săptămână lipsesc obiecte importante, nu mai vorbim despre accidente izolate. Poate fi nevoie de mai multe dubluri, de o listă comună mai bună sau de o reducere a lucrurilor care circulă între case. Obiectivul nu este controlul perfect, ci mai puțină fricțiune pentru copil.",
        ],
      },
    ],
    takeaways: [
      "Obiectele uitate se gestionează mai bine prin sistem decât prin reproș.",
      "Copilul poate ajuta la rutină, dar nu trebuie să ducă relația logistică dintre adulți.",
      "Mai multe dubluri și mai puține mesaje încărcate reduc tensiunea reală a schimburilor.",
    ],
    en: {
      title: "When things get left at the other home, without putting the child in the middle",
      summary: "Forgotten items between two homes are handled better through simple systems and adult-to-adult communication than through reproaches or pressure on the child.",
      intro: "At first glance, a forgotten jacket, a notebook left at the other home or missing pyjamas seem like small problems. In practice, they quickly turn into tension — especially when each forgotten item comes packaged with rushing, assumptions and sharp remarks. For the child, however, the problem isn't just the missing object. It's the way the adults change when it's in the room. That's why a calm system is worth setting up before it becomes a new source of conflict.",
      sections: [
        { title: "Why the problem escalates so quickly", paragraphs: ["Raising Children Network explicitly recommends keeping essential items in both homes to reduce logistical pressure at handovers. When each home depends on what arrived from the other, every forgotten item feels bigger than it is.", "At the same time, the same network highlights that the way parents handle conflict directly affects children. If forgotten items become a pretext for sarcasm, requests sent through the child or disputes at the door, the real problem is no longer the jacket — it's the relational tension around it."] },
        { title: "What actually helps", paragraphs: ["Good solutions are more boring than spectacular: duplicates, a short list and a clear channel for adult communication. That's exactly what makes them useful. They reduce the number of decisions made in a hurry and lower the chances of the child becoming an emotional courier."], bullets: ["Keep basics in both homes: pyjamas, shoes, toiletries and simple clothes.", "Use a short adult-to-adult message for important items, without unnecessary explanations or reproaches.", "Keep a list of items that genuinely need regular transferring: homework, medication, dental brace, sports equipment.", "If something is missing frequently, adjust the system, not the tone of the conversation."] },
        { title: "What not to ask of the child", paragraphs: ["Don't turn them into a detective, lawyer or witness. Phrases like tell mum to give me the jacket back, see if dad forgot again or next time pay attention shift onto the child a responsibility that isn't theirs.", "The child can participate in the routine according to their age, but shouldn't carry the responsibility for the adult relationship. Checking off a list alongside you is one thing. Managing the tension when something is missing is another."] },
        { title: "What good adult communication looks like", paragraphs: ["Raising Children Network recommends a calm, respectful approach as close as possible to an exchange between colleagues. In day-to-day practice, that means a factual message, without subtext and focused on resolution."], bullets: ["Write what's missing and when it would help it to arrive, without comments about the past.", "If face-to-face escalates quickly, move logistics to text or email.", "Resolve the issue out of the child's earshot whenever possible.", "When you notice a pattern, discuss the system at a neutral moment, not in the middle of a rush."] },
        { title: "When it's a sign the system needs changing", paragraphs: ["If important items are missing almost every week, we're no longer talking about isolated accidents. More duplicates, a better shared list or a reduction of items that circulate between homes may be needed. The goal isn't perfect control, but less friction for the child."] },
      ],
      takeaways: ["Forgotten items are managed better through systems than through reproach.", "The child can help with the routine, but shouldn't carry the logistics relationship between adults.", "More duplicates and fewer loaded messages reduce the real tension of handovers."],
    },
    sources: [
      {
        title: "Separation, divorce, children in two homes",
        publisher: "Raising Children Network",
        url: "https://raisingchildren.net.au/grown-ups/family-diversity/parenting-after-separation-divorce/helping-children-adjust-two-homes",
        note: "Recomandă obiecte esențiale în ambele case, liste de împachetare și organizare clară între părinți pentru a reduce stresul copilului. Pagină accesată la 13 aprilie 2026.",
      },
      {
        title: "How to handle co-parenting conflict",
        publisher: "Raising Children Network",
        url: "https://raisingchildren.net.au/grown-ups/family-diversity/co-parenting/conflict-former-partner",
        note: "Descrie comunicarea respectuoasă, evitarea copilului ca mesager și mutarea conversațiilor tensionate în afara prezenței lui. Pagină accesată la 13 aprilie 2026.",
      },
    ],
  },
  {
    slug: "cand-copilul-spune-ca-la-celalalt-parinte-e-mai-bine",
    enSlug: "when-your-child-says-its-better-at-the-other-parents",
    title: "Când copilul spune că la celălalt părinte este mai bine",
    summary:
      "Comparația dintre case nu cere defensivă sau concurs, ci calm, curiozitate și atenție la ce încearcă de fapt copilul să spună.",
    intro:
      "Replica «la mama e mai bine» sau «la tata mă lași mai mult» poate înțepa imediat. Pentru adult, sună ușor ca o notă la purtare ori ca un atac la propria casă. Pentru copil, de multe ori este altceva: o comparație spontană, o încercare de a numi o diferență, uneori chiar o formă stângace de a spune că îi este greu cu schimbarea. Dacă răspunzi ca și cum ai de apărat un teritoriu, conversația se blochează repede. Dacă rămâi curios și stabil, afli mult mai repede ce are nevoie copilul de fapt.",
    image: {
      src: "/blog/comparing-homes.svg",
      alt: "Copil între două case stilizate, vorbind calm cu un părinte despre diferențe",
    },
    categorySlug: "coparenting",
    publishedAt: "2026-04-11",
    readingTimeMinutes: 6,
    sections: [
      {
        title: "De ce comparațiile apar atât de des",
        paragraphs: [
          "HealthyChildren arată că după separare copiii se adaptează mai bine când pot păstra relații apropiate cu ambii părinți și nu sunt împinși să aleagă tabere. Asta înseamnă că vor observa inevitabil diferențe între case și le vor rosti uneori direct, fără filtru și fără intenția de a răni.",
          "Comparația poate descrie o preferință reală, o nevoie de predictibilitate sau pur și simplu faptul că două medii nu se simt la fel. Când adultul o tratează ca pe un afront, copilul învață repede că unele adevăruri nu sunt sigure de spus în casa respectivă.",
        ],
      },
      {
        title: "Ce spui în momentul acela",
        paragraphs: [
          "Primul pas util este să nu intri în duel. Copilul are nevoie să vadă că poți auzi diferența fără să te rupi emoțional. De multe ori, o reflecție scurtă deschide conversația mai bine decât o justificare.",
          "Ajută să rămâi foarte aproape de faptă și de emoție: vrei să înțelegi ce i-a plăcut, ce i-a lipsit sau ce i s-a părut greu. Asta păstrează conversația în zona de sprijin, nu de loialitate.",
        ],
        bullets: [
          "Începe cu ceva simplu: aud că ți s-a părut mai bine acolo la momentul acela.",
          "Întreabă concret: ce anume ți-a plăcut mai mult sau ce ți-a fost mai ușor?",
          "Dacă spune o diferență reală, nu o contrazice automat doar ca să-ți aperi regula.",
          "Separă preferința copilului de valoarea ta ca părinte; nu sunt același lucru.",
        ],
      },
      {
        title: "Ce merită evitat",
        paragraphs: [
          "HealthyChildren avertizează clar împotriva punerii copilului în mijlocul conflictului dintre adulți. Când răspunsul tău vine cu sarcasm, critică la adresa celuilalt părinte sau cereri de validare, copilul ajunge imediat într-o poziție imposibilă.",
          "Nu ajută nici să transformi comparația într-un proces despre recunoștință. Chiar dacă replica te-a durut, copilul nu este responsabil să-ți repare starea și nici să dovedească pe loc că te iubește la fel de mult.",
        ],
        bullets: [
          "Nu răspunde cu: atunci du-te acolo dacă este mai bine.",
          "Nu cere copilului să decidă cine are dreptate.",
          "Nu folosi conversația ca să aduni informații despre celălalt părinte.",
          "Nu intra într-un concurs de avantaje, cadouri sau permisivități.",
        ],
      },
      {
        title: "Când diferența e util să fie discutată adult la adult",
        paragraphs: [
          "Unele comparații ascund o nevoie foarte practică: poate copilul adoarme mai ușor într-un anumit fel, poate are nevoie de aceeași ordine la teme, poate se pierde când programul diferă prea mult. Raising Children Network recomandă păstrarea unor repere recognoscibile între case și comunicarea directă între adulți, nu prin copil.",
          "Nu trebuie să faceți casele identice. Dar dacă observați că aceeași diferență produce stres repetat, merită să aliniați câțiva piloni: somn, ecrane, obiecte de confort, temele sau felul în care anunțați schimbările.",
        ],
      },
      {
        title: "Când comparația poate ascunde ceva mai serios",
        paragraphs: [
          "Dacă replica vine împreună cu teamă intensă, retragere, refuz puternic al vizitelor, plângeri repetate despre siguranță sau schimbări mari de comportament, merită mai mult decât o conversație despre reguli. În acel punct, ajută să discuți cu pediatrul sau cu un psiholog de copii și să urmărești atent dacă este vorba despre stres de adaptare ori despre o problemă de siguranță.",
        ],
      },
    ],
    takeaways: [
      "Comparația dintre case nu este automat un verdict împotriva ta.",
      "Curiozitatea calmă deschide mai mult decât defensiva sau sarcasmul.",
      "Dacă o diferență produce stres repetat, soluția se discută adult la adult, nu prin copil.",
    ],
    en: {
      title: "When your child says it is better at the other parent's",
      summary: "The comparison between homes doesn't call for defensiveness or a contest — it calls for calm, curiosity and attention to what the child is actually trying to say.",
      intro: "The line \"it's better at mum's\" or \"dad lets me do more\" can sting immediately. To an adult it can sound like a report card or an attack on your home. For the child, it is often something else: a spontaneous comparison, an attempt to name a difference, sometimes even a clumsy way of saying the change is hard. If you respond as if you're defending territory, the conversation shuts down fast. If you stay curious and stable, you find out much sooner what the child actually needs.",
      sections: [
        { title: "Why comparisons come up so often", paragraphs: ["HealthyChildren shows that after separation children adjust better when they can keep close relationships with both parents and aren't pushed to take sides. That means they will inevitably notice differences between homes and sometimes voice them directly, without a filter and without intending to hurt.", "The comparison may describe a real preference, a need for predictability or simply the fact that two environments don't feel the same. When the adult treats it as an affront, the child quickly learns that some truths aren't safe to say in that house."] },
        { title: "What to say in that moment", paragraphs: ["The first useful step is not to enter a duel. The child needs to see that you can hear the difference without falling apart emotionally. Often a short reflection opens the conversation better than a justification.", "It helps to stay very close to the observation and the feeling: you want to understand what they liked, what they missed or what felt hard. This keeps the conversation in the support zone, not the loyalty zone."], bullets: ["Start simply: I hear that felt better there at that point.", "Ask concretely: what specifically did you like more or what felt easier?", "If they name a real difference, don't automatically contradict it just to defend your rule.", "Separate the child's preference from your value as a parent; they are not the same thing."] },
        { title: "What to avoid", paragraphs: ["HealthyChildren warns clearly against putting the child in the middle of adult conflict. When your response comes with sarcasm, criticism of the other parent or requests for validation, the child is immediately placed in an impossible position.", "Turning the comparison into a trial about gratitude doesn't help either. Even if the remark hurt, the child isn't responsible for repairing your mood or proving on the spot that they love you just as much."], bullets: ["Don't respond with: then go there if it's better.", "Don't ask the child to decide who is right.", "Don't use the conversation to gather information about the other parent.", "Don't enter a contest of advantages, gifts or permissiveness."] },
        { title: "When the difference is useful to discuss adult to adult", paragraphs: ["Some comparisons hide a very practical need: perhaps the child falls asleep more easily in a particular way, perhaps they need the same homework routine, perhaps they get lost when the schedules differ too much. Raising Children Network recommends keeping recognisable anchors between homes and communicating directly between adults, not through the child.", "You don't need to make the homes identical. But if you notice the same difference consistently producing stress, it's worth aligning a few pillars: sleep, screens, comfort objects, homework or the way you announce changes."] },
        { title: "When the comparison may hide something more serious", paragraphs: ["If the remark comes together with intense fear, withdrawal, strong refusal of visits, repeated safety complaints or major behavioural changes, it deserves more than a conversation about rules. At that point, talking to the paediatrician or a child psychologist and watching carefully whether it's adaptation stress or a safety issue is warranted."] },
      ],
      takeaways: ["A comparison between homes is not automatically a verdict against you.", "Calm curiosity opens more than defensiveness or sarcasm.", "If a difference produces repeated stress, the solution is discussed adult to adult, not through the child."],
    },
    sources: [
      {
        title: "How to Support Children after Their Parents Separate or Divorce",
        publisher: "HealthyChildren.org / American Academy of Pediatrics",
        url: "https://www.healthychildren.org/English/healthy-living/emotional-wellness/Building-Resilience/Pages/How-to-Support-Children-after-Parents-Separate-or-Divorce.aspx",
        note: "AAP insistă pe conflict redus, relație apropiată cu ambii părinți și evitarea presiunii de loialitate. Pagina indică ultima actualizare la 29 septembrie 2020.",
      },
      {
        title: "Traps Divorced or Separating Parents Should Avoid",
        publisher: "HealthyChildren.org / American Academy of Pediatrics",
        url: "https://www.healthychildren.org/English/healthy-living/emotional-wellness/Building-Resilience/Pages/Traps-Divorced-or-Separating-Parents-Should-Avoid.aspx",
        note: "AAP descrie explicit riscul de a pune copilul în mijlocul conflictului și de a-l face să aleagă între părinți. Pagina a fost accesată pentru această cercetare la 11 aprilie 2026.",
      },
      {
        title: "Separation, divorce, children in two homes",
        publisher: "Raising Children Network",
        url: "https://raisingchildren.net.au/grown-ups/family-diversity/parenting-after-separation-divorce/helping-children-adjust-two-homes",
        note: "Completează cu recomandări despre menținerea relației cu ambii părinți și câțiva piloni stabili între case. Pagina a fost accesată pentru această cercetare la 11 aprilie 2026.",
      },
    ],
  },
  {
    slug: "cum-anunti-schimbarile-de-program-fara-sa-incarci-copilul",
    enSlug: "how-to-announce-schedule-changes-without-overloading-the-child",
    title: "Cum anunți schimbările de program fără să încarci copilul",
    summary:
      "Schimbările de ultim moment devin mai ușor de dus când sunt spuse simplu, din timp și fără să transformi copilul în gestionarul tensiunii dintre adulți.",
    intro:
      "În co-parenting, planurile nu ies mereu perfect: cineva întârzie, apare o deplasare, o zi de școală se schimbă, un weekend trebuie mutat. Pentru adulți, schimbarea poate părea doar logistică. Pentru copil, ea poate însemna că harta pe care se baza s-a mutat sub picioare. De aceea, nu contează doar ce se schimbă, ci și cum anunți schimbarea. Mesajul bun este scurt, previzibil și nu cere copilului să ducă greutatea emoțională a adulților.",
    image: {
      src: "/blog/schedule-change.svg",
      alt: "Calendar și copil pregătit de un părinte pentru o schimbare de program între două case",
    },
    categorySlug: "rutine-si-tranzitii",
    publishedAt: "2026-04-11",
    readingTimeMinutes: 6,
    sections: [
      {
        title: "De ce schimbările de plan se simt atât de mari",
        paragraphs: [
          "Child Mind Institute explică faptul că tranzițiile sunt dificile pentru mulți copii fiindcă le cer să oprească un scenariu cunoscut și să intre repede într-altul. În familiile cu două case, schimbarea nu este doar de activitate, ci uneori de casă, ritm și persoană de referință.",
          "Când adultul anunță totul pe fugă sau cu multă tensiune în voce, copilul nu primește doar informație. Primește și starea adultului. Asta poate transforma o schimbare gestionabilă într-una care se simte amenințătoare.",
        ],
      },
      {
        title: "Cum arată un mesaj bun",
        paragraphs: [
          "CDC recomandă structură și consecvență: copilul se reglează mai ușor când schimbările sunt anunțate clar, cu puține cuvinte și cu o idee simplă despre ce rămâne stabil. În practică, asta înseamnă să spui noul plan și să oferi imediat ancora principală.",
          "Copilul nu are nevoie de toată istoria din spatele deciziei. Are nevoie să știe când, cu cine și ce rămâne neschimbat pentru el.",
        ],
        bullets: [
          "Spune schimbarea direct: azi nu te ia tata după școală, te ia mâine dimineață.",
          "Adaugă imediat ancora: în seara asta dormi aici și facem rutina obișnuită.",
          "Folosește aceeași formă de mesaj de fiecare dată, fără explicații prea multe.",
          "Dacă se poate, anunță din timp, nu cu 30 de secunde înainte de plecare.",
        ],
      },
      {
        title: "Ce îl ajută să proceseze",
        paragraphs: [
          "Mulți copii înțeleg mai bine schimbarea când o văd, nu doar când o aud. O tablă mică, un calendar simplu sau o propoziție repetată în același format pot face diferența. Child Mind Institute recomandă preview-ul și avertizarea din timp tocmai pentru că reduc senzația de surpriză brutală.",
          "La copiii mai mici, harta poate fi foarte simplă: azi aici, mâine acolo, după somn sau după școală. La copiii mai mari, ajută să vadă exact ce se mută și ce rămâne la fel.",
        ],
        bullets: [
          "Folosește un calendar vizual sau aceeași culoare pentru fiecare casă.",
          "Repetă aceeași ancora de timp: după școală, după somn, vineri seara.",
          "Lasă copilul să pună o întrebare sau să spună ce îi pare cel mai greu.",
          "Dacă schimbarea afectează un plan așteptat, numește și dezamăgirea, nu doar noua logistică.",
        ],
      },
      {
        title: "Ce merită evitat",
        paragraphs: [
          "Nu ajută să anunți schimbarea împreună cu reproșuri despre celălalt părinte. Nici să transformi copilul în confident pentru frustrarea ta. Mesajele de tipul iar s-a răzgândit, vezi cum face sau spune-i tu că nu e corect îi mută imediat pe umeri conflictul adulților.",
          "Nu ajută nici să promiți ceva nesigur doar ca să liniștești momentul. Predictibilitatea reală calmează mai mult decât optimismul improvizat.",
        ],
      },
      {
        title: "Când problema nu mai este schimbarea în sine, ci frecvența ei",
        paragraphs: [
          "Dacă programul se schimbă atât de des încât copilul rămâne constant în alertă, nu mai este doar o chestiune de formulare mai bună. În acel punct, merită ca adulții să refacă logistica și să reducă improvizația, pentru că nici cel mai bun mesaj nu compensează haosul repetat.",
        ],
      },
    ],
    takeaways: [
      "Schimbările de plan dor mai puțin când copilul află clar ce rămâne stabil.",
      "Mesajul bun este scurt, previzibil și fără tensiunea adulților înăuntru.",
      "Dacă improvizația devine regulă, problema este logistica, nu reacția copilului.",
    ],
    en: {
      title: "How to announce schedule changes without overloading the child",
      summary: "Last-minute changes become easier to bear when they are communicated simply, in advance and without making the child the manager of adult tension.",
      intro: "In co-parenting, plans don't always go perfectly: someone is late, a work trip comes up, a school day shifts, a weekend needs to move. For adults the change can feel like pure logistics. For the child it can mean the map they were relying on has shifted under their feet. That's why what changes matters, but so does how you announce it. A good message is short, predictable and doesn't ask the child to carry the emotional weight of the adults.",
      sections: [
        { title: "Why plan changes feel so big", paragraphs: ["Child Mind Institute explains that transitions are difficult for many children because they are asked to stop a familiar scenario and enter another one quickly. In two-home families the change is not just of activity but sometimes of home, rhythm and reference person.", "When the adult announces everything in a rush or with a lot of tension in their voice, the child doesn't just receive information. They receive the adult's state as well. This can turn a manageable change into one that feels threatening."] },
        { title: "What a good message looks like", paragraphs: ["CDC recommends structure and consistency: the child regulates better when changes are announced clearly, with few words and with a simple idea of what remains stable. In practice, this means stating the new plan and immediately offering the main anchor.", "The child doesn't need the whole history behind the decision. They need to know when, with whom and what stays unchanged for them."], bullets: ["State the change directly: today dad isn't picking you up after school, he'll come tomorrow morning.", "Immediately add the anchor: tonight you sleep here and we'll do the usual routine.", "Use the same message format every time, without too many explanations.", "If possible, announce in advance, not 30 seconds before leaving."] },
        { title: "What helps them process", paragraphs: ["Many children understand a change better when they see it, not just hear it. A small board, a simple calendar or a phrase repeated in the same format can make a difference. Child Mind Institute recommends preview and advance warning precisely because they reduce the sensation of a brutal surprise.", "For younger children the map can be very simple: today here, tomorrow there, after sleep or after school. For older children it helps to see exactly what moves and what stays the same."], bullets: ["Use a visual calendar or the same colour for each home.", "Repeat the same time anchor: after school, after sleep, Friday evening.", "Let the child ask a question or say what feels hardest.", "If the change affects an anticipated plan, name the disappointment too, not just the new logistics."] },
        { title: "What to avoid", paragraphs: ["Announcing the change alongside reproaches about the other parent doesn't help. Nor does turning the child into a confidant for your frustration. Messages like they changed their mind again, see how they operate or you tell them it's not fair immediately shift the adult conflict onto the child's shoulders.", "Promising something uncertain just to calm the moment doesn't help either. Real predictability calms more than improvised optimism."] },
        { title: "When the problem is no longer the change itself but its frequency", paragraphs: ["If the schedule changes so often that the child is constantly on alert, better phrasing is no longer enough. At that point, the adults need to redo the logistics and reduce improvisation, because even the best message can't compensate for repeated chaos."] },
      ],
      takeaways: ["Plan changes hurt less when the child hears clearly what stays stable.", "A good message is short, predictable and free of adult tension.", "If improvisation becomes the rule, the problem is logistics, not the child's reaction."],
    },
    sources: [
      {
        title: "Why Do Kids Have Trouble With Transitions?",
        publisher: "Child Mind Institute",
        url: "https://childmind.org/article/why-do-kids-have-trouble-with-transitions/",
        note: "Child Mind explică de ce preview-ul, avertizarea și pașii clari reduc rezistența la schimbare. Pagina a fost accesată pentru această cercetare la 11 aprilie 2026.",
      },
      {
        title: "Tips for Building Structure",
        publisher: "Centers for Disease Control and Prevention",
        url: "https://www.cdc.gov/parenting-toddlers/structure-rules/structure.html",
        note: "CDC leagă structura copilului de consistență, predictibilitate și follow-through. Pagina indică publicarea la 8 august 2024.",
      },
    ],
  },
  {
    slug: "cum-il-ajuti-pe-copil-sa-puna-in-cuvinte-ce-simte",
    enSlug: "how-to-help-your-child-put-feelings-into-words",
    title: "Cum îl ajuți pe copil să pună în cuvinte ce simte",
    summary:
      "Când adultul numește blând emoția și o suportă fără grabă, copilul începe treptat să treacă de la izbucnire la exprimare.",
    intro:
      "Un copil care trântește, plânge, se închide sau explodează nu are mereu lipsă de voință. Uneori are prea puține cuvinte pentru ce i se întâmplă în corp. În familiile cu două case, asta se vede și mai ușor: dor, frustrare, oboseală, gelozie și neliniște se pot amesteca repede. Rolul adultului nu este să forțeze copilul să vorbească frumos imediat, ci să îi împrumute un limbaj calm până când poate face asta mai singur.",
    image: {
      src: "/blog/feelings-words.svg",
      alt: "Părinte și copil privind împreună simboluri simple pentru emoții și cuvinte",
    },
    categorySlug: "emotii-si-siguranta",
    publishedAt: "2026-04-11",
    readingTimeMinutes: 6,
    sections: [
      {
        title: "De ce contează atât de mult să pui emoția în cuvinte",
        paragraphs: [
          "CDC recomandă ascultarea activă și reflectarea sentimentelor copilului în cuvinte simple. Asta nu este doar politețe relațională. Este o formă practică de reglare: copilul începe să înțeleagă ce i se întâmplă și nu mai trebuie să comunice totul doar prin comportament.",
          "Harvard Center on the Developing Child descrie relațiile bune cu copilul ca pe un schimb de tip serve and return: copilul trimite un semnal, adultul îl observă și răspunde adecvat. Când semnalul este emoțional, răspunsul adecvat este adesea numirea stării, nu corectarea ei grăbită.",
        ],
      },
      {
        title: "Cum începi fără să forțezi",
        paragraphs: [
          "Nu ai nevoie de vocabular complicat. Cu cât copilul este mai mic sau mai activat, cu atât formula trebuie să fie mai scurtă. Important este să rămâi aproape de ce vezi și să lași loc să fii corectat.",
          "Uneori e suficient să oferi două variante: pari furios sau poate mai degrabă dezamăgit. Când copilul te corectează, tot un pas bun este. Înseamnă că deja intră în procesul de a se înțelege.",
        ],
        bullets: [
          "Pornește de la observabil: văd lacrimi, corp încordat, voce tare, retragere.",
          "Leagă observația de un cuvânt simplu: cred că ești trist, furios, jenat sau copleșit.",
          "Păstrează tonul jos și ritmul lent; emoția nu se numește eficient din grabă.",
          "Acceptă și non-răspunsul; uneori copilul are nevoie doar să audă că l-ai înțeles.",
        ],
      },
      {
        title: "Ce îl ajută să învețe limbajul emoțiilor în viața de zi cu zi",
        paragraphs: [
          "Emoțiile nu se învață doar în criză. CDC arată că relația se întărește când adultul descrie, imită și laudă comportamentele copilului în momente calme. Poți folosi aceeași logică și pentru alfabetul emoțional: pui în cuvinte ce vezi când copilul este liniștit, curios, mândru sau dezamăgit.",
          "Cu cât adultul numește mai des emoții mici, cu atât copilul le recunoaște mai repede înainte să devină uriașe. Asta ajută mult în tranziții, după zile grele și în momentele în care simte dor de celălalt părinte.",
        ],
        bullets: [
          "Numește și emoțiile plăcute: pari ușurat, mândru, liniștit, entuziasmat.",
          "Folosește povești, joc sau desene ca să vorbiți despre stări fără presiune directă.",
          "Leagă emoția de corp: ți s-au strâns pumnii, cred că ceva te-a enervat mult.",
          "Normalizează amestecurile: poți fi și bucuros, și trist în aceeași zi.",
        ],
      },
      {
        title: "Ce merită evitat",
        paragraphs: [
          "Nu ajută să contrazici rapid emoția cu nu ai de ce sau lasă că trece. Nici să folosești etichete globale precum ești prea sensibil ori iar faci dramă. Acestea nu îl învață pe copil să se înțeleagă, ci doar că anumite stări trebuie ascunse.",
          "Nu ajută nici să transformi conversația despre emoții într-un interogatoriu lung. Uneori copilul are nevoie de câteva cuvinte bune și de prezență calmă, nu de analiză în profunzime.",
        ],
      },
      {
        title: "Când merită sprijin suplimentar",
        paragraphs: [
          "Dacă izbucnirile, retragerea sau anxietatea sunt foarte intense, apar în multe contexte și nu se reduc deloc odată cu sprijinul de bază, poate fi utilă o discuție cu pediatrul sau cu un psiholog de copii. Scopul nu este să patologizezi emoția, ci să îl ajuți pe copil să aibă mai multă siguranță și mai multe instrumente.",
        ],
      },
    ],
    takeaways: [
      "Copilul împrumută de la adult nu doar calmul, ci și limbajul pentru ce simte.",
      "Numirea scurtă și blândă a emoției reduce presiunea de a o exprima doar prin comportament.",
      "Alfabetul emoțional se construiește zilnic, nu doar în momentele de criză.",
    ],
    en: {
      title: "How to help your child put feelings into words",
      summary: "When the adult gently names the emotion and holds it without rushing, the child gradually begins to move from outburst to expression.",
      intro: "A child who slams doors, cries, shuts down or explodes isn't always lacking willpower. Sometimes they simply have too few words for what is happening inside them. In two-home families this shows up even more clearly: longing, frustration, tiredness, jealousy and anxiety can mix quickly. The adult's role is not to force the child to speak nicely straight away, but to lend them a calm language until they can do it more on their own.",
      sections: [
        { title: "Why putting emotion into words matters so much", paragraphs: ["CDC recommends active listening and reflecting the child's feelings in simple words. This is not just relational politeness. It is a practical form of regulation: the child begins to understand what is happening and no longer has to communicate everything only through behaviour.", "Harvard Center on the Developing Child describes good interactions with children as serve-and-return exchanges: the child sends a signal, the adult notices and responds appropriately. When the signal is emotional, the appropriate response is often naming the state, not rushing to correct it."] },
        { title: "How to start without forcing", paragraphs: ["You don't need complex vocabulary. The younger or more activated the child, the shorter the formula needs to be. What matters is staying close to what you observe and leaving room to be corrected.", "Sometimes it's enough to offer two options: you seem angry or maybe more like disappointed. When the child corrects you, that's still a good step. It means they're already entering the process of understanding themselves."], bullets: ["Start from the observable: I see tears, a tense body, a loud voice, withdrawal.", "Link the observation to a simple word: I think you're sad, angry, embarrassed or overwhelmed.", "Keep your tone low and your rhythm slow; emotion isn't named well in a rush.", "Accept the non-response too; sometimes the child just needs to hear they've been understood."] },
        { title: "What helps them learn the language of emotions in daily life", paragraphs: ["Emotions aren't learned only in a crisis. CDC shows that the relationship strengthens when the adult describes, imitates and praises the child's behaviours in calm moments. You can use the same logic for the emotional alphabet: put into words what you see when the child is quiet, curious, proud or disappointed.", "The more often the adult names small emotions, the more quickly the child recognises them before they become enormous. This helps a great deal during transitions, after heavy days and in moments when they miss the other parent."], bullets: ["Name pleasant emotions too: you seem relieved, proud, calm, excited.", "Use stories, play or drawings to talk about states without direct pressure.", "Link emotion to the body: your fists clenched, I think something made you very angry.", "Normalise mixes: you can be both happy and sad in the same day."] },
        { title: "What to avoid", paragraphs: ["Quickly contradicting the emotion with there's no reason or it'll pass doesn't help. Neither do global labels like you're too sensitive or there you go dramatising again. These don't teach the child to understand themselves — they only teach that certain states need to be hidden.", "Turning the conversation about emotions into a long interrogation doesn't help either. Sometimes the child needs a few good words and a calm presence, not in-depth analysis."] },
        { title: "When extra support is warranted", paragraphs: ["If outbursts, withdrawal or anxiety are very intense, appear in many contexts and don't reduce at all with basic support, a conversation with the paediatrician or a child psychologist may be useful. The goal is not to pathologise the emotion, but to give the child more safety and more tools."] },
      ],
      takeaways: ["The child borrows from the adult not just the calm, but also the language for what they feel.", "A short, gentle naming of the emotion reduces the pressure to express it only through behaviour.", "The emotional alphabet is built daily, not just in moments of crisis."],
    },
    sources: [
      {
        title: "Tips for Active Listening",
        publisher: "Centers for Disease Control and Prevention",
        url: "https://www.cdc.gov/parenting-toddlers/communication/active-listening.html",
        note: "CDC recomandă reflecția emoției, coborârea la nivelul copilului și validarea sentimentelor. Pagina indică publicarea la 8 august 2024.",
      },
      {
        title: "Tips for Praise, Imitation, and Description",
        publisher: "Centers for Disease Control and Prevention",
        url: "https://www.cdc.gov/parenting-toddlers/communication/praise.html",
        note: "CDC arată cum descrierea și observarea atentă îl ajută pe copil să se simtă văzut și să învețe din interacțiuni calme. Pagina indică publicarea la 8 august 2024.",
      },
      {
        title: "Serve and Return",
        publisher: "Center on the Developing Child at Harvard University",
        url: "https://developingchild.harvard.edu/key-concept/serve-and-return/",
        note: "Harvard fundamentează răspunsul sensibil al adultului la semnalele copilului și rolul lui în dezvoltarea autoreglării. Pagina a fost accesată pentru această cercetare la 11 aprilie 2026.",
      },
    ],
  },
  {
    slug: "cand-copilului-ii-este-dor-de-celalalt-parinte",
    enSlug: "when-your-child-misses-the-other-parent",
    title: "Când copilului îi este dor de celălalt părinte",
    summary:
      "Dorul nu se rezolvă prin competiție sau distragere forțată, ci prin validare, continuitate și respect pentru legătura copilului cu ambii părinți.",
    intro:
      "În familiile cu două case, un copil poate spune foarte direct că îi este dor de mama sau de tata, ori poate arăta asta mai indirect: devine retras, iritabil, cere des telefonul sau pare că nu se poate așeza în casa în care se află. Pentru adult, momentul poate înțepa exact în locul sensibil. E tentant să iei reacția personal, să te aperi sau să grăbești copilul spre altceva. Dar dorul nu este un vot împotriva ta. Este, de obicei, semnul că legătura cu celălalt părinte contează și că are nevoie să fie ținută în siguranță, nu pusă în competiție.",
    image: {
      src: "/blog/missing-other-parent.svg",
      alt: "Copil și părinte stând împreună calm, cu un cadru de familie în apropiere",
    },
    categorySlug: "coparenting",
    publishedAt: "2026-04-10",
    readingTimeMinutes: 6,
    sections: [
      {
        title: "De ce dorul nu este o problemă de loialitate",
        paragraphs: [
          "HealthyChildren arată că adaptarea copilului după separare merge mai bine atunci când ambii părinți rămân implicați pozitiv și susțin relația copilului cu celălalt părinte. Asta înseamnă că un copil poate fi bine atașat de tine și, în același timp, să-i fie dor de celălalt adult important din viața lui.",
          "Când adultul interpretează dorul ca respingere, copilul ajunge să-și cenzureze emoția. În loc să se simtă mai apropiat, începe să simtă că trebuie să aleagă ce e permis să spună în fiecare casă. Exact asta crește tensiunea în loc să o reducă.",
        ],
      },
      {
        title: "Ce spui în momentul acela",
        paragraphs: [
          "CDC recomandă ascultarea activă: oprești ce faci, cobori ritmul și reflectezi în cuvinte simple ce pare că simte copilul. Nu trebuie să găsești replica perfectă. E suficient să arăți că ai auzit și că emoția lui nu te sperie.",
          "Adesea ajută să numești două emoții deodată. Un copil poate fi trist și neliniștit, doritor și furios, sau dor și oboseală la un loc. Când pui cuvinte pe mai multe straturi, îl ajuți să se înțeleagă mai bine și reduci presiunea de a reacționa prin opoziție.",
        ],
        bullets: [
          "Începe cu o reflecție simplă: îți e dor de mama/tata și cred că se simte greu acum.",
          "Nu corecta imediat emoția cu dar uite ce frumos e aici sau nu ai de ce să fii trist.",
          "Întreabă ce l-ar ajuta acum: un apel scurt, o poză, să stea puțin lipit de tine, să fie în liniște.",
          "Dacă nimerești emoția doar pe jumătate, lasă-l să te corecteze; și asta îl ajută să-și pună în ordine starea.",
        ],
      },
      {
        title: "Cum păstrezi legătura fără să intri în competiție",
        paragraphs: [
          "HealthyChildren recomandă să respecți relația copilului cu celălalt părinte și să nu-l faci să se simtă vinovat că iubește ambii adulți. Asta poate însemna să permiți forme predictibile și rezonabile de continuitate, nu să transformi casa ta într-o zonă unde celălalt părinte dispare din limbaj.",
          "Continuitatea bună e calmă și limitată: un apel stabilit, o fotografie, un obiect de tranziție, o rutină clară despre când vorbiți. Copilul se așază mai ușor când știe că legătura nu depinde de tensiunea dintre adulți.",
        ],
      },
      {
        title: "Ce merită evitat",
        paragraphs: [
          "În astfel de momente, greșelile frecvente sunt sarcasmul, competiția și interogatoriul. Replici de tipul aici nu-ți lipsește nimic, iar începi sau după câte fac pentru tine tot la el/ea te gândești nu reduc dorul, ci îl amestecă cu rușine.",
          "Nu ajută nici să folosești copilul pentru a obține informații ori validare despre celălalt părinte. Dacă emoția copilului devine poarta de intrare pentru conflictul adult, siguranța lui scade imediat.",
        ],
      },
      {
        title: "Când e nevoie de mai mult sprijin",
        paragraphs: [
          "Merită urmărit mai atent dacă dorul vine constant cu panică, somn mult dereglat, refuz repetat al tranzițiilor, retragere socială sau izbucniri care nu se reduc deloc după ce copilul primește sprijin și predictibilitate. În astfel de situații, discuția cu pediatrul sau cu un psiholog de copii poate clarifica dacă vorbim doar despre o adaptare firească ori despre o încărcare mai mare.",
        ],
      },
    ],
    takeaways: [
      "Dorul de celălalt părinte nu este respingere, ci semn că legătura contează.",
      "Ascultarea activă și validarea emoției calmează mai bine decât distragerea forțată.",
      "Copilul se așază mai ușor când ambii părinți respectă relația lui cu celălalt adult.",
    ],
    en: {
      title: "When your child misses the other parent",
      summary: "Missing someone isn't resolved through competition or forced distraction, but through validation, continuity and respect for the child's bond with both parents.",
      intro: "In two-home families, a child may say very directly that they miss mum or dad, or may show it more indirectly: becoming withdrawn, irritable, asking constantly for the phone or seeming unable to settle in the home they're currently in. For the adult, the moment can sting in exactly the tender spot. It's tempting to take it personally, get defensive or hurry the child onto something else. But missing someone is not a vote against you. It is usually a sign that the bond with the other parent matters and needs to be held safely, not placed in competition.",
      sections: [
        { title: "Why missing someone is not a loyalty problem", paragraphs: ["HealthyChildren shows that children's adjustment after separation goes better when both parents stay positively involved and support the child's relationship with the other parent. This means a child can be deeply attached to you and at the same time miss the other important adult in their life.", "When the adult interprets longing as rejection, the child ends up censoring the emotion. Instead of feeling closer, they begin to sense they must choose what's allowed to say in each home. This is exactly what increases tension rather than reducing it."] },
        { title: "What to say in that moment", paragraphs: ["CDC recommends active listening: you stop what you're doing, slow your rhythm and reflect in simple words what the child seems to be feeling. You don't need to find the perfect reply. It's enough to show you heard and that their emotion doesn't frighten you.", "It often helps to name two emotions at once. A child can be sad and unsettled, longing and angry, or missing and tired all at the same time. When you put words to multiple layers, you help them understand themselves better and reduce the pressure to react through opposition."], bullets: ["Start with a simple reflection: you miss mum/dad and I think that feels hard right now.", "Don't immediately correct the emotion with but look how nice it is here or there's no reason to be sad.", "Ask what might help now: a short call, a photo, sitting close to you for a bit, some quiet.", "If you only capture the emotion halfway, let them correct you; that too helps them sort out how they feel."] },
        { title: "How to maintain the connection without entering competition", paragraphs: ["HealthyChildren recommends respecting the child's relationship with the other parent and not making them feel guilty for loving both adults. This can mean allowing predictable and reasonable forms of continuity, not turning your home into a space where the other parent disappears from the language.", "Good continuity is calm and limited: a scheduled call, a photograph, a transitional object, a clear routine about when you talk. The child settles more easily when they know the bond doesn't depend on the tension between adults."] },
        { title: "What to avoid", paragraphs: ["In these moments, common mistakes are sarcasm, competition and interrogation. Phrases like you have everything you need here, there you go again or after everything I do for you it's still them you think about don't reduce the longing — they mix it with shame.", "Using the child to gather information or validation about the other parent doesn't help either. If the child's emotion becomes the entry point for adult conflict, their sense of safety drops immediately."] },
        { title: "When more support is needed", paragraphs: ["It's worth watching more carefully if the longing consistently comes with panic, severely disrupted sleep, repeated refusal of transitions, social withdrawal or outbursts that don't reduce at all after the child receives support and predictability. In such situations, a conversation with the paediatrician or a child psychologist can clarify whether we're talking about a natural adjustment or a heavier emotional load."] },
      ],
      takeaways: ["Missing the other parent is not rejection — it's a sign that the bond matters.", "Active listening and validating the emotion settle things better than forced distraction.", "The child settles more easily when both parents respect their relationship with the other adult."],
    },
    sources: [
      {
        title: "How to Support Children after Their Parents Separate or Divorce",
        publisher: "HealthyChildren.org / American Academy of Pediatrics",
        url: "https://www.healthychildren.org/English/healthy-living/emotional-wellness/Building-Resilience/Pages/How-to-Support-Children-after-Parents-Separate-or-Divorce.aspx",
        note: "AAP subliniază implicarea pozitivă a ambilor părinți, protejarea copilului de conflict și menținerea relației apropiate cu părintele nerezident. Ultima actualizare indicată pe pagină: 29 septembrie 2020.",
      },
      {
        title: "Tips for Active Listening",
        publisher: "Centers for Disease Control and Prevention",
        url: "https://www.cdc.gov/parenting-toddlers/communication/active-listening.html",
        note: "CDC oferă pași foarte practici pentru reflecția emoției, coborârea la nivelul copilului și tolerarea emoțiilor mixte. Publicat la 8 august 2024.",
      },
      {
        title: "Adjusting to Divorce",
        publisher: "HealthyChildren.org / American Academy of Pediatrics",
        url: "https://www.healthychildren.org/English/family-life/family-dynamics/types-of-families/Pages/adjusting-to-divorce.aspx",
        note: "Completează cu recomandări despre a nu forța copilul să aleagă tabere și despre păstrarea relației cu ambii părinți. Ultima actualizare indicată pe pagină: 16 decembrie 2025.",
      },
    ],
  },
  {
    slug: "cum-repari-dupa-ce-ai-tipat-la-copil",
    enSlug: "how-to-repair-after-shouting-at-your-child",
    title: "Cum repari după ce ai țipat la copil",
    summary:
      "Reparația nu înseamnă explicații lungi sau vină vărsată pe copil, ci pauză, revenire calmă și reconectare clară după ruptură.",
    intro:
      "Există seri în care părintele își pierde reglajul: vocea urcă, corpul se încordează, replica iese mai dur decât a vrut. După aceea apare adesea rușinea, iar adultul oscilează între două extreme: fie minimalizează complet momentul, fie vine spre copil cu prea multă descărcare emoțională. Nici una nu ajută prea mult. Ce repară cu adevărat este un proces scurt și coerent: te oprești, îți reglezi corpul, revii și repari relația fără să muți povara pe copil.",
    image: {
      src: "/blog/repair-after-yelling.svg",
      alt: "Părinte și copil reconectându-se după un moment tensionat",
    },
    categorySlug: "emotii-si-siguranta",
    publishedAt: "2026-04-10",
    readingTimeMinutes: 6,
    sections: [
      {
        title: "Primul pas nu este discursul, ci frâna",
        paragraphs: [
          "Child Mind Institute notează că, atunci când și părintele, și copilul sunt dereglați, e greu să repari ceva util în plină activare. În astfel de momente ajută o oprire intenționată: te oprești, respiri, ieși puțin din reacție și alegi următorul pas mai degrabă decât să continui pe pilot automat.",
          "Asta contează și pentru copil. Dacă revii prea repede cu explicații, justificări sau lecții, el primește încă un val peste un sistem deja încărcat. Reparația începe mai bine după ce intensitatea a scăzut puțin de ambele părți.",
        ],
      },
      {
        title: "Ce arată o reparație bună",
        paragraphs: [
          "Harvard Center on the Developing Child descrie interacțiunile bune ca pe un schimb receptiv, în care adultul observă semnalul copilului și răspunde adecvat. După o ruptură, asta înseamnă să revii către el cu prezență, nu doar cu reguli.",
          "O reparație bună este scurtă și concretă: numești ce ai făcut, îți asumi partea ta și reasiguri relația. Nu îi ceri copilului să te liniștească și nu transformi conversația într-o scenă despre cât de rău te simți tu.",
        ],
        bullets: [
          "Spune direct: am țipat mai tare decât era în regulă.",
          "Leagă asta de relație: nu era vina ta să duci tonul meu.",
          "Adaugă limita fără moralizare lungă: problema rămâne, dar o rezolvăm altfel.",
          "Întreabă ce l-ar ajuta acum să se simtă din nou în siguranță: apă, spațiu, îmbrățișare, stat împreună.",
        ],
      },
      {
        title: "Ce evităm când cerem iertare",
        paragraphs: [
          "Nu ajută scuzele încărcate cu explicații de adult: am făcut asta pentru că m-ai provocat, sunt terminat, uite ce greu îmi este. Asta mută accentul de pe repararea relației pe reglarea părintelui prin copil.",
          "Nu ajută nici varianta inversă, în care te comporți ca și cum nu s-a întâmplat nimic. Copilul simte ruptura chiar dacă tu nu o numești. Când adultul repară explicit, copilul învață că relațiile pot trece prin tensiune fără să se rupă definitiv.",
        ],
      },
      {
        title: "Cum previi repetarea, nu doar închizi episodul",
        paragraphs: [
          "Child Mind Institute insistă că părintele are nevoie să-și înțeleagă propriile emoții în raport cu copilul și să observe ce face situația mai bună sau mai rea. Merită să te întrebi după episod ce te-a împins în reacție: foame, grabă, zgomot, neînțelegere, acumulare din altă parte.",
          "Uneori prevenția e foarte banală și tocmai de aceea eficientă: mai puține cereri simultane, o pauză de 30 de secunde înainte de răspuns, o rutină clară în orele dificile, sau revenirea la conversație mai târziu când toți sunt mai disponibili.",
        ],
      },
      {
        title: "Când devine important ajutorul din afară",
        paragraphs: [
          "Dacă țipatul, intimidarea sau reacțiile explozive sunt frecvente, nu mai vorbim doar despre un episod izolat de reparație. În acel punct, merită sprijin real pentru reglarea adultului și pentru siguranța relației: psihoterapie, parenting suportiv sau discuție cu un specialist care lucrează cu familii și copii.",
        ],
      },
    ],
    takeaways: [
      "După ce ai țipat, regula de bază este pauză, apoi reparație clară.",
      "Scuza bună își asumă tonul adultului fără să pună copilul să aline părintele.",
      "Reparația adevărată include și întrebarea ce schimbăm data viitoare.",
    ],
    en: {
      title: "How to repair after you've shouted at your child",
      summary: "Repair doesn't mean long explanations or guilt unloaded onto the child, but a pause, a calm return and clear reconnection after the rupture.",
      intro: "There are evenings when a parent loses their regulation: the voice rises, the body tenses, the reply comes out harsher than intended. Shame often follows, and the adult swings between two extremes: either minimising the moment entirely or coming towards the child with too much emotional unloading. Neither works well. What genuinely repairs is a short, coherent process: you stop, regulate your body, return and repair the relationship without shifting the burden onto the child.",
      sections: [
        { title: "The first step is not the speech, but the brake", paragraphs: ["Child Mind Institute notes that when both parent and child are dysregulated, it's hard to repair anything useful in the middle of activation. In those moments an intentional stop helps: you pause, breathe, step out of the reaction and choose the next step rather than continuing on autopilot.", "This matters for the child too. If you return too quickly with explanations, justifications or lessons, they receive yet another wave over a system already overloaded. Repair starts better after the intensity has dropped a little on both sides."] },
        { title: "What good repair looks like", paragraphs: ["Harvard Center on the Developing Child describes good interactions as receptive exchanges in which the adult notices the child's signal and responds appropriately. After a rupture, this means returning to them with presence, not just with rules.", "Good repair is short and concrete: you name what you did, own your part and reassure the relationship. You don't ask the child to soothe you and don't turn the conversation into a scene about how bad you feel."], bullets: ["Say it directly: I shouted louder than was okay.", "Link it to the relationship: it wasn't your fault to carry my tone.", "Add the limit without lengthy moralising: the issue remains, but we'll handle it differently.", "Ask what would help them feel safe again now: water, space, a hug, sitting together."] },
        { title: "What to avoid when apologising", paragraphs: ["Apologies loaded with adult explanations don't help: I did that because you provoked me, I'm exhausted, look how hard it is for me. This shifts the focus from repairing the relationship to the parent regulating themselves through the child.", "The opposite — behaving as if nothing happened — doesn't help either. The child senses the rupture even if you don't name it. When the adult repairs explicitly, the child learns that relationships can pass through tension without breaking permanently."] },
        { title: "How to prevent it recurring, not just close the episode", paragraphs: ["Child Mind Institute insists that the parent needs to understand their own emotions in relation to the child and notice what makes the situation better or worse. It's worth asking yourself after the episode what pushed you into the reaction: hunger, rushing, noise, misunderstanding, build-up from elsewhere.", "Sometimes prevention is very mundane and precisely for that reason effective: fewer simultaneous demands, a 30-second pause before responding, a clear routine during difficult hours, or returning to the conversation later when everyone is more available."] },
        { title: "When outside help becomes important", paragraphs: ["If shouting, intimidation or explosive reactions are frequent, we're no longer talking about an isolated episode of repair. At that point, real support for the adult's regulation and for the safety of the relationship is warranted: psychotherapy, supportive parenting work or a conversation with a specialist who works with families and children."] },
      ],
      takeaways: ["After shouting, the basic rule is pause, then clear repair.", "A good apology owns the adult's tone without asking the child to soothe the parent.", "True repair also includes asking: what do we change next time."],
    },
    sources: [
      {
        title: "DBT for Parents",
        publisher: "Child Mind Institute",
        url: "https://childmind.org/article/dbt-for-parents/",
        note: "Explică oprirea reacției, înțelegerea emoțiilor adultului și alegerea conștientă între repararea relației și urmărirea unui obiectiv. Ultima revizuire indicată pe pagină: 24 aprilie 2025.",
      },
      {
        title: "How-to: 5 Steps for Brain-Building Serve and Return",
        publisher: "Center on the Developing Child at Harvard University",
        url: "https://developingchild.harvard.edu/resources/how-to-5-steps-for-brain-building-serve-and-return/",
        note: "Harvard fundamentează importanța răspunsului receptiv și a revenirii către semnalele copilului; resursa video este publicată la 15 mai 2019.",
      },
    ],
  },
  {
    slug: "cand-copilul-spune-ca-nu-vrea-sa-mearga-in-cealalta-casa",
    enSlug: "when-your-child-refuses-to-go-to-the-other-home",
    title: "Când copilul spune că nu vrea să meargă în cealaltă casă",
    summary:
      "Refuzul unei tranziții nu cere verdict rapid despre părinți, ci calm, reasigurare și o verificare atentă a modului în care se face schimbul.",
    intro:
      "Puține momente apasă mai tare un părinte decât replica «nu vreau să merg la mama» sau «nu vreau să merg la tata». E ușor să o auzi ca pe o confirmare că ceva este profund greșit în cealaltă casă ori ca pe o dovadă că trebuie să insiști imediat. Dar, în multe situații, copilul nu exprimă un verdict matur despre relație, ci dificultatea reală a separării, a schimbării de ritm sau a modului în care se face handover-ul. Asta cere mai întâi reglare și clarificare, nu interogatoriu.",
    image: {
      src: "/blog/child-refuses-other-home.svg",
      alt: "Părinte care îl liniștește pe copil înaintea unei tranziții între două case",
    },
    categorySlug: "rutine-si-tranzitii",
    publishedAt: "2026-04-09",
    readingTimeMinutes: 6,
    sections: [
      {
        title: "De ce apare refuzul fără să însemne automat că unul dintre părinți este problema",
        paragraphs: [
          "Raising Children Network explică limpede că unii copii au dificultăți reale când se mută între case și că dorința de a rămâne într-un loc sau de a se întoarce repede poate apărea pur și simplu pentru că separarea este grea, mai ales la copiii mici sau în perioadele în care rutina încă nu s-a așezat.",
          "Cu alte cuvinte, propoziția nu vreau să merg poate descrie disconfortul tranziției, oboseală, anticiparea unei despărțiri sau frica de necunoscutul următoarei ore. Dacă adultul o tratează imediat ca pe un proces de intenție împotriva celuilalt părinte, copilul ajunge și mai prins între loialități.",
        ],
      },
      {
        title: "Ce faci în momentul acela",
        paragraphs: [
          "Primul obiectiv nu este să câștigi disputa, ci să reduci intensitatea. Copilul are nevoie să simtă că emoția lui încape și că adultul rămâne organizat.",
          "Raising Children recomandă reasigurarea simplă: timpul cu celălalt părinte este important, iar tu vei fi tot aici când se întoarce sau îl vei lua la o oră clară. HealthyChildren subliniază și ea că adaptarea copilului merge mai bine când ambii părinți rămân stabili, predictibili și evită să-l pună în mijlocul conflictului.",
        ],
        bullets: [
          "Vorbește scurt și calm: știu că îți este greu acum.",
          "Spune ce rămâne stabil: mergi la tata/mama, iar eu te iau vineri după școală.",
          "Nu cere explicații lungi în vârful emoției și nu transforma momentul într-un interviu.",
          "Nu critica celălalt părinte și nu lăsa copilul să simtă că trebuie să aleagă între voi.",
        ],
      },
      {
        title: "După ce copilul se liniștește, caută modelul, nu doar episodul",
        paragraphs: [
          "Conversația utilă vine mai târziu, când copilul este din nou disponibil. Atunci poți întreba blând ce a fost cel mai greu: despărțirea, drumul, faptul că schimbul se face în grabă, somnul, bagajul, teama că uită ceva sau o tensiune concretă.",
          "Merită să urmărești dacă refuzul apare mereu în același punct. Uneori problema nu este casa în sine, ci felul în care se face tranziția: schimb prea târziu, copil obosit, discuții între adulți, lipsa obiectului de confort sau prea multe necunoscute la plecare.",
        ],
        bullets: [
          "Notează când apare refuzul: înainte de plecare, pe drum sau la despărțire.",
          "Verifică dacă există factori constanți: foame, oboseală, schimbarea rutinei, teme, bagaj.",
          "Întreabă copilul ce l-ar ajuta data viitoare să fie puțin mai ușor.",
          "Discutați adult la adult despre schimbări logistice, nu prin copil.",
        ],
      },
      {
        title: "Ajustări mici care pot schimba mult",
        paragraphs: [
          "Raising Children propune câteva ajustări foarte practice: schimburi politicoase și previzibile, uneori la școală sau la grădiniță în loc de ușa casei, obiecte esențiale în ambele locuri și un ritual de sosire care îl ajută pe copil să se așeze.",
          "În multe familii, nu ai nevoie de o revoluție în program, ci de o tranziție mai puțin încărcată. Un copil care știe unde doarme, ce ia cu el și cum arată primele 15 minute după sosire rezistă mai bine schimbului.",
        ],
        bullets: [
          "Păstrați aceleași mesaje și aceeași ordine a pașilor înainte de plecare.",
          "Țineți la ambele case lucrurile de bază, ca să nu pară că își mută toată viața de fiecare dată.",
          "Evitați negocierile sau tensiunea dintre adulți în fața copilului.",
          "Faceți un mini-ritual de sosire: gustare, baie, poveste, joacă liniștită sau timp de stat aproape.",
        ],
      },
      {
        title: "Când refuzul cere mai mult decât o ajustare de rutină",
        paragraphs: [
          "Dacă refuzul devine persistent, apare împreună cu anxietate intensă, regres evident, probleme de somn, dureri repetate fără explicație medicală, retragere, panică sau relatări îngrijorătoare despre siguranță, nu mai vorbim doar despre o tranziție grea. Merită discutat cu pediatrul sau cu un psiholog de copii, iar dacă există orice semn de abuz sau teamă reală, prioritatea este siguranța, nu menținerea aparenței că totul este un simplu disconfort.",
        ],
      },
    ],
    takeaways: [
      "Nu vreau să merg nu este automat un verdict despre relația cu celălalt părinte.",
      "În vârful emoției, copilul are nevoie de reasigurare și predictibilitate, nu de anchetă.",
      "Dacă refuzul se repetă, caută tiparul și ajustează logistica tranziției înainte să tragi concluzii mari.",
    ],
    en: {
      title: "When your child says they don't want to go to the other home",
      summary: "Refusing a transition doesn't call for a quick verdict about either parent — it calls for calm, reassurance and a careful look at how the handover is done.",
      intro: "Few moments weigh on a parent as heavily as the line \"I don't want to go to mum\" or \"I don't want to go to dad\". It's easy to hear it as confirmation that something is deeply wrong at the other home, or as proof that you need to insist immediately. But in many situations the child is not expressing a mature verdict about the relationship — they are expressing the genuine difficulty of separation, a change of rhythm or the way the handover itself is handled. That calls for regulation and clarification first, not interrogation.",
      sections: [
        { title: "Why refusal appears without automatically meaning one parent is the problem", paragraphs: ["Raising Children Network explains clearly that some children have real difficulties moving between homes, and that the desire to stay in one place or go back quickly can appear simply because separation is hard — especially for young children or in periods when the routine hasn't settled yet.", "In other words, the sentence I don't want to go may describe the discomfort of the transition, tiredness, anticipation of a goodbye or fear of the unknown next hour. If the adult treats it immediately as deliberate intent against the other parent, the child becomes even more caught between loyalties."] },
        { title: "What to do in that moment", paragraphs: ["The first goal is not to win the dispute but to reduce the intensity. The child needs to feel that their emotion fits and that the adult stays organised.", "Raising Children recommends simple reassurance: time with the other parent matters, and you will still be here when they return or will pick them up at a clear time. HealthyChildren also notes that adjustment goes better when both parents stay stable, predictable and avoid placing the child in the middle of conflict."], bullets: ["Speak briefly and calmly: I know this is hard right now.", "State what stays stable: you're going to dad/mum, and I'll pick you up Friday after school.", "Don't demand long explanations at the peak of emotion and don't turn the moment into an interview.", "Don't criticise the other parent and don't let the child feel they have to choose between you."] },
        { title: "Once the child settles, look for the pattern, not just the episode", paragraphs: ["The useful conversation comes later, when the child is available again. Then you can gently ask what was hardest: the goodbye, the journey, the fact that the handover is done in a rush, sleep, the bag, worrying about forgetting something or a specific tension.", "It's worth noting if refusal always appears at the same point. Sometimes the problem isn't the home itself but how the transition is made: handover too late, tired child, adult arguments, missing comfort object or too many unknowns at departure."], bullets: ["Note when the refusal appears: before leaving, on the way or at the goodbye.", "Check for constant factors: hunger, tiredness, a routine change, homework, the bag.", "Ask the child what might make it a little easier next time.", "Discuss logistics adult to adult, not through the child."] },
        { title: "Small adjustments that can change a lot", paragraphs: ["Raising Children suggests some very practical adjustments: courteous and predictable exchanges, sometimes at school or nursery rather than the home door, essentials in both places and an arrival ritual that helps the child settle.", "In many families, you don't need a programme revolution, just a less burdened transition. A child who knows where they'll sleep, what they're taking and how the first 15 minutes after arrival look handles the switch much better."], bullets: ["Keep the same messages and the same sequence of steps before leaving.", "Keep basics in both homes so it doesn't feel like they're moving their whole life each time.", "Avoid negotiations or adult tension in front of the child.", "Create a mini arrival ritual: a snack, a bath, a story, quiet play or time to sit close."] },
        { title: "When refusal calls for more than a routine adjustment", paragraphs: ["If refusal becomes persistent, appears alongside intense anxiety, clear regression, sleep problems, repeated unexplained physical complaints, withdrawal, panic or worrying accounts about safety, we're no longer talking about a hard transition. It's worth speaking with the paediatrician or a child psychologist, and if there is any sign of abuse or genuine fear, safety takes priority over maintaining appearances that everything is just mild discomfort."] },
      ],
      takeaways: ["I don't want to go is not automatically a verdict about the relationship with the other parent.", "At the peak of emotion, the child needs reassurance and predictability, not an investigation.", "If refusal repeats, look for the pattern and adjust the transition logistics before drawing big conclusions."],
    },
    sources: [
      {
        title: "Separation, divorce, children in two homes",
        publisher: "Raising Children Network",
        url: "https://raisingchildren.net.au/grown-ups/family-diversity/parenting-after-separation-divorce/helping-children-adjust-two-homes",
        note: "Sursă centrală pentru dificultățile de a merge între case, reasigurarea copilului, schimburile făcute la școală sau grădiniță și semnele că tranziția îl depășește.",
      },
      {
        title: "How to Support Children after Their Parents Separate or Divorce",
        publisher: "HealthyChildren.org / American Academy of Pediatrics",
        url: "https://www.healthychildren.org/English/healthy-living/emotional-wellness/Building-Resilience/Pages/How-to-Support-Children-after-Parents-Separate-or-Divorce.aspx",
        note: "Completează cu repere AAP despre importanța relației cu ambii părinți, reducerea conflictului și menținerea unui cadru stabil pentru copil.",
      },
    ],
  },
  {
    slug: "ritualul-de-ramas-bun-care-scade-agatarea-la-despartire",
    enSlug: "the-goodbye-ritual-that-reduces-clinging",
    title: "Ritualul de rămas-bun care scade agățarea la despărțire",
    summary:
      "Când despărțirea se lungește, anxietatea crește; un rămas-bun scurt, previzibil și cald îl ajută pe copil să traverseze mai ușor momentul.",
    intro:
      "Pentru copiii mici, despărțirea de un părinte sau de adultul de referință nu este doar o mutare de program. Este un moment în care corpul întreabă foarte serios: pleci și te mai întorci? De aceea, mulți adulți tind fie să dispară repede pe furiș, fie să prelungească plecarea cu multe promisiuni, explicații și reveniri la ușă. Ambele pot crește neliniștea. De obicei ajută mai mult un ritual simplu, repetat și foarte previzibil.",
    image: {
      src: "/blog/goodbye-ritual-transition.svg",
      alt: "Despărțire calmă între părinte și copil, cu un ritual scurt de rămas-bun",
    },
    categorySlug: "rutine-si-tranzitii",
    publishedAt: "2026-04-10",
    readingTimeMinutes: 5,
    sections: [
      {
        title: "De ce lungirea despărțirii înrăutățește momentul",
        paragraphs: [
          "UNICEF explică faptul că, pentru un copil mic, anxietatea de separare este firească și apare tocmai pentru că încă învață că plecările sunt temporare. Dacă adultul revine de mai multe ori, negociază la nesfârșit sau transmite neliniște prin corp și voce, copilul primește semnalul că situația chiar ar putea fi periculoasă.",
          "Asta nu înseamnă că trebuie să fii rece. Înseamnă că prezența caldă funcționează mai bine când este scurtă, clară și repetată la fel. Predictibilitatea este cea care liniștește, nu durata.",
        ],
      },
      {
        title: "Cum arată un ritual bun de rămas-bun",
        paragraphs: [
          "UNICEF recomandă să vorbești despre reunire, să exersezi separări scurte și să lași copilului un obiect de confort când asta îl ajută. Toate acestea se pot aduna într-un ritual foarte simplu de 20-40 de secunde.",
          "Ideea nu este să inventezi un moment spectaculos, ci unul pe care copilul îl poate recunoaște de fiecare dată. Când știe pașii, are mai puțin de ghicit și corpul lui intră mai ușor în tranziție.",
        ],
        bullets: [
          "Spune pe scurt ce urmează: plec acum, după somn/după program revin și facem X împreună.",
          "Păstrează același gest de fiecare dată: îmbrățișare, pupic, salut la fereastră, o propoziție-cheie.",
          "Lasă, dacă ajută, un obiect de confort recognoscibil: pluș, batistă, poză mică.",
          "Încheie clar și pleacă; nu reveni de trei ori la ușă pentru încă o reasigurare.",
        ],
      },
      {
        title: "Ce facem înainte de despărțire",
        paragraphs: [
          "Pentru unii copii, dificultatea scade mult dacă separarea nu apare din senin. UNICEF recomandă separări scurte exersate treptat și introducerea graduală a îngrijitorului nou. În familiile cu două case sau cu program complex, aceeași logică ajută și la handover-uri, grădiniță sau babysitter.",
          "Poți pregăti momentul și printr-o ancoră de timp pe care copilul o înțelege: după gustare, după poveste, când se termină jocul acesta. Un copil mic nu are nevoie de explicație lungă, ci de o hartă simplă.",
        ],
      },
      {
        title: "Cum răspunzi dacă începe să plângă sau să se agațe",
        paragraphs: [
          "Validarea scurtă ajută mai mult decât prelungirea. Poți spune: știu că e greu să ne despărțim acum, te văd, iar eu mă întorc după somn. Apoi îi transferi calm atenția către adultul care rămâne sau către primul pas al rutinei.",
          "Dacă te întorci din ușă pentru a stinge complet plânsul, copilul poate învăța fără să vrei că intensificarea reacției prelungește și prezența ta. Mai eficient este un rămas-bun cald și consecvent, repetat la fel.",
        ],
      },
    ],
    takeaways: [
      "Despărțirea merge mai ușor când are aceiași pași de fiecare dată.",
      "Promisiunea clară despre reunire calmează mai bine decât explicațiile lungi.",
      "Un rămas-bun cald și scurt ajută mai mult decât intrările și ieșirile repetate.",
    ],
    en: {
      title: "The goodbye ritual that reduces clinging at separation",
      summary: "When a goodbye drags on, anxiety increases; a short, predictable and warm farewell helps the child navigate the moment more easily.",
      intro: "For young children, separating from a parent or a key adult is not just a schedule change. It is a moment when their body asks very seriously: are you leaving and will you come back? That is why many adults tend either to slip away quickly on the sly, or to prolong the departure with many promises, explanations and door returns. Both can increase unease. What usually helps more is a simple, repeated and highly predictable ritual.",
      sections: [
        { title: "Why prolonging the goodbye makes the moment worse", paragraphs: ["UNICEF explains that for a young child, separation anxiety is natural and arises precisely because they are still learning that departures are temporary. If the adult returns multiple times, negotiates endlessly or transmits unease through body and voice, the child receives the signal that the situation really might be dangerous.", "This doesn't mean being cold. It means warm presence works better when it is short, clear and repeated the same way each time. Predictability is what soothes, not duration."] },
        { title: "What a good goodbye ritual looks like", paragraphs: ["UNICEF recommends talking about the reunion, practising short separations and leaving a comfort object when that helps. All of this can be gathered into a very simple 20–40-second ritual.", "The idea is not to invent a spectacular moment, but one the child can recognise every time. When they know the steps, they have less to guess and their body enters the transition more easily."], bullets: ["Say briefly what comes next: I'm leaving now, after your nap/after school I'm back and we'll do X together.", "Keep the same gesture every time: a hug, a kiss, a wave at the window, a key phrase.", "Leave a recognisable comfort object if it helps: a soft toy, a handkerchief, a small photo.", "End clearly and leave; don't come back to the door three times for one more reassurance."] },
        { title: "What to do before the goodbye", paragraphs: ["For some children the difficulty drops significantly if the separation doesn't arrive out of nowhere. UNICEF recommends gradually practised short separations and gradual introduction of a new carer. In two-home families or with a complex schedule, the same logic helps at handovers, nursery or with a babysitter.", "You can also prepare the moment with a time anchor the child understands: after the snack, after the story, when this game is finished. A young child doesn't need a long explanation — they need a simple map."] },
        { title: "How to respond if they start crying or clinging", paragraphs: ["Short validation helps more than prolonging the goodbye. You can say: I know it's hard to say goodbye right now, I see you, and I'll be back after your nap. Then calmly transfer their attention toward the adult who stays or toward the first step of the routine.", "If you come back through the door to fully extinguish the crying, the child may learn unintentionally that intensifying the reaction extends your presence too. A warm, consistent goodbye, repeated the same way, is more effective."] },
      ],
      takeaways: ["Goodbyes go more smoothly when they have the same steps every time.", "A clear promise about the reunion calms more than long explanations.", "A warm, short farewell helps more than repeated coming and going at the door."],
    },
    sources: [
      {
        title: "How to manage your child’s separation anxiety",
        publisher: "UNICEF Parenting",
        url: "https://www.unicef.org/parenting/child-care/managing-child-separation-anxiety",
        note: "UNICEF recomandă separări scurte exersate treptat, obiecte de confort, răspuns cu compasiune și rămas-bun rapid și pozitiv. Pagina a fost accesată pentru această cercetare la 10 aprilie 2026.",
      },
    ],
  },
  {
    slug: "cum-prezinti-copilului-un-nou-partener-dupa-separare",
    enSlug: "how-to-introduce-a-new-partner-to-your-child",
    title: "Cum îi prezinți copilului un nou partener după separare",
    summary:
      "Copilul are nevoie de timp, claritate și lipsă de presiune când apare un nou partener în viața unuia dintre părinți.",
    intro:
      "Pentru un adult, o relație nouă poate însemna speranță și stabilizare. Pentru copil, aceeași veste poate veni la pachet cu gelozie, teamă că pierde timp cu părintele sau cu reactivarea fanteziei că mama și tata s-ar putea împăca. De aceea, graba strică mult mai des decât ajută. O introducere bună nu începe cu prezentarea în sine, ci cu întrebarea dacă viața copilului este deja suficient de așezată încât să ducă încă o schimbare.",
    image: {
      src: "/blog/new-partner-introduction.svg",
      alt: "Părinte și copil discutând calm înainte de a cunoaște un nou partener",
    },
    categorySlug: "coparenting",
    publishedAt: "2026-04-07",
    readingTimeMinutes: 6,
    sections: [
      {
        title: "De ce vestea poate fi mai grea pentru copil decât pare",
        paragraphs: [
          "HealthyChildren explică faptul că, pentru mulți copii de vârstă școlară, apariția unui nou partener nu este doar o informație despre viața adultului, ci și un semn că împăcarea părinților nu mai este probabilă. Asta poate aduce tristețe, gelozie sau retragere, chiar dacă noua relație este sănătoasă.",
          "În plus, copilul poate simți că trebuie să împartă și mai mult din timpul deja redus cu părintele la care nu stă permanent. Dacă adultul interpretează repede reacția ca obraznicie sau lipsă de maturitate, ratează exact partea importantă: copilul încearcă să înțeleagă unde mai încape el în noua configurație.",
        ],
      },
      {
        title: "Când nu e momentul potrivit pentru prezentare",
        paragraphs: [
          "Nu orice relație nouă trebuie adusă repede în viața copilului. HealthyChildren recomandă să nu prezinți copilului fiecare persoană cu care te întâlnești, ci doar un partener care a devenit suficient de important și stabil încât să merite acest pas.",
          "Dacă separarea este încă foarte proaspătă, programul dintre case abia se așază sau copilul trece deja prin tranziții grele, încă o noutate poate crește încărcarea în loc să o reducă.",
        ],
        bullets: [
          "Amână prezentarea dacă relația este încă incertă sau foarte recentă.",
          "Nu folosi timpul cu copilul ca spațiu principal pentru viața de dating.",
          "Nu transforma noutatea într-un secret pe care copilul trebuie să îl țină față de celălalt părinte.",
          "Nu grăbi lucrurile doar pentru că adultul se simte pregătit; copilul poate avea alt ritm.",
        ],
      },
      {
        title: "Cum pregătești prima întâlnire",
        paragraphs: [
          "HealthyChildren sugerează o pregătire simplă și onestă: îi spui copilului cine este persoana, de ce contează pentru tine și îl lași să-și exprime reacția. Nu ai nevoie de discurs solemn. Ai nevoie de claritate și de spațiu pentru emoțiile lui.",
          "Prima întâlnire merge mai bine când are miză mică. Scopul nu este să se placă imediat, ci doar să facă cunoștință fără presiune.",
        ],
        bullets: [
          "Anunță din timp, nu pe fugă, cine vine și în ce context.",
          "Propune o întâlnire scurtă și neutră: o ieșire la masă, o plimbare, o cafea cu desert.",
          "Întreabă copilul ce l-ar face să se simtă mai în largul lui la prima întâlnire.",
          "Pregătește și partenerul: fără glume insistente, fără apropiere forțată, fără rol parental din prima zi.",
        ],
      },
      {
        title: "Ce e important după întâlnire",
        paragraphs: [
          "Dacă prima întâlnire a fost rece sau stângace, asta nu înseamnă că ai o problemă mare. HealthyChildren insistă că relația dintre copil și noul partener se construiește lent. Presiunea de a-i vedea imediat apropiați poate înrăutăți exact lucrurile pe care vrei să le repari.",
          "Mai util este să revii cu o conversație simplă: cum a fost pentru tine, ce ți-a plăcut, ce ți-a fost greu. Apoi păstrezi timp separat doar pentru copil, astfel încât să nu simtă că noua relație îi consumă locul.",
        ],
      },
      {
        title: "Semne că merită încetinit sau cerut sprijin",
        paragraphs: [
          "Merită să reduci ritmul dacă apar gelozie intensă, anxietate, izbucniri repetate înainte de vizite, refuz constant de a merge în casa unde este prezent noul partener sau dacă adultul începe să ceară copilului validare pentru relația lui. Dacă tensiunea persistă, poate ajuta un psiholog de copii sau un specialist în familie care înțelege dinamica post-separare.",
        ],
      },
    ],
    takeaways: [
      "Nu copilul trebuie să țină pasul cu relația adultului; adultul adaptează ritmul.",
      "Prima întâlnire ar trebui să fie scurtă, clară și fără presiune de apropiere.",
      "Păstrarea timpului unu-la-unu cu copilul reduce gelozia și nesiguranța.",
    ],
    en: {
      title: "How to introduce a new partner to your child after separation",
      summary: "The child needs time, clarity and freedom from pressure when a new partner appears in one parent's life.",
      intro: "For an adult, a new relationship can mean hope and stabilisation. For the child, the same news can come packaged with jealousy, fear of losing time with the parent, or the reactivation of the fantasy that mum and dad might reconcile. That's why rushing usually does more harm than good. A good introduction doesn't start with the introduction itself — it starts with the question of whether the child's life is already settled enough to absorb one more change.",
      sections: [
        { title: "Why the news can be harder for the child than it appears", paragraphs: ["HealthyChildren explains that for many school-age children, the arrival of a new partner is not just information about the adult's life — it is also a sign that reconciliation between the parents is no longer likely. This can bring sadness, jealousy or withdrawal, even when the new relationship is healthy.", "Additionally, the child may feel they must share even more of the already-reduced time with the parent they don't live with permanently. If the adult quickly interprets the reaction as rudeness or immaturity, they miss exactly the important part: the child is trying to understand where they fit in the new configuration."] },
        { title: "When the timing is not right for an introduction", paragraphs: ["Not every new relationship needs to enter the child's life quickly. HealthyChildren recommends not introducing the child to every person you date, but only a partner who has become important and stable enough to warrant the step.", "If the separation is still very recent, the two-home schedule is barely settling or the child is already going through difficult transitions, one more novelty may increase the load rather than reduce it."], bullets: ["Delay the introduction if the relationship is still uncertain or very new.", "Don't use time with the child as the main space for your dating life.", "Don't turn the news into a secret the child must keep from the other parent.", "Don't rush things just because the adult feels ready; the child may have a different rhythm."] },
        { title: "How to prepare the first meeting", paragraphs: ["HealthyChildren suggests simple and honest preparation: you tell the child who the person is, why they matter to you and let them express their reaction. You don't need a solemn speech. You need clarity and space for their emotions.", "The first meeting goes better when the stakes are low. The goal is not for them to like each other immediately, but simply to meet without pressure."], bullets: ["Announce in advance, not on the fly, who is coming and in what context.", "Suggest a short and neutral meeting: a meal out, a walk, a coffee with dessert.", "Ask the child what would make them feel more comfortable at the first meeting.", "Brief the partner too: no insistent jokes, no forced closeness, no parental role from day one."] },
        { title: "What matters after the meeting", paragraphs: ["If the first meeting was cool or awkward, that doesn't mean you have a big problem. HealthyChildren insists that the relationship between the child and the new partner is built slowly. Pressure to see them close immediately can worsen exactly the things you want to repair.", "More useful is returning with a simple conversation: how was it for you, what did you like, what was hard. Then keeping separate one-on-one time with the child, so they don't feel the new relationship is consuming their place."] },
        { title: "Signs it's worth slowing down or seeking support", paragraphs: ["It's worth reducing the pace if intense jealousy, anxiety, repeated outbursts before visits, consistent refusal to go to the home where the new partner is present appear, or if the adult begins asking the child for validation about their relationship. If tension persists, a child psychologist or family specialist who understands post-separation dynamics may help."] },
      ],
      takeaways: ["It's not the child who must keep pace with the adult's relationship; the adult adapts the rhythm.", "The first meeting should be short, clear and free of pressure to bond.", "Keeping one-on-one time with the child reduces jealousy and insecurity."],
    },
    sources: [
      {
        title: "Dating After Divorce",
        publisher: "HealthyChildren.org / American Academy of Pediatrics",
        url: "https://www.healthychildren.org/English/family-life/family-dynamics/types-of-families/Pages/dating-after-divorce.aspx",
        note: "Sursă AAP actualizată la 16 decembrie 2025, cu recomandări concrete despre momentul potrivit, prima întâlnire, gelozia copilului și evitarea secretelor sau a apropierii forțate.",
      },
      {
        title: "What Your Child is Experiencing When You Remarry",
        publisher: "HealthyChildren.org / American Academy of Pediatrics",
        url: "https://www.healthychildren.org/English/family-life/family-dynamics/types-of-families/Pages/What-Your-Child-is-Experiencing-When-You-Remarry.aspx?form=HealthyChildren",
        note: "Completează perspectiva despre loialitate, pierdere și ritmul lent în care se construiește relația cu un stepparent.",
      },
    ],
  },
  {
    slug: "copilul-explodeaza-dupa-schimbarea-de-casa",
    enSlug: "when-your-child-explodes-after-a-home-change",
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
    en: {
      title: "When your child explodes after a home change",
      summary:
        "Irritability, crying or opposition after a handover don't call for correction first — they call for an adult who slows down and co-regulates.",
      intro:
        "Some parents get scared or frustrated when the child arrives from the other home and seems suddenly difficult: snapping back, crying at nothing, refusing simple rules or picking fights. The natural reaction is to correct the behaviour immediately. But most of the time you're not seeing disrespect — you're seeing a nervous system already overloaded by change. In those moments, the child needs co-regulation first, then boundaries and conversation.",
      sections: [
        {
          title: "Why the release happens right after arrival",
          paragraphs: [
            "Switching homes can demand a lot of internal adaptation even when the schedule is good and the relationship with both parents matters. The child has shifted rhythm, rules, stimulation, and possibly how they held themselves together all day. When they reach a safe place, the stored tension can surface.",
            "Child Mind Institute explains that emotional regulation is learned gradually and that, during moments of overload, the child borrows from the calm of the nearby adult. In other words, the parent's reaction is not the backdrop of the scene — it's one of the pieces that moves the situation toward escalation or toward settling.",
          ],
        },
        {
          title: "What to do in the first few minutes",
          paragraphs: [
            "Before you correct their tone or ask for explanations, check your own body. If you also go into alert mode, the child receives yet another danger signal. The first step is to slow down.",
            "You don't need a long speech. A calm presence, few words and a simple invitation toward regulation helps more.",
          ],
          bullets: [
            "Physically lower yourself to the child's level instead of talking down from standing.",
            "Name what you see without judgment: you seem very tense or I sense you've had a lot today.",
            "Speak more slowly and quietly than feels natural in that moment.",
            "Offer a short bridge: water, a shower, changing clothes, sitting close on the sofa, a few breaths together.",
          ],
        },
        {
          title: "Co-regulation does not mean no limits",
          paragraphs: [
            "Validating emotion doesn't mean any behaviour becomes acceptable. You can convey two things at once: I'm helping you calm down and I'm not letting you hit, insult or break things.",
            "Order matters. When the child is strongly activated, long explanations and moral lessons don't land. First reduce the intensity, then return to the limit and repair: what do we do now, how do we fix it, what can we try next time.",
          ],
        },
        {
          title: "Signs you jumped too quickly to correction",
          paragraphs: [
            "If you notice the volume rises after you ask a lot of questions, demand immediate gratitude or compare to the other home, the child probably wasn't yet available for conversation. Sometimes a parent misreads the discharge as a deliberate choice to provoke.",
            "A useful reference point: if after 10–20 minutes of calm, routine and contact the reaction subsides, you most likely had a regulation problem in front of you — not one that gets resolved through pressure.",
          ],
        },
        {
          title: "When it's worth seeking extra help",
          paragraphs: [
            "If after nearly every home change there are very intense outbursts, disrupted sleep, persistent fear, self-blame, strong refusal of transitions or clear regression, it's worth talking to a child psychologist or paediatrician. The goal isn't to find who's to blame, but to understand sooner where the overload comes from and what concrete support actually helps the child.",
          ],
        },
      ],
      takeaways: [
        "After a handover, difficult behaviour may be a stress discharge, not a calculated provocation.",
        "First regulate the rhythm and the relationship, then correct the behaviour.",
        "You can validate the emotion and hold the limit at the same time.",
      ],
    },
  },
  {
    slug: "tranzitii-intre-doua-case-mai-putin-stres",
    enSlug: "transitions-between-two-homes-less-stress",
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
    en: {
      title: "How to make transitions between two homes less stressful for the child",
      summary: "Frequent moves don't become easier through rushing, but through predictability, clear signals and a reconnection ritual after the handover.",
      intro: "For many children, moving between two homes doesn't just mean changing a location — it means changing rhythm, rules and how they feel in their body. When adults treat the handover as a simple logistical transfer, the child is left to process the whole change alone. When there is structure and a gentle landing, the tension drops visibly.",
      sections: [
        { title: "Why transitions consume so much energy", paragraphs: ["Children react intensely to transitions because they are asked to stop something familiar and quickly enter a different context. Child Mind Institute explains exactly this mechanism: moving from one activity or place to another requires emotional regulation and cognitive flexibility, and these are still developing.", "In two-home families the change is not just of activity but of the whole environment. Raising Children Network observes that some children become agitated, cry more easily, refuse to cooperate or have problems with sleep and appetite precisely because the transition activates stress, even when both parents are important and safe for them."] },
        { title: "What deserves to be prepared before the handover", paragraphs: ["The child needs predictability more than speeches. A stable schedule, the same type of message before departure and the same sequence of steps reduce surprise and lower resistance.", "If the same small routine always appears before leaving, the child learns they know what comes next and their body enters the transition more easily."], bullets: ["Announce the change in advance and repeat it simply: today you go to dad/mum after school.", "Use the same short checklist before leaving: bag, clothes, medication, comfort object.", "Keep duplicates of important sleep or regulation items where possible: book, soft toy, music.", "Avoid tense discussions or negotiating the schedule in front of the child, even if the logistics change."] },
        { title: "The first 30 minutes after arrival matter more than questions", paragraphs: ["Raising Children recommends a settling period before the avalanche of questions. Some children need to read, play quietly or do something physical before they're ready to talk.", "HealthyChildren shows that lack of cooperation between homes and big routine differences often show up in sleep and behaviour. A small reconnection ritual reduces exactly this shock: a snack, a bath, 10 minutes of play or a short walk, then conversation."], bullets: ["Don't immediately ask what happened at the other parent's.", "Offer something recognisable: a snack, a shower, pyjamas, free play, a story.", "Name the state without pressure: you seem tired, I see you, we can sit quietly for a bit.", "Let important logistical information circulate adult to adult, not through the child."] },
        { title: "When we're no longer just talking about a hard transition", paragraphs: ["If you see weeks of disrupted sleep, repeated refusal of transitions, intense outbursts, declining activities or school difficulties, a conversation with the paediatrician or a child psychologist is warranted. The goal is not to label the child but to reduce the stress before it becomes chronic."] },
      ],
      takeaways: ["Predictability reduces stress more than long explanations.", "The child needs a landing after the handover, not an interrogation.", "Persistent signs in sleep, school or mood are worth tracking early."],
    },
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
    enSlug: "how-to-talk-to-your-child-about-separation",
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
    en: {
      title: "How to talk to your child about separation and schedule changes",
      summary: "Simple, repeated messages free of conflict details give the child a safety framework when the family changes.",
      intro: "Children don't need the full version of the adult conflict. They need to hear, multiple times and in words appropriate for their age, that they are safe, loved and that the hard decisions stay with the adults. A good conversation doesn't resolve everything in a single evening, but it lays the foundation for trust.",
      sections: [
        { title: "The core message needs to be short and very clear", paragraphs: ["HealthyChildren recommends a simple message: this is an adult decision, it is not the child's fault, and the parents' love doesn't disappear. When explanations become chaotic or too detailed, the child begins to believe they need to understand, repair or take someone's side.", "The child needs the same backbone of the message even if you don't yet have all the logistical details. Emotional safety comes first from tone and coherence, then from plans."] },
        { title: "The important questions are often unspoken", paragraphs: ["Many children don't ask directly whether it's their fault, whether they'll move, whether they'll still see both parents or whether the family has enough money. HealthyChildren highlights that precisely these silent fears need to be addressed explicitly.", "You can answer before the question arises: you haven't done anything wrong, you don't have to fix the situation, both parents remain your parents, and we'll tell you in advance what changes in your schedule."] },
        { title: "The right tone is calm, repeatable and age-appropriate", paragraphs: ["CDC reminds us that the sense of safety is built through active listening, attention and simple language. You don't need a perfect speech. You need not to get defensive, not to slide into justifications and to leave room for the child's reaction.", "A young child needs concrete sentences and repetition. A teenager needs respect, more context and space for contradictory emotions. In both cases, the child shouldn't carry the couple's conflict story."], bullets: ["Tell the truth at the level of their age, without intimate details or accusations.", "Leave pauses and ask: what did you understand? what worries you most?", "Return to the conversation after a few days; don't treat the first talk as a one-off event.", "If you don't yet know a logistical detail, say so directly and promise when you'll have the information."] },
        { title: "What to avoid", paragraphs: ["Don't turn the child into a confidant and don't ask them to validate who was wrong. Don't promise things you can't control and don't minimise the emotion with phrases like there's no reason to be sad. Validation and clarity work better than forced optimism."] },
      ],
      takeaways: ["The child needs to hear explicitly that it is not their fault.", "Conflict details don't help them — they burden them.", "A good conversation is one you return to multiple times."],
    },
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
    enSlug: "the-child-is-not-a-messenger-coparenting-rules",
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
    en: {
      title: "The child is not a messenger: 5 basic rules for co-parenting",
      summary:
        "When the child carries messages, tension or information between adults, they end up in the middle of the conflict even if nobody says so directly.",
      intro:
        "One of the most common co-parenting mistakes happens when adult logistics and frustration flow through the child. In the short term it seems convenient. In the long term, the child stays trapped between loyalties, feeling they must manage the emotional state of each parent. Good co-parenting starts exactly here: the child does not become the interface.",
      sections: [
        {
          title: "Why the messenger role weighs so heavily",
          paragraphs: [
            "HealthyChildren stresses that separation goes better for children when they are not placed in the middle of adult resentments. When the child has to relay schedule changes, money matters, reproaches or sensitive information, they are no longer just a child — they become a carrier of tension.",
            "This affects the sense of safety in the relationship with both parents. The child begins to filter what they say, to hide, to appease, to guess reactions. Even seemingly innocent questions about the other parent can place them in an impossible loyalty bind.",
          ],
        },
        {
          title: "The 5 rules that reduce friction significantly",
          paragraphs: [
            "No system is perfect, but a few simple rules can radically change the child's emotional climate. They don't require love between former partners — just minimum relational discipline.",
          ],
          bullets: [
            "All important logistics go adult to adult, in writing when needed.",
            "Don't ask the child for reports about the other parent's home.",
            "Don't speak disparagingly about the other parent in the child's presence.",
            "Don't use the child as emotional support for your own pain.",
            "Messages about rules, health, school and schedule are clear and factual, without sarcasm.",
          ],
        },
        {
          title: "What to do when adult communication is already damaged",
          paragraphs: [
            "In many families, verbal contact increases conflict. Then a very short, predictable, child-focused communication helps: what changed, until when, what the other parent needs to know. That's it.",
            "You can use the same mini-format every time: context, need, proposal, response deadline. When the format stays constant, the temptation to revisit the history of the relationship decreases.",
          ],
        },
        {
          title: "The important exception: safety",
          paragraphs: [
            "If there is violence, abuse, intimidation or real fear, the problem is no longer just the communication style. In such situations, involving the legal framework or the right professional immediately is warranted, and the usual co-parenting rules need to be adapted around safety.",
          ],
        },
      ],
      takeaways: [
        "The adult's logistical convenience does not justify the pressure placed on the child.",
        "Adult to adult for information; child to child for their own life.",
        "A short, repeatable format reduces conflict better than long discussions.",
      ],
    },
  },
  {
    slug: "rutine-paralele-care-reduc-stresul-in-doua-case",
    enSlug: "parallel-routines-that-reduce-stress-in-two-homes",
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
    en: {
      title: "Parallel routines that reduce stress in two homes",
      summary: "The homes don't have to be identical, but the child gains enormously when the pillars of the day remain recognisable in both places.",
      intro: "Many parents fall into two extremes: either they want the exact same rules to the millimetre, or they believe the differences between homes don't matter at all. In practice, the child needs something in between: enough coherence to know what a safe day looks like, but enough flexibility for each home to remain a real home, not a copy.",
      sections: [
        { title: "What deserves to be roughly the same", paragraphs: ["HealthyChildren and CDC converge on the same idea: children regulate better when there is consistency, predictability and follow-through. In two homes, this doesn't mean the same curtains or the same menu — it means the same daily pillars."], bullets: ["The approximate bedtime and the evening sequence.", "The basic rule for screens on school days.", "The place and rhythm for homework.", "Medication, allergies and required items.", "The way you announce a schedule change."] },
        { title: "What can be different without causing harm", paragraphs: ["The child can tolerate healthy differences: decor, meals, weekend rituals, how play happens or who reads the story. Not every difference is instability.", "The problem starts when differences hit exactly the regulation zones: sleep, food, screens, limits or the predictability of transitions. That's where conflicts, regressions and refusals tend to appear."] },
        { title: "How to set routines without entering mutual control", paragraphs: ["CDC recommends few clear rules and a consistent way of following them. In co-parenting, this can mean a shared sheet with 4–5 non-negotiable reference points and the rest left to each home's style.", "If you try to control everything at the other parent's, the conversation explodes. If you define a few pillars and respect them, the child gets exactly what they need: structure."] },
        { title: "A useful example of a shared minimum", paragraphs: ["You can have a single shared page: bedtime, medications, what the child does when arriving from one home to the other, how school information circulates and who announces schedule changes. That's it. It's not a perfect contract; it's a tool for reducing chaos."] },
      ],
      takeaways: ["The child doesn't need two identical homes, but two adults who protect a few essential pillars.", "Sleep, screens and transitions deserve to be aligned before other differences.", "Few shared rules, well respected, are more useful than a long document that nobody follows."],
    },
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
  {
    slug: "cum-pastrezi-legatura-cu-copilul-intre-vizite",
    enSlug: "how-to-stay-connected-with-your-child-between-visits",
    title: "Cum păstrezi legătura cu copilul între vizite fără să-l sufoci",
    summary:
      "Relația dintre vizite se ține mai bine prin contacte scurte, predictibile și calde decât prin apeluri lungi sau verificări insistente.",
    intro:
      "După separare, mulți părinți încearcă să recupereze distanța prin mai mult contact: multe mesaje, apeluri lungi sau întrebări dese despre ce face copilul. Intenția este bună, dar efectul nu este mereu cel dorit. Când contactul devine presiune, copilul simte că trebuie să performeze emoțional sau să liniștească adultul. O legătură bună între vizite arată mai degrabă ca o prezență caldă și previzibilă decât ca o monitorizare continuă.",
    image: {
      src: "/blog/connection-between-visits.svg",
      alt: "Părinte și copil conectați printr-un apel scurt și cald între vizite",
    },
    categorySlug: "activitati-si-conectare",
    publishedAt: "2026-04-09",
    readingTimeMinutes: 5,
    sections: [
      {
        title: "Ce susține copilul după separare",
        paragraphs: [
          "HealthyChildren arată că adaptarea copilului este mai bună când ambii părinți rămân implicați pozitiv, iar părintele nerezident păstrează o relație apropiată și de sprijin. Asta nu înseamnă contact permanent, ci continuitate reală: copilul știe că poate conta pe relație și în zilele în care nu este în aceeași casă cu tine.",
          "Pentru copil, predictibilitatea contează mai mult decât intensitatea. Un mesaj scurt la aceeași oră, un apel stabilit dinainte sau o fotografie cu ceva familiar pot susține siguranța fără să îi invadeze spațiul.",
        ],
      },
      {
        title: "Ce funcționează mai bine decât un apel lung",
        paragraphs: [
          "UNICEF amintește că și câteva momente pe zi îl pot face pe copil să se simtă foarte iubit, mai ales când adultul intră în interesul lui și nu transformă conversația într-un interviu. În practică, asta înseamnă contact scurt și ușor de dus, nu o obligație emoțională grea.",
          "Dacă un copil nu are chef să povestească mult, relația nu este în pericol. Uneori legătura se ține mai bine printr-un ritual mic și repetabil decât prin discuții lungi care îl obosesc.",
        ],
        bullets: [
          "Stabiliți un tip de contact simplu și recognoscibil: apel de 5 minute, mesaj vocal sau o fotografie pe ziua respectivă.",
          "Pornește de la lumea copilului: ce construiești, ce carte citești, ce melodie ți-a plăcut azi?",
          "Încheie înainte să devină obositor; copilul rămâne cu senzația de apropiere, nu de sarcină.",
          "Respectă dacă uneori răspunsul este scurt; continuitatea contează mai mult decât performanța conversației.",
        ],
      },
      {
        title: "Ce să eviți ca să nu pui presiune pe copil",
        paragraphs: [
          "Când adultul caută reasigurare, copilul simte repede asta. Întrebările în rafală despre cealaltă casă, cererile de tipul mi-e dor de tine, spune și tu sau supărarea pentru un apel ratat pot muta contactul din zona de conectare în zona de obligație.",
          "Legătura dintre vizite ar trebui să îi amintească copilului că relația este disponibilă, nu că trebuie să administreze emoțiile părintelui.",
        ],
        bullets: [
          "Nu folosi apelul ca să verifici ce face celălalt părinte.",
          "Nu cere copilului să demonstreze că îi este dor.",
          "Nu prelungi conversația când vezi că a obosit sau vrea să se întoarcă la joacă.",
          "Dacă ai ratat contactul stabilit, repară simplu și reia-l data viitoare fără dramă.",
        ],
      },
      {
        title: "Idei mici care țin relația vie",
        paragraphs: [
          "Ajută mult ritualurile care nu depind de dispoziția perfectă a nimănui: o poveste scurtă pe audio, o glumă recurentă, o fotografie cu ceva ce v-ar face pe amândoi să zâmbiți, un calendar cu zilele până la următoarea vizită. Când legătura capătă formă, copilul nu mai simte că totul depinde de un apel reușit sau de energia lui din acel moment.",
        ],
      },
    ],
    takeaways: [
      "Între vizite, contactul scurt și predictibil ajută mai mult decât apelurile lungi.",
      "Legătura bună pornește din interesul copilului, nu din nevoia adultului de reasigurare.",
      "Ritualurile mici și repetabile mențin apropierea fără presiune.",
    ],
    en: {
      title: "How to stay connected with your child between visits without smothering them",
      summary: "The bond between visits holds better through short, predictable and warm contacts than through long calls or insistent check-ins.",
      intro: "After separation, many parents try to make up for the distance through more contact: many messages, long calls or frequent questions about what the child is doing. The intention is good, but the effect isn't always as desired. When contact becomes pressure, the child feels they must perform emotionally or soothe the adult. A good bond between visits looks more like a warm, predictable presence than continuous monitoring.",
      sections: [
        { title: "What supports the child after separation", paragraphs: ["HealthyChildren shows that adjustment is better when both parents stay positively involved, and the non-resident parent keeps a close, supportive relationship. This doesn't mean constant contact, but real continuity: the child knows they can count on the relationship even on days they're not in the same home as you.", "For the child, predictability matters more than intensity. A short message at the same time, a pre-arranged call or a familiar photo can sustain safety without invading their space."] },
        { title: "What works better than a long call", paragraphs: ["UNICEF notes that even a few moments a day can make the child feel very loved, especially when the adult enters into the child's interests and doesn't turn the conversation into an interview. In practice, this means short and easy-to-bear contact, not a heavy emotional obligation.", "If a child doesn't feel like talking much, the relationship isn't in danger. Sometimes the bond holds better through a small, repeatable ritual than through long conversations that tire them."], bullets: ["Agree on a simple, recognisable type of contact: a 5-minute call, a voice message or a photo of the day.", "Start from the child's world: what are you building, what book are you reading, what song did you like today?", "Finish before it gets tiring; the child is left with a feeling of closeness, not of duty.", "Respect if the reply is sometimes short; continuity matters more than conversation performance."] },
        { title: "What to avoid so you don't put pressure on the child", paragraphs: ["When the adult is looking for reassurance, the child senses this quickly. Questions in rapid succession about the other home, requests like I miss you, say you miss me too or upset reactions to a missed call can shift contact from connection to obligation.", "The bond between visits should remind the child that the relationship is available — not that they need to manage the parent's emotions."], bullets: ["Don't use the call to check what the other parent is doing.", "Don't ask the child to demonstrate that they miss you.", "Don't prolong the conversation when you see they've tired or want to go back to play.", "If you missed the scheduled contact, repair simply and resume next time without drama."] },
        { title: "Small ideas that keep the relationship alive", paragraphs: ["What helps a great deal are rituals that don't depend on anyone's perfect mood: a short audio story, a recurring joke, a photo of something that would make both of you smile, a calendar counting down to the next visit. When the bond takes shape, the child no longer feels everything depends on one successful call or their energy in that moment."] },
      ],
      takeaways: ["Between visits, short and predictable contact helps more than long calls.", "A good bond starts from the child's interest, not from the adult's need for reassurance.", "Small, repeatable rituals maintain closeness without pressure."],
    },
    sources: [
      {
        title: "How to Support Children after Their Parents Separate or Divorce",
        publisher: "HealthyChildren.org / American Academy of Pediatrics",
        url: "https://www.healthychildren.org/English/healthy-living/emotional-wellness/Building-Resilience/Pages/How-to-Support-Children-after-Parents-Separate-or-Divorce.aspx",
        note: "AAP explică de ce copiii se adaptează mai bine când ambii părinți rămân implicați pozitiv, cu relații apropiate, reguli consecvente și conflict redus. Pagina indică ultima actualizare la 29 septembrie 2020.",
      },
      {
        title: "Let’s talk parenting",
        publisher: "UNICEF Parenting",
        url: "https://www.unicef.org/parenting/child-care/lets-talk-parenting",
        note: "Seria UNICEF subliniază că și câteva momente pe zi pot face copilul să se simtă foarte iubit și recomandă conectarea prin interesele lui, nu prin presiune sau corectare.",
      },
    ],
  },
  {
    slug: "somnul-in-doua-case-ce-ajuta-cu-adevarat",
    enSlug: "sleep-in-two-homes-what-actually-helps",
    title: "Somnul în două case: ce ajută cu adevărat când copilul adoarme greu",
    summary:
      "Problemele de somn după schimbarea de casă se reduc mai des prin rutină și cooperare decât prin explicații lungi sau negocieri târzii.",
    intro:
      "Mulți părinți observă că exact seara, după o mutare între case, copilul devine mai agitat: nu vrea să se spele, cere încă o lumină, încă o poveste, încă un pahar cu apă sau pur și simplu nu se poate așeza. Nu este doar oboseală și nici neapărat răsfăț. Somnul este una dintre primele zone care arată că sistemul copilului duce multă schimbare. Vestea bună este că ajută tocmai lucrurile simple și repetabile.",
    image: {
      src: "/blog/sleep-two-homes.svg",
      alt: "Copil pregătit de somn într-o cameră calmă, cu obiecte familiare din două case",
    },
    categorySlug: "rutine-si-tranzitii",
    publishedAt: "2026-04-09",
    readingTimeMinutes: 6,
    sections: [
      {
        title: "De ce se vede stresul atât de repede în somn",
        paragraphs: [
          "HealthyChildren explică direct că după separare și divorț poate fi greu pentru copii să păstreze ore și rutine de seară consistente când își împart timpul între două case. Într-o situație deja stresantă, unii copii regresează temporar: apar frici de noapte, refuzul de culcare, treziri frecvente sau o nevoie mai mare de reasigurare.",
          "Când schimbările între case sunt dese, corpul copilului are mai mult de adaptat: alt pat, altă lumină, alt zgomot, alt ritm și uneori alt stil parental. Nu este surprinzător că fix seara apar rezistența și sensibilitatea.",
        ],
      },
      {
        title: "Ce merită să rămână la fel în ambele case",
        paragraphs: [
          "Nu ai nevoie de camere identice, dar ajută enorm câțiva piloni constanți. HealthyChildren recomandă explicit păstrarea unei rutine de seară cât mai consistente și dubluri pentru obiectele de somn importante.",
          "Când copilul recunoaște aceeași ordine a pașilor, somnul nu mai depinde atât de mult de negociere sau de dispoziția serii.",
        ],
        bullets: [
          "Păstrați o oră aproximativă de culcare apropiată în ambele case.",
          "Repetați aceeași ordine: baie, pijama, carte, lumină mică, somn.",
          "Țineți dubluri pentru obiectele importante de confort: pluș, păturică, carte, muzică.",
          "Evitați diferențele mari de ecrane, zahăr sau haos chiar înainte de culcare.",
        ],
      },
      {
        title: "Ce faci în seara în care copilul se agață sau se teme",
        paragraphs: [
          "În serile grele, scopul nu este să câștigi repede confruntarea. Mai util este să cobori intensitatea și să păstrezi structura. O voce calmă, puține cuvinte și un cadru familiar ajută mai mult decât avertismentele sau explicațiile lungi despre cât de târziu este.",
          "Dacă apar cereri repetate, poți răspunde blând și predictibil: sunt aici, urmează încă un pupic și apoi somn. Copilul are nevoie să simtă limita ca pe un mal, nu ca pe o ruptură.",
        ],
      },
      {
        title: "Când problema nu mai este doar o fază de ajustare",
        paragraphs: [
          "HealthyChildren notează că, odată ce situația familiei se stabilizează, problemele de somn și alte simptome tind să se reducă treptat în câteva săptămâni. Dacă însă insomniile, coșmarurile, bedwetting-ul, retragerea sau izbucnirile persistă, merită discutat cu pediatrul sau cu un specialist.",
          "Scopul nu este să demonstrezi că una dintre case greșește, ci să reduci încărcarea înainte ca lipsa de somn să tensioneze și mai mult tranzițiile.",
        ],
      },
    ],
    takeaways: [
      "Somnul arată rapid cât de greu duce copilul schimbările dintre case.",
      "Aceiași piloni de seară și obiectele de confort dublate reduc mult fricțiunea.",
      "Dacă problemele persistă săptămâni la rând, merită cerut sprijin profesional.",
    ],
    en: {
      title: "Sleep in two homes: what actually helps when the child struggles to settle",
      summary: "Sleep problems after a home change are reduced more often through routine and cooperation than through long explanations or late-night negotiations.",
      intro: "Many parents notice that exactly on the evening after a home switch, the child becomes more agitated: they don't want to brush their teeth, they ask for one more light, one more story, one more glass of water or simply can't settle. This isn't just tiredness and isn't necessarily defiance. Sleep is one of the first areas to show that a child's system is carrying a lot of change. The good news is that precisely the simple and repeatable things help.",
      sections: [
        { title: "Why stress shows up so quickly in sleep", paragraphs: ["HealthyChildren explains directly that after separation it can be hard for children to maintain consistent evening hours and bedtime routines when they split their time between two homes. In an already stressful situation, some children temporarily regress: nighttime fears appear, bedtime refusal, frequent waking or a greater need for reassurance.", "When changes between homes are frequent, the child's body has more to adapt to: a different bed, different light, different noise, a different rhythm and sometimes a different parenting style. It's not surprising that exactly in the evening resistance and sensitivity appear."] },
        { title: "What deserves to stay the same in both homes", paragraphs: ["You don't need identical rooms, but a few constant pillars help enormously. HealthyChildren explicitly recommends maintaining as consistent a bedtime routine as possible and having duplicates of important sleep items.", "When the child recognises the same sequence of steps, sleep no longer depends so much on negotiation or the mood of that particular evening."], bullets: ["Keep an approximate bedtime close in both homes.", "Repeat the same sequence: bath, pyjamas, book, small light, sleep.", "Keep duplicates of important comfort items: soft toy, blanket, book, music.", "Avoid big differences in screens, sugar or chaos right before bedtime."] },
        { title: "What to do on evenings when the child clings or is fearful", paragraphs: ["On hard evenings, the goal is not to win the confrontation quickly. More useful is reducing the intensity and maintaining the structure. A calm voice, few words and a familiar framework help more than warnings or long explanations about how late it is.", "If repeated requests come in, you can respond gently and predictably: I'm here, one more kiss and then sleep. The child needs to feel the limit as a bank, not as a rupture."] },
        { title: "When the problem is no longer just an adjustment phase", paragraphs: ["HealthyChildren notes that once the family situation stabilises, sleep problems and other symptoms tend to gradually reduce over a few weeks. But if insomnia, nightmares, bedwetting, withdrawal or outbursts persist, it's worth talking with the paediatrician or a specialist.", "The goal is not to prove which home is getting it wrong, but to reduce the load before sleep deprivation makes transitions even more tense."] },
      ],
      takeaways: ["Sleep quickly shows how hard the child is carrying changes between homes.", "The same evening pillars and duplicated comfort items reduce friction significantly.", "If problems persist week after week, professional support is worth seeking."],
    },
    sources: [
      {
        title: "Sleep Problems After Separation or Divorce",
        publisher: "HealthyChildren.org / American Academy of Pediatrics",
        url: "https://www.healthychildren.org/English/healthy-living/sleep/Pages/Sleep-Problems-After-Separation-or-Divorce.aspx?form=HealthyChildren",
        note: "AAP descrie refuzul de culcare, trezirile și regresiile care pot apărea când copilul se mută între două case și recomandă rutine consistente, dubluri pentru obiectele de somn și cooperare strânsă între părinți. Pagina indică ultima actualizare la 3 iulie 2019.",
      },
      {
        title: "How to Support Children after Their Parents Separate or Divorce",
        publisher: "HealthyChildren.org / American Academy of Pediatrics",
        url: "https://www.healthychildren.org/English/healthy-living/emotional-wellness/Building-Resilience/Pages/How-to-Support-Children-after-Parents-Separate-or-Divorce.aspx",
        note: "Completează ideea că rutinele și așteptările consecvente, plus colaborarea între părinți, protejează reglarea copilului în perioadele de schimbare.",
      },
    ],
  },
  {
    slug: "ce-faci-cand-simti-ca-explodezi-tu-primul",
    enSlug: "what-to-do-when-you-feel-like-exploding-first",
    title: "Ce faci când simți că explodezi tu primul",
    summary:
      "Înainte să corectezi copilul, uneori cel mai util pas este să-ți cobori propriul ritm ca să poți rămâne ferm fără să sperii.",
    intro:
      "Există seri în care nu copilul este singurul aproape de limită. Ești obosit, poate ai venit din conflict, ai lucruri logistice nerezolvate și o reacție mică a copilului te împinge imediat spre ton ridicat sau replici aspre. Asta nu te face un părinte fără resurse. Dar îți arată clar că, în acel moment, disciplina începe cu autoreglarea adultului. Dacă tu intri în alarmă, copilul primește încă un semnal de pericol exact când avea nevoie de un adult stabil.",
    image: {
      src: "/blog/parent-self-regulation.svg",
      alt: "Părinte care face o pauză de respirație înainte să răspundă calm copilului",
    },
    categorySlug: "emotii-si-siguranta",
    publishedAt: "2026-04-09",
    readingTimeMinutes: 5,
    sections: [
      {
        title: "De ce contează atât de mult starea adultului",
        paragraphs: [
          "Harvard Center on the Developing Child explică faptul că planificarea, flexibilitatea, focusul și autocontrolul fac parte din capabilitățile adulte care ne ajută să gestionăm viața și îngrijirea copiilor. Când aceste capacități sunt împinse la limită de stres, scade și capacitatea de a oferi grijă receptivă.",
          "Pe scurt, nu doar copilul are nevoie de reglare. Calitatea răspunsului tău depinde direct de cât de activat ești tu în clipa aceea.",
        ],
      },
      {
        title: "Ce faci în primele 30 de secunde",
        paragraphs: [
          "UNICEF recomandă, în momentele dificile, să începi cu o pauză scurtă care îți reglează propriile emoții înainte să încerci să rezolvi comportamentul copilului. Nu este fugă de responsabilitate, ci pregătirea pentru un răspuns util.",
          "Uneori diferența dintre o limită fermă și o escaladare inutilă stă într-o respirație mai lentă și într-o propoziție spusă după ce corpul tău a coborât puțin din alarmă.",
        ],
        bullets: [
          "Nu răspunde pe primul impuls dacă simți că îți urcă imediat tonul.",
          "Pune ambele picioare pe podea și expiră mai lung decât inspiri de 3-4 ori.",
          "Spune puțin și clar: sunt aici, rezolvăm imediat, dar vorbesc după ce mă liniștesc o clipă.",
          "Mută întâi corpul din alertă, apoi decide dacă ai nevoie de limită, reconectare sau ambele.",
        ],
      },
      {
        title: "Cum rămâi ferm fără să devii dur",
        paragraphs: [
          "Autoreglarea adultului nu înseamnă să fii moale sau să lași totul să treacă. Înseamnă să poți spune nu, stop sau refacem, fără sarcasm, amenințări sau intimidare. Când ritmul tău scade, copilul primește o limită mai clară și mai ușor de suportat.",
          "Ajută și limbajul scurt: nu te las să lovești; stau cu tine până te oprești; strângem împreună după ce te calmezi. Cu cât situația e mai încărcată, cu atât explicațiile lungi ajută mai puțin.",
        ],
      },
      {
        title: "Ce faci după ce ai ridicat totuși tonul",
        paragraphs: [
          "Nu încerca să acoperi episodul pretinzând că nu s-a întâmplat. Repară simplu: am vorbit prea tare, nu a fost în regulă, reiau mai calm. Mesajul important pentru copil este că adultul poate reveni la stabilitate și își poate asuma partea lui.",
          "Dacă observi că astfel de momente se repetă des, nu trata problema doar ca pe lipsă de voință. Poate fi un semn că ai nevoie de mai mult sprijin, somn, structură sau de o discuție cu un specialist pentru tine ori pentru familie.",
        ],
      },
    ],
    takeaways: [
      "Calmul adultului nu este detaliu; schimbă direct ce poate primi copilul în acel moment.",
      "O pauză scurtă înainte de reacție poate preveni escaladarea fără să slăbească limita.",
      "Dacă ai ridicat tonul, reparația simplă și clară ajută mai mult decât justificarea.",
    ],
    en: {
      title: "What to do when you feel yourself about to explode first",
      summary: "Before correcting the child, sometimes the most useful step is to lower your own rhythm so you can stay firm without frightening them.",
      intro: "There are evenings when the parent isn't the only one close to the edge. You're tired, perhaps you've come from a conflict, there are unresolved logistical issues and a small child reaction immediately pushes you toward a raised voice or a sharp remark. That doesn't make you a parent without resources. But it shows you clearly that in that moment, discipline starts with the adult's self-regulation. If you go into alarm mode, the child receives yet another danger signal precisely when they needed a stable adult.",
      sections: [
        { title: "Why the adult's state matters so much", paragraphs: ["Harvard Center on the Developing Child explains that planning, flexibility, focus and self-control are adult capacities that help us manage life and the care of children. When these capacities are pushed to the limit by stress, the ability to offer receptive care also drops.", "In short, it's not just the child who needs regulation. The quality of your response depends directly on how activated you are in that moment."] },
        { title: "What to do in the first 30 seconds", paragraphs: ["UNICEF recommends, in difficult moments, starting with a short pause that regulates your own emotions before trying to resolve the child's behaviour. This isn't running from responsibility — it's preparation for a useful response.", "Sometimes the difference between a firm limit and unnecessary escalation lies in one slower breath and a sentence said after your body has come down slightly from alarm."], bullets: ["Don't respond on the first impulse if you feel your tone rising immediately.", "Put both feet on the floor and exhale longer than you inhale, 3–4 times.", "Say little and clearly: I'm here, we'll sort this, but I'll talk once I've calmed down for a moment.", "Move the body out of alert first, then decide if you need a limit, reconnection or both."] },
        { title: "How to stay firm without becoming harsh", paragraphs: ["Adult self-regulation doesn't mean being soft or letting everything pass. It means being able to say no, stop or let's redo this without sarcasm, threats or intimidation. When your rhythm drops, the child receives a clearer and easier-to-bear limit.", "Short language also helps: I'm not letting you hit; I'm staying with you until you stop; we'll tidy it up together once you've calmed down. The more loaded the situation, the less long explanations help."] },
        { title: "What to do after you've raised your voice anyway", paragraphs: ["Don't try to cover the episode by pretending it didn't happen. Repair simply: I spoke too loudly, that wasn't okay, I'll try again more calmly. The important message for the child is that the adult can return to stability and own their part.", "If you notice such moments repeating frequently, don't treat the problem as just a lack of willpower. It may be a sign that you need more support, sleep, structure or a conversation with a specialist for yourself or the family."] },
      ],
      takeaways: ["The adult's calm is not a detail; it directly changes what the child can receive in that moment.", "A short pause before reacting can prevent escalation without weakening the limit.", "If you've raised your voice, simple and clear repair works better than justification."],
    },
    sources: [
      {
        title: "Let’s talk parenting",
        publisher: "UNICEF Parenting",
        url: "https://www.unicef.org/parenting/child-care/lets-talk-parenting",
        note: "UNICEF oferă recomandări scurte și practice pentru momente de parenting tensionate, inclusiv reglarea emoțiilor adultului înainte de corectare și conectarea prin interesele copilului.",
      },
      {
        title: "A Guide to Adult Capabilities",
        publisher: "Center on the Developing Child at Harvard University",
        url: "https://developingchild.harvard.edu/resource-guides/guide-adult-capabilities/",
        note: "Harvard leagă autocontrolul, flexibilitatea și focusul adultului de capacitatea de a oferi grijă receptivă și subliniază că aceste abilități pot fi consolidate chiar și sub stres.",
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

export function formatBlogDate(date: string, lang: "ro" | "en" = "ro") {
  const locale = lang === "en" ? "en-GB" : "ro-RO";
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${date}T12:00:00Z`)
  );
}

function applyLocale(article: BlogArticleWithCategory, lang: "ro" | "en"): BlogArticleWithCategory {
  if (lang === "en" && article.en) {
    return { ...article, ...article.en };
  }
  return article;
}

export function getAllBlogArticles() {
  return [...blogArticles].sort(compareArticlesByDate).map(enrichArticle);
}

/** Returns all articles with text in the given language (falls back to Romanian if no translation). */
export function getAllBlogArticlesLocalized(lang: "ro" | "en") {
  return getAllBlogArticles().map((a) => applyLocale(a, lang));
}

export function getBlogArticleBySlug(slug: string) {
  const article = blogArticles.find((item) => item.slug === slug);
  return article ? enrichArticle(article) : null;
}

/**
 * Look up an article by either its Romanian slug OR its English slug.
 * Returns the article enriched with category data, or null if not found.
 */
export function getBlogArticleByAnySlug(slug: string): BlogArticleWithCategory | null {
  const article =
    blogArticles.find((item) => item.slug === slug) ??
    blogArticles.find((item) => item.enSlug === slug);
  return article ? enrichArticle(article) : null;
}

/** Returns the slug to use in a URL for the given article and language. */
export function articleSlugForLang(article: BlogArticle | BlogArticleWithCategory, lang: "ro" | "en"): string {
  return lang === "en" && article.enSlug ? article.enSlug : article.slug;
}

/**
 * Returns the article with text in the requested language.
 * Falls back to Romanian if no English translation exists.
 * Also returns `hasEnglish` so the UI can show a language badge.
 */
export function getBlogArticleLocalized(
  slug: string,
  lang: "ro" | "en"
): { article: BlogArticleWithCategory; hasEnglish: boolean } | null {
  const base = getBlogArticleByAnySlug(slug);
  if (!base) return null;
  const hasEnglish = Boolean(base.en);
  return { article: applyLocale(base, lang), hasEnglish };
}

export function getFeaturedBlogArticle() {
  const featured = blogArticles.find((item) => item.featured);
  return featured ? enrichArticle(featured) : getAllBlogArticles()[0] ?? null;
}

export function getBlogCategoryBySlug(slug: string) {
  return blogCategories.find((item) => item.slug === slug) ?? null;
}

const CATEGORY_EN: Record<string, { title: string; description: string }> = {
  coparenting: {
    title: "Co-parenting",
    description: "Clear boundaries, communication between adults and protecting the child from conflict.",
  },
  "emotii-si-siguranta": {
    title: "Emotions & safety",
    description: "How to talk to the child about changes without shifting the adult conflict onto their shoulders.",
  },
  "rutine-si-tranzitii": {
    title: "Routines & transitions",
    description: "Concrete ideas for two homes, smoother handovers and real predictability.",
  },
  "activitati-si-conectare": {
    title: "Activities & connection",
    description: "Play, reconnection and micro-rituals that reduce tension after busy days.",
  },
};

export function getBlogCategoriesWithTranslation(): BlogCategoryWithTranslation[] {
  return blogCategories.map((c) => ({
    ...c,
    titleEn: CATEGORY_EN[c.slug]?.title,
    descriptionEn: CATEGORY_EN[c.slug]?.description,
  }));
}

export function getArticlesForCategory(categorySlug: string, lang: "ro" | "en" = "ro") {
  return getAllBlogArticlesLocalized(lang).filter((article) => article.category.slug === categorySlug);
}

/** True if the article has a full English translation available. */
export function articleHasEnglish(slug: string): boolean {
  return Boolean(blogArticles.find((a) => a.slug === slug || a.enSlug === slug)?.en);
}

/** Returns all Romanian + English slugs for static generation. */
export function getAllBlogSlugs(): string[] {
  const slugs: string[] = [];
  for (const a of blogArticles) {
    slugs.push(a.slug);
    if (a.enSlug) slugs.push(a.enSlug);
  }
  return slugs;
}
