import type { Question } from "@/lib/questions/types";
import { eur, n, n2, pct } from "./_helpers";

export const econ2Questions: Question[] = [
    {
        id: "e2-vgr-definition",
        subject: "econ2", topic: "national_accounts", difficulty: "easy", kind: "choice",
        prompt: "Which item does **not** enter GDP under the expenditure approach?",
        choices: [
            "The purchase of a used machine from another domestic firm.",
            "Consumption spending by private households.",
            "Gross fixed capital formation by firms.",
            "Exports less imports.",
        ],
        correct: 0,
        explanation: "GDP measures the value added newly produced during the period. Trade in second-hand goods is merely a transfer of assets.",
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
                prompt: `Consumption ${eur(C)}, investment ${eur(I)}, government spending ${eur(G)}, exports ${eur(X)}, imports ${eur(M)}. What is **GDP**?`,
                given: { C: eur(C), I: eur(I), G: eur(G), X: eur(X), M: eur(M) },
                answer,
                explanation: `GDP = C + I + G + (X − M) = ${eur(answer)}`,
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
                prompt: `The nominal interest rate is ${pct(nominal)} and the inflation rate is ${pct(inflation)}. What is the **exact real interest rate** (Fisher equation)?`,
                given: { "Nominal rate": pct(nominal), Inflation: pct(inflation) },
                answer,
                explanation: `(1+i) = (1+r)(1+π) → r = (1+i)/(1+π) − 1 = ${pct(answer)}`,
            };
        },
    },
    {
        id: "e2-inflation-deflator",
        subject: "econ2", topic: "inflation", difficulty: "medium", kind: "choice",
        prompt: "How does the GDP deflator differ from the consumer price index (CPI)?",
        choices: [
            "The deflator covers all domestically produced goods, the CPI a fixed basket that also includes imported goods.",
            "The deflator uses a fixed basket of goods, the CPI a variable one.",
            "Both measure exactly the same thing, only in different units.",
            "The CPI contains capital goods, the deflator does not.",
        ],
        correct: 0,
        explanation: "The deflator is a Paasche index over domestic production; the CPI is a Laspeyres index over a fixed consumption basket that also contains imports.",
    },
    {
        id: "e2-labor-rate",
        subject: "econ2", topic: "labor", difficulty: "easy", kind: "numeric", unit: "percent",
        build: (rng) => {
            const employed = rng.int(3000, 4500);
            const unemployed = rng.int(100, 400);
            const answer = (unemployed / (employed + unemployed)) * 100;
            return {
                prompt: `In an economy ${n(employed)} thousand people are employed and ${n(unemployed)} thousand are unemployed. What is the **unemployment rate**?`,
                given: { Employed: `${n(employed)} thousand`, Unemployed: `${n(unemployed)} thousand` },
                answer,
                explanation: `u = U/(E + U) = ${pct(answer)}`,
            };
        },
    },
    {
        id: "e2-labor-phillips",
        subject: "econ2", topic: "labor", difficulty: "hard", kind: "choice",
        prompt: "What does the expectations-augmented Phillips curve imply for the long run?",
        choices: [
            "There is no lasting trade-off between inflation and unemployment; unemployment returns to its natural rate.",
            "Higher inflation lowers unemployment permanently.",
            "In the long run inflation and unemployment always rise together.",
            "Households' expectations play no role.",
        ],
        correct: 0,
        explanation: "Once inflation expectations have adjusted, the long-run Phillips curve is vertical at the natural rate of unemployment.",
    },
    {
        id: "e2-monetary-tools",
        subject: "econ2", topic: "monetary", difficulty: "easy", kind: "choice",
        prompt: "The central bank wants to fight inflation. Which measure fits?",
        choices: [
            "Raise the policy rate and withdraw liquidity from the market.",
            "Cut the policy rate and buy bonds.",
            "Lower the reserve requirement ratio.",
            "Increase government spending.",
        ],
        correct: 0,
        explanation: "Restrictive monetary policy: a higher policy rate, less liquidity. Government spending is fiscal policy, not monetary policy.",
    },
    {
        id: "e2-monetary-multiplier",
        subject: "econ2", topic: "monetary", difficulty: "medium", kind: "numeric", unit: "ratio",
        build: (rng) => {
            const rr = rng.pick([1, 2, 4, 5, 10, 20]);
            const answer = 1 / (rr / 100);
            return {
                prompt: `The reserve requirement ratio is ${pct(rr)}. What is the **simple money multiplier**?`,
                given: { "Reserve requirement": pct(rr) },
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
                prompt: `The marginal propensity to consume is ${n2(mpc)}. The government increases its spending by ${eur(dG)}. By how much does income rise in the simple Keynesian model?`,
                given: { "MPC (c)": n2(mpc), "ΔG": eur(dG) },
                answer,
                explanation: `ΔY = ΔG · 1/(1 − c) = ${eur(dG)} · ${n2(1 / (1 - mpc))} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "e2-fiscal-crowding",
        subject: "econ2", topic: "fiscal", difficulty: "hard", kind: "choice",
        prompt: "What does the crowding-out effect describe?",
        choices: [
            "Debt-financed government spending drives the interest rate up and displaces private investment.",
            "The state drives private suppliers out of the market with lower prices.",
            "Imports displace domestic production.",
            "The central bank displaces commercial banks from the lending business.",
        ],
        correct: 0,
        explanation: "Higher government demand for credit raises the interest rate, which makes private investment more expensive and reduces it.",
    },
    {
        id: "e2-open-real-exchange",
        subject: "econ2", topic: "open_economy", difficulty: "hard", kind: "choice",
        prompt: "A country's real exchange rate rises (a real appreciation). What typically follows?",
        choices: [
            "Exports become relatively more expensive, net exports fall.",
            "Exports become cheaper, net exports rise.",
            "Net exports stay unchanged.",
            "Import prices rise.",
        ],
        correct: 0,
        explanation: "A real appreciation means domestic goods become more expensive relative to foreign goods → exports fall, imports rise.",
    },
    {
        id: "e2-growth-solow",
        subject: "econ2", topic: "growth", difficulty: "hard", kind: "choice",
        prompt: "What holds in the steady state of the Solow model without technological progress?",
        choices: [
            "Income per capita no longer grows; investment exactly covers depreciation and population growth.",
            "Income per capita grows at the savings rate.",
            "The capital stock per capita grows without limit.",
            "Depreciation is zero.",
        ],
        correct: 0,
        explanation: "In the steady state s·f(k) = (δ + n)·k — capital per capita, and hence income per capita, is constant.",
    },
];
