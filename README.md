# Eva & Coparenting

Aplicație simplă pentru planificarea zilelor cu Eva – Tunari (cu tata), Otopeni (cu mama), cu toții. Folosibilă pe mobil, cu sincronizare și export calendar.

## Funcționalități

- **Calendar interactiv** – vezi luna curentă, alege o zi, adaugă evenimente
- **Tipuri de evenimente**: Eva la Tunari, Eva la Otopeni, Cu toții, Altele
- **Sincronizare** – evenimentele se reîncarcă la fiecare 15 secunde și când revii în aplicație (focus)
- **Export calendar (.ics)** – buton în header pentru descărcare; poți importa în Google Calendar, Apple Calendar etc.
- **Notificări push** – la eveniment nou și seara înainte de preluare (programul de mâine); cerere de permisiune la prima deschidere
- **Zile blocate** – fiecare părinte poate bloca perioade (ex. „plecat o săptămână”); nu se pot adăuga evenimente cu Eva în zilele blocate, iar celălalt părinte este notificat dacă încearcă
- **PWA** – pe mobil poți adăuga aplicația pe ecranul principal

## Setup

### 1. MongoDB

1. Creează un cluster (gratuit) la [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) sau folosește MongoDB local.
2. Obține connection string-ul (ex. `mongodb+srv://user:pass@cluster.mongodb.net/`).
3. Baza de date și colecțiile (`users`, `schedule_events`, `push_subscriptions`, `blocked_periods`) se creează automat la primul utilizare.

### 2. Variabile de mediu

```bash
cp .env.example .env.local
```

Completează în `.env.local`:

- **MONGODB_URI** – connection string MongoDB
- **NEXTAUTH_SECRET** – secret pentru sesiuni (generează: `openssl rand -base64 32`)
- **NEXTAUTH_URL** – în dev: `http://localhost:3000`, în producție: URL-ul aplicației
- **VAPID_PUBLIC_KEY** și **VAPID_PRIVATE_KEY** – pentru notificări push (generează: `npx web-push generate-vapid-keys`)
- **CRON_SECRET** – secret pentru apelul cron (generează: `openssl rand -hex 32`); pe Vercel e trimis automat la cron

### 3. Pornire

```bash
npm install
npm run dev
```

Deschide [http://localhost:3000](http://localhost:3000). Înregistrează două conturi (ex. email-ul tău și al Andreeei), apoi conectează-te și adaugă evenimente.

### 4. Asociere Tata / Mama

Fiecare utilizator trebuie asociat cu rolul „Tata” sau „Mama” ca să apară corect mesajul „petreci x zile cu Eva” și pentru notificări. Poți:

- **Din aplicație**: la prima deschidere după login apare „Ești Tata sau Mama?” – alege butonul corespunzător.
- **Prin script** (pentru conturile existente): din rădăcina proiectului, cu `.env` configurat:
  ```bash
  yarn set-parent-types
  ```
  Scriptul setează `me@irinelnicoara.ro` → Tata (Irinel) și `andramd2803@gmail.com` → Mama (Andreea). Pentru alte emailuri editează `scripts/set-parent-types.mjs`.

### 5. Notificări și calendar

- **În aplicație**: modificările se reîncarcă la câteva secunde și la focus.
- **Notificări push**: la prima deschidere (după login) browserul poate cere permisiunea pentru notificări; dacă accepți, primești push când se adaugă un eveniment nou și seara (ex. 21:00) cu programul de mâine. Cron-ul rulează pe Vercel la 21:00 ora României; setează `CRON_SECRET` în mediu.
- **Pe telefon/calendar**: folosește „Exportă calendar” (iconița de calendar în header), descarcă `.ics`, apoi adaugă-l în Google Calendar / Apple Calendar.

## Tehnologii

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **MongoDB** – baza de date (Atlas sau local)
- **NextAuth** – autentificare (Credentials, utilizatori în MongoDB)
- **web-push** – notificări push (eveniment nou + reminder seară)
- date-fns, PWA manifest

## Structură

- `src/app/page.tsx` – pagină principală (landing sau dashboard)
- `src/app/login/page.tsx` – autentificare
- `src/app/api/events/route.ts` – CRUD evenimente; verifică zilele blocate la adăugare/editare
- `src/app/api/blocked-days/route.ts` – perioade blocate (GET toate / ?mine=1, POST, DELETE)
- `src/types/blocked.ts` – tip BlockedPeriod
- `src/app/api/auth/signup/route.ts` – înregistrare utilizator
- `src/app/api/calendar/ics/route.ts` – export .ics
- `src/app/api/cron/evening-reminder/route.ts` – cron: trimite push cu evenimentele de mâine (seara)
- `src/app/api/push/vapid-public/route.ts` – cheie publică VAPID pentru abonare
- `src/app/api/push/subscribe/route.ts` – salvare abonament push (post-login)
- `src/lib/push.ts` – trimitere push, abonamente în MongoDB
- `public/sw.js` – service worker pentru primirea notificărilor
- `vercel.json` – program cron (19:00 UTC = 21:00 România)
- `src/lib/mongodb.ts` – conexiune MongoDB
- `src/lib/auth.ts` – configurare NextAuth
- `src/app/api/user/me/route.ts` – profil utilizator (GET/PATCH), inclusiv parentType (Tata/Mama)
- `scripts/set-parent-types.mjs` – script one-shot pentru asocierea email → Tata/Mama