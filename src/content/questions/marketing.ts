import type { Question } from "@/lib/questions/types";
import { eur, n2, pct } from "./_helpers";

export const marketingQuestions: Question[] = [
    {
        id: "mk-stp-order",
        subject: "marketing", topic: "basics_stp", difficulty: "easy", kind: "choice",
        prompt: "In welcher Reihenfolge läuft der STP-Prozess ab?",
        choices: [
            "Segmentierung → Targeting → Positionierung",
            "Targeting → Segmentierung → Positionierung",
            "Positionierung → Segmentierung → Targeting",
            "Segmentierung → Positionierung → Targeting",
        ],
        correct: 0,
        explanation: "Erst den Markt aufteilen, dann attraktive Segmente auswählen, dann im Kopf der Zielgruppe positionieren.",
    },
    {
        id: "mk-stp-criteria",
        subject: "marketing", topic: "basics_stp", difficulty: "medium", kind: "choice",
        prompt: "Welche Anforderung muss ein sinnvolles Marktsegment **nicht** erfüllen?",
        choices: [
            "Es muss möglichst viele unterschiedliche Kundentypen enthalten.",
            "Es muss messbar sein.",
            "Es muss über die gewählten Kanäle erreichbar sein.",
            "Es muss wirtschaftlich substanziell sein.",
        ],
        correct: 0,
        explanation: "Segmente sollen intern **homogen** und untereinander heterogen sein — nicht möglichst gemischt.",
    },
    {
        id: "mk-research-primary",
        subject: "marketing", topic: "research", difficulty: "easy", kind: "choice",
        prompt: "Was ist ein Beispiel für **Sekundärforschung**?",
        choices: [
            "Auswertung bereits vorhandener Branchenstatistiken und interner Verkaufszahlen.",
            "Durchführung einer eigenen Kundenbefragung.",
            "Ein selbst durchgeführtes Fokusgruppeninterview.",
            "Ein A/B-Test auf der eigenen Website.",
        ],
        correct: 0,
        explanation: "Sekundärforschung nutzt bereits erhobene Daten; Primärforschung erhebt neue Daten für die konkrete Fragestellung.",
    },
    {
        id: "mk-research-bias",
        subject: "marketing", topic: "research", difficulty: "hard", kind: "choice",
        prompt: "Eine Umfrage wird nur unter bestehenden Kunden durchgeführt und daraus auf den Gesamtmarkt geschlossen. Welcher Fehler liegt vor?",
        choices: [
            "Stichprobenverzerrung (Selection Bias) — die Stichprobe ist nicht repräsentativ für den Gesamtmarkt.",
            "Ein reiner Messfehler des Fragebogens.",
            "Ein Fehler in der Datenauswertung.",
            "Kein Fehler, Bestandskunden sind der beste Indikator.",
        ],
        correct: 0,
        explanation: "Wer bereits Kunde ist, hat sich bewusst für das Produkt entschieden — Nichtkäufer und ihre Gründe fehlen vollständig.",
    },
    {
        id: "mk-product-lifecycle",
        subject: "marketing", topic: "product", difficulty: "medium", kind: "choice",
        prompt: "In welcher Phase des Produktlebenszyklus ist der Gewinn typischerweise am höchsten?",
        choices: [
            "Reifephase",
            "Einführungsphase",
            "Wachstumsphase",
            "Degenerationsphase",
        ],
        correct: 0,
        explanation: "In der Reife sind Umsätze hoch und die Stückkosten durch Erfahrungskurveneffekte niedrig; der Umsatzhöhepunkt liegt am Ende der Reife.",
    },
    {
        id: "mk-product-bcg",
        subject: "marketing", topic: "product", difficulty: "medium", kind: "choice",
        prompt: "Ein Produkt hat hohen relativen Marktanteil in einem langsam wachsenden Markt. Wie heißt es in der BCG-Matrix?",
        choices: [
            "Cash Cow",
            "Star",
            "Question Mark",
            "Poor Dog",
        ],
        correct: 0,
        explanation: "Hoher Marktanteil + geringes Wachstum = Cash Cow: finanziert die Stars und Question Marks.",
    },
    {
        id: "mk-pricing-breakeven",
        subject: "marketing", topic: "pricing", difficulty: "medium", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const kv = rng.int(5, 80);
            const marge = rng.int(20, 120);
            const answer = kv * (1 + marge / 100);
            return {
                prompt: `Die variablen Stückkosten betragen ${eur(kv)}. Es wird ein Aufschlag von ${pct(marge)} kalkuliert. Wie hoch ist der **Angebotspreis** (Cost-plus)?`,
                given: { "variable Stückkosten": eur(kv), Aufschlag: pct(marge) },
                answer,
                explanation: `p = k_v · (1 + Aufschlag) = ${eur(answer)}`,
            };
        },
    },
    {
        id: "mk-pricing-skimming",
        subject: "marketing", topic: "pricing", difficulty: "medium", kind: "choice",
        prompt: "Wann ist eine **Skimming**-Preisstrategie sinnvoll?",
        choices: [
            "Bei innovativen Produkten mit zahlungsbereiten Erstkäufern und geringem kurzfristigen Wettbewerbsdruck.",
            "Wenn schnell hohe Marktanteile gegen viele Wettbewerber gewonnen werden sollen.",
            "Bei stark preiselastischer Nachfrage und hohen Skaleneffekten.",
            "Bei homogenen Massengütern.",
        ],
        correct: 0,
        explanation: "Skimming schöpft zuerst die hohe Zahlungsbereitschaft ab und senkt den Preis schrittweise. Der Gegenpol ist die Penetrationsstrategie.",
    },
    {
        id: "mk-distribution",
        subject: "marketing", topic: "distribution", difficulty: "easy", kind: "choice",
        prompt: "Was kennzeichnet den **indirekten** Vertrieb?",
        choices: [
            "Der Absatz erfolgt über rechtlich selbstständige Absatzmittler wie Groß- und Einzelhandel.",
            "Der Hersteller verkauft ausschließlich über den eigenen Onlineshop.",
            "Der Außendienst des Herstellers besucht die Endkunden persönlich.",
            "Es gibt gar keine Handelsstufe zwischen Hersteller und Kunde.",
        ],
        correct: 0,
        explanation: "Indirekter Vertrieb schaltet selbstständige Absatzmittler ein; direkter Vertrieb verkauft ohne Zwischenstufe an den Endkunden.",
    },
    {
        id: "mk-communication-aida",
        subject: "marketing", topic: "communication", difficulty: "very_easy", kind: "choice",
        prompt: "Wofür steht das A am Ende des AIDA-Modells?",
        choices: [
            "Action",
            "Awareness",
            "Attitude",
            "Advertising",
        ],
        correct: 0,
        explanation: "Attention → Interest → Desire → Action.",
    },
    {
        id: "mk-communication-push-pull",
        subject: "marketing", topic: "communication", difficulty: "medium", kind: "choice",
        prompt: "Was beschreibt eine **Pull**-Strategie?",
        choices: [
            "Der Hersteller bewirbt das Produkt direkt beim Endkunden, damit dieser es beim Handel nachfragt.",
            "Der Hersteller gewährt dem Handel Rabatte, damit dieser das Produkt listet.",
            "Der Handel bewirbt das Produkt aus eigener Initiative.",
            "Das Produkt wird ausschließlich über Außendienstmitarbeiter verkauft.",
        ],
        correct: 0,
        explanation: "Pull zieht die Nachfrage über den Endkunden durch den Kanal; Push drückt die Ware über Handelsanreize in den Kanal.",
    },
    {
        id: "mk-clv",
        subject: "marketing", topic: "clv", difficulty: "hard", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const db = rng.int(20, 300);
            const retention = rng.int(60, 92);
            const r = rng.int(5, 12);
            const answer = db * ((retention / 100) / (1 + r / 100 - retention / 100));
            return {
                prompt: `Ein Kunde erzeugt jährlich ${eur(db)} Deckungsbeitrag. Die Retention Rate beträgt ${pct(retention)}, der Kalkulationszins ${pct(r)}. Wie hoch ist der **Customer Lifetime Value** (ohne Akquisitionskosten, nachschüssig)?`,
                given: { "DB p. a.": eur(db), Retention: pct(retention), Diskontsatz: pct(r) },
                answer,
                explanation: `CLV = DB · r_ret/(1 + i − r_ret) = ${eur(answer)}`,
            };
        },
    },
    {
        id: "mk-cac-ratio",
        subject: "marketing", topic: "clv", difficulty: "medium", kind: "numeric", unit: "ratio",
        build: (rng) => {
            const clv = rng.int(200, 3000);
            const cac = rng.int(50, 900);
            const answer = clv / cac;
            return {
                prompt: `Der CLV beträgt ${eur(clv)}, die Kundenakquisitionskosten ${eur(cac)}. Wie hoch ist das **CLV/CAC-Verhältnis**?`,
                given: { CLV: eur(clv), CAC: eur(cac) },
                answer,
                explanation: `CLV/CAC = ${n2(answer)} — als Faustregel gilt ein Wert ab 3 als gesund.`,
            };
        },
    },
    {
        id: "mk-digital-roas",
        subject: "marketing", topic: "digital", difficulty: "easy", kind: "numeric", unit: "ratio",
        build: (rng) => {
            const spend = rng.int(500, 20000);
            const revenue = Math.round(spend * rng.float(0.6, 6, 2));
            const answer = revenue / spend;
            return {
                prompt: `Eine Kampagne kostet ${eur(spend)} und erzeugt ${eur(revenue)} Umsatz. Wie hoch ist der **ROAS**?`,
                given: { "Ad Spend": eur(spend), Umsatz: eur(revenue) },
                answer,
                explanation: `ROAS = Umsatz / Ad Spend = ${n2(answer)}`,
            };
        },
    },
    {
        id: "mk-digital-cpa",
        subject: "marketing", topic: "digital", difficulty: "medium", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const impressions = rng.int(50, 900) * 1000;
            const ctr = rng.float(0.5, 5, 2);
            const cr = rng.float(1, 10, 2);
            const cpm = rng.float(3, 25, 2);
            const clicks = impressions * (ctr / 100);
            const conversions = clicks * (cr / 100);
            const spend = (impressions / 1000) * cpm;
            const answer = spend / conversions;
            return {
                prompt: `${n2(impressions / 1000)} Tsd. Impressions bei einem TKP von ${eur(cpm)}, CTR ${pct(ctr)}, Conversion Rate ${pct(cr)}. Wie hoch sind die **Kosten je Conversion (CPA)**?`,
                given: { Impressions: n2(impressions), TKP: eur(cpm), CTR: pct(ctr), "Conversion Rate": pct(cr) },
                answer,
                explanation: `Spend = ${eur(spend)}; Klicks = ${n2(clicks)}; Conversions = ${n2(conversions)}; CPA = ${eur(answer)}`,
            };
        },
    },
];
