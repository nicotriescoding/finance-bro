import type { Question } from "@/lib/questions/types";
import { eur, n, n2, pct } from "./_helpers";

/**
 * Economics 1 - Microeconomics.
 *
 * Built from real TUM course material under the copyright-redesign policy:
 * the Economics I exercise exam WT22/23 (Prof. Schwenen) plus the W22/23
 * tutorial problem sets 2-13, the Economics I exam WS19/20 (Prof.
 * Kurschilgen, with model solution), the Economics I eTest W20/21 (with
 * answer key) and the micro blocks 1-5 of the Principles of Economics
 * exercise exams WS17/18 = WS20/21 (von Weizsaecker / Feilcke; the macro
 * blocks 6-8 belong to Econ 2 and were left out on purpose). Every question keeps only the
 * tested competency and the standard lecture formulas. Scenarios, names,
 * goods, wording and all numbers are new - every question draws its
 * figures from the seeded rng. `source` records provenance only.
 * Numeric-only for now: the choice questions were removed on 2026-08-28
 * per Nico (recoverable from git, commits ed4eb4f + 560c0a0).
 */
// ---- helpers for the seeded draws added 2026-09-02 ----
/** Greatest common divisor - keeps the greedy split in the joint-PPF question clean. */
const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));

type Pair = readonly [number, number];

/**
 * Minutes per unit as [t_X, t_Y], grouped by the opportunity cost of ONE unit
 * of good Y measured in units of good X (= t_Y / t_X). Drawing distinct groups
 * guarantees by construction that the producers' opportunity costs differ.
 */
const OC_Y_GROUPS: { oc: number; pairs: Pair[] }[] = [
    { oc: 0.4, pairs: [[10, 4], [15, 6], [20, 8], [30, 12]] },
    { oc: 0.5, pairs: [[8, 4], [10, 5], [12, 6], [20, 10], [24, 12]] },
    { oc: 0.75, pairs: [[8, 6], [12, 9], [16, 12], [20, 15]] },
    { oc: 0.8, pairs: [[5, 4], [10, 8], [15, 12], [25, 20], [30, 24]] },
    { oc: 1.2, pairs: [[5, 6], [10, 12], [15, 18], [20, 24], [25, 30]] },
    { oc: 1.25, pairs: [[4, 5], [8, 10], [12, 15], [16, 20], [24, 30]] },
    { oc: 1.5, pairs: [[4, 6], [6, 9], [8, 12], [10, 15], [12, 18], [20, 30]] },
    { oc: 1.6, pairs: [[5, 8], [10, 16], [15, 24]] },
    { oc: 2.4, pairs: [[5, 12], [10, 24]] },
    { oc: 2.5, pairs: [[4, 10], [6, 15], [8, 20], [10, 25], [12, 30]] },
    { oc: 3.5, pairs: [[4, 14], [6, 21], [8, 28]] },
];

/**
 * Same idea, but grouped by the opportunity cost of one unit of good X in
 * units of good Y (= t_X / t_Y), and every t_Y divides 60 so the hourly output
 * of good Y is an integer.
 */
const OC_X_GROUPS: { oc: number; pairs: Pair[] }[] = [
    { oc: 0.4, pairs: [[4, 10], [6, 15], [8, 20], [12, 30]] },
    { oc: 0.5, pairs: [[5, 10], [6, 12], [10, 20], [15, 30]] },
    { oc: 0.6, pairs: [[6, 10], [9, 15], [12, 20], [18, 30]] },
    { oc: 0.75, pairs: [[9, 12], [15, 20]] },
    { oc: 0.8, pairs: [[4, 5], [8, 10], [12, 15], [16, 20], [24, 30]] },
    { oc: 1.2, pairs: [[6, 5], [12, 10], [18, 15], [24, 20], [36, 30]] },
    { oc: 1.25, pairs: [[5, 4], [15, 12], [25, 20]] },
    { oc: 1.5, pairs: [[6, 4], [9, 6], [15, 10], [18, 12], [30, 20]] },
    { oc: 2, pairs: [[8, 4], [10, 5], [12, 6], [20, 10], [24, 12], [30, 15], [40, 20]] },
    { oc: 2.5, pairs: [[10, 4], [15, 6], [25, 10], [30, 12]] },
    { oc: 3, pairs: [[12, 4], [15, 5], [18, 6], [30, 10], [36, 12]] },
    { oc: 4, pairs: [[16, 4], [20, 5], [24, 6], [40, 10]] },
];

/**
 * As OC_X_GROUPS, but every minute figure divides 60, 120 AND 180, so a whole
 * shift of T minutes always converts into an integer maximum output.
 */
const OC_T_GROUPS: { oc: number; pairs: Pair[] }[] = [
    { oc: 0.25, pairs: [[5, 20]] },
    { oc: 0.3, pairs: [[6, 20]] },
    { oc: 0.4, pairs: [[6, 15]] },
    { oc: 0.5, pairs: [[5, 10], [6, 12], [10, 20]] },
    { oc: 0.6, pairs: [[6, 10], [12, 20]] },
    { oc: 0.75, pairs: [[15, 20]] },
    { oc: 0.8, pairs: [[12, 15]] },
    { oc: 1.2, pairs: [[6, 5], [12, 10]] },
    { oc: 1.25, pairs: [[15, 12]] },
    { oc: 1.5, pairs: [[15, 10]] },
    { oc: 2, pairs: [[10, 5], [12, 6], [20, 10]] },
    { oc: 2.4, pairs: [[12, 5]] },
    { oc: 2.5, pairs: [[15, 6]] },
    { oc: 3, pairs: [[15, 5]] },
    { oc: 4, pairs: [[20, 5]] },
];
/** `L^{3/4}`, or plain `L` when the exponent is 1. Used by the returns-to-scale item. */
const powTex = (base: string, num: number, den: number) =>
    den === 1 ? (num === 1 ? base : `${base}^{${num}}`) : `${base}^{${num}/${den}}`;

/** `\frac{3}{4}`, or a bare `1` when the denominator is 1. */
const fracTex = (num: number, den: number) => (den === 1 ? `${num}` : String.raw`\frac{${num}}{${den}}`);


/**
 * Labour-leisure tuples [p, w, m] for the compensated-bundle items: the new
 * wage is w' = p * m and the time budget is Z = p (m+1)^2 (p + w). Then the
 * old optimum F_0 = p^2 (m+1)^2 and q_0 = (w (m+1))^2 are perfect squares, so
 * U_0 = (m+1)(p+w) and the compensated bundle are integers too, and Z stays
 * inside 30..168 hours. The source exam's (p, w, Z) = (1, 5, 24) is not in
 * the list.
 */
const LABOR_TUPLES = [
    [1, 3, 2],
    [1, 4, 2],
    [1, 5, 2],
    [1, 6, 2],
    [1, 8, 2],
    [1, 10, 2],
    [1, 12, 2],
    [1, 2, 3],
    [1, 4, 3],
    [1, 5, 3],
    [1, 6, 3],
    [1, 8, 3],
    [1, 2, 4],
    [1, 3, 4],
    [1, 5, 4],
    [1, 2, 5],
    [1, 3, 5],
    [2, 3, 2],
    [2, 5, 2],
    [2, 6, 2],
    [2, 3, 3],
    [3, 2, 2],
] as const;

/** Cobb-Douglas exponent pairs [a-numerator, b-numerator, denominator], a + b = 1. */
const CD_SHARES = [
    [1, 1, 2],
    [1, 2, 3],
    [2, 1, 3],
    [1, 3, 4],
    [3, 1, 4],
] as const;
/** Coefficient in front of a variable: "3\," for 3, "" for 1 (prints "Q", not "1 Q"). */
const co = (v: number) => (v === 1 ? "" : `${n(v)}\\,`);

