# finance-bro

Klausurtrainer für BWL — [finance-bro.de](https://www.finance-bro.de)

Next.js 16 (App Router) · React 19 · Tailwind 4 · TypeScript. **Keine Datenbank, kein Backend.**

## Warum keine Datenbank

Die Aufgaben lagen früher in einer Supabase-Tabelle (`ivfall`) und wurden beim Seitenaufruf
clientseitig nachgeladen. Sobald das Supabase-Projekt pausierte (Free Tier pausiert nach
7 Tagen Inaktivität), lieferte die API 503 und die Seite blieb dauerhaft auf `Loading...`
stehen. Der komplette Aufgabenpool liegt jetzt als typisiertes TypeScript im Bundle —
die Seite kann nicht mehr wegen eines schlafenden Backends ausfallen.

## Struktur

```
src/
  content/
    subjects.ts              Fächer + Themen (die Filter im Quiz werden daraus generiert)
    questions/
      index.ts               Registry + Filter-Helfer
      finance.ts             Investment & Financial Management
      econ1.ts econ2.ts      VWL
      financial_accounting.ts
      cost_accounting.ts
      entrepreneurship.ts
      marketing.ts
      _helpers.ts            Zahlformatierung (de-DE), Normalverteilung, NPV, IRR, Duration
  lib/questions/
    types.ts                 Question-Typen (numeric | choice)
    rng.ts                   Seeded RNG (mulberry32)
    engine.ts                Seed -> konkrete Aufgabe
    grading.ts               Toleranzprüfung, Einheiten, deutsche Zahleneingabe
  components/quiz/           TopicSelector, QuestionCard, QuizClient
```

## Aufgaben hinzufügen

Eine Aufgabe ist ein Objekt in der Datei des jeweiligen Fachs. `topic` muss eine Topic-ID
aus `content/subjects.ts` sein.

**Multiple Choice** (Klausurformat):

```ts
{
    id: "fa-neue-frage",              // global eindeutig
    subject: "financial_accounting",
    topic: "bookings",
    difficulty: "medium",
    kind: "choice",
    source: "TUM Endterm WS24/25, A3",  // optional, wird als Badge angezeigt
    prompt: "Frage …",
    choices: ["richtig", "falsch A", "falsch B", "falsch C"],
    correct: 0,                        // Index, oder [0, 2] für Mehrfachauswahl
    explanation: "Begründung …",
}
```

Die Optionen werden im Quiz gemischt — die richtige Antwort darf ruhig immer an Index 0 stehen.

**Rechenaufgabe** (Zahlen werden pro Durchlauf neu gewürfelt):

```ts
{
    id: "ca-neue-aufgabe",
    subject: "cost_accounting",
    topic: "contribution_margin",
    difficulty: "easy",
    kind: "numeric",
    unit: "EUR",                       // EUR | percent | ratio | years | number | units
    build: (rng) => {
        const fix = rng.int(20, 300) * 1000;
        const db  = rng.int(10, 90);
        return {
            prompt: `Fixkosten ${eur(fix)}, Stückdeckungsbeitrag ${eur(db)}. …`,
            given: { Fixkosten: eur(fix), db: eur(db) },
            answer: fix / db,
            explanation: `x = K_fix/db = ${n2(fix / db)}`,
        };
    },
}
```

`prompt` und `answer` entstehen aus demselben Zug des seeded RNG — die angezeigten Zahlen
und die bewertete Lösung können nicht auseinanderlaufen.

## Bewertung

`unit` steuert die Toleranz. Gerundete Zwischenschritte werden akzeptiert:

| Einheit | relativ | Mindesttoleranz |
|---------|---------|-----------------|
| EUR     | 0,5 %   | 0,02 €          |
| percent | 1 %     | 0,05 pp         |
| ratio   | 1 %     | 0,005           |
| years   | 1 %     | 0,02            |
| units   | 0,5 %   | 0,5 Stück       |

Eingaben werden deutsch geparst: `1.234,56`, `1234,56`, `1234.56`, `12,5 %`, `€1.200`.

## Befehle

```bash
npm run dev        # Entwicklung
npm run build      # Produktionsbuild
npm run typecheck  # tsc --noEmit
npm run verify     # baut jede Aufgabe mit 200 Seeds, prüft auf NaN/Infinity/Platzhalter
```

`npm run verify` vor jedem Commit an den Aufgaben laufen lassen.
