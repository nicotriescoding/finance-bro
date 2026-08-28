import type { Question } from "@/lib/questions/types";
import { eur, n, n2, pct } from "./_helpers";

/**
 * Economics 1 - Microeconomics.
 *
 * Built from the real TUM Economics I exercise exam WT2022/23 under the
 * copyright-redesign policy: every question keeps only the tested competency
 * and the standard lecture formulas. Scenarios, names, goods, wording and all
 * numbers are new - numeric questions draw every figure from the seeded rng,
 * choice questions use freshly picked numbers with all options recomputed.
 * `source` records provenance only.
 */
export const econ1Questions: Question[] = [
    // ------------------------------------------------ comparative advantage
    {
        id: "e1-ca-comparative-advantage",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "easy",
        kind: "choice",
        source: "TUM Economics I Exercise Exam WT22/23, Q1",
        prompt: `The country of Nordavia can produce ${n(1800)} tons of wheat **or** ${n(600)} tons of cloth per year; Sudland can produce ${n(800)} tons of wheat **or** ${n(400)} tons of cloth. Which statement is true?`,
        choices: [
            "Sudland has the comparative advantage in cloth: one ton of cloth costs it only 2 tons of wheat, versus 3 tons for Nordavia.",
            "Nordavia has the comparative advantage in both goods, because it can produce more of each.",
            "Sudland has the comparative advantage in wheat, because its opportunity cost of wheat is higher.",
            "Trade cannot benefit both countries, since Nordavia holds the absolute advantage in both goods.",
        ],
        correct: 0,
        explanation: String.raw`Comparative advantage follows from opportunity cost, not output levels. Opportunity cost of one ton of cloth: Nordavia $\frac{${n(1800)}}{${n(600)}} = 3$ tons of wheat, Sudland $\frac{${n(800)}}{${n(400)}} = 2$ tons of wheat. Sudland gives up less wheat per ton of cloth, so it has the comparative advantage in cloth - even though Nordavia has the absolute advantage in both goods. Absolute advantage never rules out mutually beneficial trade.`,
    },
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
        id: "e1-ca-fixed-rate-trade",
        subject: "econ1",
        topic: "comparative_advantage",
        difficulty: "medium",
        kind: "choice",
        source: "TUM Economics I Exercise Exam WT22/23, Q4",
        prompt: `The Ostheim orchard can grow ${n(1600)} apples **or** ${n(400)} pears per season; the Weststadt orchard can grow ${n(1000)} apples **or** ${n(800)} pears. They consider trading at a fixed rate of **1 apple per pear**. What happens?`,
        choices: [
            `No trade takes place: at that rate only Ostheim wants to trade, because a pear costs Weststadt ${n(1.25)} apples of forgone output but earns it just ${n(1)} apple.`,
            "Both orchards trade, because their comparative advantages differ.",
            "Only Weststadt wants to trade, since it is the more efficient pear producer.",
            "Both orchards trade, because any exchange rate between two specialized producers is mutually beneficial.",
        ],
        correct: 0,
        explanation: String.raw`Trade needs a price between both opportunity costs. Opportunity cost of one pear: Ostheim $\frac{${n(1600)}}{${n(400)}} = 4$ apples, Weststadt $\frac{${n(1000)}}{${n(800)}} = 1.25$ apples. Ostheim would happily buy pears at 1 apple each (far below its own cost of 4), but Weststadt would sell each pear for 1 apple while giving up 1.25 apples of production - a loss. A rate of 1 lies **outside** the interval $[1.25,\, 4]$, so the pear producer refuses and no trade occurs.`,
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
        id: "e1-ct-complements-utility",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "very_easy",
        kind: "choice",
        source: "TUM Economics I Exercise Exam WT22/23, Q8",
        prompt: String.raw`A hot-chocolate stand always serves drinks the same way: for every 3 cups of cocoa ($q_1$) it uses exactly 4 marshmallows ($q_2$), so consumption always satisfies $\frac{q_2}{q_1} = \frac{4}{3}$. Which utility function represents these preferences?`,
        choices: [
            String.raw`$U(q_1, q_2) = \min\{4 q_1,\; 3 q_2\}$`,
            String.raw`$U(q_1, q_2) = \min\{3 q_1,\; 4 q_2\}$`,
            String.raw`$U(q_1, q_2) = 4 q_1 + 3 q_2$`,
            String.raw`$U(q_1, q_2) = q_1^{4} \cdot q_2^{3}$`,
        ],
        correct: 0,
        explanation: String.raw`Perfect complements are represented by $U = \min\{a q_1,\; b q_2\}$, and the optimum sits at the kink where $a q_1 = b q_2$, i.e. $\frac{q_2}{q_1} = \frac{a}{b}$. A ratio of $\frac{q_2}{q_1} = \frac{4}{3}$ therefore needs $a = 4$ and $b = 3$: $U = \min\{4 q_1,\; 3 q_2\}$. Note the coefficients sit on the **opposite** good from the naive reading - $\min\{3 q_1, 4 q_2\}$ would give a ratio of 3/4. A linear function means perfect substitutes (no fixed ratio), and Cobb-Douglas lets the ratio vary with prices.`,
    },
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
    {
        id: "e1-ct-substitutes-corner",
        subject: "econ1",
        topic: "consumer_theory",
        difficulty: "easy",
        kind: "choice",
        source: "TUM Economics I Exercise Exam WT22/23, Q14",
        prompt: String.raw`A hiker treats trail-mix packs ($q_1$) and fruit bars ($q_2$) as perfect substitutes with utility $U(q_1, q_2) = 3 q_1 + q_2$. A pack costs ${eur(6)}, a bar costs ${eur(3)}. How does she spend her snack budget?`,
        choices: [
            String.raw`Entirely on trail-mix packs: $\frac{MU_1}{p_1} = \frac{3}{6}$ beats $\frac{MU_2}{p_2} = \frac{1}{3}$, so it is a corner solution in good 1.`,
            "Entirely on fruit bars, because they are cheaper per unit.",
            String.raw`On an interior mix where $MRS = \frac{p_1}{p_2}$ holds exactly.`,
            "Half on packs and half on bars, since the goods are substitutes.",
        ],
        correct: 0,
        explanation: String.raw`With linear (perfect-substitute) preferences the consumer compares marginal utility per euro: $\frac{MU_1}{p_1} \gtrless \frac{MU_2}{p_2}$. Here $\frac{3}{6} = 0.5 > \frac{1}{3} \approx 0.33$, so every euro buys more utility as trail mix and the whole budget goes to good 1 - a corner solution. The tangency condition $MRS = p_1/p_2$ never holds with linear indifference curves (the MRS is constant at 3, the price ratio at 2), and "cheaper per unit" ignores that a pack delivers three times the utility of a bar.`,
    },

    // -------------------------------------------- production & cost minimum
    {
        id: "e1-pc-apl-mrts",
        subject: "econ1",
        topic: "production_costs",
        difficulty: "medium",
        kind: "choice",
        source: "TUM Economics I Exercise Exam WT22/23, Q19",
        prompt: String.raw`A bakery's technology is $Q = 3KL - L^2$ with capital $K$ and labor $L$. Which pair of expressions is correct for the average product of labor $AP_L$ and the marginal rate of technical substitution $MRTS_{L,K}$?`,
        choices: [
            String.raw`$AP_L = 3K - L$ and $MRTS_{L,K} = \frac{3K - 2L}{3L} = \frac{K}{L} - \frac{2}{3}$`,
            String.raw`$AP_L = 3K - 2L$ and $MRTS_{L,K} = \frac{3K - 2L}{3L}$`,
            String.raw`$AP_L = 3K - L$ and $MRTS_{L,K} = \frac{K}{L}$`,
            String.raw`$AP_L = 3K - L$ and $MRTS_{L,K} = \frac{3L}{3K - 2L}$`,
        ],
        correct: 0,
        explanation: String.raw`$AP_L = \frac{Q}{L}$ and $MRTS_{L,K} = \frac{MP_L}{MP_K}$. Average product: $AP_L = \frac{3KL - L^2}{L} = 3K - L$. Marginal products: $MP_L = \frac{\partial Q}{\partial L} = 3K - 2L$ (note the factor 2 from $L^2$) and $MP_K = \frac{\partial Q}{\partial K} = 3L$. So $MRTS_{L,K} = \frac{3K - 2L}{3L} = \frac{K}{L} - \frac{2}{3}$. The traps: $3K - 2L$ is the **marginal**, not the average product; dropping the $-2L$ term forgets to differentiate $L^2$; and $\frac{3L}{3K-2L}$ inverts the ratio.`,
    },
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
        id: "e1-pc-supply-identification",
        subject: "econ1",
        topic: "perfect_competition",
        difficulty: "medium",
        kind: "choice",
        source: "TUM Economics I Exercise Exam WT22/23, Q26",
        prompt: String.raw`A market has $n$ identical price-taking firms, each with cost $C(q) = q^2 + 25$ for $q > 0$ and $C(0) = 0$ (the fixed cost is avoided by not producing). Which is the correct market supply function?`,
        choices: [
            String.raw`$Q_S = \frac{n \cdot p}{2}$ for $p \geq 10$, and $Q_S = 0$ below - firms only produce above minimum average cost.`,
            String.raw`$Q_S = \frac{n \cdot p}{2}$ for every $p \geq 0$, since $MC = 2q$ implies each firm supplies $q = p/2$.`,
            String.raw`$Q_S = n \cdot p$ for $p \geq 10$.`,
            String.raw`$Q_S = \frac{n \cdot p}{2}$ for $p \geq 5$, and $Q_S = 0$ below.`,
        ],
        correct: 0,
        explanation: String.raw`Each firm supplies along $p = MC = 2q$, i.e. $q = p/2$, but **only** where price covers avoidable cost, i.e. $p \geq \min AC$. Here $AC = q + \frac{25}{q}$ is minimized where $1 = \frac{25}{q^2}$, so $q = 5$ and $\min AC = 5 + \frac{25}{5} = 10$. Each firm therefore supplies $q = p/2$ for $p \geq 10$ and nothing below (the fixed cost is avoidable, so producing at a loss is never optimal), giving market supply $Q_S = \frac{n \cdot p}{2}$ for $p \geq 10$. Ignoring the threshold, doubling the slope, or mistaking the min-AC quantity for the cutoff price are the classic errors.`,
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
        id: "e1-mkt-elasticity-class",
        subject: "econ1",
        topic: "market_equilibrium",
        difficulty: "medium",
        kind: "choice",
        source: "TUM Economics I Exercise Exam WT22/23, Q33",
        prompt: String.raw`In the market for bike tubes, inverse demand is $P = 150 - 2Q$ and inverse supply is $P = Q$. What is the price elasticity of demand in equilibrium, and is demand elastic or inelastic there?`,
        choices: [
            String.raw`$|\varepsilon_D| = 0.5$ - demand is **inelastic** in equilibrium.`,
            String.raw`$|\varepsilon_D| = 2$ - demand is **elastic** in equilibrium.`,
            String.raw`$|\varepsilon_D| = 0.5$ - demand is **elastic**, because the value is below 1.`,
            String.raw`$|\varepsilon_D| = 1$ - demand is **unit-elastic** in equilibrium.`,
        ],
        correct: 0,
        explanation: String.raw`$\varepsilon_D = \left| \frac{dQ}{dP} \right| \cdot \frac{P}{Q}$ evaluated at the equilibrium. Equilibrium: $Q = 150 - 2Q$ along $P = Q$ gives $Q^* = 50$, $P^* = 50$. From $P = 150 - 2Q$, demand is $Q = 75 - \frac{P}{2}$, so $\frac{dQ}{dP} = -\frac{1}{2}$ - the **inverse** of the slope in the P-Q form, which is the classic trap behind the answer 2. Then $|\varepsilon_D| = \frac{1}{2} \cdot \frac{50}{50} = 0.5 < 1$: demand is inelastic.`,
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

    // -------------------------------------------------------------- game theory
    {
        id: "e1-game-nash-3x3",
        subject: "econ1",
        topic: "game_theory",
        difficulty: "hard",
        kind: "choice",
        source: "TUM Economics I Exercise Exam WT22/23, Q40",
        prompt: String.raw`Two food trucks, **Piatto** (row player) and **Quesada** (column player), simultaneously choose a price level. Weekly payoffs are (Piatto, Quesada): $\begin{array}{c|ccc} & \text{Low} & \text{Medium} & \text{High} \\ \hline \text{Low} & (3,\,2) & (1,\,4) & (5,\,1) \\ \text{Medium} & (2,\,1) & (4,\,5) & (2,\,3) \\ \text{High} & (1,\,3) & (3,\,2) & (4,\,4) \end{array}$ Which strategy pair is the unique pure-strategy Nash equilibrium?`,
        choices: [
            "(Medium, Medium)",
            "(Low, Low)",
            "(High, High)",
            "There is no pure-strategy Nash equilibrium.",
        ],
        correct: 0,
        explanation: String.raw`A Nash equilibrium is a cell where both strategies are **mutual best responses**. Quesada's best response (comparing its payoffs within each row): to Low → Medium (4), to Medium → Medium (5), to High → High (4). Piatto's best response (within each column): to Low → Low (3), to Medium → Medium (4), to High → Low (5). Only (Medium, Medium) is a best response for both: Piatto gets 4 (vs 1 or 3), Quesada gets 5 (vs 1 or 3) - no one gains by deviating. (Low, Low) fails because Quesada would switch to Medium; (High, High) fails because Piatto would switch to Low.`,
    },
];
