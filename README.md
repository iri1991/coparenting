# Eva & Coparenting

Aplicație simplă pentru planificarea zilelor cu Eva – Tunari (cu tata), Otopeni (cu mama), cu toții. Folosibilă pe mobil, cu sincronizare și export calendar.

## Funcționalități

- **Calendar interactiv** – vezi luna curentă, alege o zi, adaugă evenimente
- **Tipuri de evenimente**: Eva la Tunari, Eva la Otopeni, Cu toții, Altele
- **Sincronizare** – evenimentele se reîncarcă la fiecare 15 secunde și când revii în aplicație (focus)
- **Export calendar (.ics)** – buton în header pentru descărcare; poți importa în Google Calendar, Apple Calendar etc.
- **Notificări în seara de dinainte** – email trimis automat seara (ex. 21:00) cu programul de mâine (preluare / zile cu Eva)
- **PWA** – pe mobil poți adăuga aplicația pe ecranul principal

## Setup

### 1. MongoDB

1. Creează un cluster (gratuit) la [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) sau folosește MongoDB local.
2. Obține connection string-ul (ex. `mongodb+srv://user:pass@cluster.mongodb.net/`).
3. Baza de date și colecțiile (`users`, `schedule_events`) se creează automat la primul utilizare.

### 2. Variabile de mediu

```bash
cp .env.example .env.local
```

Completează în `.env.local`:

- **MONGODB_URI** – connection string MongoDB
- **NEXTAUTH_SECRET** – secret pentru sesiuni (generează: `openssl rand -base64 32`)
- **NEXTAUTH_URL** – în dev: `http://localhost:3000`, în producție: URL-ul aplicației
- **RESEND_API_KEY** – pentru emailuri (obține la [Resend](https://resend.com))
- **EMAIL_FROM** – adresa expeditor (ex. `Eva <noreply@tudomeniu.ro>`; pe Resend gratuit: `onboarding@resend.dev`)
- **CRON_SECRET** – secret pentru apelul cron (generează: `openssl rand -hex 32`); pe Vercel e trimis automat la cron

### 3. Pornire

```bash
npm install
npm run dev
```

Deschide [http://localhost:3000](http://localhost:3000). Înregistrează două conturi (ex. email-ul tău și al Andreeei), apoi conectează-te și adaugă evenimente.

### 4. Notificări și calendar

- **În aplicație**: modificările se reîncarcă la câteva secunde și la focus.
- **Email în seara de dinainte**: dacă ai setat `RESEND_API_KEY` și `EMAIL_FROM`, un cron (ex. pe Vercel la 21:00 ora României) trimite tuturor utilizatorilor un email cu evenimentele de mâine. Setează `CRON_SECRET` în mediu; pe Vercel e adăugat automat la request-ul cron.
- **Pe telefon/calendar**: folosește „Exportă calendar” (iconița de calendar în header), descarcă `.ics`, apoi adaugă-l în Google Calendar / Apple Calendar.

## Tehnologii

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **MongoDB** – baza de date (Atlas sau local)
- **NextAuth** – autentificare (Credentials, utilizatori în MongoDB)
- **Resend** – trimitere email pentru reminder-ul de seară
- date-fns, PWA manifest

## Structură

- `src/app/page.tsx` – pagină principală (landing sau dashboard)
- `src/app/login/page.tsx` – autentificare
- `src/app/api/events/route.ts` – CRUD evenimente (GET, POST, PATCH, DELETE)
- `src/app/api/auth/signup/route.ts` – înregistrare utilizator
- `src/app/api/calendar/ics/route.ts` – export .ics
- `src/app/api/cron/evening-reminder/route.ts` – cron: trimite email cu evenimentele de mâine (seara)
- `vercel.json` – program cron (19:00 UTC = 21:00 România)
- `src/lib/mongodb.ts` – conexiune MongoDB
- `src/lib/auth.ts` – configurare NextAuth
