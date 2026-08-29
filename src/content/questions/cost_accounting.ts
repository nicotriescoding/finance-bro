import type { Question } from "@/lib/questions/types";
import type { Rng } from "@/lib/questions/rng";
import { eur, n, n2, pct } from "./_helpers";

/**
 * Cost Accounting (Prof. Friedl, TUM).
 *
 * Built from real TUM Cost Accounting exams under the copyright-redesign
 * policy: Summer 2015, Winter 2016/17, Summer 2017, Winter 2017/18,
 * Summer 2018, Winter 2018/19 and the Mock Exam (answer key from the
 * SS2021 exam-prep deck). Every question keeps only the tested competency
 * and the standard formula; scenarios, company names, wording and all
 * numbers are new (numeric questions draw every number from the seeded rng).
 * Recurring tasks across exam years are merged into one variant family;
 * `source` cites all occurrences.
 */

// ---------------------------------------------------------------- helpers

/** Inventory movement scenario shared by the material-valuation family. */
type StockScenario = {
    begin: number; p0: number;
    c1: number;
    buy1: number; p1: number;
    buy2: number; p2: number;
    c2: number;
    buy3: number; p3: number;
};

function drawStock(rng: Rng): StockScenario {
    // Quantities in whole 100 kg so every FIFO/LIFO layer walk stays clean.
    // c1 < begin and c2 < begin - c1 + buy1 + buy2 hold for every draw:
    // begin >= 1,000, c1 <= 800, stock before c2 >= 1,000 > 900 >= c2.
    const p0 = rng.int(12, 20) * 0.25; // 3.00 .. 5.00 EUR/kg
    const begin = rng.int(10, 20) * 100;
    const c1 = rng.int(4, 8) * 100;
    const buy1 = rng.int(4, 8) * 100;
    const p1 = p0 + rng.pick([-0.5, -0.25, 0.25, 0.5]);
    const buy2 = rng.int(4, 8) * 100;
    const p2 = p0 + rng.pick([-0.5, -0.25, 0.25, 0.5]);
    const c2 = rng.int(4, 9) * 100;
    const buy3 = rng.int(3, 6) * 100;
    const p3 = p0 + rng.pick([-0.25, 0.25]);
    return { begin, p0, c1, buy1, p1, buy2, p2, c2, buy3, p3 };
}

/** Consumes `qty` from price layers front-to-back; returns cost + breakdown. */
function walkLayers(layers: Array<[number, number]>, qty: number) {
    let remaining = qty;
    let cost = 0;
    const parts: string[] = [];
    for (const [amount, price] of layers) {
        if (remaining <= 0) break;
        const take = Math.min(amount, remaining);
        cost += take * price;
        parts.push(`${n(take)} kg × ${eur(price)}`);
        remaining -= take;
    }
    return { cost, parts };
}

// ---------------------------------------------------------------- questions

