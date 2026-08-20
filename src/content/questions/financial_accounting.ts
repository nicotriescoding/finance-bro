import type { Question } from "@/lib/questions/types";
import { eur, n2, pct } from "./_helpers";

export const financialAccountingQuestions: Question[] = [
    {
        id: "fa-bs-equation",
        subject: "financial_accounting", topic: "balance_sheet", difficulty: "very_easy", kind: "choice",
        prompt: "Welche Aussage zur Bilanz ist korrekt?",
        choices: [
            "Die Aktivseite zeigt die Mittelverwendung, die Passivseite die Mittelherkunft.",
            "Die Aktivseite zeigt die Mittelherkunft, die Passivseite die Mittelverwendung.",
            "Rückstellungen stehen auf der Aktivseite.",
            "Das Eigenkapital ist Teil des Anlagevermögens.",
        ],
        correct: 0,
        explanation: "Aktiva = Vermögen (wofür wurden Mittel eingesetzt), Passiva = Kapital (woher kommen die Mittel).",
    },
    {
        id: "fa-bs-equity",
        subject: "financial_accounting", topic: "balance_sheet", difficulty: "easy", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const av = rng.int(200, 900) * 1000;
            const uv = rng.int(100, 600) * 1000;
            const fk = rng.int(100, 700) * 1000;
            const answer = av + uv - fk;
            return {
                prompt: `Anlagevermögen ${eur(av)}, Umlaufvermögen ${eur(uv)}, gesamtes Fremdkapital ${eur(fk)}. Wie hoch ist das **Eigenkapital**?`,
                given: { Anlagevermögen: eur(av), Umlaufvermögen: eur(uv), Fremdkapital: eur(fk) },
                answer,
                explanation: `EK = Vermögen − Schulden = ${eur(av + uv)} − ${eur(fk)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fa-guv-ebit",
        subject: "financial_accounting", topic: "income_statement", difficulty: "medium", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const umsatz = rng.int(500, 2000) * 1000;
            const material = Math.round(umsatz * rng.float(0.3, 0.5, 2));
            const personal = Math.round(umsatz * rng.float(0.15, 0.3, 2));
            const afa = rng.int(20, 150) * 1000;
            const sonstige = rng.int(10, 100) * 1000;
            const answer = umsatz - material - personal - afa - sonstige;
            return {
                prompt: `Umsatzerlöse ${eur(umsatz)}, Materialaufwand ${eur(material)}, Personalaufwand ${eur(personal)}, Abschreibungen ${eur(afa)}, sonstige betriebliche Aufwendungen ${eur(sonstige)}. Wie hoch ist das **EBIT**?`,
                given: { Umsatz: eur(umsatz), Material: eur(material), Personal: eur(personal), Abschreibungen: eur(afa), "sonst. Aufwand": eur(sonstige) },
                answer,
                explanation: `EBIT = Umsatz − alle betrieblichen Aufwendungen = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fa-booking-bank",
        subject: "financial_accounting", topic: "bookings", difficulty: "easy", kind: "choice",
        prompt: "Ein Kunde begleicht eine offene Rechnung über 5.000 € per Banküberweisung. Wie lautet der Buchungssatz?",
        choices: [
            "Bank an Forderungen aus LuL 5.000 €",
            "Forderungen aus LuL an Bank 5.000 €",
            "Bank an Umsatzerlöse 5.000 €",
            "Umsatzerlöse an Forderungen aus LuL 5.000 €",
        ],
        correct: 0,
        explanation: "Aktivtausch: Der Bankbestand steigt (Soll), die Forderung geht unter (Haben). Der Erlös wurde bereits bei Rechnungsstellung gebucht.",
    },
    {
        id: "fa-booking-type",
        subject: "financial_accounting", topic: "bookings", difficulty: "medium", kind: "choice",
        prompt: "Ein Unternehmen tilgt ein Bankdarlehen aus vorhandenen liquiden Mitteln. Um welchen Geschäftsvorfall handelt es sich?",
        choices: [
            "Bilanzverkürzung (Aktiv-Passiv-Minderung)",
            "Bilanzverlängerung (Aktiv-Passiv-Mehrung)",
            "Aktivtausch",
            "Passivtausch",
        ],
        correct: 0,
        explanation: "Bank (Aktiva) sinkt und Verbindlichkeit (Passiva) sinkt — die Bilanzsumme wird kürzer.",
    },
    {
        id: "fa-depreciation-linear",
        subject: "financial_accounting", topic: "depreciation", difficulty: "easy", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const ak = rng.int(20, 200) * 1000;
            const rest = rng.pick([0, rng.int(1, 15) * 1000]);
            const nd = rng.int(3, 12);
            const answer = (ak - rest) / nd;
            return {
                prompt: `Eine Maschine kostet ${eur(ak)}, hat eine Nutzungsdauer von ${nd} Jahren und einen Restwert von ${eur(rest)}. Wie hoch ist die **lineare jährliche Abschreibung**?`,
                given: { Anschaffungskosten: eur(ak), Nutzungsdauer: `${nd} Jahre`, Restwert: eur(rest) },
                answer,
                explanation: `AfA = (AK − Restwert)/ND = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fa-depreciation-degressive",
        subject: "financial_accounting", topic: "depreciation", difficulty: "hard", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const ak = rng.int(50, 300) * 1000;
            const rate = rng.pick([20, 25, 30]);
            const year = rng.int(2, 4);
            const bookValue = ak * (1 - rate / 100) ** (year - 1);
            const answer = bookValue * (rate / 100);
            return {
                prompt: `Eine Anlage mit Anschaffungskosten von ${eur(ak)} wird **geometrisch-degressiv** mit ${pct(rate)} abgeschrieben. Wie hoch ist die Abschreibung im **Jahr ${year}**?`,
                given: { Anschaffungskosten: eur(ak), Abschreibungssatz: pct(rate), Jahr: String(year) },
                answer,
                explanation: `Restbuchwert zu Beginn Jahr ${year} = ${eur(bookValue)}; AfA = ${pct(rate)} davon = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fa-inventory-lifo",
        subject: "financial_accounting", topic: "inventory", difficulty: "hard", kind: "choice",
        prompt: "Bei steigenden Einkaufspreisen führt das LIFO-Verfahren im Vergleich zu FIFO zu …",
        choices: [
            "einem niedrigeren ausgewiesenen Gewinn und einem niedrigeren Vorratsbestand.",
            "einem höheren Gewinn und einem höheren Vorratsbestand.",
            "identischen Ergebnissen wie FIFO.",
            "einem höheren Gewinn bei gleichem Vorratsbestand.",
        ],
        correct: 0,
        explanation: "LIFO verbraucht zuerst die teuren jüngsten Zugänge → höherer Materialaufwand → niedrigerer Gewinn; im Lager bleiben die alten, günstigen Bestände.",
    },
    {
        id: "fa-inventory-niederstwert",
        subject: "financial_accounting", topic: "inventory", difficulty: "medium", kind: "choice",
        prompt: "Was verlangt das strenge Niederstwertprinzip für das Umlaufvermögen nach HGB?",
        choices: [
            "Ansatz zum niedrigeren Wert aus Anschaffungskosten und beizulegendem Wert am Abschlussstichtag — zwingend.",
            "Ansatz immer zu Anschaffungskosten.",
            "Ansatz zum höheren der beiden Werte.",
            "Ein Wahlrecht zwischen beiden Werten.",
        ],
        correct: 0,
        explanation: "§ 253 Abs. 4 HGB: Beim Umlaufvermögen ist die Abwertung zwingend (streng), beim Anlagevermögen nur bei dauerhafter Wertminderung (gemildert).",
    },
    {
        id: "fa-provisions",
        subject: "financial_accounting", topic: "provisions", difficulty: "medium", kind: "choice",
        prompt: "Wann ist eine Rückstellung zu bilden?",
        choices: [
            "Bei einer Verpflichtung gegenüber Dritten, die dem Grunde nach wahrscheinlich, in Höhe oder Fälligkeit aber ungewiss ist.",
            "Bei jeder Verbindlichkeit, deren Betrag feststeht.",
            "Nur wenn ein Vertrag unterschrieben wurde.",
            "Wenn ein zukünftiger Gewinn erwartet wird.",
        ],
        correct: 0,
        explanation: "Rückstellungen sind ungewisse Verbindlichkeiten. Steht der Betrag fest, handelt es sich um eine Verbindlichkeit.",
    },
    {
        id: "fa-equity-change",
        subject: "financial_accounting", topic: "equity", difficulty: "medium", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const ekStart = rng.int(200, 900) * 1000;
            const gewinn = rng.int(20, 200) * 1000;
            const dividende = rng.int(5, Math.max(6, Math.floor(gewinn / 1000 / 2))) * 1000;
            const einlage = rng.int(0, 100) * 1000;
            const answer = ekStart + gewinn - dividende + einlage;
            return {
                prompt: `Eigenkapital zu Jahresbeginn ${eur(ekStart)}, Jahresüberschuss ${eur(gewinn)}, Dividendenausschüttung ${eur(dividende)}, Kapitaleinlage ${eur(einlage)}. Wie hoch ist das **Eigenkapital zum Jahresende**?`,
                given: { "EK Anfang": eur(ekStart), Jahresüberschuss: eur(gewinn), Dividende: eur(dividende), Einlage: eur(einlage) },
                answer,
                explanation: `EK_Ende = EK_Anfang + JÜ − Ausschüttung + Einlagen = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fa-cashflow-indirect",
        subject: "financial_accounting", topic: "cash_flow", difficulty: "hard", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const ju = rng.int(50, 400) * 1000;
            const afa = rng.int(20, 150) * 1000;
            const rueck = rng.int(-40, 60) * 1000;
            const vorrat = rng.int(-60, 60) * 1000; // + = Aufbau
            const answer = ju + afa + rueck - vorrat;
            return {
                prompt: `Indirekte Ermittlung: Jahresüberschuss ${eur(ju)}, Abschreibungen ${eur(afa)}, Zunahme der Rückstellungen ${eur(rueck)}, Zunahme der Vorräte ${eur(vorrat)}. Wie hoch ist der **operative Cashflow**?`,
                given: { Jahresüberschuss: eur(ju), Abschreibungen: eur(afa), "Δ Rückstellungen": eur(rueck), "Δ Vorräte": eur(vorrat) },
                answer,
                explanation: `CF = JÜ + AfA + ΔRückstellungen − ΔVorräte = ${eur(answer)} (Vorratsaufbau bindet Liquidität)`,
            };
        },
    },
    {
        id: "fa-hgb-ifrs",
        subject: "financial_accounting", topic: "hgb_ifrs", difficulty: "medium", kind: "choice",
        prompt: "Welcher Grundsatz prägt das HGB stärker als die IFRS?",
        choices: [
            "Das Vorsichtsprinzip zum Gläubigerschutz.",
            "Die Fair-Value-Bewertung.",
            "Die Ausrichtung auf Investoreninformation (decision usefulness).",
            "Die Aktivierungspflicht für selbst geschaffene immaterielle Vermögenswerte.",
        ],
        correct: 0,
        explanation: "HGB ist gläubigerschutz- und ausschüttungsorientiert (Vorsichtsprinzip, Realisationsprinzip); IFRS sind investorenorientiert und erlauben mehr Fair-Value-Bewertung.",
    },
];
