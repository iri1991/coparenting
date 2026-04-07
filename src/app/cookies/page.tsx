import Link from "next/link";

export default function CookiesPage() {
  const updatedAt = "07.04.2026";
  return (
    <div className="min-h-screen bg-stone-50 px-4 py-10 text-stone-800 sm:px-6">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#ead9c8] bg-white p-6 shadow-[0_18px_40px_rgba(28,25,23,0.06)] sm:p-8">
        <h1 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">Politica de cookies</h1>
        <p className="mt-3 text-sm text-stone-500">Ultima actualizare: {updatedAt}</p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-stone-700">
          <section>
            <h2 className="text-lg font-bold text-stone-900">1. Ce sunt cookies</h2>
            <p className="mt-2">
              Cookies sunt fișiere mici stocate pe dispozitivul tău atunci când vizitezi un site. Ele ajută la funcționarea
              aplicației, păstrarea sesiunii și îmbunătățirea experienței de utilizare.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">2. Ce tipuri de cookies folosim</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <span className="font-semibold">Esențiale:</span> necesare pentru autentificare, securitate, sesiune și funcții de
                bază. Fără ele, aplicația nu funcționează corect.
              </li>
              <li>
                <span className="font-semibold">Funcționale:</span> salvează preferințe locale (ex. setări de interfață), pentru o
                utilizare mai fluidă.
              </li>
              <li>
                <span className="font-semibold">Analitice (dacă sunt activate):</span> oferă statistici agregate despre utilizare,
                pentru îmbunătățirea produsului.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">3. Baza legală</h2>
            <p className="mt-2">
              Cookies esențiale sunt utilizate în baza interesului legitim de a furniza serviciul. Pentru categorii neesențiale,
              solicităm consimțământul, acolo unde legislația aplicabilă impune acest lucru.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">4. Durata de stocare</h2>
            <p className="mt-2">
              Unele cookies sunt de sesiune (se șterg la închiderea browserului), altele persistente (rămân pentru o perioadă
              limitată sau până la ștergere manuală).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">5. Cum poți controla cookies</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Poți modifica preferințele din browser pentru blocare sau ștergere cookies.</li>
              <li>Poți șterge manual cookies existente din setările browserului.</li>
              <li>Dezactivarea cookies esențiale poate afecta funcționarea aplicației.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">6. Cookies terțe părți</h2>
            <p className="mt-2">
              Dacă folosim servicii externe (ex. notificări, măsurare trafic, suport), acestea pot seta cookies proprii, conform
              politicilor lor. Vom limita integrarea la servicii necesare și conforme.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">7. Modificări ale politicii</h2>
            <p className="mt-2">
              Putem actualiza periodic această politică pentru a reflecta schimbări tehnice sau legale. Versiunea curentă este
              disponibilă pe această pagină.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">8. Contact</h2>
            <p className="mt-2">
              Pentru întrebări privind cookies:{" "}
              <a className="font-semibold text-[#b66347] hover:underline" href="mailto:me@irinelnicoara.ro">
                me@irinelnicoara.ro
              </a>
              .
            </p>
          </section>
        </div>

        <Link href="/" className="mt-8 inline-flex text-sm font-semibold text-[#b66347] hover:underline">
          Înapoi la prima pagină
        </Link>
      </div>
    </div>
  );
}
