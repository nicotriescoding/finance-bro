import type { Question } from "@/lib/questions/types";
import { eur, n2, pct } from "./_helpers";

export const entrepreneurshipQuestions: Question[] = [
    {
        id: "en-opp-effectuation",
        subject: "entrepreneurship", topic: "opportunity", difficulty: "medium", kind: "choice",
        prompt: "Was unterscheidet **Effectuation** von **Causation**?",
        choices: [
            "Effectuation startet bei den vorhandenen Mitteln und formt daraus Ziele; Causation startet beim Ziel und beschafft die nötigen Mittel.",
            "Effectuation ist die Planung mit vollständigen Marktdaten, Causation ohne.",
            "Causation wird nur von Startups verwendet, Effectuation nur von Konzernen.",
            "Es sind zwei Bezeichnungen für denselben Planungsprozess.",
        ],
        correct: 0,
        explanation: "Sarasvathy: Effectuation ist mittelorientiert und iterativ (leistbarer Verlust, Partnerschaften), Causation zielorientiert und planbasiert.",
    },
    {
        id: "en-bmc-blocks",
        subject: "entrepreneurship", topic: "business_model", difficulty: "easy", kind: "choice",
        prompt: "Welches Element gehört **nicht** zu den neun Bausteinen des Business Model Canvas?",
        choices: [
            "Wettbewerbsanalyse",
            "Value Proposition",
            "Key Activities",
            "Revenue Streams",
        ],
        correct: 0,
        explanation: "Die neun Bausteine sind Customer Segments, Value Proposition, Channels, Customer Relationships, Revenue Streams, Key Resources, Key Activities, Key Partners, Cost Structure. Wettbewerbsanalyse ist kein Baustein.",
    },
    {
        id: "en-lean-mvp",
        subject: "entrepreneurship", topic: "lean_startup", difficulty: "easy", kind: "choice",
        prompt: "Was ist der Zweck eines MVP im Lean-Startup-Ansatz?",
        choices: [
            "Mit minimalem Aufwand maximal validiertes Lernen über eine Hypothese zu erzeugen.",
            "Ein fertiges Produkt mit allen geplanten Features auszuliefern.",
            "Möglichst schnell Umsatz zu maximieren.",
            "Investoren einen fertigen Prototyp zu präsentieren.",
        ],
        correct: 0,
        explanation: "Das MVP dient dem Build-Measure-Learn-Zyklus: es testet die riskanteste Annahme mit dem geringsten Aufwand.",
    },
    {
        id: "en-lean-pivot",
        subject: "entrepreneurship", topic: "lean_startup", difficulty: "medium", kind: "choice",
        prompt: "Wann sollte ein Startup laut Lean Startup einen Pivot in Betracht ziehen?",
        choices: [
            "Wenn die Kernhypothese trotz mehrerer Iterationen nicht validiert werden konnte.",
            "Sobald der erste Kunde abspringt.",
            "Wenn ein Wettbewerber ein ähnliches Produkt startet.",
            "Nach einer festgelegten Anzahl von Monaten, unabhängig von den Daten.",
        ],
        correct: 0,
        explanation: "Ein Pivot ist eine strukturierte Kurskorrektur, wenn die Messdaten die zentrale Annahme wiederholt widerlegen.",
    },
    {
        id: "en-market-som",
        subject: "entrepreneurship", topic: "market_sizing", difficulty: "medium", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const tam = rng.int(500, 5000) * 1_000_000;
            const samShare = rng.int(10, 40);
            const somShare = rng.int(2, 15);
            const sam = tam * (samShare / 100);
            const answer = sam * (somShare / 100);
            return {
                prompt: `Der TAM beträgt ${eur(tam)}. Davon sind ${pct(samShare)} realistisch erreichbar (SAM). Von diesem SAM will das Startup ${pct(somShare)} Marktanteil gewinnen. Wie groß ist der **SOM**?`,
                given: { TAM: eur(tam), "SAM-Anteil": pct(samShare), "Anteil am SAM": pct(somShare) },
                answer,
                explanation: `SAM = ${eur(sam)}; SOM = SAM · ${n2(somShare / 100)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "en-market-approach",
        subject: "entrepreneurship", topic: "market_sizing", difficulty: "medium", kind: "choice",
        prompt: "Was kennzeichnet den **Bottom-up**-Ansatz der Marktgrößenschätzung?",
        choices: [
            "Hochrechnung aus Kundenanzahl × Kauffrequenz × Preis auf Basis eigener Annahmen.",
            "Übernahme einer Marktstudie und Ableitung eines Prozentsatzes daraus.",
            "Schätzung anhand des Bruttoinlandsprodukts.",
            "Befragung der Wettbewerber nach ihren Umsätzen.",
        ],
        correct: 0,
        explanation: "Bottom-up rechnet von konkreten Einheiten hoch und ist für Investoren meist überzeugender als eine Top-down-Ableitung aus Marktstudien.",
    },
    {
        id: "en-funding-stages",
        subject: "entrepreneurship", topic: "funding", difficulty: "easy", kind: "choice",
        prompt: "Welche Finanzierungsquelle ist typischerweise die **früheste** externe Quelle?",
        choices: [
            "Business Angels",
            "Later-Stage-Growth-Fonds",
            "Börsengang (IPO)",
            "Konsortialkredit einer Geschäftsbank",
        ],
        correct: 0,
        explanation: "Reihenfolge grob: Bootstrapping / FFF → Business Angels → Seed-VC → Series A/B/C → Growth → IPO.",
    },
    {
        id: "en-funding-runway",
        subject: "entrepreneurship", topic: "funding", difficulty: "easy", kind: "numeric", unit: "number",
        build: (rng) => {
            const cash = rng.int(200, 3000) * 1000;
            const burn = rng.int(20, 250) * 1000;
            const answer = cash / burn;
            return {
                prompt: `Ein Startup hat ${eur(cash)} auf dem Konto bei einer monatlichen Netto-Burn-Rate von ${eur(burn)}. Wie viele **Monate Runway** bleiben?`,
                given: { Liquidität: eur(cash), "Burn Rate p. M.": eur(burn) },
                answer,
                explanation: `Runway = Cash / Burn = ${n2(answer)} Monate`,
            };
        },
    },
    {
        id: "en-cap-dilution",
        subject: "entrepreneurship", topic: "cap_table", difficulty: "hard", kind: "numeric", unit: "percent",
        build: (rng) => {
            const preMoney = rng.int(2, 20) * 1_000_000;
            const invest = rng.int(200, 3000) * 1000;
            const founderBefore = rng.int(55, 95);
            const postMoney = preMoney + invest;
            const answer = founderBefore * (preMoney / postMoney);
            return {
                prompt: `Die Gründer halten ${pct(founderBefore)}. Bei einer Pre-Money-Bewertung von ${eur(preMoney)} investiert ein VC ${eur(invest)}. Wie hoch ist der **Gründeranteil nach der Runde**?`,
                given: { "Anteil vorher": pct(founderBefore), "Pre-Money": eur(preMoney), Investment: eur(invest) },
                answer,
                explanation: `Post-Money = ${eur(postMoney)}; Verwässerungsfaktor = Pre/Post = ${n2(preMoney / postMoney)}; neuer Anteil = ${pct(answer)}`,
            };
        },
    },
    {
        id: "en-cap-postmoney",
        subject: "entrepreneurship", topic: "cap_table", difficulty: "medium", kind: "numeric", unit: "percent",
        build: (rng) => {
            const preMoney = rng.int(1, 15) * 1_000_000;
            const invest = rng.int(100, 2500) * 1000;
            const answer = (invest / (preMoney + invest)) * 100;
            return {
                prompt: `Pre-Money-Bewertung ${eur(preMoney)}, Investment ${eur(invest)}. Welchen **Anteil** erhält der Investor?`,
                given: { "Pre-Money": eur(preMoney), Investment: eur(invest) },
                answer,
                explanation: `Anteil = Investment / (Pre-Money + Investment) = ${pct(answer)}`,
            };
        },
    },
    {
        id: "en-valuation-vc",
        subject: "entrepreneurship", topic: "startup_valuation", difficulty: "very_hard", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const exitValue = rng.int(20, 200) * 1_000_000;
            const targetReturn = rng.pick([5, 8, 10, 15, 20]);
            const invest = rng.int(500, 5000) * 1000;
            const postMoney = exitValue / targetReturn;
            const answer = postMoney - invest;
            return {
                prompt: `VC-Methode: erwarteter Exit-Erlös ${eur(exitValue)}, geforderter Multiple ${targetReturn}x, Investment ${eur(invest)}. Wie hoch ist die **Pre-Money-Bewertung**?`,
                given: { Exit: eur(exitValue), "Ziel-Multiple": `${targetReturn}x`, Investment: eur(invest) },
                answer,
                explanation: `Post-Money = Exit / Multiple = ${eur(postMoney)}; Pre-Money = Post − Investment = ${eur(answer)}`,
            };
        },
    },
    {
        id: "en-valuation-why-dcf-fails",
        subject: "entrepreneurship", topic: "startup_valuation", difficulty: "medium", kind: "choice",
        prompt: "Warum ist ein klassisches DCF-Modell für Frühphasen-Startups problematisch?",
        choices: [
            "Die Cashflows sind hochgradig unsicher und der Terminal Value dominiert den gesamten Wert.",
            "Weil DCF für nicht börsennotierte Unternehmen rechtlich unzulässig ist.",
            "Weil Startups keine Kapitalkosten haben.",
            "Weil DCF nur bei negativen Cashflows funktioniert.",
        ],
        correct: 0,
        explanation: "Ohne belastbare Historie sind Prognosen sehr unsicher; fast der gesamte Barwert steckt im Terminal Value, der Wert reagiert extrem sensitiv auf Annahmen.",
    },
    {
        id: "en-legal-gmbh",
        subject: "entrepreneurship", topic: "legal_team", difficulty: "easy", kind: "choice",
        prompt: "Welche Aussage zur GmbH ist korrekt?",
        choices: [
            "Die Haftung ist grundsätzlich auf das Gesellschaftsvermögen beschränkt; das Mindeststammkapital beträgt 25.000 €.",
            "Die Gesellschafter haften stets unbeschränkt mit ihrem Privatvermögen.",
            "Es ist kein Stammkapital erforderlich.",
            "Eine GmbH kann nur von mindestens drei Personen gegründet werden.",
        ],
        correct: 0,
        explanation: "§ 5 GmbHG: Mindeststammkapital 25.000 €, mindestens die Hälfte bei Anmeldung eingezahlt. Ein-Personen-GmbH ist zulässig.",
    },
    {
        id: "en-legal-vesting",
        subject: "entrepreneurship", topic: "legal_team", difficulty: "medium", kind: "choice",
        prompt: "Wozu dient eine **Vesting**-Klausel im Gründerteam?",
        choices: [
            "Anteile werden erst über die Zeit endgültig verdient, damit ein früh ausscheidender Gründer nicht den vollen Anteil behält.",
            "Sie sichert dem Investor ein Vetorecht bei allen Entscheidungen.",
            "Sie legt die Höhe der Gründergehälter fest.",
            "Sie verpflichtet die Gründer zu einer Mindestarbeitszeit pro Woche.",
        ],
        correct: 0,
        explanation: "Typisch sind 4 Jahre Vesting mit 1 Jahr Cliff — Schutz für das verbleibende Team und für Investoren.",
    },
];
