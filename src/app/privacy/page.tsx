import Link from "next/link";

export default function PrivacyPage() {
  const updatedAt = "07.04.2026";
  return (
    <div className="min-h-screen bg-stone-50 px-4 py-10 text-stone-800 sm:px-6">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#ead9c8] bg-white p-6 shadow-[0_18px_40px_rgba(28,25,23,0.06)] sm:p-8">
        <h1 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">Politica de confidențialitate</h1>
        <p className="mt-3 text-sm text-stone-500">Ultima actualizare: {updatedAt}</p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-stone-700">
          <section>
            <h2 className="text-lg font-bold text-stone-900">1. Principii generale</h2>
            <p className="mt-2">
              HomeSplit tratează datele despre familie și copil cu prioritate ridicată. Colectăm doar datele necesare pentru
              funcționarea aplicației, nu vindem date personale și limităm accesul la membrii autorizați ai familiei.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">2. Ce date colectăm</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Date cont: email, identificatori tehnici, rol în familie.</li>
              <li>Date de organizare: calendar, evenimente, ritualuri, activități, documente.</li>
              <li>Date medicale introduse de utilizatori: boli, planuri de tratament, administrări, rapoarte atașate.</li>
              <li>Date tehnice: loguri minime de securitate, erori și performanță.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">3. Scopurile prelucrării</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Furnizarea serviciului HomeSplit și autentificarea utilizatorilor.</li>
              <li>Sincronizarea informațiilor între membrii familiei.</li>
              <li>Notificări operaționale (ex. ritualuri, tratamente, schimbări relevante).</li>
              <li>Îmbunătățirea funcționalității, securității și stabilității.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">4. Temeiuri legale</h2>
            <p className="mt-2">
              Prelucrăm datele în baza executării contractului (furnizarea aplicației), interesului legitim (securitate și
              prevenirea abuzului), obligațiilor legale și, unde este cazul, consimțământului.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">5. Date medicale și sensibile</h2>
            <p className="mt-2">
              Datele medicale sunt introduse de utilizatori pentru coordonare familială. Recomandăm adăugarea strict a informațiilor
              necesare. Aceste date sunt accesibile doar membrilor familiei autorizați în aplicație.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">6. Cui divulgăm datele</h2>
            <p className="mt-2">
              Nu vindem date personale. Putem utiliza furnizori tehnici (hosting, email, notificări) care prelucrează date în numele
              nostru, pe baza unor obligații contractuale de confidențialitate și securitate.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">7. Păstrarea datelor</h2>
            <p className="mt-2">
              Păstrăm datele cât timp contul este activ sau cât este necesar pentru scopurile legitime și obligațiile legale. La
              solicitare, putem șterge sau anonimiză datele conform cerințelor legale aplicabile.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">8. Drepturile tale</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Drept de acces la datele personale.</li>
              <li>Drept de rectificare a datelor inexacte.</li>
              <li>Drept la ștergere, în limitele legii.</li>
              <li>Drept la restricționare și opoziție.</li>
              <li>Drept la portabilitatea datelor, unde este aplicabil.</li>
              <li>Drept de a depune plângere la autoritatea competentă (ANSPDCP).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">9. Securitate</h2>
            <p className="mt-2">
              Aplicăm măsuri tehnice și organizaționale rezonabile pentru protejarea datelor împotriva accesului neautorizat,
              pierderii, alterării sau divulgării accidentale.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">10. Transferuri internaționale</h2>
            <p className="mt-2">
              Dacă folosim furnizori cu infrastructură în afara SEE, vom aplica garanții adecvate conform cadrului legal (ex.
              clauze contractuale standard), acolo unde este necesar.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">11. Modificări ale politicii</h2>
            <p className="mt-2">
              Putem actualiza această politică periodic. Versiunea curentă este publicată pe această pagină, împreună cu data ultimei
              actualizări.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">12. Contact</h2>
            <p className="mt-2">
              Pentru solicitări privind datele personale:{" "}
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
