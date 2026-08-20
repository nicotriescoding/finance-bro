import type { Question } from "@/lib/questions/types";
import { eur, n, n2, pct } from "./_helpers";

/** Statutory minimum in a static prompt - still routed through the formatter. */
const GMBH_MIN = `${n(25_000)} €`;

export const entrepreneurshipQuestions: Question[] = [
    {
        id: "en-opp-effectuation",
        subject: "entrepreneurship", topic: "opportunity", difficulty: "medium", kind: "choice",
        prompt: "What distinguishes **effectuation** from **causation**?",
        choices: [
            "Effectuation starts from the means at hand and shapes goals out of them; causation starts from the goal and acquires the means needed for it.",
            "Effectuation is planning with complete market data, causation without it.",
            "Causation is used only by startups, effectuation only by large corporations.",
            "They are two names for the same planning process.",
        ],
        correct: 0,
        explanation: "Sarasvathy: effectuation is means-driven and iterative (affordable loss, partnerships), causation is goal-driven and plan-based.",
    },
    {
        id: "en-bmc-blocks",
        subject: "entrepreneurship", topic: "business_model", difficulty: "easy", kind: "choice",
        prompt: "Which element is **not** one of the nine building blocks of the Business Model Canvas?",
        choices: [
            "Competitive analysis",
            "Value Proposition",
            "Key Activities",
            "Revenue Streams",
        ],
        correct: 0,
        explanation: "The nine building blocks are Customer Segments, Value Proposition, Channels, Customer Relationships, Revenue Streams, Key Resources, Key Activities, Key Partners and Cost Structure. Competitive analysis is not a building block.",
    },
    {
        id: "en-lean-mvp",
        subject: "entrepreneurship", topic: "lean_startup", difficulty: "easy", kind: "choice",
        prompt: "What is the purpose of an MVP in the Lean Startup approach?",
        choices: [
            "To generate the maximum validated learning about a hypothesis with the minimum effort.",
            "To ship a finished product with all the planned features.",
            "To maximize revenue as quickly as possible.",
            "To present investors with a finished prototype.",
        ],
        correct: 0,
        explanation: "The MVP serves the build-measure-learn cycle: it tests the riskiest assumption with the least effort.",
    },
    {
        id: "en-lean-pivot",
        subject: "entrepreneurship", topic: "lean_startup", difficulty: "medium", kind: "choice",
        prompt: "When should a startup consider a pivot according to Lean Startup?",
        choices: [
            "When the core hypothesis could not be validated despite several iterations.",
            "As soon as the first customer walks away.",
            "When a competitor launches a similar product.",
            "After a fixed number of months, regardless of the data.",
        ],
        correct: 0,
        explanation: "A pivot is a structured change of course taken when the measured data repeatedly refutes the central assumption.",
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
                prompt: `The TAM is ${eur(tam)}. Of that, ${pct(samShare)} is realistically reachable (SAM). Of this SAM the startup wants to win ${pct(somShare)} market share. How large is the **SOM**?`,
                given: { TAM: eur(tam), "SAM share of TAM": pct(samShare), "Target share of SAM": pct(somShare) },
                answer,
                explanation: `SAM = ${eur(sam)}; SOM = SAM · ${n2(somShare / 100)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "en-market-approach",
        subject: "entrepreneurship", topic: "market_sizing", difficulty: "medium", kind: "choice",
        prompt: "What characterizes the **bottom-up** approach to market sizing?",
        choices: [
            "Extrapolating from number of customers × purchase frequency × price on the basis of your own assumptions.",
            "Taking a market study and deriving a percentage from it.",
            "Estimating on the basis of gross domestic product.",
            "Asking competitors what their revenues are.",
        ],
        correct: 0,
        explanation: "Bottom-up builds up from concrete units and is usually more convincing to investors than a top-down derivation from market studies.",
    },
    {
        id: "en-funding-stages",
        subject: "entrepreneurship", topic: "funding", difficulty: "easy", kind: "choice",
        prompt: "Which funding source is typically the **earliest** external source?",
        choices: [
            "Business angels",
            "Later-stage growth funds",
            "Initial public offering (IPO)",
            "Syndicated loan from a commercial bank",
        ],
        correct: 0,
        explanation: "Rough order: bootstrapping / FFF → business angels → seed VC → Series A/B/C → growth → IPO.",
    },
    {
        id: "en-funding-runway",
        subject: "entrepreneurship", topic: "funding", difficulty: "easy", kind: "numeric", unit: "number",
        build: (rng) => {
            const cash = rng.int(200, 3000) * 1000;
            const burn = rng.int(20, 250) * 1000;
            const answer = cash / burn;
            return {
                prompt: `A startup has ${eur(cash)} in the bank at a monthly net burn rate of ${eur(burn)}. How many **months of runway** are left?`,
                given: { Cash: eur(cash), "Burn rate per month": eur(burn) },
                answer,
                explanation: `Runway = cash / burn = ${n2(answer)} months`,
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
                prompt: `The founders hold ${pct(founderBefore)}. At a pre-money valuation of ${eur(preMoney)} a VC invests ${eur(invest)}. How large is the **founders' stake after the round**?`,
                given: { "Stake before": pct(founderBefore), "Pre-money": eur(preMoney), Investment: eur(invest) },
                answer,
                explanation: `Post-money = ${eur(postMoney)}; dilution factor = pre / post = ${n2(preMoney / postMoney)}; new stake = ${pct(answer)}`,
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
                prompt: `Pre-money valuation ${eur(preMoney)}, investment ${eur(invest)}. What **share** does the investor receive?`,
                given: { "Pre-money": eur(preMoney), Investment: eur(invest) },
                answer,
                explanation: `Share = investment / (pre-money + investment) = ${pct(answer)}`,
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
                prompt: `VC method: expected exit proceeds ${eur(exitValue)}, required multiple ${targetReturn}x, investment ${eur(invest)}. How high is the **pre-money valuation**?`,
                given: { Exit: eur(exitValue), "Target multiple": `${targetReturn}x`, Investment: eur(invest) },
                answer,
                explanation: `Post-money = exit / multiple = ${eur(postMoney)}; pre-money = post − investment = ${eur(answer)}`,
            };
        },
    },
    {
        id: "en-valuation-why-dcf-fails",
        subject: "entrepreneurship", topic: "startup_valuation", difficulty: "medium", kind: "choice",
        prompt: "Why is a classic DCF model problematic for early-stage startups?",
        choices: [
            "The cash flows are highly uncertain and the terminal value dominates the entire valuation.",
            "Because DCF is legally not permitted for companies that are not listed.",
            "Because startups have no cost of capital.",
            "Because DCF only works with negative cash flows.",
        ],
        correct: 0,
        explanation: "Without a reliable track record the forecasts are very uncertain; almost the whole present value sits in the terminal value, so the result reacts extremely sensitively to the assumptions.",
    },
    {
        id: "en-legal-gmbh",
        subject: "entrepreneurship", topic: "legal_team", difficulty: "easy", kind: "choice",
        prompt: "Which statement about the GmbH (private limited company) is correct?",
        choices: [
            `Liability is in principle limited to the company's assets; the minimum share capital is ${GMBH_MIN}.`,
            "The shareholders are always liable without limitation with their private assets.",
            "No share capital is required.",
            "A GmbH can only be founded by at least three people.",
        ],
        correct: 0,
        explanation: `§ 5 GmbHG sets the minimum share capital at ${GMBH_MIN}; § 7 (2) GmbHG requires at least half of that minimum to be paid in before registration. A single-shareholder GmbH is permitted.`,
    },
    {
        id: "en-legal-vesting",
        subject: "entrepreneurship", topic: "legal_team", difficulty: "medium", kind: "choice",
        prompt: "What is the purpose of a **vesting** clause in a founding team?",
        choices: [
            "Shares are only fully earned over time, so that a founder who leaves early does not keep the full stake.",
            "It secures the investor a veto right over all decisions.",
            "It sets the level of the founders' salaries.",
            "It obliges the founders to work a minimum number of hours per week.",
        ],
        correct: 0,
        explanation: "Four years of vesting with a one-year cliff is typical — protection for the remaining team and for the investors.",
    },
];
