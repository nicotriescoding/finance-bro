import type { Question } from "@/lib/questions/types";
import { eur, n2, pct } from "./_helpers";

export const marketingQuestions: Question[] = [
    {
        id: "mk-stp-order",
        subject: "marketing", topic: "basics_stp", difficulty: "easy", kind: "choice",
        prompt: "In which order do the steps of the STP process run?",
        choices: [
            "Segmentation → Targeting → Positioning",
            "Targeting → Segmentation → Positioning",
            "Positioning → Segmentation → Targeting",
            "Segmentation → Positioning → Targeting",
        ],
        correct: 0,
        explanation: "First split the market, then pick the attractive segments, then position the offer in the mind of the target group.",
    },
    {
        id: "mk-stp-criteria",
        subject: "marketing", topic: "basics_stp", difficulty: "medium", kind: "choice",
        prompt: "Which requirement does a useful market segment **not** have to meet?",
        choices: [
            "It must contain as many different customer types as possible.",
            "It must be measurable.",
            "It must be reachable through the chosen channels.",
            "It must be economically substantial.",
        ],
        correct: 0,
        explanation: "Segments should be internally **homogeneous** and heterogeneous towards one another — not as mixed as possible.",
    },
    {
        id: "mk-research-primary",
        subject: "marketing", topic: "research", difficulty: "easy", kind: "choice",
        prompt: "What is an example of **secondary research**?",
        choices: [
            "Analyzing existing industry statistics and internal sales figures.",
            "Running your own customer survey.",
            "A focus group interview you conduct yourself.",
            "An A/B test on your own website.",
        ],
        correct: 0,
        explanation: "Secondary research uses data that has already been collected; primary research gathers new data for the specific question at hand.",
    },
    {
        id: "mk-research-bias",
        subject: "marketing", topic: "research", difficulty: "hard", kind: "choice",
        prompt: "A survey is run among existing customers only, and the result is generalized to the whole market. Which error does this introduce?",
        choices: [
            "Sampling bias (selection bias) — the sample is not representative of the overall market.",
            "A pure measurement error in the questionnaire.",
            "An error in the data analysis.",
            "No error, existing customers are the best indicator.",
        ],
        correct: 0,
        explanation: "Anyone who is already a customer has deliberately chosen the product — non-buyers and their reasons are missing entirely.",
    },
    {
        id: "mk-product-lifecycle",
        subject: "marketing", topic: "product", difficulty: "medium", kind: "choice",
        prompt: "In which phase of the product life cycle is profit typically highest?",
        choices: [
            "Maturity",
            "Introduction",
            "Growth",
            "Decline",
        ],
        correct: 0,
        explanation: "In maturity, revenue is high and unit costs are low thanks to experience-curve effects; the revenue peak falls at the end of maturity.",
    },
    {
        id: "mk-product-bcg",
        subject: "marketing", topic: "product", difficulty: "medium", kind: "choice",
        prompt: "A product has a high relative market share in a slow-growing market. What is it called in the BCG matrix?",
        choices: [
            "Cash Cow",
            "Star",
            "Question Mark",
            "Poor Dog",
        ],
        correct: 0,
        explanation: "High market share + low growth = Cash Cow: it funds the Stars and Question Marks.",
    },
    {
        id: "mk-pricing-breakeven",
        subject: "marketing", topic: "pricing", difficulty: "medium", kind: "numeric", unit: "EUR",
        build: (rng) => {
            const kv = rng.int(5, 80);
            const marge = rng.int(20, 120);
            const answer = kv * (1 + marge / 100);
            return {
                prompt: `Variable unit costs are ${eur(kv)}. A markup of ${pct(marge)} is applied. What is the **selling price** (cost-plus)?`,
                given: { "Variable unit costs": eur(kv), Markup: pct(marge) },
                answer,
                explanation: `p = k_v · (1 + markup) = ${eur(answer)}`,
            };
        },
    },
    {
        id: "mk-pricing-skimming",
        subject: "marketing", topic: "pricing", difficulty: "medium", kind: "choice",
        prompt: "When does a **skimming** pricing strategy make sense?",
        choices: [
            "For innovative products with early buyers willing to pay a premium and little short-term competitive pressure.",
            "When high market share is to be won quickly against many competitors.",
            "With highly price-elastic demand and large economies of scale.",
            "For homogeneous mass-market goods.",
        ],
        correct: 0,
        explanation: "Skimming captures the high willingness to pay first and then lowers the price step by step. The opposite approach is penetration pricing.",
    },
    {
        id: "mk-distribution",
        subject: "marketing", topic: "distribution", difficulty: "easy", kind: "choice",
        prompt: "What characterizes **indirect** distribution?",
        choices: [
            "Sales run through legally independent intermediaries such as wholesalers and retailers.",
            "The manufacturer sells exclusively through its own online shop.",
            "The manufacturer's field sales force visits end customers in person.",
            "There is no trade level at all between manufacturer and customer.",
        ],
        correct: 0,
        explanation: "Indirect distribution brings in independent intermediaries; direct distribution sells to the end customer with no stage in between.",
    },
    {
        id: "mk-communication-aida",
        subject: "marketing", topic: "communication", difficulty: "very_easy", kind: "choice",
        prompt: "What does the final A in the AIDA model stand for?",
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
        prompt: "What describes a **pull** strategy?",
        choices: [
            "The manufacturer advertises the product directly to end customers so that they ask retailers for it.",
            "The manufacturer grants retailers discounts so that they list the product.",
            "Retailers advertise the product on their own initiative.",
            "The product is sold exclusively through field sales representatives.",
        ],
        correct: 0,
        explanation: "Pull draws demand through the channel via the end customer; push presses the goods into the channel via trade incentives.",
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
                prompt: `A customer generates ${eur(db)} of contribution margin per year. The retention rate is ${pct(retention)} and the discount rate is ${pct(r)}. What is the **customer lifetime value** (excluding acquisition cost, payments in arrears)?`,
                given: { "Contribution margin p.a.": eur(db), Retention: pct(retention), "Discount rate": pct(r) },
                answer,
                explanation: `CLV = CM · r_ret/(1 + i − r_ret) = ${eur(answer)}`,
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
                prompt: `The CLV is ${eur(clv)} and the customer acquisition cost is ${eur(cac)}. What is the **CLV/CAC ratio**?`,
                given: { CLV: eur(clv), CAC: eur(cac) },
                answer,
                explanation: `CLV/CAC = ${n2(answer)} — as a rule of thumb, a value of 3 or above counts as healthy.`,
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
                prompt: `A campaign costs ${eur(spend)} and generates ${eur(revenue)} in revenue. What is the **ROAS**?`,
                given: { "Ad spend": eur(spend), Revenue: eur(revenue) },
                answer,
                explanation: `ROAS = revenue / ad spend = ${n2(answer)}`,
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
                prompt: `${n2(impressions / 1000)} thousand impressions at a CPM of ${eur(cpm)}, CTR ${pct(ctr)}, conversion rate ${pct(cr)}. What is the **cost per conversion (CPA)**?`,
                given: { Impressions: n2(impressions), CPM: eur(cpm), CTR: pct(ctr), "Conversion rate": pct(cr) },
                answer,
                explanation: `Spend = ${eur(spend)}; clicks = ${n2(clicks)}; conversions = ${n2(conversions)}; CPA = ${eur(answer)}`,
            };
        },
    },
];
