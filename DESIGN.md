# HomeSplit — Design system

Sursa de adevăr pentru interfața aplicației (web, PWA și aplicațiile din App Store / Google Play,
care rulează aceeași interfață prin Capacitor). Clasele de bază sunt în `src/app/globals.css`.
Orice ecran nou se construiește din aceste piese; culori sau umbre noi se adaugă aici întâi.

## Caracter

Calm, cald, „hârtie bună”: fundal crem, suprafețe albe translucide, un singur accent teracotă.
Fără negru pur, fără culori saturate în afara stărilor (eroare, succes). Aplicația trebuie să se
simtă ca una nativă: răspuns instant la atingere, tranziții scurte, fără efecte decorative lungi.

## Culori

| Rol | Valoare | Folosire |
|---|---|---|
| Fundal aplicație | `#f6efe6` → `#f3eee6` (gradient, `.app-native-shell`) | Fundalul fiecărui ecran din aplicație |
| Fundal chat / ecrane dense | `#f6f0e8` | Chat, ecrane pe tot ecranul |
| Text principal | `stone-900` (`#1c1917`) | Titluri, conținut |
| Text secundar | `stone-500` / `stone-600` | Descrieri, meta |
| Etichete (eyebrow) | `stone-400`, uppercase, `tracking-[0.16em]`, 11px | Deasupra titlurilor de secțiune |
| Accent (primar) | gradient `#d48a63` → `#bf6a4b` | Butonul principal, tab activ, bule proprii în chat |
| Accent text | `#b85c3e` / `#b66347` | Linkuri, accente în text |
| Accent fundal deschis | `#fff4e9`, `#fbf3ec`, `#f8e4da` | Selecție, chip-uri, iconițe |
| Verde liniștitor | text `#1f5a4e`, fundal `#edf6f3` | Mesaje programate, confirmări calme |
| Bordură caldă | `#eadccd` / `#ecd8c5` / `rgba(221,201,180,.9)` | Separatoare, input-uri |
| Eroare | `red-600`, fundal `red-50` | Erori, acțiuni distructive |
| Succes | `emerald-700` | Mesaje de succes |

Culori pe părinte (calendar): `PARENT_COLORS` din `src/types/events.ts`.

## Suprafețe

| Clasă | Când |
|---|---|
| `.app-native-surface` | Card standard (alb 78%, blur 18px, umbră moale) |
| `.app-native-surface-strong` | Card evidențiat (hero, rezumat) |
| `.app-native-glass` | Bare fixe: header mobil, bara de jos |

Raze: carduri `rounded-[2rem]`, elemente din card `rounded-[1.2rem]`–`rounded-[1.4rem]`,
iconițe în chip `rounded-[1.4rem]` (48×48), butoane și pastile `rounded-full`.

## Componente

- **Buton principal**: `.app-native-primary-button` (pastilă cu gradient teracotă). Unul pe ecran.
- **Buton secundar**: `.app-native-secondary-button` (pastilă albă, bordură caldă).
- **Buton iconiță**: `.app-native-icon-button`, 44×44 minim (țintă de atingere).
- **Distructiv**: pastilă albă cu `border-red-100 text-red-700`; confirmarea finală `bg-red-600 text-white`.
- **Input**: `.app-native-input` (raza 1.15rem, focus inel teracotă). Font minim 16px pe mobil
  (altfel iOS face zoom).
- **Card de secțiune**: chip iconiță 48×48 (fundal accent deschis) + eyebrow + titlu `text-lg font-semibold`
  + descriere `text-sm text-stone-500`. Exemplu: secțiunile din `AccountClient`.
- **Schelet de încărcare**: `.app-skeleton` (vezi `AppScreenSkeleton`).
- **Feedback la apăsare**: `.app-pressable` sau `active:scale-95` pe elementele mari.

## Tipografie

Geist Sans pentru aplicație. Titlu ecran `text-lg`–`text-2xl font-semibold tracking-tight`,
text `text-sm`/`text-[15px]`, meta `text-xs`. Site-ul public (landing, blog) folosește fonturile
`landing-display` / `landing-sans` și nu face parte din aplicație.

## Mișcare

- Intrare ecran: `.app-screen-enter` (220ms). Fără transform rămas după animație.
- Tranziții de stare: 120–200ms. Respectă `prefers-reduced-motion`.
- Gesturi: swipe înapoi de la margine, pull-to-refresh pe ecranul principal, swipe pe mesaj = răspunde.

## Layout mobil

- Header fix (`MobileAppTopBar`) + bara de jos (`MobileQuickNav`), ambele `.app-native-glass`.
- Respectă `env(safe-area-inset-*)` sus și jos (notch, bara de gesturi).
- Conținutul principal: `px-4`, `max-w-5xl` (acasă) / `max-w-3xl` (cont, chat).
- Ecranele pe tot ecranul (chat) își desenează propriul header și ascund bara de jos.

## Aplicația din store (Capacitor)

Aceeași interfață; diferențele sunt doar de comportament (vezi `src/lib/native.ts`):
notificări native, vibrații, bara de stare, butonul „înapoi” pe Android. Pe iOS nu se afișează
nicio ofertă de cumpărare (abonamentele se gestionează pe site).