export const econ1Questions: Question[] = [
    // ------------------------------------------------ comparative advantage
    {
        id: "e1-ca-specialization-total",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exercise Exam WT22/23, Q3",
        build: (rng) => {
            const cA = rng.int(12, 20) * 100; // Ava: chairs if only chairs
            const tA = rng.int(2, 4) * 100; // Ava: tables if only tables
            const cB = rng.int(8, 12) * 100; // Ben: chairs if only chairs
            const tB = rng.int(6, 10) * 100; // Ben: tables if only tables
            // opportunity cost of a table (in chairs): Ava >= 3, Ben <= 2 by construction
            const answer = cA + tB;
            return {
                prompt: `Two carpenters share a workshop. Working alone for a month, Ava can build ${n(cA)} chairs **or** ${n(tA)} tables, while Ben can build ${n(cB)} chairs **or** ${n(tB)} tables. Each specializes fully in the good in which they hold the comparative advantage. How many pieces of furniture (chairs plus tables) does the workshop produce in total per month?`,
                given: {
                    "Ava: chairs or tables": `${n(cA)} or ${n(tA)}`,
                    "Ben: chairs or tables": `${n(cB)} or ${n(tB)}`,
                },
                answer,
                explanation: String.raw`Each producer specializes where their opportunity cost is lowest: $OC_{\text{table}} = \frac{\text{chairs given up}}{\text{tables gained}}$. Ava's opportunity cost of a table is ${n(cA)} / ${n(tA)} = ${n2(cA / tA)} chairs, Ben's is ${n(cB)} / ${n(tB)} = ${n2(cB / tB)} chairs. Ben's is lower, so Ben builds only tables (${n(tB)}) and Ava builds only chairs (${n(cA)}). Total output: ${n(cA)} + ${n(tB)} = ${n(answer)} pieces.`,
            };
        },
    },
    {
        id: "e1-ca-trade-price-bound",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "medium",
        kind: "numeric",
        unit: "ratio",
        source: "TUM Economics I Exercise Exam WT22/23, Q5",
        build: (rng) => {
            const yA = rng.int(3, 6) * 100; // Livonia: barrels of oil
            const mult = rng.pick([3, 4, 5]); // Livonia's opportunity cost of oil (sacks of grain)
            const xA = yA * mult; // Livonia: sacks of grain
            const yB = rng.int(6, 10) * 100; // Carinia: barrels of oil
            const fac = rng.pick([1, 1.5, 2]); // Carinia's opportunity cost of oil
            const xB = yB * fac; // Carinia: sacks of grain
            return {
                prompt: `Livonia can produce ${n(xA)} sacks of grain **or** ${n(yA)} barrels of olive oil per year; Carinia can produce ${n(xB)} sacks of grain **or** ${n(yB)} barrels of olive oil. They want to trade oil for grain. What is the **maximum** price of one barrel of oil, measured in sacks of grain, at which both countries still gain from trade?`,
                given: {
                    "Livonia: grain or oil": `${n(xA)} or ${n(yA)}`,
                    "Carinia: grain or oil": `${n(xB)} or ${n(yB)}`,
                },
                answer: mult,
                explanation: String.raw`Both gain only if the relative price lies between the two opportunity costs: $OC_{\text{Carinia}} < p_{\text{oil}} < OC_{\text{Livonia}}$. Opportunity cost of one barrel of oil: Livonia ${n(xA)} / ${n(yA)} = ${n(mult)} sacks, Carinia ${n(xB)} / ${n(yB)} = ${n(fac)} sacks. Carinia (the low-cost producer) sells oil, and Livonia will pay at most its own opportunity cost. The mutually beneficial range is ${n(fac)} to ${n(mult)} sacks per barrel, so the maximum price is ${n(mult)}.`,
            };
        },
    },

    // ------------------------------------------------------- consumer theory
    {
        id: "e1-ct-cobb-douglas-demand",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exercise Exam WT22/23, Q11",
        build: (rng) => {
            const pair = rng.pick([
                [1, 4],
                [3, 4],
                [1, 3],
                [2, 3],
                [1, 2],
            ] as const);
            const [num, den] = pair;
            const p1 = rng.int(2, 8);
            const p2 = rng.int(2, 8);
            const k = rng.int(5, 20);
            const m = p1 * den * k; // makes q1 a clean integer
            const answer = num * k; // = (num/den) * m / p1
            return {
                prompt: String.raw`A student has Cobb-Douglas preferences $U(q_1, q_2) = q_1^{${num}/${den}} \cdot q_2^{${den - num}/${den}}$ over streaming hours ($q_1$) and cinema visits ($q_2$). Her budget is ${eur(m)}, one streaming hour costs ${eur(p1)} and one cinema visit costs ${eur(p2)}. How many streaming hours does she buy at the optimum?`,
                given: {
                    "Budget m": eur(m),
                    "Price $p_1$": eur(p1),
                    "Price $p_2$": eur(p2),
                },
                answer,
                explanation: String.raw`With Cobb-Douglas utility $U = q_1^{a} q_2^{b}$ and $a + b = 1$, each exponent is the expenditure share: $q_1^* = a \cdot \frac{m}{p_1}$. Here $a = \frac{${num}}{${den}}$, so $q_1^*$ = ${n(num)}/${n(den)} · ${eur(m)} / ${eur(p1)} = ${n(answer)} hours. (Analogously $q_2^* = \frac{${den - num}}{${den}} \cdot \frac{m}{p_2}$ = ${n2(((den - num) / den) * (m / p2))}.)`,
            };
        },
    },
    {
        id: "e1-ct-indirect-utility",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "hard",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics I Exercise Exam WT22/23, Q12",
        build: (rng) => {
            const pair = rng.pick([
                [1, 4],
                [3, 4],
                [1, 3],
                [2, 3],
                [1, 2],
            ] as const);
            const [num, den] = pair;
            const a = num / den;
            const b = (den - num) / den;
            const p1 = rng.int(2, 5);
            const p1New = 2 * p1; // the price of good 1 doubles
            const p2 = rng.int(3, 8);
            const k = rng.int(4, 12);
            const m = p1New * den * k; // q1 stays a clean integer at the NEW price
            const q1 = num * k;
            const q2 = (b * m) / p2;
            const answer = q1 ** a * q2 ** b;
            return {
                prompt: String.raw`A consumer with utility $U(q_1, q_2) = q_1^{${num}/${den}} \cdot q_2^{${den - num}/${den}}$ has income ${eur(m)}. The price of good 2 is ${eur(p2)}. The price of good 1 has just **doubled** from ${eur(p1)} to ${eur(p1New)}. What utility level does she reach at the new prices (her indirect utility)?`,
                given: {
                    "Income m": eur(m),
                    "New price $p_1$": eur(p1New),
                    "Price $p_2$": eur(p2),
                },
                answer,
                explanation: String.raw`First find the new optimal bundle from the expenditure shares $q_1^* = a \cdot \frac{m}{p_1}$, $q_2^* = b \cdot \frac{m}{p_2}$, then evaluate $U$ at that bundle. Here $q_1^*$ = ${n(num)}/${n(den)} · ${eur(m)} / ${eur(p1New)} = ${n(q1)} and $q_2^*$ = ${n(den - num)}/${n(den)} · ${eur(m)} / ${eur(p2)} = ${n2(q2)}. Utility: $U = q_1^{*\,${num}/${den}} \cdot q_2^{*\,${den - num}/${den}}$ = ${n2(q1)}^${n(a)} · ${n2(q2)}^${n(b)} = ${n2(answer)}. Only good 1's demand falls - with Cobb-Douglas preferences the price change does not shift spending across goods.`,
            };
        },
    },

    // -------------------------------------------- production & cost minimum
    {
        id: "e1-pc-cost-minimization",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exercise Exam WT22/23, Q22",
        build: (rng) => {
            const a = rng.pick([2, 4]); // technology coefficient
            const s = rng.int(1, 3); // wage-rental ratio w/r
            const r = rng.pick([5, 10, 20]);
            const w = s * r;
            const L = rng.int(6, 14);
            const coef = s * a + 1; // Q = (sa + 1) L^2 at the optimum
            const Q = coef * L * L;
            const K = ((s * a + 2) / a) * L;
            return {
                prompt: String.raw`A workshop produces with the technology $Q = ${a} K L - L^2$. The wage is ${eur(w)} per unit of labor and the rental rate of capital is ${eur(r)}. It must deliver an output of ${n(Q)} units at minimum cost. How much **labor** $L$ does it hire?`,
                given: {
                    "Technology": String.raw`$Q = ${a} K L - L^2$`,
                    "Wage w": eur(w),
                    "Rental rate r": eur(r),
                    "Required output Q": `${n(Q)} units`,
                },
                answer: L,
                explanation: String.raw`Cost minimization requires $MRTS_{L,K} = \frac{MP_L}{MP_K} = \frac{w}{r}$. Here $MP_L = ${a}K - 2L$ and $MP_K = ${a}L$, so $\frac{${a}K - 2L}{${a}L} = ${n(s)}$, which gives $K = ${n((s * a + 2) / a)}\, L$. Substituting into the technology: $Q = ${a} K L - L^2 = ${n(coef)}\, L^2$, so $L = \sqrt{Q / ${n(coef)}}$ = ${n(L)} units (and $K$ = ${n2(K)}).`,
            };
        },
    },

    // ---------------------------------------------------- perfect competition
    {
        id: "e1-pc-shortrun-loss",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q23",
        build: (rng) => {
            const c2 = rng.pick([0.2, 0.25, 0.5]);
            const c1 = rng.int(6, 14);
            const q = rng.int(4, 10);
            const p = c1 + 2 * c2 * q; // price such that MC = p at q
            const vp = c2 * q * q; // variable profit (p - AVC) * q area
            const loss = rng.int(2, 8) * 10;
            const F = vp + loss; // fixed cost chosen so profit = -loss < 0
            return {
                prompt: String.raw`A price-taking brewery has short-run costs $C(q) = ${n(c2)} q^2 + ${n(c1)} q + ${n(F)}$. The market price is ${eur(p)} per crate. What profit does it earn at its optimal short-run output? (A loss is a negative number.)`,
                given: {
                    "Cost function": String.raw`$C(q) = ${n(c2)} q^2 + ${n(c1)} q + ${n(F)}$`,
                    "Market price p": eur(p),
                },
                answer: -loss,
                explanation: String.raw`A competitive firm produces where $p = MC(q)$, then $\pi = p \cdot q - C(q)$. Here $MC = ${n(2 * c2)} q + ${n(c1)} = $ ${n(p)} gives $q^*$ = ${n(q)}. Profit: ${eur(p * q)} − ${eur(vp + c1 * q + F)} = ${eur(-loss)}. The firm still produces in the short run: $p > AVC = ${n(c2)} q + ${n(c1)}$ (= ${eur(c2 * q + c1)} at $q^*$), so operating covers all variable cost plus part of the fixed cost - shutting down would lose the full ${eur(F)}.`,
            };
        },
    },
    {
        id: "e1-pc-longrun-entry-price",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q24",
        build: (rng) => {
            const c2 = rng.pick([0.2, 0.25, 0.5]);
            const qm = rng.int(1, 3) * 10; // output at minimum average cost
            const F = c2 * qm * qm; // integer by construction
            const c1 = rng.int(4, 12);
            const answer = c1 + 2 * c2 * qm; // min AC
            return {
                prompt: String.raw`Firms in a competitive market all have the cost function $C(q) = ${n(c2)} q^2 + ${n(c1)} q + ${n(F)}$. In the long run, firms enter whenever the market price lies above a threshold and exit below it. What is this **break-even price**?`,
                given: {
                    "Cost function": String.raw`$C(q) = ${n(c2)} q^2 + ${n(c1)} q + ${n(F)}$`,
                },
                answer,
                explanation: String.raw`The long-run entry/exit threshold is the minimum of average cost: $AC(q) = ${n(c2)} q + ${n(c1)} + \frac{${n(F)}}{q}$, minimized where $${n(c2)} = \frac{${n(F)}}{q^2}$, i.e. $q^* = \sqrt{F / ${n(c2)}}$ = ${n(qm)}. There $AC = $ ${n(c2)} · ${n(qm)} + ${n(c1)} + ${n(F)}/${n(qm)} = ${eur(answer)}. Above this price firms earn profit and entry occurs; below it they exit.`,
            };
        },
    },
    {
        id: "e1-pc-scale-economies",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exercise Exam WT22/23, Q25",
        build: (rng) => {
            const c2 = rng.pick([0.2, 0.25, 0.5]);
            const qm = rng.int(1, 3) * 10;
            const F = c2 * qm * qm;
            const c1 = rng.int(5, 15);
            return {
                prompt: String.raw`A firm produces with the cost function $C(q) = ${n(c2)} q^2 + ${n(c1)} q + ${n(F)}$. Up to which output level does the firm enjoy **economies of scale** (falling average cost)?`,
                given: {
                    "Cost function": String.raw`$C(q) = ${n(c2)} q^2 + ${n(c1)} q + ${n(F)}$`,
                },
                answer: qm,
                explanation: String.raw`Economies of scale last while $AC(q) = ${n(c2)} q + ${n(c1)} + \frac{${n(F)}}{q}$ is falling; they are exhausted at the minimum, where $\frac{dAC}{dq} = ${n(c2)} - \frac{${n(F)}}{q^2} = 0$, i.e. $q^* = \sqrt{F / c_2}$ = √(${n(F)} / ${n(c2)}) = ${n(qm)} units. Below ${n(qm)} the spread of the fixed cost dominates and AC falls; above it the rising marginal cost dominates.`,
            };
        },
    },
    {
        id: "e1-pc-longrun-firm-output",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exercise Exam WT22/23, Q27",
        build: (rng) => {
            const qm = 2 * rng.int(3, 7); // 6..14, even so F is an integer
            const F = (qm * qm) / 2;
            return {
                prompt: String.raw`Every firm in a competitive industry has the cost function $C(q) = 0.5 q^2 + ${n(F)}$, and entry and exit are free. How much does each firm produce in the **long-run equilibrium**?`,
                given: {
                    "Cost function": String.raw`$C(q) = 0.5 q^2 + ${n(F)}$`,
                },
                answer: qm,
                explanation: String.raw`Free entry drives price down to minimum average cost, so each firm produces at the minimum of $AC(q) = 0.5 q + \frac{F}{q}$. Setting $0.5 = \frac{F}{q^2}$ gives $q^* = \sqrt{2F}$ = √(2 · ${n(F)}) = ${n(qm)} units. At any other output AC would exceed the market price and the firm would make a loss.`,
            };
        },
    },

    // ---------------------------------------- market equilibrium, surplus, tax
    {
        id: "e1-mkt-equilibrium-price",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q30",
        build: (rng) => {
            const a = rng.int(3, 6) * 10; // supply slope
            const p0 = rng.int(1, 3); // supply choke price
            const b = a * p0; // supply intercept
            const gap = rng.int(4, 6);
            const pStar = p0 + gap;
            const d = rng.int(3, 6) * 10; // demand slope
            const Q = a * gap;
            const c = Q + d * pStar; // demand intercept
            return {
                prompt: String.raw`In the market for reusable coffee cups, supply is $Q_S = ${n(a)} p - ${n(b)}$ and demand is $Q_D = ${n(c)} - ${n(d)} p$. What is the equilibrium price?`,
                given: {
                    "Supply": String.raw`$Q_S = ${n(a)} p - ${n(b)}$`,
                    "Demand": String.raw`$Q_D = ${n(c)} - ${n(d)} p$`,
                },
                answer: pStar,
                explanation: String.raw`In equilibrium $Q_S = Q_D$: $${n(a)} p - ${n(b)} = ${n(c)} - ${n(d)} p$, so $p^* = \frac{${n(c)} + ${n(b)}}{${n(a)} + ${n(d)}}$ = ${eur(pStar)}. The equilibrium quantity is $Q^*$ = ${n(a)} · ${n(pStar)} − ${n(b)} = ${n(Q)} cups.`,
            };
        },
    },
    {
        id: "e1-mkt-consumer-surplus",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q31",
        build: (rng) => {
            const a = rng.int(3, 6) * 10;
            const p0 = rng.int(1, 3);
            const b = a * p0;
            const gap = rng.int(4, 6);
            const pStar = p0 + gap;
            const d = rng.int(3, 6) * 10;
            const Q = a * gap;
            const c = Q + d * pStar;
            const pMax = c / d; // demand choke price
            const answer = 0.5 * (pMax - pStar) * Q; // = Q^2 / (2d)
            return {
                prompt: String.raw`In the market for phone chargers, supply is $Q_S = ${n(a)} p - ${n(b)}$ and demand is $Q_D = ${n(c)} - ${n(d)} p$. Compute the **consumer surplus** in the market equilibrium.`,
                given: {
                    "Supply": String.raw`$Q_S = ${n(a)} p - ${n(b)}$`,
                    "Demand": String.raw`$Q_D = ${n(c)} - ${n(d)} p$`,
                },
                answer,
                explanation: String.raw`$CS = \frac{1}{2} \left( p_{max} - p^* \right) \cdot Q^*$, where $p_{max}$ is the demand choke price. Equilibrium: $p^* = \frac{${n(c)} + ${n(b)}}{${n(a)} + ${n(d)}}$ = ${eur(pStar)} with $Q^*$ = ${n(Q)}. Choke price: $p_{max} = \frac{${n(c)}}{${n(d)}}$ = ${n2(pMax)}. So CS = ½ · (${n2(pMax)} − ${n(pStar)}) · ${n(Q)} = ${eur(answer)}. (The producer surplus would be the triangle above the supply curve: ½ · (${n(pStar)} − ${n(p0)}) · ${n(Q)} = ${eur(0.5 * (pStar - p0) * Q)}.)`,
            };
        },
    },
    {
        id: "e1-mkt-ad-valorem-tax",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q32",
        build: (rng) => {
            const a = rng.int(3, 6) * 10;
            const p0 = rng.int(1, 3);
            const b = a * p0;
            const gap = rng.int(4, 6);
            const pStar = p0 + gap;
            const d = rng.int(3, 6) * 10;
            const c = a * gap + d * pStar;
            const t = rng.pick([10, 20, 25, 50]); // ad-valorem rate in percent
            const tau = 1 + t / 100;
            const pS = (c + b) / (a + d * tau); // net producer price
            const answer = tau * pS; // gross consumer price
            return {
                prompt: String.raw`In the market for e-scooter rides, supply is $Q_S = ${n(a)} p_S - ${n(b)}$ and demand is $Q_D = ${n(c)} - ${n(d)} p_D$. The government introduces an **ad-valorem tax of ${pct(t)} on consumers**, so the gross price is $p_D = ${n(tau)} \cdot p_S$. What price do consumers pay (including tax) in the new equilibrium?`,
                given: {
                    "Supply": String.raw`$Q_S = ${n(a)} p_S - ${n(b)}$`,
                    "Demand": String.raw`$Q_D = ${n(c)} - ${n(d)} p_D$`,
                    "Tax rate t": pct(t),
                },
                answer,
                explanation: String.raw`With an ad-valorem tax on consumers, $p_D = (1 + t) \cdot p_S$; set $Q_S(p_S) = Q_D(p_D)$ and solve for the net price: $${n(a)} p_S - ${n(b)} = ${n(c)} - ${n(d)} \cdot ${n(tau)}\, p_S$, so $p_S = \frac{${n(c)} + ${n(b)}}{${n(a)} + ${n(d)} \cdot ${n(tau)}}$ = ${n2(pS)}. Consumers pay $p_D = ${n(tau)} \cdot p_S$ = ${eur(answer)}. Both sides bear part of the tax: without it the price was ${eur(pStar)} - producers now net less, consumers pay more.`,
            };
        },
    },
    {
        id: "e1-mkt-unit-tax-dwl",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q34",
        build: (rng) => {
            const d = rng.int(4, 8); // demand slope
            const s = rng.int(3, 6); // supply slope
            const t = rng.int(2, 5); // per-unit tax
            const pStar = rng.int(15, 30);
            const hi = Math.min(80, s * pStar - 5);
            const Q0 = rng.int(25, hi);
            const A = Q0 + d * pStar; // demand intercept
            const B = s * pStar - Q0; // supply intercept (>= 5 by construction)
            const dQ = (d * s * t) / (d + s); // drop in quantity
            const Q1 = Q0 - dQ;
            const pD = pStar + (s * t) / (d + s); // new consumer price
            const answer = 0.5 * t * dQ;
            return {
                prompt: String.raw`In the market for board games, demand is $Q_D = ${n(A)} - ${n(d)} p$ and supply is $Q_S = ${n(s)} p - ${n(B)}$. The government levies a per-unit tax of ${eur(t)} **on producers**. What is the deadweight loss of the tax?`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(A)} - ${n(d)} p$`,
                    "Supply": String.raw`$Q_S = ${n(s)} p - ${n(B)}$`,
                    "Per-unit tax t": eur(t),
                },
                answer,
                explanation: String.raw`$DWL = \frac{1}{2} \cdot t \cdot \left( Q_0 - Q_1 \right)$ - the triangle between the old and new quantity. Without the tax: $p^* = \frac{${n(A)} + ${n(B)}}{${n(d)} + ${n(s)}}$ = ${eur(pStar)} and $Q_0$ = ${n(Q0)}. With the tax, producers receive $p - ${n(t)}$, so $${n(A)} - ${n(d)} p = ${n(s)}(p - ${n(t)}) - ${n(B)}$ gives the consumer price $p_D$ = ${n2(pD)} and $Q_1$ = ${n2(Q1)}. DWL = ½ · ${n(t)} · (${n(Q0)} − ${n2(Q1)}) = ${eur(answer)} - these are the trades that were mutually beneficial but no longer happen.`,
            };
        },
    },

    // ---------------------------------------------------------------- monopoly
    {
        id: "e1-mono-optimal-quantity",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exercise Exam WT22/23, Q36",
        build: (rng) => {
            const beta = rng.pick([2, 4]); // demand slope
            const gamma = rng.pick([1, 2]); // MC slope
            const Qstar = rng.int(40, 75);
            const cc = rng.int(1, 2) * 100; // MC intercept
            const alpha = cc + Qstar * (2 * beta + gamma); // <= 950 by construction
            const FC = rng.int(1, 5) * 100;
            return {
                prompt: String.raw`A patent-holding pharma firm is the sole seller of a drug. Inverse demand is $P = ${n(alpha)} - ${n(beta)} Q$, marginal cost is $MC = ${n(gamma)} Q + ${n(cc)}$, and fixed cost is ${eur(FC)}. Which quantity maximizes its profit?`,
                given: {
                    "Inverse demand": String.raw`$P = ${n(alpha)} - ${n(beta)} Q$`,
                    "Marginal cost": String.raw`$MC = ${n(gamma)} Q + ${n(cc)}$`,
                    "Fixed cost": eur(FC),
                },
                answer: Qstar,
                explanation: String.raw`A monopolist produces where $MR = MC$, and with linear demand MR has twice the slope: $MR = ${n(alpha)} - ${n(2 * beta)} Q$. Setting $${n(alpha)} - ${n(2 * beta)} Q = ${n(gamma)} Q + ${n(cc)}$ gives $Q^* = \frac{${n(alpha)} - ${n(cc)}}{${n(2 * beta + gamma)}}$ = ${n(Qstar)} units. The fixed cost is irrelevant for the output choice - it shifts profit, not marginal profit.`,
            };
        },
    },
    {
        id: "e1-mono-profit-tax-rate",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics I Exercise Exam WT22/23, Q37",
        build: (rng) => {
            const beta = rng.pick([2, 4]);
            const gamma = 2; // keeps the cost function's quadratic term clean
            const Qstar = 2 * rng.int(20, 39); // even, so alpha is divisible by beta
            const cc = rng.pick([100, 200]);
            const alpha = cc + Qstar * (2 * beta + gamma);
            const A = alpha / beta; // integer by construction
            const k = 1 / beta;
            const FC = rng.int(1, 5) * 100;
            const Pstar = alpha - beta * Qstar;
            const profit = Qstar * Qstar * (beta + 1) - FC; // (gamma = 2)
            const rate = rng.pick([20, 25, 40, 50]);
            const T = (profit * rate) / 100;
            return {
                prompt: String.raw`A monopoly ferry operator faces the demand $Q = ${n(A)} - ${n(k)} P$. Its marginal cost is $MC = ${n(gamma)} Q + ${n(cc)}$ and its fixed cost is ${eur(FC)}. The government taxes its profit proportionally and collects ${eur(T)}. What is the profit tax rate (in percent)?`,
                given: {
                    "Demand": String.raw`$Q = ${n(A)} - ${n(k)} P$`,
                    "Marginal cost": String.raw`$MC = ${n(gamma)} Q + ${n(cc)}$`,
                    "Fixed cost": eur(FC),
                    "Tax revenue": eur(T),
                },
                answer: rate,
                explanation: String.raw`The rate is $t = \frac{T}{\pi^*}$, so first find the monopoly profit. Inverting demand: $P = ${n(alpha)} - ${n(beta)} Q$, so $MR = ${n(alpha)} - ${n(2 * beta)} Q$. $MR = MC$: $${n(alpha)} - ${n(2 * beta)} Q = ${n(gamma)} Q + ${n(cc)}$ gives $Q^*$ = ${n(Qstar)} and $P^*$ = ${eur(Pstar)}. Cost: $C(Q) = Q^2 + ${n(cc)} Q + ${n(FC)}$ (integrating MC and adding the fixed cost). Profit: ${eur(Pstar * Qstar)} − ${eur(Qstar * Qstar + cc * Qstar + FC)} = ${eur(profit)}. Rate: ${eur(T)} / ${eur(profit)} = ${pct(rate)}.`,
            };
        },
    },
    {
        id: "e1-mono-unit-tax-revenue",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q38",
        build: (rng) => {
            const beta = rng.pick([2, 3]);
            const gamma = rng.pick([1, 2]);
            const Qt = rng.int(30, 60); // quantity with the tax in place
            const cc = rng.int(1, 2) * 100;
            const t = rng.int(5, 12) * 10;
            const alpha = cc + t + Qt * (2 * beta + gamma);
            const answer = t * Qt;
            return {
                prompt: String.raw`A city's only cable-car operator faces inverse demand $P = ${n(alpha)} - ${n(beta)} Q$ and has marginal cost $MC = ${n(gamma)} Q + ${n(cc)}$. The city introduces a **per-unit tax of ${eur(t)}** on every ride sold. How much tax revenue does the city collect when the operator re-optimizes?`,
                given: {
                    "Inverse demand": String.raw`$P = ${n(alpha)} - ${n(beta)} Q$`,
                    "Marginal cost": String.raw`$MC = ${n(gamma)} Q + ${n(cc)}$`,
                    "Per-unit tax t": eur(t),
                },
                answer,
                explanation: String.raw`Tax revenue is $T = t \cdot Q_t$, where $Q_t$ solves $MR = MC + t$ - the per-unit tax shifts marginal cost up by $t$. $MR = ${n(alpha)} - ${n(2 * beta)} Q$, so $${n(alpha)} - ${n(2 * beta)} Q = ${n(gamma)} Q + ${n(cc)} + ${n(t)}$ gives $Q_t = \frac{${n(alpha)} - ${n(cc)} - ${n(t)}}{${n(2 * beta + gamma)}}$ = ${n(Qt)} rides. Revenue: ${eur(t)} · ${n(Qt)} = ${eur(answer)}.`,
            };
        },
    },

    // ------------------------------------ opportunity cost & Pareto efficiency
    {
        id: "e1-oc-min-benefit",
        subject: "econ1",
        topic: "opportunity_cost",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I W22/23, Problem Set 2, T1",
        build: (rng) => {
            const ticket = rng.int(6, 15);
            const wage = rng.int(16, 30);
            const effort = rng.int(5, wage - 8); // job surplus >= 8 ...
            const jobSurplus = wage - effort;
            const home = rng.int(3, jobSurplus - 2); // ... and strictly the best alternative
            const pass = rng.int(30, 60);
            const answer = ticket + jobSurplus;
            return {
                prompt: `Jonas can spend Saturday evening in one of three ways: (i) attend a jazz concert (ticket ${eur(ticket)}; he would get there with the annual transit pass he already bought for ${eur(pass)}), (ii) play video games at home, which is worth a benefit of ${eur(home)} to him, or (iii) help a neighbor move furniture for a payment of ${eur(wage)}, where the effort feels like a cost of ${eur(effort)} to him. What is the minimum benefit the concert must provide so that Jonas chooses option (i)?`,
                given: {
                    "Concert ticket": eur(ticket),
                    "Transit pass (already bought)": eur(pass),
                    "Benefit of gaming": eur(home),
                    "Moving job: pay / effort cost": `${eur(wage)} / ${eur(effort)}`,
                },
                answer,
                explanation: String.raw`He picks the concert only if its surplus beats the best alternative: $b_{\text{concert}} - \text{expenditure} \geq \text{opportunity cost}$, where the opportunity cost is the highest surplus among the alternatives forgone. Gaming is worth ${eur(home)}; the moving job yields a producer surplus of ${eur(wage)} − ${eur(effort)} = ${eur(jobSurplus)} — the best alternative. The transit pass is a **sunk cost**: it was bought either way and never enters the decision. The concert must therefore be worth at least its expenditure plus the forgone surplus: ${eur(ticket)} + ${eur(jobSurplus)} = ${eur(answer)}.`,
            };
        },
    },

    // ------------------------------------------- comparative advantage (cont.)
    {
        id: "e1-ca-autarky-assembly",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I W22/23, Problem Set 3, T2",
        build: (rng) => {
            const a = rng.int(2, 4); // cases per hour
            const b = a + rng.int(1, 3); // movements per hour
            const k = rng.int(4, 9);
            const T = k * (a + b);
            const answer = k * a * b;
            return {
                prompt: String.raw`Marta assembles mechanical watches; every watch needs exactly **one case and one movement**. Per hour she can machine either ${n(a)} cases or ${n(b)} movements. In a working month of ${n(T)} hours, producing both parts herself, how many complete watches can she assemble at most?`,
                given: {
                    "Cases per hour": n(a),
                    "Movements per hour": n(b),
                    "Hours available": n(T),
                },
                answer,
                explanation: String.raw`With one of each part per watch, output solves $x = y$ together with the time constraint $\frac{x}{a} + \frac{y}{b} = T$, so $y = \frac{a \cdot b}{a + b} \cdot T$. Substituting: (${n(a)} · ${n(b)}) / (${n(a)} + ${n(b)}) · ${n(T)} = ${n(answer)} watches. Equivalently, the time split must be proportional to how long each part takes: movements get $\frac{a}{a+b}$ of the hours, cases the rest — producing equal numbers of both.`,
            };
        },
    },

    // ------------------------------------------------ consumer theory (cont.)
    {
        id: "e1-ct-mrs-cobb-douglas",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "easy",
        kind: "numeric",
        unit: "ratio",
        source: "TUM Economics I W22/23, Problem Set 4, T2",
        build: (rng) => {
            const pair = rng.pick([
                [1, 2],
                [2, 1],
                [1, 3],
                [3, 1],
                [2, 3],
                [3, 2],
            ] as const);
            const [aExp, bExp] = pair;
            const q1 = rng.int(2, 9);
            const q2 = rng.int(2, 9);
            const answer = (aExp * q2) / (bExp * q1);
            return {
                prompt: String.raw`A consumer has the utility function $U(q_1, q_2) = q_1^{${aExp}} \cdot q_2^{${bExp}}$. At the bundle $(q_1, q_2) = (${n(q1)},\; ${n(q2)})$, how many units of good 2 is she willing to give up for one additional unit of good 1 — the absolute value of the marginal rate of substitution $|MRS_{1,2}|$?`,
                given: {
                    "Utility": String.raw`$U = q_1^{${aExp}} \cdot q_2^{${bExp}}$`,
                    "Bundle $(q_1, q_2)$": `(${n(q1)}, ${n(q2)})`,
                },
                answer,
                explanation: String.raw`$|MRS_{1,2}| = \frac{MU_1}{MU_2} = \frac{a \cdot q_2}{b \cdot q_1}$ for $U = q_1^{a} q_2^{b}$: the marginal utilities are $MU_1 = a\, q_1^{a-1} q_2^{b}$ and $MU_2 = b\, q_1^{a} q_2^{b-1}$, and the powers cancel in the ratio. Substituting: (${n(aExp)} · ${n(q2)}) / (${n(bExp)} · ${n(q1)}) = ${n2(answer)}. The MRS is the (absolute) slope of the indifference curve through the bundle — it falls as $q_1$ rises, which is exactly the convexity of the indifference curves.`,
            };
        },
    },
    {
        id: "e1-ct-substitutes-quantity",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I W22/23, Problem Set 5, T2",
        build: (rng) => {
            const alpha = rng.int(1, 3);
            const beta = rng.int(2, 4);
            const p2 = rng.int(2, 6);
            const p1 = Math.ceil((alpha * p2) / beta) + rng.int(1, 3); // ensures MU2/p2 > MU1/p1
            let m = p2 * rng.int(8, 20);
            // Never reproduce the source's own tuple (α=1, β=2, p1=4, p2=5, m=50).
            if (alpha === 1 && beta === 2 && p1 === 4 && p2 === 5 && m === 50) m += p2;
            const answer = m / p2;
            return {
                prompt: String.raw`A commuter treats regional-train tickets ($q_1$) and express-bus tickets ($q_2$) as perfect substitutes with utility $U(q_1, q_2) = ${n(alpha)} q_1 + ${n(beta)} q_2$. A train ticket costs ${eur(p1)}, a bus ticket ${eur(p2)}, and her monthly travel budget is ${eur(m)}. How many **bus tickets** does she buy at the optimum?`,
                given: {
                    "Utility": String.raw`$U = ${n(alpha)} q_1 + ${n(beta)} q_2$`,
                    "Price $p_1$": eur(p1),
                    "Price $p_2$": eur(p2),
                    "Budget m": eur(m),
                },
                answer,
                explanation: String.raw`With linear preferences, compare marginal utility per euro: $\frac{MU_2}{p_2} \gtrless \frac{MU_1}{p_1}$. Here ${n(beta)} / ${n(p2)} = ${n2(beta / p2)} beats ${n(alpha)} / ${n(p1)} = ${n2(alpha / p1)}, so every euro is best spent on bus tickets — a corner solution with $q_1 = 0$ and $q_2 = \frac{m}{p_2}$ = ${eur(m)} / ${eur(p2)} = ${n(answer)} tickets. The tangency condition $MRS = p_1 / p_2$ never holds here, because the MRS is constant along the linear indifference curves.`,
            };
        },
    },
    {
        id: "e1-ct-compensated-income",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I W22/23, Problem Set 5, T3",
        build: (rng) => {
            const px = rng.int(11, 24);
            const py = rng.int(10, 30);
            const pyNew = py + rng.int(5, 20);
            const m = 10 * rng.int(30, 80);
            const xStar = m / (2 * px);
            const yStar = m / (2 * py);
            const uBar = xStar * yStar;
            const answer = m * Math.sqrt(pyNew / py);
            return {
                prompt: String.raw`A household with utility $U(x, y) = x \cdot y$ and income ${eur(m)} faces prices $p_x$ = ${eur(px)} and $p_y$ = ${eur(py)}. Then the price of good $y$ rises to ${eur(pyNew)}. What income would the household need at the **new** prices to reach exactly its **old** utility level?`,
                given: {
                    "Income m": eur(m),
                    "Price $p_x$": eur(px),
                    "Old price $p_y$": eur(py),
                    "New price $p_y'$": eur(pyNew),
                },
                answer,
                explanation: String.raw`The required income is the minimum expenditure that restores the old utility at the new prices: for $U = x \cdot y$ it is $E = 2 \sqrt{p_x \cdot p_y' \cdot \bar{U}}$. Old optimum (each good gets half the budget): $x^* = \frac{m}{2 p_x}$ = ${n2(xStar)}, $y^* = \frac{m}{2 p_y}$ = ${n2(yStar)}, so $\bar{U} = x^* y^*$ = ${n2(uBar)}. Then E = 2 · √(${n(px)} · ${n(pyNew)} · ${n2(uBar)}) = ${eur(answer)} — equivalently $E = m \sqrt{p_y' / p_y}$. The difference of ${eur(answer - m)} to the old income is the compensation the price increase would require.`,
            };
        },
    },

    // -------------------------------------------- elasticities & market (cont.)
    {
        id: "e1-mkt-point-elasticity",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "easy",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics I W22/23, Problem Set 6, T1",
        build: (rng) => {
            const b = rng.int(2, 8);
            const p0 = rng.int(4, 12);
            const Q0 = rng.int(20, 80);
            const a = Q0 + b * p0;
            const answer = (b * p0) / Q0;
            return {
                prompt: String.raw`The demand for museum tickets is $Q_D = ${n(a)} - ${n(b)} p$. What is the **absolute value** of the price elasticity of demand at a price of ${eur(p0)}?`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(a)} - ${n(b)} p$`,
                    "Price p": eur(p0),
                },
                answer,
                explanation: String.raw`$\varepsilon_p = \frac{dQ}{dp} \cdot \frac{p}{Q}$ — slope times price-quantity ratio, evaluated at the point. Quantity at ${eur(p0)}: ${n(a)} − ${n(b)} · ${n(p0)} = ${n(Q0)}, and $\frac{dQ}{dp} = -${n(b)}$. So $|\varepsilon_p|$ = ${n(b)} · ${n(p0)} / ${n(Q0)} = ${n2(answer)}. Values above 1 mean elastic, below 1 inelastic demand — along a linear demand curve the elasticity rises from 0 (at $p = 0$) to infinity (at the choke price), so the same curve is inelastic at low and elastic at high prices.`,
            };
        },
    },
    {
        id: "e1-mkt-unit-elastic-price",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I W22/23, Problem Set 6, T1",
        build: (rng) => {
            const b = rng.int(2, 6);
            const half = rng.int(5, 15);
            const a = 2 * b * half;
            return {
                prompt: String.raw`The demand for open-air-cinema tickets is $Q_D = ${n(a)} - ${n(b)} p$. At which price is demand exactly **unit-elastic** ($|\varepsilon_p| = 1$)?`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(a)} - ${n(b)} p$`,
                },
                answer: half,
                explanation: String.raw`Along a linear demand curve, $|\varepsilon_p| = \frac{b\, p}{a - b\, p}$, which equals 1 exactly at the **midpoint** $p = \frac{a}{2b}$. Substituting: ${n(a)} / (2 · ${n(b)}) = ${eur(half)}. Check: there $Q$ = ${n(a)} − ${n(b)} · ${n(half)} = ${n(a - b * half)}, and ${n(b)} · ${n(half)} / ${n(a - b * half)} = 1. Below this price demand is inelastic (elasticity 0 at $p = 0$), above it elastic ($|\varepsilon_p| \to \infty$ toward the choke price ${eur(a / b)}) — and revenue $p \cdot Q$ is maximal at the unit-elastic point.`,
            };
        },
    },
    {
        id: "e1-mkt-supply-elasticity",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics I W22/23, Problem Set 10, T2",
        build: (rng) => {
            const s = rng.int(3, 6) * 10;
            const p0 = rng.int(1, 3);
            const B = s * p0;
            const gap = rng.int(3, 6);
            const pStar = p0 + gap;
            const Q = s * gap;
            const d = rng.int(2, 5) * 10;
            const c = Q + d * pStar;
            const answer = (s * pStar) / Q;
            return {
                prompt: String.raw`In the market for oat flour, supply is $Q_S = ${n(s)} p - ${n(B)}$ and demand is $Q_D = ${n(c)} - ${n(d)} p$. What is the **price elasticity of supply** in the market equilibrium?`,
                given: {
                    "Supply": String.raw`$Q_S = ${n(s)} p - ${n(B)}$`,
                    "Demand": String.raw`$Q_D = ${n(c)} - ${n(d)} p$`,
                },
                answer,
                explanation: String.raw`$\varepsilon_p^S = \frac{dQ_S}{dp} \cdot \frac{p^*}{Q^*}$, evaluated at the equilibrium. Equilibrium: $${n(s)} p - ${n(B)} = ${n(c)} - ${n(d)} p$ gives $p^* = \frac{${n(c)} + ${n(B)}}{${n(s)} + ${n(d)}}$ = ${eur(pStar)} and $Q^*$ = ${n(Q)}. With $\frac{dQ_S}{dp} = ${n(s)}$: $\varepsilon_p^S$ = ${n(s)} · ${n(pStar)} / ${n(Q)} = ${n2(answer)} > 1 — supply is price-elastic. A linear supply curve that cuts the price axis at a positive price is elastic everywhere on it.`,
            };
        },
    },
    {
        id: "e1-mkt-demand-shifters",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I W22/23, Problem Set 10, T2",
        build: (rng) => {
            const s = rng.int(30, 50);
            const p0 = rng.int(2, 4);
            const B = s * p0;
            const gap = rng.int(4, 6);
            const pStar = p0 + gap;
            const Qstar = s * gap;
            const d = rng.int(15, 30);
            const cEff = Qstar + d * pStar;
            const mPart = rng.int(5, 15) * 10;
            const M = mPart * 100;
            const rC = rng.int(2, 5);
            const R = rng.int(10, 30);
            const A = cEff - mPart + rC * R; // >= 80 by construction
            return {
                prompt: String.raw`The demand for ice cream at a lakeside kiosk is $Q_D = ${n(A)} - ${n(d)} p + ${n(0.01)} M - ${n(rC)} R$, where $M$ is average monthly income and $R$ the number of rainy days per season. Supply is $Q_S = ${n(s)} p - ${n(B)}$. This season, $M$ = ${eur(M)} and $R$ = ${n(R)}. What is the equilibrium price?`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(A)} - ${n(d)} p + ${n(0.01)} M - ${n(rC)} R$`,
                    "Supply": String.raw`$Q_S = ${n(s)} p - ${n(B)}$`,
                    "Income M": eur(M),
                    "Rainy days R": n(R),
                },
                answer: pStar,
                explanation: String.raw`First substitute the exogenous shifters into the demand curve, then set $Q_D = Q_S$. The demand intercept becomes ${n(A)} + ${n(0.01)} · ${n(M)} − ${n(rC)} · ${n(R)} = ${n(cEff)}, so demand is $Q_D = ${n(cEff)} - ${n(d)} p$. Equating with supply: $${n(cEff)} - ${n(d)} p = ${n(s)} p - ${n(B)}$ gives $p^* = \frac{${n(cEff)} + ${n(B)}}{${n(d)} + ${n(s)}}$ = ${eur(pStar)}, with $Q^*$ = ${n(Qstar)}. Higher income or fewer rainy days shift the demand curve right and would raise both equilibrium price and quantity.`,
            };
        },
    },
    {
        id: "e1-mkt-two-part-tariff",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I W22/23, Problem Set 6, T2",
        build: (rng) => {
            const chokeA = 2 * rng.int(15, 25);
            const chokeB = chokeA + 2 * rng.int(20, 30);
            const bA = rng.pick([0.5, 1] as const);
            const bB = bA * rng.pick([1, 2] as const);
            const p = 2 * rng.int(5, 10);
            const xA = chokeA - p;
            const xB = chokeB - p;
            const cA = bA * chokeA;
            const cB = bB * chokeB;
            const qA = bA * xA;
            const qB = bB * xB;
            const csA = 0.5 * bA * xA * xA;
            const csB = 0.5 * bB * xB * xB;
            const F = csA + rng.int(5, 45) * 10; // strictly between the two surpluses
            const answer = F + p * qB;
            return {
                prompt: String.raw`A car-sharing service charges ${eur(p)} per hour of use and has two members: a casual user with monthly demand $q_A = ${n(cA)} - ${n(bA)} p$ and a commuter with $q_B = ${n(cB)} - ${n(bB)} p$ (hours per month). The service introduces a monthly **membership fee** of ${eur(F)} on top of the unchanged hourly price. What is its new total monthly revenue from these two members? (The income effect of the fee on hourly demand is negligible.)`,
                given: {
                    "Hourly price p": eur(p),
                    "Casual demand": String.raw`$q_A = ${n(cA)} - ${n(bA)} p$`,
                    "Commuter demand": String.raw`$q_B = ${n(cB)} - ${n(bB)} p$`,
                    "Membership fee": eur(F),
                },
                answer,
                explanation: String.raw`A member keeps the contract only if the consumer surplus at the hourly price covers the fee: $CS = \frac{1}{2} \left( p_{max} - p \right) q$. Casual: $q_A$ = ${n(qA)} hours, choke price ${eur(chokeA)}, so $CS_A$ = ½ · (${n(chokeA)} − ${n(p)}) · ${n(qA)} = ${eur(csA)} — **less** than the fee of ${eur(F)}, so the casual user cancels. Commuter: $q_B$ = ${n(qB)} hours, $CS_B$ = ½ · (${n(chokeB)} − ${n(p)}) · ${n(qB)} = ${eur(csB)} > ${eur(F)}, so the commuter stays and keeps driving ${n(qB)} hours. Revenue: ${eur(F)} + ${eur(p)} · ${n(qB)} = ${eur(answer)} — the fee skims part of the remaining member's surplus.`,
            };
        },
    },
    {
        id: "e1-mkt-vat-revenue",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I W22/23, Problem Set 11, T2",
        build: (rng) => {
            const pair = rng.pick([
                [25, 4],
                [25, 8],
                [50, 2],
                [50, 6],
                [20, 5],
                [20, 10],
                [10, 10],
            ] as const); // combinations where d * (1 + t) stays an integer
            const [t, d] = pair;
            const tau = 1 + t / 100;
            const s = rng.int(4, 8);
            const pS = rng.int(10, 20);
            const Q = s * pS;
            const c = pS * (s + d * tau);
            const answer = (t / 100) * pS * Q;
            return {
                prompt: String.raw`In the competitive market for craft cider, demand is $Q_D = ${n(c)} - ${n(d)} p_D$ and supply is $Q_S = ${n(s)} p_S$. A value-added tax of ${pct(t)} is introduced, so that $p_D = ${n(tau)} \cdot p_S$. How much tax revenue does the government collect in the new equilibrium?`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(c)} - ${n(d)} p_D$`,
                    "Supply": String.raw`$Q_S = ${n(s)} p_S$`,
                    "VAT rate t": pct(t),
                },
                answer,
                explanation: String.raw`$T = t \cdot p_S \cdot Q$ — the tax is levied on the net producer price. The net price solves $Q_D\big((1 + t)\, p_S\big) = Q_S(p_S)$: $${n(c)} - ${n(d)} \cdot ${n(tau)}\, p_S = ${n(s)} p_S$ gives $p_S = \frac{${n(c)}}{${n(s)} + ${n(d)} \cdot ${n(tau)}}$ = ${eur(pS)}. Quantity: $Q$ = ${n(s)} · ${n(pS)} = ${n(Q)}, and consumers pay $p_D$ = ${eur(tau * pS)}. Revenue: ${pct(t)} · ${eur(pS)} · ${n(Q)} = ${eur(answer)}. The wedge between ${eur(tau * pS)} and ${eur(pS)} is shared between the two market sides.`,
            };
        },
    },

    // --------------------------------------------- production & costs (cont.)
    {
        id: "e1-prod-mp-from-ap",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I W22/23, Problem Set 7, T1",
        build: (rng) => {
            // L >= 5 and AP >= 10: the source table's rows (L = 3..6 with
            // single-digit APs, e.g. L=4, AP=9, MP=3) can never be reproduced.
            const L = rng.int(5, 8);
            const AP = rng.int(10, 15);
            const QL = L * AP;
            const MP = rng.int(2, AP - 1); // diminishing: MP below AP
            const Qprev = QL - MP;
            return {
                prompt: `A pottery workshop keeps its kilns fixed. With ${n(L - 1)} potters it produced ${n(Qprev)} bowls per day; with ${n(L)} potters the **average product** of labor is ${n(AP)} bowls. What is the marginal product of the ${n(L)}th potter?`,
                given: {
                    [`Output with ${n(L - 1)} potters`]: `${n(Qprev)} bowls`,
                    [`Average product with ${n(L)} potters`]: `${n(AP)} bowls`,
                },
                answer: MP,
                explanation: String.raw`$MP_L = Q(L) - Q(L-1)$, and total output follows from the average: $Q(L) = AP_L \cdot L$. Output with ${n(L)} potters: ${n(AP)} · ${n(L)} = ${n(QL)} bowls. The ${n(L)}th potter therefore adds ${n(QL)} − ${n(Qprev)} = ${n(MP)} bowls — less than the average product of ${n(AP)}, which is exactly why the average product is falling at this employment level.`,
            };
        },
    },
    {
        id: "e1-prod-ap-maximum",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I W22/23, Problem Set 7, T2",
        build: (rng) => {
            // [0.08, 25] deliberately absent: it comes close to the source's
            // own Q = -50 + 10L - 0.02L^2 shape (PS7).
            const pair = rng.pick([
                [0.05, 20],
                [0.05, 40],
                [0.1, 30],
                [0.02, 40],
            ] as const);
            const [b, Lstar] = pair;
            const cFix = b * Lstar * Lstar;
            const a = rng.int(8, 15);
            return {
                prompt: String.raw`A bottling plant with a fixed machine park produces $Q = -${n(cFix)} + ${n(a)} L - ${n(b)} L^2$ crates with labor input $L$. At which labor input does the **average product of labor** reach its maximum?`,
                given: {
                    "Production function": String.raw`$Q = -${n(cFix)} + ${n(a)} L - ${n(b)} L^2$`,
                },
                answer: Lstar,
                explanation: String.raw`$AP_L = \frac{Q}{L} = -\frac{${n(cFix)}}{L} + ${n(a)} - ${n(b)} L$; the maximum solves $\frac{dAP_L}{dL} = \frac{${n(cFix)}}{L^2} - ${n(b)} = 0$, i.e. $L^* = \sqrt{${n(cFix)} / ${n(b)}}$ = ${n(Lstar)}. At that point the marginal product $MP_L = ${n(a)} - ${n(2 * b)} L$ equals the average product: both are ${n(a - 2 * b * Lstar)} crates — the MP curve always crosses the AP curve exactly at its maximum (as long as $MP > AP$, one more worker pulls the average up).`,
            };
        },
    },
    {
        id: "e1-prod-factor-demand",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I W22/23, Problem Set 9, T3",
        build: (rng) => {
            const w = rng.int(2, 6);
            const m = rng.int(2, 5);
            const p = rng.int(2, 4);
            const A = 2 * w * m;
            const k = m * p; // sqrt(L*) - an integer by construction
            const answer = k * k;
            return {
                prompt: String.raw`A price-taking olive press produces $Q = ${n(A)} \sqrt{L}$ bottles per day with labor $L$ (its capital is fixed). The market price is ${eur(p)} per bottle and the daily wage is ${eur(w)}. How many workers does it employ at the profit maximum?`,
                given: {
                    "Technology": String.raw`$Q = ${n(A)} \sqrt{L}$`,
                    "Output price p": eur(p),
                    "Wage w": eur(w),
                },
                answer,
                explanation: String.raw`A competitive firm hires until the **value of the marginal product** equals the wage: $p \cdot MP_L = w$. Here $MP_L = \frac{${n(A)}}{2 \sqrt{L}}$, so $${n(p)} \cdot \frac{${n(A)}}{2 \sqrt{L}} = ${n(w)}$ gives $\sqrt{L} = \frac{${n(p)} \cdot ${n(A)}}{2 \cdot ${n(w)}} = ${n(k)}$, hence $L^* = ${n(k)}^2 = ${n(answer)}$ workers. A higher wage would raise the required marginal product and — since $MP_L$ is diminishing — cut employment.`,
            };
        },
    },
    {
        id: "e1-prod-minimum-wage-cost",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I W22/23, Problem Set 8, T3",
        build: (rng) => {
            const w = rng.int(4, 9);
            const dw = rng.pick([1.5, 2, 2.5, 3] as const);
            const wmin = w + dw;
            const L = rng.int(6, 15) * 10;
            const K = rng.int(20, 60);
            const r = rng.int(8, 15);
            const answer = dw * L;
            return {
                prompt: `A furniture factory produces its output $Q^*$ at minimum cost with ${n(L)} workers at a wage of ${eur(w)} and ${n(K)} machines at a rental rate of ${eur(r)}. Overnight, a statutory minimum wage of ${eur(wmin)} is introduced. In the **short run** the machine stock cannot be adjusted. By how much do the costs of producing $Q^*$ rise?`,
                given: {
                    "Labor / old wage": `${n(L)} workers at ${eur(w)}`,
                    "Minimum wage": eur(wmin),
                    "Capital / rental rate": `${n(K)} machines at ${eur(r)}`,
                },
                answer,
                explanation: String.raw`$\Delta C = (w_{min} - w) \cdot L^*$: with capital fixed in the short run, producing $Q^*$ still requires the same ${n(L)} workers, so only the wage bill changes. ΔC = (${eur(wmin)} − ${eur(w)}) · ${n(L)} = ${eur(answer)}; the rental payments for the ${n(K)} machines are unaffected. Only in the long run could the firm substitute capital for the now dearer labor along the isoquant — reaching a cost level between the old one and this short-run level.`,
            };
        },
    },

    // ---------------------------------------------- perfect competition (cont.)
    {
        id: "e1-comp-number-of-firms",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "hard",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics I W22/23, Problem Set 10, T1",
        build: (rng) => {
            const sQ = rng.int(2, 5); // long-run output per firm
            const F = sQ * sQ;
            const b = rng.int(2, 6);
            const nF = rng.int(20, 60);
            const A = sQ * (nF + 2 * b);
            return {
                prompt: String.raw`In a competitive market with free entry and exit, every (potential) firm has the cost function $C(q) = q^2 + ${n(F)}$ for $q > 0$ and $C(0) = 0$. Market demand is $Q_D = ${n(A)} - ${n(b)} p$. How many firms are active in the long-run equilibrium?`,
                given: {
                    "Cost function": String.raw`$C(q) = q^2 + ${n(F)}$ for $q > 0$`,
                    "Demand": String.raw`$Q_D = ${n(A)} - ${n(b)} p$`,
                },
                answer: nF,
                explanation: String.raw`$n = \frac{Q_D(p^*)}{q^*}$, where free entry drives the price down to minimum average cost. $AC(q) = q + \frac{${n(F)}}{q}$ is minimal where $MC = AC$: $2q = q + \frac{${n(F)}}{q}$, so $q^* = \sqrt{${n(F)}}$ = ${n(sQ)} and $p^* = MC(q^*)$ = ${eur(2 * sQ)}. Market demand at that price: ${n(A)} − ${n(b)} · ${n(2 * sQ)} = ${n(A - 2 * b * sQ)} units. Number of firms: ${n(A - 2 * b * sQ)} / ${n(sQ)} = ${n(nF)} — each produces $q^*$ and earns exactly zero profit, so no firm wants to enter or exit.`,
            };
        },
    },

    // ----------------------------------------------------------- externalities
    {
        id: "e1-ext-social-output",
        subject: "econ1",
        topic: "externalities",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I W22/23, Problem Set 11, T1",
        build: (rng) => {
            const cSlope = rng.int(1, 3);
            const Qsoc = rng.int(20, 60);
            const dmg = rng.int(2, 8) * 10;
            const p = 2 * cSlope * Qsoc + dmg;
            return {
                prompt: String.raw`A gravel quarry sells at the fixed market price of ${eur(p)} per ton and has production costs $C(Q) = ${n(cSlope)} Q^2$. Its dust damages a neighboring vineyard by ${eur(dmg)} for every ton of gravel produced. What is the **socially optimal** output of the quarry?`,
                given: {
                    "Price per ton": eur(p),
                    "Quarry costs": String.raw`$C(Q) = ${n(cSlope)} Q^2$`,
                    "External damage per ton": eur(dmg),
                },
                answer: Qsoc,
                explanation: String.raw`The social optimum equates the price with the **social** marginal cost: $p = MC(Q) + MEC$, where $MEC$ is the marginal external cost borne by the vineyard. Here $${n(p)} = ${n(2 * cSlope)} Q + ${n(dmg)}$ gives $Q_{soc}$ = ${n(Qsoc)} tons. Left alone, the quarry ignores the damage and produces where $p = MC$ only: $Q_{priv} = ${n(p)} / ${n(2 * cSlope)}$ = ${n2(p / (2 * cSlope))} tons — more than is socially efficient, because part of its true cost falls on the neighbor.`,
            };
        },
    },
    {
        id: "e1-ext-internalize-gain",
        subject: "econ1",
        topic: "externalities",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I W22/23, Problem Set 11, T1",
        build: (rng) => {
            const cSlope = rng.pick([1, 2, 4, 5] as const);
            const k = rng.int(5, 20); // output reduction Q0 - Q1
            const dmg = 2 * cSlope * k;
            const Q0 = k + rng.int(10, 40);
            const p = 2 * cSlope * Q0;
            const Q1 = Q0 - k;
            const answer = cSlope * k * k;
            return {
                prompt: String.raw`A dye plant sells at the fixed price of ${eur(p)} per batch and has costs $C(Q) = ${n(cSlope)} Q^2$; its wastewater reduces a downstream oyster farm's profit by ${eur(dmg)} per batch. The two firms merge and from now on maximize **joint profit**. By how much does the sum of the two profits rise compared to separate profit maximization?`,
                given: {
                    "Price per batch": eur(p),
                    "Plant costs": String.raw`$C(Q) = ${n(cSlope)} Q^2$`,
                    "External damage per batch": eur(dmg),
                },
                answer,
                explanation: String.raw`For a constant marginal damage $d$, the gain from internalizing is $\Delta\pi = \frac{d^2}{4c}$ — the triangle between the private and the joint optimum. Separately, the plant produces where $p = MC$: $Q_0 = \frac{${n(p)}}{${n(2 * cSlope)}}$ = ${n(Q0)} batches. Jointly, the damage enters the calculus, $p = MC + d$: $Q_1 = \frac{${n(p)} - ${n(dmg)}}{${n(2 * cSlope)}}$ = ${n(Q1)}. On each of the ${n(k)} batches cut, the damage saved exceeds the profit lost, and joint profit rises by $c \left( Q_0 - Q_1 \right)^2 = ${n(cSlope)} \cdot ${n(k)}^2$ = ${eur(answer)}. The merged firm produces the socially optimal quantity.`,
            };
        },
    },

    // -------------------------------------------------------- monopoly (cont.)
    {
        id: "e1-mono-price-midpoint",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I W22/23, Problem Set 12, T2",
        build: (rng) => {
            const kS = rng.pick([0.5, 1, 2] as const);
            const qM = rng.int(20, 60);
            const cM = rng.int(2, 10);
            const A = cM + 2 * kS * qM;
            const answer = cM + kS * qM;
            return {
                prompt: String.raw`The only hot-air-balloon operator in an alpine valley faces the inverse demand $P = ${n(A)} - ${n(kS)} Q$ and a constant marginal cost of ${eur(cM)} per ride (no fixed costs). What price does it charge at the profit maximum?`,
                given: {
                    "Inverse demand": String.raw`$P = ${n(A)} - ${n(kS)} Q$`,
                    "Marginal cost": eur(cM),
                },
                answer,
                explanation: String.raw`Set $MR = MC$, where linear demand doubles the slope: $MR = ${n(A)} - ${n(2 * kS)} Q$. From $${n(A)} - ${n(2 * kS)} Q = ${n(cM)}$: $Q^M = \frac{${n(A)} - ${n(cM)}}{${n(2 * kS)}}$ = ${n(qM)} rides. The price comes from the demand curve, not from MR: $P^M = ${n(A)} - ${n(kS)} \cdot ${n(qM)}$ = ${eur(answer)}. With linear demand and constant MC this is exactly the midpoint $\frac{${n(A)} + ${n(cM)}}{2}$ between the choke price and marginal cost.`,
            };
        },
    },
    {
        id: "e1-mono-deadweight-loss",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I W22/23, Problem Set 12, T2",
        build: (rng) => {
            const kS = rng.pick([0.2, 0.5, 1] as const);
            const qM = rng.int(6, 16) * 5; // multiple of 5 keeps A an integer for k = 0.2
            const cM = rng.int(2, 10);
            const A = cM + 2 * kS * qM;
            const pM = cM + kS * qM;
            const Qc = 2 * qM;
            const answer = 0.5 * kS * qM * qM;
            return {
                prompt: String.raw`A regional utility is the sole supplier of district heating, with inverse demand $P = ${n(A)} - ${n(kS)} Q$ and a constant marginal cost of ${eur(cM)}. What is the **deadweight loss** of the monopoly compared to the perfectly competitive outcome?`,
                given: {
                    "Inverse demand": String.raw`$P = ${n(A)} - ${n(kS)} Q$`,
                    "Marginal cost": eur(cM),
                },
                answer,
                explanation: String.raw`$DWL = \frac{1}{2} \left( P^M - MC \right) \left( Q_{PC} - Q^M \right)$ — the triangle of units whose willingness to pay exceeds marginal cost but which the monopolist withholds. $MR = MC$: $${n(A)} - ${n(2 * kS)} Q = ${n(cM)}$ gives $Q^M$ = ${n(qM)} and $P^M$ = ${eur(pM)}. Competition would price at marginal cost: $${n(A)} - ${n(kS)} Q = ${n(cM)}$ gives $Q_{PC}$ = ${n(Qc)} — twice the monopoly quantity. DWL = ½ · (${n(pM)} − ${n(cM)}) · (${n(Qc)} − ${n(qM)}) = ${eur(answer)}. Under perfect price discrimination the DWL would vanish (all surplus going to the monopolist).`,
            };
        },
    },


    // =====================================================================
    // Added 2026-09-02 from the WS19/20 exam, the eTest W20/21 and the
    // Principles of Economics exercise exams (WS17/18 = WS20/21), blocks 1-5.
    // =====================================================================
    // ------------------------------------------------ comparative advantage
    {
        id: "e1-ca-minutes-opportunity-cost",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "easy",
        kind: "numeric",
        unit: "ratio",
        source: "TUM Economics I Exam WS19/20, P3",
        build: (rng) => {
            const groups = rng.shuffle(OC_Y_GROUPS).slice(0, 3);
            const rows = groups.map((g) => {
                const [tx, ty] = rng.pick(g.pairs);
                return { tx, ty, oc: g.oc };
            });
            const names = ["Marta", "Diego", "Rosa"];
            const k = rng.int(0, 2);
            const me = rows[k];
            const answer = me.oc; // = t_almonds / t_oranges
            const line = (i: number) =>
                `${names[i]} needs ${n(rows[i].tx)} minutes for one crate of oranges and ${n(rows[i].ty)} minutes for one basket of almonds`;
            return {
                prompt: `Three pickers work on a fruit farm near Seville, each at a steady pace. ${line(0)}; ${line(1)}; ${line(2)}. What is ${names[k]}'s opportunity cost of one basket of almonds, measured in crates of oranges?`,
                given: {
                    [`${names[0]}: oranges / almonds`]: `${n(rows[0].tx)} / ${n(rows[0].ty)} min per unit`,
                    [`${names[1]}: oranges / almonds`]: `${n(rows[1].tx)} / ${n(rows[1].ty)} min per unit`,
                    [`${names[2]}: oranges / almonds`]: `${n(rows[2].tx)} / ${n(rows[2].ty)} min per unit`,
                },
                answer,
                explanation: String.raw`The opportunity cost of a basket of almonds is the number of crates of oranges given up while picking it, so it is the ratio of the two production times: $OC_{\text{almonds}} = \frac{t_{\text{almonds}}}{t_{\text{oranges}}}$. ${names[k]} needs ${n(me.ty)} minutes per basket and ${n(me.tx)} minutes per crate, so the opportunity cost is ${n(me.ty)} / ${n(me.tx)} = ${n2(answer)} crates per basket. For the whole crew: ${names[0]} ${n2(rows[0].oc)}, ${names[1]} ${n2(rows[1].oc)}, ${names[2]} ${n2(rows[2].oc)} crates per basket - the lowest value marks the comparative advantage in almonds.`,
            };
        },
    },
    {
        id: "e1-ca-hourly-output-specialized",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exam WS19/20, P5",
        build: (rng) => {
            const groups = rng.shuffle(OC_X_GROUPS).slice(0, 3);
            const names = rng.shuffle(["Camille", "Hugo", "Manon"]);
            const rows = groups.map((g, i) => {
                const [tx, ty] = rng.pick(g.pairs);
                return { name: names[i], tx, ty, oc: g.oc };
            });
            // the strictly lowest opportunity cost of macarons: unique by construction
            const spec = rows.reduce((best, r) => (r.oc < best.oc ? r : best));
            const others = rows.filter((r) => r !== spec);
            const answer = 60 / others[0].ty + 60 / others[1].ty;
            const line = (r: (typeof rows)[number]) =>
                `${r.name} needs ${n(r.tx)} minutes for one box of macarons and ${n(r.ty)} minutes for one litre of lemonade`;
            return {
                prompt: `Three friends run a market stall in Lyon and work for exactly one hour. ${line(rows[0])}; ${line(rows[1])}; ${line(rows[2])}. Whoever holds the comparative advantage in macarons spends the full hour on macarons only, while the other two spend the full hour on lemonade only. How many litres of lemonade does the stall produce in that hour?`,
                given: {
                    [`${rows[0].name}: macarons / lemonade`]: `${n(rows[0].tx)} / ${n(rows[0].ty)} min per unit`,
                    [`${rows[1].name}: macarons / lemonade`]: `${n(rows[1].tx)} / ${n(rows[1].ty)} min per unit`,
                    [`${rows[2].name}: macarons / lemonade`]: `${n(rows[2].tx)} / ${n(rows[2].ty)} min per unit`,
                },
                answer,
                explanation: String.raw`Rank the three by the opportunity cost of a box of macarons and let the cheapest one specialize; an hour of lemonade yields $OC_{\text{macarons}} = \frac{t_{\text{macarons}}}{t_{\text{lemonade}}}, \qquad q_{\text{lemonade}} = \frac{60}{t_{\text{lemonade}}}$. Opportunity costs: ${rows[0].name} ${n2(rows[0].oc)}, ${rows[1].name} ${n2(rows[1].oc)}, ${rows[2].name} ${n2(rows[2].oc)} litres per box. ${spec.name} is the cheapest macaron producer and makes macarons only. The other two pour lemonade: 60 / ${n(others[0].ty)} = ${n(60 / others[0].ty)} litres by ${others[0].name} and 60 / ${n(others[1].ty)} = ${n(60 / others[1].ty)} litres by ${others[1].name}, together ${n(answer)} litres.`,
            };
        },
    },
    {
        id: "e1-ca-joint-ppf-three",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I eTest W20/21, Q25",
        build: (rng) => {
            const T = rng.pick([60, 120, 180]);
            const groups = rng
                .shuffle(OC_T_GROUPS)
                .slice(0, 3)
                .sort((p, q) => p.oc - q.oc); // cheapest producer of olives first
            const names = rng.shuffle(["Elena", "Marco", "Giulia"]);
            const ranked = groups.map((g, i) => {
                const [tx, ty] = rng.pick(g.pairs);
                return { name: names[i], tx, ty, oc: g.oc };
            });
            const cap1 = T / ranked[0].tx; // crates the cheapest producer can pick alone
            const cap2 = T / ranked[1].tx;
            const onSecond = rng.int(0, 1) === 1;
            let x1: number;
            let x2: number;
            if (onSecond) {
                const step = ranked[1].ty / gcd(ranked[1].tx, ranked[1].ty);
                const maxK = Math.floor((cap2 - 1) / step);
                x1 = cap1;
                x2 = maxK >= 1 ? step * rng.int(1, maxK) : rng.int(1, cap2 - 1);
            } else {
                const step = ranked[0].ty / gcd(ranked[0].tx, ranked[0].ty);
                const maxK = Math.floor((cap1 - 1) / step);
                x1 = maxK >= 1 ? step * rng.int(1, maxK) : rng.int(1, cap1 - 1);
                x2 = 0;
            }
            const target = x1 + x2;
            const oil = [x1, x2, 0].map((x, i) => (T - ranked[i].tx * x) / ranked[i].ty);
            const answer = oil[0] + oil[1] + oil[2];
            const shown = rng.shuffle(ranked);
            const split =
                x2 === 0
                    ? `${ranked[0].name} alone picks all ${n(target)} crates while ${ranked[1].name} and ${ranked[2].name} press oil for the whole shift`
                    : `${ranked[0].name} picks ${n(x1)} crates and ${ranked[1].name} the remaining ${n(x2)}; ${ranked[2].name} touches no olives at all`;
            const line = (r: (typeof ranked)[number]) =>
                `${r.name} needs ${n(r.tx)} minutes for one crate of olives and ${n(r.ty)} minutes for one litre of oil`;
            return {
                prompt: `Three workers on an olive farm in Puglia each have ${n(T)} minutes left today. ${line(shown[0])}; ${line(shown[1])}; ${line(shown[2])}. The farm must hand over exactly ${n(target)} crates of olives tonight and wants to press as much oil as possible with the remaining minutes. How many litres of oil does the crew press?`,
                given: {
                    "Time per worker": `${n(T)} min`,
                    [`${shown[0].name}: olives / oil`]: `${n(shown[0].tx)} / ${n(shown[0].ty)} min per unit`,
                    [`${shown[1].name}: olives / oil`]: `${n(shown[1].tx)} / ${n(shown[1].ty)} min per unit`,
                    [`${shown[2].name}: olives / oil`]: `${n(shown[2].tx)} / ${n(shown[2].ty)} min per unit`,
                    "Olives required": `${n(target)} crates`,
                },
                answer,
                explanation: String.raw`Fill the olive target with the workers whose opportunity cost of a crate is lowest, $OC_{\text{olives}} = \frac{t_{\text{olives}}}{t_{\text{oil}}}$, and put every remaining minute into oil. Ranking: ${ranked[0].name} ${n2(ranked[0].oc)} < ${ranked[1].name} ${n2(ranked[1].oc)} < ${ranked[2].name} ${n2(ranked[2].oc)} litres per crate. ${ranked[0].name} can pick at most ${n(cap1)} crates in ${n(T)} minutes, so ${split}. Remaining oil: (${n(T)} − ${n(ranked[0].tx)}·${n(x1)}) / ${n(ranked[0].ty)} = ${n2(oil[0])}, (${n(T)} − ${n(ranked[1].tx)}·${n(x2)}) / ${n(ranked[1].ty)} = ${n2(oil[1])} and ${n(T)} / ${n(ranked[2].ty)} = ${n2(oil[2])} litres, together ${n2(answer)} litres.`,
            };
        },
    },
    {
        id: "e1-ca-terms-of-trade-lower-bound",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "medium",
        kind: "numeric",
        unit: "ratio",
        source: "TUM Economics I Exam WS19/20, P7",
        build: (rng) => {
            const groups = rng.shuffle(OC_Y_GROUPS).slice(0, 2);
            const names = rng.shuffle(["Tiago", "Sofia"]);
            const rows = groups.map((g, i) => {
                const [tx, ty] = rng.pick(g.pairs);
                return { name: names[i], tx, ty, oc: g.oc };
            });
            const low = rows[0].oc < rows[1].oc ? rows[0] : rows[1];
            const high = rows[0].oc < rows[1].oc ? rows[1] : rows[0];
            const answer = low.oc;
            const line = (r: (typeof rows)[number]) =>
                `${r.name} needs ${n(r.tx)} minutes for one mug and ${n(r.ty)} minutes for one bowl`;
            return {
                prompt: `Two potters share a studio in Porto. ${line(rows[0])}; ${line(rows[1])}. They think about specializing and then trading bowls against mugs. What is the **minimum** price of one bowl, measured in mugs, at which both of them can still gain from trade?`,
                given: {
                    [`${rows[0].name}: mugs / bowls`]: `${n(rows[0].tx)} / ${n(rows[0].ty)} min per unit`,
                    [`${rows[1].name}: mugs / bowls`]: `${n(rows[1].tx)} / ${n(rows[1].ty)} min per unit`,
                },
                answer,
                explanation: String.raw`Trade helps both only if the price of a bowl lies between the two opportunity costs, so the lower one is the floor: $p_{\min} = \min\left(\frac{t^{1}_{\text{bowl}}}{t^{1}_{\text{mug}}}, \frac{t^{2}_{\text{bowl}}}{t^{2}_{\text{mug}}}\right)$. Opportunity cost of a bowl: ${rows[0].name} ${n(rows[0].ty)} / ${n(rows[0].tx)} = ${n2(rows[0].oc)} mugs, ${rows[1].name} ${n(rows[1].ty)} / ${n(rows[1].tx)} = ${n2(rows[1].oc)} mugs. ${low.name} is the cheaper bowl producer and sells bowls; below ${n2(answer)} mugs per bowl ${low.name} would rather make mugs, above ${n2(high.oc)} mugs per bowl ${high.name} would rather make the bowls alone. The price range is ${n2(answer)} to ${n2(high.oc)} mugs per bowl, so the minimum is ${n2(answer)}.`,
            };
        },
    },
    {
        id: "e1-ca-joint-ppf-two-countries",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P2",
        build: (rng) => {
            const ocE = rng.pick([2, 3, 4, 5]); // Kenya: tonnes of coffee per tonne of tea
            const gap = rng.pick([3, 4, 5, 6]);
            const ocU = ocE + gap; // Ethiopia: higher, so Kenya has the advantage in tea
            const XE = rng.pick([10, 12, 15, 20]);
            const XU = rng.pick([10, 12, 15, 20]);
            const YE = ocE * XE;
            const YU = ocU * XU;
            const onEthiopia = rng.int(0, 1) === 1;
            const target = onEthiopia ? XE + rng.int(1, XU - 1) : rng.int(1, XE - 1);
            const answer = onEthiopia ? YU - ocU * (target - XE) : YU + YE - ocE * target;
            return {
                prompt: `In one season Kenya can produce at most ${n(XE)} tonnes of tea **or** at most ${n(YE)} tonnes of coffee, Ethiopia at most ${n(XU)} tonnes of tea **or** at most ${n(YU)} tonnes of coffee. Both production possibility frontiers are straight lines, and any mix along them is feasible. If the two countries together grow exactly ${n(target)} tonnes of tea and divide the work in the most efficient way, what is the largest total amount of coffee (in tonnes) they can still grow?`,
                given: {
                    "Kenya: tea or coffee": `${n(XE)} or ${n(YE)} tonnes`,
                    "Ethiopia: tea or coffee": `${n(XU)} or ${n(YU)} tonnes`,
                    "Tea required": `${n(target)} tonnes`,
                },
                answer,
                explanation: String.raw`On the joint frontier the country with the lower opportunity cost of tea grows the tea first: $OC_{\text{Kenya}} = \frac{Y_E}{X_E} < OC_{\text{Ethiopia}} = \frac{Y_U}{X_U}$. Here Kenya gives up ${n(YE)} / ${n(XE)} = ${n2(ocE)} tonnes of coffee per tonne of tea, Ethiopia ${n(YU)} / ${n(XU)} = ${n2(ocU)}, so Kenya grows tea first (it can cover up to ${n(XE)} tonnes). ${
                    onEthiopia
                        ? `The target of ${n(target)} tonnes exceeds Kenya's maximum, so Kenya grows only tea and Ethiopia adds the missing ${n(target - XE)} tonnes: coffee = ${n(YU)} − ${n2(ocU)} · ${n(target - XE)} = ${n2(answer)} tonnes.`
                        : `Kenya alone covers the target, Ethiopia stays fully in coffee: coffee = ${n(YU)} + ${n(YE)} − ${n2(ocE)} · ${n(target)} = ${n2(answer)} tonnes.`
                }`,
            };
        },
    },
    {
        id: "e1-ca-max-consumption-exporter",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P4",
        build: (rng) => {
            const ocE = rng.pick([2, 3, 4, 5]);
            const gap = rng.pick([3, 4, 5, 6]);
            const ocU = ocE + gap;
            const tau = ocE + rng.int(1, gap - 1); // terms of trade, strictly between the two
            const XE = rng.pick([10, 12, 15, 20]);
            const XU = XE + rng.pick([0, 3, 5]);
            const YE = ocE * XE;
            const YU = ocU * XU;
            const answer = tau * XE;
            return {
                prompt: `In one season Kenya can produce at most ${n(XE)} tonnes of tea **or** at most ${n(YE)} tonnes of coffee, Ethiopia at most ${n(XU)} tonnes of tea **or** at most ${n(YU)} tonnes of coffee; both frontiers are straight lines. The two countries open trade at terms of trade of ${n(tau)} tonnes of coffee per tonne of tea, and Ethiopia's ability to deliver coffee is limited only by its own maximum output. Kenya specializes completely in tea and drinks no tea at all. How many tonnes of coffee can Kenya consume at most?`,
                given: {
                    "Kenya: tea or coffee": `${n(XE)} or ${n(YE)} tonnes`,
                    "Ethiopia: tea or coffee": `${n(XU)} or ${n(YU)} tonnes`,
                    "Terms of trade": `${n(tau)} tonnes of coffee per tonne of tea`,
                },
                answer,
                explanation: String.raw`A country that specializes fully and sells everything consumes $Y^{\max}_E = \tau \cdot X_E$ of the imported good. Kenya's opportunity cost of tea is ${n(YE)} / ${n(XE)} = ${n2(ocE)} tonnes of coffee, below Ethiopia's ${n(YU)} / ${n(XU)} = ${n2(ocU)}, so Kenya is the tea exporter and the terms of trade ${n(tau)} lie inside that range. Selling all ${n(XE)} tonnes of tea earns ${n(tau)} · ${n(XE)} = ${n(answer)} tonnes of coffee - more than the ${n(YE)} tonnes Kenya could grow on its own. Ethiopia can pay: ${n(answer)} tonnes are within its maximum of ${n(YU)} tonnes.`,
            };
        },
    },
    {
        id: "e1-ca-max-consumption-importer",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P4",
        build: (rng) => {
            const ocE = rng.pick([2, 3, 4]);
            const gap = rng.pick([3, 4, 5, 6]);
            const ocU = ocE + gap;
            const tau = ocE + rng.int(1, gap - 1);
            const m = rng.int(1, 2);
            const XE = ocU * m; // keeps the coffee bill an integer
            const XU = XE + rng.pick([0, 4, 6]);
            const YE = ocE * XE;
            const YU = ocU * XU;
            const bill = tau * XE; // tonnes of coffee Ethiopia hands over
            const ownTea = XU - tau * m; // = X_U (1 - tau X_E / Y_U)
            const answer = XE + ownTea;
            return {
                prompt: `In one season Kenya can produce at most ${n(XE)} tonnes of tea **or** at most ${n(YE)} tonnes of coffee, Ethiopia at most ${n(XU)} tonnes of tea **or** at most ${n(YU)} tonnes of coffee; both frontiers are straight lines. Trade takes place at ${n(tau)} tonnes of coffee per tonne of tea. Kenya specializes completely in tea, so it can deliver at most its full harvest of ${n(XE)} tonnes and drinks none of it. Ethiopia wants to consume as much tea as possible: it buys everything Kenya delivers, grows the coffee for the bill itself and uses the rest of its land for its own tea. How many tonnes of tea can Ethiopia consume at most?`,
                given: {
                    "Kenya: tea or coffee": `${n(XE)} or ${n(YE)} tonnes`,
                    "Ethiopia: tea or coffee": `${n(XU)} or ${n(YU)} tonnes`,
                    "Terms of trade": `${n(tau)} tonnes of coffee per tonne of tea`,
                },
                answer,
                explanation: String.raw`Ethiopia's own frontier trades tea for coffee at $OC_{\text{Ethiopia}}$, and the coffee it needs for the import bill is land taken away from tea: $X^{\max}_U = X_E + X_U \left(1 - \frac{\tau \cdot X_E}{Y_U}\right)$. Kenya can supply at most ${n(XE)} tonnes of tea, which cost ${n(tau)} · ${n(XE)} = ${n(bill)} tonnes of coffee. Growing that coffee uses ${n(bill)} / ${n(YU)} of Ethiopia's land, leaving ${n(XU)} · (1 − ${n(bill)}/${n(YU)}) = ${n(ownTea)} tonnes of home-grown tea. Total: ${n(XE)} + ${n(ownTea)} = ${n(answer)} tonnes. The trap is to compute ${n(YU)} / ${n(tau)} = ${n2(YU / tau)} tonnes: Ethiopia could afford that much tea, but Kenya cannot grow it.`,
            };
        },
    },
    {
        id: "e1-ca-consumption-target-exporter",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P5",
        build: (rng) => {
            const ocE = rng.pick([2, 3, 4, 5]);
            const gap = rng.pick([3, 4, 5, 6]);
            const ocU = ocE + gap;
            const tau = ocE + rng.int(1, gap - 1);
            const XE = rng.pick([10, 12, 16, 20]);
            const XU = XE + rng.pick([0, 2, 5]);
            const YE = ocE * XE;
            const YU = ocU * XU;
            const target = rng.int(XE / 2 + 1, XE - 1); // tea each country consumes
            const sold = XE - target;
            const answer = tau * sold;
            return {
                prompt: `In one season Kenya can produce at most ${n(XE)} tonnes of tea **or** at most ${n(YE)} tonnes of coffee, Ethiopia at most ${n(XU)} tonnes of tea **or** at most ${n(YU)} tonnes of coffee; both frontiers are straight lines. The two trade at ${n(tau)} tonnes of coffee per tonne of tea, and each country ends up consuming exactly ${n(target)} tonnes of tea. Kenya specializes completely in tea and sells whatever it does not drink. How many tonnes of coffee can Kenya consume?`,
                given: {
                    "Kenya: tea or coffee": `${n(XE)} or ${n(YE)} tonnes`,
                    "Ethiopia: tea or coffee": `${n(XU)} or ${n(YU)} tonnes`,
                    "Terms of trade": `${n(tau)} tonnes of coffee per tonne of tea`,
                    "Tea consumed per country": `${n(target)} tonnes`,
                },
                answer,
                explanation: String.raw`Kenya's coffee is bought entirely with the tea it exports: $Y^{\max}_E = \tau \left( X_E - \bar{X} \right)$. Kenya's opportunity cost of tea is ${n(YE)} / ${n(XE)} = ${n2(ocE)} tonnes of coffee against Ethiopia's ${n(YU)} / ${n(XU)} = ${n2(ocU)}, so full specialization in tea is the right move. It grows ${n(XE)} tonnes, keeps ${n(target)} and exports ${n(XE)} − ${n(target)} = ${n(sold)} tonnes, which earn ${n(tau)} · ${n(sold)} = ${n(answer)} tonnes of coffee.`,
            };
        },
    },
    {
        id: "e1-ca-consumption-target-importer",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P5",
        build: (rng) => {
            const ocE = rng.pick([2, 3, 4, 5]);
            const gap = rng.pick([3, 4, 5, 6]);
            const ocU = ocE + gap;
            const tau = ocE + rng.int(1, gap - 1);
            const XE = rng.pick([10, 12, 16, 20]);
            const XU = XE + rng.pick([0, 2, 5]);
            const YE = ocE * XE;
            const YU = ocU * XU;
            const target = rng.int(XE / 2 + 1, XE - 1);
            const sold = XE - target; // tonnes Ethiopia imports
            const own = target - sold; // tonnes Ethiopia grows itself
            const bill = tau * sold;
            const grownCoffee = ocU * (XU - own); // = Y_U (1 - own / X_U)
            const answer = grownCoffee - bill;
            return {
                prompt: `In one season Kenya can produce at most ${n(XE)} tonnes of tea **or** at most ${n(YE)} tonnes of coffee, Ethiopia at most ${n(XU)} tonnes of tea **or** at most ${n(YU)} tonnes of coffee; both frontiers are straight lines. The two trade at ${n(tau)} tonnes of coffee per tonne of tea, and each country ends up consuming exactly ${n(target)} tonnes of tea. Kenya specializes completely in tea and sells what it does not drink; Ethiopia buys that tea, pays in coffee and grows the rest of its tea itself. How many tonnes of coffee can Ethiopia consume?`,
                given: {
                    "Kenya: tea or coffee": `${n(XE)} or ${n(YE)} tonnes`,
                    "Ethiopia: tea or coffee": `${n(XU)} or ${n(YU)} tonnes`,
                    "Terms of trade": `${n(tau)} tonnes of coffee per tonne of tea`,
                    "Tea consumed per country": `${n(target)} tonnes`,
                },
                answer,
                explanation: String.raw`Ethiopia grows the tea it cannot import and pays for the imports out of its coffee: $Y_U^{\,c} = Y_U \left(1 - \frac{c}{X_U}\right) - \tau \left( X_E - \bar{X} \right)$ with $c$ the tea Ethiopia grows itself. Kenya exports ${n(XE)} − ${n(target)} = ${n(sold)} tonnes, so Ethiopia has to grow $c$ = ${n(target)} − ${n(sold)} = ${n(own)} tonnes on its own land. That leaves coffee of ${n(YU)} · (1 − ${n(own)}/${n(XU)}) = ${n(grownCoffee)} tonnes, out of which the import bill of ${n(tau)} · ${n(sold)} = ${n(bill)} tonnes is paid. Ethiopia consumes ${n(grownCoffee)} − ${n(bill)} = ${n(answer)} tonnes of coffee.`,
            };
        },
    },

    // -------------------------------------------- opportunity cost & Pareto
    {
        id: "e1-oc-pareto-threshold",
        subject: "econ1",
        topic: "opportunity_cost",
        difficulty: "easy",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics I Exam WS19/20, P2",
        build: (rng) => {
            const a1 = rng.int(2, 8);
            const a2 = a1 + rng.int(1, 4); // Alina strictly gains
            const b1 = rng.int(1, 12); // Bruno's utility in allocation (1) - the threshold
            const c1 = rng.int(1, 8);
            const c2 = c1 + rng.int(0, 4); // Chiara is never worse off
            return {
                prompt: String.raw`Three flatmates in Lisbon can share the household budget in two ways. Under allocation (1) the utilities are: Alina ${n(a1)}, Bruno ${n(b1)}, Chiara ${n(c1)}. Under allocation (2) they are: Alina ${n(a2)}, Bruno $X$, Chiara ${n(c2)}. Allocation (2) is a Pareto improvement over allocation (1) if nobody is worse off and at least one person is strictly better off. What is the smallest integer value of $X$ for which allocation (2) is a Pareto improvement over allocation (1)?`,
                given: {
                    "Alina: (1) → (2)": `${n(a1)} → ${n(a2)}`,
                    "Bruno: (1) → (2)": `${n(b1)} → $X$`,
                    "Chiara: (1) → (2)": `${n(c1)} → ${n(c2)}`,
                },
                answer: b1,
                explanation: String.raw`A Pareto improvement needs $u_i(2) \geq u_i(1)$ for every person, with a strict gain for at least one of them. Alina rises from ${n(a1)} to ${n(a2)} and Chiara ${c2 === c1 ? "stays at" : "rises from"} ${n(c1)}${c2 === c1 ? "" : ` to ${n(c2)}`}, so the strict gain is already there and nobody among them loses. The only open condition is Bruno: he must not be worse off, i.e. $X \geq$ ${n(b1)}. The smallest integer that satisfies this is ${n(b1)}. Anything below leaves Bruno worse off, and then allocation (2) merely redistributes instead of improving.`,
            };
        },
    },
    {
        id: "e1-oc-sunk-cost-net-benefit",
        subject: "econ1",
        topic: "opportunity_cost",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P1",
        build: (rng) => {
            const S = rng.int(6, 15) * 10; // non-refundable ticket, already paid
            const c1 = rng.int(2, 8) * 5; // train fare to the concert
            const v1 = c1 + rng.int(12, 24) * 5;
            const net1 = v1 - c1;
            const sign = rng.pick([-1, 1]);
            const d = rng.int(1, 12) * 5; // the gap between the two net benefits
            const net2 = net1 + sign * d;
            const c2 = rng.int(1, 6) * 5; // entry fee at the climbing gym
            const v2 = net2 + c2;
            const better = sign === 1 ? "the climbing session" : "the concert";
            return {
                prompt: `Lena bought a concert ticket for ${eur(S)} last month; it cannot be returned or resold. Tonight she can either go to the concert - she values that evening at ${eur(v1)} and the train ride there costs ${eur(c1)} - or join a climbing session she values at ${eur(v2)}, for which the gym charges ${eur(c2)}. By how many euros is the net benefit of the better option higher than the net benefit of the other one? (The ticket price is already spent and does not enter the comparison.)`,
                given: {
                    "Ticket already paid": eur(S),
                    "Concert: value / travel": `${eur(v1)} / ${eur(c1)}`,
                    "Climbing: value / fee": `${eur(v2)} / ${eur(c2)}`,
                },
                answer: d,
                explanation: String.raw`A rational decision maker compares net benefits and ignores what is already spent: $\Delta NB = \left| (V_1 - c_1) - (V_2 - c_2) \right|$. Concert: ${eur(v1)} − ${eur(c1)} = ${eur(net1)}. Climbing: ${eur(v2)} − ${eur(c2)} = ${eur(net2)}. The difference is ${eur(d)} in favour of ${better}. The ${eur(S)} for the ticket is a sunk cost - it is gone whatever Lena does tonight, so it appears in neither net benefit - paying for the ticket does not by itself make the concert the better choice.`,
            };
        },
    },

    // ------------------------------------------- consumer theory: Cobb-Douglas
    {
        id: "e1-ct-cd-quantity-after-price-change",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exam WS19/20, P12",
        build: (rng) => {
            const [na, nb, den] = rng.pick(CD_SHARES);
            const A = rng.pick([2, 3, 4, 5]);
            const p1 = rng.int(3, 6);
            const p2 = 2 * rng.int(1, 3); // even, so a halving still gives a clean price
            const f = rng.pick([2, 3, 0.5]); // the price of good 2 doubles, triples or halves
            const need = f === 3 ? 3 : f === 2 ? 2 : 1; // keeps both quantities integer
            const base = den * p1 * p2 * need;
            const t = rng.int(Math.ceil(96 / base), Math.floor(480 / base));
            const M = base * t;
            const p2New = p2 * f;
            const q1 = na * p2 * need * t; // = (na/den) * M / p1
            const q2 = nb * p1 * need * t; // = (nb/den) * M / p2
            const answer = q2 / f; // = (nb/den) * M / p2New
            return {
                prompt: String.raw`A student in Lisbon splits her monthly budget of ${eur(M)} between tram rides ($q_1$) and pastéis de nata ($q_2$), with preferences $U(q_1, q_2) = ${n(A)} \cdot ${powTex("q_1", na, den)} \cdot ${powTex("q_2", nb, den)}$. A tram ride costs ${eur(p1)}. The price of a pastel de nata changes from ${eur(p2)} to ${eur(p2New)}, while her budget and the tram fare stay put. How many pastéis de nata does she buy at her new optimum?`,
                given: {
                    "Budget M": eur(M),
                    "Price $p_1$": eur(p1),
                    "Old price $p_2$": eur(p2),
                    "New price $p_2'$": eur(p2New),
                },
                answer,
                explanation: String.raw`$q_2^* = b \cdot \frac{M}{p_2}$ — with Cobb-Douglas preferences each exponent is the share of the budget spent on that good, and the multiplicative constant in front of the utility function does not change the optimum. Here $b = \frac{${nb}}{${den}}$, so at the new price $q_2^*$ = ${n(nb)}/${n(den)} · ${eur(M)} / ${eur(p2New)} = ${n(answer)} pastéis. (Before the change it was ${n(nb)}/${n(den)} · ${eur(M)} / ${eur(p2)} = ${n(q2)}.) The demand for tram rides is unaffected: $q_1^*$ = ${n(na)}/${n(den)} · ${eur(M)} / ${eur(p1)} = ${n(q1)} rides either way, because the expenditure shares are constant.`,
            };
        },
    },
    {
        id: "e1-ct-cd-max-utility-coefficient",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "hard",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics I Exam WS19/20, P13",
        build: (rng) => {
            const [na, nb, den] = rng.pick(CD_SHARES);
            const a = na / den;
            const b = nb / den;
            const A = rng.pick([2, 3, 4, 5]);
            const p1 = rng.int(3, 6);
            const p2 = 2 * rng.int(1, 3);
            const f = rng.pick([2, 3, 0.5]);
            const need = f === 3 ? 3 : f === 2 ? 2 : 1;
            const base = den * p1 * p2 * need;
            const t = rng.int(Math.ceil(96 / base), Math.floor(480 / base));
            const M = base * t;
            const p2New = p2 * f;
            const q1 = na * p2 * need * t;
            const q2New = (nb * p1 * need * t) / f;
            const answer = A * q1 ** a * q2New ** b;
            return {
                prompt: String.raw`A household in Bologna spends ${eur(M)} a month on plates of fresh pasta ($q_1$, ${eur(p1)} each) and glasses of Lambrusco ($q_2$). Its preferences are $U(q_1, q_2) = ${n(A)} \cdot ${powTex("q_1", na, den)} \cdot ${powTex("q_2", nb, den)}$. The price of a glass of Lambrusco moves from ${eur(p2)} to ${eur(p2New)}. What is the highest utility level the household can reach after the price change?`,
                given: {
                    "Budget M": eur(M),
                    "Price $p_1$": eur(p1),
                    "New price $p_2'$": eur(p2New),
                },
                answer,
                explanation: String.raw`$U^* = A \cdot (q_1^*)^{a} \cdot (q_2^*)^{b}$ evaluated at the optimal bundle, which follows from the constant expenditure shares $q_1^* = a \frac{M}{p_1}$ and $q_2^* = b \frac{M}{p_2'}$. Here $q_1^*$ = ${n(na)}/${n(den)} · ${eur(M)} / ${eur(p1)} = ${n(q1)} plates and $q_2^*$ = ${n(nb)}/${n(den)} · ${eur(M)} / ${eur(p2New)} = ${n(q2New)} glasses. Substituting: $U^* = ${n(A)} \cdot ${n(q1)}^{${fracTex(na, den)}} \cdot ${n(q2New)}^{${fracTex(nb, den)}}$ = ${n2(answer)}. This is the indirect utility at the new prices — the constant ${n(A)} scales the utility number but never the chosen bundle.`,
            };
        },
    },
    {
        id: "e1-ct-cd-hypothetical-income",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P14",
        build: (rng) => {
            const [na, nb, den] = rng.pick(CD_SHARES);
            const a = na / den;
            const A = rng.pick([2, 3, 4, 5]);
            const p1 = 2 * rng.int(1, 3); // even, so a halving still gives a clean price
            const p2 = rng.int(3, 6);
            const f = rng.pick([2, 3, 0.5]);
            const need = f === 3 ? 3 : f === 2 ? 2 : 1;
            const base = den * p1 * p2 * need;
            const t = rng.int(Math.ceil(96 / base), Math.floor(480 / base));
            const M = base * t;
            const p1New = p1 * f;
            const q1 = na * p2 * need * t;
            const q2 = nb * p1 * need * t;
            const answer = M * f ** a;
            return {
                prompt: String.raw`A swimmer in Copenhagen buys pool entries ($q_1$) and cinnamon buns ($q_2$) with a monthly budget of ${eur(M)} and preferences $U(q_1, q_2) = ${n(A)} \cdot ${powTex("q_1", na, den)} \cdot ${powTex("q_2", nb, den)}$. A bun costs ${eur(p2)}; the price of a pool entry changes from ${eur(p1)} to ${eur(p1New)}. Which budget would she need at the new prices to reach exactly the utility level she had before the change?`,
                given: {
                    "Budget M": eur(M),
                    "Old price $p_1$": eur(p1),
                    "New price $p_1'$": eur(p1New),
                    "Price $p_2$": eur(p2),
                },
                answer,
                explanation: String.raw`$M_{hyp} = M \cdot \left( \frac{p_1'}{p_1} \right)^{a}$. The hypothetical (compensated) budget is the **smallest** spending that still buys the old utility level at the new prices: minimising $p_1' q_1 + p_2 q_2$ subject to $U = \bar{U}$ again equates $|MRS_{1,2}|$ with the new price ratio $p_1' / p_2$, and the resulting expenditure function of a Cobb-Douglas consumer, $E = \frac{\bar{U}}{A} \left( \frac{p_1}{a} \right)^{a} \left( \frac{p_2}{b} \right)^{b}$, scales with $p_1^{a}$. The old optimum was $q_1^*$ = ${n(q1)} entries and $q_2^*$ = ${n(q2)} buns. The price ratio is ${eur(p1New)} / ${eur(p1)} = ${n(f)}, so $M_{hyp} = M \cdot ${n(f)}^{${fracTex(na, den)}}$ = ${eur(answer)} — a difference of ${eur(Math.abs(answer - M))} against the old budget.`,
            };
        },
    },

    // ------------------------------------- consumer theory: labour-leisure choice
    {
        id: "e1-ct-labor-free-time",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P6",
        build: (rng) => {
            const p = rng.pick([1, 2, 3, 4]);
            const w = rng.pick([2, 3, 4, 5, 6, 8, 10, 12].filter((x) => x !== p));
            const cycle = p * (p + w); // Z = cycle * v keeps F, L and q integer
            let v = rng.int(Math.ceil(24 / cycle), Math.floor(168 / cycle));
            if (p === 1 && w === 5 && cycle * v === 24) v += 1; // never the source's (p, w, Z)
            const Z = cycle * v;
            const answer = p * p * v; // = p Z / (p + w)
            return {
                prompt: String.raw`A freelance illustrator in Porto has ${n(Z)} hours a week to divide between paid work $L$ and free time $F$. She earns ${eur(w)} per hour worked and spends every euro on a single consumption good that costs ${eur(p)} per unit. Her preferences are $U(q, F) = \sqrt{q} + \sqrt{F}$. How many hours of **free time** does she choose?`,
                given: {
                    "Time budget Z": `${n(Z)} hours`,
                    "Wage w": eur(w),
                    "Price p": eur(p),
                },
                answer,
                explanation: String.raw`$F^* = \frac{p \, Z}{p + w}$. The budget line is $p \, q + w \, F = w \, Z$ — every hour of free time costs the wage it forgoes. The optimum equates the marginal rate of substitution with the relative price, $\frac{MU_q}{MU_F} = \frac{p}{w}$, which for $U = \sqrt{q} + \sqrt{F}$ gives $\sqrt{F / q} = \frac{p}{w}$, i.e. $F = \left( \frac{p}{w} \right)^2 q$; substituting into the budget line yields the formula above. Here $F^*$ = ${n(p)} · ${n(Z)} / (${n(p)} + ${n(w)}) = ${n(answer)} hours, leaving ${n(Z - answer)} hours of paid work. A higher wage makes free time more expensive and shrinks $F^*$.`,
            };
        },
    },
    {
        id: "e1-ct-labor-hours-worked",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P7",
        build: (rng) => {
            const p = rng.pick([1, 2, 3, 4]);
            const w = rng.pick([2, 3, 4, 5, 6, 8, 10, 12].filter((x) => x !== p));
            const cycle = p * (p + w);
            let v = rng.int(Math.ceil(24 / cycle), Math.floor(168 / cycle));
            if (p === 1 && w === 5 && cycle * v === 24) v += 1;
            const Z = cycle * v;
            const F = p * p * v;
            const answer = p * w * v; // = Z - F = w Z / (p + w)
            return {
                prompt: String.raw`A bike courier in Tallinn can allocate ${n(Z)} hours a week between paid work $L$ and free time $F$. Each hour of work pays ${eur(w)}, and all income is spent on one consumption good priced at ${eur(p)} per unit. His preferences are $U(q, F) = \sqrt{q} + \sqrt{F}$. How many hours does he **work** at his optimum?`,
                given: {
                    "Time budget Z": `${n(Z)} hours`,
                    "Wage w": eur(w),
                    "Price p": eur(p),
                },
                answer,
                explanation: String.raw`$L^* = \frac{w \, Z}{p + w}$, the mirror image of $F^* = \frac{p \, Z}{p + w}$ in the time constraint $L + F = Z$. The optimum condition $\frac{MU_q}{MU_F} = \frac{p}{w}$ for $U = \sqrt{q} + \sqrt{F}$ reads $\sqrt{F / q} = \frac{p}{w}$; inserting $F = \left( \frac{p}{w} \right)^2 q$ into the budget line $p \, q + w \, F = w \, Z$ gives both. Here $L^*$ = ${n(w)} · ${n(Z)} / (${n(p)} + ${n(w)}) = ${n(answer)} hours, so free time is ${n(F)} hours. Note the split depends only on the ratio $p / w$, not on how long the week is.`,
            };
        },
    },
    {
        id: "e1-ct-labor-consumption",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P8",
        build: (rng) => {
            const p = rng.pick([1, 2, 3, 4]);
            const w = rng.pick([2, 3, 4, 5, 6, 8, 10, 12].filter((x) => x !== p));
            const cycle = p * (p + w);
            let v = rng.int(Math.ceil(24 / cycle), Math.floor(168 / cycle));
            if (p === 1 && w === 5 && cycle * v === 24) v += 1;
            const Z = cycle * v;
            const F = p * p * v;
            const L = p * w * v;
            const answer = w * w * v; // = w^2 Z / (p (p + w))
            return {
                prompt: String.raw`A piano teacher in Ljubljana divides ${n(Z)} hours a week between paid lessons $L$ and free time $F$. An hour of teaching pays ${eur(w)}, and her whole income goes on one consumption good that costs ${eur(p)} per unit. With preferences $U(q, F) = \sqrt{q} + \sqrt{F}$, how many **units of the consumption good** does she buy at her optimum?`,
                given: {
                    "Time budget Z": `${n(Z)} hours`,
                    "Wage w": eur(w),
                    "Price p": eur(p),
                },
                answer,
                explanation: String.raw`$q^* = \frac{w^2 Z}{p \, (p + w)}$. From $\frac{MU_q}{MU_F} = \frac{p}{w}$ the optimum satisfies $F = \left( \frac{p}{w} \right)^2 q$; putting that into the budget line $p \, q + w \, F = w \, Z$ leaves $q \left( p + \frac{p^2}{w} \right) = w Z$, which rearranges to the formula. Here $q^*$ = ${n(w)}² · ${n(Z)} / (${n(p)} · ${n(p + w)}) = ${n(answer)} units. Check with the budget: she works ${n(L)} hours for ${eur(w * L)}, and ${n(answer)} units at ${eur(p)} cost exactly that; her free time is ${n(F)} hours.`,
            };
        },
    },
    {
        id: "e1-ct-labor-hypothetical-bundle",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P9",
        build: (rng) => {
            const [p, w, m] = rng.pick(LABOR_TUPLES);
            const j = m + 1;
            const wNew = p * m; // the wage after the change
            const Z = p * j * j * (p + w);
            const F0 = p * p * j * j;
            const q0 = (w * j) ** 2;
            const U0 = j * (p + w); // = sqrt(q0) + sqrt(F0)
            const answer = ((p + w) * m) ** 2; // = (U0 / (1 + p/wNew))^2
            const FHat = (p + w) ** 2;
            return {
                prompt: String.raw`A data analyst in Bilbao splits ${n(Z)} hours a week between paid work and free time $F$, spending all earnings on one consumption good priced at ${eur(p)} per unit; her preferences are $U(q, F) = \sqrt{q} + \sqrt{F}$. At the old wage of ${eur(w)} per hour she chose her optimum. The wage now changes to ${eur(wNew)}. Which quantity of the consumption good would she buy if she were compensated so that she reaches **exactly her old utility level** at the new wage while spending as little as possible?`,
                given: {
                    "Time budget Z": `${n(Z)} hours`,
                    "Old wage w": eur(w),
                    "New wage w'": eur(wNew),
                    "Price p": eur(p),
                },
                answer,
                explanation: String.raw`$\hat{q} = \left( \frac{U_0}{1 + p / w'} \right)^2$. First the old optimum: $F_0 = \frac{p Z}{p + w}$ = ${n(F0)} hours and $q_0 = \frac{w^2 Z}{p (p + w)}$ = ${n(q0)} units, so $U_0 = \sqrt{q_0} + \sqrt{F_0}$ = ${n(Math.sqrt(q0))} + ${n(Math.sqrt(F0))} = ${n(U0)}. The compensated bundle must satisfy the new tangency $F = \left( \frac{p}{w'} \right)^2 q$ **and** stay on the old indifference curve, so $\sqrt{q} \left( 1 + \frac{p}{w'} \right) = U_0$. Here $1 + \frac{p}{w'} = \frac{${n(j)}}{${n(m)}}$, so $\sqrt{\hat{q}} = ${n(U0)} \cdot \frac{${n(m)}}{${n(j)}} = ${n(Math.sqrt(answer))}$ and $\hat{q}$ = ${n(answer)} units, alongside $\hat{F} = \left( \frac{p}{w'} \right)^2 \hat{q}$ = ${n(FHat)} hours. This is the substitution effect alone — same utility, new relative price of free time.`,
            };
        },
    },
    {
        id: "e1-ct-labor-hypothetical-time-budget",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P9",
        build: (rng) => {
            const [p, w, m] = rng.pick(LABOR_TUPLES);
            const j = m + 1;
            const wNew = p * m;
            const Z = p * j * j * (p + w);
            const F0 = p * p * j * j;
            const q0 = (w * j) ** 2;
            const U0 = j * (p + w);
            const qHat = ((p + w) * m) ** 2;
            const FHat = (p + w) ** 2;
            const answer = (p + w) ** 2 * (m + 1); // = (p qHat + wNew FHat) / wNew
            return {
                prompt: String.raw`A translator in Turku currently has ${n(Z)} hours a week to divide between paid work and free time $F$, buys one consumption good at ${eur(p)} per unit and has preferences $U(q, F) = \sqrt{q} + \sqrt{F}$. Her wage changes from ${eur(w)} to ${eur(wNew)} per hour. How large would her time budget have to be, in hours, so that at the **new** wage she could just afford the bundle that keeps her at her old utility level?`,
                given: {
                    "Time budget Z": `${n(Z)} hours`,
                    "Old wage w": eur(w),
                    "New wage w'": eur(wNew),
                    "Price p": eur(p),
                },
                answer,
                explanation: String.raw`$\hat{Z} = \frac{p \, \hat{q} + w' \hat{F}}{w'}$ — the time endowment whose full-time value $w' \hat{Z}$ pays for the compensated bundle. Old optimum: $F_0 = \frac{p Z}{p + w}$ = ${n(F0)} hours, $q_0 = \frac{w^2 Z}{p (p + w)}$ = ${n(q0)} units, hence $U_0$ = ${n(Math.sqrt(q0))} + ${n(Math.sqrt(F0))} = ${n(U0)}. The compensated bundle solves $\sqrt{q}\left( 1 + \frac{p}{w'} \right) = U_0$ with $F = \left( \frac{p}{w'} \right)^2 q$: $\hat{q}$ = ${n(qHat)} units and $\hat{F}$ = ${n(FHat)} hours. So $\hat{Z}$ = (${eur(p)} · ${n(qHat)} + ${eur(wNew)} · ${n(FHat)}) / ${eur(wNew)} = ${n(answer)} hours, against the actual ${n(Z)} hours.`,
            };
        },
    },

    // ------------------------------------ consumer theory: other preference types
    {
        id: "e1-ct-leontief-demand",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exercise Exam WT22/23, Q8",
        build: (rng) => {
            const r = rng.int(2, 6); // biscuits per coffee
            const p1 = rng.int(2, 6);
            const p2 = rng.int(1, 4);
            const answer = rng.int(3, 14); // q1*, drawn first so the budget stays clean
            const M = (p1 + r * p2) * answer;
            return {
                prompt: String.raw`A guest at a café in Valencia treats coffees ($q_1$) and biscuits ($q_2$) as perfect complements: he always eats exactly ${n(r)} biscuits with each coffee, so $U(q_1, q_2) = \min\{ ${n(r)}\, q_1,\; q_2 \}$. A coffee costs ${eur(p1)}, a biscuit ${eur(p2)}, and he has ${eur(M)} to spend. How many **coffees** does he buy at the optimum?`,
                given: {
                    "Utility": String.raw`$U = \min\{ ${n(r)}\, q_1,\; q_2 \}$`,
                    "Price $p_1$": eur(p1),
                    "Price $p_2$": eur(p2),
                    "Budget M": eur(M),
                },
                answer,
                explanation: String.raw`$q_1^* = \frac{M}{p_1 + p_2 \cdot \alpha / \beta}$ for $U = \min\{ \alpha q_1, \beta q_2 \}$. Nothing above the kink is ever bought, so the optimum sits where $\alpha q_1 = \beta q_2$, here $q_2 = ${n(r)}\, q_1$ — one coffee always drags ${n(r)} biscuits along, a bundle costing ${eur(p1)} + ${n(r)} · ${eur(p2)} = ${eur(p1 + r * p2)}. Dividing the budget by that bundle price: ${eur(M)} / ${eur(p1 + r * p2)} = ${n(answer)} coffees, together with ${n(r * answer)} biscuits. With perfect complements the tangency condition never applies — the indifference curves have a kink, not a slope.`,
            };
        },
    },
    {
        id: "e1-ct-substitutes-max-utility",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics I Exercise Exam WT22/23, Q14",
        build: (rng) => {
            const p1 = rng.int(2, 6);
            const p2 = rng.int(2, 6);
            const alpha = rng.int(p1, p1 + 5);
            const beta = rng.int(1, Math.floor((0.8 * alpha * p2) / p1)); // beta/p2 <= 0.8 alpha/p1
            const k = rng.int(2, 6);
            const M = p1 * p2 * k;
            const answer = alpha * p2 * k; // = alpha * M / p1, the larger of the two
            const other = beta * p1 * k;
            const swap = rng.int(0, 1) === 1;
            const [cA, pA, cB, pB] = swap ? [beta, p2, alpha, p1] : [alpha, p1, beta, p2];
            return {
                prompt: String.raw`A cyclist in Utrecht buys energy bars from two brands that she regards as perfect substitutes, with $U(q_1, q_2) = ${co(cA)}q_1 + ${co(cB)}q_2$. Brand 1 costs ${eur(pA)} per bar, brand 2 costs ${eur(pB)} per bar, and she has ${eur(M)} to spend. What is the highest utility level she can reach?`,
                given: {
                    "Utility": String.raw`$U = ${co(cA)}q_1 + ${co(cB)}q_2$`,
                    "Price $p_1$": eur(pA),
                    "Price $p_2$": eur(pB),
                    "Budget M": eur(M),
                },
                answer,
                explanation: String.raw`$U^* = \max \left\{ \frac{\alpha M}{p_1},\; \frac{\beta M}{p_2} \right\}$. Linear preferences mean a constant $MRS$, so the whole budget goes to whichever good delivers more utility per euro: ${n(cA)} / ${n(pA)} = ${n2(cA / pA)} against ${n(cB)} / ${n(pB)} = ${n2(cB / pB)}. The better buy wins by more than 20 %, so this is a corner solution — she spends everything on ${swap ? "brand 2" : "brand 1"} and buys ${n(p2 * k)} bars of it. Utility: ${n(p2 * k)} · ${n(alpha)} = ${n(answer)}. Spending everything on the other brand would only give ${n(other)}.`,
            };
        },
    },
    {
        id: "e1-ct-cross-price-quantity",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exercise Exam WT22/23, Q16",
        build: (rng) => {
            const eta = rng.pick([-2, -1.5, -1, -0.5, 0.25, 0.5, 0.8, 1.2, 1.5]);
            const x = rng.pick([4, 5, 8, 10, 12, 15, 20]);
            const scaled = Math.abs(eta * 100 * x); // integer
            const step = 10000 / gcd(scaled, 10000); // smallest q1 that keeps the answer integer
            const lo = Math.ceil(100 / step); // keep the weekly volume realistic
            const q1 = step * rng.int(lo, lo + 8);
            const answer = q1 * (1 + (eta * x) / 100);
            return {
                prompt: String.raw`A supermarket chain in Antwerp currently sells ${n(q1)} litres of oat drink a week. Its cross-price elasticity of demand with respect to the price of cow milk is ${n(eta)}. The price of cow milk now rises by ${pct(x)}, everything else unchanged. How many litres of oat drink will the chain sell per week?`,
                given: {
                    "Current quantity $q_1$": `${n(q1)} litres`,
                    "Cross-price elasticity $η_{1,2}$": n(eta),
                    "Change in $p_2$": pct(x),
                },
                answer,
                explanation: String.raw`$\eta_{1,2} = \frac{\Delta q_1 / q_1}{\Delta p_2 / p_2}$, so the quantity reacts by $\Delta q_1 / q_1 = \eta_{1,2} \cdot \Delta p_2 / p_2$. Here that is ${n(eta)} · ${pct(x)} = ${pct(eta * x)}, so the ${n(q1)} litres change by ${n(answer - q1)} litres to ${n(answer)} litres. A ${eta > 0 ? "positive" : "negative"} cross-price elasticity marks the two goods as ${eta > 0 ? "substitutes — the dearer cow milk pushes buyers towards oat drink" : "complements — they are bought together, so the dearer cow milk drags oat drink down with it"}.`,
            };
        },
    },
    {
        id: "e1-ct-own-price-quantity-change",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics I Exam WS19/20, P17",
        build: (rng) => {
            const eta = rng.pick([-0.4, -0.5, -0.8, -1.25, -1.5, -2, -2.5]);
            const x = rng.pick([4, 5, 8, 10, 12, 15, 20]);
            const up = rng.int(0, 1) === 1;
            const change = up ? x : -x;
            const answer = eta * change;
            return {
                prompt: String.raw`A gym chain in Gothenburg estimates the own-price elasticity of demand for its monthly passes at ${n(eta)}. It now ${up ? "raises" : "lowers"} the price of a pass by ${pct(x)}. By what percentage does the number of passes sold change? (A decrease is a negative number.)`,
                given: {
                    "Own-price elasticity $η_p$": n(eta),
                    "Change in price": pct(change),
                },
                answer,
                explanation: String.raw`$\eta_p = \frac{\Delta q / q}{\Delta p / p}$, so $\Delta q / q = \eta_p \cdot \Delta p / p$. Substituting: ${n(eta)} · ${pct(change)} = ${pct(answer)}. With $|\eta_p|$ = ${n(Math.abs(eta))} demand is ${Math.abs(eta) > 1 ? "elastic" : "inelastic"}: the quantity reacts ${Math.abs(eta) > 1 ? "more" : "less"} than proportionally to the price, so the price ${up ? "rise" : "cut"} ${Math.abs(eta) > 1 ? (up ? "lowers" : "raises") : up ? "raises" : "lowers"} total revenue.`,
            };
        },
    },

    // --------------------------------------------------- production & costs
    {
        id: "e1-prod-mrts-at-point",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "medium",
        kind: "numeric",
        unit: "ratio",
        source: "TUM Economics I Exercise Exam WT22/23, Q19",
        build: (rng) => {
            const a = rng.pick([2, 3, 4]);
            const L = rng.int(2, 8);
            const K = Math.ceil((3 * L) / a) + rng.int(0, 6); // a K > 2 L by construction
            const answer = (a * K - 2 * L) / (a * L);
            return {
                prompt: String.raw`A ceramics studio in Faenza produces with the technology $Q = ${co(a)}K L - L^2$, where $L$ is labour and $K$ is capital. It currently uses $K$ = ${n(K)} machines and $L$ = ${n(L)} workers. How many units of capital can it give up per additional worker while holding output constant — the absolute value of $MRTS_{L,K}$ at this input combination?`,
                given: {
                    "Technology": String.raw`$Q = ${co(a)}K L - L^2$`,
                    "Capital K": n(K),
                    "Labour L": n(L),
                },
                answer,
                explanation: String.raw`$MRTS_{L,K} = \frac{MP_L}{MP_K}$ — the slope of the isoquant, i.e. how much capital one extra worker replaces. The marginal products are $MP_L = ${co(a)}K - 2 L$ and $MP_K = ${co(a)}L$. At (K, L) = (${n(K)}, ${n(L)}): $MP_L$ = ${n(a)} · ${n(K)} − 2 · ${n(L)} = ${n(a * K - 2 * L)} and $MP_K$ = ${n(a)} · ${n(L)} = ${n(a * L)}. So $MRTS_{L,K}$ = ${n(a * K - 2 * L)} / ${n(a * L)} = ${n2(answer)} units of capital per worker. It falls as $L$ rises — the isoquants are convex.`,
            };
        },
    },
    {
        id: "e1-prod-average-product-at-point",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exercise Exam WT22/23, Q19",
        build: (rng) => {
            const a = rng.pick([2, 3, 4]);
            const L = rng.int(2, 8);
            const K = Math.ceil((3 * L) / a) + rng.int(0, 6);
            const answer = a * K - L;
            return {
                prompt: String.raw`A cannery in Vigo produces $Q = ${co(a)}K L - L^2$ tins per shift with $L$ workers and $K$ machines. Today it runs ${n(K)} machines and ${n(L)} workers. What is the **average product of labour** at this input combination, in tins per worker?`,
                given: {
                    "Technology": String.raw`$Q = ${co(a)}K L - L^2$`,
                    "Capital K": n(K),
                    "Labour L": n(L),
                },
                answer,
                explanation: String.raw`$AP_L = \frac{Q}{L}$. Dividing the technology by $L$ gives $AP_L = ${co(a)}K - L$, so the machine stock lifts the average product while extra workers erode it. Output today: $Q$ = ${n(a)} · ${n(K)} · ${n(L)} − ${n(L)}² = ${n(a * K * L - L * L)} tins, and $AP_L$ = ${n(a * K * L - L * L)} / ${n(L)} = ${n(answer)} tins per worker. The marginal product $MP_L = ${co(a)}K - 2 L$ = ${n(a * K - 2 * L)} is below it, so hiring one more worker would pull the average down.`,
            };
        },
    },
    {
        id: "e1-prod-returns-to-scale-factor",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "easy",
        kind: "numeric",
        unit: "ratio",
        source: "TUM Economics I Exercise Exam WT22/23, Q20",
        build: (rng) => {
            const [an, ad, bn, bd] = rng.pick([
                [1, 2, 1, 2],
                [1, 4, 1, 4],
                [1, 3, 1, 3],
                [1, 2, 1, 4],
                [3, 4, 1, 2],
                [2, 3, 2, 3],
                [1, 1, 1, 1],
            ] as const);
            const lambda = rng.pick([2, 3, 4]);
            const sumNum = an * bd + bn * ad;
            const sumDen = ad * bd;
            const g = gcd(sumNum, sumDen);
            const sum = sumNum / sumDen;
            const answer = lambda ** sum;
            const kind = sum > 1 ? "increasing" : sum < 1 ? "decreasing" : "constant";
            return {
                prompt: String.raw`A shipyard in Gdansk produces with $Q = ${powTex("L", an, ad)} \cdot ${powTex("K", bn, bd)}$. It ${lambda === 2 ? "doubles" : lambda === 3 ? "triples" : "quadruples"} **both** inputs, so labour and capital are each multiplied by ${n(lambda)}. By what factor does output change?`,
                given: {
                    "Technology": String.raw`$Q = ${powTex("L", an, ad)} \cdot ${powTex("K", bn, bd)}$`,
                    "Input factor λ": n(lambda),
                },
                answer,
                explanation: String.raw`$\frac{Q(\lambda L, \lambda K)}{Q(L, K)} = \lambda^{\alpha + \beta}$ for a Cobb-Douglas technology $Q = L^{\alpha} K^{\beta}$: each input contributes $\lambda^{\text{its exponent}}$. Here $\alpha + \beta = ${fracTex(an, ad)} + ${fracTex(bn, bd)} = ${fracTex(sumNum / g, sumDen / g)}$, so output grows by the factor $\lambda^{\alpha + \beta} = ${n(lambda)}^{${fracTex(sumNum / g, sumDen / g)}}$ = ${n2(answer)}. Because the exponents sum to ${sum === 1 ? "exactly 1" : sum > 1 ? "more than 1" : "less than 1"}, the technology has ${kind} returns to scale.`,
            };
        },
    },
    {
        id: "e1-prod-cost-min-labor-bilinear",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exam WS19/20, P20",
        build: (rng) => {
            const c = rng.pick([1, 2, 3, 4]);
            const r = rng.pick([4, 5, 10]);
            const s = rng.int(1, 3); // wage-rental ratio w / r
            const w = s * r;
            const answer = rng.int(3, 12); // L*, drawn first so the root is clean
            const K = s * answer;
            const Q = c * answer * K;
            return {
                prompt: String.raw`A glassworks in Murano produces with $q = ${co(c)}L K$, where $L$ is labour and $K$ is capital. A unit of labour costs ${eur(w)}, a unit of capital ${eur(r)}. The firm has to deliver ${n(Q)} units and wants to do so at minimum cost. How much **labour** does it hire?`,
                given: {
                    "Technology": String.raw`$q = ${co(c)}L K$`,
                    "Wage w": eur(w),
                    "Rental rate r": eur(r),
                    "Required output": `${n(Q)} units`,
                },
                answer,
                explanation: String.raw`$MRTS_{L,K} = \frac{K}{L} = \frac{w}{r}$ at the cost minimum: $MP_L = c K$ and $MP_K = c L$, so the isoquant slope $K / L$ has to match the price ratio. Here $K$ = ${eur(w)} / ${eur(r)} · $L$ = ${n(s)} $L$. Substituting into the technology: ${n(Q)} = ${n(c)} · ${n(s)} · $L^2$, hence $L^* = \sqrt{\frac{\bar q \, r}{c \, w}}$ = √(${n(Q)} / ${n(c * s)}) = ${n(answer)} units of labour, with $K^*$ = ${n(K)}. Cheaper capital would tilt the mix towards capital and away from labour.`,
            };
        },
    },
    {
        id: "e1-prod-min-cost-bilinear",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P21",
        build: (rng) => {
            const c = rng.pick([1, 2, 3, 4]);
            const r = rng.pick([4, 5, 10]);
            const s = rng.int(1, 3);
            const w = s * r;
            const L = rng.int(3, 12);
            const K = s * L;
            const Q = c * L * K;
            const answer = w * L + r * K; // = 2 sqrt(Q w r / c)
            return {
                prompt: String.raw`A brewery in Plzen produces with $q = ${co(c)}L K$ from labour $L$ at ${eur(w)} per unit and capital $K$ at ${eur(r)} per unit. What is the **minimum cost** of producing ${n(Q)} units?`,
                given: {
                    "Technology": String.raw`$q = ${co(c)}L K$`,
                    "Wage w": eur(w),
                    "Rental rate r": eur(r),
                    "Required output": `${n(Q)} units`,
                },
                answer,
                explanation: String.raw`$C(\bar q) = w L^* + r K^*$, with the cost-minimising inputs from $\frac{K}{L} = \frac{w}{r}$ and the isoquant. From $K = ${co(s)}L$ and ${n(Q)} = ${n(c)} · ${n(s)} · $L^2$: $L^*$ = ${n(L)} and $K^*$ = ${n(K)}. Cost: ${eur(w)} · ${n(L)} + ${eur(r)} · ${n(K)} = ${eur(answer)}. Equivalently $C(\bar q) = 2 \sqrt{\frac{\bar q \, w \, r}{c}}$ — labour and capital each absorb exactly half of the bill at the optimum.`,
            };
        },
    },
    {
        id: "e1-prod-min-cost-cobb-douglas",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I eTest W20/21, Q32",
        build: (rng) => {
            const [w, r] = rng.pick([
                [3, 12],
                [4, 9],
                [4, 16],
                [5, 20],
                [6, 24],
                [8, 18],
                [9, 16],
                [12, 27],
                [2, 18],
            ] as const);
            const root = Math.round(Math.sqrt(w * r)); // exact by construction
            const A = rng.pick([2, 3, 4, 5].filter((d) => (2 * root) % d === 0));
            const t = rng.int(10, 40);
            const Q = A * t;
            const answer = 2 * root * t; // = (2 sqrt(w r) / A) * Q
            return {
                prompt: String.raw`A paper mill in Lahti produces with $Q = ${n(A)} \, L^{1/2} K^{1/2}$. Labour costs ${eur(w)} per unit, capital ${eur(r)} per unit, and there are no other costs. What is the **minimum cost** of producing ${n(Q)} tonnes?`,
                given: {
                    "Technology": String.raw`$Q = ${n(A)} \, L^{1/2} K^{1/2}$`,
                    "Wage w": eur(w),
                    "Rental rate r": eur(r),
                    "Required output": `${n(Q)} tonnes`,
                },
                answer,
                explanation: String.raw`$C(Q) = \frac{2 \sqrt{w r}}{A} \cdot Q$. Cost minimisation sets $MRTS_{L,K} = \frac{K}{L} = \frac{w}{r}$; substituting $K = \frac{w}{r} L$ into the technology gives $L^* = \frac{Q}{A} \sqrt{\frac{r}{w}}$ and $K^* = \frac{Q}{A} \sqrt{\frac{w}{r}}$, and the two input bills are equal. Here $\sqrt{w r}$ = √(${n(w)} · ${n(r)}) = ${n(root)}, so cost per tonne is 2 · ${n(root)} / ${n(A)} = ${eur((2 * root) / A)} and the total is ${eur((2 * root) / A)} · ${n(Q)} = ${eur(answer)}. Unit cost is constant — the technology has constant returns to scale.`,
            };
        },
    },
    {
        id: "e1-prod-output-from-budget",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exam WS19/20, P23",
        build: (rng) => {
            const c = rng.pick([1, 2, 3, 4]);
            const w = rng.int(2, 12);
            const r = rng.int(2, 12);
            const lcm = (w * r) / gcd(w, r);
            // output is c k^2 lcm / gcd(w, r); pick k so output and budget both stay plausible
            const scale = (c * lcm) / gcd(w, r);
            const lo = Math.max(1, Math.ceil(Math.sqrt(50 / scale)), Math.ceil(60 / lcm));
            const hi = Math.max(lo, Math.floor(Math.sqrt(9000 / scale)));
            let k = rng.int(lo, hi);
            // never the source's tuple (c = 2, {w, r} = {5, 6}, budget 360)
            if (c === 2 && w * r === 30 && w >= 5 && r >= 5 && 2 * lcm * k === 360) k = 5;
            const B = 2 * lcm * k;
            const L = B / (2 * w);
            const K = B / (2 * r);
            const answer = c * L * K; // = c B^2 / (4 w r)
            return {
                prompt: String.raw`A print shop in Leipzig produces with $q = ${co(c)}L K$ from labour $L$ at ${eur(w)} per unit and capital $K$ at ${eur(r)} per unit. It spends a budget of ${eur(B)} in full and splits it between the two inputs so that output is as large as possible. How many units does it produce?`,
                given: {
                    "Technology": String.raw`$q = ${co(c)}L K$`,
                    "Wage w": eur(w),
                    "Rental rate r": eur(r),
                    "Budget B": eur(B),
                },
                answer,
                explanation: String.raw`$q = c \cdot \frac{B}{2w} \cdot \frac{B}{2r}$. Maximising $c L K$ on the budget line $w L + r K = B$ requires $\frac{MP_L}{MP_K} = \frac{K}{L} = \frac{w}{r}$, which means each input absorbs exactly half of the budget: $L = \frac{B}{2w}$ = ${n(L)} and $K = \frac{B}{2r}$ = ${n(K)}. Output: ${n(c)} · ${n(L)} · ${n(K)} = ${n(answer)} units. Equivalently $q = \frac{c B^2}{4 w r}$ — output grows with the **square** of the budget here, because both inputs expand together.`,
            };
        },
    },
    {
        id: "e1-prod-zero-profit-price",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P24",
        build: (rng) => {
            const c = rng.pick([1, 2]);
            const r = rng.pick([5, 10, 20]);
            const s = rng.int(1, 3);
            const w = s * r;
            const L = rng.int(3, 8);
            const K = s * L;
            const Q = c * L * K;
            const cost = w * L + r * K;
            const answer = cost / Q; // = 2 sqrt(w r / (c q))
            return {
                prompt: String.raw`A soap works in Marseille produces with $q = ${co(c)}L K$, hiring labour at ${eur(w)} per unit and capital at ${eur(r)} per unit, and it makes ${n(Q)} bars of soap at minimum cost. It sells at a price it cannot influence. At which **output price** is its profit exactly zero?`,
                given: {
                    "Technology": String.raw`$q = ${co(c)}L K$`,
                    "Wage w": eur(w),
                    "Rental rate r": eur(r),
                    "Output": `${n(Q)} bars`,
                },
                answer,
                explanation: String.raw`$\hat{p} = \frac{C(\bar q)}{\bar q}$ — profit $\hat p \, \bar q - C(\bar q)$ vanishes exactly at average cost. Cost minimisation ($\frac{K}{L} = \frac{w}{r}$) gives $K = ${co(s)}L$, and ${n(Q)} = ${n(c)} · ${n(s)} · $L^2$ gives $L^*$ = ${n(L)}, $K^*$ = ${n(K)}, so $C$ = ${eur(w)} · ${n(L)} + ${eur(r)} · ${n(K)} = ${eur(cost)}. Hence $\hat p$ = ${eur(cost)} / ${n(Q)} = ${eur(answer)}, which is also $2 \sqrt{\frac{w \, r}{c \, \bar q}}$. Below this price the soap works makes a loss on every bar.`,
            };
        },
    },
    {
        id: "e1-prod-marginal-cost-from-technology",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P13",
        build: (rng) => {
            const [w, r] = rng.pick([
                [2, 8],
                [3, 12],
                [4, 9],
                [4, 16],
                [5, 20],
                [6, 24],
                [8, 18],
                [9, 16],
            ] as const);
            const root = Math.round(Math.sqrt(w * r));
            const q0 = rng.int(2, 12);
            const answer = 4 * root * q0;
            return {
                prompt: String.raw`A machine shop in Brno produces with $q = (L K)^{1/4}$, paying ${eur(w)} per unit of labour and ${eur(r)} per unit of capital, and it always chooses the cheapest input mix for whatever output it makes. What are its **marginal costs** at an output of ${n(q0)} units?`,
                given: {
                    "Technology": String.raw`$q = (L K)^{1/4}$`,
                    "Wage w": eur(w),
                    "Rental rate r": eur(r),
                    "Output q": `${n(q0)} units`,
                },
                answer,
                explanation: String.raw`$MC(q) = 4 \sqrt{w r} \cdot q$. Cost minimisation gives $\frac{K}{L} = \frac{w}{r}$; with $L K = q^4$ that means $L = q^2 \sqrt{\frac{r}{w}}$ and $K = q^2 \sqrt{\frac{w}{r}}$, so $C(q) = w L + r K = 2 \sqrt{w r} \, q^2$ and $MC = \frac{dC}{dq} = 4 \sqrt{w r} \, q$. Here $\sqrt{w r}$ = √(${n(w)} · ${n(r)}) = ${n(root)}, so $MC$ = 4 · ${n(root)} · ${n(q0)} = ${eur(answer)}. Marginal cost rises linearly — the technology has decreasing returns to scale, since the exponents sum to $\frac{1}{2}$.`,
            };
        },
    },
    {
        id: "e1-prod-unit-cost-crs",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I eTest W20/21, Q34",
        build: (rng) => {
            const [w, r] = rng.pick([
                [3, 12],
                [4, 9],
                [4, 16],
                [5, 20],
                [6, 24],
                [9, 16],
                [12, 27],
                [2, 18],
                [3, 27],
                [7, 28],
                [9, 25],
                [10, 40],
                [8, 32],
            ] as const);
            const root = Math.round(Math.sqrt(w * r));
            const A = rng.pick([2, 3, 4, 5].filter((d) => (2 * root) % d === 0));
            const answer = (2 * root) / A;
            return {
                prompt: String.raw`A blade plant in Aalborg produces with $Q = ${n(A)} \, L^{1/2} K^{1/2}$, paying ${eur(w)} per unit of labour and ${eur(r)} per unit of capital. It has no fixed costs and takes the market price as given. Below which **output price** would it be better off producing nothing at all?`,
                given: {
                    "Technology": String.raw`$Q = ${n(A)} \, L^{1/2} K^{1/2}$`,
                    "Wage w": eur(w),
                    "Rental rate r": eur(r),
                },
                answer,
                explanation: String.raw`$\underline{p} = \frac{2 \sqrt{w r}}{A}$ — the constant unit cost. Cost minimisation ($\frac{K}{L} = \frac{w}{r}$) turns the technology into $C(Q) = \frac{2 \sqrt{w r}}{A} \, Q$: with constant returns to scale, average and marginal cost coincide and never change with output. Here $\sqrt{w r}$ = √(${n(w)} · ${n(r)}) = ${n(root)}, so unit cost is 2 · ${n(root)} / ${n(A)} = ${eur(answer)}. Below that price every unit loses money and the plant shuts down; above it profit grows without bound, and exactly at it any quantity yields zero profit.`,
            };
        },
    },

    // ---------------------------------------------------- perfect competition
    {
        id: "e1-pc-shortrun-supply-from-mc",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P14",
        build: (rng) => {
            const k = rng.pick([2, 4, 5, 8, 10, 20, 25]); // slope of MC
            // q never equals 5 when k = 20, so the original (k, p) = (20, 100) is out
            const q = k === 20 ? rng.int(6, 14) : rng.int(3, 14);
            const p = k * q; // price is a multiple of k, so q* is an integer
            const F = rng.int(2, 12) * 10;
            return {
                prompt: String.raw`A price-taking olive mill in Jaén has the variable cost $C_v(q) = ${n(k / 2)} q^2$, where $q$ is the number of hectolitres of oil pressed per season, and pays a fixed rent of ${eur(F)} per season. The market price is ${eur(p)} per hectolitre. How many hectolitres does the mill press at its short-run profit-maximizing output?`,
                given: {
                    "Variable cost": String.raw`$C_v(q) = ${n(k / 2)} q^2$`,
                    "Fixed rent": eur(F),
                    "Market price p": eur(p),
                },
                answer: q,
                explanation: String.raw`A price taker produces where $p = MC(q)$ — the fixed cost never enters this condition. Marginal cost here is $MC(q) = ${co(k)}q$, so $${co(k)}q = ${n(p)}$ gives $q^*$ = ${n(p)} / ${n(k)} = ${n(q)} hectolitres. The mill also stays open: average variable cost $AVC = ${n(k / 2)} q$ approaches 0 as $q \to 0$, so every positive price lies above the shut-down point. The rent of ${eur(F)} is sunk in the short run and only shifts the profit level, never the optimal quantity.`,
            };
        },
    },
    {
        id: "e1-pc-threshold-price-no-linear",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P15",
        build: (rng) => {
            const a = rng.pick([1, 2, 4, 5, 10]); // cost curvature
            // efficient scale sqrt(F/a); a = 10 with qm = 10 would reproduce the
            // source's C(q) = 10 q^2 + 1,000 (threshold 200), so cap qm at 9 there.
            const qm = rng.int(3, a === 10 ? 9 : 10);
            const F = a * qm * qm; // makes F/a a perfect square
            const answer = 2 * a * qm; // min AC = 2 sqrt(a F)
            return {
                prompt: String.raw`A workshop for hand-glazed tiles in Lisbon has the long-run cost $C(q) = ${co(a)}q^2 + ${n(F)}$ for $q > 0$, and $C(0) = 0$ — in the long run even the ${eur(F)} of overhead can be avoided by closing down. The workshop is a price taker. Above which market price per crate of tiles does it stay in the market?`,
                given: {
                    "Long-run cost": String.raw`$C(q) = ${co(a)}q^2 + ${n(F)}$ for $q > 0$`,
                    "Cost when closed": String.raw`$C(0) = 0$`,
                },
                answer,
                explanation: String.raw`The long-run threshold is the minimum of average cost, $\bar p = \min AC = 2 \sqrt{a F}$. Average cost is $AC(q) = ${co(a)}q + \frac{${n(F)}}{q}$; it is minimal where $${n(a)} = \frac{${n(F)}}{q^2}$, i.e. at the efficient scale $q^* = \sqrt{F / a}$ = ${n(qm)} crates. There $AC$ = ${n(a)} · ${n(qm)} + ${n(F)} / ${n(qm)} = ${eur(answer)}. Below that price no output level covers average cost, so the workshop closes; above it, it earns a positive profit.`,
            };
        },
    },
    {
        id: "e1-pc-shutdown-price",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I eTest W20/21, Q37",
        build: (rng) => {
            const a = rng.pick([1, 2, 3, 4, 5]);
            const qm = rng.int(3, 10);
            const F = a * qm * qm;
            const b = rng.int(4, 30); // min AVC
            const lr = b + 2 * a * qm; // long-run break-even price
            return {
                prompt: String.raw`A mineral-water bottler in Bergen has the short-run cost $C(q) = ${co(a)}q^2 + ${co(b)}q + ${n(F)}$, where ${eur(F)} is the fixed cost of the plant and cannot be recovered this season. Below which market price per crate does the bottler stop producing altogether in the **short run**?`,
                given: {
                    "Cost function": String.raw`$C(q) = ${co(a)}q^2 + ${co(b)}q + ${n(F)}$`,
                    "Fixed cost (sunk)": eur(F),
                },
                answer: b,
                explanation: String.raw`In the short run the fixed cost is sunk, so the firm produces as long as the price covers average variable cost: the shut-down price is $p_{\text{shut}} = \min AVC$. Here $AVC(q) = ${co(a)}q + ${n(b)}$ rises in $q$, so its lowest value is reached as $q \to 0$ and equals ${eur(b)}. Check it directly: the optimum is $q^* = \frac{p - ${n(b)}}{${n(2 * a)}}$, where $AVC = \frac{p + ${n(b)}}{2}$, and $p \geq \frac{p + ${n(b)}}{2}$ holds exactly for $p \geq$ ${eur(b)}. The **long-run** threshold is higher, because there the fixed cost has to be earned as well: $b + 2\sqrt{a F}$ = ${eur(lr)}.`,
            };
        },
    },
    {
        id: "e1-pc-shortrun-profit-positive",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P25",
        build: (rng) => {
            const a = rng.pick([1, 2, 3, 4, 5]);
            const qm = rng.int(2, 8); // break-even output
            const F = a * qm * qm;
            const b = rng.int(3, 15);
            const q = qm + rng.int(1, 6); // above the break-even scale
            const p = b + 2 * a * q; // price set so MC = p at q
            const answer = a * (q * q - qm * qm); // = a q^2 - F > 0
            return {
                prompt: String.raw`A cheese dairy in Groningen is one of many price takers and has the cost function $C(q) = ${co(a)}q^2 + ${co(b)}q + ${n(F)}$, with $q$ measured in wheels of cheese per week. The market price is ${eur(p)} per wheel. What weekly profit does the dairy earn at its optimal output? (A loss would be a negative number.)`,
                given: {
                    "Cost function": String.raw`$C(q) = ${co(a)}q^2 + ${co(b)}q + ${n(F)}$`,
                    "Market price p": eur(p),
                },
                answer,
                explanation: String.raw`Profit at the optimum is $\pi = p \, q^* - C(q^*)$, where $q^*$ solves $p = MC(q)$. With $MC(q) = ${n(2 * a)} q + ${n(b)}$, the condition $${n(2 * a)} q + ${n(b)} = ${n(p)}$ gives $q^*$ = ${n(q)} wheels. Revenue is ${eur(p)} · ${n(q)} = ${eur(p * q)}, cost is ${n(a)} · ${n(q * q)} + ${n(b)} · ${n(q)} + ${n(F)} = ${eur(a * q * q + b * q + F)}, so the profit is ${eur(answer)}. The price lies above the break-even price $b + 2\sqrt{a F}$ = ${eur(b + 2 * a * qm)}, which is why the profit is positive rather than a loss.`,
            };
        },
    },
    {
        id: "e1-pc-longrun-quantity-at-price",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I eTest W20/21, Q38",
        build: (rng) => {
            const a = rng.pick([1, 2, 3, 4, 5]);
            const qm = rng.int(2, 8);
            const F = a * qm * qm;
            const b = rng.int(3, 15);
            const pBar = b + 2 * a * qm; // long-run break-even price
            const above = rng.int(0, 1) === 1;
            // q only sets the price when the firm is below the threshold
            const q = above ? qm + rng.int(1, 6) : rng.int(1, qm - 1);
            const p = b + 2 * a * q;
            const answer = above ? q : 0;
            return {
                prompt: String.raw`A tulip-bulb grower in Lisse is a price taker with the **long-run** cost $C(q) = ${co(a)}q^2 + ${co(b)}q + ${n(F)}$ for $q > 0$ and $C(0) = 0$: all costs, including the ${eur(F)} of overhead, are avoidable by leaving the market. The price is ${eur(p)} per crate of bulbs. How many crates does the grower produce in the long run? Enter 0 if it leaves the market.`,
                given: {
                    "Long-run cost": String.raw`$C(q) = ${co(a)}q^2 + ${co(b)}q + ${n(F)}$ for $q > 0$`,
                    "Cost when closed": String.raw`$C(0) = 0$`,
                    "Market price p": eur(p),
                },
                answer,
                explanation: above
                    ? String.raw`The firm stays only if $p \geq \bar p = b + 2\sqrt{a F}$, and then produces where $p = MC(q)$. The threshold is ${n(b)} + 2 · √(${n(a)} · ${n(F)}) = ${eur(pBar)}, and the price of ${eur(p)} lies **above** it, so the grower produces. From $MC(q) = ${n(2 * a)} q + ${n(b)} = ${n(p)}$: $q^* = \frac{p - ${n(b)}}{${n(2 * a)}}$ = ${n(q)} crates. At that output average cost is exactly covered plus a margin, so staying beats exiting.`
                    : String.raw`The firm stays only if $p \geq \bar p = b + 2\sqrt{a F}$, and then produces where $p = MC(q)$. The threshold is ${n(b)} + 2 · √(${n(a)} · ${n(F)}) = ${eur(pBar)}, and the price of ${eur(p)} lies **below** it. Producing where $MC = p$ would give ${n(q)} ${q === 1 ? "crate" : "crates"}, but there average cost is ${eur((a * q * q + b * q + F) / q)} > ${eur(p)}, so every crate loses money and the whole ${eur(F)} of overhead is avoidable. The grower therefore leaves the market and produces nothing.`,
            };
        },
    },
    {
        id: "e1-pc-lr-price-with-fixed-cost",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P18",
        build: (rng) => {
            const c = rng.pick([1, 2, 3, 4]);
            const qm = rng.int(2, 9); // efficient scale sqrt(F/c)
            const F = c * qm * qm;
            const b = rng.int(2, 12);
            const answer = b + 2 * c * qm; // min AC = b + 2 sqrt(F c)
            return {
                prompt: String.raw`Every actual and potential builder of steel bicycle frames in Utrecht works with the same cost function $C(q) = ${n(F)} + ${co(b)}q + ${co(c)}q^2$ for $q > 0$, and $C(0) = 0$. Firms enter and leave the market freely. Which price per frame prevails in the long-run equilibrium?`,
                given: {
                    "Cost per firm": String.raw`$C(q) = ${n(F)} + ${co(b)}q + ${co(c)}q^2$ for $q > 0$`,
                    "Market structure": "perfect competition, free entry and exit",
                },
                answer,
                explanation: String.raw`Free entry pushes profits to zero, so the long-run price equals minimum average cost: $p^* = \min AC = b + 2\sqrt{F c}$. Average cost is $AC(q) = \frac{${n(F)}}{q} + ${n(b)} + ${co(c)}q$, minimal where $\frac{${n(F)}}{q^2} = ${n(c)}$, i.e. at $q^*$ = ${n(qm)} frames. There $AC$ = ${n(F)} / ${n(qm)} + ${n(b)} + ${n(c)} · ${n(qm)} = ${eur(answer)}. Note that no demand curve was needed: demand fixes how **many** firms operate, but the long-run price is pinned down by the cost function alone.`,
            };
        },
    },
    {
        id: "e1-pc-lr-number-of-firms-linear-term",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P16",
        build: (rng) => {
            const c = rng.pick([1, 2, 3, 4]);
            const qm = rng.int(2, 6);
            const F = c * qm * qm;
            const b = rng.int(2, 10);
            const d = rng.int(2, 8); // demand slope
            const pStar = b + 2 * c * qm;
            const nStar = rng.int(8, 40);
            const A = nStar * qm + d * pStar; // demand intercept built from n*
            return {
                prompt: String.raw`Coffee roasters in Trieste all share the cost function $C(q) = ${n(F)} + ${co(b)}q + ${co(c)}q^2$ for $q > 0$ and $C(0) = 0$, and entry is free. Market demand for roasted coffee is $Q_D = ${n(A)} - ${co(d)}p$, with $q$ and $Q_D$ in sacks per week. How many roasters are active in the long-run equilibrium?`,
                given: {
                    "Cost per firm": String.raw`$C(q) = ${n(F)} + ${co(b)}q + ${co(c)}q^2$ for $q > 0$`,
                    "Demand": String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                },
                answer: nStar,
                explanation: String.raw`With free entry, $n^* = \frac{Q_D(p^*)}{q^*}$, where $p^* = \min AC$ and $q^*$ is the efficient scale. $AC(q) = \frac{${n(F)}}{q} + ${n(b)} + ${co(c)}q$ is minimal at $q^* = \sqrt{F / c}$ = ${n(qm)} sacks, where $p^*$ = ${n(b)} + 2 · ${n(c)} · ${n(qm)} = ${eur(pStar)}. Market demand at that price: ${n(A)} − ${n(d)} · ${n(pStar)} = ${n(nStar * qm)} sacks. Dividing by the output per firm: ${n(nStar * qm)} / ${n(qm)} = ${n(nStar)} roasters. Each of them earns exactly zero profit, so nobody enters or exits.`,
            };
        },
    },
    {
        id: "e1-pc-lr-producer-surplus",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P17",
        build: (rng) => {
            const c = rng.pick([1, 2, 3, 4]);
            const qm = rng.int(2, 6);
            const F = c * qm * qm;
            const b = rng.int(2, 10);
            const d = rng.int(2, 8);
            const pStar = b + 2 * c * qm;
            const nStar = rng.int(8, 40);
            const A = nStar * qm + d * pStar;
            const answer = nStar * F; // PS = n* F
            return {
                prompt: String.raw`Soap makers in Marseille all have the cost function $C(q) = ${n(F)} + ${co(b)}q + ${co(c)}q^2$ for $q > 0$ and $C(0) = 0$, where the ${eur(F)} is a quasi-fixed cost that only arises when the firm actually produces. Entry is free and market demand is $Q_D = ${n(A)} - ${co(d)}p$ bars per day. What is the **producer surplus** in the long-run equilibrium?`,
                given: {
                    "Cost per firm": String.raw`$C(q) = ${n(F)} + ${co(b)}q + ${co(c)}q^2$ for $q > 0$`,
                    "Demand": String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                },
                answer,
                explanation: String.raw`Producer surplus is revenue minus **variable** cost, $PS = p^* Q^* - VC$, while profit also subtracts the quasi-fixed cost — so the two differ by exactly that cost. Free entry gives $q^* = \sqrt{F / c}$ = ${n(qm)} bars and $p^* = \min AC$ = ${eur(pStar)}, and demand ${n(A)} − ${n(d)} · ${n(pStar)} = ${n(nStar * qm)} bars implies $n^*$ = ${n(nStar)} firms. Per firm: revenue ${eur(pStar * qm)} minus variable cost ${n(b)} · ${n(qm)} + ${n(c)} · ${n(qm * qm)} = ${eur(b * qm + c * qm * qm)} leaves ${eur(F)} — precisely the quasi-fixed cost. Total: ${n(nStar)} · ${eur(F)} = ${eur(answer)}. The trap: profits are zero in the long run, but producer surplus is **not**.`,
            };
        },
    },
    {
        id: "e1-pc-lr-total-surplus",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P19",
        build: (rng) => {
            const c = rng.pick([1, 2, 3]);
            const qm = rng.int(2, 5);
            const F = c * qm * qm;
            const b = rng.int(2, 10);
            const d = rng.pick([2, 4, 10]); // even, so the CS triangle stays clean
            const k = rng.int(2, 8);
            const nStar = d * k;
            const pStar = b + 2 * c * qm;
            const Q = nStar * qm;
            const A = Q + d * pStar;
            const choke = A / d; // = p* + Q/d
            const CS = 0.5 * (choke - pStar) * Q;
            const PS = nStar * F;
            const answer = CS + PS;
            return {
                prompt: String.raw`Pasta makers in Bologna all have the cost function $C(q) = ${n(F)} + ${co(b)}q + ${co(c)}q^2$ for $q > 0$ and $C(0) = 0$, and entry is free. Inverse market demand is $p = \frac{${n(A)} - Q}{${n(d)}}$, with $Q$ in crates per day. What is the **total surplus** (consumer plus producer surplus) in the long-run equilibrium?`,
                given: {
                    "Cost per firm": String.raw`$C(q) = ${n(F)} + ${co(b)}q + ${co(c)}q^2$ for $q > 0$`,
                    "Inverse demand": String.raw`$p = \frac{${n(A)} - Q}{${n(d)}}$`,
                },
                answer,
                explanation: String.raw`$TS = CS + PS$, with $CS = \frac{1}{2}\left(p_{max} - p^*\right) Q^*$ and, under free entry, $PS = n^* F$. Efficient scale $q^* = \sqrt{F / c}$ = ${n(qm)} crates and $p^* = \min AC$ = ${eur(pStar)}. Market quantity: $Q^*$ = ${n(A)} − ${n(d)} · ${n(pStar)} = ${n(Q)} crates, so $n^*$ = ${n(Q)} / ${n(qm)} = ${n(nStar)} firms. Choke price: $p_{max}$ = ${n(A)} / ${n(d)} = ${eur(choke)}, hence $CS$ = ½ · (${n(choke)} − ${n(pStar)}) · ${n(Q)} = ${eur(CS)}. Producer surplus is not zero even though profits are: $PS$ = ${n(nStar)} · ${eur(F)} = ${eur(PS)}. Total: ${eur(CS)} + ${eur(PS)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "e1-pc-market-supply-n-firms",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exercise Exam WT22/23, Q26",
        build: (rng) => {
            const F = rng.pick([2, 18, 32, 50, 72]); // sqrt(2F) = 2, 6, 8, 10, 12
            const pBar = Math.round(Math.sqrt(2 * F));
            const nF = rng.int(5, 40);
            const p = rng.int(pBar, 5 * pBar);
            const answer = nF * p;
            return {
                prompt: String.raw`${n(nF)} identical sawmills in Tampere each have the cost function $C(q) = \tfrac{1}{2} q^2 + ${n(F)}$ for $q > 0$ and $C(0) = 0$, with $q$ in cubic metres of sawn timber per day. The market price is ${eur(p)} per cubic metre. How many cubic metres are supplied by the whole industry per day?`,
                given: {
                    "Cost per mill": String.raw`$C(q) = \tfrac{1}{2} q^2 + ${n(F)}$ for $q > 0$`,
                    "Number of mills n": n(nF),
                    "Market price p": eur(p),
                },
                answer,
                explanation: String.raw`Market supply is $Q_S(p) = n \cdot q(p)$, where each firm sets $p = MC$ but only supplies at all while $p \geq \min AC$. Here $MC(q) = q$, so a producing mill offers $q = p$. The threshold is $\min AC = \sqrt{2 F}$ = √(2 · ${n(F)}) = ${eur(pBar)}, and ${eur(p)} is at or above it, so all ${n(nF)} mills produce. Each supplies ${n(p)} cubic metres, giving $Q_S$ = ${n(nF)} · ${n(p)} = ${n(answer)} cubic metres. Below ${eur(pBar)} the industry supply would jump to zero.`,
            };
        },
    },

    // ---------------------------------------- market equilibrium, surplus, tax
    {
        id: "e1-mkt-equilibrium-quantity",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I eTest W20/21, Q11",
        build: (rng) => {
            const p0 = rng.int(1, 4); // supply choke price
            const s = rng.int(3, 8) * 5; // supply slope
            const B = s * p0;
            const gap = rng.int(3, 8);
            const pStar = p0 + gap;
            const Q = s * gap;
            const d = rng.int(2, 7) * 5; // demand slope
            const A = Q + d * pStar;
            return {
                prompt: String.raw`In the market for oat milk in Copenhagen, demand is $Q_D = ${n(A)} - ${co(d)}p$ and supply is $Q_S = ${co(s)}p - ${n(B)}$, with quantities in cartons per week and $p$ in euros per carton. How many cartons are traded in equilibrium?`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    "Supply": String.raw`$Q_S = ${co(s)}p - ${n(B)}$`,
                },
                answer: Q,
                explanation: String.raw`The market clears where $Q_D = Q_S$; solve for $p^*$ and substitute back into either curve. Here $${n(A)} - ${co(d)}p = ${co(s)}p - ${n(B)}$ gives $p^* = \frac{${n(A)} + ${n(B)}}{${n(d)} + ${n(s)}}$ = ${eur(pStar)}. Substituting into supply: $Q^*$ = ${n(s)} · ${n(pStar)} − ${n(B)} = ${n(Q)} cartons, and demand confirms it: ${n(A)} − ${n(d)} · ${n(pStar)} = ${n(Q)}.`,
            };
        },
    },
    {
        id: "e1-mkt-producer-surplus",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q31",
        build: (rng) => {
            const p0 = rng.int(1, 4);
            const s = rng.int(3, 8) * 5;
            const B = s * p0;
            const gap = rng.int(3, 8);
            const pStar = p0 + gap;
            const Q = s * gap;
            const d = rng.int(2, 7) * 5;
            const A = Q + d * pStar;
            const answer = 0.5 * gap * Q;
            return {
                prompt: String.raw`Farmed mussels in Galway are traded in a competitive market with demand $Q_D = ${n(A)} - ${co(d)}p$ and supply $Q_S = ${co(s)}p - ${n(B)}$, quantities in kilograms per day. Compute the **producer surplus** in the market equilibrium.`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    "Supply": String.raw`$Q_S = ${co(s)}p - ${n(B)}$`,
                },
                answer,
                explanation: String.raw`$PS = \frac{1}{2} \left( p^* - p_{min} \right) Q^*$, where $p_{min}$ is the price at which supply starts, i.e. the intercept of the supply curve on the price axis. Setting $Q_S = 0$: $p_{min} = \frac{${n(B)}}{${n(s)}}$ = ${eur(p0)}. Equilibrium: $p^* = \frac{${n(A)} + ${n(B)}}{${n(d)} + ${n(s)}}$ = ${eur(pStar)} with $Q^*$ = ${n(Q)} kg. So $PS$ = ½ · (${n(pStar)} − ${n(p0)}) · ${n(Q)} = ${eur(answer)}. Do not use the whole price ${eur(pStar)} as the height — below ${eur(p0)} nothing is offered at all.`,
            };
        },
    },
    {
        id: "e1-mkt-equilibrium-from-words",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P30",
        build: (rng) => {
            const pStar = rng.int(2, 11);
            const s = rng.int(2, 8) * 20; // extra kg per euro of price
            const Q0 = rng.int(2, 9) * 50; // offered at a price of zero
            const Q = Q0 + s * pStar;
            const d = rng.int(1, 6) * 20;
            const A = Q + d * pStar;
            return {
                prompt: String.raw`At the weekly market in Valencia, demand for strawberries is $Q_D = ${n(A)} - ${co(d)}p$ kilograms per market day. The growers behave as follows: at a price of zero they would still offer ${n(Q0)} kg (the berries spoil otherwise), and every additional euro of price raises the quantity offered by ${n(s)} kg. What is the equilibrium price per kilogram?`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    "Offered at a price of zero": `${n(Q0)} kg`,
                    "Extra quantity per euro": `${n(s)} kg`,
                },
                answer: pStar,
                explanation: String.raw`First turn the words into a supply curve: an intercept plus a slope, $Q_S = Q_0 + s \, p$. Here $Q_S = ${n(Q0)} + ${co(s)}p$. Market clearing $Q_D = Q_S$: $${n(A)} - ${co(d)}p = ${n(Q0)} + ${co(s)}p$, so $p^* = \frac{${n(A)} - ${n(Q0)}}{${n(d)} + ${n(s)}}$ = ${eur(pStar)}. The traded quantity is $Q^*$ = ${n(Q0)} + ${n(s)} · ${n(pStar)} = ${n(Q)} kg. Note the supply curve does **not** run through the origin: it already cuts the quantity axis at ${n(Q0)} kg.`,
            };
        },
    },
    {
        id: "e1-mkt-ps-trapezoid",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P31",
        build: (rng) => {
            const pStar = rng.int(2, 11);
            const s = rng.int(2, 8) * 20;
            const Q0 = rng.int(2, 9) * 50;
            const Q = Q0 + s * pStar;
            const d = rng.int(1, 6) * 20;
            const A = Q + d * pStar;
            const answer = 0.5 * (Q0 + Q) * pStar;
            const triangle = 0.5 * Q * pStar;
            return {
                prompt: String.raw`Demand for firewood in Innsbruck is $Q_D = ${n(A)} - ${co(d)}p$ bundles per week. Even at a price of zero the local forestry offers ${n(Q0)} bundles (thinning waste it has to clear anyway), and every additional euro of price raises the quantity offered by ${n(s)} bundles. What is the **producer surplus** in the market equilibrium?`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    "Offered at a price of zero": `${n(Q0)} bundles`,
                    "Extra quantity per euro": `${n(s)} bundles`,
                },
                answer,
                explanation: String.raw`Producer surplus is the area between the price line and the supply curve, and because supply starts at a positive quantity that area is a **trapezoid**: $PS = \frac{1}{2}\left(Q_0 + Q^*\right) p^*$. Supply is $Q_S = ${n(Q0)} + ${co(s)}p$; equating with demand gives $p^* = \frac{${n(A)} - ${n(Q0)}}{${n(d)} + ${n(s)}}$ = ${eur(pStar)} and $Q^*$ = ${n(Q)} bundles. So $PS$ = ½ · (${n(Q0)} + ${n(Q)}) · ${n(pStar)} = ${eur(answer)}. Treating it as a triangle ½ · ${n(Q)} · ${n(pStar)} = ${eur(triangle)} understates the surplus — the first ${n(Q0)} bundles would be supplied even for free, and every euro paid for them is surplus.`,
            };
        },
    },
    {
        id: "e1-mkt-elasticity-at-equilibrium",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics I Exercise Exam WT22/23, Q33",
        build: (rng) => {
            const Qstar = rng.int(2, 12) * 5;
            const j = rng.int(1, 8);
            const c = (j * Qstar) / 5; // integer, keeps P*/Q* a clean fifth
            const g = rng.pick([1, 2, 3]); // inverse supply slope
            const Pstar = c + g * Qstar;
            const b = rng.pick([1, 2, 4, 5]); // inverse demand slope
            const A = Pstar + b * Qstar;
            const answer = Pstar / (b * Qstar);
            const verdict =
                answer > 1 ? "elastic" : answer < 1 ? "inelastic" : "exactly unit-elastic";
            return {
                prompt: String.raw`The market for bicycle helmets in Amsterdam has inverse demand $P = ${n(A)} - ${co(b)}Q$ and inverse supply $P = ${n(c)} + ${co(g)}Q$, with $Q$ in helmets per day. What is the **absolute value** of the price elasticity of demand in the market equilibrium?`,
                given: {
                    "Inverse demand": String.raw`$P = ${n(A)} - ${co(b)}Q$`,
                    "Inverse supply": String.raw`$P = ${n(c)} + ${co(g)}Q$`,
                },
                answer,
                explanation: String.raw`$\left| \eta \right| = \left| \frac{dQ}{dP} \right| \cdot \frac{P^*}{Q^*}$, and inverting the demand curve gives $\frac{dQ}{dP} = -\frac{1}{b}$. Equilibrium first: $${n(A)} - ${co(b)}Q = ${n(c)} + ${co(g)}Q$ gives $Q^*$ = ${n(Qstar)} helmets and $P^*$ = ${n(c)} + ${n(g)} · ${n(Qstar)} = ${eur(Pstar)}. So $\left| \eta \right|$ = (1 / ${n(b)}) · ${n(Pstar)} / ${n(Qstar)} = ${n2(answer)}. A value above 1 means demand is elastic, below 1 inelastic — here it is ${verdict}.`,
            };
        },
    },
    {
        id: "e1-mkt-unit-tax-consumer-price",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q34",
        build: (rng) => {
            const t = rng.int(2, 8); // per-unit tax
            const p0 = rng.int(1, 6); // supply choke price
            const gap = t + rng.int(4, 14); // keeps the taxed quantity comfortably positive
            const pStar = p0 + gap;
            const tot = rng.pick([10, 20, 25, 50]); // d + s, divides 100 -> clean prices
            const edge = Math.round(tot / 5); // both slopes stay away from zero
            const s = rng.int(edge, tot - edge);
            const d = tot - s;
            const B = s * p0;
            const Q = s * gap;
            const A = Q + d * pStar;
            // p_D = (A + B + s t) / (d + s); tot divides 100, so this is exact to 2 decimals
            const answer = Math.round((pStar + (s * t) / tot) * 100) / 100;
            return {
                prompt: String.raw`In the market for ceramic mugs in Kraków, demand is $Q_D = ${n(A)} - ${n(d)} p_D$ and supply is $Q_S = ${n(s)} p_S - ${n(B)}$, in mugs per day. The government levies a per-unit tax of ${eur(t)} **on the producers**, so that $p_S = p_D - ${n(t)}$. What price do consumers pay per mug once the market has adjusted?`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(A)} - ${n(d)} p_D$`,
                    "Supply": String.raw`$Q_S = ${n(s)} p_S - ${n(B)}$`,
                    "Per-unit tax t": eur(t),
                },
                answer,
                explanation: String.raw`Clearing the market with the tax gives $p_D = \frac{A + B + s\, t}{d + s}$ — substitute $p_S = p_D - t$ into supply and solve for the consumer price. Here $${n(A)} - ${n(d)} p_D = ${n(s)}\left(p_D - ${n(t)}\right) - ${n(B)}$, so $p_D$ = (${n(A)} + ${n(B)} + ${n(s)} · ${n(t)}) / ${n(tot)} = ${eur(answer)}. Without the tax the price was ${eur(pStar)}, so consumers bear ${eur(answer - pStar)} of the ${eur(t)}; producers receive ${eur(answer - t)} and bear the rest. The side with the less elastic curve carries the larger share, no matter who hands the money to the tax office.`,
            };
        },
    },
    {
        id: "e1-mkt-unit-tax-revenue",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q34",
        build: (rng) => {
            const t = rng.int(2, 8);
            const p0 = rng.int(1, 6);
            const gap = t + rng.int(4, 14);
            const pStar = p0 + gap;
            const tot = rng.pick([10, 20, 25, 50]);
            const edge = Math.round(tot / 5);
            const s = rng.int(edge, tot - edge);
            const d = tot - s;
            const B = s * p0;
            const Q = s * gap;
            const A = Q + d * pStar;
            // tot divides 100, so both stay exact to 2 decimals
            const pD = Math.round((pStar + (s * t) / tot) * 100) / 100;
            const Qt = Math.round((Q - (d * s * t) / tot) * 100) / 100; // traded quantity with the tax
            const answer = Math.round(t * Qt * 100) / 100;
            return {
                prompt: String.raw`Wool blankets in Cardiff are traded competitively, with demand $Q_D = ${n(A)} - ${n(d)} p_D$ and supply $Q_S = ${n(s)} p_S - ${n(B)}$ per week. The government introduces a per-unit tax of ${eur(t)} **on the producers**, so that $p_S = p_D - ${n(t)}$. How much tax revenue does it collect per week?`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(A)} - ${n(d)} p_D$`,
                    "Supply": String.raw`$Q_S = ${n(s)} p_S - ${n(B)}$`,
                    "Per-unit tax t": eur(t),
                },
                answer,
                explanation: String.raw`Tax revenue is $T = t \cdot Q_t$, so the traded quantity **after** the tax is what matters. With $p_S = p_D - t$ the consumer price is $p_D = \frac{A + B + s\, t}{d + s}$ = (${n(A)} + ${n(B)} + ${n(s)} · ${n(t)}) / ${n(tot)} = ${eur(pD)}, and $Q_t$ = ${n(A)} − ${n(d)} · ${n(pD)} = ${n2(Qt)} blankets. Revenue: ${eur(t)} · ${n2(Qt)} = ${eur(answer)}. Using the pre-tax quantity ${n(Q)} instead would overstate the take, because the tax itself shrinks the market.`,
            };
        },
    },
    {
        id: "e1-mkt-total-surplus",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I eTest W20/21, Q12",
        build: (rng) => {
            const s = rng.int(2, 8) * 10; // supply slope
            const dFac = rng.pick([0.5, 1, 2]);
            const d = s * dFac; // demand slope, keeps Q*/d clean
            const p0 = rng.int(1, 4);
            const B = s * p0;
            const gap = rng.int(3, 8);
            const pStar = p0 + gap;
            const Q = s * gap;
            const A = Q + d * pStar;
            const choke = A / d;
            const CS = 0.5 * (choke - pStar) * Q;
            const PS = 0.5 * gap * Q;
            const answer = CS + PS;
            return {
                prompt: String.raw`Second-hand bicycles in Ghent are traded in a competitive market with demand $Q_D = ${n(A)} - ${co(d)}p$ and supply $Q_S = ${co(s)}p - ${n(B)}$, in bicycles per month. Compute the **total surplus** (consumer plus producer surplus) in the untaxed market equilibrium.`,
                given: {
                    "Demand": String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    "Supply": String.raw`$Q_S = ${co(s)}p - ${n(B)}$`,
                },
                answer,
                explanation: String.raw`$TS = CS + PS = \frac{1}{2}\left(p_{max} - p^*\right) Q^* + \frac{1}{2}\left(p^* - p_{min}\right) Q^*$ — the two triangles that meet at the equilibrium. Equilibrium: $p^* = \frac{${n(A)} + ${n(B)}}{${n(d)} + ${n(s)}}$ = ${eur(pStar)} and $Q^*$ = ${n(Q)} bicycles. Choke price of demand: $p_{max}$ = ${n(A)} / ${n(d)} = ${eur(choke)}, so $CS$ = ½ · (${n(choke)} − ${n(pStar)}) · ${n(Q)} = ${eur(CS)}. Supply starts at $p_{min}$ = ${n(B)} / ${n(s)} = ${eur(p0)}, so $PS$ = ½ · (${n(pStar)} − ${n(p0)}) · ${n(Q)} = ${eur(PS)}. Total: ${eur(CS)} + ${eur(PS)} = ${eur(answer)}.`,
            };
        },
    },

    // --------------------------------------------------------- price controls
    {
        id: "e1-pctl-cap-nonbinding-quantity",
        subject: "econ1",
        topic: "price_controls",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exam WS19/20, P28; TUM Economics I eTest W20/21, Q15",
        build: (rng) => {
            // Original tuples (A = 2,600, d = 50, s = 80) and (A = 900, d = 10,
            // s = 20) are out of reach: both slopes are drawn from 20..60.
            const d = rng.int(2, 6) * 10; // demand slope
            const s = rng.int(2, 6) * 10; // supply slope
            const pStar = rng.int(6, 15); // equilibrium fare, integer by construction
            const A = (s + d) * pStar; // demand intercept
            const Qstar = s * pStar;
            const cap = pStar + rng.int(1, 6); // strictly above p*
            return {
                prompt: String.raw`On the Cypriot island bus route from Larnaca to the airport, daily demand for rides is $Q_D = ${n(A)} - ${co(d)}p$ and daily supply is $Q_S = ${co(s)}p$, where $p$ is the fare in euros per ride. The ministry of transport sets a maximum fare of ${eur(cap)} per ride. How many rides per day are traded once this price ceiling is in force?`,
                given: {
                    Demand: String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    Supply: String.raw`$Q_S = ${co(s)}p$`,
                    "Price ceiling": eur(cap),
                },
                answer: Qstar,
                explanation: String.raw`$Q_D(p^*) = Q_S(p^*)$ fixes the free-market price, and a ceiling $\bar{p}$ only bites when $\bar{p} < p^*$. Here $${n(A)} - ${co(d)}p = ${co(s)}p$ gives $p^* = \frac{${n(A)}}{${n(s + d)}}$ = ${eur(pStar)} and $Q^* = ${n(s)} \cdot ${n(pStar)}$ = ${n(Qstar)} rides. The ceiling of ${eur(cap)} lies ${eur(cap - pStar)} **above** $p^*$, so it never restricts anyone: the market still clears at ${eur(pStar)} and ${n(Qstar)} rides change hands.`,
            };
        },
    },
    {
        id: "e1-pctl-cap-nonbinding-surplus",
        subject: "econ1",
        topic: "price_controls",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P29; TUM Economics I eTest W20/21, Q16",
        build: (rng) => {
            const m = rng.pick([1, 2, 3]); // supply is m times as flat as demand
            const d = rng.int(2, 6) * 10;
            const s = m * d;
            const pStar = rng.int(6, 15);
            const A = (s + d) * pStar;
            const Qstar = s * pStar;
            const choke = (m + 1) * pStar; // A / d, integer by construction
            const cap = pStar + rng.int(1, 6);
            const answer = 0.5 * (choke - pStar) * Qstar;
            return {
                prompt: String.raw`In Casablanca the daily market for 12 kg butane cylinders has demand $Q_D = ${n(A)} - ${co(d)}p$ and supply $Q_S = ${co(s)}p$, where $p$ is the price in euros per cylinder. The regulator caps the price at ${eur(cap)} per cylinder. What is the consumer surplus in this market with the cap in place?`,
                given: {
                    Demand: String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    Supply: String.raw`$Q_S = ${co(s)}p$`,
                    "Price ceiling": eur(cap),
                },
                answer,
                explanation: String.raw`$CS = \frac{1}{2} \left( \frac{A}{d} - p^* \right) Q^*$, the triangle between the demand curve and the price actually paid. Market clearing: $${n(A)} - ${co(d)}p = ${co(s)}p$ gives $p^* $ = ${eur(pStar)} and $Q^*$ = ${n(Qstar)} cylinders. The ceiling of ${eur(cap)} is above $p^*$, so it is not binding - price and quantity are the unregulated ones and the deadweight loss is zero. The choke price is $\frac{${n(A)}}{${n(d)}}$ = ${eur(choke)}, so CS = ½ · (${n(choke)} − ${n(pStar)}) · ${n(Qstar)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "e1-pctl-cap-binding-quantity",
        subject: "econ1",
        topic: "price_controls",
        difficulty: "easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exam WS19/20, P28",
        build: (rng) => {
            const m = rng.pick([1, 2, 3]);
            const d = rng.int(2, 6) * 10;
            const s = m * d;
            const pStar = rng.int(6, 15);
            const A = (s + d) * pStar;
            const Qstar = s * pStar;
            const gap = rng.int(1, 4);
            const cap = pStar - gap; // strictly below p*, and >= 2
            const Qc = s * cap; // short side: supply
            const Qd = A - d * cap;
            const excess = Qd - Qc; // = (m + 1) * d * gap
            return {
                prompt: String.raw`In Cairo the daily market for 25 kg sacks of wheat flour has demand $Q_D = ${n(A)} - ${co(d)}p$ and supply $Q_S = ${co(s)}p$, with $p$ in euros per sack. To keep flour affordable the government fixes a maximum price of ${eur(cap)} per sack, which lies below the market-clearing price. How many sacks per day are actually traded under this ceiling?`,
                given: {
                    Demand: String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    Supply: String.raw`$Q_S = ${co(s)}p$`,
                    "Price ceiling": eur(cap),
                },
                answer: Qc,
                explanation: String.raw`With a binding ceiling the **short side** of the market determines trade: $Q = \min \left\{ Q_D(\bar{p}),\, Q_S(\bar{p}) \right\} = Q_S(\bar{p})$. Free-market price: $${n(A)} - ${co(d)}p = ${co(s)}p$ gives $p^*$ = ${eur(pStar)} with $Q^*$ = ${n(Qstar)} sacks. At the ceiling of ${eur(cap)} sellers offer $Q_S$ = ${n(s)} · ${n(cap)} = ${n(Qc)} sacks while buyers want $Q_D$ = ${n(A)} − ${n(d)} · ${n(cap)} = ${n(Qd)} sacks. The excess demand of ${n(excess)} sacks per day is rationed away (queues, lotteries), and only ${n(Qc)} sacks are traded.`,
            };
        },
    },
    {
        id: "e1-pctl-cap-binding-dwl",
        subject: "econ1",
        topic: "price_controls",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P28",
        build: (rng) => {
            const m = rng.pick([1, 2, 3]);
            const d = rng.int(2, 6) * 10;
            const s = m * d;
            const pStar = rng.int(30, 60);
            const A = (s + d) * pStar;
            const Qstar = s * pStar;
            const gap = rng.int(2, 6);
            const cap = pStar - gap;
            const Qc = s * cap;
            const pD = (m + 1) * pStar - m * cap; // willingness to pay at Q_c, integer
            const answer = 0.5 * (pD - cap) * (Qstar - Qc);
            return {
                prompt: String.raw`In Belgrade the monthly market for firewood has demand $Q_D = ${n(A)} - ${co(d)}p$ and supply $Q_S = ${co(s)}p$, with $p$ in euros per cubic metre and quantities in cubic metres. The city imposes a maximum price of ${eur(cap)} per cubic metre, below the market-clearing price; the scarce firewood goes to the buyers with the highest willingness to pay. What is the deadweight loss caused by this ceiling?`,
                given: {
                    Demand: String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    Supply: String.raw`$Q_S = ${co(s)}p$`,
                    "Price ceiling": eur(cap),
                },
                answer,
                explanation: String.raw`$DWL = \frac{1}{2} \left( p_D(Q_c) - \bar{p} \right) \left( Q^* - Q_c \right)$ - the surplus on the trades that no longer happen. Without the ceiling $p^*$ = ${eur(pStar)} and $Q^*$ = ${n(Qstar)} m³. At the ceiling only $Q_c = ${n(s)} \cdot ${n(cap)}$ = ${n(Qc)} m³ are supplied. Inverse demand there: $p_D = \frac{${n(A)} - ${n(Qc)}}{${n(d)}}$ = ${eur(pD)}, so each withheld unit was worth ${eur(pD)} to a buyer but only ${eur(cap)} was paid. DWL = ½ · (${n(pD)} − ${n(cap)}) · (${n(Qstar)} − ${n(Qc)}) = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "e1-pctl-cap-binding-cs",
        subject: "econ1",
        topic: "price_controls",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P29",
        build: (rng) => {
            const m = rng.pick([1, 2, 3]);
            const d = rng.int(2, 6) * 10;
            const s = m * d;
            const pStar = rng.int(10, 20);
            const A = (s + d) * pStar;
            const choke = (m + 1) * pStar; // A / d
            const gap = rng.int(1, 5);
            const cap = pStar - gap;
            const Qc = s * cap;
            const pD = choke - m * cap; // = (A - Q_c) / d
            const triangle = 0.5 * (choke - pD) * Qc;
            const rect = (pD - cap) * Qc;
            const answer = triangle + rect;
            return {
                prompt: String.raw`In Ankara the daily market for 25 kg bags of animal feed has demand $Q_D = ${n(A)} - ${co(d)}p$ and supply $Q_S = ${co(s)}p$, with $p$ in euros per bag. A maximum price of ${eur(cap)} per bag is imposed, below the market-clearing price, and the scarce bags go to the buyers with the highest willingness to pay. What is the consumer surplus under this ceiling?`,
                given: {
                    Demand: String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    Supply: String.raw`$Q_S = ${co(s)}p$`,
                    "Price ceiling": eur(cap),
                },
                answer,
                explanation: String.raw`$CS = \frac{1}{2} \left( \frac{A}{d} - p_D(Q_c) \right) Q_c + \left( p_D(Q_c) - \bar{p} \right) Q_c$ - a triangle on top of a rectangle, because the served buyers pay only $\bar{p}$. Supply at the ceiling: $Q_c = ${n(s)} \cdot ${n(cap)}$ = ${n(Qc)} bags. The marginal served buyer values a bag at $p_D = \frac{${n(A)} - ${n(Qc)}}{${n(d)}}$ = ${eur(pD)}, and the choke price is $\frac{${n(A)}}{${n(d)}}$ = ${eur(choke)}. Triangle: ½ · (${n(choke)} − ${n(pD)}) · ${n(Qc)} = ${eur(triangle)}; rectangle: (${n(pD)} − ${n(cap)}) · ${n(Qc)} = ${eur(rect)}. Together CS = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "e1-pctl-floor-dwl",
        subject: "econ1",
        topic: "price_controls",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q29; TUM Economics I eTest W20/21, Q17",
        build: (rng) => {
            const m = rng.pick([1, 2, 3]);
            const k = rng.int(1, 5) * 10;
            const d = m * k; // demand slope
            const s = m * d; // supply slope
            const j = rng.int(1, 3);
            const lift = m * j; // p_f - p*, chosen so p_S(Q_f) stays an integer
            const pStar = rng.int(30, 45);
            const floor = pStar + lift;
            const A = (s + d) * pStar;
            const Qstar = s * pStar;
            const Qf = A - d * floor; // short side: demand
            const pS = pStar - j; // = Q_f / s
            const answer = 0.5 * (floor - pS) * (Qstar - Qf);
            return {
                prompt: String.raw`France's raw-milk market is quoted in hectolitres (100 litres). Daily demand is $Q_D = ${n(A)} - ${co(d)}p$ and daily supply is $Q_S = ${co(s)}p$, with $p$ in euros per hectolitre. To support farmers the state sets a minimum price of ${eur(floor)} per hectolitre and does **not** buy up the unsold milk. What is the deadweight loss of this price floor?`,
                given: {
                    Demand: String.raw`$Q_D = ${n(A)} - ${co(d)}p$`,
                    Supply: String.raw`$Q_S = ${co(s)}p$`,
                    "Price floor": eur(floor),
                },
                answer,
                explanation: String.raw`$DWL = \frac{1}{2} \left( p_f - p_S(Q_f) \right) \left( Q^* - Q_f \right)$, where $Q_f = Q_D(p_f)$ because demand is now the short side. Free market: $p^*$ = ${eur(pStar)} and $Q^*$ = ${n(Qstar)} hL. At the floor buyers take only $Q_f = ${n(A)} - ${n(d)} \cdot ${n(floor)}$ = ${n(Qf)} hL, while producers would supply ${n(s * floor)} hL - a surplus of ${n(s * floor - Qf)} hL that stays unsold. The marginal seller of the ${n(Qf)}th hectolitre needs only $p_S = \frac{${n(Qf)}}{${n(s)}}$ = ${eur(pS)}, so DWL = ½ · (${n(floor)} − ${n(pS)}) · (${n(Qstar)} − ${n(Qf)}) = ${eur(answer)}.`,
            };
        },
    },

    // ---------------------------------------------------------------- monopoly
    {
        id: "e1-mono-price-quadratic-cost",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P35; TUM Economics I eTest W20/21, Q20",
        build: (rng) => {
            // Originals (c = 1, d = 2, A = 40) and (c = 2, d = 1, A = 1,200) are
            // unreachable: the demand slope d is drawn from {3, 4, 5}.
            const c = rng.pick([1, 2, 4]); // cost curvature, C = (c/2) q^2 + F
            const d = rng.pick([3, 4, 5]); // demand slope
            const k = rng.int(2, 8);
            const qM = d * k; // monopoly quantity, integer
            const A = qM * (2 + c * d); // demand intercept
            const F = rng.int(1, 9) * 10;
            const answer = k * (1 + c * d); // = (A - q^M) / d
            const costTex = c === 2 ? String.raw`q^2` : String.raw`${n(c / 2)}\, q^2`;
            return {
                prompt: String.raw`The only ferry company serving the island of Heligoland faces the demand $q = ${n(A)} - ${co(d)}p$ for return tickets per day, where $p$ is the fare in euros. Its cost function is $C(q) = ${costTex} + ${n(F)}$, so marginal cost is $MC = ${co(c)}q$. Which fare does the profit-maximizing monopolist charge?`,
                given: {
                    Demand: String.raw`$q = ${n(A)} - ${co(d)}p$`,
                    "Cost function": String.raw`$C(q) = ${costTex} + ${n(F)}$`,
                },
                answer,
                explanation: String.raw`Invert demand to $p = \frac{A - q}{d}$, so revenue is $\frac{(A - q) q}{d}$ and $MR = \frac{A - 2q}{d}$. Setting $MR = MC = c\, q$ gives $q^M = \frac{A}{2 + c d}$. Here $q^M = \frac{${n(A)}}{${n(2 + c * d)}}$ = ${n(qM)} tickets. The fare comes from the demand curve, not from MR: $p^M = \frac{${n(A)} - ${n(qM)}}{${n(d)}}$ = ${eur(answer)}. The fixed cost of ${eur(F)} shifts profit but never the optimal quantity.`,
            };
        },
    },
    {
        id: "e1-mono-consumer-surplus",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P36; TUM Economics I eTest W20/21, Q21",
        build: (rng) => {
            const c = rng.pick([1, 2, 4]);
            const d = rng.pick([3, 4, 5]);
            const k = rng.int(2, 8);
            const qM = d * k;
            const A = qM * (2 + c * d);
            const F = rng.int(1, 9) * 10;
            const pM = k * (1 + c * d);
            const choke = A / d; // = k * (2 + c d), integer
            const answer = 0.5 * (choke - pM) * qM; // = d k^2 / 2
            const costTex = c === 2 ? String.raw`q^2` : String.raw`${n(c / 2)}\, q^2`;
            return {
                prompt: String.raw`The company holding the exclusive concession for parking at Riga airport sells $q = ${n(A)} - ${co(d)}p$ parking days per day at a price of $p$ euros per day, and its cost function is $C(q) = ${costTex} + ${n(F)}$ with $MC = ${co(c)}q$. It sets one uniform profit-maximizing price. How large is the consumer surplus at that price?`,
                given: {
                    Demand: String.raw`$q = ${n(A)} - ${co(d)}p$`,
                    "Cost function": String.raw`$C(q) = ${costTex} + ${n(F)}$`,
                },
                answer,
                explanation: String.raw`$CS = \frac{1}{2} \left( \frac{A}{d} - p^M \right) q^M$, so first solve $MR = MC$: with $p = \frac{A - q}{d}$ we get $MR = \frac{A - 2q}{d} = c\, q$, hence $q^M = \frac{A}{2 + c d}$. Here $q^M = \frac{${n(A)}}{${n(2 + c * d)}}$ = ${n(qM)} parking days and $p^M = \frac{${n(A)} - ${n(qM)}}{${n(d)}}$ = ${eur(pM)}. The choke price is $\frac{${n(A)}}{${n(d)}}$ = ${eur(choke)}, so CS = ½ · (${n(choke)} − ${n(pM)}) · ${n(qM)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "e1-mono-profit",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P36; TUM Economics I eTest W20/21, Q21",
        build: (rng) => {
            const c = rng.pick([1, 2, 4]);
            const d = rng.pick([3, 4, 5]);
            const k = rng.int(3, 8);
            const qM = d * k;
            const A = qM * (2 + c * d);
            const F = rng.int(1, 5) * 10; // small enough that profit stays positive
            const pM = k * (1 + c * d);
            const cost = 0.5 * c * qM * qM + F;
            const answer = pM * qM - cost;
            const costTex = c === 2 ? String.raw`q^2` : String.raw`${n(c / 2)}\, q^2`;
            return {
                prompt: String.raw`The only company selling day passes in the Andorran ski resort of Arinsal faces the demand $q = ${n(A)} - ${co(d)}p$ passes per day, with $p$ in euros per pass. Its cost function is $C(q) = ${costTex} + ${n(F)}$, so $MC = ${co(c)}q$. What profit does it make per day at its optimal uniform price?`,
                given: {
                    Demand: String.raw`$q = ${n(A)} - ${co(d)}p$`,
                    "Cost function": String.raw`$C(q) = ${costTex} + ${n(F)}$`,
                },
                answer,
                explanation: String.raw`$\pi = p^M q^M - C(q^M)$ with $q^M$ from $MR = MC$: $\frac{A - 2q}{d} = c\, q$ gives $q^M = \frac{A}{2 + c d}$. Here $q^M = \frac{${n(A)}}{${n(2 + c * d)}}$ = ${n(qM)} passes and $p^M = \frac{${n(A)} - ${n(qM)}}{${n(d)}}$ = ${eur(pM)}. Revenue: ${eur(pM)} · ${n(qM)} = ${eur(pM * qM)}. Cost: ${eur(0.5 * c * qM * qM)} of variable cost plus the fixed ${eur(F)} = ${eur(cost)}. Profit: ${eur(pM * qM)} − ${eur(cost)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "e1-mono-perfect-discrimination-quantity",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I Exam WS19/20, P37",
        build: (rng) => {
            const c = rng.pick([1, 2]);
            const d = rng.pick([3, 4, 5]);
            const j = rng.int(1, 3);
            const k = (1 + c * d) * j; // makes the discrimination quantity an integer
            const qM = d * k;
            const A = qM * (2 + c * d);
            const F = rng.int(1, 9) * 10;
            const pM = k * (1 + c * d);
            const answer = d * j * (2 + c * d); // = A / (1 + c d)
            const costTex = c === 2 ? String.raw`q^2` : String.raw`${n(c / 2)}\, q^2`;
            return {
                prompt: String.raw`A Danish firm holds the only patent on a soil-analysis kit and faces the demand $q = ${n(A)} - ${co(d)}p$ kits per month, with $p$ in euros per kit. Its cost function is $C(q) = ${costTex} + ${n(F)}$, so $MC = ${co(c)}q$. It now knows every buyer's willingness to pay and charges each of them exactly that (perfect price discrimination). How many kits does it sell per month?`,
                given: {
                    Demand: String.raw`$q = ${n(A)} - ${co(d)}p$`,
                    "Cost function": String.raw`$C(q) = ${costTex} + ${n(F)}$`,
                },
                answer,
                explanation: String.raw`Under first-degree price discrimination the price of the last unit is its inverse demand, so the firm expands until $p(q) = MC$: $\frac{A - q}{d} = c\, q \Rightarrow \tilde{q} = \frac{A}{1 + c d}$. Here $\tilde{q} = \frac{${n(A)}}{${n(1 + c * d)}}$ = ${n(answer)} kits - the same quantity a competitive market would deliver. A single-price monopolist would stop at $\frac{${n(A)}}{${n(2 + c * d)}}$ = ${n(qM)} kits sold at ${eur(pM)}, because for him one more unit also lowers the price on all previous ones.`,
            };
        },
    },
    {
        id: "e1-mono-perfect-discrimination-profit",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I eTest W20/21, Q22",
        build: (rng) => {
            const c = rng.pick([1, 2]);
            const d = rng.pick([3, 4, 5]);
            const j = rng.int(1, 3);
            const k = (1 + c * d) * j;
            const qM = d * k;
            const A = qM * (2 + c * d);
            const F = rng.int(1, 10) * 10;
            const choke = A / d;
            const qTilde = d * j * (2 + c * d); // = A / (1 + c d)
            const pM = k * (1 + c * d);
            const answer = 0.5 * choke * qTilde - F;
            const single = pM * qM - (0.5 * c * qM * qM + F);
            const costTex = c === 2 ? String.raw`q^2` : String.raw`${n(c / 2)}\, q^2`;
            return {
                prompt: String.raw`The sole provider of satellite broadband in the Scottish Highlands faces the demand $q = ${n(A)} - ${co(d)}p$ subscriptions per month, with $p$ in euros per month. Its cost function is $C(q) = ${costTex} + ${n(F)}$, so $MC = ${co(c)}q$. It can price every household individually at exactly that household's willingness to pay. What monthly profit does it earn under this perfect price discrimination?`,
                given: {
                    Demand: String.raw`$q = ${n(A)} - ${co(d)}p$`,
                    "Cost function": String.raw`$C(q) = ${costTex} + ${n(F)}$`,
                },
                answer,
                explanation: String.raw`A perfectly discriminating monopolist captures the entire surplus: it sells up to $p(q) = MC$ and earns the whole area between inverse demand and marginal cost, $\pi = \frac{1}{2} \cdot \frac{A}{d} \cdot \tilde{q} - F$ (both lines are straight and meet at $\tilde{q}$). Here $\tilde{q} = \frac{${n(A)}}{${n(1 + c * d)}}$ = ${n(qTilde)} subscriptions and the choke price is $\frac{${n(A)}}{${n(d)}}$ = ${eur(choke)}, so the area is ½ · ${n(choke)} · ${n(qTilde)} = ${eur(0.5 * choke * qTilde)} and profit is ${eur(0.5 * choke * qTilde)} − ${eur(F)} = ${eur(answer)}. With one uniform price it would sell only ${n(qM)} subscriptions at ${eur(pM)} and earn ${eur(single)} - discrimination raises profit and, because output rises to the competitive level, it also removes the deadweight loss.`,
            };
        },
    },
    {
        id: "e1-mono-price-linear-cost-general",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P21",
        build: (rng) => {
            // Original tuple (A = 15, b = 3, F = 1) is unreachable: b starts at 4.
            const b = rng.int(4, 14);
            const k = rng.int(3, 15); // monopoly quantity
            const A = b + 4 * k;
            // Profit at the optimum is 2k^2 - F: keep F below that so the
            // monopolist never prefers to shut down (C(0) = 0).
            const F = rng.int(1, Math.min(10, Math.floor((2 * k * k - 1) / 5))) * 5;
            const answer = A - k; // = b + 3k
            return {
                prompt: String.raw`The only natural-gas distributor on a Croatian island faces the demand $Q = ${n(A)} - p$ in MWh per day, with $p$ in euros per MWh. For $Q > 0$ its cost function is $C(Q) = ${n(F)} + ${co(b)}Q + Q^2$. Which price does it charge at the profit maximum?`,
                given: {
                    Demand: String.raw`$Q = ${n(A)} - p$`,
                    "Cost function": String.raw`$C(Q) = ${n(F)} + ${co(b)}Q + Q^2$`,
                },
                answer,
                explanation: String.raw`Inverse demand is $p = A - Q$, so $MR = A - 2Q$, while $MC = b + 2Q$. $MR = MC$ gives $Q^M = \frac{A - b}{4}$. Here $Q^M = \frac{${n(A)} - ${n(b)}}{4}$ = ${n(k)} MWh, and the price follows from the demand curve: $p^M = ${n(A)} - ${n(k)}$ = ${eur(answer)}. The fixed cost of ${eur(F)} does not enter the first-order condition.`,
            };
        },
    },
    {
        id: "e1-mono-unit-tax-profit",
        subject: "econ1",
        topic: "monopoly",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P23",
        build: (rng) => {
            const b = rng.int(4, 14);
            const t = 4 * rng.int(1, 3); // multiple of 4 keeps the taxed quantity integer
            const Qt = rng.int(3, 12); // quantity with the tax in place
            const k = Qt + t / 4; // untaxed monopoly quantity
            const A = b + 4 * k;
            const F = rng.int(1, Math.floor((Qt * Qt) / 5)) * 5; // < Q_t^2, so profit stays positive
            const pt = A - Qt;
            const answer = 2 * Qt * Qt - F;
            return {
                prompt: String.raw`The only licensed bottler of spring water in Rogaska Slatina faces the demand $Q = ${n(A)} - p$ crates per day, with $p$ in euros per crate, and has the cost function $C(Q) = ${n(F)} + ${co(b)}Q + Q^2$ for $Q > 0$. Slovenia now levies a tax of ${eur(t)} on **every crate the bottler sells**. What profit does the bottler make per day once it has re-optimized?`,
                given: {
                    Demand: String.raw`$Q = ${n(A)} - p$`,
                    "Cost function": String.raw`$C(Q) = ${n(F)} + ${co(b)}Q + Q^2$`,
                    "Per-unit tax t": eur(t),
                },
                answer,
                explanation: String.raw`The tax raises marginal cost to $MC + t = b + t + 2Q$, so $MR = A - 2Q$ gives $Q_t = \frac{A - b - t}{4}$ and $\pi = p_t Q_t - F - b Q_t - Q_t^2 - t Q_t$. Here $Q_t = \frac{${n(A)} - ${n(b)} - ${n(t)}}{4}$ = ${n(Qt)} crates and $p_t = ${n(A)} − ${n(Qt)}$ = ${eur(pt)}. Revenue ${eur(pt * Qt)} minus production cost ${eur(F + b * Qt + Qt * Qt)} minus tax ${eur(t * Qt)} leaves ${eur(answer)}. Without the tax the bottler would sell ${n(k)} crates - the tax cuts output by ${n(t / 4)} ${t === 4 ? "crate" : "crates"}, exactly a quarter of the tax rate.`,
            };
        },
    },

    // ----------------------------------------------------------- externalities
    {
        id: "e1-ext-dwl-negative",
        subject: "econ1",
        topic: "externalities",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exercise Exam WT22/23, Q28",
        build: (rng) => {
            const b = rng.int(1, 4); // demand slope
            const g = rng.int(1, 4); // supply slope
            const S = b + g;
            const Qs = rng.int(5, 25); // socially optimal quantity, integer
            const gap = rng.int(1, 5); // Q_m - Q_s
            const e = S * gap; // constant marginal external damage
            const c = rng.int(12, 20); // supply intercept
            const a = c + S * (Qs + gap); // demand intercept
            const Qm = Qs + gap;
            const answer = 0.5 * e * gap;
            return {
                prompt: String.raw`Sand is dredged from the Danube near Novi Sad and sold by the tonne. Demand is $P = ${n(a)} - ${co(b)}Q$ and the dredgers' private supply is $P = ${n(c)} + ${co(g)}Q$, with $P$ in euros per tonne and $Q$ in tonnes per day. Every tonne dredged costs downstream fishers ${eur(e)} in lost catch, an amount the dredgers ignore. What is the deadweight loss of the unregulated market?`,
                given: {
                    Demand: String.raw`$P = ${n(a)} - ${co(b)}Q$`,
                    "Private supply": String.raw`$P = ${n(c)} + ${co(g)}Q$`,
                    "External damage per tonne": eur(e),
                },
                answer,
                explanation: String.raw`$DWL = \frac{1}{2}\, e \left( Q_m - Q_s \right)$: on every tonne between the two quantities the social cost exceeds the willingness to pay, and the wedge grows linearly from 0 to $e$. The market ignores the damage: $${n(a)} - ${co(b)}Q = ${n(c)} + ${co(g)}Q$ gives $Q_m$ = ${n(Qm)} tonnes. The social optimum uses $MSC = ${n(c)} + ${n(e)} + ${co(g)}Q$: $${n(a)} - ${co(b)}Q = ${n(c + e)} + ${co(g)}Q$ gives $Q_s$ = ${n(Qs)} tonnes. So DWL = ½ · ${n(e)} · (${n(Qm)} − ${n(Qs)}) = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "e1-ext-pigou-tax-rising-damage",
        subject: "econ1",
        topic: "externalities",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I eTest W20/21, Q19",
        build: (rng) => {
            const b = rng.int(1, 4);
            const g = rng.int(1, 4);
            const mec = rng.int(1, 4); // slope of the marginal external cost
            const T = b + g + mec;
            const Qs = rng.int(4, 20);
            const a = T * Qs; // demand intercept, makes Q_s an integer
            const Qm = a / (b + g);
            const answer = mec * Qs;
            return {
                prompt: String.raw`Peat briquettes from a bog in County Offaly are traded by the tonne. Demand is $P = ${n(a)} - ${co(b)}Q$ and supply is $P = ${co(g)}Q$, with $P$ in euros per tonne and $Q$ in tonnes per day. Each extra tonne cut degrades the bog further, so the marginal external cost rises with output: $MEC = ${co(mec)}Q$. Which per-unit tax on producers implements the socially optimal quantity?`,
                given: {
                    Demand: String.raw`$P = ${n(a)} - ${co(b)}Q$`,
                    Supply: String.raw`$P = ${co(g)}Q$`,
                    "Marginal external cost": String.raw`$MEC = ${co(mec)}Q$`,
                },
                answer,
                explanation: String.raw`A Pigouvian tax equals the marginal external cost **at the social optimum**: $\tau = MEC(Q_s)$ with $Q_s$ from $a - b Q = (g + m) Q$, i.e. $Q_s = \frac{a}{b + g + m}$. Here $Q_s = \frac{${n(a)}}{${n(T)}}$ = ${n(Qs)} tonnes, against ${n(Qm)} tonnes in the unregulated market. The tax is $\tau = ${n(mec)} \cdot ${n(Qs)}$ = ${eur(answer)} per tonne. Check: with it producers supply along $${co(g)}Q + ${n(answer)}$, and $${n(a)} - ${co(b)}Q = ${co(g)}Q + ${n(answer)}$ is solved exactly at ${n(Qs)} tonnes.`,
            };
        },
    },
    {
        id: "e1-ext-positive-social-quantity",
        subject: "econ1",
        topic: "externalities",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Economics I eTest W20/21, Q18; TUM Economics I Exam WS19/20, P34",
        build: (rng) => {
            const b = rng.int(1, 4);
            const g = rng.int(1, 4);
            const S = b + g;
            const Qm = rng.int(5, 25); // market quantity, integer
            const gap = rng.int(1, 6);
            const e = S * gap; // constant marginal external benefit
            const c = rng.int(8, 20);
            const a = c + S * Qm;
            const answer = Qm + gap; // = (a + e - c) / (b + g)
            return {
                prompt: String.raw`A clinic in Tampere sells flu shots. Demand is $P = ${n(a)} - ${co(b)}Q$ and supply is $P = ${n(c)} + ${co(g)}Q$, with $P$ in euros per shot and $Q$ in shots per day. Every shot also spares other people an infection worth ${eur(e)}, a benefit that no buyer takes into account. How many shots per day would be socially optimal?`,
                given: {
                    Demand: String.raw`$P = ${n(a)} - ${co(b)}Q$`,
                    Supply: String.raw`$P = ${n(c)} + ${co(g)}Q$`,
                    "External benefit per shot": eur(e),
                },
                answer,
                explanation: String.raw`With a positive externality the marginal social benefit lies above demand, $MSB = a + e - b Q$, and the optimum solves $MSB = MSC$, so $Q_s = \frac{a + e - c}{b + g}$. Here $${n(a + e)} - ${co(b)}Q = ${n(c)} + ${co(g)}Q$ gives $Q_s$ = ${n(answer)} shots per day. The market alone stops at $Q_m = \frac{${n(a)} - ${n(c)}}{${n(S)}}$ = ${n(Qm)} shots - vaccination is **under**-provided, which is why a subsidy of ${eur(e)} per shot would be the efficient policy.`,
            };
        },
    },
    {
        id: "e1-ext-positive-dwl",
        subject: "econ1",
        topic: "externalities",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics I Exam WS19/20, P34",
        build: (rng) => {
            const b = rng.int(1, 3);
            const g = rng.int(1, 3);
            const S = b + g;
            const Qm = rng.int(6, 20);
            const gap = rng.int(2, 6);
            const e = S * gap;
            const c = rng.int(10, 24);
            const a = c + S * Qm;
            const Qs = Qm + gap;
            const answer = 0.5 * e * gap;
            return {
                prompt: String.raw`Beekeepers in Provence rent out hives for the almond bloom. Demand from growers is $P = ${n(a)} - ${co(b)}Q$ and supply is $P = ${n(c)} + ${co(g)}Q$, with $P$ in euros per hive-season and $Q$ in hives. Each hive also pollinates neighbouring orchards that pay nothing, an external benefit of ${eur(e)} per hive. What is the deadweight loss of the unregulated market?`,
                given: {
                    Demand: String.raw`$P = ${n(a)} - ${co(b)}Q$`,
                    Supply: String.raw`$P = ${n(c)} + ${co(g)}Q$`,
                    "External benefit per hive": eur(e),
                },
                answer,
                explanation: String.raw`$DWL = \frac{1}{2}\, e \left( Q_s - Q_m \right)$ - the triangle between the marginal social benefit and the supply curve over the hives that are never rented. Market: $${n(a)} - ${co(b)}Q = ${n(c)} + ${co(g)}Q$ gives $Q_m$ = ${n(Qm)} hives. Social optimum with $MSB = ${n(a + e)} - ${co(b)}Q$: $${n(a + e)} - ${co(b)}Q = ${n(c)} + ${co(g)}Q$ gives $Q_s$ = ${n(Qs)} hives. DWL = ½ · ${n(e)} · (${n(Qs)} − ${n(Qm)}) = ${eur(answer)}. A per-hive subsidy of ${eur(e)} would close the gap.`,
            };
        },
    },

    // ------------------------------------------------------------ public goods
    {
        id: "e1-pg-efficient-provision-identical",
        subject: "econ1",
        topic: "public_goods",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P24",
        build: (rng) => {
            const households = rng.int(2, 12);
            const j = rng.int(1, 8);
            const c = households * j; // marginal cost, multiple of m
            const answer = rng.int(2, 15); // efficient quantity, integer
            const a = answer + j; // choke of each household's marginal benefit
            return {
                prompt: String.raw`The ${n(households)} households of Ostuni jointly fund the village fireworks show, a pure public good: everyone watches the same display. Each household's marginal benefit from an extra minute of fireworks is $MB(Q) = ${n(a)} - Q$ euros, and the pyrotechnician charges a constant ${eur(c)} per minute. How many minutes of fireworks are socially efficient?`,
                given: {
                    Households: n(households),
                    "Marginal benefit per household": String.raw`$MB(Q) = ${n(a)} - Q$`,
                    "Marginal cost per minute": eur(c),
                },
                answer,
                explanation: String.raw`For a public good the Samuelson condition sums the marginal benefits **vertically**: $\sum_{i=1}^{m} MB_i(Q) = MC$, i.e. $m (a - Q) = c$, so $Q^E = a - \frac{c}{m}$. Here $${n(households)} \left( ${n(a)} - Q \right) = ${n(c)}$ gives $Q^E = ${n(a)} - \frac{${n(c)}}{${n(households)}}$ = ${n(answer)} minutes. At that length each household still values a further minute at ${eur(j)}, and ${n(households)} · ${eur(j)} = ${eur(c)} exactly covers the cost of one more minute.`,
            };
        },
    },
    {
        id: "e1-pg-efficient-provision-two-types",
        subject: "econ1",
        topic: "public_goods",
        difficulty: "hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P25",
        build: (rng) => {
            const n1 = rng.int(2, 8);
            const n2 = rng.int(2, 8);
            const answer = rng.int(2, 14); // efficient quantity
            const x1 = rng.int(1, 4);
            const x2 = x1 + rng.int(1, 4); // guesthouses value bandwidth more
            const a1 = answer + x1;
            const a2 = answer + x2;
            const c = n1 * x1 + n2 * x2; // = n1 a1 + n2 a2 - (n1 + n2) Q^E
            return {
                prompt: String.raw`The Greek village of Kardamyli installs a shared Wi-Fi mast; its bandwidth $Q$ (in Mbit/s) is a pure public good. Each of the ${n(n1)} households has the marginal benefit $MB_1(Q) = ${n(a1)} - Q$ euros per month, each of the ${n(n2)} guesthouses has $MB_2(Q) = ${n(a2)} - Q$ euros per month, and one extra Mbit/s costs a constant ${eur(c)} per month. Which bandwidth is socially efficient?`,
                given: {
                    "Households / guesthouses": `${n(n1)} / ${n(n2)}`,
                    "Marginal benefit household": String.raw`$MB_1(Q) = ${n(a1)} - Q$`,
                    "Marginal benefit guesthouse": String.raw`$MB_2(Q) = ${n(a2)} - Q$`,
                    "Marginal cost per Mbit/s": eur(c),
                },
                answer,
                explanation: String.raw`Marginal benefits of a public good are summed **vertically** across all users: $n_1 \left( a_1 - Q \right) + n_2 \left( a_2 - Q \right) = MC$, so $Q^E = \frac{n_1 a_1 + n_2 a_2 - c}{n_1 + n_2}$. Substituting: $\frac{${n(n1)} \cdot ${n(a1)} + ${n(n2)} \cdot ${n(a2)} - ${n(c)}}{${n(n1 + n2)}}$ = ${n(answer)} Mbit/s. Check: at that bandwidth a household still values an extra Mbit/s at ${eur(x1)} and a guesthouse at ${eur(x2)}, and ${n(n1)} · ${eur(x1)} + ${n(n2)} · ${eur(x2)} = ${eur(c)} - exactly the marginal cost. Every $MB$ is still positive, so nobody would want less.`,
            };
        },
    },
    {
        id: "e1-pg-underprovision-gap",
        subject: "econ1",
        topic: "public_goods",
        difficulty: "hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Principles of Economics Exercise Exam WS20/21, P24",
        build: (rng) => {
            const households = rng.int(2, 8);
            const j = rng.int(1, 4);
            const c = households * j; // marginal cost per hour
            const priv = rng.int(1, 6); // privately provided hours
            const a = c + priv;
            const eff = a - j; // efficient hours
            const answer = eff - priv; // = c - c/m
            return {
                prompt: String.raw`The ${n(households)} households on a street in Naples can hire a night security patrol; the patrol protects the whole street, so it is a pure public good. Each household's marginal benefit from an extra patrol hour per week is $MB(Q) = ${n(a)} - Q$ euros, and an hour of patrolling costs a constant ${eur(c)}. If each household decides alone, provision stops where **its own** marginal benefit equals the cost. By how many hours per week does the efficient level exceed that private level?`,
                given: {
                    Households: n(households),
                    "Marginal benefit per household": String.raw`$MB(Q) = ${n(a)} - Q$`,
                    "Marginal cost per hour": eur(c),
                },
                answer,
                explanation: String.raw`Efficiency needs the **vertical** sum $\sum_{i=1}^{m} MB_i(Q) = MC$, while a household acting alone only sets its own $MB_i(Q) = MC$. Privately: $${n(a)} - Q = ${n(c)}$ gives $Q^{priv}$ = ${n(priv)} hours. Efficiently: $${n(households)} \left( ${n(a)} - Q \right) = ${n(c)}$ gives $Q^E = ${n(a)} - \frac{${n(c)}}{${n(households)}}$ = ${n(eff)} hours. The gap is ${n(eff)} − ${n(priv)} = ${n(answer)} hours per week. Acting alone, a household ignores the benefit its purchase confers on the other ${n(households - 1)} ${households === 2 ? "household" : "households"}, which is exactly why a public good is under-provided without collective action.`,
            };
        },
    },
];
