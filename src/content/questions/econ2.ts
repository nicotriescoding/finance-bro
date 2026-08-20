import type { Question } from "@/lib/questions/types";
import { eur, n2, pct } from "./_helpers";

export const econ2Questions: Question[] = [
    {
        id: "e2-vgr-definition",
        subject: "econ2", topic: "national_accounts", difficulty: "easy", kind: "choice",
        prompt: "Welche Position geht **nicht** in das BIP nach der Verwendungsrechnung ein?",
        choices: [
            "Der Kauf einer gebrauchten Maschine von einem anderen inländischen Unternehmen.",
            "Konsumausgaben der privaten Haushalte.",
            "Bruttoanlageinvestitionen der Unternehmen.",
            "Exporte abzüglich Importe.",
        ],
        correct: 0,
        explanation: "Das BIP misst die in der Periode neu produzierte Wertschöpfung. Der Handel mit Gebrauchtgütern ist nur ein Vermögenstransfer.",
    },
    {
        id: "e2-vgr-calc",
        subject: "econ2", topic: "national_accounts", difficulty: "medium", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const C = rng.int(600, 1200) * 1_000_000;
            const I = rng.int(150, 400) * 1_000_000;
            const G = rng.int(150, 400) * 1_000_000;
            const X = rng.int(200, 500) * 1_000_000;
            const M = rng.int(150, 480) * 1_000_000;
            const answer = C + I + G + X - M;
            return {
                prompt: `Konsum ${eur(C)}, Investitionen ${eur(I)}, Staatsausgaben ${eur(G)}, Exporte ${eur(X)}, Importe ${eur(M)}. Wie hoch ist das **BIP**?`,
                given: { C: eur(C), I: eur(I), G: eur(G), X: eur(X), M: eur(M) },
                answer,
                explanation: `BIP = C + I + G + (X − M) = ${eur(answer)}`,
            };
        },
    },
    {
        id: "e2-inflation-real",
        subject: "econ2", topic: "inflation", difficulty: "medium", kind: "numeric", unit: "percent",
        build: (rng) => {
            const nominal = rng.int(3, 12);
            const inflation = rng.int(1, 9);
            const answer = ((1 + nominal / 100) / (1 + inflation / 100) - 1) * 100;
            return {
                prompt: `Der Nominalzins beträgt ${pct(nominal)}, die Inflationsrate ${pct(inflation)}. Wie hoch ist der **exakte Realzins** (Fisher-Gleichung)?`,
                given: { Nominalzins: pct(nominal), Inflation: pct(inflation) },
                answer,
                explanation: `(1+i) = (1+r)(1+π) → r = (1+i)/(1+π) − 1 = ${pct(answer)}`,
            };
        },
    },
    {
        id: "e2-inflation-deflator",
        subject: "econ2", topic: "inflation", difficulty: "medium", kind: "choice",
        prompt: "Worin unterscheidet sich der BIP-Deflator vom Verbraucherpreisindex (VPI)?",
        choices: [
            "Der Deflator erfasst alle im Inland produzierten Güter, der VPI einen festen Warenkorb inklusive Importgütern.",
            "Der Deflator verwendet einen festen Warenkorb, der VPI einen variablen.",
            "Beide messen exakt dasselbe, nur in anderen Einheiten.",
            "Der VPI enthält Investitionsgüter, der Deflator nicht.",
        ],
        correct: 0,
        explanation: "Der Deflator ist ein Paasche-Index über die inländische Produktion; der VPI ein Laspeyres-Index über einen festen Konsumwarenkorb, der auch Importe enthält.",
    },
    {
        id: "e2-labour-rate",
        subject: "econ2", topic: "labour", difficulty: "easy", kind: "numeric", unit: "percent",
        build: (rng) => {
            const employed = rng.int(3000, 4500);
            const unemployed = rng.int(100, 400);
            const answer = (unemployed / (employed + unemployed)) * 100;
            return {
                prompt: `In einer Volkswirtschaft sind ${employed} Tsd. Personen erwerbstätig und ${unemployed} Tsd. arbeitslos. Wie hoch ist die **Arbeitslosenquote**?`,
                given: { Erwerbstätige: `${employed} Tsd.`, Arbeitslose: `${unemployed} Tsd.` },
                answer,
                explanation: `u = AL/(ET + AL) = ${pct(answer)}`,
            };
        },
    },
    {
        id: "e2-labour-phillips",
        subject: "econ2", topic: "labour", difficulty: "hard", kind: "choice",
        prompt: "Was besagt die um Erwartungen erweiterte Phillips-Kurve langfristig?",
        choices: [
            "Es gibt keinen dauerhaften Trade-off zwischen Inflation und Arbeitslosigkeit; die Arbeitslosigkeit kehrt zur natürlichen Rate zurück.",
            "Höhere Inflation senkt die Arbeitslosigkeit dauerhaft.",
            "Inflation und Arbeitslosigkeit steigen langfristig immer gemeinsam.",
            "Die Erwartungen der Haushalte spielen keine Rolle.",
        ],
        correct: 0,
        explanation: "Sobald die Inflationserwartungen angepasst sind, ist die langfristige Phillips-Kurve senkrecht bei der natürlichen Arbeitslosenquote.",
    },
    {
        id: "e2-monetary-tools",
        subject: "econ2", topic: "monetary", difficulty: "easy", kind: "choice",
        prompt: "Die Zentralbank will die Inflation bekämpfen. Welche Maßnahme passt?",
        choices: [
            "Leitzins anheben und dem Markt Liquidität entziehen.",
            "Leitzins senken und Anleihen ankaufen.",
            "Mindestreservesatz senken.",
            "Die Staatsausgaben erhöhen.",
        ],
        correct: 0,
        explanation: "Restriktive Geldpolitik: höherer Leitzins, weniger Liquidität. Staatsausgaben sind Fiskal-, nicht Geldpolitik.",
    },
    {
        id: "e2-monetary-multiplier",
        subject: "econ2", topic: "monetary", difficulty: "medium", kind: "numeric", unit: "ratio",
        build: (rng) => {
            const rr = rng.pick([1, 2, 4, 5, 10, 20]);
            const answer = 1 / (rr / 100);
            return {
                prompt: `Der Mindestreservesatz beträgt ${pct(rr)}. Wie hoch ist der **einfache Geldschöpfungsmultiplikator**?`,
                given: { Mindestreservesatz: pct(rr) },
                answer,
                explanation: `m = 1/r = 1/${n2(rr / 100)} = ${n2(answer)}`,
            };
        },
    },
    {
        id: "e2-fiscal-multiplier",
        subject: "econ2", topic: "fiscal", difficulty: "medium", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const mpc = rng.pick([0.5, 0.6, 0.7, 0.75, 0.8]);
            const dG = rng.int(5, 50) * 1_000_000;
            const answer = dG * (1 / (1 - mpc));
            return {
                prompt: `Die marginale Konsumquote beträgt ${n2(mpc)}. Der Staat erhöht seine Ausgaben um ${eur(dG)}. Um wie viel steigt das Einkommen im einfachen Keynes-Modell?`,
                given: { "MPC (c)": n2(mpc), "ΔG": eur(dG) },
                answer,
                explanation: `ΔY = ΔG · 1/(1 − c) = ${eur(dG)} · ${n2(1 / (1 - mpc))} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "e2-fiscal-crowding",
        subject: "econ2", topic: "fiscal", difficulty: "hard", kind: "choice",
        prompt: "Was beschreibt der Crowding-out-Effekt?",
        choices: [
            "Kreditfinanzierte Staatsausgaben treiben den Zins hoch und verdrängen private Investitionen.",
            "Der Staat verdrängt private Anbieter durch günstigere Preise.",
            "Importe verdrängen inländische Produktion.",
            "Die Zentralbank verdrängt Geschäftsbanken aus dem Kreditgeschäft.",
        ],
        correct: 0,
        explanation: "Höhere staatliche Kreditnachfrage erhöht den Zins, private Investitionen werden dadurch teurer und gehen zurück.",
    },
    {
        id: "e2-open-real-exchange",
        subject: "econ2", topic: "open_economy", difficulty: "hard", kind: "choice",
        prompt: "Der reale Wechselkurs eines Landes steigt (reale Aufwertung). Was folgt typischerweise?",
        choices: [
            "Exporte werden relativ teurer, der Nettoexport sinkt.",
            "Exporte werden billiger, der Nettoexport steigt.",
            "Der Nettoexport bleibt unverändert.",
            "Die Importpreise steigen.",
        ],
        correct: 0,
        explanation: "Reale Aufwertung = inländische Güter werden im Vergleich zum Ausland teurer → Exporte sinken, Importe steigen.",
    },
    {
        id: "e2-growth-solow",
        subject: "econ2", topic: "growth", difficulty: "hard", kind: "choice",
        prompt: "Was gilt im Steady State des Solow-Modells ohne technischen Fortschritt?",
        choices: [
            "Das Pro-Kopf-Einkommen wächst nicht mehr; die Investitionen decken genau Abschreibung und Bevölkerungswachstum.",
            "Das Pro-Kopf-Einkommen wächst mit der Sparquote.",
            "Der Kapitalstock je Kopf wächst unbegrenzt.",
            "Die Abschreibungen sind null.",
        ],
        correct: 0,
        explanation: "Im Steady State gilt s·f(k) = (δ + n)·k — das Pro-Kopf-Kapital und damit das Pro-Kopf-Einkommen sind konstant.",
    },
];
