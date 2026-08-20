import type { Question } from "@/lib/questions/types";
import { eur, n2, pct } from "./_helpers";

export const econ1Questions: Question[] = [
    {
        id: "e1-sd-shift",
        subject: "econ1", topic: "supply_demand", difficulty: "easy", kind: "choice",
        prompt: "Der Preis eines Komplementärguts zu Gut X steigt. Was passiert auf dem Markt für X?",
        choices: [
            "Die Nachfragekurve nach X verschiebt sich nach links, Preis und Menge sinken.",
            "Die Nachfragekurve nach X verschiebt sich nach rechts, Preis und Menge steigen.",
            "Die Angebotskurve für X verschiebt sich nach links, der Preis steigt.",
            "Es kommt lediglich zu einer Bewegung entlang der Nachfragekurve.",
        ],
        correct: 0,
        explanation: "Komplemente werden gemeinsam konsumiert. Wird das Komplement teurer, sinkt die Nachfrage nach X bei jedem Preis — die gesamte Kurve verschiebt sich nach links.",
    },
    {
        id: "e1-sd-equilibrium",
        subject: "econ1", topic: "supply_demand", difficulty: "medium", kind: "numeric", unit: "number",
        build: (rng) => {
            const a = rng.int(80, 200);
            const b = rng.int(2, 6);
            const c = rng.int(1, 4);
            // a - b*P = c*P  =>  P = a/(b+c)
            const p = a / (b + c);
            return {
                prompt: `Die Nachfrage lautet Q_d = ${a} − ${b}·P, das Angebot Q_s = ${c}·P. Wie hoch ist der **Gleichgewichtspreis P***?`,
                given: { Nachfrage: `Q_d = ${a} − ${b}P`, Angebot: `Q_s = ${c}P` },
                answer: p,
                explanation: `Q_d = Q_s → ${a} − ${b}P = ${c}P → P* = ${a}/${b + c} = ${n2(p)}`,
            };
        },
    },
    {
        id: "e1-el-price",
        subject: "econ1", topic: "elasticity", difficulty: "medium", kind: "numeric", unit: "ratio",
        build: (rng) => {
            const p0 = rng.int(10, 40);
            const p1 = p0 + rng.int(2, 10);
            const q0 = rng.int(100, 500);
            const q1 = q0 - rng.int(10, Math.floor(q0 * 0.4));
            const e = ((q1 - q0) / q0) / ((p1 - p0) / p0);
            return {
                prompt: `Der Preis steigt von ${eur(p0)} auf ${eur(p1)}, die nachgefragte Menge fällt von ${q0} auf ${q1} Stück. Wie hoch ist die **Preiselastizität der Nachfrage** (Punktelastizität, mit Vorzeichen)?`,
                given: { "P₀ → P₁": `${eur(p0)} → ${eur(p1)}`, "Q₀ → Q₁": `${q0} → ${q1}` },
                answer: e,
                explanation: `ε = (ΔQ/Q₀)/(ΔP/P₀) = ${n2(e)} — Betrag ${Math.abs(e) > 1 ? "> 1, also elastisch" : "< 1, also unelastisch"}.`,
            };
        },
    },
    {
        id: "e1-el-revenue",
        subject: "econ1", topic: "elasticity", difficulty: "medium", kind: "choice",
        prompt: "Die Preiselastizität der Nachfrage beträgt −0,4. Ein Unternehmen erhöht den Preis. Was passiert mit dem Umsatz?",
        choices: [
            "Der Umsatz steigt, weil die Nachfrage unelastisch ist.",
            "Der Umsatz sinkt, weil die Nachfrage elastisch ist.",
            "Der Umsatz bleibt unverändert.",
            "Das lässt sich ohne Kenntnis der Kostenfunktion nicht sagen.",
        ],
        correct: 0,
        explanation: "|ε| < 1 heißt unelastisch: die Menge reagiert schwächer als der Preis, der Umsatzeffekt des höheren Preises dominiert.",
    },
    {
        id: "e1-consumer-mrs",
        subject: "econ1", topic: "consumer", difficulty: "hard", kind: "choice",
        prompt: "Im Haushaltsoptimum bei innerer Lösung gilt:",
        choices: [
            "MRS = P_x / P_y, die Indifferenzkurve tangiert die Budgetgerade.",
            "MRS = 0, die Indifferenzkurve verläuft waagerecht.",
            "Der Grenznutzen beider Güter ist gleich groß.",
            "Das Budget wird nicht vollständig ausgeschöpft.",
        ],
        correct: 0,
        explanation: "Optimum: Grenzrate der Substitution = Preisverhältnis, also MU_x/MU_y = P_x/P_y.",
    },
    {
        id: "e1-consumer-giffen",
        subject: "econ1", topic: "consumer", difficulty: "hard", kind: "choice",
        prompt: "Welche Aussage über ein Giffen-Gut ist korrekt?",
        choices: [
            "Der Einkommenseffekt ist negativ und überwiegt den Substitutionseffekt, die Nachfragekurve steigt.",
            "Der Substitutionseffekt ist positiv und überwiegt den Einkommenseffekt.",
            "Giffen-Güter sind immer auch Luxusgüter.",
            "Bei Giffen-Gütern existiert kein Substitutionseffekt.",
        ],
        correct: 0,
        explanation: "Ein Giffen-Gut ist ein stark inferiores Gut, bei dem der negative Einkommenseffekt den Substitutionseffekt dominiert.",
    },
    {
        id: "e1-prod-costs",
        subject: "econ1", topic: "production_costs", difficulty: "easy", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const fix = rng.int(20, 120) * 100;
            const varUnit = rng.int(3, 25);
            const q = rng.int(50, 500);
            const answer = (fix + varUnit * q) / q;
            return {
                prompt: `Fixkosten ${eur(fix)}, variable Stückkosten ${eur(varUnit)}. Wie hoch sind die **Durchschnittskosten** bei einer Produktion von ${q} Stück?`,
                given: { Fixkosten: eur(fix), "variable Stückkosten": eur(varUnit), Menge: `${q} Stück` },
                answer,
                explanation: `ATC = (K_fix + k_var·q)/q = ${eur(answer)}`,
            };
        },
    },
    {
        id: "e1-prod-mc-atc",
        subject: "econ1", topic: "production_costs", difficulty: "medium", kind: "choice",
        prompt: "Die Grenzkostenkurve schneidet die Durchschnittskostenkurve …",
        choices: [
            "in deren Minimum.",
            "in deren Maximum.",
            "immer bei der Ausbringungsmenge null.",
            "grundsätzlich nicht — die Kurven verlaufen parallel.",
        ],
        correct: 0,
        explanation: "Solange MC < ATC sinken die Durchschnittskosten, solange MC > ATC steigen sie. Der Schnittpunkt ist also das ATC-Minimum.",
    },
    {
        id: "e1-market-pc",
        subject: "econ1", topic: "market_forms", difficulty: "easy", kind: "choice",
        prompt: "Welche Bedingung erfüllt ein Unternehmen im Gewinnmaximum bei vollkommener Konkurrenz?",
        choices: [
            "P = MC",
            "MR > MC",
            "P = ATC",
            "MR = 0",
        ],
        correct: 0,
        explanation: "Bei vollkommener Konkurrenz ist der Preis gleich dem Grenzerlös, Gewinnmaximum daher bei P = MR = MC.",
    },
    {
        id: "e1-market-monopoly",
        subject: "econ1", topic: "market_forms", difficulty: "hard", kind: "choice",
        prompt: "Ein Monopolist maximiert seinen Gewinn. Welche Aussage trifft zu?",
        choices: [
            "Er setzt einen Preis über den Grenzkosten und erzeugt dadurch einen Wohlfahrtsverlust.",
            "Er produziert im unelastischen Bereich der Nachfragekurve.",
            "Er setzt den Preis gleich den Grenzkosten.",
            "Er erzielt immer einen positiven ökonomischen Gewinn.",
        ],
        correct: 0,
        explanation: "MR = MC < P: der Aufschlag über die Grenzkosten führt zum Deadweight Loss. Ein Monopolist produziert stets im elastischen Bereich, und Gewinne sind nicht garantiert.",
    },
    {
        id: "e1-welfare-tax",
        subject: "econ1", topic: "welfare", difficulty: "medium", kind: "choice",
        prompt: "Eine Mengensteuer wird auf ein Gut erhoben, dessen Nachfrage sehr unelastisch und dessen Angebot sehr elastisch ist. Wer trägt die Hauptlast?",
        choices: [
            "Die Konsumenten.",
            "Die Produzenten.",
            "Beide Seiten je zur Hälfte, unabhängig von den Elastizitäten.",
            "Der Staat, da er die Steuer erhebt.",
        ],
        correct: 0,
        explanation: "Die Steuerlast trägt überwiegend die Marktseite, die weniger elastisch reagiert — hier die Konsumenten.",
    },
    {
        id: "e1-welfare-surplus",
        subject: "econ1", topic: "welfare", difficulty: "medium", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const pMax = rng.int(40, 120);
            const p = rng.int(10, pMax - 10);
            const q = rng.int(20, 200);
            const answer = 0.5 * (pMax - p) * q;
            return {
                prompt: `Die (lineare) Nachfrage schneidet die Preisachse bei ${eur(pMax)}. Im Gleichgewicht liegt der Preis bei ${eur(p)} und die Menge bei ${q} Stück. Wie hoch ist die **Konsumentenrente**?`,
                given: { Prohibitivpreis: eur(pMax), "P*": eur(p), "Q*": `${q} Stück` },
                answer,
                explanation: `KR = ½·(P_max − P*)·Q* = ${eur(answer)}`,
            };
        },
    },
];
