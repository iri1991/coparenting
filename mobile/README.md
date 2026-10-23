# HomeSplit — aplicația mobilă (React Native / Expo)

Aplicația din App Store și Google Play. Folosește același backend ca site-ul (`../src/app/api`),
autentificare cu token (`Authorization: Bearer`) și design system-ul din [`../DESIGN.md`](../DESIGN.md)
(tokenii sunt în `src/theme.ts`).

## Structură

```
src/app/            ecranele (Expo Router): setup, join, event (modal)
  _layout.tsx       providere, notificări
  index.tsx         redirect: login sau aplicație
  login.tsx, register.tsx
  (tabs)/           Acasă (calendar) · Chat · Cont
  +native-intent.tsx  linkuri web → ecrane
src/components/     piesele design system-ului (ui.tsx, Icon.tsx)
src/lib/            API, sesiune, notificări, etichete, date
src/theme.ts        culori, raze, umbre, tipografie (din DESIGN.md)
```

## Rulare locală

```bash
cd mobile
npm install
npx expo start          # scanezi QR-ul cu un development build (vezi mai jos)
npm run typecheck
```

Serverul folosit: `expo.extra.apiUrl` din `app.json` (implicit `https://homesplit.ro`).
Pentru un backend local, pune adresa IP a calculatorului (ex. `http://192.168.1.10:3000`).

Notificările push nu funcționează în Expo Go; folosește un development build:
`npx eas build --profile development --platform ios|android`.

## Primul build (o singură dată)

1. Cont Expo + `npm i -g eas-cli` + `eas login`.
2. `eas init` — completează automat `extra.eas.projectId` în `app.json` (necesar pentru notificări).
3. Cont Apple Developer (99$/an) și Google Play Console (25$ o dată).
4. `eas build --platform all --profile production` — EAS gestionează certificatele și cheile.
5. `eas submit --platform ios` / `--platform android`.

## Variabile de mediu pe server (Vercel)

| Variabilă | Pentru |
|---|---|
| `APPLE_TEAM_ID` | Universal Links iOS (`/.well-known/apple-app-site-association`) |
| `ANDROID_SHA256_CERT_FINGERPRINTS` | App Links Android (`/.well-known/assetlinks.json`), din Play Console → App signing |
| `EXPO_ACCESS_TOKEN` (opțional) | Securizarea trimiterii de notificări prin Expo |

## Reguli de store pe care aplicația le respectă

- **Ștergerea contului din aplicație** (Cont → Șterge contul) — cerută de Apple și Google.
- **Creare cont în aplicație** (`register.tsx`).
- **Fără cumpărare în aplicație**: planul se afișează, dar nu există ofertă, preț sau link de plată
  (abonamentele se gestionează pe site). Nu adăuga butoane de upgrade fără In-App Purchase.
- Link spre politica de confidențialitate în aplicație (Cont).

## Checklist publicare

- [ ] `eas init` + `projectId` în `app.json`
- [ ] Iconiță 1024×1024 fără transparență (`assets/icon.png`) și iconițe adaptive Android
- [ ] Capturi de ecran (iPhone 6.7" și 6.5", Android telefon)
- [ ] Descriere, cuvinte cheie, categorie (Lifestyle / Productivity), rating de vârstă
- [ ] App Privacy (Apple) și Data safety (Google): email, nume, date despre copil, mesaje; fără tracking
- [ ] Cont de test pentru recenzie (email + parolă cu familie configurată)
- [ ] Variabilele de mediu de mai sus setate pe server
- [ ] Textele de pe site („nu necesită App Store”) actualizate la lansare

## Funcționalități

Acum aplicația are:
- login / creare cont; invitațiile deschise înainte de conectare sunt reluate după login;
- configurarea familiei în aplicație: creare familie sau acceptare invitație (link lipit sau deschis
  din email), numele părinților, copilul, locuința, invitația celuilalt părinte;
- calendarul lunii; adăugare (inclusiv interval de zile), editare și ștergere de evenimente, cu
  aceleași reguli ca pe web (zile blocate, motiv pentru modificarea evenimentelor din trecut);
- chat, cont (inclusiv ștergere), notificări native, linkuri web → ecrane (`/app`, `/chat`,
  `/account`, `/join`).

Urmează: zile blocate, propunerea săptămânală, setările familiei (mai multe locuințe, copii),
tab-urile „Copil” și „Împreună”.
