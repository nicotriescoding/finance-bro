import type { Question } from "@/lib/questions/types";
import { eur, n, n2, pct } from "./_helpers";

/**
 * Economics 1 - Microeconomics.
 *
 * Built from the real TUM Economics I course W2022/23 (Prof. Schwenen) under
 * the copyright-redesign policy: the exercise exam WT22/23 plus the tutorial
 * problem sets 2-13 (with official solutions). Every question keeps only the
 * tested competency and the standard lecture formulas. Scenarios, names,
 * goods, wording and all numbers are new - every question draws its
 * figures from the seeded rng. `source` records provenance only.
 * Numeric-only for now: the choice questions were removed on 2026-08-28
 * per Nico (recoverable from git, commits ed4eb4f + 560c0a0).
 */
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

];
