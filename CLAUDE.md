# finance-bro — Projektkontext

BWL-Klausurtrainer auf finance-bro.de. Next.js 16 App Router, React 19, Tailwind 4,
TypeScript. Deployment über Vercel, Repo `nicotriescoding/finance-bro`, Branch `main`.
Sprache der Oberfläche und aller Aufgaben: **Deutsch**.

## Grundregeln

1. **Keine Laufzeit-Abhängigkeit von einer Datenbank auf dem Lesepfad.** Aufgaben liegen als
   TypeScript im Repo. Ein pausiertes Supabase hat die Seite früher komplett lahmgelegt.
   Falls später Highscores oder Multiplayer dazukommen: nur als optionale Ergänzung mit
   sauberem Fehlerzustand, nie als Voraussetzung dafür, dass die Seite rendert.
2. **Prompt und Antwort kommen aus demselben Seed.** Niemals Aufgabentext und Lösung
   getrennt erzeugen — genau das hat vorher zu falschen Ergebnissen geführt.
3. **Toleranz statt Stringvergleich.** Nie `toFixed(2) === answer`. Immer
   `isWithinTolerance` aus `lib/questions/grading.ts`.
4. **Einheiten sind Pflicht.** Jede numerische Aufgabe deklariert `unit`. Prozentwerte
   werden als Prozentzahl zurückgegeben (8,24 — nicht 0,0824).
5. **Nach jeder Änderung an den Aufgaben `npm run verify` ausführen.**

## Fächer

Finance (Investment & Financial Management), Econ 1, Econ 2, Financial Accounting,
Cost Accounting, Entrepreneurship, Marketing. Topics in `src/content/subjects.ts`.

Die Nicht-Finance-Bänke sind derzeit Startbestand. Nico liefert Altklausuren nach; daraus
entstehende Aufgaben bekommen ein `source`-Feld mit Klausur und Aufgabennummer.

## Was bewusst entfernt wurde

`lib/formulas.ts` (Monolith) und `lib/formulas/` (modulare Kopie) existierten parallel mit
unterschiedlichen Inhalten; importiert wurde nur der Monolith. Beide sind gelöscht, ebenso
`variableGenerators.ts`, `useGame.ts`, `supabaseClient.ts` und die zugehörigen Task-Komponenten.
Die benötigte Finanzmathematik lebt jetzt in `content/questions/_helpers.ts` und in den
`build`-Funktionen der Aufgaben.