export const costAccountingQuestions: Question[] = [
    // -------------------------------------------------- material valuation
    {
        id: "ca-mat-fifo-issue",
        subject: "cost_accounting",
        topic: "material_valuation",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q16; WS17/18 Q19",
        build: (rng) => {
            const s = drawStock(rng);
            const afterC1 = s.begin - s.c1;
            const layers: Array<[number, number]> = [
                [afterC1, s.p0],
                [s.buy1, s.p1],
                [s.buy2, s.p2],
            ];
            const { cost, parts } = walkLayers(layers, s.c2);
            return {
                prompt: `Nordwind Brew Co. tracks its main raw material, barley malt, in March. The opening stock is ${n(s.begin)} kg at ${eur(s.p0)} per kg. On Mar 4, ${n(s.c1)} kg are issued to production. Then ${n(s.buy1)} kg are bought at ${eur(s.p1)} per kg (Mar 9) and ${n(s.buy2)} kg at ${eur(s.p2)} per kg (Mar 14). What is the cost of the material issue of ${n(s.c2)} kg on Mar 20 under the **FIFO** method?`,
                given: {
                    "Opening stock": `${n(s.begin)} kg at ${eur(s.p0)}/kg`,
                    "Issue Mar 4": `${n(s.c1)} kg`,
                    "Purchase Mar 9": `${n(s.buy1)} kg at ${eur(s.p1)}/kg`,
                    "Purchase Mar 14": `${n(s.buy2)} kg at ${eur(s.p2)}/kg`,
                    "Issue Mar 20": `${n(s.c2)} kg`,
                },
                answer: cost,
                explanation: String.raw`Under $FIFO$ (first in, first out) an issue is valued from the **oldest** layers still on stock. After the Mar 4 issue, ${n(afterC1)} kg of the opening layer remain, then the two purchase layers follow. The Mar 20 issue takes ${parts.join(", then ")}, so the material cost is ${eur(cost)}.`,
            };
        },
    },
    {
        id: "ca-mat-lifo-issue",
        subject: "cost_accounting",
        topic: "material_valuation",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q17; WS17/18 Q18",
        build: (rng) => {
            const s = drawStock(rng);
            const afterC1 = s.begin - s.c1;
            // LIFO consumes newest layers first.
            const layers: Array<[number, number]> = [
                [s.buy2, s.p2],
                [s.buy1, s.p1],
                [afterC1, s.p0],
            ];
            const { cost, parts } = walkLayers(layers, s.c2);
            return {
                prompt: `Nordwind Brew Co. values barley malt with a perpetual **LIFO** system. Opening stock in March: ${n(s.begin)} kg at ${eur(s.p0)} per kg. Movements: issue of ${n(s.c1)} kg (Mar 4), purchase of ${n(s.buy1)} kg at ${eur(s.p1)} per kg (Mar 9), purchase of ${n(s.buy2)} kg at ${eur(s.p2)} per kg (Mar 14). What is the cost of the issue of ${n(s.c2)} kg on Mar 20?`,
                given: {
                    "Opening stock": `${n(s.begin)} kg at ${eur(s.p0)}/kg`,
                    "Issue Mar 4": `${n(s.c1)} kg`,
                    "Purchase Mar 9": `${n(s.buy1)} kg at ${eur(s.p1)}/kg`,
                    "Purchase Mar 14": `${n(s.buy2)} kg at ${eur(s.p2)}/kg`,
                    "Issue Mar 20": `${n(s.c2)} kg`,
                },
                answer: cost,
                explanation: String.raw`Under $LIFO$ (last in, first out) an issue is valued from the **newest** layers on stock at that date. On Mar 20 the newest layer is the Mar 14 purchase, then the Mar 9 purchase, then the opening stock. The issue takes ${parts.join(", then ")}, so the material cost is ${eur(cost)}.`,
            };
        },
    },
    {
        id: "ca-mat-moving-average",
        subject: "cost_accounting",
        topic: "material_valuation",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015, Q18",
        build: (rng) => {
            const s = drawStock(rng);
            const afterC1 = s.begin - s.c1;
            const qty = afterC1 + s.buy1 + s.buy2;
            const value = afterC1 * s.p0 + s.buy1 * s.p1 + s.buy2 * s.p2;
            const avg = value / qty;
            const answer = s.c2 * avg;
            return {
                prompt: `Nordwind Brew Co. values barley malt with **moving average** prices. Opening stock in March: ${n(s.begin)} kg at ${eur(s.p0)} per kg. Movements before the issue in question: issue of ${n(s.c1)} kg (Mar 4), purchase of ${n(s.buy1)} kg at ${eur(s.p1)} per kg (Mar 9), purchase of ${n(s.buy2)} kg at ${eur(s.p2)} per kg (Mar 14). What is the cost of the issue of ${n(s.c2)} kg on Mar 20?`,
                given: {
                    "Opening stock": `${n(s.begin)} kg at ${eur(s.p0)}/kg`,
                    "Issue Mar 4": `${n(s.c1)} kg`,
                    "Purchase Mar 9": `${n(s.buy1)} kg at ${eur(s.p1)}/kg`,
                    "Purchase Mar 14": `${n(s.buy2)} kg at ${eur(s.p2)}/kg`,
                    "Issue Mar 20": `${n(s.c2)} kg`,
                },
                answer,
                explanation: String.raw`The moving average is recomputed after every purchase: $\bar{p} = \frac{\text{stock value}}{\text{stock quantity}}$. Before Mar 20 the stock is ${n(afterC1)} kg × ${eur(s.p0)} + ${n(s.buy1)} kg × ${eur(s.p1)} + ${n(s.buy2)} kg × ${eur(s.p2)} = ${eur(value)} over ${n(qty)} kg, so the average price is ${eur(avg)}/kg. The issue costs ${n(s.c2)} kg × ${eur(avg)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-mat-expost-ending-value",
        subject: "cost_accounting",
        topic: "material_valuation",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q19; SS2015 Q21",
        build: (rng) => {
            const s = drawStock(rng);
            const totalQty = s.begin + s.buy1 + s.buy2 + s.buy3;
            const totalValue = s.begin * s.p0 + s.buy1 * s.p1 + s.buy2 * s.p2 + s.buy3 * s.p3;
            const avg = totalValue / totalQty;
            const endQty = totalQty - s.c1 - s.c2;
            const answer = endQty * avg;
            return {
                prompt: `Nordwind Brew Co. values barley malt with **ex-post (periodic) average** prices. In March, the opening stock is ${n(s.begin)} kg at ${eur(s.p0)} per kg. Purchases: ${n(s.buy1)} kg at ${eur(s.p1)}, ${n(s.buy2)} kg at ${eur(s.p2)}, and ${n(s.buy3)} kg at ${eur(s.p3)} per kg. Issues to production: ${n(s.c1)} kg and ${n(s.c2)} kg. What is the value of the ending inventory?`,
                given: {
                    "Opening stock": `${n(s.begin)} kg at ${eur(s.p0)}/kg`,
                    "Purchases": `${n(s.buy1)} kg at ${eur(s.p1)}; ${n(s.buy2)} kg at ${eur(s.p2)}; ${n(s.buy3)} kg at ${eur(s.p3)}`,
                    "Issues": `${n(s.c1)} kg and ${n(s.c2)} kg`,
                },
                answer,
                explanation: String.raw`The ex-post average prices the whole period at one rate: $\bar{p} = \frac{\text{opening value} + \text{purchase value}}{\text{opening quantity} + \text{purchase quantity}}$. Here $\bar{p}$ = ${eur(totalValue)} / ${n(totalQty)} kg = ${eur(avg)}/kg. The ending quantity is ${n(totalQty)} − ${n(s.c1)} − ${n(s.c2)} = ${n(endQty)} kg, valued at ${n(endQty)} kg × ${eur(avg)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-mat-ending-quantity",
        subject: "cost_accounting",
        topic: "material_valuation",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting SS2015 Q20; WS17/18 Q17",
        build: (rng) => {
            const s = drawStock(rng);
            const answer = s.begin + s.buy1 + s.buy2 + s.buy3 - s.c1 - s.c2;
            return {
                prompt: `Nordwind Brew Co. records the following barley malt movements in March: opening stock ${n(s.begin)} kg, purchases of ${n(s.buy1)} kg, ${n(s.buy2)} kg and ${n(s.buy3)} kg, issues to production of ${n(s.c1)} kg and ${n(s.c2)} kg. How many kilograms of barley malt are on stock at the end of March?`,
                given: {
                    "Opening stock": `${n(s.begin)} kg`,
                    "Purchases": `${n(s.buy1)} kg, ${n(s.buy2)} kg, ${n(s.buy3)} kg`,
                    "Issues": `${n(s.c1)} kg, ${n(s.c2)} kg`,
                },
                answer,
                explanation: String.raw`$\text{ending stock} = \text{opening stock} + \sum \text{purchases} - \sum \text{issues}$: ${n(s.begin)} + ${n(s.buy1)} + ${n(s.buy2)} + ${n(s.buy3)} − ${n(s.c1)} − ${n(s.c2)} = ${n(answer)} kg. The quantity on stock is the same under every valuation method — only the value differs.`,
            };
        },
    },

    // -------------------------------------------------------- depreciation
    {
        id: "ca-dep-straight-line",
        subject: "cost_accounting",
        topic: "depreciation",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015, Q23",
        build: (rng) => {
            const A = rng.int(4, 12) * 100000;
            const R = rng.int(1, 3) * 100000;
            const N = rng.int(4, 6);
            const answer = (A - R) / N;
            return {
                prompt: `A beverage producer buys a bottling line for ${eur(A)}. After a useful life of ${N} years it is expected to be sold at a residual value of ${eur(R)}. What is the yearly depreciation amount under the **straight-line** method?`,
                given: { "Acquisition cost": eur(A), "Residual value": eur(R), "Useful life": `${N} years` },
                answer,
                explanation: String.raw`$D = \frac{A_0 - RV}{N}$ — the depreciable base is acquisition cost minus residual value, spread evenly: (${eur(A)} − ${eur(R)}) / ${N} = ${eur(answer)} per year.`,
            };
        },
    },
    {
        id: "ca-dep-declining-rate",
        subject: "cost_accounting",
        topic: "depreciation",
        difficulty: "hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM Cost Accounting SS2015, Q24",
        build: (rng) => {
            const A = rng.int(4, 12) * 100000;
            const R = rng.int(1, 3) * 100000;
            const N = rng.int(4, 6);
            const rate = 1 - (R / A) ** (1 / N);
            const answer = rate * 100;
            return {
                prompt: `A packaging machine is bought for ${eur(A)} and should be written down to its residual value of ${eur(R)} over ${N} years using **declining-balance (geometric-degressive)** depreciation. What constant yearly depreciation rate is required?`,
                given: { "Acquisition cost": eur(A), "Residual value": eur(R), "Useful life": `${N} years` },
                answer,
                explanation: String.raw`Under declining-balance depreciation the book value after $N$ years is $A_0 \cdot (1-r)^N = RV$, so $r = 1 - \sqrt[N]{\frac{RV}{A_0}}$. Here $r$ = 1 − (${eur(R)} / ${eur(A)})^(1/${N}) = ${pct(answer)}.`,
            };
        },
    },
    {
        id: "ca-dep-units-of-production",
        subject: "cost_accounting",
        topic: "depreciation",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q22; WS17/18 Q23",
        build: (rng) => {
            const A = rng.int(4, 12) * 100000;
            const R = rng.int(1, 3) * 100000;
            const capacity = rng.int(2, 5) * 100000;
            const output = rng.int(2, 9) * 1000;
            const perUnit = (A - R) / capacity;
            const answer = perUnit * output;
            return {
                prompt: `A labeling machine costs ${eur(A)}, has a residual value of ${eur(R)} and a total lifetime capacity of ${n(capacity)} bottles. In April, ${n(output)} bottles are labeled. What is the depreciation amount for April under the **units-of-production** method?`,
                given: {
                    "Acquisition cost": eur(A),
                    "Residual value": eur(R),
                    "Lifetime capacity": `${n(capacity)} bottles`,
                    "Output in April": `${n(output)} bottles`,
                },
                answer,
                explanation: String.raw`$D = \frac{A_0 - RV}{\text{lifetime capacity}} \cdot \text{output of the period}$. The depreciation per bottle is (${eur(A)} − ${eur(R)}) / ${n(capacity)} = ${eur(perUnit)}; for ${n(output)} bottles that is ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-dep-arithmetic-degressive",
        subject: "cost_accounting",
        topic: "depreciation",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS17/18, Q24",
        build: (rng) => {
            const N = rng.int(4, 6);
            const dStep = rng.int(2, 12) * 1000;
            const base = (dStep * N * (N + 1)) / 2;
            const R = rng.int(1, 5) * 10000;
            const A = base + R;
            const t = rng.int(2, N);
            const answer = (N - t + 1) * dStep;
            return {
                prompt: `A conveyor system is bought for ${eur(A)} and depreciated over ${N} years to a residual value of ${eur(R)} using **arithmetic-degressive** depreciation (yearly amounts fall by a constant amount, reaching that constant in the final year). What is the depreciation amount in year ${t}?`,
                given: { "Acquisition cost": eur(A), "Residual value": eur(R), "Useful life": `${N} years`, "Year": String(t) },
                answer,
                explanation: String.raw`With arithmetic-degressive depreciation the yearly amounts are $N \cdot d, (N-1) \cdot d, \ldots, d$, so their sum is $d \cdot \frac{N (N+1)}{2} = A_0 - RV$. Here $d$ = (${eur(A)} − ${eur(R)}) / ${n((N * (N + 1)) / 2)} = ${eur(dStep)}. Year ${t} depreciates $(N - t + 1) \cdot d$ = ${n(N - t + 1)} × ${eur(dStep)} = ${eur(answer)}.`,
            };
        },
    },

    // ----------------------------------------------------- cost allocation
    {
        id: "ca-alloc-direct-transfer-price",
        subject: "cost_accounting",
        topic: "cost_allocation",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q34; WS16/17 Q21; SS2017 Q17; WS17/18 Q20; Mock Exam Q34",
        build: (rng) => {
            const O2 = rng.int(40, 120) * 1000;
            const s21 = rng.int(4, 12) * 10;
            const h1 = rng.int(5, 20) * 10;
            const h2 = rng.int(5, 20) * 10;
            const answer = O2 / (h1 + h2);
            return {
                prompt: `Oakline Furniture runs the indirect cost centers Boiler House and Tool Shop and the direct cost centers Assembly and Finishing. The Tool Shop has primary overheads of ${eur(O2)} and works ${n(s21)} hours for the Boiler House, ${n(h1)} hours for Assembly and ${n(h2)} hours for Finishing. What is the transfer price per Tool Shop hour under the **direct method**?`,
                given: {
                    "Primary overheads Tool Shop": eur(O2),
                    "Hours for Boiler House": `${n(s21)} h`,
                    "Hours for Assembly": `${n(h1)} h`,
                    "Hours for Finishing": `${n(h2)} h`,
                },
                answer,
                explanation: String.raw`The direct method ignores services delivered to other **indirect** cost centers: $tp = \frac{\text{primary overheads}}{\text{output to direct cost centers only}}$. So tp = ${eur(O2)} / (${n(h1)} h + ${n(h2)} h) = ${eur(answer)} per hour — the ${n(s21)} hours for the Boiler House drop out of the denominator.`,
            };
        },
    },
    {
        id: "ca-alloc-direct-amount",
        subject: "cost_accounting",
        topic: "cost_allocation",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q33; WS17/18 Q21; SS2017 Q18; SS2018 Q34; WS18/19 Q34",
        build: (rng) => {
            const O1 = rng.int(20, 60) * 1000;
            const s12 = rng.int(20, 80) * 10;
            const d11 = rng.int(10, 30) * 100;
            const d12 = rng.int(10, 30) * 100;
            const tp = O1 / (d11 + d12);
            const answer = tp * d11;
            return {
                prompt: `Oakline Furniture's Boiler House (an indirect cost center) has primary overheads of ${eur(O1)}. It delivers ${n(s12)} MWh of heat to the Tool Shop (another indirect cost center), ${n(d11)} MWh to Assembly and ${n(d12)} MWh to Finishing (the direct cost centers). Which costs are allocated from the Boiler House to **Assembly** under the direct method?`,
                given: {
                    "Primary overheads Boiler House": eur(O1),
                    "Heat to Tool Shop": `${n(s12)} MWh`,
                    "Heat to Assembly": `${n(d11)} MWh`,
                    "Heat to Finishing": `${n(d12)} MWh`,
                },
                answer,
                explanation: String.raw`Under the direct method, $tp = \frac{\text{primary overheads}}{\text{output to direct cost centers}}$ and the allocation is $tp \cdot \text{quantity received}$. Here tp = ${eur(O1)} / (${n(d11)} + ${n(d12)}) MWh = ${eur(tp)}/MWh, so Assembly is debited ${n(d11)} MWh × ${eur(tp)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-alloc-stepladder-transfer-price",
        subject: "cost_accounting",
        topic: "cost_allocation",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q35; SS2017 Q19; WS17/18 Q22; SS2018 Q36; Mock Exam Q36",
        build: (rng) => {
            const O1 = rng.int(20, 60) * 1000;
            const O2 = rng.int(40, 120) * 1000;
            const s12 = rng.int(20, 80) * 10;
            const d11 = rng.int(10, 30) * 100;
            const d12 = rng.int(10, 30) * 100;
            const s21 = rng.int(4, 12) * 10;
            const h1 = rng.int(5, 20) * 10;
            const h2 = rng.int(5, 20) * 10;
            const tp1 = O1 / (s12 + d11 + d12);
            const secondary = s12 * tp1;
            const answer = (O2 + secondary) / (h1 + h2);
            return {
                prompt: `Oakline Furniture allocates support costs with the **step-ladder method** (German: Stufenleiterverfahren) in the sequence Boiler House → Tool Shop. The Boiler House (primary overheads ${eur(O1)}) delivers ${n(s12)} MWh to the Tool Shop, ${n(d11)} MWh to Assembly and ${n(d12)} MWh to Finishing. The Tool Shop (primary overheads ${eur(O2)}) works ${n(s21)} hours for the Boiler House, ${n(h1)} hours for Assembly and ${n(h2)} hours for Finishing. What is the transfer price per Tool Shop hour?`,
                given: {
                    "Primary overheads Boiler House / Tool Shop": `${eur(O1)} / ${eur(O2)}`,
                    "Boiler House output": `${n(s12)} MWh to Tool Shop, ${n(d11)} MWh to Assembly, ${n(d12)} MWh to Finishing`,
                    "Tool Shop output": `${n(s21)} h to Boiler House, ${n(h1)} h to Assembly, ${n(h2)} h to Finishing`,
                },
                answer,
                explanation: String.raw`In the step-ladder sequence, the first center allocates to **all** later centers, and back-deliveries are ignored: $tp_2 = \frac{\text{primary overheads}_2 + \text{costs received from center 1}}{\text{output to later centers}}$. The Boiler House rate is ${eur(O1)} / ${n(s12 + d11 + d12)} MWh = ${eur(tp1)}/MWh, so the Tool Shop receives ${n(s12)} MWh × ${eur(tp1)} = ${eur(secondary)}. Its transfer price is (${eur(O2)} + ${eur(secondary)}) / (${n(h1)} + ${n(h2)}) h = ${eur(answer)} per hour — the ${n(s21)} hours delivered back to the Boiler House are not in the denominator.`,
            };
        },
    },
    {
        id: "ca-alloc-credits-debits-total",
        subject: "cost_accounting",
        topic: "cost_allocation",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q36; SS2017 Q21; Mock Exam Q39; Mock Exam Q40",
        build: (rng) => {
            const P1 = rng.int(40, 120) * 1000;
            const t1 = rng.pick([1, 1.2, 1.5, 2]);
            const t2 = rng.int(20, 60);
            const d11 = rng.int(10, 30) * 100;
            const h1 = rng.int(5, 20) * 10;
            const answer = P1 + t1 * d11 + t2 * h1;
            return {
                prompt: `Oakline Furniture applies the **method of credits and debits** (German: Kostenstellenausgleichsverfahren) with preset transfer prices: heat from the Boiler House at ${eur(t1)} per MWh and Tool Shop work at ${eur(t2)} per hour. The direct cost center Assembly has primary overheads of ${eur(P1)} and receives ${n(d11)} MWh of heat and ${n(h1)} Tool Shop hours. What are Assembly's total overheads after the allocation (before any levy for cost coverage)?`,
                given: {
                    "Primary overheads Assembly": eur(P1),
                    "Transfer price heat": `${eur(t1)} per MWh`,
                    "Transfer price Tool Shop": `${eur(t2)} per hour`,
                    "Heat received": `${n(d11)} MWh`,
                    "Tool Shop hours received": `${n(h1)} h`,
                },
                answer,
                explanation: String.raw`Under the method of credits and debits every service is priced at its preset transfer price: $\text{total overheads} = \text{primary overheads} + \sum tp_i \cdot x_i$. Assembly is debited ${eur(P1)} + ${n(d11)} × ${eur(t1)} + ${n(h1)} × ${eur(t2)} = ${eur(answer)}. Because the preset prices need not clear the indirect centers' balances, a levy for cost coverage may follow.`,
            };
        },
    },
    {
        id: "ca-alloc-reciprocal-amount",
        subject: "cost_accounting",
        topic: "cost_allocation",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q39; WS16/17 Q16; SS2018 Q39; WS18/19 Q39; Mock Exam Q38",
        build: (rng) => {
            const O1 = rng.int(20, 60) * 1000;
            const O2 = rng.int(40, 120) * 1000;
            const s12 = rng.int(20, 80) * 10;
            const d11 = rng.int(10, 30) * 100;
            const d12 = rng.int(10, 30) * 100;
            const s21 = rng.int(4, 12) * 10;
            const h1 = rng.int(5, 20) * 10;
            const h2 = rng.int(5, 20) * 10;
            const S1 = s12 + d11 + d12;
            const S2 = s21 + h1 + h2;
            // S1*c1 = O1 + s21*c2 ; S2*c2 = O2 + s12*c1
            const c2 = (O2 * S1 + s12 * O1) / (S1 * S2 - s12 * s21);
            const c1 = (O1 + s21 * c2) / S1;
            const answer = c2 * h1;
            return {
                prompt: `Oakline Furniture allocates support costs with the **reciprocal method based on equations**. The Boiler House (primary overheads ${eur(O1)}) delivers ${n(s12)} MWh to the Tool Shop, ${n(d11)} MWh to Assembly and ${n(d12)} MWh to Finishing. The Tool Shop (primary overheads ${eur(O2)}) works ${n(s21)} hours for the Boiler House, ${n(h1)} hours for Assembly and ${n(h2)} hours for Finishing. Which costs are allocated from the Tool Shop to **Assembly**?`,
                given: {
                    "Primary overheads Boiler House / Tool Shop": `${eur(O1)} / ${eur(O2)}`,
                    "Boiler House output": `${n(s12)} MWh to Tool Shop, ${n(d11)} MWh to Assembly, ${n(d12)} MWh to Finishing`,
                    "Tool Shop output": `${n(s21)} h to Boiler House, ${n(h1)} h to Assembly, ${n(h2)} h to Finishing`,
                },
                answer,
                explanation: String.raw`The reciprocal method values each center's total output at its transfer price: $S_1 \cdot c_1 = O_1 + s_{21} \cdot c_2$ and $S_2 \cdot c_2 = O_2 + s_{12} \cdot c_1$. With total outputs $S_1$ = ${n(S1)} MWh and $S_2$ = ${n(S2)} h, solving the two equations gives $c_1$ = ${eur(c1)}/MWh and $c_2$ = ${eur(c2)}/h. Assembly is therefore debited ${n(h1)} h × ${eur(c2)} = ${eur(answer)} by the Tool Shop.`,
            };
        },
    },

    // ----------------------------------------------------- product costing
    {
        id: "ca-pc-variable-mfg-cost",
        subject: "cost_accounting",
        topic: "product_costing",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q29; SS2017 Q26",
        build: (rng) => {
            const q1 = rng.int(4, 12) * 100;
            const q2 = rng.int(4, 12) * 100;
            const t1 = rng.int(2, 6);
            const t2 = rng.int(3, 8);
            const rate = rng.pick([0.5, 1, 1.5, 2]);
            const V = rate * (q1 * t1 + q2 * t2);
            const m2 = rng.int(2, 9);
            const l2 = rng.int(2, 9);
            const answer = m2 + l2 + rate * t2;
            return {
                prompt: `Velotta Components makes saddles and handlebars. This period it produces ${n(q1)} saddles (${n(t1)} min each) and ${n(q2)} handlebars (${n(t2)} min each). Variable production overheads of ${eur(V)} are allocated on production time. A handlebar carries direct material of ${eur(m2)} and direct labor of ${eur(l2)}. What are the **variable manufacturing costs per unit** of a handlebar?`,
                given: {
                    "Produced: saddles / handlebars": `${n(q1)} / ${n(q2)} units`,
                    "Production time: saddle / handlebar": `${n(t1)} / ${n(t2)} min per unit`,
                    "Variable production overheads": eur(V),
                    "Handlebar direct material / labor": `${eur(m2)} / ${eur(l2)} per unit`,
                },
                answer,
                explanation: String.raw`$k_{var} = \text{direct material} + \text{direct labor} + \text{variable overhead rate} \cdot t$. The overhead rate is ${eur(V)} / (${n(q1)} × ${n(t1)} + ${n(q2)} × ${n(t2)}) min = ${eur(rate)} per minute. A handlebar takes ${n(t2)} min, so its variable manufacturing costs are ${eur(m2)} + ${eur(l2)} + ${n(t2)} × ${eur(rate)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-pc-total-cost-surcharge",
        subject: "cost_accounting",
        topic: "product_costing",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q28; WS16/17 Q27; WS17/18 Q28",
        build: (rng) => {
            const mfg1 = rng.int(15, 40);
            const mfg2 = rng.int(20, 60);
            const sold1 = rng.int(4, 12) * 100;
            const sold2 = rng.int(4, 12) * 100;
            const rate = rng.pick([0.05, 0.08, 0.1, 0.12, 0.2]);
            const base = mfg1 * sold1 + mfg2 * sold2;
            const sga = rate * base;
            const answer = mfg1 * (1 + rate);
            return {
                prompt: `Velotta Components sells ${n(sold1)} saddles (full manufacturing costs ${eur(mfg1)} per unit) and ${n(sold2)} handlebars (full manufacturing costs ${eur(mfg2)} per unit). Administration and selling overheads of ${eur(sga)} are allocated as a surcharge on the manufacturing costs of the quantity **sold**. What is the total cost per unit of a saddle?`,
                given: {
                    "Full manufacturing costs saddle / handlebar": `${eur(mfg1)} / ${eur(mfg2)} per unit`,
                    "Sold quantity saddle / handlebar": `${n(sold1)} / ${n(sold2)} units`,
                    "Administration and selling overheads": eur(sga),
                },
                answer,
                explanation: String.raw`$k_{total} = k_{mfg} \cdot (1 + z)$ where $z = \frac{\text{admin and selling overheads}}{\text{manufacturing costs of quantity sold}}$. The base is ${n(sold1)} × ${eur(mfg1)} + ${n(sold2)} × ${eur(mfg2)} = ${eur(base)}, so z = ${eur(sga)} / ${eur(base)} = ${pct(rate * 100)}. Total cost per saddle: ${eur(mfg1)} × ${n(1 + rate)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-pc-target-margin-price",
        subject: "cost_accounting",
        topic: "product_costing",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS16/17, Q28",
        build: (rng) => {
            const C = rng.int(40, 120);
            const m = rng.pick([10, 20, 25]);
            const answer = C / (1 - m / 100);
            return {
                prompt: `A gearbox has total costs of ${eur(C)} per unit under absorption costing. At which price must it be sold to achieve a profit margin of ${pct(m)} **of the sales price**?`,
                given: { "Total cost per unit": eur(C), "Target profit margin (on sales)": pct(m) },
                answer,
                explanation: String.raw`With a margin on the sales price, $p \cdot (1 - m) = k_{total}$, so $p = \frac{k_{total}}{1 - m}$ = ${eur(C)} / ${n(1 - m / 100)} = ${eur(answer)}. Adding ${pct(m)} on top of cost instead would be the classic trap — that gives a smaller margin on the final price.`,
            };
        },
    },
    {
        id: "ca-pc-equivalence-number",
        subject: "cost_accounting",
        topic: "product_costing",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting Mock Exam Q25; Mock Exam Q26",
        build: (rng) => {
            const w1 = rng.pick([2, 3, 4]);
            const mult = rng.pick([1.5, 2, 2.5]);
            const w2 = w1 * mult;
            const q1 = rng.int(8, 20) * 100;
            const q2 = rng.int(8, 20) * 100;
            const k = rng.pick([2, 3, 4, 5]);
            const units = q1 + q2 * mult;
            const F = k * units;
            const answer = k * mult;
            return {
                prompt: `A brick works produces the formats Standard (${n(w1)} kg per brick, ${n(q1)} units) and Jumbo (${n(w2)} kg per brick, ${n(q2)} units) in one process. Production overheads of ${eur(F)} are allocated with the **equivalence number method** (German: Äquivalenzziffernkalkulation), using product weight as the basis and Standard as the reference product (equivalence number 1). What are the production overheads per unit of **Jumbo**?`,
                given: {
                    "Weight Standard / Jumbo": `${n(w1)} kg / ${n(w2)} kg`,
                    "Produced Standard / Jumbo": `${n(q1)} / ${n(q2)} units`,
                    "Production overheads": eur(F),
                },
                answer,
                explanation: String.raw`Equivalence numbers scale each product to the reference: $e_{Jumbo} = \frac{w_{Jumbo}}{w_{Standard}}$ = ${n(w2)} / ${n(w1)} = ${n(mult)}. The equivalent units are ${n(q1)} × 1 + ${n(q2)} × ${n(mult)} = ${n(units)}, so the cost per equivalent unit is ${eur(F)} / ${n(units)} = ${eur(k)}. A Jumbo brick carries ${n(mult)} × ${eur(k)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-pc-multistage-process",
        subject: "cost_accounting",
        topic: "product_costing",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2017, Q33",
        build: (rng) => {
            const u1 = rng.int(4, 10);
            const x1 = rng.int(8, 15) * 1000;
            const K1 = u1 * x1;
            const i2 = x1 - rng.int(0, 3) * 500;
            const r = rng.int(2, 8) * 100;
            const o2 = i2 - r;
            const K2 = rng.int(30, 90) * 1000;
            const o3 = o2 - rng.int(0, 4) * 500;
            const K3 = rng.int(10, 40) * 1000;
            const u2 = (K2 + i2 * u1) / o2;
            const answer = (K3 + o3 * u2) / o3;
            return {
                prompt: `A pottery produces ceramic mugs in three stages and applies **multi-stage process costing**. Stage 1 (molding) incurs ${eur(K1)} and outputs ${n(x1)} mugs. Stage 2 (glazing and firing) incurs ${eur(K2)}, takes in ${n(i2)} mugs, loses ${n(r)} mugs as rejects and outputs ${n(o2)} mugs. Stage 3 (packaging) incurs ${eur(K3)} and packs ${n(o3)} mugs. What are the total costs per packed mug after stage 3?`,
                given: {
                    "Stage 1: costs / output": `${eur(K1)} / ${n(x1)} units`,
                    "Stage 2: costs / input / rejects / output": `${eur(K2)} / ${n(i2)} / ${n(r)} / ${n(o2)} units`,
                    "Stage 3: costs / input = output": `${eur(K3)} / ${n(o3)} units`,
                },
                answer,
                explanation: String.raw`Each stage divides its own costs **plus** the cost of the units it takes in by its output: $u_s = \frac{K_s + x_{in} \cdot u_{s-1}}{x_{out}}$. Stage 1: ${eur(K1)} / ${n(x1)} = ${eur(u1)}. Stage 2: (${eur(K2)} + ${n(i2)} × ${eur(u1)}) / ${n(o2)} = ${eur(u2)} — the rejects make the surviving units more expensive. Stage 3: (${eur(K3)} + ${n(o3)} × ${eur(u2)}) / ${n(o3)} = ${eur(answer)} per packed mug.`,
            };
        },
    },

    // ----------------------------------------------------- process costing
    {
        id: "ca-proc-fifo-equivalent-units",
        subject: "cost_accounting",
        topic: "process_costing",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting SS2018 Q26; WS18/19 Q26",
        build: (rng) => {
            const b = rng.int(2, 8) * 1000;
            const cb = rng.pick([0.2, 0.4, 0.6, 0.8]);
            const s = rng.int(20, 50) * 1000;
            const e = rng.int(2, 8) * 1000;
            const ce = rng.pick([0.2, 0.4, 0.6, 0.8]);
            const startedCompleted = s - e;
            const answer = b * (1 - cb) + startedCompleted + e * ce;
            return {
                prompt: `A kayak manufacturer's assembly department starts July with ${n(b)} kayaks in beginning work-in-process inventory, ${pct(cb * 100)} complete with respect to conversion costs. During July, ${n(s)} kayaks are started; ending work-in-process inventory is ${n(e)} kayaks, ${pct(ce * 100)} complete. Conversion costs are added evenly. Under the **FIFO method**, what are the equivalent units of work done in July for conversion costs?`,
                given: {
                    "Beginning WIP": `${n(b)} units, ${pct(cb * 100)} complete`,
                    "Started in July": `${n(s)} units`,
                    "Ending WIP": `${n(e)} units, ${pct(ce * 100)} complete`,
                },
                answer,
                explanation: String.raw`$EU_{FIFO} = x_{begin} \cdot (1 - c_{begin}) + x_{started \& completed} + x_{end} \cdot c_{end}$ — FIFO counts only the work done **this** period. Started and completed: ${n(s)} − ${n(e)} = ${n(startedCompleted)} units. So EU = ${n(b)} × ${n(1 - cb)} + ${n(startedCompleted)} + ${n(e)} × ${n(ce)} = ${n(answer)} equivalent units.`,
            };
        },
    },
    {
        id: "ca-proc-fifo-dm-started-completed",
        subject: "cost_accounting",
        topic: "process_costing",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2018 Q27; WS18/19 Q27",
        build: (rng) => {
            const b = rng.int(2, 8) * 1000;
            const s = rng.int(20, 50) * 1000;
            const e = rng.int(2, 8) * 1000;
            const dmRate = rng.int(20, 60) * 10;
            const D = dmRate * s;
            const startedCompleted = s - e;
            const answer = startedCompleted * dmRate;
            return {
                prompt: `A kayak manufacturer adds all direct materials at the **beginning** of the assembly process. In July, ${n(s)} kayaks are started and direct material costs of ${eur(D)} are added; beginning work-in-process inventory is ${n(b)} kayaks (their material was added last period) and ending work-in-process inventory is ${n(e)} kayaks. Under the **FIFO method**, what direct material costs are assigned to the units **started and completed** in July?`,
                given: {
                    "Started in July": `${n(s)} units`,
                    "Direct material costs added in July": eur(D),
                    "Beginning WIP": `${n(b)} units (materials complete)`,
                    "Ending WIP": `${n(e)} units`,
                },
                answer,
                explanation: String.raw`Because materials enter at the start, every unit **started** this period is complete for materials: $EU_{DM} = x_{started}$ and the cost per equivalent unit is $\frac{K_{DM}}{x_{started}}$ = ${eur(D)} / ${n(s)} = ${eur(dmRate)}. Units started and completed: ${n(s)} − ${n(e)} = ${n(startedCompleted)}, so they carry ${n(startedCompleted)} × ${eur(dmRate)} = ${eur(answer)}. The beginning WIP units get no July material costs under FIFO.`,
            };
        },
    },
    {
        id: "ca-proc-wa-equivalent-units",
        subject: "cost_accounting",
        topic: "process_costing",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting SS2018 Q29; WS18/19 Q29",
        build: (rng) => {
            const b = rng.int(2, 8) * 1000;
            const s = rng.int(20, 50) * 1000;
            const e = rng.int(2, 8) * 1000;
            const ce = rng.pick([0.2, 0.4, 0.6, 0.8]);
            const completed = b + s - e;
            const answer = completed + e * ce;
            return {
                prompt: `A kayak manufacturer's assembly department has ${n(b)} kayaks in beginning work-in-process inventory, starts ${n(s)} kayaks in July and ends with ${n(e)} kayaks in ending work-in-process inventory, ${pct(ce * 100)} complete with respect to conversion costs. Under the **weighted-average method**, what are the equivalent units of work done **to date** for conversion costs?`,
                given: {
                    "Beginning WIP": `${n(b)} units`,
                    "Started in July": `${n(s)} units`,
                    "Ending WIP": `${n(e)} units, ${pct(ce * 100)} complete`,
                },
                answer,
                explanation: String.raw`$EU_{WA} = x_{completed} + x_{end} \cdot c_{end}$ — the weighted-average method counts all work ever done on the units, so the beginning inventory's degree of completion is irrelevant. Completed and transferred out: ${n(b)} + ${n(s)} − ${n(e)} = ${n(completed)} units. EU = ${n(completed)} + ${n(e)} × ${n(ce)} = ${n(answer)} equivalent units.`,
            };
        },
    },
    {
        id: "ca-proc-wa-ending-wip",
        subject: "cost_accounting",
        topic: "process_costing",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2018 Q28; SS2018 Q31; WS18/19 Q31",
        build: (rng) => {
            const e = rng.int(2, 8) * 1000;
            const ce = rng.pick([0.2, 0.4, 0.6, 0.8]);
            const cw = rng.int(20, 70) * 10;
            const answer = e * ce * cw;
            return {
                prompt: `In a kayak manufacturer's assembly department, ending work-in-process inventory is ${n(e)} kayaks, ${pct(ce * 100)} complete with respect to conversion costs. The cost per equivalent unit for conversion costs is ${eur(cw)}. What amount of conversion costs is assigned to the ending work-in-process inventory?`,
                given: {
                    "Ending WIP": `${n(e)} units, ${pct(ce * 100)} complete`,
                    "Conversion cost per equivalent unit": eur(cw),
                },
                answer,
                explanation: String.raw`$K_{end} = x_{end} \cdot c_{end} \cdot k_{EU}$ — ending WIP absorbs conversion costs only for the fraction actually done: ${n(e)} × ${n(ce)} = ${n(e * ce)} equivalent units × ${eur(cw)} = ${eur(answer)}.`,
            };
        },
    },

    // --------------------------------------------- activity-based costing
    {
        id: "ca-abc-plantwide-rate",
        subject: "cost_accounting",
        topic: "activity_based_costing",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS18/19, Q17",
        build: (rng) => {
            const S = rng.int(300, 900) * 1000;
            const I = rng.int(300, 900) * 1000;
            const mh = rng.int(15, 40) * 100;
            const answer = (S + I) / mh;
            return {
                prompt: `Lumen Candle Works budgets manufacturing overheads of ${eur(S)} for setups and ${eur(I)} for quality inspections, and ${n(mh)} machine hours for the year. Under a **traditional costing system** that allocates all manufacturing overheads on machine hours, what is the overhead rate per machine hour?`,
                given: {
                    "Setup overheads": eur(S),
                    "Inspection overheads": eur(I),
                    "Budgeted machine hours": `${n(mh)} h`,
                },
                answer,
                explanation: String.raw`$r = \frac{\text{total manufacturing overheads}}{\text{machine hours}}$ — traditional costing pools everything onto one base: (${eur(S)} + ${eur(I)}) / ${n(mh)} h = ${eur(answer)} per machine hour.`,
            };
        },
    },
    {
        id: "ca-abc-setup-cost-per-unit",
        subject: "cost_accounting",
        topic: "activity_based_costing",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS18/19, Q21",
        build: (rng) => {
            const batch = 5000;
            const nBatches = rng.int(20, 50);
            const q = nBatches * batch;
            const sh = rng.pick([0.5, 1, 1.5, 2]);
            const otherSh = rng.int(40, 120);
            const totalSh = nBatches * sh + otherSh;
            const setupRate = rng.int(2, 9) * 1000;
            const S = setupRate * totalSh;
            const answer = (sh * setupRate) / batch;
            return {
                prompt: `Lumen Candle Works produces its Aroma candle line in batches of ${n(batch)} units and budgets ${n(q)} Aroma candles (${n(nBatches)} batches) for the year. Each Aroma batch requires ${n(sh)} setup hour${sh === 1 ? "" : "s"}. Total budgeted setup costs are ${eur(S)} for ${n(totalSh)} setup hours across all product lines. Under **activity-based costing** with setup hours as the cost driver, what are the setup overheads per Aroma candle?`,
                given: {
                    "Batch size": `${n(batch)} units`,
                    "Aroma output": `${n(q)} units = ${n(nBatches)} batches`,
                    "Setup hours per Aroma batch": `${n(sh)} h`,
                    "Total setup costs / total setup hours": `${eur(S)} / ${n(totalSh)} h`,
                },
                answer,
                explanation: String.raw`$k_{setup} = \frac{\text{setup rate} \cdot \text{setup hours per batch}}{\text{batch size}}$ with $\text{setup rate} = \frac{\text{total setup costs}}{\text{total setup hours}}$ = ${eur(S)} / ${n(totalSh)} h = ${eur(setupRate)} per setup hour. Per batch: ${n(sh)} h × ${eur(setupRate)} = ${eur(sh * setupRate)}; per candle: ${eur(sh * setupRate)} / ${n(batch)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-abc-profit-per-unit",
        subject: "cost_accounting",
        topic: "activity_based_costing",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS18/19, Q22",
        build: (rng) => {
            const batch = 5000;
            const nBatches = rng.int(20, 50);
            const q = nBatches * batch;
            const p = rng.int(10, 16) * 0.5;
            const dm = rng.int(4, 16) * 0.05;
            const dl = rng.int(4, 16) * 0.05;
            const sh = rng.pick([0.5, 1, 1.5, 2]);
            const setupRate = rng.int(10, 30) * 100;
            const otherSh = rng.int(40, 120);
            const totalSh = nBatches * sh + otherSh;
            const S = setupRate * totalSh;
            const ih = rng.int(10, 20);
            const inspRate = rng.int(1, 3) * 100;
            const otherIh = rng.int(500, 2000);
            const totalIh = nBatches * ih + otherIh;
            const I = inspRate * totalIh;
            const ohPerUnit = (sh * setupRate + ih * inspRate) / batch;
            const answer = p - dm - dl - ohPerUnit;
            return {
                prompt: `Lumen Candle Works sells its Deco candle at ${eur(p)} per unit, with direct material of ${eur(dm)} and direct labor of ${eur(dl)} per unit. Deco is made in batches of ${n(batch)} units (${n(nBatches)} batches budgeted, i.e. ${n(q)} units). Each Deco batch needs ${n(sh)} setup hour${sh === 1 ? "" : "s"} and ${n(ih)} inspection hours. Budgeted setup costs are ${eur(S)} for ${n(totalSh)} setup hours in total; budgeted inspection costs are ${eur(I)} for ${n(totalIh)} inspection hours in total. Under **activity-based costing** (cost drivers: setup hours, inspection hours), what is the operating profit per Deco candle?`,
                given: {
                    "Price / direct material / direct labor": `${eur(p)} / ${eur(dm)} / ${eur(dl)} per unit`,
                    "Batch size / Deco batches": `${n(batch)} units / ${n(nBatches)}`,
                    "Per Deco batch: setup / inspection hours": `${n(sh)} h / ${n(ih)} h`,
                    "Setup pool: costs / hours": `${eur(S)} / ${n(totalSh)} h`,
                    "Inspection pool: costs / hours": `${eur(I)} / ${n(totalIh)} h`,
                },
                answer,
                explanation: String.raw`$\pi = p - k_{DM} - k_{DL} - \frac{sh \cdot r_{setup} + ih \cdot r_{insp}}{\text{batch size}}$. The pool rates are ${eur(S)} / ${n(totalSh)} h = ${eur(setupRate)} per setup hour and ${eur(I)} / ${n(totalIh)} h = ${eur(inspRate)} per inspection hour. Overheads per batch: ${n(sh)} × ${eur(setupRate)} + ${n(ih)} × ${eur(inspRate)} = ${eur(sh * setupRate + ih * inspRate)}, i.e. ${eur(ohPerUnit)} per candle. Profit per candle: ${eur(p)} − ${eur(dm)} − ${eur(dl)} − ${eur(ohPerUnit)} = ${eur(answer)}.`,
            };
        },
    },

    // --------------------------------------------------- income statements
    {
        id: "ca-pl-noe-absorption-profit",
        subject: "cost_accounting",
        topic: "income_statements",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting SS2015 Q30; WS16/17 Q29",
        build: (rng) => {
            const m1 = rng.int(20, 60);
            const m2 = rng.int(20, 60);
            const q1p = rng.int(8, 15) * 1000;
            const q2p = rng.int(8, 15) * 1000;
            const d1 = rng.int(1, 3) * 1000; // product 1: inventory decrease
            const i2 = rng.int(1, 4) * 1000; // product 2: inventory increase
            const s1 = q1p + d1;
            const s2 = q2p - i2;
            const p1 = m1 + rng.int(10, 40);
            const p2 = m2 + rng.int(10, 40);
            const G = rng.int(20, 60) * 10000;
            const M1 = m1 * q1p;
            const M2 = m2 * q2p;
            const revenue = p1 * s1 + p2 * s2;
            const answer = revenue - M1 - M2 - G + i2 * m2 - d1 * m1;
            return {
                prompt: `Cargoline builds bike trailers. The City trailer sells at ${eur(p1)}: ${n(q1p)} units are produced and ${n(s1)} are sold (the difference comes from opening stock, valued at the same unit manufacturing cost). The Cargo trailer sells at ${eur(p2)}: ${n(q2p)} units are produced and ${n(s2)} are sold. Full manufacturing costs of the quantity produced are ${eur(M1)} for City (${eur(m1)} per unit) and ${eur(M2)} for Cargo (${eur(m2)} per unit). Administration and selling costs of the period are ${eur(G)}. What is the profit according to the **nature of expense method under absorption costing** (Gesamtkostenverfahren)?`,
                given: {
                    "Price City / Cargo": `${eur(p1)} / ${eur(p2)}`,
                    "Produced City / Cargo": `${n(q1p)} / ${n(q2p)} units`,
                    "Sold City / Cargo": `${n(s1)} / ${n(s2)} units`,
                    "Manufacturing costs of production (City / Cargo)": `${eur(M1)} / ${eur(M2)}`,
                    "Unit manufacturing costs (City / Cargo)": `${eur(m1)} / ${eur(m2)}`,
                    "Administration and selling costs": eur(G),
                },
                answer,
                explanation: String.raw`$\pi = \text{revenues} + \Delta \text{inventory increase} - \Delta \text{inventory decrease} - \text{total costs of the period}$, with inventory changes valued at full manufacturing costs. Revenues: ${n(s1)} × ${eur(p1)} + ${n(s2)} × ${eur(p2)} = ${eur(revenue)}. Total costs: ${eur(M1)} + ${eur(M2)} + ${eur(G)}. The Cargo build-up adds ${n(i2)} × ${eur(m2)} = ${eur(i2 * m2)}; the City draw-down subtracts ${n(d1)} × ${eur(m1)} = ${eur(d1 * m1)}. Profit: ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-pl-cos-variable-profit",
        subject: "cost_accounting",
        topic: "income_statements",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS16/17 Q32; WS17/18 Q29; Mock Exam Q30",
        build: (rng) => {
            const v1 = rng.int(10, 40);
            const v2 = rng.int(15, 60);
            const p1 = v1 + rng.int(5, 25);
            const p2 = v2 + rng.int(5, 25);
            const s1 = rng.int(4, 12) * 100;
            const s2 = rng.int(4, 12) * 100;
            const F = rng.int(5, 30) * 1000;
            const answer = (p1 - v1) * s1 + (p2 - v2) * s2 - F;
            return {
                prompt: `Cargoline sells ${n(s1)} City trailers (price ${eur(p1)}, variable costs ${eur(v1)} per unit) and ${n(s2)} Cargo trailers (price ${eur(p2)}, variable costs ${eur(v2)} per unit). Total fixed costs of the period are ${eur(F)}. What is the profit according to the **cost-of-sales method under variable costing** (Umsatzkostenverfahren)?`,
                given: {
                    "Price City / Cargo": `${eur(p1)} / ${eur(p2)}`,
                    "Variable costs City / Cargo": `${eur(v1)} / ${eur(v2)} per unit`,
                    "Sold City / Cargo": `${n(s1)} / ${n(s2)} units`,
                    "Fixed costs of the period": eur(F),
                },
                answer,
                explanation: String.raw`$\pi = \sum_i (p_i - k_{var,i}) \cdot x_i - K_{fix}$ — under variable costing all fixed costs are period costs, and only the **sold** quantity matters. Contribution margins: ${n(s1)} × (${eur(p1)} − ${eur(v1)}) = ${eur((p1 - v1) * s1)} and ${n(s2)} × (${eur(p2)} − ${eur(v2)}) = ${eur((p2 - v2) * s2)}. Profit: ${eur((p1 - v1) * s1)} + ${eur((p2 - v2) * s2)} − ${eur(F)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-pl-inventory-decrease-value",
        subject: "cost_accounting",
        topic: "income_statements",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS17/18, Q30",
        build: (rng) => {
            const m1 = rng.int(4, 12);
            const m2 = rng.int(6, 15);
            const dec1 = rng.int(2, 8) * 100;
            const dec2 = rng.int(2, 8) * 100;
            const answer = dec1 * m1 + dec2 * m2;
            return {
                prompt: `Cargoline's inventory of the City trailer falls by ${n(dec1)} units and its inventory of the Cargo trailer falls by ${n(dec2)} units during the period. Full manufacturing costs are ${eur(m1)} per City and ${eur(m2)} per Cargo trailer. What is the value of the total inventory decrease in the income statement under the **nature of expense method under absorption costing**?`,
                given: {
                    "Inventory decrease City / Cargo": `${n(dec1)} / ${n(dec2)} units`,
                    "Full manufacturing costs City / Cargo": `${eur(m1)} / ${eur(m2)} per unit`,
                },
                answer,
                explanation: String.raw`$\Delta = \sum_i \Delta x_i \cdot k_{mfg,i}$ — under absorption costing, inventory changes are valued at **full manufacturing costs**: ${n(dec1)} × ${eur(m1)} + ${n(dec2)} × ${eur(m2)} = ${eur(answer)}. Administration and selling costs never enter inventory values.`,
            };
        },
    },

    // ----------------------------------------------------------------- CVP
    {
        id: "ca-cvp-breakeven-quantity",
        subject: "cost_accounting",
        topic: "cvp",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting WS16/17 Q33; SS2017 Q34; Mock Exam Q16",
        build: (rng) => {
            const a = rng.int(2, 8);
            const b = rng.int(2, 8);
            const c = rng.int(1, 4);
            const cm = rng.int(4, 20);
            const p = a + b + c + cm;
            const qStar = rng.int(5, 40) * 100;
            const F = qStar * cm;
            return {
                prompt: `Lakeside Outfitters sells camping stoves at ${eur(p)} each. Variable costs per stove: ${eur(a)} material, ${eur(b)} production, ${eur(c)} selling and shipping. Yearly fixed costs are ${eur(F)}. What is the break-even quantity?`,
                given: {
                    "Price": eur(p),
                    "Variable material / production / selling costs": `${eur(a)} / ${eur(b)} / ${eur(c)} per unit`,
                    "Fixed costs": eur(F),
                },
                answer: qStar,
                explanation: String.raw`$x_{BE} = \frac{K_{fix}}{p - k_{var}}$ — the contribution margin per stove is ${eur(p)} − ${eur(a)} − ${eur(b)} − ${eur(c)} = ${eur(cm)}, so the break-even quantity is ${eur(F)} / ${eur(cm)} = ${n(qStar)} units.`,
            };
        },
    },
    {
        id: "ca-cvp-breakeven-revenue",
        subject: "cost_accounting",
        topic: "cvp",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS16/17 Q34; SS2017 Q35; WS17/18 Q34; SS2018 Q17; Mock Exam Q17",
        build: (rng) => {
            const a = rng.int(4, 15);
            const b = rng.int(3, 12);
            const cm = rng.int(5, 25);
            const p = a + b + cm;
            const qStar = rng.int(5, 40) * 100;
            const F = qStar * cm;
            const answer = qStar * p;
            return {
                prompt: `Lakeside Outfitters sells camping lanterns at ${eur(p)} each with variable costs of ${eur(a + b)} per unit (${eur(a)} material, ${eur(b)} production and selling). Yearly fixed costs are ${eur(F)}. What is the break-even **revenue**?`,
                given: {
                    "Price": eur(p),
                    "Variable costs": `${eur(a + b)} per unit`,
                    "Fixed costs": eur(F),
                },
                answer,
                explanation: String.raw`$R_{BE} = x_{BE} \cdot p = \frac{K_{fix}}{p - k_{var}} \cdot p$. The contribution margin is ${eur(p)} − ${eur(a + b)} = ${eur(cm)}, so $x_{BE}$ = ${eur(F)} / ${eur(cm)} = ${n(qStar)} units and the break-even revenue is ${n(qStar)} × ${eur(p)} = ${eur(answer)}.`,
            };
        },
    },
    {
        id: "ca-cvp-after-tax-target",
        subject: "cost_accounting",
        topic: "cvp",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting SS2017 Q37; SS2018 Q20",
        build: (rng) => {
            const cm = rng.pick([10, 20, 25, 50]);
            const v = rng.int(10, 60);
            const p = v + cm;
            const F = rng.int(2, 8) * 10000;
            const pre = rng.int(5, 20) * 10000;
            const tau = rng.pick([20, 25, 40]);
            const T = pre * (1 - tau / 100);
            const answer = (F + pre) / cm;
            return {
                prompt: `Lakeside Outfitters sells cook sets at ${eur(p)} each with variable costs of ${eur(v)} per unit and yearly fixed costs of ${eur(F)}. The profit tax rate is ${pct(tau)}. How many cook sets must be sold to earn an **after-tax** profit of ${eur(T)}?`,
                given: {
                    "Price / variable costs": `${eur(p)} / ${eur(v)} per unit`,
                    "Fixed costs": eur(F),
                    "Tax rate": pct(tau),
                    "Target profit after tax": eur(T),
                },
                answer,
                explanation: String.raw`$x = \frac{K_{fix} + \frac{\pi_{target}}{1 - \tau}}{p - k_{var}}$ — the after-tax target must first be grossed up to a pre-tax profit: ${eur(T)} / ${n(1 - tau / 100)} = ${eur(pre)}. Then x = (${eur(F)} + ${eur(pre)}) / ${eur(cm)} = ${n(answer)} units.`,
            };
        },
    },
    {
        id: "ca-cvp-target-ros",
        subject: "cost_accounting",
        topic: "cvp",
        difficulty: "hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting WS16/17 Q35; WS17/18 Q36; Mock Exam Q18",
        build: (rng) => {
            const p = rng.int(8, 15) * 10;
            const cm = p * rng.pick([0.4, 0.5, 0.6]);
            const v = p - cm;
            const F = rng.int(10, 50) * 1000;
            const tau = rng.pick([20, 25, 37]);
            const r = rng.pick([10, 15]);
            const denom = cm - ((r / 100) / (1 - tau / 100)) * p;
            const answer = Math.ceil(F / denom);
            return {
                prompt: `Lakeside Outfitters sells trekking tents at ${eur(p)} each with variable costs of ${eur(v)} per unit and yearly fixed costs of ${eur(F)}. The profit tax rate is ${pct(tau)}. What is the minimum whole number of tents that must be produced and sold to achieve an **after-tax return on sales** of at least ${pct(r)}?`,
                given: {
                    "Price / variable costs": `${eur(p)} / ${eur(v)} per unit`,
                    "Fixed costs": eur(F),
                    "Tax rate": pct(tau),
                    "Target after-tax return on sales": pct(r),
                },
                answer,
                explanation: String.raw`The condition is $(cm \cdot x - K_{fix}) \cdot (1 - \tau) \geq s \cdot p \cdot x$, which solves to $x \geq \frac{K_{fix}}{cm - \frac{s}{1-\tau} \cdot p}$. The contribution margin is ${eur(cm)}; the denominator is ${eur(cm)} − (${n(r / 100)} / ${n(1 - tau / 100)}) × ${eur(p)} = ${eur(denom)}. So x ≥ ${eur(F)} / ${eur(denom)} = ${n2(F / denom)}, i.e. at least ${n(answer)} tents.`,
            };
        },
    },
    {
        id: "ca-cvp-margin-of-safety",
        subject: "cost_accounting",
        topic: "cvp",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM Cost Accounting SS2018, Q22",
        build: (rng) => {
            const cm = rng.int(5, 20);
            const v = rng.int(5, 30);
            const p = v + cm;
            const qStar = rng.int(5, 30) * 100;
            const F = qStar * cm;
            const factor = rng.pick([1.25, 1.5, 2, 3]);
            const q = qStar * factor;
            const answer = ((q - qStar) / q) * 100;
            return {
                prompt: `Lakeside Outfitters sells ${n(q)} insulated bottles at ${eur(p)} each. Variable costs are ${eur(v)} per bottle and fixed costs are ${eur(F)}. What is the **margin of safety percentage** at this sales volume?`,
                given: {
                    "Price / variable costs": `${eur(p)} / ${eur(v)} per unit`,
                    "Fixed costs": eur(F),
                    "Sales volume": `${n(q)} units`,
                },
                answer,
                explanation: String.raw`$MoS\% = \frac{x - x_{BE}}{x}$ — the share of current sales that can be lost before hitting break-even. With cm = ${eur(cm)}, $x_{BE}$ = ${eur(F)} / ${eur(cm)} = ${n(qStar)} units, so MoS = (${n(q)} − ${n(qStar)}) / ${n(q)} = ${pct(answer)}.`,
            };
        },
    },
    {
        id: "ca-cvp-sales-mix-target",
        subject: "cost_accounting",
        topic: "cvp",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting SS2017 Q39; WS17/18 Q37; SS2018 Q23",
        build: (rng) => {
            const k = rng.int(2, 4);
            const cmA = rng.int(3, 10);
            const cmB = rng.int(8, 25);
            const bcm = k * cmA + cmB;
            const bundles = rng.int(5, 40) * 100;
            const total = bundles * bcm;
            const F = Math.round((total * 0.3) / 1000) * 1000;
            const T = total - F;
            const answer = k * bundles;
            return {
                prompt: `Lakeside Outfitters sells gas cartridges (contribution margin ${eur(cmA)} per unit) and camping stoves (contribution margin ${eur(cmB)} per unit) in a constant sales mix of ${n(k)} cartridges per stove. Total fixed costs are ${eur(F)} and the target profit is ${eur(T)}. How many **gas cartridges** are sold when the target is exactly reached?`,
                given: {
                    "Contribution margin cartridge / stove": `${eur(cmA)} / ${eur(cmB)}`,
                    "Sales mix": `${n(k)} cartridges : 1 stove`,
                    "Fixed costs": eur(F),
                    "Target profit": eur(T),
                },
                answer,
                explanation: String.raw`Form a bundle of ${n(k)} cartridges + 1 stove: $cm_{bundle} = k \cdot cm_A + cm_B$ = ${n(k)} × ${eur(cmA)} + ${eur(cmB)} = ${eur(bcm)}. Required bundles: $\frac{K_{fix} + \pi_{target}}{cm_{bundle}}$ = (${eur(F)} + ${eur(T)}) / ${eur(bcm)} = ${n(bundles)}. That corresponds to ${n(k)} × ${n(bundles)} = ${n(answer)} cartridges.`,
            };
        },
    },

    // -------------------------------------------------- production program
    {
        id: "ca-prog-relative-cm",
        subject: "cost_accounting",
        topic: "production_program",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting Mock Exam, Q22",
        build: (rng) => {
            const v = rng.int(10, 40);
            const cm = rng.int(5, 25);
            const p = v + cm;
            const m = rng.pick([10, 12, 15, 20, 30]);
            const answer = (cm / m) * 60;
            return {
                prompt: `A workshop desk sells at ${eur(p)} with variable costs of ${eur(v)} per unit and occupies the CNC machine — the bottleneck — for ${n(m)} minutes per unit. What is the **relative contribution margin** of the desk per machine hour?`,
                given: {
                    "Price / variable costs": `${eur(p)} / ${eur(v)} per unit`,
                    "Machine time": `${n(m)} min per unit`,
                },
                answer,
                explanation: String.raw`$cm_{rel} = \frac{p - k_{var}}{\text{capacity required}}$ — contribution margin per unit of the scarce resource. Per unit: ${eur(p)} − ${eur(v)} = ${eur(cm)} over ${n(m)} min, i.e. ${eur(cm)} / ${n(m)} × 60 = ${eur(answer)} per machine hour. Ranking by relative contribution margin decides the production program under one binding constraint.`,
            };
        },
    },
    {
        id: "ca-prog-optimal-quantity",
        subject: "cost_accounting",
        topic: "production_program",
        difficulty: "hard",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting WS16/17 Q38; WS16/17 Q39; Mock Exam Q20; Mock Exam Q21",
        build: (rng) => {
            const tA = rng.pick([0.1, 0.2]);
            const tB = rng.pick([0.25, 0.5]);
            const cmA = tA * rng.int(30, 60);
            const cmB = tB * rng.int(10, 25);
            const maxA = rng.int(2, 6) * 1000;
            const partB = rng.int(2, 8) * 100;
            const H = tA * maxA + tB * partB;
            const maxB = partB + rng.int(2, 6) * 100;
            return {
                prompt: `A furniture maker produces desks and shelves on one CNC machine with a yearly capacity of ${n(H)} hours. A desk takes ${n(tA)} hours and earns a contribution margin of ${eur(cmA)}; a shelf takes ${n(tB)} hours and earns ${eur(cmB)}. Maximum yearly sales are ${n(maxA)} desks and ${n(maxB)} shelves. Fixed costs are incurred either way. How many **shelves** are produced in the profit-maximizing production program?`,
                given: {
                    "Machine capacity": `${n(H)} hours`,
                    "Machine time desk / shelf": `${n(tA)} / ${n(tB)} h per unit`,
                    "Contribution margin desk / shelf": `${eur(cmA)} / ${eur(cmB)}`,
                    "Max sales desk / shelf": `${n(maxA)} / ${n(maxB)} units`,
                },
                answer: partB,
                explanation: String.raw`With one binding constraint, rank by $cm_{rel} = \frac{cm}{t}$: desks earn ${eur(cmA / tA)} per hour, shelves ${eur(cmB / tB)} per hour — desks first. Desks use ${n(maxA)} × ${n(tA)} = ${n(tA * maxA)} h, leaving ${n(H)} − ${n(tA * maxA)} = ${n(H - tA * maxA)} h. That funds ${n(H - tA * maxA)} / ${n(tB)} = ${n(partB)} shelves (below their sales cap of ${n(maxB)}).`,
            };
        },
    },
    {
        id: "ca-prog-outsourcing-threshold",
        subject: "cost_accounting",
        topic: "production_program",
        difficulty: "medium",
        kind: "numeric",
        unit: "units",
        source: "TUM Cost Accounting SS2017 Q38; Mock Exam Q19",
        build: (rng) => {
            const vs = rng.pick([0.5, 1, 2, 2.5]);
            const q = rng.int(5, 40) * 100;
            const F = q * vs;
            return {
                prompt: `A stationery producer currently pays variable selling costs of ${eur(vs)} per notebook sold. A distribution partner offers to take over all selling activities for a fixed fee of ${eur(F)} per year, eliminating the variable selling costs entirely. From what yearly sales volume onward is the outsourcing offer worthwhile?`,
                given: {
                    "Variable selling costs (in-house)": `${eur(vs)} per unit`,
                    "Fixed fee of the partner": `${eur(F)} per year`,
                },
                answer: q,
                explanation: String.raw`At the indifference volume the saved variable costs equal the new fixed fee: $x \cdot k_{var,sell} = F$, so $x = \frac{F}{k_{var,sell}}$ = ${eur(F)} / ${eur(vs)} = ${n(q)} notebooks. Above ${n(q)} units the fixed fee is cheaper than the variable costs it replaces.`,
            };
        },
    },
    {
        id: "ca-prog-price-floor",
        subject: "cost_accounting",
        topic: "production_program",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM Cost Accounting WS16/17, Q40",
        build: (rng) => {
            const tX = rng.pick([30, 40]);
            const tY = 2 * tX;
            const Q = rng.int(10, 25) * 100;
            const qY = Q - rng.int(2, 8) * 100;
            const dX = 2 * (Q - qY);
            const qX = dX + rng.int(5, 15) * 100;
            const cmY = rng.int(20, 60);
            const cmX = Math.ceil(cmY / 2) + rng.int(5, 40);
            const vO = rng.int(40, 90);
            const opp = qY * cmY + dX * cmX;
            const answer = vO + opp / Q;
            return {
                prompt: `A furniture maker's CNC machine is **fully utilized** producing ${n(qX)} desks (${n(tX)} min each, contribution margin ${eur(cmX)}) and ${n(qY)} shelves (${n(tY)} min each, contribution margin ${eur(cmY)}). A retailer asks it to produce ${n(Q)} sideboards, each taking ${n(tY)} min on the machine and causing variable costs of ${eur(vO)}. Own production must be displaced to free capacity. What is the **lower price limit** per sideboard at which the order is worth accepting?`,
                given: {
                    "Current program": `${n(qX)} desks (${n(tX)} min, cm ${eur(cmX)}), ${n(qY)} shelves (${n(tY)} min, cm ${eur(cmY)})`,
                    "Order": `${n(Q)} sideboards, ${n(tY)} min each`,
                    "Variable costs per sideboard": eur(vO),
                    "Capacity": "fully utilized",
                },
                answer,
                explanation: String.raw`$p_{min} = k_{var} + \frac{\text{forgone contribution margins}}{\text{order quantity}}$ — displace the product with the **lowest relative contribution margin** first. Shelves earn ${eur((cmY / tY) * 60)} per hour vs. ${eur((cmX / tX) * 60)} for desks, so all ${n(qY)} shelves go (freeing ${n(qY)} × ${n(tY)} min), and the remaining time comes from ${n(dX)} desks. Opportunity costs: ${n(qY)} × ${eur(cmY)} + ${n(dX)} × ${eur(cmX)} = ${eur(opp)}, i.e. ${eur(opp / Q)} per sideboard. Lower price limit: ${eur(vO)} + ${eur(opp / Q)} = ${eur(answer)}.`,
            };
        },
    },
];
