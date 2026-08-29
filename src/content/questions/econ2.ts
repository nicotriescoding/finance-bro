import type { Question } from "@/lib/questions/types";
import type { Rng } from "@/lib/questions/rng";
import { eur, n, n2, pct } from "./_helpers";

/**
 * Economics 2 - Macroeconomics.
 *
 * Built from the real TUM Economics II exams SS2017, SS2018 and SS2019 under
 * the copyright-redesign policy: only the tested competency, the standard
 * lecture formulas and standard terminology carry over from the exams. Every
 * scenario, country, firm and person is invented fresh, and every question
 * draws its numbers from the seeded rng (numeric-only for now: choice
 * questions removed 2026-08-28 per Nico, recoverable from git).
 * Structural variants that recur across
 * exams are merged into one generator citing all occurrences.
 */

// ---------------------------------------------------------------------------
// Efficiency-wage block: verified parameter sets.
// Derivation: e(w) = a·√w − b with b = a·rt/2 makes the Solow condition
// e'(w)·w = e(w) solve to √w* = 2b/a = rt, so w* = rt² and e* = b.
// Labor demand from max p·√(e·L) − w·L gives L = p²e/(4w²); with p = 2·rt²·s
// this is L = s²·b — an integer below the labor supply Ls in every entry.
const EW_CONFIGS = [
    // NOTE: no entry may reproduce a source exam's e(w): (a=6, rt=2) is the
    // SS2019 exam function 6·√w − 6 and (a=4, rt=1) would be SS2018's 4·√w − 2.
    { a: 4, rt: 2, s: 2, Ls: 20 },  // w*=4, e*=4, p=16, L=16, u=20 %
    { a: 10, rt: 1, s: 2, Ls: 25 }, // w*=1, e*=5, p=4,  L=20, u=20 %
    { a: 8, rt: 1, s: 3, Ls: 45 },  // w*=1, e*=4, p=6,  L=36, u=20 %
    { a: 6, rt: 3, s: 1, Ls: 12 },  // w*=9, e*=9, p=18, L=9,  u=25 %
    { a: 2, rt: 2, s: 3, Ls: 24 },  // w*=4, e*=2, p=24, L=18, u=25 %
    { a: 8, rt: 2, s: 2, Ls: 40 },  // w*=4, e*=8, p=16, L=32, u=20 %
] as const;

function ewDerived(cfg: (typeof EW_CONFIGS)[number]) {
    const b = (cfg.a * cfg.rt) / 2;
    const w = cfg.rt ** 2;
    const e = b;
    const p = 2 * cfg.rt ** 2 * cfg.s;
    const L = (p * p * e) / (4 * w * w);
    return { b, w, e, p, L };
}

// ---------------------------------------------------------------------------
// Goods-market block: one shared draw so equilibrium output is always a round
// number (Y is a multiple of 400, and every demand component is derived from
// the target Y, never the other way around - one draw feeds prompt AND answer).
function drawGoodsMarket(rng: Rng) {
    const c1 = rng.pick([0.4, 0.5, 0.6, 0.75, 0.8] as const);
    const t = rng.pick([0.2, 0.25, 0.5] as const);
    const Y = 400 * rng.int(5, 20);
    const D = 1 - c1 * (1 - t); // 0.36 <= D <= 0.8, never 0
    const A = Math.round(Y * D); // total autonomous demand, integer
    const G = 25 * rng.int(4, Math.floor(A / 75));
    const c0 = 25 * rng.int(1, Math.floor(A / 125));
    const X = 25 * rng.int(1, Math.floor(A / 125));
    const M = 25 * rng.int(0, Math.min(X / 25, Math.floor(A / 125)));
    const I = A - c0 - G - X + M; // > 0 by construction
    return { c1, t, Y, D, c0, G, X, M, I };
}

function goodsMarketGiven(d: ReturnType<typeof drawGoodsMarket>) {
    return {
        "Autonomous consumption $c_0$": n(d.c0),
        "Marginal propensity to consume $c_1$": n(d.c1),
        "Income tax rate t": pct(d.t * 100),
        "Investment I": n(d.I),
        "Government purchases G": n(d.G),
        "Exports X": n(d.X),
        "Imports M": n(d.M),
    };
}

// ---------------------------------------------------------------------------
// Solow golden-rule block: verified (A, r0) pairs for f(k) = A·√k.
// f'(k) = A/(2√k) = n+g+δ solves to √k_gr = A/(2(n+g+δ)) = r0, so k_gr = r0²
// and (n+g+δ) in percent is A·100/(2·r0) - an integer for every pair.
const SOLOW_GR = [
    { A: 1, r0: 2 },  // n+g+δ = 25 %, k_gr = 4
    { A: 1, r0: 5 },  // n+g+δ = 10 %, k_gr = 25
    { A: 2, r0: 5 },  // n+g+δ = 20 %, k_gr = 25
    { A: 2, r0: 10 }, // n+g+δ = 10 %, k_gr = 100
    { A: 3, r0: 10 }, // n+g+δ = 15 %, k_gr = 100
    { A: 2, r0: 4 },  // n+g+δ = 25 %, k_gr = 16
] as const;

