import type { Question } from "@/lib/questions/types";
import { eur, n, n2, pct } from "./_helpers";

export const costAccountingQuestions: Question[] = [
    {
        id: "ca-types-split",
        subject: "cost_accounting", topic: "cost_types", difficulty: "easy", kind: "choice",
        prompt: "Which cost type is a typical example of **direct costs**?",
        choices: [
            "Production material that can be traced directly to a product.",
            "The rent for the administrative headquarters.",
            "The managing director's salary.",
            "Depreciation on the office building.",
        ],
        correct: 0,
        explanation: "Direct costs can be traced directly to a cost object. All of the other options are overhead costs.",
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
                prompt: `Fixed costs are ${eur(fix)}. Output quantity rises from ${n(q1)} to ${n(q2)} units. By how many € does the **fixed cost per unit** fall (fixed cost degression)?`,
                given: { "Fixed costs": eur(fix), "Old quantity": `${n(q1)} units`, "New quantity": `${n(q2)} units` },
                answer,
                explanation: `${eur(fix / q1)} − ${eur(fix / q2)} = ${eur(answer)} per unit`,
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
                prompt: `Production overhead costs are ${eur(gk)}, direct production wages (the allocation base) are ${eur(basis)}. What is the **production overhead rate** as a percentage of that base?`,
                given: { "Production overhead": eur(gk), "Production wages": eur(basis) },
                answer,
                explanation: `Overhead rate = overhead / base · 100 = ${pct(answer)}`,
            };
        },
    },
    {
        id: "ca-bab-purpose",
        subject: "cost_accounting", topic: "cost_centers", difficulty: "easy", kind: "choice",
        prompt: "What is the purpose of the overhead allocation sheet (Betriebsabrechnungsbogen, BAB)?",
        choices: [
            "To allocate overhead costs to cost centers and to derive overhead rates.",
            "To determine the direct costs per product.",
            "To prepare the commercial balance sheet.",
            "To calculate value-added tax.",
        ],
        correct: 0,
        explanation: "The BAB is the working tool of cost center accounting: allocating overhead, settling internal services between cost centers, and deriving overhead rates.",
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
                prompt: `Overhead surcharge costing (Zuschlagskalkulation), per unit: direct material costs ${eur(mek)}, material overhead rate ${pct(mgkSatz)}, direct manufacturing costs ${eur(fek)}, production overhead rate ${pct(fgkSatz)}, administrative and selling overhead rate ${pct(vvSatz)} on the cost of goods manufactured (Herstellkosten). What is the **total cost per unit**?`,
                given: { "Direct material": eur(mek), "Material overhead rate": pct(mgkSatz), "Direct manufacturing costs": eur(fek), "Production overhead rate": pct(fgkSatz), "Admin & selling rate": pct(vvSatz) },
                answer,
                explanation: `Cost of goods manufactured = ${eur(hk)}; total cost = that · (1 + ${n2(vvSatz / 100)}) = ${eur(answer)}`,
            };
        },
    },
    {
        id: "ca-full-vs-direct",
        subject: "cost_accounting", topic: "full_vs_direct", difficulty: "medium", kind: "choice",
        prompt: "Why can absorption costing lead to poor short-term decisions?",
        choices: [
            "Because it spreads fixed costs as if they were variable and therefore rejects orders that would earn a positive contribution margin.",
            "Because it ignores variable costs.",
            "Because it only takes direct costs into account.",
            "Because it necessarily violates the German Commercial Code (HGB).",
        ],
        correct: 0,
        explanation: "Fixed costs are incurred in the short run anyway. What is decision-relevant is the contribution margin, not the full cost rate.",
    },
    {
        id: "ca-db-unit",
        subject: "cost_accounting", topic: "contribution_margin", difficulty: "very_easy", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const p = rng.int(20, 200);
            const kv = rng.int(5, p - 3);
            const answer = p - kv;
            return {
                prompt: `The selling price is ${eur(p)} and the variable cost per unit is ${eur(kv)}. What is the **unit contribution margin**?`,
                given: { "Selling price": eur(p), "Variable cost per unit": eur(kv) },
                answer,
                explanation: `cm = p − k_v = ${eur(answer)}`,
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
                prompt: `Fixed costs ${eur(fix)}, selling price ${eur(p)}, variable cost per unit ${eur(kv)}. How many units have to be sold to break even (**break-even quantity**)?`,
                given: { "Fixed costs": eur(fix), Price: eur(p), "k_var": eur(kv) },
                answer,
                explanation: `x_BE = K_fix/(p − k_v) = ${eur(fix)}/${eur(p - kv)} = ${n2(answer)} units`,
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
                prompt: `Fixed costs ${eur(fix)}, target profit ${eur(ziel)}, price ${eur(p)}, variable cost per unit ${eur(kv)}. How many units have to be sold?`,
                given: { "Fixed costs": eur(fix), "Target profit": eur(ziel), Price: eur(p), "k_var": eur(kv) },
                answer,
                explanation: `x = (K_fix + target profit)/cm = ${n2(answer)} units`,
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
                prompt: `Standard price per unit ${eur(planPreis)}, actual price ${eur(istPreis)}, actual quantity consumed ${n(istMenge)} units. What is the **price variance**? (positive = extra cost)`,
                given: { "Standard price": eur(planPreis), "Actual price": eur(istPreis), "Actual quantity": `${n(istMenge)} units` },
                answer,
                explanation: `Price variance = (p_actual − p_standard) · q_actual = ${eur(answer)}`,
            };
        },
    },
    {
        id: "ca-variance-concept",
        subject: "cost_accounting", topic: "variance", difficulty: "medium", kind: "choice",
        prompt: "What does the volume variance measure in flexible standard costing?",
        choices: [
            "The part of the variance that stems from spreading fixed costs as if they were variable when actual activity differs from planned activity.",
            "The variance caused by changed purchase prices.",
            "The variance caused by inefficient material usage.",
            "The difference between planned and actual sales volume.",
        ],
        correct: 0,
        explanation: "Volume variance = absorbed standard costs − flexible budget costs (Sollkosten); it arises only because absorption costing spreads fixed costs over the planned activity level.",
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
                prompt: `The activity "process a purchase order" causes ${eur(prozesskosten)} per year across ${n(anzahl)} executions of the activity. One customer order triggers ${proAuftrag} purchase orders. How much **activity cost** is attributable to that order?`,
                given: { "Activity cost per year": eur(prozesskosten), "Activity volume": n(anzahl), "Executions per order": String(proAuftrag) },
                answer,
                explanation: `Activity rate = ${eur(satz)}; × ${proAuftrag} = ${eur(answer)}`,
            };
        },
    },
];
