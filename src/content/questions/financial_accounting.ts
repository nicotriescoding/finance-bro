import type { Question } from "@/lib/questions/types";
import { eur, n, n2, pct } from "./_helpers";

/** Fixed amount in a static prompt - still routed through the formatter. */
const INVOICE = eur(5000);

export const financialAccountingQuestions: Question[] = [
    {
        id: "fa-bs-equation",
        subject: "financial_accounting", topic: "balance_sheet", difficulty: "very_easy", kind: "choice",
        prompt: "Which statement about the balance sheet is correct?",
        choices: [
            "The asset side shows the use of funds, the equity and liabilities side shows the source of funds.",
            "The asset side shows the source of funds, the equity and liabilities side shows the use of funds.",
            "Provisions are reported on the asset side.",
            "Equity is part of non-current assets.",
        ],
        correct: 0,
        explanation: "Assets = what the funds were invested in; equity and liabilities = where the funds came from.",
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
                prompt: `Non-current assets ${eur(av)}, current assets ${eur(uv)}, total liabilities ${eur(fk)}. What is **equity**?`,
                given: { "Non-current assets": eur(av), "Current assets": eur(uv), "Total liabilities": eur(fk) },
                answer,
                explanation: `Equity = assets − liabilities = ${eur(av + uv)} − ${eur(fk)} = ${eur(answer)}`,
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
                prompt: `Revenue ${eur(umsatz)}, cost of materials ${eur(material)}, personnel expenses ${eur(personal)}, depreciation ${eur(afa)}, other operating expenses ${eur(sonstige)}. What is **EBIT**?`,
                given: { Revenue: eur(umsatz), Materials: eur(material), Personnel: eur(personal), Depreciation: eur(afa), "Other expenses": eur(sonstige) },
                answer,
                explanation: `EBIT = revenue − all operating expenses = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fa-booking-bank",
        subject: "financial_accounting", topic: "bookings", difficulty: "easy", kind: "choice",
        prompt: `A customer settles an outstanding invoice of ${INVOICE} by bank transfer. What is the journal entry?`,
        choices: [
            `Debit bank / credit trade receivables ${INVOICE}`,
            `Debit trade receivables / credit bank ${INVOICE}`,
            `Debit bank / credit revenue ${INVOICE}`,
            `Debit revenue / credit trade receivables ${INVOICE}`,
        ],
        correct: 0,
        explanation: "Asset swap: the bank balance rises (debit) and the receivable is derecognized (credit). The revenue was already recorded when the invoice was issued.",
    },
    {
        id: "fa-booking-type",
        subject: "financial_accounting", topic: "bookings", difficulty: "medium", kind: "choice",
        prompt: "A company repays a bank loan out of its existing cash. Which type of transaction is this?",
        choices: [
            "Balance sheet contraction — assets and liabilities both decrease",
            "Balance sheet extension — assets and liabilities both increase",
            "Asset swap — one asset replaces another",
            "Liability swap — one item within equity and liabilities replaces another",
        ],
        correct: 0,
        explanation: "The bank balance (an asset) falls and the liability falls with it — the balance sheet total shrinks.",
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
                prompt: `A machine costs ${eur(ak)}, has a useful life of ${nd} years and a residual value of ${eur(rest)}. What is the **annual straight-line depreciation**?`,
                given: { "Acquisition cost": eur(ak), "Useful life": `${nd} years`, "Residual value": eur(rest) },
                answer,
                explanation: `Depreciation = (acquisition cost − residual value) / useful life = ${eur(answer)}`,
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
                prompt: `An asset with an acquisition cost of ${eur(ak)} is depreciated on a **declining-balance** basis at ${pct(rate)}. What is the depreciation charge in **year ${year}**?`,
                given: { "Acquisition cost": eur(ak), "Depreciation rate": pct(rate), Year: String(year) },
                answer,
                explanation: `Carrying amount at the start of year ${year} = ${eur(bookValue)}; depreciation = ${pct(rate)} of that = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fa-inventory-lifo",
        subject: "financial_accounting", topic: "inventory", difficulty: "hard", kind: "choice",
        prompt: "When purchase prices are rising, LIFO compared with FIFO leads to …",
        choices: [
            "a lower reported profit and a lower inventory carrying amount.",
            "a higher profit and a higher inventory carrying amount.",
            "results identical to FIFO.",
            "a higher profit with an unchanged inventory carrying amount.",
        ],
        correct: 0,
        explanation: "LIFO expenses the recent, expensive purchases first → higher cost of materials → lower profit; the old, cheaper units stay in inventory.",
    },
    {
        id: "fa-inventory-niederstwert",
        subject: "financial_accounting", topic: "inventory", difficulty: "medium", kind: "choice",
        prompt: "What does the strict lower of cost or market principle require for current assets under HGB (German GAAP)?",
        choices: [
            "Measurement at the lower of acquisition cost and the attributable value (beizulegender Wert) at the reporting date — mandatory.",
            "Measurement always at acquisition cost.",
            "Measurement at the higher of the two values.",
            "An accounting option between the two values.",
        ],
        correct: 0,
        explanation: "§ 253 Abs. 4 HGB: for current assets the write-down is mandatory (strict principle); for non-current assets it is required only if the impairment is expected to be permanent (moderate principle).",
    },
    {
        id: "fa-provisions",
        subject: "financial_accounting", topic: "provisions", difficulty: "medium", kind: "choice",
        prompt: "When must a provision be recognized?",
        choices: [
            "For an obligation towards a third party that is probable in principle but uncertain in amount or timing.",
            "For every liability whose amount is certain.",
            "Only once a contract has been signed.",
            "When a future profit is expected.",
        ],
        correct: 0,
        explanation: "Provisions are liabilities that are uncertain in amount or timing. If the amount is fixed, the item is an ordinary liability.",
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
                prompt: `Equity at the start of the year ${eur(ekStart)}, net income for the year ${eur(gewinn)}, dividend distribution ${eur(dividende)}, capital contribution ${eur(einlage)}. What is **equity at the end of the year**?`,
                given: { "Opening equity": eur(ekStart), "Net income": eur(gewinn), Dividend: eur(dividende), Contribution: eur(einlage) },
                answer,
                explanation: `Closing equity = opening equity + net income − distribution + contributions = ${eur(answer)}`,
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
            const vorrat = rng.int(-60, 60) * 1000; // + = build-up
            const answer = ju + afa + rueck - vorrat;
            return {
                prompt: `Indirect method: net income for the year ${eur(ju)}, depreciation ${eur(afa)}, increase in provisions ${eur(rueck)}, increase in inventory ${eur(vorrat)}. What is the **operating cash flow**?`,
                given: { "Net income": eur(ju), Depreciation: eur(afa), "Δ Provisions": eur(rueck), "Δ Inventory": eur(vorrat) },
                answer,
                explanation: `CF = net income + depreciation + Δprovisions − Δinventory = ${eur(answer)} (building up inventory ties up cash)`,
            };
        },
    },
    {
        id: "fa-hgb-ifrs",
        subject: "financial_accounting", topic: "hgb_ifrs", difficulty: "medium", kind: "choice",
        prompt: "Which principle shapes HGB (German GAAP) more strongly than IFRS?",
        choices: [
            "The prudence principle, serving creditor protection.",
            "Fair value measurement.",
            "The orientation towards investor information (decision usefulness).",
            "The obligation to capitalize internally generated intangible assets.",
        ],
        correct: 0,
        explanation: "HGB is geared towards creditor protection and distributable profit (prudence principle, realization principle); IFRS is investor-oriented and permits far more fair value measurement.",
    },
];