export const econ2Questions: Question[] = [
    // ------------------------------------------------------------ growth rates
    {
        id: "e2-gr-total-growth",
        subject: "econ2",
        topic: "growth_rates",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2018 Q3; SS2019 Q3",
        build: (rng) => {
            const gdp0 = rng.int(150, 950);
            const c = rng.int(1, 9) * rng.pick([1, -1]);
            const gdp1 = Math.round(gdp0 * (1 + c / 100));
            const pop0 = rng.int(200, 1200) / 10;
            const pop1 = pop0 + rng.int(-15, 15) / 10;
            const answer = (gdp1 / gdp0 - 1) * 100;
            return {
                prompt: `The kingdom of Solmara reports GDP of ${n(gdp0)} billion in year 1 and ${n(gdp1)} billion in year 2. Its population grows from ${n(pop0)} million to ${n(pop1)} million. What is the growth rate of **total** GDP from year 1 to year 2?`,
                given: {
                    "GDP year 1": `${n(gdp0)} billion`,
                    "GDP year 2": `${n(gdp1)} billion`,
                    "Population year 1": `${n(pop0)} million`,
                    "Population year 2": `${n(pop1)} million`,
                },
                answer,
                explanation: String.raw`$g_Y = \frac{Y_1}{Y_0} - 1$ - total GDP growth ignores the population (that only matters per capita): ${n(gdp1)} / ${n(gdp0)} − 1 = ${pct(answer)}.`,
            };
        },
    },
    {
        id: "e2-gr-gdp-pc-growth",
        subject: "econ2",
        topic: "growth_rates",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2018 Q3; SS2019 Q3; SS2017 Q2",
        build: (rng) => {
            const gdp0 = rng.int(150, 950);
            const gdp1 = gdp0 + rng.int(-Math.floor(gdp0 * 0.08), Math.floor(gdp0 * 0.08));
            const pop0 = rng.int(200, 1200) / 10;
            const pop1 = pop0 + rng.int(-20, 20) / 10;
            const pc0 = gdp0 / pop0;
            const pc1 = gdp1 / pop1;
            const answer = (pc1 / pc0 - 1) * 100;
            return {
                prompt: `The statistics office of Veldaria reports GDP of ${n(gdp0)} billion in year 1 and ${n(gdp1)} billion in year 2, with a population of ${n(pop0)} million in year 1 and ${n(pop1)} million in year 2. What is the growth rate of GDP **per capita**?`,
                given: {
                    "GDP year 1": `${n(gdp0)} billion`,
                    "GDP year 2": `${n(gdp1)} billion`,
                    "Population year 1": `${n(pop0)} million`,
                    "Population year 2": `${n(pop1)} million`,
                },
                answer,
                explanation: String.raw`$g_{pc} = \frac{Y_1 / N_1}{Y_0 / N_0} - 1$ - divide each year's GDP by that year's population first. GDP per capita is ${n2(pc0)} thousand in year 1 and ${n2(pc1)} thousand in year 2, so it grows by ${n2(pc1)} / ${n2(pc0)} − 1 = ${pct(answer)}. Using the same population for both years is the classic mistake.`,
            };
        },
    },

    // --------------------------------------------------------- GDP accounting
    {
        id: "e2-gdp-value-added",
        subject: "econ2",
        topic: "gdp_accounting",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II SS2018 Q4; SS2019 Q2; SS2017 Q16",
        build: (rng) => {
            const m1 = rng.int(1, 4) * 5000;
            const s1 = m1 + rng.int(4, 12) * 5000;
            const m2 = rng.int(1, 3) * 5000;
            const s2 = s1 + m2 + rng.int(6, 16) * 5000;
            const frac = rng.pick([0.5, 0.75, 0.8] as const);
            const buy3 = frac * s2;
            const s3 = buy3 + rng.int(8, 20) * 5000;
            const w1 = rng.int(2, 6) * 1000;
            const w2 = rng.int(3, 8) * 1000;
            const k2 = rng.int(2, 6) * 1000;
            const va1 = s1 - m1;
            const va2 = s2 - s1 - m2;
            const va3 = s3 - buy3;
            const answer = va1 + va2 + va3;
            return {
                prompt: `The economy of Listrana has exactly three producers. An **olive grower** imports fertilizer for ${eur(m1)} and sells her entire harvest to the oil mill for ${eur(s1)}; she pays ${eur(w1)} in wages. The **oil mill** additionally imports glass bottles for ${eur(m2)} and sells bottled oil worth ${eur(s2)} - ${pct(frac * 100)} of it to the delicatessen maker, the rest directly to households; it pays ${eur(w2)} in wages and ${eur(k2)} in capital costs. The **delicatessen maker** turns the oil it bought into antipasti sold for ${eur(s3)}, half of them exported. What is Listrana's GDP?`,
                given: {
                    "Grower: imported fertilizer": eur(m1),
                    "Grower: sales to mill": eur(s1),
                    "Mill: imported bottles": eur(m2),
                    "Mill: total sales": eur(s2),
                    "Share of mill output sold to delicatessen maker": pct(frac * 100),
                    "Delicatessen maker: sales": eur(s3),
                },
                answer,
                explanation: String.raw`$GDP = \sum_i VA_i = \sum_i \left( \text{sales}_i - \text{intermediate inputs}_i \right)$ - imported inputs are subtracted at the stage that buys them, and wages or capital costs only distribute the value added, they never enter the sum. Grower: ${eur(s1)} − ${eur(m1)} = ${eur(va1)}. Mill: ${eur(s2)} − ${eur(s1)} − ${eur(m2)} = ${eur(va2)}. Delicatessen maker: it bought ${pct(frac * 100)} of the mill's output, i.e. ${eur(buy3)}, so ${eur(s3)} − ${eur(buy3)} = ${eur(va3)}. GDP = ${eur(answer)}. Whether output goes to households, downstream firms or exports does not change any firm's value added.`,
            };
        },
    },

    // ------------------------------------------------------ technology & R&D
    {
        id: "e2-tech-switch-rent",
        subject: "econ2",
        topic: "technology_rd",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II SS2018 Q8; SS2019 Q6; SS2017 Q4",
        build: (rng) => {
            const lA = rng.int(1, 3);
            const dl = rng.int(2, 4);
            const lB = lA + dl;
            const eB = rng.int(2, 5);
            const de = rng.int(3, 6);
            const eA = eB + de;
            const wm = rng.int(2, 5);
            const w = de * wm;
            const thr = dl * wm; // gas price at which A and B cost the same
            const pHigh = thr + rng.int(1, 4);
            const pLow = rng.int(1, thr - 1);
            const costAOld = eA * pHigh + lA * w;
            const costBOld = eB * pHigh + lB * w;
            const costANew = eA * pLow + lA * w;
            const costBNew = eB * pLow + lB * w;
            const answer = costBNew - costANew;
            return {
                prompt: `A ceramics workshop in Tavia can fire one kiln batch with technique **A** (${n(eA)} units of gas, ${n(lA)} worker-days) or technique **B** (${n(eB)} units of gas, ${n(lB)} worker-days). A worker-day costs ${eur(w)}. At the old gas price of ${eur(pHigh)} per unit the workshop correctly chose technique B. The gas price now falls to ${eur(pLow)} per unit while the wage stays put. What is the rent per batch from switching to technique A, i.e. by how much is A now cheaper than B?`,
                given: {
                    "Technique A": `${n(eA)} gas + ${n(lA)} worker-days`,
                    "Technique B": `${n(eB)} gas + ${n(lB)} worker-days`,
                    "Wage per worker-day": eur(w),
                    "Old gas price": eur(pHigh),
                    "New gas price": eur(pLow),
                },
                answer,
                explanation: String.raw`$c_T = e_T \cdot p_{gas} + l_T \cdot w$ per technique, and the switching rent is the cost difference at the **new** prices. Old price: A costs ${eur(costAOld)}, B costs ${eur(costBOld)} - B was the right choice. New price: A costs ${eur(costANew)}, B costs ${eur(costBNew)}. Switching to the gas-intensive technique A now saves ${eur(costBNew)} − ${eur(costANew)} = ${eur(answer)} per batch.`,
            };
        },
    },
    {
        id: "e2-tech-mpl",
        subject: "econ2",
        topic: "technology_rd",
        difficulty: "easy",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2019, Q4",
        build: (rng) => {
            const a = rng.int(2, 5);
            const aL = rng.int(2, 3);
            const aK = rng.int(2, 3);
            const L0 = rng.int(2, 4);
            const K0 = rng.int(2, 3);
            const answer = a * aL * L0 ** (aL - 1) * K0 ** aK;
            const lTerm = aL - 1 === 1 ? "L" : `L^{${aL - 1}}`;
            return {
                prompt: String.raw`A bicycle-frame manufacturer produces with $Y = ${a} L^{${aL}} K^{${aK}}$, where $L$ is labor and $K$ is capital. What is the **marginal product of labor** at $L = ${L0}$ and $K = ${K0}$?`,
                given: {
                    "Production function": String.raw`$Y = ${a} L^{${aL}} K^{${aK}}$`,
                    "Labor input L": n(L0),
                    "Capital input K": n(K0),
                },
                answer,
                explanation: String.raw`$MPL = \frac{\partial Y}{\partial L}$ - differentiate with respect to labor only: $MPL = ${a * aL} \, ${lTerm} K^{${aK}}$. At $L = ${L0}$, $K = ${K0}$ this gives ${n(a * aL)} · ${n(L0 ** (aL - 1))} · ${n(K0 ** aK)} = ${n(answer)}.`,
            };
        },
    },
    {
        id: "e2-rd-private-optimum",
        subject: "econ2",
        topic: "technology_rd",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2017, Q10",
        build: (rng) => {
            // h capped at 7: h = 8 gives m = 16, the source exam's own coefficient.
            const h = rng.int(3, 7);
            const m = 2 * h;
            const answer = h * h; // (m/2)²
            const dTotal = m * (1.5 * h); // output at the symmetric optimum
            return {
                prompt: String.raw`Two rival battery labs, Voltra and Cellix, each choose research spending $C_i$ (in million €, at a cost of 1 per unit). Research spills over: lab $i$ obtains $D_i = ${m}\left(\sqrt{C_i} + \tfrac{1}{2}\sqrt{C_j}\right)$ patentable cell designs, and each design earns a profit of 1 million €. Each lab maximizes its own profit, taking the rival's spending as given. What research spending $C_i$ does each lab choose?`,
                given: {
                    "Designs of lab i": String.raw`$D_i = ${m}\left(\sqrt{C_i} + \tfrac{1}{2}\sqrt{C_j}\right)$`,
                    "Profit per design": `${n(1)} million €`,
                    "Cost per unit of research": `${n(1)} million €`,
                },
                answer,
                explanation: String.raw`$\frac{\partial D_i}{\partial C_i} = \frac{m}{2\sqrt{C_i}} = 1$ - each lab spends until its **own** marginal design output equals the marginal research cost; the spillover onto the rival is ignored. With $m = ${m}$: $\sqrt{C_i^*} = ${n(m)}/2 = ${n(h)}$, so $C_i^* = ${n(answer)}$. Each lab then produces ${n(dTotal)} designs.`,
            };
        },
    },
    {
        id: "e2-rd-subsidy",
        subject: "econ2",
        topic: "technology_rd",
        difficulty: "hard",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2017, Q11",
        build: (rng) => {
            const sPct = rng.pick([20, 50] as const);
            // m = 16 with the 20 % subsidy would reproduce the source exam's
            // numbers (C = 100), so that branch draws only 8 or 24.
            const m = sPct === 20 ? rng.pick([8, 24] as const) : 2 * rng.int(2, 6);
            const netCost = 1 - sPct / 100;
            const sqrtC = m / (2 * netCost);
            const answer = sqrtC * sqrtC;
            const cPrivate = (m / 2) ** 2;
            return {
                prompt: String.raw`Two rival vaccine labs each choose research spending $C_i$ (in million €, at a cost of 1 per unit) and obtain $D_i = ${m}\left(\sqrt{C_i} + \tfrac{1}{2}\sqrt{C_j}\right)$ candidate compounds, each worth a profit of 1 million €. To correct the underinvestment caused by the spillover, the government now covers ${pct(sPct)} of every euro spent on research. What research spending $C_i$ does each lab choose **with** the subsidy?`,
                given: {
                    "Compounds of lab i": String.raw`$D_i = ${m}\left(\sqrt{C_i} + \tfrac{1}{2}\sqrt{C_j}\right)$`,
                    "Profit per compound": `${n(1)} million €`,
                    "Research subsidy": pct(sPct),
                },
                answer,
                explanation: String.raw`$\frac{m}{2\sqrt{C_i}} = 1 - \sigma$ - the subsidy lowers the marginal cost of research from 1 to $1 - \sigma$. With $m = ${m}$ and $\sigma = ${n(sPct / 100)}$: $\sqrt{C_i} = ${n(m)} / (2 \cdot ${n(netCost)}) = ${n(sqrtC)}$, so $C_i = ${n(answer)}$ - up from the unsubsidized optimum of ${n(cPrivate)}.`,
            };
        },
    },
    {
        id: "e2-rd-merger",
        subject: "econ2",
        topic: "technology_rd",
        difficulty: "hard",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2017, Q12",
        build: (rng) => {
            // h = 4 would give m = 16, the source exam's coefficient — excluded.
            const h = rng.pick([2, 3, 5] as const);
            const m = 4 * h;
            const answer = 9 * h * h; // (3m/4)²
            const cPrivate = (m / 2) ** 2;
            return {
                prompt: String.raw`Two agri-tech labs each choose research spending $C_i$ (in million €, at a cost of 1 per unit) and obtain $D_i = ${m}\left(\sqrt{C_i} + \tfrac{1}{2}\sqrt{C_j}\right)$ patentable seed varieties, each worth a profit of 1 million €. The labs now **merge** and choose both research budgets to maximize joint profit, internalizing the spillover. What spending $C_i$ does the merged firm pick for each lab?`,
                given: {
                    "Varieties of lab i": String.raw`$D_i = ${m}\left(\sqrt{C_i} + \tfrac{1}{2}\sqrt{C_j}\right)$`,
                    "Profit per variety": `${n(1)} million €`,
                },
                answer,
                explanation: String.raw`$\frac{\partial (D_i + D_j)}{\partial C_i} = \frac{m}{2\sqrt{C_i}} + \frac{m}{4\sqrt{C_i}} = \frac{3m}{4\sqrt{C_i}} = 1$ - after the merger, a euro spent in lab $i$ also raises lab $j$'s output, and that extra benefit is counted. With $m = ${m}$: $\sqrt{C_i} = 3 \cdot ${n(m)} / 4 = ${n(3 * h)}$, so $C_i = ${n(answer)}$ per lab, versus ${n(cPrivate)} before the merger. Total output rises by ${pct(50)}.`,
            };
        },
    },

    // ------------------------------------------------- goods market & fiscal
    {
        id: "e2-gm-equilibrium-output",
        subject: "econ2",
        topic: "goods_market",
        difficulty: "easy",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2018 Q10; SS2019 Q7; SS2017 Q19",
        build: (rng) => {
            const d = drawGoodsMarket(rng);
            const autonomous = d.c0 + d.I + d.G + d.X - d.M;
            return {
                prompt: String.raw`In the open economy of Orvania, consumption follows $C = c_0 + c_1 (1 - t) Y$ with $c_0 = ${n(d.c0)}$ and $c_1 = ${n(d.c1)}$; the income tax rate is ${pct(d.t * 100)}. Investment is ${n(d.I)}, government purchases are ${n(d.G)}, exports are ${n(d.X)} and imports are ${n(d.M)} (all exogenous). What is the equilibrium output $Y$?`,
                given: goodsMarketGiven(d),
                answer: d.Y,
                explanation: String.raw`$Y = \frac{c_0 + I + G + X - M}{1 - c_1 (1 - t)}$ - collect the $Y$ terms of $Y = C + I + G + X - M$ on one side. Autonomous demand is ${n(d.c0)} + ${n(d.I)} + ${n(d.G)} + ${n(d.X)} − ${n(d.M)} = ${n(autonomous)}, the multiplier denominator is 1 − ${n(d.c1)} · ${n(1 - d.t)} = ${n(d.D)}, so Y = ${n(autonomous)} / ${n(d.D)} = ${n(d.Y)}.`,
            };
        },
    },
    {
        id: "e2-gm-consumption",
        subject: "econ2",
        topic: "goods_market",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2018 Q10; SS2017 Q19",
        build: (rng) => {
            const d = drawGoodsMarket(rng);
            const answer = d.c0 + d.c1 * (1 - d.t) * d.Y;
            return {
                prompt: String.raw`The republic of Quenavia has consumption $C = c_0 + c_1 (1 - t) Y$ with $c_0 = ${n(d.c0)}$, $c_1 = ${n(d.c1)}$ and an income tax rate of ${pct(d.t * 100)}. Investment is ${n(d.I)}, government purchases ${n(d.G)}, exports ${n(d.X)}, imports ${n(d.M)}. What is **consumption** in the goods-market equilibrium?`,
                given: goodsMarketGiven(d),
                answer,
                explanation: String.raw`$C = c_0 + c_1 (1 - t) \cdot Y^*$ - first solve for equilibrium output, then feed it into the consumption function. $Y^* = \frac{c_0 + I + G + X - M}{1 - c_1(1-t)}$ = ${n(d.c0 + d.I + d.G + d.X - d.M)} / ${n(d.D)} = ${n(d.Y)}. Then C = ${n(d.c0)} + ${n(d.c1)} · ${n(1 - d.t)} · ${n(d.Y)} = ${n(answer)}.`,
            };
        },
    },
    {
        id: "e2-gm-multiplier",
        subject: "econ2",
        topic: "goods_market",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2018 Q11; SS2019 Q8",
        build: (rng) => {
            const c1 = rng.pick([0.4, 0.5, 0.6, 0.75, 0.8] as const);
            const t = rng.pick([0.2, 0.25, 0.5] as const);
            const dG = 25 * rng.int(2, 12);
            const D = 1 - c1 * (1 - t);
            const mult = 1 / D;
            const answer = dG * mult;
            return {
                prompt: String.raw`In Bellmark, consumption follows $C = c_0 + c_1 (1 - t) Y$ with $c_1 = ${n(c1)}$ and a tax rate of ${pct(t * 100)}. Parliament passes a stimulus that raises government purchases by ${n(dG)}. By how much does equilibrium output rise?`,
                given: {
                    "Marginal propensity to consume $c_1$": n(c1),
                    "Income tax rate t": pct(t * 100),
                    "Increase in G": n(dG),
                },
                answer,
                explanation: String.raw`$\Delta Y = \frac{1}{1 - c_1 (1 - t)} \cdot \Delta G$ - the fiscal multiplier times the spending change. The multiplier is 1 / (1 − ${n(c1)} · ${n(1 - t)}) = 1 / ${n(D)} = ${n2(mult)}, so ΔY = ${n2(mult)} · ${n(dG)} = ${n2(answer)}.`,
            };
        },
    },
    {
        id: "e2-gm-budget-balance",
        subject: "econ2",
        topic: "goods_market",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2018 Q11; SS2019 Q7",
        build: (rng) => {
            const d = drawGoodsMarket(rng);
            const answer = d.t * d.Y - d.G;
            return {
                prompt: String.raw`Novaria's consumption is $C = c_0 + c_1 (1 - t) Y$ with $c_0 = ${n(d.c0)}$, $c_1 = ${n(d.c1)}$ and a proportional income tax of ${pct(d.t * 100)}. Investment is ${n(d.I)}, government purchases ${n(d.G)}, exports ${n(d.X)}, imports ${n(d.M)}. What is the government's **budget balance** $BB = tY - G$ in equilibrium? (Negative = deficit.)`,
                given: goodsMarketGiven(d),
                answer,
                explanation: String.raw`$BB = t \cdot Y^* - G$ - tax revenue at equilibrium output minus purchases. First $Y^* = \frac{c_0 + I + G + X - M}{1 - c_1(1-t)}$ = ${n(d.c0 + d.I + d.G + d.X - d.M)} / ${n(d.D)} = ${n(d.Y)}. Then BB = ${n(d.t)} · ${n(d.Y)} − ${n(d.G)} = ${n(answer)}.`,
            };
        },
    },
    {
        id: "e2-gm-balanced-budget-tax",
        subject: "econ2",
        topic: "goods_market",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2018 Q12; SS2019 Q9; SS2017 Q20",
        build: (rng) => {
            const c1 = rng.pick([0.4, 0.5, 0.6, 0.75] as const);
            const tPct = rng.pick([20, 25, 30, 40] as const);
            const Y = 400 * rng.int(5, 15);
            const A = Math.round(Y * (1 - c1) * (1 - tPct / 100)); // c0 + I + NX
            const c0 = 25 * rng.int(2, Math.floor(A / 75));
            const NX = 25 * rng.int(0, Math.floor(A / 100));
            const I = A - c0 - NX;
            const G = (tPct / 100) * Y;
            return {
                prompt: String.raw`Caldonia's consumption is $C = c_0 + c_1 (1 - t) Y$ with $c_0 = ${n(c0)}$ and $c_1 = ${n(c1)}$. Investment is ${n(I)} and net exports are ${n(NX)}. The government must run a strictly **balanced budget**, so its purchases equal its tax revenue: $G = t \cdot Y$. Which tax rate $t$ makes the equilibrium output come out at exactly ${n(Y)}?`,
                given: {
                    "Autonomous consumption $c_0$": n(c0),
                    "Marginal propensity to consume $c_1$": n(c1),
                    "Investment I": n(I),
                    "Net exports NX": n(NX),
                    "Target output Y": n(Y),
                    "Budget rule": String.raw`$G = t \cdot Y$`,
                },
                answer: tPct,
                explanation: String.raw`$Y = c_0 + c_1 (1 - t) Y + I + t \cdot Y + NX$ - substitute the budget rule $G = tY$ into the equilibrium condition, then solve for $t$: $t = 1 - \frac{c_0 + I + NX}{(1 - c_1) \, Y}$. With $c_0 + I + NX$ = ${n(A)} and $(1 - c_1) Y$ = ${n(1 - c1)} · ${n(Y)} = ${n((1 - c1) * Y)}: t = 1 − ${n(A)} / ${n((1 - c1) * Y)} = ${n(tPct / 100)}, i.e. ${pct(tPct)}. Government purchases are then G = ${n(G)}.`,
            };
        },
    },

    // ------------------------------------------ labor market: efficiency wages
    {
        id: "e2-lm-efficiency-wage",
        subject: "econ2",
        topic: "labor_market",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II SS2018 Q16; SS2019 Q15",
        build: (rng) => {
            // Explicit (a, rt) allowlist: (6, 2) would reproduce SS2019's exam
            // function 6·√w − 6 and (4, 1) SS2018's 4·√w − 2 — both excluded.
            const [a, rt] = rng.pick([
                [2, 1], [2, 2], [2, 3],
                [4, 2], [4, 3],
                [6, 1], [6, 3],
                [8, 1], [8, 2], [8, 3],
            ] as const);
            const b = (a * rt) / 2;
            const answer = rt * rt;
            const eStar = a * rt - b; // = b
            return {
                prompt: String.raw`A fish cannery on the island of Skarvoy observes that its workers' effort depends on the hourly wage $w$ (in €): $e(w) = ${n(a)}\sqrt{w} - ${n(b)}$. Output is proportional to effort, so the firm picks the wage that **minimizes the wage cost per unit of effort**. What is this efficiency wage?`,
                given: {
                    "Effort function": String.raw`$e(w) = ${n(a)}\sqrt{w} - ${n(b)}$`,
                },
                answer,
                explanation: String.raw`$e'(w) \cdot w = e(w)$ - the Solow condition: at the efficiency wage, the elasticity of effort with respect to the wage is one. Here $\frac{${n(a)}}{2\sqrt{w}} \cdot w = ${n(a)}\sqrt{w} - ${n(b)}$, so $\frac{${n(a)}}{2}\sqrt{w} = ${n(b)}$ and $\sqrt{w^*} = ${n((2 * b) / a)}$, giving $w^*$ = ${eur(answer)} with effort $e(w^*) = ${n(eStar)}$.`,
            };
        },
    },
    {
        id: "e2-lm-unemployment",
        subject: "econ2",
        topic: "labor_market",
        difficulty: "hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2018 Q17; SS2019 Q16",
        build: (rng) => {
            const cfg = rng.pick(EW_CONFIGS);
            const { b, w, e, p, L } = ewDerived(cfg);
            const answer = ((cfg.Ls - L) / cfg.Ls) * 100;
            return {
                prompt: String.raw`Halvora is a company town: the cannery is the only employer, and ${n(cfg.Ls)} people supply labor. Production is $Y = \sqrt{e \cdot L}$ (crates), sold at ${eur(p)} per crate. Worker effort is $e(w) = ${n(cfg.a)}\sqrt{w} - ${n(b)}$. The cannery freely chooses the wage and the number of workers to maximize profit. What is the unemployment rate in Halvora?`,
                given: {
                    "Labor supply": `${n(cfg.Ls)} workers`,
                    "Production function": String.raw`$Y = \sqrt{e \cdot L}$`,
                    "Output price p": eur(p),
                    "Effort function": String.raw`$e(w) = ${n(cfg.a)}\sqrt{w} - ${n(b)}$`,
                },
                answer,
                explanation: String.raw`$e'(w) \cdot w = e(w)$ pins the wage, then labor demand follows from $p \cdot \frac{\partial Y}{\partial L} = w$. Solow condition: $\frac{${n(cfg.a)}}{2}\sqrt{w} = ${n(b)}$ gives $w^*$ = ${eur(w)} and effort $e^* = ${n(e)}$. Labor demand: $\frac{p}{2}\sqrt{e/L} = w$ solves to $L = \frac{p^2 e}{4 w^2}$ = ${n(p ** 2)} · ${n(e)} / ${n(4 * w * w)} = ${n(L)}. Unemployment: (${n(cfg.Ls)} − ${n(L)}) / ${n(cfg.Ls)} = ${pct(answer)}.`,
            };
        },
    },
    {
        id: "e2-lm-profit",
        subject: "econ2",
        topic: "labor_market",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II SS2018 Q18; SS2019 Q17",
        build: (rng) => {
            const cfg = rng.pick(EW_CONFIGS);
            const { b, w, e, p, L } = ewDerived(cfg);
            const revenue = p * Math.sqrt(e * L);
            const answer = revenue - w * L;
            return {
                prompt: String.raw`The only sawmill in the valley of Drenn faces a labor supply of ${n(cfg.Ls)} workers. It produces $Y = \sqrt{e \cdot L}$ pallets of timber, sold at ${eur(p)} each, and worker effort follows $e(w) = ${n(cfg.a)}\sqrt{w} - ${n(b)}$. The mill sets the wage and employment to maximize profit. What is the mill's **profit**?`,
                given: {
                    "Labor supply": `${n(cfg.Ls)} workers`,
                    "Production function": String.raw`$Y = \sqrt{e \cdot L}$`,
                    "Output price p": eur(p),
                    "Effort function": String.raw`$e(w) = ${n(cfg.a)}\sqrt{w} - ${n(b)}$`,
                },
                answer,
                explanation: String.raw`$\Pi = p \cdot \sqrt{e \cdot L} - w \cdot L$ - revenue minus the wage bill at the optimum. The Solow condition $e'(w) w = e(w)$ gives $w^*$ = ${eur(w)} and $e^* = ${n(e)}$; labor demand $L = \frac{p^2 e}{4w^2}$ = ${n(L)}. Revenue: ${eur(p)} · ${n(Math.sqrt(e * L))} = ${eur(revenue)}; wage bill: ${eur(w)} · ${n(L)} = ${eur(w * L)}. Profit = ${eur(answer)} - exactly equal to the wage bill, because the first-order condition makes revenue twice the labor cost.`,
            };
        },
    },
    {
        id: "e2-lm-minimum-wage",
        subject: "econ2",
        topic: "labor_market",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2018, Q20",
        build: (rng) => {
            const cfg = rng.pick(EW_CONFIGS);
            const { b, p } = ewDerived(cfg);
            const j = rng.int(1, 2);
            const wMin = (cfg.rt + j) ** 2;
            const eMin = cfg.a * (cfg.rt + j) - b;
            const LMin = (p * p * eMin) / (4 * wMin * wMin);
            const answer = ((cfg.Ls - LMin) / cfg.Ls) * 100;
            return {
                prompt: String.raw`The mining company is the only employer of the ${n(cfg.Ls)} workers of Corvane. It produces $Y = \sqrt{e \cdot L}$ tons of ore at a price of ${eur(p)} per ton; effort is $e(w) = ${n(cfg.a)}\sqrt{w} - ${n(b)}$. The government now imposes a **minimum wage** of ${eur(wMin)} per hour, which lies above the firm's efficiency wage, and the firm pays exactly this minimum wage. What is the unemployment rate under the minimum wage?`,
                given: {
                    "Labor supply": `${n(cfg.Ls)} workers`,
                    "Production function": String.raw`$Y = \sqrt{e \cdot L}$`,
                    "Output price p": eur(p),
                    "Effort function": String.raw`$e(w) = ${n(cfg.a)}\sqrt{w} - ${n(b)}$`,
                    "Minimum wage": eur(wMin),
                },
                answer,
                explanation: String.raw`$L = \frac{p^2 \, e(w^{min})}{4 \, (w^{min})^2}$ - the wage is no longer chosen, so only the labor-demand condition $p \cdot \frac{\partial Y}{\partial L} = w^{min}$ applies, with effort evaluated at the imposed wage. Effort: $e(${n(wMin)}) = ${n(cfg.a)} \cdot ${n(cfg.rt + j)} - ${n(b)} = ${n(eMin)}$. Employment: ${n(p ** 2)} · ${n(eMin)} / ${n(4 * wMin * wMin)} = ${n2(LMin)}. Unemployment: (${n(cfg.Ls)} − ${n2(LMin)}) / ${n(cfg.Ls)} = ${pct(answer)} - the minimum wage raises effort but cuts employment sharply, because beyond the efficiency wage effort per euro falls.`,
            };
        },
    },
    {
        id: "e2-lm-rent-hourly",
        subject: "econ2",
        topic: "labor_market",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II SS2019, Q12",
        build: (rng) => {
            const w = rng.int(12, 30);
            const d = rng.int(3, 8);
            const im = rng.int(1, 3);
            const ps = rng.int(1, 3);
            const H = rng.pick([35, 38, 40] as const);
            const bh = rng.int(1, w - d - 2);
            const B = bh * H;
            const answer = w - d + im + ps - bh;
            return {
                prompt: `A crane operator in the port of Vestre earns ${eur(w)} per hour for ${n(H)} hours a week. Working costs her the equivalent of ${eur(d)} per hour in effort, but she genuinely enjoys the job - worth ${eur(im)} per hour to her - and being unemployed would additionally burden her psychologically by ${eur(ps)} per hour of lost work. If she lost the job, unemployment benefits would pay her ${eur(B)} per week. What is her **employment rent per hour** worked?`,
                given: {
                    "Hourly wage": eur(w),
                    "Hours per week": n(H),
                    "Disutility of effort (per hour)": eur(d),
                    "Intrinsic enjoyment (per hour)": eur(im),
                    "Psychological cost of unemployment (per hour)": eur(ps),
                    "Unemployment benefit (per week)": eur(B),
                },
                answer,
                explanation: String.raw`$R_h = w - d + i + \psi - \frac{B}{H}$ - what an hour of this job is worth beyond her next-best alternative: the wage, minus effort disutility, plus intrinsic enjoyment, plus the avoided psychological cost, minus the benefits she forgoes per hour. The benefit is worth ${eur(B)} / ${n(H)} = ${eur(bh)} per hour, so $R_h$ = ${eur(w)} − ${eur(d)} + ${eur(im)} + ${eur(ps)} − ${eur(bh)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "e2-lm-rent-total",
        subject: "econ2",
        topic: "labor_market",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Economics II SS2018 Q21; SS2019 Q13",
        build: (rng) => {
            const w = rng.int(12, 30);
            const d = rng.int(3, 8);
            const H = rng.pick([35, 38, 40] as const);
            const bh = rng.int(1, w - d - 2);
            const B = bh * H;
            const weeks = rng.int(20, 45);
            const rentH = w - d - bh;
            const answer = rentH * H * weeks;
            return {
                prompt: `A machinist in Ostbro earns ${eur(w)} per hour and works ${n(H)} hours a week; the effort costs him the equivalent of ${eur(d)} per hour. If he were dismissed, benefits would pay ${eur(B)} per week, and he would expect to stay unemployed for ${n(weeks)} weeks before finding an equivalent job. What is his **total employment rent**, i.e. the value of keeping this job rather than losing it today?`,
                given: {
                    "Hourly wage": eur(w),
                    "Hours per week": n(H),
                    "Disutility of effort (per hour)": eur(d),
                    "Unemployment benefit (per week)": eur(B),
                    "Expected unemployment duration": `${n(weeks)} weeks`,
                },
                answer,
                explanation: String.raw`$R = \left( w - d - \frac{B}{H} \right) \cdot H \cdot T$ - the hourly rent, scaled up by the hours per week and the expected weeks of unemployment. Hourly rent: ${eur(w)} − ${eur(d)} − ${eur(B)} / ${n(H)} = ${eur(rentH)}. Total: ${eur(rentH)} · ${n(H)} · ${n(weeks)} = ${eur(answer)}.`,
            };
        },
    },

    // ------------------------------------------------------------ intertemporal
    {
        id: "e2-it-interest-rate",
        subject: "econ2",
        topic: "intertemporal",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2018 Q23; SS2017 Q13",
        build: (rng) => {
            const c1max = rng.int(2, 6) * 20;
            const r = rng.int(1, 8) * 5;
            const c2max = c1max * (1 + r / 100);
            return {
                prompt: `Marisol plans her consumption over this year and next year and can borrow or save freely at her bank. If she consumed everything **this year**, she could consume at most ${n(c1max)} thousand €; if she consumed everything **next year**, at most ${n(c2max)} thousand €. What interest rate is she facing?`,
                given: {
                    "Maximum consumption this year": `${n(c1max)} thousand €`,
                    "Maximum consumption next year": `${n(c2max)} thousand €`,
                },
                answer: r,
                explanation: String.raw`$1 + r = \frac{C_2^{max}}{C_1^{max}}$ - the two intercepts of the intertemporal budget line differ exactly by the interest factor: ${n(c2max)} / ${n(c1max)} = ${n(1 + r / 100)}, so r = ${pct(r)}.`,
            };
        },
    },
    {
        id: "e2-it-affordable",
        subject: "econ2",
        topic: "intertemporal",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2017 Q13; SS2019 Q26",
        build: (rng) => {
            const c1max = rng.int(2, 6) * 20;
            const r = rng.int(1, 8) * 5;
            const c2max = c1max * (1 + r / 100);
            const x = 10 * rng.int(1, c1max / 10 - 1);
            const answer = c2max - (1 + r / 100) * x;
            return {
                prompt: `Tobias faces an intertemporal budget line with intercepts ${n(c1max)} thousand € (consume everything this year) and ${n(c2max)} thousand € (consume everything next year). He decides to consume ${n(x)} thousand € this year. What is the **maximum** he can consume next year (in thousand €)?`,
                given: {
                    "Maximum consumption this year": `${n(c1max)} thousand €`,
                    "Maximum consumption next year": `${n(c2max)} thousand €`,
                    "Chosen consumption this year": `${n(x)} thousand €`,
                },
                answer,
                explanation: String.raw`$C_2 = C_2^{max} - (1 + r) \cdot C_1$ - every unit consumed today costs $1+r$ units of consumption tomorrow. The implied interest factor is ${n(c2max)} / ${n(c1max)} = ${n(1 + r / 100)}, so $C_2$ = ${n(c2max)} − ${n(1 + r / 100)} · ${n(x)} = ${n2(answer)} thousand €.`,
            };
        },
    },

    // ----------------------------------------------------------- exchange rates
    {
        id: "e2-fx-cross-rate",
        subject: "econ2",
        topic: "exchange_rates",
        difficulty: "medium",
        kind: "numeric",
        unit: "ratio",
        source: "TUM Economics II SS2017, Q24",
        build: (rng) => {
            const T = rng.int(400, 1200) / 100;
            const R = rng.int(150, 600) / 100;
            const answer = T / R;
            return {
                prompt: `The taler (currency of Aldunia) and the rupel (currency of Brevia) are both quoted against the denar: one denar costs ${n2(T)} talers, and one denar costs ${n2(R)} rupels. What is the cross rate in **talers per rupel**?`,
                given: {
                    "Talers per denar": n2(T),
                    "Rupels per denar": n2(R),
                },
                answer,
                explanation: String.raw`$E_{T/R} = \frac{E_{T/D}}{E_{R/D}}$ - both quotes share the denar, so dividing them cancels it: ${n2(T)} / ${n2(R)} = ${n2(answer)} talers per rupel. Multiplying instead of dividing, or flipping the ratio, are the classic traps.`,
            };
        },
    },
    {
        id: "e2-fx-change-pct",
        subject: "econ2",
        topic: "exchange_rates",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2018 Q28; SS2019 Q32",
        build: (rng) => {
            const e0 = rng.int(150, 900) / 100;
            const c = rng.int(2, 12) * rng.pick([1, -1]);
            const e1 = Math.round(e0 * (1 + c / 100) * 100) / 100;
            const answer = (e1 / e0 - 1) * 100;
            return {
                prompt: `The exchange rate between the norn (Norvia) and the kess (Kessland) moves from ${n2(e0)} norn per kess in year 1 to ${n2(e1)} norn per kess in year 2. What is the **percentage change** of the exchange rate (norn per kess)? A negative number means the rate fell.`,
                given: {
                    "Rate year 1 (norn per kess)": n2(e0),
                    "Rate year 2 (norn per kess)": n2(e1),
                },
                answer,
                explanation: String.raw`$\Delta E \, [\%] = \left( \frac{E_1}{E_0} - 1 \right) \cdot 100$: ${n2(e1)} / ${n2(e0)} − 1 = ${pct(answer)}. ${answer > 0 ? "A rising rate means the kess appreciated (each kess buys more norn) and the norn depreciated." : "A falling rate means the kess depreciated (each kess buys fewer norn) and the norn appreciated."}`,
            };
        },
    },

    // ------------------------------------------------ real vs nominal, deflator
    {
        id: "e2-rn-real-growth",
        subject: "econ2",
        topic: "real_nominal",
        difficulty: "medium",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2019 Q30; SS2017 Q17",
        build: (rng) => {
            const p1 = rng.int(2, 6);
            const p2 = rng.int(8, 15);
            const p1b = p1 + rng.int(1, 3);
            const p2b = p2 + rng.int(1, 4);
            const q11 = rng.int(300, 900);
            const q21 = rng.int(100, 400);
            const q12 = q11 + rng.int(-150, 150);
            const q22 = q21 + rng.int(-80, 80);
            const real1 = p1 * q11 + p2 * q21;
            const real2 = p1 * q12 + p2 * q22;
            const answer = (real2 / real1 - 1) * 100;
            return {
                prompt: `The economy of Miravel produces only rye bread and olive oil. In year 1 (the **base year**) it produces ${n(q11)} loaves at ${eur(p1)} each and ${n(q21)} liters at ${eur(p2)} each; in year 2 it produces ${n(q12)} loaves at ${eur(p1b)} each and ${n(q22)} liters at ${eur(p2b)} each. What is the growth rate of **real GDP** from year 1 to year 2?`,
                given: {
                    "Bread year 1": `${n(q11)} loaves at ${eur(p1)}`,
                    "Oil year 1": `${n(q21)} liters at ${eur(p2)}`,
                    "Bread year 2": `${n(q12)} loaves at ${eur(p1b)}`,
                    "Oil year 2": `${n(q22)} liters at ${eur(p2b)}`,
                    "Base year": "year 1",
                },
                answer,
                explanation: String.raw`$g^{real} = \frac{\sum p^{base} \, q_2}{\sum p^{base} \, q_1} - 1$ - value both years' quantities at **base-year** prices, so only quantity changes count. Year 1: ${eur(real1)}. Year 2 at year-1 prices: ${eur(p1)} · ${n(q12)} + ${eur(p2)} · ${n(q22)} = ${eur(real2)}. Growth: ${eur(real2)} / ${eur(real1)} − 1 = ${pct(answer)}. The year-2 prices are only needed for nominal GDP, not here.`,
            };
        },
    },
    {
        id: "e2-rn-deflator",
        subject: "econ2",
        topic: "real_nominal",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2019, Q31",
        build: (rng) => {
            const p1 = rng.int(2, 6);
            const p2 = rng.int(8, 15);
            const p1b = p1 + rng.int(1, 3);
            const p2b = p2 + rng.int(1, 4);
            const q11 = rng.int(300, 900);
            const q21 = rng.int(100, 400);
            const q12 = q11 + rng.int(-150, 150);
            const q22 = q21 + rng.int(-80, 80);
            const real2 = p1 * q12 + p2 * q22;
            const nom2 = p1b * q12 + p2b * q22;
            const answer = (100 * nom2) / real2;
            return {
                prompt: `Miravel produces only rye bread and olive oil. Year 1 is the base year with prices ${eur(p1)} per loaf and ${eur(p2)} per liter (quantities: ${n(q11)} loaves, ${n(q21)} liters). In year 2 it produces ${n(q12)} loaves at ${eur(p1b)} and ${n(q22)} liters at ${eur(p2b)}. What is the **GDP deflator** of year 2, on a scale where the base year equals 100?`,
                given: {
                    "Prices year 1 (base)": `bread ${eur(p1)}, oil ${eur(p2)}`,
                    "Quantities year 1": `${n(q11)} loaves, ${n(q21)} liters`,
                    "Prices year 2": `bread ${eur(p1b)}, oil ${eur(p2b)}`,
                    "Quantities year 2": `${n(q12)} loaves, ${n(q22)} liters`,
                },
                answer,
                explanation: String.raw`$P_t = \frac{Y_t^{nominal}}{Y_t^{real}} \cdot 100$ - both valued with **year-2 quantities**. Nominal year 2: ${eur(p1b)} · ${n(q12)} + ${eur(p2b)} · ${n(q22)} = ${eur(nom2)}. Real year 2 (base-year prices): ${eur(p1)} · ${n(q12)} + ${eur(p2)} · ${n(q22)} = ${eur(real2)}. Deflator: 100 · ${eur(nom2)} / ${eur(real2)} = ${n2(answer)}.`,
            };
        },
    },
    {
        id: "e2-rn-cpi-inflation",
        subject: "econ2",
        topic: "real_nominal",
        difficulty: "hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2017, Q18",
        build: (rng) => {
            const p1 = rng.int(2, 6);
            const p2 = rng.int(8, 15);
            const p1b = p1 + rng.int(1, 3);
            const p2b = p2 + rng.int(1, 4);
            const q11 = rng.int(300, 900);
            const q21 = rng.int(100, 400);
            const q12 = q11 + rng.int(-150, 150);
            const q22 = q21 + rng.int(-80, 80);
            const base = p1 * q11 + p2 * q21;
            const now = p1b * q11 + p2b * q21;
            const answer = (now / base - 1) * 100;
            return {
                prompt: `Consumers in Miravel buy only rye bread and olive oil. In year 1, prices were ${eur(p1)} per loaf and ${eur(p2)} per liter, and the consumption basket was ${n(q11)} loaves and ${n(q21)} liters. In year 2, prices are ${eur(p1b)} and ${eur(p2b)}, and quantities happen to shift to ${n(q12)} loaves and ${n(q22)} liters. What is the **CPI inflation rate**, using the year-1 basket as the fixed consumer basket?`,
                given: {
                    "Prices year 1": `bread ${eur(p1)}, oil ${eur(p2)}`,
                    "Basket (year 1)": `${n(q11)} loaves, ${n(q21)} liters`,
                    "Prices year 2": `bread ${eur(p1b)}, oil ${eur(p2b)}`,
                    "Quantities year 2": `${n(q12)} loaves, ${n(q22)} liters`,
                },
                answer,
                explanation: String.raw`$\pi^{CPI} = \frac{\sum p_2 \, q^{base}}{\sum p_1 \, q^{base}} - 1$ - the CPI prices the **fixed base-year basket** at both years' prices, so the year-2 quantities are pure distractor data (they would matter for the GDP deflator, which uses current quantities). Basket at year-1 prices: ${eur(base)}; at year-2 prices: ${eur(p1b)} · ${n(q11)} + ${eur(p2b)} · ${n(q21)} = ${eur(now)}. Inflation: ${eur(now)} / ${eur(base)} − 1 = ${pct(answer)}.`,
            };
        },
    },

    // ------------------------------------------- inflation and interest rates
    {
        id: "e2-ii-nominal-wage",
        subject: "econ2",
        topic: "inflation_interest",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2019, Q27",
        build: (rng) => {
            const rw = rng.int(0, 30) / 10;
            const piInfl = rng.int(5, 40) / 10;
            const answer = rw + piInfl;
            return {
                prompt: `The dockworkers' union of Port Havelin negotiates wages for next year. It targets **real** wage growth of ${pct(rw)}, and inflation is expected to be ${pct(piInfl)}. What nominal wage growth must the union demand?`,
                given: {
                    "Target real wage growth": pct(rw),
                    "Expected inflation": pct(piInfl),
                },
                answer,
                explanation: String.raw`$g_W = g_{W/P} + \pi$ - nominal wage growth is real wage growth plus inflation (the standard approximation): ${pct(rw)} + ${pct(piInfl)} = ${pct(answer)}.`,
            };
        },
    },
    {
        id: "e2-ii-real-rate",
        subject: "econ2",
        topic: "inflation_interest",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2017, Q23",
        build: (rng) => {
            const i = rng.int(0, 60) / 10;
            const piInfl = (rng.int(5, 30) / 10) * rng.pick([1, -1]);
            const answer = i - piInfl;
            return {
                prompt: `A one-year savings deposit in Meridia pays a nominal interest rate of ${pct(i)}. Inflation over the same year is ${pct(piInfl)}. What is the **real** interest rate on the deposit (Fisher approximation)?`,
                given: {
                    "Nominal interest rate i": pct(i),
                    "Inflation π": pct(piInfl),
                },
                answer,
                explanation: String.raw`$r = i - \pi$ - the Fisher approximation: ${pct(i)} − ${piInfl < 0 ? `(${pct(piInfl)})` : pct(piInfl)} = ${pct(answer)}. ${piInfl < 0 ? "Deflation (negative inflation) is **subtracted as a negative**, so it raises the real rate above the nominal rate." : "Inflation eats part of the nominal return, so the real rate is below the nominal rate."}`,
            };
        },
    },

    // ------------------------------------------------------------------- Solow
    {
        id: "e2-solow-steady-state",
        subject: "econ2",
        topic: "solow",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2017, Q31",
        build: (rng) => {
            const nPop = rng.int(0, 3);
            const g = rng.int(1, 3);
            const delta = rng.int(3, 8);
            const x = nPop + g + delta;
            const ratio = rng.pick([2, 2.5, 3] as const);
            const s = x * ratio;
            const answer = ratio * ratio;
            return {
                prompt: String.raw`A Solow economy has production per effective worker $f(k) = \sqrt{k}$. The savings rate is ${pct(s)}, population grows at ${pct(nPop)}, technology at ${pct(g)}, and capital depreciates at ${pct(delta)}. What is the **steady-state** capital stock per effective worker $k^*$?`,
                given: {
                    "Production per effective worker": String.raw`$f(k) = \sqrt{k}$`,
                    "Savings rate s": pct(s),
                    "Population growth n": pct(nPop),
                    "Technological progress g": pct(g),
                    "Depreciation rate δ": pct(delta),
                },
                answer,
                explanation: String.raw`$s \cdot f(k^*) = (n + g + \delta) \cdot k^*$ - in the steady state, saving per effective worker exactly covers the capital dilution. With $f(k) = \sqrt{k}$: $s \sqrt{k^*} = (n+g+\delta) k^*$, so $\sqrt{k^*} = \frac{s}{n+g+\delta}$ = ${pct(s)} / ${pct(x)} = ${n(ratio)}, giving $k^*$ = ${n(answer)}.`,
            };
        },
    },
    {
        id: "e2-solow-golden-rule-k",
        subject: "econ2",
        topic: "solow",
        difficulty: "hard",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2018 Q36; SS2019 Q35",
        build: (rng) => {
            const cfg = rng.pick(SOLOW_GR);
            const xPct = (cfg.A * 100) / (2 * cfg.r0);
            const nPop = rng.int(0, 3);
            const g = rng.int(1, 3);
            const delta = xPct - nPop - g;
            const s = rng.int(15, 45);
            const answer = cfg.r0 ** 2;
            const Astr = cfg.A === 1 ? "" : `${cfg.A} `;
            return {
                prompt: String.raw`A Solow economy has production per effective worker $f(k) = ${Astr}\sqrt{k}$. The savings rate is ${pct(s)}, population grows at ${pct(nPop)}, technology at ${pct(g)}, and depreciation is ${pct(delta)}. What is the **golden-rule** capital stock per effective worker $k^{gr}$, i.e. the one that maximizes steady-state consumption?`,
                given: {
                    "Production per effective worker": String.raw`$f(k) = ${Astr}\sqrt{k}$`,
                    "Savings rate s": pct(s),
                    "Population growth n": pct(nPop),
                    "Technological progress g": pct(g),
                    "Depreciation rate δ": pct(delta),
                },
                answer,
                explanation: String.raw`$f'(k^{gr}) = n + g + \delta$ - at the golden rule, the marginal product of capital equals the dilution rate; the savings rate plays no role here (it is what would have to adjust). $f'(k) = \frac{${cfg.A}}{2\sqrt{k}}$, so $\sqrt{k^{gr}} = \frac{${cfg.A}}{2 \cdot ${n(xPct / 100)}}$ = ${n(cfg.r0)}, giving $k^{gr}$ = ${n(answer)}.`,
            };
        },
    },
    {
        id: "e2-solow-golden-rule-s",
        subject: "econ2",
        topic: "solow",
        difficulty: "medium",
        kind: "numeric",
        unit: "percent",
        source: "TUM Economics II SS2018 Q37; SS2019 Q36",
        build: (rng) => {
            const alpha = rng.pick([
                { num: 1, den: 4 },
                { num: 2, den: 5 },
                { num: 1, den: 2 },
                { num: 3, den: 5 },
            ] as const);
            const A = rng.int(2, 5);
            const nPop = rng.int(1, 3);
            const g = rng.int(1, 3);
            const delta = rng.int(3, 8);
            const answer = (alpha.num / alpha.den) * 100;
            return {
                prompt: String.raw`A Solow economy produces with $Y = ${A} \, K^{${alpha.num}/${alpha.den}} (LE)^{${alpha.den - alpha.num}/${alpha.den}}$. Population grows at ${pct(nPop)}, technology at ${pct(g)}, and depreciation is ${pct(delta)}. Which **savings rate** would put the economy on its golden-rule steady state?`,
                given: {
                    "Production function": String.raw`$Y = ${A} \, K^{${alpha.num}/${alpha.den}} (LE)^{${alpha.den - alpha.num}/${alpha.den}}$`,
                    "Population growth n": pct(nPop),
                    "Technological progress g": pct(g),
                    "Depreciation rate δ": pct(delta),
                },
                answer,
                explanation: String.raw`$s^{gr} = \alpha$ - combine the steady-state condition $s f(k) = (n+g+\delta) k$ with the golden rule $f'(k^{gr}) = n+g+\delta$: dividing them gives $s = \frac{k \, f'(k)}{f(k)}$, which for a Cobb-Douglas function is exactly the capital share $\alpha$. Here $\alpha = ${alpha.num}/${alpha.den}$, so $s^{gr}$ = ${pct(answer)} - independent of $n$, $g$, $\delta$ and the scale factor.`,
            };
        },
    },
    {
        id: "e2-solow-golden-rule-c",
        subject: "econ2",
        topic: "solow",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "number",
        source: "TUM Economics II SS2018, Q38",
        build: (rng) => {
            const cfg = rng.pick(SOLOW_GR);
            const xPct = (cfg.A * 100) / (2 * cfg.r0);
            const nPop = rng.int(0, 3);
            const g = rng.int(1, 3);
            const delta = xPct - nPop - g;
            const kGr = cfg.r0 ** 2;
            const fk = cfg.A * cfg.r0;
            const answer = (cfg.A * cfg.r0) / 2;
            const Astr = cfg.A === 1 ? "" : `${cfg.A} `;
            return {
                prompt: String.raw`A Solow economy has production per effective worker $f(k) = ${Astr}\sqrt{k}$, population growth of ${pct(nPop)}, technological progress of ${pct(g)}, and depreciation of ${pct(delta)}. What is the **maximum sustainable consumption per effective worker**, i.e. steady-state consumption at the golden-rule capital stock?`,
                given: {
                    "Production per effective worker": String.raw`$f(k) = ${Astr}\sqrt{k}$`,
                    "Population growth n": pct(nPop),
                    "Technological progress g": pct(g),
                    "Depreciation rate δ": pct(delta),
                },
                answer,
                explanation: String.raw`$c^{gr} = f(k^{gr}) - (n + g + \delta) \cdot k^{gr}$ - output minus the investment needed to hold $k$ constant, evaluated at the golden rule. First $f'(k) = \frac{${cfg.A}}{2\sqrt{k}} = ${n(xPct / 100)}$ gives $\sqrt{k^{gr}} = ${n(cfg.r0)}$, so $k^{gr} = ${n(kGr)}$. Then $f(k^{gr}) = ${n(fk)}$ and the dilution term is ${n(xPct / 100)} · ${n(kGr)} = ${n(xPct / 100 * kGr)}, leaving $c^{gr}$ = ${n(fk)} − ${n(xPct / 100 * kGr)} = ${n(answer)}.`,
            };
        },
    },
];
