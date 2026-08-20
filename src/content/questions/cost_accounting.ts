import type { Question } from "@/lib/questions/types";
import { eur, n2, pct } from "./_helpers";

export const costAccountingQuestions: Question[] = [
    {
        id: "ca-types-split",
        subject: "cost_accounting", topic: "cost_types", difficulty: "easy", kind: "choice",
        prompt: "Welche Kostenart ist ein typisches Beispiel für **Einzelkosten**?",
        choices: [
            "Fertigungsmaterial, das direkt einem Produkt zurechenbar ist.",
            "Die Miete der Verwaltungszentrale.",
            "Das Gehalt des Geschäftsführers.",
            "Die Abschreibung auf das Bürogebäude.",
        ],
        correct: 0,
        explanation: "Einzelkosten lassen sich einem Kostenträger direkt zurechnen. Alle genannten Alternativen sind Gemeinkosten.",
    },
    {
        id: "ca-types-degression",
        subject: "cost_accounting", topic: "cost_types", difficulty: "medium", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const fix = rng.int(50, 400) * 100;
            const q1 = rng.int(100, 400);
            const q2 = q1 * rng.int(2, 4);
            const answer = fix / q1 - fix / q2;
            return {
                prompt: `Die Fixkosten betragen ${eur(fix)}. Die Ausbringungsmenge steigt von ${q1} auf ${q2} Stück. Um wie viel € sinken die **Fixkosten je Stück** (Fixkostendegression)?`,
                given: { Fixkosten: eur(fix), "Menge alt": `${q1} Stück`, "Menge neu": `${q2} Stück` },
                answer,
                explanation: `${eur(fix / q1)} − ${eur(fix / q2)} = ${eur(answer)} je Stück`,
            };
        },
    },
    {
        id: "ca-bab-zuschlag",
        subject: "cost_accounting", topic: "cost_centers", difficulty: "medium", kind: "numeric", unit: "percent",
        build: (rng) => {
            const gk = rng.int(40, 300) * 1000;
            const basis = rng.int(100, 600) * 1000;
            const answer = (gk / basis) * 100;
            return {
                prompt: `Die Fertigungsgemeinkosten betragen ${eur(gk)}, die Fertigungslöhne (Zuschlagsbasis) ${eur(basis)}. Wie hoch ist der **Fertigungsgemeinkostenzuschlagssatz**?`,
                given: { Fertigungsgemeinkosten: eur(gk), Fertigungslöhne: eur(basis) },
                answer,
                explanation: `Zuschlagssatz = GK/Basis · 100 = ${pct(answer)}`,
            };
        },
    },
    {
        id: "ca-bab-purpose",
        subject: "cost_accounting", topic: "cost_centers", difficulty: "easy", kind: "choice",
        prompt: "Wozu dient der Betriebsabrechnungsbogen (BAB)?",
        choices: [
            "Zur Verteilung der Gemeinkosten auf Kostenstellen und zur Ermittlung von Zuschlagssätzen.",
            "Zur Ermittlung der Einzelkosten je Produkt.",
            "Zur Aufstellung der Handelsbilanz.",
            "Zur Berechnung der Umsatzsteuer.",
        ],
        correct: 0,
        explanation: "Der BAB ist das Instrument der Kostenstellenrechnung: Gemeinkostenverteilung, innerbetriebliche Leistungsverrechnung, Zuschlagssätze.",
    },
    {
        id: "ca-objects-zuschlag",
        subject: "cost_accounting", topic: "cost_objects", difficulty: "hard", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const mek = rng.int(20, 120);
            const mgkSatz = rng.int(5, 20);
            const fek = rng.int(20, 150);
            const fgkSatz = rng.int(80, 250);
            const vvSatz = rng.int(10, 30);
            const hk = mek * (1 + mgkSatz / 100) + fek * (1 + fgkSatz / 100);
            const answer = hk * (1 + vvSatz / 100);
            return {
                prompt: `Zuschlagskalkulation je Stück: Materialeinzelkosten ${eur(mek)}, MGK-Zuschlag ${pct(mgkSatz)}, Fertigungseinzelkosten ${eur(fek)}, FGK-Zuschlag ${pct(fgkSatz)}, Verwaltungs- und Vertriebszuschlag ${pct(vvSatz)} auf die Herstellkosten. Wie hoch sind die **Selbstkosten je Stück**?`,
                given: { MEK: eur(mek), "MGK-Satz": pct(mgkSatz), FEK: eur(fek), "FGK-Satz": pct(fgkSatz), "VwVt-Satz": pct(vvSatz) },
                answer,
                explanation: `Herstellkosten = ${eur(hk)}; Selbstkosten = HK · (1 + ${n2(vvSatz / 100)}) = ${eur(answer)}`,
            };
        },
    },
    {
        id: "ca-full-vs-direct",
        subject: "cost_accounting", topic: "full_vs_direct", difficulty: "medium", kind: "choice",
        prompt: "Warum kann die Vollkostenrechnung bei kurzfristigen Entscheidungen zu Fehlentscheidungen führen?",
        choices: [
            "Weil sie Fixkosten proportionalisiert und dadurch Aufträge ablehnt, die einen positiven Deckungsbeitrag liefern.",
            "Weil sie die variablen Kosten ignoriert.",
            "Weil sie nur Einzelkosten berücksichtigt.",
            "Weil sie zwingend gegen das HGB verstößt.",
        ],
        correct: 0,
        explanation: "Fixkosten fallen kurzfristig ohnehin an. Entscheidungsrelevant ist der Deckungsbeitrag, nicht der Vollkostensatz.",
    },
    {
        id: "ca-db-unit",
        subject: "cost_accounting", topic: "contribution_margin", difficulty: "very_easy", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const p = rng.int(20, 200);
            const kv = rng.int(5, p - 3);
            const answer = p - kv;
            return {
                prompt: `Der Verkaufspreis beträgt ${eur(p)}, die variablen Stückkosten ${eur(kv)}. Wie hoch ist der **Stückdeckungsbeitrag**?`,
                given: { Verkaufspreis: eur(p), "variable Stückkosten": eur(kv) },
                answer,
                explanation: `db = p − k_v = ${eur(answer)}`,
            };
        },
    },
    {
        id: "ca-breakeven",
        subject: "cost_accounting", topic: "contribution_margin", difficulty: "medium", kind: "numeric", unit: "units",
        build: (rng) => {
            const fix = rng.int(20, 300) * 1000;
            const p = rng.int(30, 250);
            const kv = rng.int(10, p - 5);
            const answer = fix / (p - kv);
            return {
                prompt: `Fixkosten ${eur(fix)}, Verkaufspreis ${eur(p)}, variable Stückkosten ${eur(kv)}. Wie viele Stück müssen verkauft werden, um die **Gewinnschwelle** zu erreichen?`,
                given: { Fixkosten: eur(fix), Preis: eur(p), "k_var": eur(kv) },
                answer,
                explanation: `x_BE = K_fix/(p − k_v) = ${eur(fix)}/${eur(p - kv)} = ${n2(answer)} Stück`,
            };
        },
    },
    {
        id: "ca-target-profit",
        subject: "cost_accounting", topic: "contribution_margin", difficulty: "hard", kind: "numeric", unit: "units",
        build: (rng) => {
            const fix = rng.int(30, 250) * 1000;
            const ziel = rng.int(10, 150) * 1000;
            const p = rng.int(40, 200);
            const kv = rng.int(10, p - 8);
            const answer = (fix + ziel) / (p - kv);
            return {
                prompt: `Fixkosten ${eur(fix)}, Zielgewinn ${eur(ziel)}, Preis ${eur(p)}, variable Stückkosten ${eur(kv)}. Wie viele Stück müssen verkauft werden?`,
                given: { Fixkosten: eur(fix), Zielgewinn: eur(ziel), Preis: eur(p), "k_var": eur(kv) },
                answer,
                explanation: `x = (K_fix + Zielgewinn)/db = ${n2(answer)} Stück`,
            };
        },
    },
    {
        id: "ca-variance-price",
        subject: "cost_accounting", topic: "variance", difficulty: "hard", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const planPreis = rng.int(5, 40);
            const istPreis = planPreis + rng.int(-4, 6);
            const istMenge = rng.int(500, 5000);
            const answer = (istPreis - planPreis) * istMenge;
            return {
                prompt: `Planpreis je Einheit ${eur(planPreis)}, Istpreis ${eur(istPreis)}, Istverbrauchsmenge ${istMenge} Einheiten. Wie hoch ist die **Preisabweichung**? (positiv = Mehrkosten)`,
                given: { Planpreis: eur(planPreis), Istpreis: eur(istPreis), Istmenge: `${istMenge} Einheiten` },
                answer,
                explanation: `Preisabweichung = (p_ist − p_plan)·m_ist = ${eur(answer)}`,
            };
        },
    },
    {
        id: "ca-variance-concept",
        subject: "cost_accounting", topic: "variance", difficulty: "medium", kind: "choice",
        prompt: "Was misst die Beschäftigungsabweichung in der flexiblen Plankostenrechnung?",
        choices: [
            "Den Teil der Abweichung, der auf die Proportionalisierung der Fixkosten bei abweichender Beschäftigung zurückgeht.",
            "Die Abweichung durch veränderte Einkaufspreise.",
            "Die Abweichung durch unwirtschaftlichen Materialverbrauch.",
            "Die Differenz zwischen Plan- und Ist-Absatzmenge.",
        ],
        correct: 0,
        explanation: "Beschäftigungsabweichung = verrechnete Plankosten − Sollkosten; sie entsteht nur, weil Fixkosten in der Vollkostenrechnung auf die Planbeschäftigung verteilt werden.",
    },
    {
        id: "ca-abc",
        subject: "cost_accounting", topic: "abc", difficulty: "hard", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const prozesskosten = rng.int(50, 400) * 1000;
            const anzahl = rng.int(200, 4000);
            const proAuftrag = rng.int(1, 8);
            const satz = prozesskosten / anzahl;
            const answer = satz * proAuftrag;
            return {
                prompt: `Der Prozess "Bestellung abwickeln" verursacht ${eur(prozesskosten)} pro Jahr bei ${anzahl} Prozessdurchführungen. Ein Auftrag löst ${proAuftrag} Bestellungen aus. Welche **Prozesskosten** sind dem Auftrag zuzurechnen?`,
                given: { Prozesskosten: eur(prozesskosten), Prozessmenge: String(anzahl), "Durchführungen je Auftrag": String(proAuftrag) },
                answer,
                explanation: `Prozesskostensatz = ${eur(satz)}; × ${proAuftrag} = ${eur(answer)}`,
            };
        },
    },
];
