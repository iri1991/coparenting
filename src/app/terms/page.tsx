import Link from "next/link";

export default function TermsPage() {
  const updatedAt = "07.04.2026";
  return (
    <div className="min-h-screen bg-stone-50 px-4 py-10 text-stone-800 sm:px-6">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#ead9c8] bg-white p-6 shadow-[0_18px_40px_rgba(28,25,23,0.06)] sm:p-8">
        <h1 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">Termeni și condiții</h1>
        <p className="mt-3 text-sm text-stone-500">Ultima actualizare: {updatedAt}</p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-stone-700">
          <section>
            <h2 className="text-lg font-bold text-stone-900">1. Cine suntem</h2>
            <p className="mt-2">
              HomeSplit este o aplicație web pentru organizarea programului copilului, comunicare contextuală, ritualuri, idei
              de activități, documente de familie și informații medicale relevante în cadrul familiei.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">2. Acceptarea termenilor</h2>
            <p className="mt-2">
              Prin crearea unui cont sau utilizarea aplicației, confirmați că ați citit și acceptat acești termeni, precum și
              politica de confidențialitate și politica de cookies. Dacă nu sunteți de acord, nu utilizați serviciul.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">3. Conturi și acces</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Accesul la o familie se face pe bază de invitație sau creare directă a familiei în aplicație.</li>
              <li>Utilizatorul este responsabil pentru securitatea contului și păstrarea confidențialității credențialelor.</li>
              <li>Este interzisă partajarea accesului cu persoane neautorizate.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">4. Utilizare permisă</h2>
            <p className="mt-2">Sunteți de acord să utilizați HomeSplit exclusiv în scopuri legale și în interesul copilului.</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Nu publicați conținut ilegal, abuziv, discriminatoriu sau care încalcă drepturi terțe.</li>
              <li>Nu încercați să compromiteți securitatea platformei sau a altor conturi.</li>
              <li>Nu folosiți aplicația pentru spam, fraudă sau colectare neautorizată de date.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">5. Date și responsabilitate utilizator</h2>
            <p className="mt-2">
              Utilizatorii sunt responsabili pentru acuratețea datelor introduse (program, documente, tratamente, administrări).
              HomeSplit oferă instrumente de organizare și trasabilitate, dar nu înlocuiește consultul medical, juridic sau
              deciziile parentale asumate.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">6. Funcționalități medicale</h2>
            <p className="mt-2">
              Modulele de sănătate (timeline boli, plan tratament, administrări, rapoarte medicale) au rol informativ și de
              coordonare între membrii familiei. Acestea nu constituie recomandare medicală și nu substituie medicul curant.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">7. Disponibilitate și modificări</h2>
            <p className="mt-2">
              Depunem eforturi rezonabile pentru disponibilitate continuă, însă pot exista întreruperi pentru mentenanță,
              actualizări sau incidente tehnice. Putem modifica funcții, planuri sau acești termeni; versiunea actualizată va fi
              publicată pe această pagină.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">8. Proprietate intelectuală</h2>
            <p className="mt-2">
              Codul, designul, textele și elementele de brand HomeSplit sunt protejate de legislația aplicabilă. Nu este permisă
              copierea, distribuirea sau reutilizarea fără acord prealabil scris.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">9. Limitarea răspunderii</h2>
            <p className="mt-2">
              În măsura permisă de lege, HomeSplit nu răspunde pentru pierderi indirecte, incidente sau consecințe rezultate din
              utilizarea improprie a aplicației, date incomplete ori decizii luate exclusiv de utilizatori.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">10. Suspendare sau încetare</h2>
            <p className="mt-2">
              Putem suspenda sau închide accesul în caz de încălcare gravă a termenilor, utilizare abuzivă sau risc de securitate.
              Utilizatorii pot solicita ștergerea contului conform politicii de confidențialitate.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">11. Lege aplicabilă și jurisdicție</h2>
            <p className="mt-2">
              Acești termeni sunt guvernați de legea română. Orice dispută se soluționează pe cale amiabilă, iar în lipsa unei
              soluții, de instanțele competente din România.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">12. Contact</h2>
            <p className="mt-2">
              Pentru întrebări legate de termeni și condiții:{" "}
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
