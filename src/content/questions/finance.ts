import type { NumericQuestion } from "@/lib/questions/types";
import { eur, n, n2, pct, normCdf, npv, irr, macaulayDuration } from "./_helpers";

/**
 * Investment & Financial Management.
 * Every question builds its prompt AND its answer from the same seeded draw,
 * so the numbers a student reads are always the numbers that are graded.
 */
export const financeQuestions: NumericQuestion[] = [
    // ---------------------------------------------------------------- interest
    {
        id: "fin-int-simple",
        subject: "finance",
        topic: "interest",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C0 = rng.int(10, 100) * 100;
            const r = rng.int(1, 9);
            const N = rng.int(2, 8);
            const answer = C0 * (1 + N * (r / 100));
            return {
                prompt: `You invest ${eur(C0)} for ${N} years at ${pct(r)} p.a. The interest is **not** itself reinvested (simple interest). What amount do you receive at the end?`,
                given: { "Initial capital $C_0$": eur(C0), "Interest rate r": pct(r), "Term N": `${N} years` },
                answer,
                explanation: String.raw`$C_N = C_0 \cdot (1 + N \cdot i)$ - simple interest earns $N \cdot i$ on the initial capital: ${eur(C0)} · (1 + ${N} · ${n(r / 100)}) = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-int-compound",
        subject: "finance",
        topic: "interest",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C0 = rng.int(10, 120) * 100;
            const r = rng.int(2, 9);
            const N = rng.int(3, 15);
            const answer = C0 * (1 + r / 100) ** N;
            return {
                prompt: `${eur(C0)} earns ${pct(r)} p.a. for ${N} years, with the interest **reinvested each year (compound interest)**. What is the final capital?`,
                given: { "Initial capital $C_0$": eur(C0), "Interest rate r": pct(r), "Term N": `${N} years` },
                answer,
                explanation: String.raw`$C_N = C_0 \cdot q^N$ with $q = 1 + i = ${n(1 + r / 100)}$ and $q^{${N}} = ${n2((1 + r / 100) ** N)}$: ${eur(C0)} · ${n2((1 + r / 100) ** N)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-int-continuous",
        subject: "finance",
        topic: "interest",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C0 = rng.int(20, 150) * 100;
            const r = rng.int(2, 8);
            const N = rng.int(2, 10);
            const answer = C0 * Math.exp((r / 100) * N);
            return {
                prompt: `${eur(C0)} is compounded **continuously** at ${pct(r)} p.a. for ${N} years. What is the final capital?`,
                given: { "$C_0$": eur(C0), "r (continuous)": pct(r), "N": `${N} years` },
                answer,
                explanation: String.raw`$C_N = C_0 \cdot e^{i \cdot N}$ with $e^{${n(r / 100)} \cdot ${N}} = ${n2(Math.exp((r / 100) * N))}$: ${eur(C0)} · ${n2(Math.exp((r / 100) * N))} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-int-effective",
        subject: "finance",
        topic: "interest",
        difficulty: "medium",
        kind: "numeric",
        unit: "percent",
        build: (rng) => {
            const r = rng.int(3, 12);
            const m = rng.pick([2, 4, 12]);
            const answer = ((1 + r / 100 / m) ** m - 1) * 100;
            const label = m === 2 ? "semi-annually" : m === 4 ? "quarterly" : "monthly";
            return {
                prompt: `A nominal rate of ${pct(r)} p.a. is compounded ${label} (m = ${m}). What is the **effective** annual rate?`,
                given: { "Nominal rate r": pct(r), "Periods m": String(m) },
                answer,
                explanation: String.raw`$i_{eff} = \left(1 + \frac{i_{nom}}{m}\right)^{m} - 1 = \left(1 + \frac{${n(r / 100)}}{${m}}\right)^{${m}} - 1$ = ${pct(answer)}`,
            };
        },
    },

    // --------------------------------------------------------------- annuities
    {
        id: "fin-ann-fv-immediate",
        subject: "finance",
        topic: "annuities",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(1, 12) * 100;
            const r = rng.int(2, 8);
            const N = rng.int(4, 15);
            const q = 1 + r / 100;
            const answer = C * ((q ** N - 1) / (q - 1));
            return {
                prompt: `For ${N} years you pay ${eur(C)} into an account earning ${pct(r)} p.a., **at the end of each year**. What is the future value?`,
                given: { "Payment C": eur(C), "Interest rate r": pct(r), "Number of payments N": String(N) },
                answer,
                explanation: String.raw`$FV = C \cdot \frac{q^N - 1}{q - 1}$ (future-value annuity factor) with $q = ${n(q)}$: the factor is ${n2((q ** N - 1) / (q - 1))}, so FV = ${eur(C)} · ${n2((q ** N - 1) / (q - 1))} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ann-pv-due",
        subject: "finance",
        topic: "annuities",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(2, 15) * 100;
            const r = rng.int(2, 8);
            const N = rng.int(4, 14);
            const q = 1 + r / 100;
            const answer = C * ((q ** N - 1) / (q ** N * (q - 1))) * q;
            return {
                prompt: `An annuity of ${eur(C)} is paid for ${N} years, **at the beginning of each year** (annuity due). The discount rate is ${pct(r)}. What is the present value?`,
                given: { "Payment C": eur(C), "r": pct(r), "N": String(N), "Payment timing": "annuity due (in advance)" },
                answer,
                explanation: String.raw`$PV_{due} = C \cdot \frac{q^N - 1}{q^N (q - 1)} \cdot q$ - the ordinary-annuity PV factor times $q$, because every payment arrives one year earlier. With $q = ${n(q)}$ the factor is ${n2(((q ** N - 1) / (q ** N * (q - 1))) * q)}, so PV = ${eur(C)} · ${n2(((q ** N - 1) / (q ** N * (q - 1))) * q)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ann-perpetuity",
        subject: "finance",
        topic: "annuities",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(2, 20) * 100;
            const r = rng.int(3, 9);
            const answer = C / (r / 100);
            return {
                prompt: `A **perpetuity** pays ${eur(C)} per year in arrears. The discount rate is ${pct(r)}. What is the present value?`,
                given: { "Payment C": eur(C), "r": pct(r) },
                answer,
                explanation: String.raw`$PV = \frac{C}{i}$ = ${eur(C)} / ${n(r / 100)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ann-growing-perpetuity",
        subject: "finance",
        topic: "annuities",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(2, 20) * 100;
            const g = rng.int(1, 4);
            const r = g + rng.int(2, 6);
            const answer = C / ((r - g) / 100);
            return {
                prompt: `A perpetuity starts next year at ${eur(C)} and grows at ${pct(g)} p.a. thereafter. The discount rate is ${pct(r)}. What is the present value?`,
                given: { "$C_1$": eur(C), "Growth rate w": pct(g), "r": pct(r) },
                answer,
                explanation: String.raw`Growing perpetuity: $PV = \frac{C_1}{i - w}$ = ${eur(C)} / (${n(r / 100)} − ${n(g / 100)}) = ${eur(answer)}`,
            };
        },
    },

    // --------------------------------------------------------------- repayment
    {
        id: "fin-rep-annuity",
        subject: "finance",
        topic: "repayment",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const D0 = rng.int(50, 400) * 1000;
            const r = rng.int(2, 8);
            const N = rng.int(5, 25);
            const q = 1 + r / 100;
            const answer = D0 * ((q ** N * (q - 1)) / (q ** N - 1));
            return {
                prompt: `An annuity loan of ${eur(D0)} runs for ${N} years at ${pct(r)} p.a. What is the **annual annuity payment**?`,
                given: { "Loan $D_0$": eur(D0), "Interest rate r": pct(r), "Term N": `${N} years` },
                answer,
                explanation: String.raw`$A = D_0 \cdot \frac{q^N (q - 1)}{q^N - 1}$ (capital-recovery factor) with $q = ${n(q)}$: the factor is ${n2((q ** N * (q - 1)) / (q ** N - 1))}, so A = ${eur(D0)} · ${n2((q ** N * (q - 1)) / (q ** N - 1))} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-rep-remaining",
        subject: "finance",
        topic: "repayment",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const D0 = rng.int(50, 300) * 1000;
            const r = rng.int(2, 7);
            const N = rng.int(10, 25);
            const k = rng.int(2, N - 2);
            const q = 1 + r / 100;
            const answer = D0 * ((q ** N - q ** k) / (q ** N - 1));
            return {
                prompt: `An annuity loan of ${eur(D0)} (${pct(r)}, ${N} years) has been running for ${k} years. What is the **outstanding balance after ${k} years**?`,
                given: { "$D_0$": eur(D0), "r": pct(r), "N": `${N} years`, "k": `${k} years` },
                answer,
                explanation: String.raw`$D_k = D_0 \cdot \frac{q^N - q^k}{q^N - 1}$ with $q = ${n(q)}$: the remaining-balance factor is ${n2((q ** N - q ** k) / (q ** N - 1))}, so $D_{${k}}$ = ${eur(D0)} · ${n2((q ** N - q ** k) / (q ** N - 1))} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-rep-installment",
        subject: "finance",
        topic: "repayment",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const D0 = rng.int(60, 300) * 1000;
            const r = rng.int(2, 8);
            const N = rng.int(5, 20);
            const k = rng.int(1, N);
            const repay = D0 / N;
            const interest = (D0 - repay * (k - 1)) * (r / 100);
            const answer = repay + interest;
            return {
                prompt: `An **installment loan** of ${eur(D0)} is repaid in ${N} equal principal repayments at an interest rate of ${pct(r)}. What is the total payment (principal repayment + interest) in year ${k}?`,
                given: { "$D_0$": eur(D0), "r": pct(r), "N": String(N), "Year k": String(k) },
                answer,
                explanation: String.raw`Constant principal repayment: $\frac{D_0}{N}$ = ${eur(repay)}. Interest in year ${k} on the opening balance: $D_{k-1} \cdot i = \left(D_0 - (k - 1) \cdot \frac{D_0}{N}\right) \cdot i$ = ${eur(interest)}. Total payment = ${eur(repay)} + ${eur(interest)} = ${eur(answer)}`,
            };
        },
    },

    // ------------------------------------------------------------------- bonds
    {
        id: "fin-bond-zero",
        subject: "finance",
        topic: "bonds",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const BN = rng.pick([1000, 5000, 10000]);
            const r = rng.int(1, 8);
            const N = rng.int(2, 20);
            const answer = BN / (1 + r / 100) ** N;
            return {
                prompt: `A zero-coupon bond with a face value of ${eur(BN)} is redeemed in ${N} years. The market rate is ${pct(r)}. What is its price today?`,
                given: { "Face value": eur(BN), "Market rate r": pct(r), "Remaining term N": `${N} years` },
                answer,
                explanation: String.raw`$B_0 = \frac{B_N}{(1 + i)^N}$ with $(1 + i)^{${N}} = ${n2((1 + r / 100) ** N)}$: ${eur(BN)} / ${n2((1 + r / 100) ** N)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-bond-coupon",
        subject: "finance",
        topic: "bonds",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const BN = 1000;
            const couponRate = rng.int(1, 8);
            const C = BN * (couponRate / 100);
            const r = rng.int(1, 9);
            const N = rng.int(3, 15);
            const { price } = macaulayDuration(C, BN, r / 100, N);
            return {
                prompt: `A bond (face value ${eur(BN)}, coupon ${pct(couponRate)}, remaining term ${N} years) is discounted in the market at ${pct(r)}. What is its fair price?`,
                given: { "Face value": eur(BN), "Coupon p.a.": eur(C), "Market rate r": pct(r), "N": `${N} years` },
                answer: price,
                explanation: String.raw`$B_0 = \sum_{t=1}^{N} \frac{C}{(1+i)^t} + \frac{B_N}{(1+i)^N}$ - each coupon of ${eur(C)} and the redemption of ${eur(BN)} discounted at ${pct(r)}: $B_0$ = ${eur(price)}`,
            };
        },
    },
    {
        id: "fin-bond-duration",
        subject: "finance",
        topic: "bonds",
        difficulty: "hard",
        kind: "numeric",
        unit: "years",
        build: (rng) => {
            const BN = 1000;
            const couponRate = rng.int(2, 8);
            const C = BN * (couponRate / 100);
            const r = rng.int(2, 8);
            const N = rng.int(3, 10);
            const { duration } = macaulayDuration(C, BN, r / 100, N);
            return {
                prompt: `Compute the **Macaulay duration** of a bond: face value ${eur(BN)}, coupon ${pct(couponRate)}, remaining term ${N} years, market rate ${pct(r)}.`,
                given: { "Face value": eur(BN), "Coupon": eur(C), "r": pct(r), "N": `${N} years` },
                answer: duration,
                explanation: String.raw`$D = \frac{\sum_t t \cdot \frac{CF_t}{(1+i)^t}}{\sum_t \frac{CF_t}{(1+i)^t}}$ - the present-value-weighted average time until the cash flows arrive: D = ${n2(duration)} years`,
            };
        },
    },
    {
        id: "fin-bond-modified-duration",
        subject: "finance",
        topic: "bonds",
        difficulty: "medium",
        kind: "numeric",
        unit: "percent",
        build: (rng) => {
            const BN = 1000;
            const couponRate = rng.int(2, 7);
            const C = BN * (couponRate / 100);
            const r = rng.int(2, 8);
            const N = rng.int(4, 12);
            const dr = rng.pick([25, 50, 75, 100]); // basis points
            const { duration } = macaulayDuration(C, BN, r / 100, N);
            const dMod = duration / (1 + r / 100);
            const answer = -dMod * (dr / 10000) * 100;
            return {
                prompt: `A bond (coupon ${pct(couponRate)}, ${N} years remaining term, market rate ${pct(r)}) has a Macaulay duration of ${n2(duration)} years. By approximately what **percentage** does its price change if the market rate **rises** by ${dr} basis points?`,
                given: { "Duration D": `${n2(duration)} years`, "r": pct(r), "$Δi$": `+${dr} bp` },
                answer,
                explanation: String.raw`$D_{mod} = \frac{D}{1 + i}$ = ${n2(dMod)}; price reaction: $\frac{\Delta B}{B} \approx -D_{mod} \cdot \Delta i$ = −${n2(dMod)} · ${pct(dr / 100)} = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-bond-forward",
        subject: "finance",
        topic: "bonds",
        difficulty: "hard",
        kind: "numeric",
        unit: "percent",
        build: (rng) => {
            const S = rng.int(1, 3);
            const T = S + rng.int(1, 4);
            const iS = rng.int(1, 5);
            const iT = iS + rng.int(1, 3);
            const answer = (((1 + iT / 100) ** T / (1 + iS / 100) ** S) ** (1 / (T - S)) - 1) * 100;
            return {
                prompt: `The spot rate for ${S} years is ${pct(iS)}, the spot rate for ${T} years is ${pct(iT)}. What is the **forward rate** for the period from year ${S} to year ${T}?`,
                given: { [`Spot ${S}y`]: pct(iS), [`Spot ${T}y`]: pct(iT) },
                answer,
                explanation: String.raw`No-arbitrage: $(1+i_T)^T = (1+i_S)^S \cdot (1+f_{S,T})^{T-S}$, so $f_{S,T} = \left[\frac{(1+i_T)^T}{(1+i_S)^S}\right]^{\frac{1}{T-S}} - 1$ = ${pct(answer)}`,
            };
        },
    },

    // -------------------------------------------------------- equity valuation
    {
        id: "fin-eq-total-return",
        subject: "finance",
        topic: "equity_valuation",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "percent",
        build: (rng) => {
            const P0 = rng.int(20, 200);
            const P1 = Math.round(P0 * rng.float(0.85, 1.3, 3));
            const D1 = rng.int(1, 8);
            const answer = ((D1 + P1 - P0) / P0) * 100;
            return {
                prompt: `You buy a share for ${eur(P0)}. After one year it trades at ${eur(P1)} and has paid a dividend of ${eur(D1)}. What is the **total return**?`,
                given: { "$P_0$": eur(P0), "$P_1$": eur(P1), "$D_1$": eur(D1) },
                answer,
                explanation: String.raw`$r = \frac{D_1 + P_1 - P_0}{P_0}$ = (${eur(D1)} + ${eur(P1)} − ${eur(P0)}) / ${eur(P0)} = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-eq-ddm",
        subject: "finance",
        topic: "equity_valuation",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const D1 = rng.float(1, 8, 2);
            const w = rng.int(1, 4);
            const rE = w + rng.int(3, 8);
            const answer = D1 / ((rE - w) / 100);
            return {
                prompt: `A share pays a dividend of ${eur(D1)} next year, which then grows at a constant ${pct(w)} p.a. The cost of equity is ${pct(rE)}. What is the fair share price (Gordon growth model)?`,
                given: { "$D_1$": eur(D1), "Growth w": pct(w), "$r_E$": pct(rE) },
                answer,
                explanation: String.raw`Gordon growth model: $P_0 = \frac{D_1}{r_E - w}$ = ${eur(D1)} / (${n(rE / 100)} − ${n(w / 100)}) = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-eq-pe",
        subject: "finance",
        topic: "equity_valuation",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "ratio",
        build: (rng) => {
            const P0 = rng.int(15, 250);
            const EPS = rng.float(0.8, 12, 2);
            const answer = P0 / EPS;
            return {
                prompt: `A share trades at ${eur(P0)} and reports earnings per share of ${eur(EPS)}. What is its **price/earnings ratio (P/E)**?`,
                given: { "Price $P_0$": eur(P0), "EPS": eur(EPS) },
                answer,
                explanation: String.raw`$P/E = \frac{P_0}{EPS}$ = ${eur(P0)} / ${eur(EPS)} = ${n2(answer)}`,
            };
        },
    },
    {
        id: "fin-eq-ddm-two-phase",
        subject: "finance",
        topic: "equity_valuation",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const D1 = rng.float(1, 5, 2);
            const wa = rng.int(8, 15);
            const wb = rng.int(1, 3);
            const rE = rng.int(9, 14);
            const N = rng.int(3, 6);
            let pv = 0;
            let d = D1;
            for (let t = 1; t <= N; t++) {
                pv += d / (1 + rE / 100) ** t;
                d *= 1 + wa / 100;
            }
            // d is now D_{N+1}
            const terminal = d / ((rE - wb) / 100);
            const answer = pv + terminal / (1 + rE / 100) ** N;
            return {
                prompt: `Two-stage DDM: the dividend next year is ${eur(D1)} and grows at ${pct(wa)} for ${N} years, and at ${pct(wb)} in perpetuity thereafter. Cost of equity ${pct(rE)}. What is the fair share price?`,
                given: { "$D_1$": eur(D1), "Phase 1 (N)": `${N} years @ ${pct(wa)}`, "Phase 2": `perpetual @ ${pct(wb)}`, "$r_E$": pct(rE) },
                answer,
                explanation: String.raw`Phase 1: $\sum_{t=1}^{${N}} \frac{D_t}{(1+r_E)^t}$ = ${eur(pv)}. Terminal value at $t = ${N}$ (Gordon): $TV = \frac{D_{${N + 1}}}{r_E - w_2}$ = ${eur(terminal)}, discounted to today: ${eur(terminal / (1 + rE / 100) ** N)}. $P_0$ = ${eur(answer)}`,
            };
        },
    },

    // ------------------------------------------------------------------ ratios
    {
        id: "fin-ratio-current",
        subject: "finance",
        topic: "ratios",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "ratio",
        build: (rng) => {
            const CA = rng.int(50, 250) * 1000;
            const CL = rng.int(30, 200) * 1000;
            const answer = CA / CL;
            return {
                prompt: `Current assets amount to ${eur(CA)} and current liabilities to ${eur(CL)}. What is the **current ratio**?`,
                given: { "Current assets": eur(CA), "Current liabilities": eur(CL) },
                answer,
                explanation: String.raw`Current ratio $= \frac{CA}{CL}$ = ${eur(CA)} / ${eur(CL)} = ${n2(answer)}`,
            };
        },
    },
    {
        id: "fin-ratio-de",
        subject: "finance",
        topic: "ratios",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "ratio",
        build: (rng) => {
            const D = rng.int(20, 200) * 1000;
            const E = rng.int(30, 250) * 1000;
            const answer = D / E;
            return {
                prompt: `A company has ${eur(D)} of debt and ${eur(E)} of equity. What is its **debt-to-equity ratio (D/E)**?`,
                given: { "Debt D": eur(D), "Equity E": eur(E) },
                answer,
                explanation: String.raw`$D/E = \frac{D}{E}$ = ${eur(D)} / ${eur(E)} = ${n2(answer)}`,
            };
        },
    },
    {
        id: "fin-ratio-roe",
        subject: "finance",
        topic: "ratios",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        build: (rng) => {
            const NI = rng.int(10, 90) * 1000;
            const E = rng.int(100, 500) * 1000;
            const answer = (NI / E) * 100;
            return {
                prompt: `Net income ${eur(NI)}, equity ${eur(E)}. What is the **return on equity (ROE)**?`,
                given: { "Net income": eur(NI), "Equity": eur(E) },
                answer,
                explanation: String.raw`$ROE = \frac{\text{net income}}{\text{equity}}$ = ${eur(NI)} / ${eur(E)} = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-ratio-roic",
        subject: "finance",
        topic: "ratios",
        difficulty: "medium",
        kind: "numeric",
        unit: "percent",
        build: (rng) => {
            const EBIT = rng.int(30, 200) * 1000;
            const tauC = rng.pick([0.25, 0.3, 0.32]);
            const IC = rng.int(300, 900) * 1000;
            const answer = ((EBIT * (1 - tauC)) / IC) * 100;
            return {
                prompt: `EBIT ${eur(EBIT)}, tax rate ${pct(tauC * 100)}, invested capital ${eur(IC)}. What is the **after-tax ROIC**?`,
                given: { EBIT: eur(EBIT), "$τ_C$": pct(tauC * 100), "Invested Capital": eur(IC) },
                answer,
                explanation: String.raw`$ROIC = \frac{EBIT \cdot (1 - \tau_C)}{IC}$ - NOPAT = ${eur(EBIT * (1 - tauC))}, so ROIC = ${eur(EBIT * (1 - tauC))} / ${eur(IC)} = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-ratio-coverage",
        subject: "finance",
        topic: "ratios",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "ratio",
        build: (rng) => {
            const EBIT = rng.int(20, 150) * 1000;
            const IE = rng.int(2, 25) * 1000;
            const answer = EBIT / IE;
            return {
                prompt: `EBIT ${eur(EBIT)}, interest expense ${eur(IE)}. What is the **interest coverage ratio**?`,
                given: { EBIT: eur(EBIT), "Interest expense": eur(IE) },
                answer,
                explanation: String.raw`$ICR = \frac{EBIT}{\text{interest expense}}$ = ${eur(EBIT)} / ${eur(IE)} = ${n2(answer)}`,
            };
        },
    },

    // -------------------------------------------------------------- investment
    {
        id: "fin-inv-npv",
        subject: "finance",
        topic: "investment",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const I0 = rng.int(20, 120) * 1000;
            const T = rng.int(3, 6);
            const cf = Math.round((I0 / T) * rng.float(0.9, 1.45, 3));
            const r = rng.int(4, 12);
            const flows = [-I0, ...Array.from({ length: T }, () => cf)];
            const answer = npv(flows, r / 100);
            return {
                prompt: `An investment costs ${eur(I0)} today and generates ${eur(cf)} at the end of each year for ${T} years. The discount rate is ${pct(r)}. What is the **net present value (NPV)**?`,
                given: { "Investment $I_0$": eur(I0), "Cash flow p.a.": eur(cf), "Term": `${T} years`, r: pct(r) },
                answer,
                explanation: String.raw`$NPV = -I_0 + \sum_{t=1}^{T} \frac{CF_t}{(1+i)^t}$ - the discounted inflows are worth ${eur(answer + I0)}, so NPV = ${eur(answer + I0)} − ${eur(I0)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-inv-irr",
        subject: "finance",
        topic: "investment",
        difficulty: "hard",
        kind: "numeric",
        unit: "percent",
        build: (rng) => {
            const I0 = rng.int(20, 100) * 1000;
            const T = rng.int(3, 5);
            const cf = Math.round((I0 / T) * rng.float(1.05, 1.5, 3));
            const flows = [-I0, ...Array.from({ length: T }, () => cf)];
            const answer = irr(flows) * 100;
            return {
                prompt: `An investment costs ${eur(I0)} and returns ${eur(cf)} in each of the following ${T} years. What is the **internal rate of return (IRR)**?`,
                given: { "$I_0$": eur(I0), "CF p.a.": eur(cf), Term: `${T} years` },
                answer,
                explanation: String.raw`The IRR is the rate that sets the NPV to zero: $-I_0 + \sum_{t=1}^{T} \frac{CF_t}{(1+IRR)^t} = 0$ → IRR = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-inv-payback",
        subject: "finance",
        topic: "investment",
        difficulty: "easy",
        kind: "numeric",
        unit: "years",
        build: (rng) => {
            const I0 = rng.int(20, 90) * 1000;
            const cf = Math.round(I0 / rng.float(2.2, 5.5, 2) / 100) * 100;
            const answer = I0 / cf;
            return {
                prompt: `An investment of ${eur(I0)} generates constant annual cash inflows of ${eur(cf)}. What is the **static payback period**?`,
                given: { "$I_0$": eur(I0), "CF p.a.": eur(cf) },
                answer,
                explanation: String.raw`$\text{payback period} = \frac{I_0}{CF}$ = ${eur(I0)} / ${eur(cf)} = ${n2(answer)} years`,
            };
        },
    },
    {
        id: "fin-inv-eva",
        subject: "finance",
        topic: "investment",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const EBIT = rng.int(50, 300) * 1000;
            const tauC = rng.pick([0.25, 0.3]);
            const r = rng.int(6, 12);
            const IC = rng.int(400, 1500) * 1000;
            const answer = EBIT * (1 - tauC) - (r / 100) * IC;
            return {
                prompt: `EBIT ${eur(EBIT)}, tax rate ${pct(tauC * 100)}, cost of capital ${pct(r)}, invested capital at the start of the period ${eur(IC)}. What is the **EVA**?`,
                given: { EBIT: eur(EBIT), "$τ_C$": pct(tauC * 100), "r": pct(r), "IC": eur(IC) },
                answer,
                explanation: String.raw`$EVA = NOPAT - i \cdot IC = EBIT \cdot (1 - \tau_C) - i \cdot IC$ = ${eur(EBIT * (1 - tauC))} − ${eur((r / 100) * IC)} = ${eur(answer)}`,
            };
        },
    },

    // --------------------------------------------------------- cost of capital
    {
        id: "fin-coc-capm",
        subject: "finance",
        topic: "cost_of_capital",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        build: (rng) => {
            const rRF = rng.int(1, 4);
            const rM = rRF + rng.int(4, 8);
            const beta = rng.float(0.4, 1.8, 2);
            const answer = rRF + beta * (rM - rRF);
            return {
                prompt: `Risk-free rate ${pct(rRF)}, expected market return ${pct(rM)}, beta ${n2(beta)}. What is the expected return under the **CAPM**?`,
                given: { "$r_f$": pct(rRF), "$r_M$": pct(rM), "$β$": n2(beta) },
                answer,
                explanation: String.raw`CAPM: $r = r_f + \beta \cdot (r_M - r_f)$ = ${pct(rRF)} + ${n2(beta)} · ${pct(rM - rRF)} = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-coc-wacc",
        subject: "finance",
        topic: "cost_of_capital",
        difficulty: "medium",
        kind: "numeric",
        unit: "percent",
        build: (rng) => {
            const E = rng.int(50, 300) * 1000;
            const D = rng.int(20, 250) * 1000;
            const rE = rng.int(8, 15);
            const rD = rng.int(2, 7);
            const tauC = rng.pick([0.25, 0.3]);
            const answer = (E / (E + D)) * rE + (D / (E + D)) * rD * (1 - tauC);
            return {
                prompt: `Equity ${eur(E)} (cost ${pct(rE)}), debt ${eur(D)} (cost ${pct(rD)}), tax rate ${pct(tauC * 100)}. What is the **WACC**?`,
                given: { E: eur(E), D: eur(D), "$r_E$": pct(rE), "$r_D$": pct(rD), "$τ_C$": pct(tauC * 100) },
                answer,
                explanation: String.raw`$WACC = \frac{E}{E+D} \cdot r_E + \frac{D}{E+D} \cdot r_D \cdot (1 - \tau_C)$ = ${n2(E / (E + D))} · ${pct(rE)} + ${n2(D / (E + D))} · ${pct(rD)} · ${n2(1 - tauC)} = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-coc-hamada",
        subject: "finance",
        topic: "cost_of_capital",
        difficulty: "hard",
        kind: "numeric",
        unit: "ratio",
        build: (rng) => {
            const betaE = rng.float(0.9, 2.2, 2);
            const D = rng.int(20, 200) * 1000;
            const E = rng.int(50, 300) * 1000;
            const tauC = rng.pick([0.25, 0.3]);
            const answer = betaE / (1 + (D / E) * (1 - tauC));
            return {
                prompt: `The levered beta is ${n2(betaE)} with ${eur(D)} of debt and ${eur(E)} of equity (tax rate ${pct(tauC * 100)}). What is the **unlevered beta** (Hamada)?`,
                given: { "$β_E$": n2(betaE), D: eur(D), E: eur(E), "$τ_C$": pct(tauC * 100) },
                answer,
                explanation: String.raw`Hamada: $\beta_U = \frac{\beta_E}{1 + \frac{D}{E} \cdot (1 - \tau_C)}$ = ${n2(betaE)} / ${n2(1 + (D / E) * (1 - tauC))} = ${n2(answer)}`,
            };
        },
    },
    {
        id: "fin-coc-levered-equity",
        subject: "finance",
        topic: "cost_of_capital",
        difficulty: "medium",
        kind: "numeric",
        unit: "percent",
        build: (rng) => {
            const rU = rng.int(7, 12);
            const rD = rng.int(2, 6);
            const D = rng.int(20, 200) * 1000;
            const E = rng.int(50, 300) * 1000;
            const answer = rU + (D / E) * (rU - rD);
            return {
                prompt: `Unlevered cost of capital ${pct(rU)}, cost of debt ${pct(rD)}, debt ${eur(D)}, equity ${eur(E)} (Modigliani-Miller without taxes). What is the **cost of equity of the levered firm**?`,
                given: { "$r_U$": pct(rU), "$r_D$": pct(rD), D: eur(D), E: eur(E) },
                answer,
                explanation: String.raw`Modigliani-Miller II: $r_E = r_U + \frac{D}{E} \cdot (r_U - r_D)$ = ${pct(rU)} + ${n2(D / E)} · ${pct(rU - rD)} = ${pct(answer)}`,
            };
        },
    },

    // --------------------------------------------------------------- portfolio
    {
        id: "fin-pf-return",
        subject: "finance",
        topic: "portfolio",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "percent",
        build: (rng) => {
            const wA = rng.int(10, 90) / 100;
            const wB = 1 - wA;
            const rA = rng.int(2, 14);
            const rB = rng.int(2, 14);
            const answer = wA * rA + wB * rB;
            return {
                prompt: `A portfolio consists of ${pct(wA * 100)} asset A (return ${pct(rA)}) and ${pct(wB * 100)} asset B (return ${pct(rB)}). What is the **portfolio return**?`,
                given: { "$w_A$": pct(wA * 100), "$w_B$": pct(wB * 100), "$r_A$": pct(rA), "$r_B$": pct(rB) },
                answer,
                explanation: String.raw`$r_P = w_A \cdot r_A + w_B \cdot r_B$ = ${n2(wA)} · ${pct(rA)} + ${n2(wB)} · ${pct(rB)} = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-pf-stddev",
        subject: "finance",
        topic: "portfolio",
        difficulty: "hard",
        kind: "numeric",
        unit: "percent",
        build: (rng) => {
            const wA = rng.int(20, 80) / 100;
            const wB = 1 - wA;
            const sA = rng.int(8, 30);
            const sB = rng.int(8, 30);
            const rho = rng.float(-0.8, 0.9, 2);
            const varP = (wA * sA) ** 2 + (wB * sB) ** 2 + 2 * wA * wB * sA * sB * rho;
            const answer = Math.sqrt(varP);
            return {
                prompt: String.raw`Portfolio of two assets: $w_A$ = ${pct(wA * 100)}, $\sigma_A$ = ${pct(sA)}, $\sigma_B$ = ${pct(sB)}, correlation $\rho_{AB}$ = ${n2(rho)}. What is the **standard deviation of the portfolio**?`,
                given: { "$w_A$": pct(wA * 100), "$w_B$": pct(wB * 100), "$\\sigma_A$": pct(sA), "$\\sigma_B$": pct(sB), "$\\rho_{AB}$": n2(rho) },
                answer,
                explanation: String.raw`$\sigma_P = \sqrt{w_A^2 \sigma_A^2 + w_B^2 \sigma_B^2 + 2 w_A w_B \sigma_A \sigma_B \rho_{AB}}$ - the portfolio variance is ${n2(varP)}, so $\sigma_P = \sqrt{${n2(varP)}}$ = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-pf-minvar",
        subject: "finance",
        topic: "portfolio",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "percent",
        build: (rng) => {
            const sA = rng.int(10, 25);
            const sB = rng.int(10, 30);
            const rho = rng.float(-0.7, 0.6, 2);
            const answer = ((sB ** 2 - sA * sB * rho) / (sA ** 2 + sB ** 2 - 2 * sA * sB * rho)) * 100;
            return {
                prompt: String.raw`$\sigma_A$ = ${pct(sA)}, $\sigma_B$ = ${pct(sB)}, $\rho_{AB}$ = ${n2(rho)}. What weight $w_A$ does asset A have in the **minimum-variance portfolio**?`,
                given: { "$\\sigma_A$": pct(sA), "$\\sigma_B$": pct(sB), "$\\rho_{AB}$": n2(rho) },
                answer,
                explanation: String.raw`$w_A^{MVP} = \frac{\sigma_B^2 - \sigma_A \sigma_B \rho_{AB}}{\sigma_A^2 + \sigma_B^2 - 2 \sigma_A \sigma_B \rho_{AB}}$ = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-pf-sharpe",
        subject: "finance",
        topic: "portfolio",
        difficulty: "easy",
        kind: "numeric",
        unit: "ratio",
        build: (rng) => {
            const rP = rng.int(5, 18);
            const rF = rng.int(1, 4);
            const sP = rng.int(6, 28);
            const answer = (rP - rF) / sP;
            return {
                prompt: `Portfolio return ${pct(rP)}, risk-free rate ${pct(rF)}, standard deviation ${pct(sP)}. What is the **Sharpe ratio**?`,
                given: { "$r_P$": pct(rP), "$r_f$": pct(rF), "$σ_P$": pct(sP) },
                answer,
                explanation: String.raw`$SR = \frac{r_P - r_f}{\sigma_P}$ = (${pct(rP)} − ${pct(rF)}) / ${pct(sP)} = ${n2(answer)}`,
            };
        },
    },

    // ----------------------------------------------------------------- options
    {
        id: "fin-opt-rnp",
        subject: "finance",
        topic: "options",
        difficulty: "medium",
        kind: "numeric",
        unit: "ratio",
        build: (rng) => {
            const rRF = rng.int(1, 6);
            const u = rng.float(1.1, 1.5, 2);
            const d = rng.float(0.6, 0.9, 2);
            const answer = (1 + rRF / 100 - d) / (u - d);
            return {
                prompt: `One-period binomial model: up factor u = ${n2(u)}, down factor d = ${n2(d)}, risk-free rate ${pct(rRF)}. What is the **risk-neutral probability p** of the up state?`,
                given: { u: n2(u), d: n2(d), "$r_f$": pct(rRF) },
                answer,
                explanation: String.raw`$p = \frac{(1 + r_f) - d}{u - d}$ = (${n2(1 + rRF / 100)} − ${n2(d)}) / (${n2(u)} − ${n2(d)}) = ${n2(answer)}`,
            };
        },
    },
    {
        id: "fin-opt-binomial-call",
        subject: "finance",
        topic: "options",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const S = rng.int(80, 130);
            const K = rng.int(80, 130);
            const rRF = rng.int(1, 6);
            const u = rng.float(1.15, 1.45, 2);
            const d = rng.float(0.65, 0.9, 2);
            const p = (1 + rRF / 100 - d) / (u - d);
            const Cu = Math.max(S * u - K, 0);
            const Cd = Math.max(S * d - K, 0);
            const answer = (p * Cu + (1 - p) * Cd) / (1 + rRF / 100);
            return {
                prompt: `The share price today is ${eur(S)}; in one year it is either ×${n2(u)} or ×${n2(d)}. Strike ${eur(K)}, risk-free rate ${pct(rRF)}. What is the **value of the European call**?`,
                given: { "$S_0$": eur(S), K: eur(K), u: n2(u), d: n2(d), "$r_f$": pct(rRF) },
                answer,
                explanation: String.raw`$p = \frac{(1 + r_f) - d}{u - d} = ${n2(p)}$; payoffs $C_u$ = ${eur(Cu)}, $C_d$ = ${eur(Cd)}; $C_0 = \frac{p \cdot C_u + (1 - p) \cdot C_d}{1 + r_f}$ = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-opt-parity",
        subject: "finance",
        topic: "options",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const S = rng.int(80, 130);
            const K = rng.int(80, 130);
            const r = rng.int(1, 6);
            const N = rng.int(1, 4);
            const C = rng.float(4, 20, 2);
            const answer = C + K / (1 + r / 100) ** N - S;
            return {
                prompt: `Put-call parity: call ${eur(C)}, share price ${eur(S)}, strike ${eur(K)}, term ${N} years, interest rate ${pct(r)}. What is the value of the **put**?`,
                given: { C: eur(C), "$S_0$": eur(S), K: eur(K), N: `${N} years`, r: pct(r) },
                answer,
                explanation: String.raw`Put-call parity: $P = C + \frac{K}{(1+i)^N} - S_0$ = ${eur(C)} + ${eur(K / (1 + r / 100) ** N)} − ${eur(S)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-opt-bs-call",
        subject: "finance",
        topic: "options",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const S = rng.int(80, 130);
            const K = rng.int(80, 130);
            const r = rng.int(1, 5);
            const sigma = rng.int(15, 45);
            const T = rng.pick([0.5, 1, 1.5, 2]);
            const s = sigma / 100;
            const rr = r / 100;
            const d1 = (Math.log(S / K) + (rr + 0.5 * s * s) * T) / (s * Math.sqrt(T));
            const d2 = d1 - s * Math.sqrt(T);
            const answer = S * normCdf(d1) - K * Math.exp(-rr * T) * normCdf(d2);
            return {
                prompt: `Black-Scholes: $S_0$ = ${eur(S)}, strike ${eur(K)}, volatility ${pct(sigma)}, risk-free rate ${pct(r)}, term ${n(T)} years. What is the **value of the European call**?`,
                given: { "$S_0$": eur(S), K: eur(K), "$σ$": pct(sigma), r: pct(r), T: `${n(T)} years` },
                answer,
                explanation: String.raw`$d_1 = \frac{\ln(S_0/K) + (i + \frac{\sigma^2}{2}) T}{\sigma \sqrt{T}} = ${n2(d1)}$, $d_2 = d_1 - \sigma \sqrt{T} = ${n2(d2)}$; $N(d_1) = ${n2(normCdf(d1))}$, $N(d_2) = ${n2(normCdf(d2))}$; $C_0 = S_0 \cdot N(d_1) - K \cdot e^{-iT} \cdot N(d_2)$ = ${eur(answer)}`,
            };
        },
    },

    // -------------------------------------------------------- capital increase
    {
        id: "fin-ci-pex",
        subject: "finance",
        topic: "capital_increase",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const BV = rng.int(1, 6);
            const Pcum = rng.int(60, 160);
            const IP = rng.int(30, Pcum - 5);
            const answer = (BV * Pcum + IP) / (BV + 1);
            return {
                prompt: `A rights issue against contributions (Kapitalerhöhung gegen Einlagen) is carried out at a subscription ratio of ${BV}:1. The price before the rights issue is ${eur(Pcum)}, the issue price of the new shares is ${eur(IP)}. What is the **price after the rights issue ($P_{ex}$)**?`,
                given: { "Subscription ratio": `${BV}:1`, "$P_{cum}$": eur(Pcum), "Issue price": eur(IP) },
                answer,
                explanation: String.raw`$P_{ex} = \frac{BV \cdot P_{cum} + IP}{BV + 1}$ = (${BV} · ${eur(Pcum)} + ${eur(IP)}) / ${BV + 1} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ci-right",
        subject: "finance",
        topic: "capital_increase",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const BV = rng.int(1, 6);
            const Pcum = rng.int(60, 160);
            const IP = rng.int(30, Pcum - 5);
            const answer = (Pcum - IP) / (BV + 1);
            return {
                prompt: `Subscription ratio ${BV}:1, price before the rights issue ${eur(Pcum)}, issue price ${eur(IP)}. What is the theoretical value of the **subscription right**?`,
                given: { "Subscription ratio": `${BV}:1`, "$P_{cum}$": eur(Pcum), "Issue price": eur(IP) },
                answer,
                explanation: String.raw`$SR = \frac{P_{cum} - IP}{BV + 1}$ = (${eur(Pcum)} − ${eur(IP)}) / ${BV + 1} = ${eur(answer)}`,
            };
        },
    },

    {
        id: "fin-ann-fv-due",
        subject: "finance",
        topic: "annuities",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(1, 12) * 100;
            const r = rng.int(2, 8);
            const N = rng.int(4, 15);
            const i = r / 100;
            const q = 1 + i;
            const af = (q ** N - 1) / i;
            const answer = C * q * af;
            return {
                prompt: `For ${N} years you pay ${eur(C)} into an account earning ${pct(r)} p.a., **at the beginning of each year** (annuity due). What is the balance at the end of year ${N}, one year after the last payment?`,
                given: {
                    "Payment C": eur(C),
                    "Interest rate r": pct(r),
                    "Number of payments N": String(N),
                    "Payment timing": "annuity due (in advance)",
                },
                answer,
                explanation: String.raw`$FV_{due} = C \cdot q \cdot \frac{q^N - 1}{q - 1}$ - the ordinary annuity factor $\frac{q^N - 1}{q - 1} = ${n2(af)}$ times one extra year of interest: ${eur(C)} · ${n(q)} · ${n2(af)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ann-pv-immediate",
        subject: "finance",
        topic: "annuities",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(2, 15) * 100;
            const r = rng.int(2, 8);
            const N = rng.int(4, 14);
            const i = r / 100;
            const q = 1 + i;
            const pf = (q ** N - 1) / (q ** N * i);
            const answer = C * pf;
            return {
                prompt: `An annuity of ${eur(C)} is paid for ${N} years, **at the end of each year** (ordinary annuity). The discount rate is ${pct(r)}. What is the present value?`,
                given: {
                    "Payment C": eur(C),
                    "Interest rate r": pct(r),
                    "Number of payments N": String(N),
                    "Payment timing": "annuity-immediate (in arrears)",
                },
                answer,
                explanation: String.raw`$PV = C \cdot \frac{q^N - 1}{q^N (q - 1)}$ (present-value annuity factor) with $q = ${n(q)}$: the factor is ${n2(pf)}, so PV = ${eur(C)} · ${n2(pf)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ann-arith-fv-immediate",
        subject: "finance",
        topic: "annuities",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(4, 20) * 100;
            const d = rng.int(1, 6) * 50;
            const r = rng.int(2, 8);
            const N = rng.int(4, 12);
            const i = r / 100;
            const q = 1 + i;
            const af = (q ** N - 1) / i;
            const gap = d / i;
            const answer = (C + gap) * af - N * gap;
            return {
                prompt: `You pay into an account **at the end of each year** (ordinary annuity) for ${N} years. The first payment is ${eur(C)} and every following payment is ${eur(d)} higher than the one before, so the last payment is ${eur(C + (N - 1) * d)}. The account earns ${pct(r)} p.a. What is the balance at the end of year ${N}?`,
                given: {
                    "First payment C": eur(C),
                    "Annual increase d": eur(d),
                    "Interest rate r": pct(r),
                    "Number of payments N": String(N),
                    "Payment timing": "annuity-immediate (in arrears)",
                },
                answer,
                explanation: String.raw`Arithmetically growing annuity: $FV = \left(C + \frac{d}{q - 1}\right) \cdot \frac{q^N - 1}{q - 1} - \frac{N \cdot d}{q - 1}$ with $q = ${n(q)}$, $\frac{d}{q-1}$ = ${eur(gap)} and annuity factor ${n2(af)}: (${eur(C)} + ${eur(gap)}) · ${n2(af)} − ${eur(N * gap)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ann-arith-fv-due",
        subject: "finance",
        topic: "annuities",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(4, 20) * 100;
            const d = rng.int(1, 6) * 50;
            const r = rng.int(2, 8);
            const N = rng.int(4, 12);
            const i = r / 100;
            const q = 1 + i;
            const af = (q ** N - 1) / i;
            const gap = d / i;
            const fvImmediate = (C + gap) * af - N * gap;
            const answer = fvImmediate * q;
            return {
                prompt: `You pay into an account **at the beginning of each year** (annuity due) for ${N} years. The first payment, today, is ${eur(C)} and every following payment is ${eur(d)} higher than the one before, so the last payment, at the beginning of year ${N}, is ${eur(C + (N - 1) * d)}. The account earns ${pct(r)} p.a. What is the balance at the end of year ${N}?`,
                given: {
                    "First payment C": eur(C),
                    "Annual increase d": eur(d),
                    "Interest rate r": pct(r),
                    "Number of payments N": String(N),
                    "Payment timing": "annuity due (in advance)",
                },
                answer,
                explanation: String.raw`$FV_{due} = q \cdot FV_{immediate}$ - every payment earns one extra year of interest. The ordinary-annuity value is ${eur(fvImmediate)}, so FV = ${n(q)} · ${eur(fvImmediate)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ann-arith-pv-immediate",
        subject: "finance",
        topic: "annuities",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(4, 20) * 100;
            const d = rng.int(1, 6) * 50;
            const r = rng.int(2, 8);
            const N = rng.int(4, 12);
            const i = r / 100;
            const q = 1 + i;
            const af = (q ** N - 1) / i;
            const gap = d / i;
            const answer = ((C + gap) * af - N * gap) / q ** N;
            return {
                prompt: `A payment stream runs for ${N} years, **at the end of each year** (ordinary annuity). The first payment is ${eur(C)} and every following payment is ${eur(d)} higher than the one before, so the last payment is ${eur(C + (N - 1) * d)}. The discount rate is ${pct(r)}. What is the present value?`,
                given: {
                    "First payment C": eur(C),
                    "Annual increase d": eur(d),
                    "Discount rate r": pct(r),
                    "Number of payments N": String(N),
                    "Payment timing": "annuity-immediate (in arrears)",
                },
                answer,
                explanation: String.raw`Take the future value of the arithmetically growing annuity and discount it: $FV = \left(C + \frac{d}{q - 1}\right) \cdot \frac{q^N - 1}{q - 1} - \frac{N \cdot d}{q - 1}$ = ${eur((C + gap) * af - N * gap)}, then $PV = \frac{FV}{q^N}$ with $q^{${N}} = ${n2(q ** N)}$ → ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ann-arith-pv-due",
        subject: "finance",
        topic: "annuities",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(4, 20) * 100;
            const d = rng.int(1, 6) * 50;
            const r = rng.int(2, 8);
            const N = rng.int(4, 12);
            const i = r / 100;
            const q = 1 + i;
            const af = (q ** N - 1) / i;
            const gap = d / i;
            const pvImmediate = ((C + gap) * af - N * gap) / q ** N;
            const answer = pvImmediate * q;
            return {
                prompt: `A payment stream runs for ${N} years, **at the beginning of each year** (annuity due). The first payment, today, is ${eur(C)} and every following payment is ${eur(d)} higher than the one before, so the last payment, at the beginning of year ${N}, is ${eur(C + (N - 1) * d)}. The discount rate is ${pct(r)}. What is the present value?`,
                given: {
                    "First payment C": eur(C),
                    "Annual increase d": eur(d),
                    "Discount rate r": pct(r),
                    "Number of payments N": String(N),
                    "Payment timing": "annuity due (in advance)",
                },
                answer,
                explanation: String.raw`$PV_{due} = q \cdot PV_{immediate}$ - the whole stream shifts one year closer. The ordinary-annuity value is ${eur(pvImmediate)}, so PV = ${n(q)} · ${eur(pvImmediate)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ann-geom-fv-immediate-eq",
        subject: "finance",
        topic: "annuities",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(4, 20) * 100;
            const r = rng.int(2, 8);
            const w = r; // g = q by construction - the special case this question tests
            const N = rng.int(4, 12);
            const q = 1 + r / 100;
            const answer = C * N * q ** (N - 1);
            return {
                prompt: `You pay into an account **at the end of each year** (ordinary annuity) for ${N} years. The first payment is ${eur(C)} and every following payment is ${pct(w)} higher than the one before. The account earns ${pct(r)} p.a., so the growth factor equals the interest factor (g = q) and the general geometric formula would divide by zero. What is the balance at the end of year ${N}?`,
                given: {
                    "First payment C": eur(C),
                    "Growth rate w": pct(w),
                    "Interest rate r": pct(r),
                    "Number of payments N": String(N),
                    "Payment timing": "annuity-immediate (in arrears)",
                },
                answer,
                explanation: String.raw`With $g = q = ${n(q)}$ every payment compounds to the same end value $C \cdot q^{N-1}$, so $FV = C \cdot N \cdot q^{N-1}$ = ${eur(C)} · ${N} · ${n2(q ** (N - 1))} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ann-geom-fv-immediate-neq",
        subject: "finance",
        topic: "annuities",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(4, 20) * 100;
            const w = rng.int(1, 5);
            const r = w + rng.int(1, 5); // r > w always, so g ≠ q
            const N = rng.int(4, 12);
            const q = 1 + r / 100;
            const g = 1 + w / 100;
            const factor = (g ** N - q ** N) / (g - q);
            const answer = C * factor;
            return {
                prompt: `You pay into an account **at the end of each year** (ordinary annuity) for ${N} years. The first payment is ${eur(C)} and every following payment is ${pct(w)} higher than the one before. The account earns ${pct(r)} p.a. What is the balance at the end of year ${N}?`,
                given: {
                    "First payment C": eur(C),
                    "Growth rate w": pct(w),
                    "Interest rate r": pct(r),
                    "Number of payments N": String(N),
                    "Payment timing": "annuity-immediate (in arrears)",
                },
                answer,
                explanation: String.raw`Geometrically growing annuity: $FV = C \cdot \frac{g^N - q^N}{g - q}$ with $g = ${n(g)}$ and $q = ${n(q)}$: the growth-annuity factor is ${n2(factor)}, so FV = ${eur(C)} · ${n2(factor)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ann-geom-fv-due-eq",
        subject: "finance",
        topic: "annuities",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(4, 20) * 100;
            const r = rng.int(2, 8);
            const w = r; // g = q by construction
            const N = rng.int(4, 12);
            const q = 1 + r / 100;
            const answer = C * N * q ** N;
            return {
                prompt: `You pay into an account **at the beginning of each year** (annuity due) for ${N} years. The first payment, today, is ${eur(C)} and every following payment is ${pct(w)} higher than the one before. The account earns ${pct(r)} p.a., so the growth factor equals the interest factor (g = q). What is the balance at the end of year ${N}?`,
                given: {
                    "First payment C": eur(C),
                    "Growth rate w": pct(w),
                    "Interest rate r": pct(r),
                    "Number of payments N": String(N),
                    "Payment timing": "annuity due (in advance)",
                },
                answer,
                explanation: String.raw`With $g = q = ${n(q)}$: $FV_{due} = C \cdot N \cdot q^N$ = ${eur(C)} · ${N} · ${n2(q ** N)} = ${eur(answer)} - one factor $q$ more than in arrears, because every payment earns one extra year.`,
            };
        },
    },
    {
        id: "fin-ann-geom-fv-due-neq",
        subject: "finance",
        topic: "annuities",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(4, 20) * 100;
            const w = rng.int(1, 5);
            const r = w + rng.int(1, 5); // r > w always, so g ≠ q
            const N = rng.int(4, 12);
            const q = 1 + r / 100;
            const g = 1 + w / 100;
            const factor = (g ** N - q ** N) / (g - q);
            const answer = C * q * factor;
            return {
                prompt: `You pay into an account **at the beginning of each year** (annuity due) for ${N} years. The first payment, today, is ${eur(C)} and every following payment is ${pct(w)} higher than the one before. The account earns ${pct(r)} p.a. What is the balance at the end of year ${N}?`,
                given: {
                    "First payment C": eur(C),
                    "Growth rate w": pct(w),
                    "Interest rate r": pct(r),
                    "Number of payments N": String(N),
                    "Payment timing": "annuity due (in advance)",
                },
                answer,
                explanation: String.raw`$FV_{due} = C \cdot q \cdot \frac{g^N - q^N}{g - q}$ with $g = ${n(g)}$ and $q = ${n(q)}$: the growth-annuity factor is ${n2(factor)}, so FV = ${eur(C)} · ${n(q)} · ${n2(factor)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ann-geom-pv-immediate-eq",
        subject: "finance",
        topic: "annuities",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(4, 20) * 100;
            const r = rng.int(2, 8);
            const w = r; // g = q by construction
            const N = rng.int(4, 12);
            const q = 1 + r / 100;
            const answer = (C * N) / q;
            return {
                prompt: `A payment stream runs for ${N} years, **at the end of each year** (ordinary annuity). The first payment is ${eur(C)} and every following payment is ${pct(w)} higher than the one before. The discount rate is ${pct(r)}, so the growth factor equals the interest factor (g = q). What is the present value?`,
                given: {
                    "First payment C": eur(C),
                    "Growth rate w": pct(w),
                    "Discount rate r": pct(r),
                    "Number of payments N": String(N),
                    "Payment timing": "annuity-immediate (in arrears)",
                },
                answer,
                explanation: String.raw`With $g = q = ${n(q)}$ payment $k$ is $C \cdot q^{k-1}$ and is discounted by $q^k$, so each payment is worth $\frac{C}{q}$ today: $PV = \frac{C \cdot N}{q}$ = ${eur(C)} · ${N} / ${n(q)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ann-geom-pv-immediate-neq",
        subject: "finance",
        topic: "annuities",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(4, 20) * 100;
            const w = rng.int(1, 5);
            const r = w + rng.int(1, 5); // r > w always, so g ≠ q
            const N = rng.int(4, 12);
            const q = 1 + r / 100;
            const g = 1 + w / 100;
            const factor = ((g / q) ** N - 1) / (g - q);
            const answer = C * factor;
            return {
                prompt: `A payment stream runs for ${N} years, **at the end of each year** (ordinary annuity). The first payment is ${eur(C)} and every following payment is ${pct(w)} higher than the one before. The discount rate is ${pct(r)}. What is the present value?`,
                given: {
                    "First payment C": eur(C),
                    "Growth rate w": pct(w),
                    "Discount rate r": pct(r),
                    "Number of payments N": String(N),
                    "Payment timing": "annuity-immediate (in arrears)",
                },
                answer,
                explanation: String.raw`Geometrically growing annuity: $PV = C \cdot \frac{1 - \left(\frac{g}{q}\right)^{N}}{q - g}$ with $g = ${n(g)}$ and $q = ${n(q)}$: the growth-annuity factor is ${n2(factor)}, so PV = ${eur(C)} · ${n2(factor)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ann-geom-pv-due-eq",
        subject: "finance",
        topic: "annuities",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(4, 20) * 100;
            const r = rng.int(2, 8);
            const w = r; // g = q by construction
            const N = rng.int(4, 12);
            const q = 1 + r / 100;
            const answer = C * N;
            return {
                prompt: `A payment stream runs for ${N} years, **at the beginning of each year** (annuity due). The first payment, today, is ${eur(C)} and every following payment is ${pct(w)} higher than the one before. The discount rate is ${pct(r)}, so the growth factor equals the interest factor (g = q). What is the present value?`,
                given: {
                    "First payment C": eur(C),
                    "Growth rate w": pct(w),
                    "Discount rate r": pct(r),
                    "Number of payments N": String(N),
                    "Payment timing": "annuity due (in advance)",
                },
                answer,
                explanation: String.raw`With $g = q = ${n(q)}$ payment $k$ is $C \cdot q^{k-1}$ and is discounted by $q^{k-1}$ - every payment is worth ${eur(C)} today: $PV_{due} = C \cdot N$ = ${eur(C)} · ${N} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ann-geom-pv-due-neq",
        subject: "finance",
        topic: "annuities",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(4, 20) * 100;
            const w = rng.int(1, 5);
            const r = w + rng.int(1, 5); // r > w always, so g ≠ q
            const N = rng.int(4, 12);
            const q = 1 + r / 100;
            const g = 1 + w / 100;
            const factor = ((g / q) ** N - 1) / (g - q);
            const answer = C * q * factor;
            return {
                prompt: `A payment stream runs for ${N} years, **at the beginning of each year** (annuity due). The first payment, today, is ${eur(C)} and every following payment is ${pct(w)} higher than the one before. The discount rate is ${pct(r)}. What is the present value?`,
                given: {
                    "First payment C": eur(C),
                    "Growth rate w": pct(w),
                    "Discount rate r": pct(r),
                    "Number of payments N": String(N),
                    "Payment timing": "annuity due (in advance)",
                },
                answer,
                explanation: String.raw`$PV_{due} = C \cdot q \cdot \frac{1 - \left(\frac{g}{q}\right)^{N}}{q - g}$ with $g = ${n(g)}$ and $q = ${n(q)}$: the growth-annuity factor is ${n2(factor)}, so PV = ${eur(C)} · ${n(q)} · ${n2(factor)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ann-perpetuity-due",
        subject: "finance",
        topic: "annuities",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(2, 20) * 100;
            const r = rng.int(3, 9);
            const q = 1 + r / 100;
            const immediate = C / (r / 100);
            const answer = q * immediate;
            return {
                prompt: `A **perpetuity** pays ${eur(C)} per year forever, **at the beginning of each year** - the first payment is due today. The discount rate is ${pct(r)}. What is the present value?`,
                given: {
                    "Payment C": eur(C),
                    "Discount rate r": pct(r),
                    "Payment timing": "annuity due (in advance)",
                },
                answer,
                explanation: String.raw`$PV_{due} = q \cdot \frac{C}{i}$ = ${n(q)} · ${eur(immediate)} = ${eur(answer)} - the perpetuity in arrears (${eur(immediate)}) shifted one year closer.`,
            };
        },
    },
    {
        id: "fin-ann-growing-perpetuity-due",
        subject: "finance",
        topic: "annuities",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(2, 20) * 100;
            const w = rng.int(1, 4);
            const r = w + rng.int(2, 6); // r > w always, so q − g > 0
            const q = 1 + r / 100;
            const g = 1 + w / 100;
            const answer = (q * C) / ((r - w) / 100);
            return {
                prompt: `A perpetuity pays ${eur(C)} **at the beginning of each year**, starting today, and every following payment is ${pct(w)} higher than the one before. The discount rate is ${pct(r)}. What is the present value?`,
                given: {
                    "First payment C": eur(C),
                    "Growth rate w": pct(w),
                    "Discount rate r": pct(r),
                    "Payment timing": "annuity due (in advance)",
                },
                answer,
                explanation: String.raw`$PV_{due} = q \cdot \frac{C}{q - g}$ with $q - g = i - w = ${n((r - w) / 100)}$: ${n(q)} · ${eur(C)} / ${n((r - w) / 100)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ann-replacement-immediate",
        subject: "finance",
        topic: "annuities",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(1, 10) * 50;
            const m = rng.pick([2, 4, 12]);
            const r = rng.int(2, 9);
            const label = m === 2 ? "semi-annually" : m === 4 ? "quarterly" : "monthly";
            const answer = C * (m + ((r / 100) * (m - 1)) / 2);
            return {
                prompt: `${eur(C)} is paid ${label} (m = ${m} payments per year), **at the end of each sub-period**. The nominal annual rate is ${pct(r)} and interest **within** the year is simple (linear). What single equivalent payment at the end of the year replaces the ${m} payments (replacement annuity)?`,
                given: {
                    "Sub-period payment C": eur(C),
                    "Payments per year m": String(m),
                    "Nominal rate r": pct(r),
                    "Payment timing": "in arrears (annuity-immediate)",
                },
                answer,
                explanation: String.raw`$C_{repl} = C \cdot \left(m + i \cdot \frac{m - 1}{2}\right)$ = ${eur(C)} · (${m} + ${n(r / 100)} · ${n((m - 1) / 2)}) = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ann-replacement-due",
        subject: "finance",
        topic: "annuities",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const C = rng.int(1, 10) * 50;
            const m = rng.pick([2, 4, 12]);
            const r = rng.int(2, 9);
            const label = m === 2 ? "semi-annually" : m === 4 ? "quarterly" : "monthly";
            const answer = C * (m + ((r / 100) * (m + 1)) / 2);
            return {
                prompt: `${eur(C)} is paid ${label} (m = ${m} payments per year), **at the beginning of each sub-period**. The nominal annual rate is ${pct(r)} and interest **within** the year is simple (linear). What single equivalent payment at the end of the year replaces the ${m} payments (replacement annuity)?`,
                given: {
                    "Sub-period payment C": eur(C),
                    "Payments per year m": String(m),
                    "Nominal rate r": pct(r),
                    "Payment timing": "in advance (annuity due)",
                },
                answer,
                explanation: String.raw`$C_{repl} = C \cdot \left(m + i \cdot \frac{m + 1}{2}\right)$ = ${eur(C)} · (${m} + ${n(r / 100)} · ${n((m + 1) / 2)}) = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-int-periods",
        subject: "finance",
        topic: "interest",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "number",
        build: (rng) => {
            const m = rng.pick([2, 4, 6, 12]);
            const years = rng.int(2, 15);
            const label =
                m === 2 ? "semi-annually" : m === 4 ? "quarterly" : m === 6 ? "every two months" : "monthly";
            const answer = m * years;
            return {
                prompt: `Interest is credited ${label} (m = ${m} times per year) over a term of ${years} years. How many interest periods N does the compound-interest formula run over?`,
                given: { "Payments per year m": String(m), "Term n": `${years} years` },
                answer,
                explanation: String.raw`$N = m \cdot n$ = ${m} · ${years} = ${n(answer)} interest periods`,
            };
        },
    },

    {
        id: "fin-ratio-invested-capital",
        subject: "finance",
        topic: "ratios",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const E = rng.int(200, 900) * 1000;
            const NFO = rng.int(50, 600) * 1000;
            const answer = E + NFO;
            return {
                prompt: `A company reports a book value of equity of ${eur(E)} and net financial obligations (net debt, i.e. interest-bearing debt minus financial assets) of ${eur(NFO)}. What is its **invested capital**?`,
                given: { "Book value of equity E": eur(E), "Net financial obligations NFO": eur(NFO) },
                answer,
                explanation: String.raw`$IC = E + NFO$ = ${eur(E)} + ${eur(NFO)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ratio-net-debt",
        subject: "finance",
        topic: "ratios",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            // D is drawn above the largest possible FA, so net debt stays positive.
            const D = rng.int(200, 900) * 1000;
            const FA = rng.int(20, 180) * 1000;
            const answer = D - FA;
            return {
                prompt: `A company carries ${eur(D)} of interest-bearing debt and holds ${eur(FA)} of financial assets (cash and securities). What are its **net financial obligations (net debt)**?`,
                given: { "Debt D": eur(D), "Financial assets FA": eur(FA) },
                answer,
                explanation: String.raw`$NFO = D - FA$ = ${eur(D)} − ${eur(FA)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ratio-debt-to-capital",
        subject: "finance",
        topic: "ratios",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "ratio",
        build: (rng) => {
            const D = rng.int(50, 500) * 1000;
            const E = rng.int(80, 700) * 1000;
            const answer = D / (E + D);
            return {
                prompt: `A company is financed with ${eur(D)} of debt and ${eur(E)} of equity. What is its **debt-to-capital ratio** - the share of total capital (debt plus equity) that is debt? Give it as a factor.`,
                given: { "Debt D": eur(D), "Equity E": eur(E) },
                answer,
                explanation: String.raw`$\frac{D}{D + E}$ = ${eur(D)} / ${eur(D + E)} = ${n2(answer)}`,
            };
        },
    },
    {
        id: "fin-ratio-nfl",
        subject: "finance",
        topic: "ratios",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "ratio",
        build: (rng) => {
            const NFO = rng.int(50, 500) * 1000;
            const E = rng.int(200, 800) * 1000;
            const answer = NFO / E;
            return {
                prompt: `Net financial obligations (debt minus financial assets) are ${eur(NFO)}, the book value of equity is ${eur(E)}. What is the **net financial leverage (NFL)**?`,
                given: { "Net financial obligations NFO": eur(NFO), "Equity E": eur(E) },
                answer,
                explanation: String.raw`$NFL = \frac{NFO}{E}$ = ${eur(NFO)} / ${eur(E)} = ${n2(answer)}`,
            };
        },
    },
    {
        id: "fin-ratio-debt-to-ev",
        subject: "finance",
        topic: "ratios",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "ratio",
        build: (rng) => {
            const NFO = rng.int(40, 500) * 1000;
            const MVE = rng.int(200, 1500) * 1000;
            const answer = NFO / (MVE + NFO);
            return {
                prompt: `A listed company has net financial obligations of ${eur(NFO)} and a market value of equity of ${eur(MVE)}. Its enterprise value is the market value of equity plus net financial obligations. What is the **debt-to-enterprise-value ratio**? Give it as a factor.`,
                given: { "Net financial obligations NFO": eur(NFO), "Market value of equity MV_E": eur(MVE) },
                answer,
                explanation: String.raw`$\frac{NFO}{EV} = \frac{NFO}{MV_E + NFO}$ = ${eur(NFO)} / ${eur(MVE + NFO)} = ${n2(answer)}`,
            };
        },
    },
    {
        id: "fin-ratio-quick",
        subject: "finance",
        topic: "ratios",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "ratio",
        build: (rng) => {
            const cash = rng.int(10, 120) * 1000;
            const sti = rng.int(5, 80) * 1000;
            const ar = rng.int(20, 200) * 1000;
            // Current liabilities are scaled off the quick assets, so the ratio
            // always lands in a plausible band and can never be zero.
            const CL = Math.round((cash + sti + ar) / rng.float(0.6, 2.2, 2) / 1000) * 1000;
            const answer = (cash + sti + ar) / CL;
            return {
                prompt: `Cash ${eur(cash)}, short-term investments ${eur(sti)}, accounts receivable ${eur(ar)}, current liabilities ${eur(CL)}. What is the **quick ratio** (inventories are deliberately excluded)?`,
                given: {
                    Cash: eur(cash),
                    "Short-term investments": eur(sti),
                    "Accounts receivable": eur(ar),
                    "Current liabilities": eur(CL),
                },
                answer,
                explanation: String.raw`$\text{quick ratio} = \frac{\text{cash} + \text{short-term investments} + \text{receivables}}{CL}$ = ${eur(cash + sti + ar)} / ${eur(CL)} = ${n2(answer)}`,
            };
        },
    },
    {
        id: "fin-ratio-nfe",
        subject: "finance",
        topic: "ratios",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "percent",
        build: (rng) => {
            const NFO = rng.int(200, 900) * 1000;
            const FE = Math.round(NFO * rng.float(0.02, 0.09, 4));
            const answer = (FE / NFO) * 100;
            return {
                prompt: `A company pays financial expenses of ${eur(FE)} on net financial obligations of ${eur(NFO)}. What is its **net financial expense (NFE)**, i.e. the financial expenses expressed as a percentage of net financial obligations?`,
                given: { "Financial expenses FE": eur(FE), "Net financial obligations NFO": eur(NFO) },
                answer,
                explanation: String.raw`$NFE = \frac{FE}{NFO}$ = ${eur(FE)} / ${eur(NFO)} = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-ratio-ebit-margin",
        subject: "finance",
        topic: "ratios",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "percent",
        build: (rng) => {
            const sales = rng.int(500, 5000) * 1000;
            const EBIT = Math.round(sales * rng.float(0.04, 0.22, 4));
            const answer = (EBIT / sales) * 100;
            return {
                prompt: `Sales ${eur(sales)}, EBIT ${eur(EBIT)}. What is the **EBIT margin**?`,
                given: { Sales: eur(sales), EBIT: eur(EBIT) },
                answer,
                explanation: String.raw`$\text{EBIT margin} = \frac{EBIT}{\text{sales}}$ = ${eur(EBIT)} / ${eur(sales)} = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-ratio-net-margin",
        subject: "finance",
        topic: "ratios",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "percent",
        build: (rng) => {
            const sales = rng.int(500, 5000) * 1000;
            const NI = Math.round(sales * rng.float(0.02, 0.14, 4));
            const answer = (NI / sales) * 100;
            return {
                prompt: `Sales ${eur(sales)}, net income ${eur(NI)}. What is the **net profit margin**?`,
                given: { Sales: eur(sales), "Net income": eur(NI) },
                answer,
                explanation: String.raw`$\text{net margin} = \frac{\text{net income}}{\text{sales}}$ = ${eur(NI)} / ${eur(sales)} = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-ratio-eps",
        subject: "finance",
        topic: "ratios",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const shares = rng.int(100, 900) * 1000;
            const NI = Math.round(shares * rng.float(0.8, 6.5, 2));
            const answer = NI / shares;
            return {
                prompt: `A company earns a net income of ${eur(NI)} and has ${n(shares)} shares outstanding. What are its **earnings per share (EPS)**?`,
                given: { "Net income": eur(NI), "Shares outstanding": n(shares) },
                answer,
                explanation: String.raw`$EPS = \frac{\text{net income}}{\text{shares outstanding}}$ = ${eur(NI)} / ${n(shares)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ratio-diluted-eps-simple",
        subject: "finance",
        topic: "ratios",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const shares = rng.int(100, 900) * 1000;
            const NI = Math.round(shares * rng.float(1, 6, 2));
            const df = rng.float(1.02, 1.35, 2);
            const answer = NI / (shares * df);
            return {
                prompt: `Net income is ${eur(NI)} and ${n(shares)} shares are outstanding. Options and convertibles together give a **dilution factor** of ${n2(df)} - the factor by which the share count effectively grows. What are the **diluted earnings per share**?`,
                given: { "Net income": eur(NI), "Shares outstanding a": n(shares), "Dilution factor df": n2(df) },
                answer,
                explanation: String.raw`$EPS_{dil} = \frac{NI}{a \cdot df}$ = ${eur(NI)} / (${n(shares)} · ${n2(df)}) = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ratio-pe-from-mc",
        subject: "finance",
        topic: "ratios",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "ratio",
        build: (rng) => {
            const NI = rng.int(2, 40) * 100000;
            const MC = Math.round(NI * rng.float(8, 30, 2));
            const answer = MC / NI;
            return {
                prompt: `A company's market capitalization is ${eur(MC)} and its net income is ${eur(NI)}. What is its **price/earnings ratio (P/E)**?`,
                given: { "Market capitalization": eur(MC), "Net income": eur(NI) },
                answer,
                explanation: String.raw`$P/E = \frac{\text{market capitalization}}{\text{net income}}$ = ${eur(MC)} / ${eur(NI)} = ${n2(answer)}`,
            };
        },
    },
    {
        id: "fin-ratio-ebitda-multiple",
        subject: "finance",
        topic: "ratios",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "ratio",
        build: (rng) => {
            const EBITDA = rng.int(5, 80) * 100000;
            const EV = Math.round(EBITDA * rng.float(4, 14, 2));
            const answer = EV / EBITDA;
            return {
                prompt: `A company has an enterprise value of ${eur(EV)} and EBITDA of ${eur(EBITDA)}. What is its **EBITDA multiple (EV/EBITDA)**?`,
                given: { "Enterprise value EV": eur(EV), EBITDA: eur(EBITDA) },
                answer,
                explanation: String.raw`$\frac{EV}{EBITDA}$ = ${eur(EV)} / ${eur(EBITDA)} = ${n2(answer)}`,
            };
        },
    },
    {
        id: "fin-ratio-market-to-book",
        subject: "finance",
        topic: "ratios",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "ratio",
        build: (rng) => {
            const P0 = rng.int(15, 120);
            const shares = rng.int(100, 900) * 1000;
            // Book value is derived from the market value, so it is always positive.
            const VE = Math.round((P0 * shares) / rng.float(1.1, 4, 2) / 1000) * 1000;
            const answer = (P0 * shares) / VE;
            return {
                prompt: `A share trades at ${eur(P0)}, there are ${n(shares)} shares outstanding, and the book value of equity is ${eur(VE)}. What is the **market-to-book ratio**?`,
                given: { "Share price $P_0$": eur(P0), "Shares outstanding a": n(shares), "Book value of equity": eur(VE) },
                answer,
                explanation: String.raw`$M/B = \frac{P_0 \cdot a}{\text{book equity}}$ = ${eur(P0 * shares)} / ${eur(VE)} = ${n2(answer)}`,
            };
        },
    },
    {
        id: "fin-dil-df1",
        subject: "finance",
        topic: "ratios",
        difficulty: "medium",
        kind: "numeric",
        unit: "ratio",
        build: (rng) => {
            // The issue price X is drawn strictly below the stock price S, so the
            // options are always in the money and $DF_1$ is genuinely above 1.
            const S = rng.int(60, 160);
            const X = rng.int(20, S - 20);
            const shares = rng.int(200, 900) * 1000;
            const opts = rng.int(20, 150) * 1000;
            const answer = Math.max(1, 1 + (opts / shares) * (1 - X / S));
            return {
                prompt: `A company has ${n(shares)} shares outstanding at a stock price of ${eur(S)}. It has issued ${n(opts)} options, each entitling the holder to one new share at an issue price of ${eur(X)}. What is the **dilution factor $DF_1$** from these options?`,
                given: {
                    "Options issued n": n(opts),
                    "Shares outstanding a": n(shares),
                    "Issue price X": eur(X),
                    "Stock price S": eur(S),
                },
                answer,
                explanation: String.raw`$DF_1 = \max\left(1,\ 1 + \frac{n}{a} \cdot \left(1 - \frac{X}{S}\right)\right)$ - the options add ${pct((opts / shares) * 100)} to the share count and only $\frac{X}{S}$ = ${pct((X / S) * 100)} of each new share is paid in → $DF_1$ = ${n2(answer)}`,
            };
        },
    },
    {
        id: "fin-dil-df2",
        subject: "finance",
        topic: "ratios",
        difficulty: "medium",
        kind: "numeric",
        unit: "ratio",
        build: (rng) => {
            const shares = rng.int(200, 900) * 1000;
            const conv = rng.int(20, 120) * 1000;
            const NI = rng.int(20, 90) * 100000;
            const NV = rng.int(10, 60) * 100000;
            const c = rng.int(2, 7);
            const tauC = rng.pick([0.25, 0.3]);
            const saved = NV * (1 - tauC) * (c / 100);
            // NI is always strictly positive, so the denominator can never vanish.
            const relief = saved / NI;
            const answer = Math.max(1, 1 + conv / shares / (1 + relief));
            return {
                prompt: `A company has ${n(shares)} shares outstanding and a net income of ${eur(NI)} at a tax rate of ${pct(tauC * 100)}. Its convertible bonds have a total nominal value of ${eur(NV)} and pay a coupon of ${pct(c)} p.a.; on conversion they would create ${n(conv)} new shares and the coupon would no longer be paid. What is the **dilution factor $DF_2$** from the convertibles?`,
                given: {
                    "New shares on conversion n": n(conv),
                    "Shares outstanding a": n(shares),
                    "Nominal value NV": eur(NV),
                    "Coupon c": pct(c),
                    "Net income NI": eur(NI),
                    "$τ_C$": pct(tauC * 100),
                },
                answer,
                explanation: String.raw`$DF_2 = \max\left(1,\ 1 + \frac{n/a}{1 + \frac{NV \cdot (1 - \tau_C) \cdot c}{NI}}\right)$ - the coupon saved after tax is ${eur(saved)} (${pct(relief * 100)} of net income) and conversion adds ${pct((conv / shares) * 100)} to the share count → $DF_2$ = ${n2(answer)}`,
            };
        },
    },
    {
        id: "fin-dil-eps",
        subject: "finance",
        topic: "ratios",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const EPS = rng.float(1.2, 8, 2);
            const df1 = rng.float(1.02, 1.3, 2);
            const df2 = rng.float(1.01, 1.2, 2);
            const answer = EPS / (df1 * df2);
            return {
                prompt: `Basic earnings per share are ${eur(EPS)}. The options outstanding give a dilution factor $DF_1$ = ${n2(df1)} and the convertibles a dilution factor $DF_2$ = ${n2(df2)}. What are the **diluted earnings per share**?`,
                given: { EPS: eur(EPS), "$DF_1$": n2(df1), "$DF_2$": n2(df2) },
                answer,
                explanation: String.raw`$EPS_{dil} = \frac{EPS}{DF_1 \cdot DF_2}$ = ${eur(EPS)} / (${n2(df1)} · ${n2(df2)}) = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ratio-dupont",
        subject: "finance",
        topic: "ratios",
        difficulty: "hard",
        kind: "numeric",
        unit: "percent",
        build: (rng) => {
            const margin = rng.float(2, 12, 2);
            const turnover = rng.float(0.4, 2.5, 2);
            const multiplier = rng.float(1.2, 3.5, 2);
            const answer = margin * turnover * multiplier;
            return {
                prompt: `Break down the return on equity with the **DuPont identity**: the net profit margin is ${pct(margin)}, the asset turnover (sales ÷ total assets) is ${n2(turnover)} and the equity multiplier (total assets ÷ equity) is ${n2(multiplier)}. What is the **ROE**?`,
                given: {
                    "Net profit margin": pct(margin),
                    "Asset turnover": n2(turnover),
                    "Equity multiplier": n2(multiplier),
                },
                answer,
                explanation: String.raw`DuPont: $ROE = \text{net margin} \cdot \text{asset turnover} \cdot \text{equity multiplier}$ = ${pct(margin)} · ${n2(turnover)} · ${n2(multiplier)} = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-ratio-book-leverage",
        subject: "finance",
        topic: "ratios",
        difficulty: "hard",
        kind: "numeric",
        unit: "percent",
        build: (rng) => {
            const roic = rng.float(6, 18, 2);
            const nfl = rng.float(0.2, 1.8, 2);
            const nfe = rng.float(2.5, 8, 2);
            const tauC = rng.pick([0.25, 0.3, 0.32]);
            const answer = roic + nfl * (roic - nfe * (1 - tauC));
            return {
                prompt: `Compute the **ROE with the book-leverage equation**: the after-tax ROIC is ${pct(roic)}, net financial leverage (net financial obligations ÷ equity) is ${n2(nfl)}, the net financial expense (financial expenses as a percentage of net financial obligations, before tax) is ${pct(nfe)} and the tax rate is ${pct(tauC * 100)}.`,
                given: {
                    "ROIC after tax": pct(roic),
                    "Net financial leverage NFL": n2(nfl),
                    "Net financial expense NFE": pct(nfe),
                    "$τ_C$": pct(tauC * 100),
                },
                answer,
                explanation: String.raw`$ROE = ROIC + NFL \cdot \left(ROIC - NFE \cdot (1 - \tau_C)\right)$ - the after-tax NFE is ${pct(nfe * (1 - tauC))}, so the leverage spread is ${pct(roic - nfe * (1 - tauC))}: ${pct(roic)} + ${n2(nfl)} · ${pct(roic - nfe * (1 - tauC))} = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-ratio-fcf",
        subject: "finance",
        topic: "ratios",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            // Ranges are chosen so the sum stays comfortably positive.
            const EBIT = rng.int(250, 700) * 1000;
            const tauC = rng.pick([0.25, 0.3]);
            const depr = rng.int(40, 120) * 1000;
            const ncExp = rng.int(5, 30) * 1000;
            const ncEarn = rng.int(2, 20) * 1000;
            const dNwc = -(rng.int(5, 45) * 1000);
            const cfi = -(rng.int(40, 120) * 1000);
            const nopat = EBIT * (1 - tauC);
            const answer = nopat + depr + ncExp - ncEarn + dNwc + cfi;
            return {
                prompt: `Compute the **free cash flow to the firm (FCF)** from: EBIT ${eur(EBIT)}, tax rate ${pct(tauC * 100)}, depreciation ${eur(depr)}, other non-cash expenses ${eur(ncExp)}, other non-cash earnings ${eur(ncEarn)}, change in net working capital ${eur(dNwc)} and cash flow from investments ${eur(cfi)}. The last two are already stated as **signed cash-flow effects**, so a negative figure reduces the cash flow.`,
                given: {
                    EBIT: eur(EBIT),
                    "$τ_C$": pct(tauC * 100),
                    Depreciation: eur(depr),
                    "Other non-cash expenses": eur(ncExp),
                    "Other non-cash earnings": eur(ncEarn),
                    "Change in NWC": eur(dNwc),
                    "Cash flow from investments": eur(cfi),
                },
                answer,
                explanation: String.raw`$FCF = EBIT \cdot (1 - \tau_C) + \text{depr.} + \text{non-cash exp.} - \text{non-cash earn.} + \Delta NWC + CFI$ = ${eur(nopat)} + ${eur(depr)} + ${eur(ncExp)} − ${eur(ncEarn)} + (${eur(dNwc)}) + (${eur(cfi)}) = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ratio-fcfe",
        subject: "finance",
        topic: "ratios",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            // Ranges are chosen so the sum stays comfortably positive.
            const NI = rng.int(250, 700) * 1000;
            const depr = rng.int(40, 120) * 1000;
            const ncExp = rng.int(5, 30) * 1000;
            const ncEarn = rng.int(2, 20) * 1000;
            const dNwc = -(rng.int(5, 45) * 1000);
            const cfi = -(rng.int(40, 120) * 1000);
            const cff = rng.int(1, 12) * 5000 * rng.pick([1, -1]);
            const answer = NI + depr + ncExp - ncEarn + dNwc + cfi + cff;
            return {
                prompt: `Compute the **free cash flow to equity (FCFE)** from: net income ${eur(NI)}, depreciation ${eur(depr)}, other non-cash expenses ${eur(ncExp)}, other non-cash earnings ${eur(ncEarn)}, change in net working capital ${eur(dNwc)}, cash flow from investments ${eur(cfi)} and cash flow from financing ${eur(cff)}. The last three are already stated as **signed cash-flow effects**, so a negative figure reduces the cash flow.`,
                given: {
                    "Net income": eur(NI),
                    Depreciation: eur(depr),
                    "Other non-cash expenses": eur(ncExp),
                    "Other non-cash earnings": eur(ncEarn),
                    "Change in NWC": eur(dNwc),
                    "Cash flow from investments": eur(cfi),
                    "Cash flow from financing": eur(cff),
                },
                answer,
                explanation: String.raw`$FCFE = NI + \text{depr.} + \text{non-cash exp.} - \text{non-cash earn.} + \Delta NWC + CFI + CFF$ = ${eur(NI)} + ${eur(depr)} + ${eur(ncExp)} − ${eur(ncEarn)} + (${eur(dNwc)}) + (${eur(cfi)}) + (${eur(cff)}) = ${eur(answer)}`,
            };
        },
    },

    {
            id: "fin-coc-unlevered-no-taxes",
            subject: "finance",
            topic: "cost_of_capital",
            difficulty: "medium",
            kind: "numeric",
            unit: "percent",
            build: (rng) => {
                const E = rng.int(200, 900) * 1000;
                const D = rng.int(100, 700) * 1000;
                const rE = rng.int(9, 16);
                const rD = rng.int(2, 7);
                const wE = E / (E + D);
                const wD = D / (E + D);
                const answer = wE * rE + wD * rD;
                return {
                    prompt: `A firm is financed with ${eur(E)} of equity (cost of equity ${pct(rE)}) and ${eur(D)} of debt (cost of debt ${pct(rD)}). Assume a world **without taxes** (Modigliani-Miller). What is the **cost of capital of the unlevered firm r_U**, i.e. the weighted average return the assets have to earn?`,
                    given: {
                        "Equity E": eur(E),
                        "Debt D": eur(D),
                        "Cost of equity r_E": pct(rE),
                        "Cost of debt r_D": pct(rD),
                        Taxes: "none",
                    },
                    answer,
                    explanation: String.raw`Without taxes $r_U$ is the value-weighted average return the assets must earn: $r_U = \frac{E}{E+D} \cdot r_E + \frac{D}{E+D} \cdot r_D$ = ${n2(wE)} · ${pct(rE)} + ${n2(wD)} · ${pct(rD)} = ${pct(answer)}`,
                };
            },
        },
        {
            id: "fin-coc-asset-beta",
            subject: "finance",
            topic: "cost_of_capital",
            difficulty: "medium",
            kind: "numeric",
            unit: "ratio",
            build: (rng) => {
                const E = rng.int(200, 900) * 1000;
                const D = rng.int(100, 700) * 1000;
                const betaD = rng.float(0.05, 0.35, 2);
                // Draw the spread, never the level, so the debt beta always stays
                // below the equity beta.
                const betaE = betaD + rng.float(0.5, 1.6, 2);
                const wE = E / (E + D);
                const wD = D / (E + D);
                const answer = wE * betaE + wD * betaD;
                return {
                    prompt: `A firm has ${eur(E)} of equity with an equity beta of ${n2(betaE)} and ${eur(D)} of debt with a debt beta of ${n2(betaD)}. Assume **no taxes**, so the whole firm is simply the portfolio of its equity and its debt. What is the **unlevered (asset) beta $β_U$**?`,
                    given: {
                        "Equity E": eur(E),
                        "Debt D": eur(D),
                        "$β_E$": n2(betaE),
                        "$β_D$": n2(betaD),
                        Taxes: "none",
                    },
                    answer,
                    explanation: String.raw`$\beta_U = \frac{E}{E+D} \cdot \beta_E + \frac{D}{E+D} \cdot \beta_D$ = ${n2(wE)} · ${n2(betaE)} + ${n2(wD)} · ${n2(betaD)} = ${n2(answer)}`,
                };
            },
        },
        {
            id: "fin-coc-equity-beta",
            subject: "finance",
            topic: "cost_of_capital",
            difficulty: "medium",
            kind: "numeric",
            unit: "ratio",
            build: (rng) => {
                const betaD = rng.float(0.05, 0.35, 2);
                // Same trick as above: the spread is drawn, so β_U > β_D always holds
                // and leverage can only push the equity beta up.
                const betaU = betaD + rng.float(0.4, 1.2, 2);
                const E = rng.int(200, 900) * 1000;
                const D = rng.int(100, 700) * 1000;
                const answer = betaU + (D / E) * (betaU - betaD);
                return {
                    prompt: `A firm's unlevered (asset) beta is ${n2(betaU)} and its debt beta is ${n2(betaD)}. It carries ${eur(D)} of debt against ${eur(E)} of equity. Assume **no taxes**. What is the **equity beta $β_E$** of the levered firm?`,
                    given: {
                        "$β_U$": n2(betaU),
                        "$β_D$": n2(betaD),
                        "Debt D": eur(D),
                        "Equity E": eur(E),
                        Taxes: "none",
                    },
                    answer,
                    explanation: String.raw`$\beta_E = \beta_U + \frac{D}{E} \cdot (\beta_U - \beta_D)$ = ${n2(betaU)} + ${n2(D / E)} · (${n2(betaU)} − ${n2(betaD)}) = ${n2(answer)}`,
                };
            },
        },
        {
            id: "fin-coc-wacc-target-leverage",
            subject: "finance",
            topic: "cost_of_capital",
            difficulty: "hard",
            kind: "numeric",
            unit: "percent",
            build: (rng) => {
                const E = rng.int(200, 900) * 1000;
                const D = rng.int(100, 700) * 1000;
                const rU = rng.int(8, 14);
                const rD = rng.int(2, 7);
                const tauC = rng.pick([0.25, 0.3]);
                const wD = D / (E + D);
                const answer = rU - wD * tauC * rD;
                return {
                    prompt: `A firm holds a **constant target leverage ratio**: ${eur(D)} of debt against ${eur(E)} of equity, rebalanced every period. Its unlevered cost of capital is ${pct(rU)}, its cost of debt ${pct(rD)}, and the **corporate tax rate is $τ_C$ = ${pct(tauC * 100)}**. What is the **WACC**?`,
                    given: {
                        "$r_U$": pct(rU),
                        "$r_D$": pct(rD),
                        "Debt D": eur(D),
                        "Equity E": eur(E),
                        "$τ_C$": pct(tauC * 100),
                    },
                    answer,
                    explanation: String.raw`At a fixed target leverage the WACC is the unlevered cost less the tax shield per unit of firm value: $r_{WACC} = r_U - \frac{D}{E+D} \cdot \tau_C \cdot r_D$ = ${pct(rU)} − ${n2(wD)} · ${n(tauC)} · ${pct(rD)} = ${pct(answer)}`,
                };
            },
        },
        {
            id: "fin-coc-levered-firm-value",
            subject: "finance",
            topic: "cost_of_capital",
            difficulty: "hard",
            kind: "numeric",
            unit: "EUR",
            build: (rng) => {
                const VU = rng.int(500, 2000) * 1000;
                const D = rng.int(100, 800) * 1000;
                const rD = rng.int(3, 7);
                const tauC = rng.pick([0.25, 0.3, 0.32]);
                const its = tauC * D;
                const answer = VU + its;
                return {
                    prompt: `An all-equity firm is worth ${eur(VU)}. It now takes on **permanent debt** of ${eur(D)} at a cost of debt of ${pct(rD)} - only interest is paid, the principal is rolled over forever, so the interest tax shield is a perpetuity discounted at ${pct(rD)}. The **corporate tax rate is $τ_C$ = ${pct(tauC * 100)}**. What is the value of the **levered firm V_L**?`,
                    given: {
                        "Unlevered firm value V_U": eur(VU),
                        "Permanent debt D": eur(D),
                        "Cost of debt r_D": pct(rD),
                        "$τ_C$": pct(tauC * 100),
                    },
                    answer,
                    explanation: String.raw`The perpetual tax shield is $PV(ITS) = \frac{\tau_C \cdot r_D \cdot D}{r_D} = \tau_C \cdot D$ - the cost of debt cancels: ${n(tauC)} · ${eur(D)} = ${eur(its)}. Then $V_L = V_U + PV(ITS)$ = ${eur(VU)} + ${eur(its)} = ${eur(answer)}`,
                };
            },
        },
        {
            id: "fin-val-equity-method",
            subject: "finance",
            topic: "equity_valuation",
            difficulty: "hard",
            kind: "numeric",
            unit: "EUR",
            build: (rng) => {
                // Growth first, discount rate strictly above it, so r_E − g ≥ 4 pp.
                const g = rng.int(1, 4);
                const rE = g + rng.int(4, 9);
                const fcfe = rng.int(200, 900) * 1000;
                const answer = fcfe / ((rE - g) / 100);
                return {
                    prompt: `Value a firm with the **equity method**: the free cash flow to equity is ${eur(fcfe)} next year and then grows at a constant ${pct(g)} p.a. **in perpetuity**. The FCFE is already stated **after corporate taxes and after interest and debt payments**, so it is discounted at the cost of equity of ${pct(rE)}. What is the **market value of equity**?`,
                    given: {
                        "$FCFE_1$": eur(fcfe),
                        "Growth g (perpetual)": pct(g),
                        "Cost of equity r_E": pct(rE),
                        "Cash flow basis": "after corporate tax, after interest and debt payments",
                    },
                    answer,
                    explanation: String.raw`$V_E = \sum_t \frac{FCFE_t}{(1+r_E)^t}$, and with constant growth the infinite sum collapses to the growing perpetuity $V_E = \frac{FCFE_1}{r_E - g}$ = ${eur(fcfe)} / (${n(rE / 100)} − ${n(g / 100)}) = ${eur(answer)}`,
                };
            },
        },
        {
            id: "fin-val-entity-method",
            subject: "finance",
            topic: "equity_valuation",
            difficulty: "hard",
            kind: "numeric",
            unit: "EUR",
            build: (rng) => {
                // Growth first, WACC strictly above it, so r_WACC − g ≥ 4 pp.
                const g = rng.int(1, 4);
                const wacc = g + rng.int(4, 9);
                const fcf = rng.int(300, 1200) * 1000;
                const answer = fcf / ((wacc - g) / 100);
                return {
                    prompt: `Value a firm with the **entity method**: the free cash flow to the firm is ${eur(fcf)} next year and then grows at a constant ${pct(g)} p.a. **in perpetuity**. The FCF is the **unlevered after-tax cash flow** - taxed as if the firm were all-equity financed, so the tax advantage of debt sits in the WACC, not in the cash flow. The WACC is ${pct(wacc)}. What is the **total firm value**?`,
                    given: {
                        "$FCF_1$": eur(fcf),
                        "Growth g (perpetual)": pct(g),
                        WACC: pct(wacc),
                        "Cash flow basis": "unlevered, after corporate tax",
                    },
                    answer,
                    explanation: String.raw`$V = \sum_t \frac{FCF_t}{(1+r_{WACC})^t}$, and with constant growth the infinite sum collapses to the growing perpetuity $V = \frac{FCF_1}{r_{WACC} - g}$ = ${eur(fcf)} / (${n(wacc / 100)} − ${n(g / 100)}) = ${eur(answer)}`,
                };
            },
        },
        {
            id: "fin-val-apv-method",
            subject: "finance",
            topic: "equity_valuation",
            difficulty: "hard",
            kind: "numeric",
            unit: "EUR",
            build: (rng) => {
                // Growth first, unlevered cost strictly above it, so r_U − g ≥ 5 pp.
                const g = rng.int(1, 4);
                const rU = g + rng.int(5, 10);
                const fcf = rng.int(300, 1000) * 1000;
                const D = rng.int(100, 800) * 1000;
                const rD = rng.int(3, 7);
                const tauC = rng.pick([0.25, 0.3]);
                const vU = fcf / ((rU - g) / 100);
                const its = tauC * D;
                const answer = vU + its;
                return {
                    prompt: `Value a firm with the **APV method**. Its unlevered free cash flow is ${eur(fcf)} next year and grows at a constant ${pct(g)} p.a. **in perpetuity**; it is taxed as if the firm were all-equity financed and is discounted at the unlevered cost of capital of ${pct(rU)}. The firm also carries **permanent debt** of ${eur(D)} at a cost of debt of ${pct(rD)} (interest only, principal rolled over forever), and the **corporate tax rate is $τ_C$ = ${pct(tauC * 100)}**. What is the **value of the levered firm (APV)**?`,
                    given: {
                        "$FCF_1$ (unlevered, after tax)": eur(fcf),
                        "Growth g (perpetual)": pct(g),
                        "$r_U$": pct(rU),
                        "Permanent debt D": eur(D),
                        "$r_D$": pct(rD),
                        "$τ_C$": pct(tauC * 100),
                    },
                    answer,
                    explanation: String.raw`APV values the two pieces separately. Unlevered: $V_U = \frac{FCF_1}{r_U - g}$ = ${eur(fcf)} / (${n(rU / 100)} − ${n(g / 100)}) = ${eur(vU)}. Tax shield of permanent debt: $PV(ITS) = \frac{\tau_C \cdot D \cdot r_D}{r_D} = \tau_C \cdot D$ = ${eur(its)}. $APV = V_U + PV(ITS)$ = ${eur(vU)} + ${eur(its)} = ${eur(answer)}`,
                };
            },
        },

    {
        id: "fin-ci-right-div",
        subject: "finance",
        topic: "capital_increase",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const BV = rng.int(2, 6);
            const Pcum = rng.int(70, 160);
            // Keep the subscription price well below the cum-rights price: the gap
            // (>= 25 EUR) always exceeds the largest possible dividend disadvantage
            // (<= 3 EUR), so the subscription right can never turn negative.
            const IP = rng.int(30, Pcum - 25);
            const divNew = rng.float(0, 2, 2);
            const divOld = divNew + rng.float(0.5, 3, 2); // old share never pays less
            const rE = rng.int(4, 10);
            const months = rng.pick([3, 6, 9, 12]);
            const q = 1 + rE / 100;
            const t = months / 12;
            const disadv = (divOld - divNew) / q ** t;
            const answer = (Pcum - IP - disadv) / (BV + 1);
            return {
                prompt: `A rights issue **against cash contributions** (Kapitalerhöhung gegen Einlagen) is carried out at a subscription ratio of ${BV}:1. The price cum rights is ${eur(Pcum)}, the subscription price of the new shares is ${eur(IP)}. The new shares carry a **dividend disadvantage**: for the current year the old shares receive ${eur(divOld)}, the new shares only ${eur(divNew)}. That dividend falls due in ${months} months and is discounted at ${pct(rE)}. What is the theoretical value of the **subscription right**?`,
                given: {
                    "Subscription ratio": `${BV}:1`,
                    "$P_{cum}$": eur(Pcum),
                    "Subscription price IP": eur(IP),
                    "Dividend old share": eur(divOld),
                    "Dividend new share": eur(divNew),
                    "Time to dividend t": `${months} months`,
                    "Discount rate": pct(rE),
                },
                answer,
                explanation: String.raw`Dividend disadvantage: $(Div_{old} - Div_{new}) \cdot q^{-t}$ = ${eur(divOld - divNew)} discounted over ${months} months = ${eur(disadv)}. $SR = \frac{P_{cum} - IP - (Div_{old} - Div_{new}) \cdot q^{-t}}{BV + 1}$ = (${eur(Pcum)} − ${eur(IP)} − ${eur(disadv)}) / ${BV + 1} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ci-funds-pex",
        subject: "finance",
        topic: "capital_increase",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const BV = rng.int(2, 8);
            const Pcum = rng.int(60, 220);
            const answer = Pcum / (1 + 1 / BV);
            return {
                prompt: `A capital increase **from company funds** (Kapitalerhöhung aus Gesellschaftsmitteln) converts reserves into share capital. Shareholders receive the new shares free of charge, so **no subscription price is paid in** - the market value of the company is unchanged and only spread over more shares. The subscription ratio is ${BV}:1 (${BV} old shares carry one new share) and the price cum rights is ${eur(Pcum)}. What is the **price after the capital increase ($P_{ex}$)**?`,
                given: {
                    "Capital increase": "from company funds (nothing paid in)",
                    "Subscription ratio": `${BV}:1`,
                    "$P_{cum}$": eur(Pcum),
                },
                answer,
                explanation: String.raw`$P_{ex} = \frac{P_{cum}}{1 + \frac{1}{BV}}$ = ${eur(Pcum)} / ${n2(1 + 1 / BV)} = ${eur(answer)} - the value of ${BV} old shares at ${eur(Pcum)} is spread over ${BV + 1} shares. There is no issue-price term, unlike a rights issue against cash contributions.`,
            };
        },
    },
    {
        id: "fin-opt-binomial-put",
        subject: "finance",
        topic: "options",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        build: (rng) => {
            const S = rng.int(85, 130);
            // Strike stays above S·d (d <= 0.90 and K >= S − 5 with S >= 85), so the
            // put always has value in the down state.
            const K = S + rng.int(-5, 25);
            const rRF = rng.int(1, 6);
            // d <= 0.90 < 1 + r_f <= 1.06 <= 1.15 <= u, so 0 < p < 1 for every seed.
            const u = rng.float(1.15, 1.45, 2);
            const d = rng.float(0.65, 0.9, 2);
            const p = (1 + rRF / 100 - d) / (u - d);
            const Pu = Math.max(K - S * u, 0);
            const Pd = Math.max(K - S * d, 0);
            const answer = (p * Pu + (1 - p) * Pd) / (1 + rRF / 100);
            return {
                prompt: `One-period binomial model: the share trades at ${eur(S)} today and in one year is worth either ×${n2(u)} or ×${n2(d)} of that. The risk-free rate is ${pct(rRF)}. What is the **value of the European put** with a strike of ${eur(K)}?`,
                given: { "$S_0$": eur(S), K: eur(K), u: n2(u), d: n2(d), "$r_f$": pct(rRF) },
                answer,
                explanation: String.raw`$p = \frac{(1 + r_f) - d}{u - d} = ${n2(p)}$; payoffs $P_u = \max(K - S_0 \cdot u,\ 0)$ = ${eur(Pu)}, $P_d = \max(K - S_0 \cdot d,\ 0)$ = ${eur(Pd)}; $P_0 = \frac{p \cdot P_u + (1 - p) \cdot P_d}{1 + r_f}$ = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-eq-pb",
        subject: "finance",
        topic: "equity_valuation",
        difficulty: "medium",
        kind: "numeric",
        unit: "ratio",
        build: (rng) => {
            const bookPerShare = rng.float(4, 60, 2);
            const multiple = rng.float(0.6, 3.6, 2);
            // Round the price to cents so the number on screen is the number graded.
            const P0 = Math.round(bookPerShare * multiple * 100) / 100;
            const answer = P0 / bookPerShare;
            return {
                prompt: `A share trades at ${eur(P0)}. The company's book value of equity is ${eur(bookPerShare)} per share. What is its **price-to-book ratio (P/B)**?`,
                given: { "Price $P_0$": eur(P0), "Book value of equity per share": eur(bookPerShare) },
                answer,
                explanation: String.raw`$P/B = \frac{P_0}{\text{book value per share}}$ = ${eur(P0)} / ${eur(bookPerShare)} = ${n2(answer)}`,
            };
        },
    },
    {
        id: "fin-inv-pi",
        subject: "finance",
        topic: "investment",
        difficulty: "medium",
        kind: "numeric",
        unit: "ratio",
        build: (rng) => {
            const I0 = rng.int(20, 120) * 1000;
            const T = rng.int(3, 5);
            // Lower bound 1.4 keeps the NPV - and with it the index - positive even
            // in the worst corner of the ranges (T = 5 at r = 10 %).
            const cf = Math.round((I0 / T) * rng.float(1.4, 1.95, 3));
            const r = rng.int(4, 10);
            const flows = [-I0, ...Array.from({ length: T }, () => cf)];
            const value = npv(flows, r / 100);
            const answer = value / I0;
            return {
                prompt: `Capital is rationed, so projects are ranked by their **profitability index** - the NPV per euro of the scarce resource they consume. A project ties up ${eur(I0)} of capital today and returns ${eur(cf)} at the end of each of the next ${T} years; the discount rate is ${pct(r)}. What is its **profitability index**?`,
                given: {
                    "Capital consumed $I_0$": eur(I0),
                    "Cash flow p.a.": eur(cf),
                    Term: `${T} years`,
                    r: pct(r),
                },
                answer,
                explanation: String.raw`First the NPV: $NPV = -I_0 + \sum_{t=1}^{T} \frac{CF_t}{(1+i)^t}$ = ${eur(value)}. Then $PI = \frac{NPV}{I_0}$ = ${eur(value)} / ${eur(I0)} = ${n2(answer)}`,
            };
        },
    },
    {
        id: "fin-bond-dmod",
        subject: "finance",
        topic: "bonds",
        difficulty: "medium",
        kind: "numeric",
        unit: "years",
        build: (rng) => {
            const BN = 1000;
            const couponRate = rng.int(2, 8);
            const C = BN * (couponRate / 100);
            const r = rng.int(2, 9);
            const N = rng.int(3, 12);
            const { duration } = macaulayDuration(C, BN, r / 100, N);
            const answer = duration / (1 + r / 100);
            return {
                prompt: `A bond (face value ${eur(BN)}, coupon ${pct(couponRate)}, remaining term ${N} years) trades at a yield to maturity of ${pct(r)} and has a **Macaulay duration** of ${n2(duration)} years. What is its **modified duration**?`,
                given: {
                    "Macaulay duration D": `${n2(duration)} years`,
                    "Yield to maturity r": pct(r),
                    Coupon: pct(couponRate),
                    N: `${N} years`,
                },
                answer,
                explanation: String.raw`$D_{mod} = \frac{D}{1 + i}$ = ${n2(duration)} / ${n(1 + r / 100)} = ${n2(answer)} years`,
            };
        },
    },

    // ------------------------------------------------ interest (IVF tutorials)
    {
        id: "fin-int-simple-pv",
        subject: "finance",
        topic: "interest",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF FM catalogue Oct23, 1.1.2",
        build: (rng) => {
            const CN = rng.int(20, 200) * 100;
            const r = rng.int(2, 9);
            const N = rng.int(2, 8);
            const answer = CN / (1 + (r / 100) * N);
            return {
                prompt: `A savings product pays **simple interest** (no compounding) at ${pct(r)} p.a. What amount do you have to invest today to receive exactly ${eur(CN)} in ${N} years?`,
                given: { "Target amount $C_N$": eur(CN), "Interest rate r": pct(r), "Term N": `${N} years` },
                answer,
                explanation: String.raw`$C_0 = \frac{C_N}{1 + N \cdot i}$ - with simple interest the initial capital earns $N \cdot i = ${n(N * (r / 100))}$ in total: ${eur(CN)} / ${n2(1 + N * (r / 100))} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-int-daycount",
        subject: "finance",
        topic: "interest",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF FM catalogue Oct23, 1.1.3",
        build: (rng) => {
            const months = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December",
            ];
            const C0 = rng.int(20, 200) * 100;
            const r = rng.float(1.5, 6, 2);
            const m1 = rng.int(1, 6);
            const d1 = rng.int(1, 28);
            const m2 = m1 + rng.int(2, 5);
            const d2 = rng.int(1, 28);
            const days = (m2 - m1) * 30 + (d2 - d1);
            const answer = C0 * (1 + (r / 100) * (days / 360));
            return {
                prompt: `A fixed-term deposit of ${eur(C0)} runs from ${months[m1 - 1]} ${d1} to ${months[m2 - 1]} ${d2} of the same year at a **simple** interest rate of ${pct(r)} p.a. Using the **30/360 day-count convention** (every month counts 30 days, the year counts 360 days), what is the balance at the end of the term?`,
                given: {
                    "Deposit $C_0$": eur(C0),
                    "Interest rate r": pct(r),
                    "Term": `${months[m1 - 1]} ${d1} to ${months[m2 - 1]} ${d2}`,
                    "Day count": "30/360",
                },
                answer,
                explanation: String.raw`Interest days under 30/360: $(${m2} - ${m1}) \cdot 30 + (${d2} - ${d1}) = ${n(days)}$ days. Then $C_t = C_0 \cdot \left(1 + i \cdot \frac{t}{360}\right)$ = ${eur(C0)} · (1 + ${n(r / 100)} · ${n(days)}/360) = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-int-solve-rate",
        subject: "finance",
        topic: "interest",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM IVF FM catalogue Oct23, 1.2.1",
        build: (rng) => {
            const C0 = rng.int(50, 500) * 100;
            const N = rng.int(3, 12);
            const CN = Math.round(C0 * rng.float(1.2, 2.5, 3));
            const answer = ((CN / C0) ** (1 / N) - 1) * 100;
            return {
                prompt: `An account with **annual compound interest** turns a deposit of ${eur(C0)} into ${eur(CN)} after ${N} years. What constant annual interest rate does the account pay?`,
                given: { "$C_0$": eur(C0), "$C_N$": eur(CN), "Term N": `${N} years` },
                answer,
                explanation: String.raw`From $C_N = C_0 \cdot q^N$ follows $i = \sqrt[N]{\frac{C_N}{C_0}} - 1$ = $\sqrt[${N}]{${n2(CN / C0)}} - 1$ = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-int-solve-time",
        subject: "finance",
        topic: "interest",
        difficulty: "medium",
        kind: "numeric",
        unit: "years",
        source: "TUM IVF FM catalogue Oct23, 1.1.7",
        build: (rng) => {
            const M = rng.pick([1.5, 2, 2.5, 3]);
            const r = rng.int(2, 9);
            const q = 1 + r / 100;
            const answer = Math.log(M) / Math.log(q);
            const label = M === 2 ? "double" : M === 3 ? "triple" : `grow to ${n(M)} times its value`;
            return {
                prompt: `Capital is invested at ${pct(r)} p.a. with **annual compound interest**. After how many years N does it ${label}? Give the exact N (it need not be an integer).`,
                given: { "Growth factor $C_N / C_0$": n(M), "Interest rate r": pct(r) },
                answer,
                explanation: String.raw`From $C_N = C_0 \cdot q^N$: $N = \frac{\ln(C_N / C_0)}{\ln q}$ = $\frac{\ln ${n(M)}}{\ln ${n(q)}}$ = ${n2(answer)} years. In practice the bank credits interest only at year-end, so the balance actually passes the target after ${n(Math.ceil(answer))} full years.`,
            };
        },
    },
    {
        id: "fin-int-cont-implied",
        subject: "finance",
        topic: "interest",
        difficulty: "hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM IVF FM catalogue Oct23, 1.1.13",
        build: (rng) => {
            const C1 = rng.int(200, 1500) * 100;
            const C2 = Math.round(C1 * rng.float(1.03, 1.18, 4));
            const answer = Math.log(C2 / C1) * 100;
            return {
                prompt: `An account earns **continuously compounded** interest at a constant rate. One year after the deposit the balance is ${eur(C1)}, one year later it is ${eur(C2)}. What is the continuous interest rate r?`,
                given: { "Balance after 1 year $C_1$": eur(C1), "Balance after 2 years $C_2$": eur(C2) },
                answer,
                explanation: String.raw`With continuous compounding $C_2 = C_1 \cdot e^{r}$, so $r = \ln\frac{C_2}{C_1}$ = $\ln ${n2(C2 / C1)}$ = ${pct(answer)}. (The initial deposit would be $C_0 = C_1 \cdot e^{-r}$ = ${eur(C1 / (C2 / C1))}.)`,
            };
        },
    },
    {
        id: "fin-int-cont-equivalent",
        subject: "finance",
        topic: "interest",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM IVF FM catalogue Oct23, 1.2.4",
        build: (rng) => {
            const r = rng.int(2, 10);
            const answer = Math.log(1 + r / 100) * 100;
            return {
                prompt: `An investment earns ${pct(r)} p.a. with **annual compound interest**. Which **continuously compounded** rate produces exactly the same discount factor over the same horizon?`,
                given: { "Annual compound rate i": pct(r) },
                answer,
                explanation: String.raw`Equal growth factors require $e^{r} = 1 + i$, so $r = \ln(1 + i)$ = $\ln ${n(1 + r / 100)}$ = ${pct(answer)}. The continuous rate is always slightly below the discrete rate, because compounding happens at every instant. (The reverse direction is $i_{eff} = e^{r} - 1$.)`,
            };
        },
    },

    // ------------------------------------------------ annuities (IVF tutorials)
    {
        id: "fin-ann-solve-payment",
        subject: "finance",
        topic: "annuities",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF FM catalogue Oct23, 2.1.1",
        build: (rng) => {
            const FV = rng.int(50, 400) * 1000;
            const r = rng.int(2, 7);
            const N = rng.int(8, 35);
            const q = 1 + r / 100;
            const answer = FV * ((q - 1) / (q ** N - 1));
            return {
                prompt: `A savings plan should reach a balance of ${eur(FV)} after ${N} years. Payments are made **at the end of each year** into an account earning ${pct(r)} p.a. What constant annual payment C is required?`,
                given: {
                    "Target balance FV": eur(FV),
                    "Interest rate r": pct(r),
                    "Number of payments N": String(N),
                    "Payment timing": "annuity-immediate (in arrears)",
                },
                answer,
                explanation: String.raw`Solve the future-value formula for the payment: $C = FV \cdot \frac{q - 1}{q^N - 1}$ with $q = ${n(q)}$ and $q^{${N}} = ${n2(q ** N)}$: ${eur(FV)} · ${n(r / 100)} / ${n2(q ** N - 1)} = ${eur(answer)}. (For payments at the beginning of each year, divide once more by $q$.)`,
            };
        },
    },
    {
        id: "fin-ann-solve-term",
        subject: "finance",
        topic: "annuities",
        difficulty: "medium",
        kind: "numeric",
        unit: "years",
        source: "TUM IVF FM catalogue Oct23, 2.1.1",
        build: (rng) => {
            const C = rng.int(10, 60) * 100;
            const r = rng.int(2, 7);
            const FV = C * rng.int(15, 60);
            const q = 1 + r / 100;
            const answer = Math.log(1 + (FV * (q - 1)) / C) / Math.log(q);
            return {
                prompt: `You pay ${eur(C)} into an account **at the end of each year**; the account earns ${pct(r)} p.a. After how many years N does the balance reach ${eur(FV)}? Give the exact N (it need not be an integer).`,
                given: {
                    "Payment C": eur(C),
                    "Interest rate r": pct(r),
                    "Target balance FV": eur(FV),
                    "Payment timing": "annuity-immediate (in arrears)",
                },
                answer,
                explanation: String.raw`Solve $FV = C \cdot \frac{q^N - 1}{q - 1}$ for N: $N = \frac{\ln\left(1 + \frac{q - 1}{C} \cdot FV\right)}{\ln q}$ = $\frac{\ln ${n2(1 + (FV * (q - 1)) / C)}}{\ln ${n(q)}}$ = ${n2(answer)} years - the target is passed with the payment in year ${n(Math.ceil(answer))}.`,
            };
        },
    },
    {
        id: "fin-ann-payout-term",
        subject: "finance",
        topic: "annuities",
        difficulty: "hard",
        kind: "numeric",
        unit: "years",
        source: "TUM IVF FM catalogue Oct23, 2.1.10",
        build: (rng) => {
            const PV = rng.int(100, 800) * 1000;
            const r = rng.int(2, 6);
            const i = r / 100;
            const q = 1 + i;
            const C = Math.round(PV * i * rng.float(1.25, 2.4, 3));
            const answer = (Math.log(C) - Math.log(C - PV * i)) / Math.log(q);
            return {
                prompt: `A retiree has saved ${eur(PV)}. The capital stays invested at ${pct(r)} p.a. and a pension of ${eur(C)} is withdrawn **at the end of each year**. For how many years N can the pension be paid before the capital is used up? Give the exact N.`,
                given: {
                    "Initial capital PV": eur(PV),
                    "Interest rate r": pct(r),
                    "Annual withdrawal C": eur(C),
                    "Payment timing": "annuity-immediate (in arrears)",
                },
                answer,
                explanation: String.raw`Solve the present-value formula $PV = C \cdot \frac{q^N - 1}{q^N (q - 1)}$ for N: $N = \frac{\ln C - \ln\left(C - PV \cdot i\right)}{\ln q}$. The annual interest on the capital is $PV \cdot i$ = ${eur(PV * i)}, so N = (ln ${eur(C)} − ln ${eur(C - PV * i)}) / ln ${n(q)} = ${n2(answer)} years. The withdrawal must exceed the interest earned, otherwise the capital would last forever.`,
            };
        },
    },
    {
        id: "fin-ann-two-phase",
        subject: "finance",
        topic: "annuities",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF FM catalogue Oct23, 2.1.13",
        build: (rng) => {
            const C2 = rng.int(12, 40) * 1000;
            const N1 = rng.int(10, 30);
            const N2 = rng.int(10, 25);
            const r = rng.int(3, 7);
            const q = 1 + r / 100;
            const pvPayout = C2 * ((q ** N2 - 1) / (q ** N2 * (q - 1)));
            const answer = pvPayout * ((q - 1) / (q ** N1 - 1));
            return {
                prompt: `An employee saves a constant amount **at the end of each year for ${N1} years**. Immediately afterwards the accumulated capital finances a pension of ${eur(C2)}, paid **at the end of each of the following ${N2} years**, after which nothing is left. The interest rate is ${pct(r)} throughout. How much must be saved each year?`,
                given: {
                    "Saving phase": `${N1} years, in arrears`,
                    "Pension C": eur(C2),
                    "Payout phase": `${N2} years, in arrears`,
                    "Interest rate r": pct(r),
                },
                answer,
                explanation: String.raw`Capital needed at the switchover: $PV = C \cdot \frac{q^{N_2} - 1}{q^{N_2}(q - 1)}$ = ${eur(pvPayout)}. The savings must accumulate to exactly this amount: $C_{save} = PV \cdot \frac{q - 1}{q^{N_1} - 1}$ = ${eur(pvPayout)} · ${n(r / 100)} / ${n2(q ** N1 - 1)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ann-intra-fv",
        subject: "finance",
        topic: "annuities",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF FM catalogue Oct23, 2.1.17",
        build: (rng) => {
            const C = rng.int(1, 10) * 25;
            const m = rng.pick([4, 12]);
            const r = rng.int(2, 7);
            const N = rng.int(4, 12);
            const i = r / 100;
            const q = 1 + i;
            const label = m === 4 ? "quarter" : "month";
            const Cp = C * (m + (i * (m + 1)) / 2);
            const answer = Cp * ((q ** N - 1) / (q - 1));
            return {
                prompt: `A student pays ${eur(C)} into a savings plan **at the beginning of each ${label}** (m = ${m} payments per year). Interest of ${pct(r)} p.a. is credited **once a year at year-end**; within the year the payments earn simple (linear) interest. What is the balance after ${N} years?`,
                given: {
                    "Payment per sub-period C": eur(C),
                    "Payments per year m": String(m),
                    "Interest rate r": pct(r),
                    "Term N": `${N} years`,
                    "Payment timing": "in advance (annuity due)",
                },
                answer,
                explanation: String.raw`First replace the ${m} sub-period payments by one fictitious year-end payment: $C' = C \cdot \left(m + i \cdot \frac{m + 1}{2}\right)$ = ${eur(C)} · (${m} + ${n(i)} · ${n((m + 1) / 2)}) = ${eur(Cp)}. Then apply the ordinary annuity future-value factor: $FV = C' \cdot \frac{q^N - 1}{q - 1}$ = ${eur(Cp)} · ${n2((q ** N - 1) / (q - 1))} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ann-geom-term",
        subject: "finance",
        topic: "annuities",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "years",
        source: "TUM IVF FM catalogue Oct23, 2.1.23",
        build: (rng) => {
            const PV = rng.int(100, 600) * 1000;
            const w = rng.int(1, 4);
            const r = w + rng.int(1, 3);
            const g = 1 + w / 100;
            const q = 1 + r / 100;
            const C = Math.round(PV * ((r - w) / 100) * rng.float(3, 9, 2));
            const answer = Math.log(1 + (PV * (g - q)) / C) / Math.log(g / q);
            return {
                prompt: `A craftswoman sells her business for ${eur(PV)}. Instead of cash she receives an annual pension, paid **at the end of each year**: the first payment is ${eur(C)} and every following payment grows by ${pct(w)}. The capital earns ${pct(r)} p.a. For how many years N can this growing pension be paid? Give the exact N.`,
                given: {
                    "Sale price PV": eur(PV),
                    "First payment C": eur(C),
                    "Growth rate w": pct(w),
                    "Interest rate r": pct(r),
                    "Payment timing": "annuity-immediate (in arrears)",
                },
                answer,
                explanation: String.raw`Solve the geometric-annuity present value $PV = C \cdot \frac{1 - \left(\frac{g}{q}\right)^{N}}{q - g}$ for N: $N = \frac{\ln\left(1 + PV \cdot \frac{g - q}{C}\right)}{\ln\frac{g}{q}}$ with $g = ${n(g)}$ and $q = ${n(q)}$: the log argument is ${n2(1 + (PV * (g - q)) / C)}, so N = ${n2(answer)} years.`,
            };
        },
    },
    {
        id: "fin-ann-geom-payment",
        subject: "finance",
        topic: "annuities",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF FM catalogue Oct23, 2.2.7",
        build: (rng) => {
            const PV = rng.int(100, 600) * 1000;
            const w = rng.int(1, 4);
            const r = w + rng.int(1, 4);
            const g = 1 + w / 100;
            const q = 1 + r / 100;
            const N = rng.int(15, 30);
            const answer = (PV * ((r - w) / 100)) / (1 - (g / q) ** N);
            return {
                prompt: `An amount of ${eur(PV)} is invested at ${pct(r)} p.a. From it an annuity is paid **at the end of each year for ${N} years**; every payment is ${pct(w)} higher than the one before, and after the last payment the capital is exactly used up. What is the **first** annual payment?`,
                given: {
                    "Capital PV": eur(PV),
                    "Interest rate r": pct(r),
                    "Growth rate w": pct(w),
                    "Term N": `${N} years`,
                    "Payment timing": "annuity-immediate (in arrears)",
                },
                answer,
                explanation: String.raw`Solve the geometric-annuity present value for the first payment: $C = PV \cdot \frac{q - g}{1 - \left(\frac{g}{q}\right)^{N}}$ with $q - g = ${n((r - w) / 100)}$ and $\left(\frac{g}{q}\right)^{${N}} = ${n2((g / q) ** N)}$: C = ${eur(answer)}. (A perpetual version would start lower, at $PV \cdot (q - g)$ = ${eur(PV * ((r - w) / 100))}.)`,
            };
        },
    },

    // ------------------------------------------------ repayment (IVF tutorials)
    {
        id: "fin-rep-installment-interest",
        subject: "finance",
        topic: "repayment",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF FM catalogue Oct23, 3.1.2",
        build: (rng) => {
            const D0 = rng.int(40, 300) * 1000;
            const N = rng.int(8, 25);
            const k = rng.int(2, N);
            const r = rng.int(2, 8);
            const answer = D0 * (1 - (k - 1) / N) * (r / 100);
            return {
                prompt: `An **installment loan** (constant principal repayments) of ${eur(D0)} runs over ${N} years at ${pct(r)}. Interest is paid each year on the outstanding balance at the start of the year. How much **interest** is due in year ${k}?`,
                given: { "Loan $D_0$": eur(D0), "Term N": `${N} years`, "Interest rate r": pct(r), "Year k": String(k) },
                answer,
                explanation: String.raw`After $k - 1$ repayments of $\frac{D_0}{N}$ the balance is $D_{k-1} = D_0 \cdot \left(1 - \frac{k - 1}{N}\right)$ = ${eur(D0 * (1 - (k - 1) / N))}. Interest in year ${k}: $I_k = D_{k-1} \cdot i$ = ${eur(D0 * (1 - (k - 1) / N))} · ${n(r / 100)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-rep-annuity-principal",
        subject: "finance",
        topic: "repayment",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF FM catalogue Oct23, 3.1.4",
        build: (rng) => {
            const D0 = rng.int(50, 300) * 1000;
            const r = rng.int(2, 7);
            const N = rng.int(8, 25);
            const k = rng.int(2, N);
            const i = r / 100;
            const q = 1 + i;
            const A = D0 * ((q ** N * (q - 1)) / (q ** N - 1));
            const T1 = A - D0 * i;
            const answer = T1 * q ** (k - 1);
            return {
                prompt: `An **annuity loan** of ${eur(D0)} (${pct(r)}, ${N} years, payment at the end of each year) is repaid with a constant annuity. How large is the **principal repayment portion** of the payment in year ${k}?`,
                given: { "Loan $D_0$": eur(D0), "Interest rate r": pct(r), "Term N": `${N} years`, "Year k": String(k) },
                answer,
                explanation: String.raw`The annuity is $A = D_0 \cdot \frac{q^N (q - 1)}{q^N - 1}$ = ${eur(A)}. In year 1 the principal portion is $T_1 = A - i \cdot D_0$ = ${eur(A)} − ${eur(D0 * i)} = ${eur(T1)}. The principal portions grow geometrically with factor q: $T_k = T_1 \cdot q^{k-1}$ = ${eur(T1)} · ${n2(q ** (k - 1))} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-rep-max-loan",
        subject: "finance",
        topic: "repayment",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF FM catalogue Oct23, 3.1.5",
        build: (rng) => {
            const A = rng.int(4, 30) * 500;
            const r = rng.int(2, 8);
            const N = rng.int(5, 25);
            const q = 1 + r / 100;
            const answer = A * ((q ** N - 1) / (q ** N * (q - 1)));
            return {
                prompt: `A borrower can afford annuity payments of ${eur(A)} at the end of each year for ${N} years. The bank charges ${pct(r)} p.a. What is the **maximum loan amount** the borrower can take out?`,
                given: { "Affordable annuity A": eur(A), "Interest rate r": pct(r), "Term N": `${N} years` },
                answer,
                explanation: String.raw`The loan equals the present value of the annuities: $D_0 = A \cdot \frac{q^N - 1}{q^N (q - 1)}$ (present-value annuity factor) with $q = ${n(q)}$: the factor is ${n2((q ** N - 1) / (q ** N * (q - 1)))}, so $D_0$ = ${eur(A)} · ${n2((q ** N - 1) / (q ** N * (q - 1)))} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-rep-term",
        subject: "finance",
        topic: "repayment",
        difficulty: "medium",
        kind: "numeric",
        unit: "years",
        source: "TUM IVF FM catalogue Oct23, 3.1.6",
        build: (rng) => {
            const D0 = rng.int(40, 300) * 1000;
            const r = rng.int(4, 9);
            const q = 1 + r / 100;
            const A = Math.round(D0 * (r / 100) * rng.float(1.5, 3, 2));
            const answer = -Math.log(1 - (D0 * (q - 1)) / A) / Math.log(q);
            return {
                prompt: `A loan of ${eur(D0)} at ${pct(r)} p.a. is repaid with a constant annuity of ${eur(A)} at the end of each year. After how many years N is the loan fully repaid? Give the exact N (it need not be an integer).`,
                given: { "Loan $D_0$": eur(D0), "Interest rate r": pct(r), "Annuity A": eur(A) },
                answer,
                explanation: String.raw`Solve $D_0 = A \cdot \frac{q^N - 1}{q^N (q - 1)}$ for N: $N = \frac{-\ln\left(1 - \frac{D_0 (q - 1)}{A}\right)}{\ln q}$. The annual interest at the start is $D_0 \cdot i$ = ${eur(D0 * (r / 100))}, so the log argument is ${n2(1 - (D0 * (q - 1)) / A)} and N = ${n2(answer)} years - after ${n(Math.floor(answer))} full annuities a smaller residual payment remains.`,
            };
        },
    },
    {
        id: "fin-rep-grace",
        subject: "finance",
        topic: "repayment",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF FM catalogue Oct23, 3.1.7",
        build: (rng) => {
            const D0 = rng.int(50, 250) * 1000;
            const r = rng.int(3, 8);
            const G = rng.int(2, 6);
            const N = rng.int(6, 15);
            const q = 1 + r / 100;
            const Dg = D0 * q ** G;
            const answer = Dg * ((q ** N * (q - 1)) / (q ** N - 1));
            return {
                prompt: `A loan of ${eur(D0)} at ${pct(r)} p.a. starts with ${G} **payment-free years in which no interest is paid** - the interest is added to the loan balance instead. Afterwards the loan is repaid with ${N} equal annuities at the end of each year. What is the annuity?`,
                given: {
                    "Loan $D_0$": eur(D0),
                    "Interest rate r": pct(r),
                    "Grace period": `${G} years, no payments at all`,
                    "Repayment": `${N} annuities in arrears`,
                },
                answer,
                explanation: String.raw`During the grace period the balance compounds: $D_G = D_0 \cdot q^G$ = ${eur(D0)} · ${n2(q ** G)} = ${eur(Dg)}. Then the capital-recovery factor applies: $A = D_G \cdot \frac{q^N (q - 1)}{q^N - 1}$ = ${eur(Dg)} · ${n2((q ** N * (q - 1)) / (q ** N - 1))} = ${eur(answer)}. (If interest were paid during the grace years, the annuity would be computed on ${eur(D0)} instead.)`,
            };
        },
    },

    // ------------------------------------------------ bonds (IVF tutorials)
    {
        id: "fin-bond-zero-hpr",
        subject: "finance",
        topic: "bonds",
        difficulty: "hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM IVF FM catalogue Oct23, 4.1.1",
        build: (rng) => {
            const F = 1000;
            const N = rng.int(10, 25);
            const k = rng.int(3, N - 3);
            const r0 = rng.int(4, 9);
            const deltas = [-3, -2, -1, 1, 2].filter((d) => r0 + d >= 1);
            const r1 = r0 + rng.pick(deltas);
            const P0 = F / (1 + r0 / 100) ** N;
            const Pk = F / (1 + r1 / 100) ** (N - k);
            const answer = ((Pk / P0) ** (1 / k) - 1) * 100;
            return {
                prompt: `A zero-coupon bond (face value ${eur(F)}, maturity ${N} years) is issued when the market rate is ${pct(r0)}. After ${k} years the market rate stands at ${pct(r1)} and the investor sells. What **average annual return** did the investor earn over the ${k} years?`,
                given: {
                    "Face value": eur(F),
                    "Maturity N": `${N} years`,
                    "Rate at issue": pct(r0),
                    [`Rate after ${k} years`]: pct(r1),
                },
                answer,
                explanation: String.raw`Purchase price $B_0 = \frac{B_N}{(1 + i_0)^N}$ = ${eur(P0)}; selling price with ${N - k} years left: $B_k = \frac{B_N}{(1 + i_1)^{N-k}}$ = ${eur(Pk)}. The average return solves $B_0 \cdot (1 + r)^k = B_k$: $r = \sqrt[k]{\frac{B_k}{B_0}} - 1$ = ${pct(answer)}. A drop in the interest level lifts the return above ${pct(r0)}, a rise pushes it below.`,
            };
        },
    },
    {
        id: "fin-bond-final-wealth",
        subject: "finance",
        topic: "bonds",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF FM catalogue Oct23, 4.1.6",
        build: (rng) => {
            const F = 1000;
            const c = rng.int(3, 9);
            const C = F * (c / 100);
            const r = rng.int(3, 9);
            const N = rng.int(3, 10);
            const prem = rng.pick([0, 10, 20]);
            const red = F + prem;
            const q = 1 + r / 100;
            const answer = red + C * ((q ** N - 1) / (q - 1));
            return {
                prompt: `An investor buys a corporate bond today: face value ${eur(F)}, annual coupon ${pct(c)}, remaining term ${N} years, redemption at ${eur(red)}${prem > 0 ? ` (${eur(prem)} premium over face value)` : ""}. She holds the bond to maturity and **reinvests every coupon at the market rate of ${pct(r)}**. What is her total wealth at maturity?`,
                given: {
                    "Face value": eur(F),
                    "Coupon p.a.": eur(C),
                    "Redemption": eur(red),
                    "Market rate r": pct(r),
                    "Remaining term N": `${N} years`,
                },
                answer,
                explanation: String.raw`The reinvested coupons form an annuity-immediate compounded to maturity: $FV = B_N^{red} + C \cdot \frac{q^N - 1}{q - 1}$ = ${eur(red)} + ${eur(C)} · ${n2((q ** N - 1) / (q - 1))} = ${eur(answer)}. Held to maturity, this final wealth does not depend on the purchase price - only the return earned on it does.`,
            };
        },
    },
    {
        id: "fin-bond-spot-rate",
        subject: "finance",
        topic: "bonds",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM IVF FM catalogue Oct23, 4.1.8",
        build: (rng) => {
            const F = 1000;
            const T = rng.int(2, 10);
            const s = rng.float(1, 6, 2);
            const P = Math.round((F / (1 + s / 100) ** T) * 100) / 100;
            const answer = ((F / P) ** (1 / T) - 1) * 100;
            return {
                prompt: `A default-free zero-coupon bond with a face value of ${eur(F)} and exactly ${T} years to maturity trades at ${eur(P)}. What is the **${T}-year spot rate** implied by this price?`,
                given: { "Price": eur(P), "Face value": eur(F), "Maturity T": `${T} years` },
                answer,
                explanation: String.raw`The spot rate is the constant annual rate that links price and face value: $Price \cdot (1 + I_T)^T = Face$, so $I_T = \sqrt[T]{\frac{Face}{Price}} - 1$ = $\sqrt[${T}]{${n2(F / P)}} - 1$ = ${pct(answer)}. Repeating this for every maturity traces out the yield curve.`,
            };
        },
    },
    {
        id: "fin-bond-forward-from-prices",
        subject: "finance",
        topic: "bonds",
        difficulty: "hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM IVF FM catalogue Oct23, 4.2.3",
        build: (rng) => {
            const F = 100;
            const s1 = rng.float(1, 4, 2);
            const s2 = s1 + rng.float(0.2, 1.5, 2);
            const P1 = Math.round((F / (1 + s1 / 100)) * 100) / 100;
            const P2 = Math.round((F / (1 + s2 / 100) ** 2) * 100) / 100;
            const answer = (P1 / P2 - 1) * 100;
            return {
                prompt: `Only two default-free zero-coupon bonds trade in the market, both with a face value of ${eur(F)}: the one-year bond costs ${eur(P1)}, the two-year bond costs ${eur(P2)}. What **forward rate for the second year** $f_{1,2}$ do these prices imply?`,
                given: { "1-year zero price": eur(P1), "2-year zero price": eur(P2), "Face value": eur(F) },
                answer,
                explanation: String.raw`Spot rates first: $I_1 = \frac{F}{P_1} - 1$ = ${pct((F / P1 - 1) * 100)} and $I_2 = \sqrt{\frac{F}{P_2}} - 1$ = ${pct((Math.sqrt(F / P2) - 1) * 100)}. No-arbitrage requires $(1 + I_2)^2 = (1 + I_1)(1 + f_{1,2})$, so $f_{1,2} = \frac{(1 + I_2)^2}{1 + I_1} - 1 = \frac{P_1}{P_2} - 1$ = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-bond-price-from-forwards",
        subject: "finance",
        topic: "bonds",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF Tutorial Bonds II, A.3",
        build: (rng) => {
            const F = 1000;
            const c = rng.int(2, 7);
            const C = F * (c / 100);
            const r1 = rng.int(1, 4);
            const r2 = r1 + rng.int(0, 2);
            const r3 = r2 + rng.int(0, 2);
            const q1 = 1 + r1 / 100;
            const q2 = 1 + r2 / 100;
            const q3 = 1 + r3 / 100;
            const answer = C / q1 + C / (q1 * q2) + (C + F) / (q1 * q2 * q3);
            return {
                prompt: `A utility issues a three-year coupon bond: face value ${eur(F)}, annual coupon ${pct(c)}, redemption at par. The market's **forward rates** are $r_1$ = ${pct(r1)} for year 1, $r_2$ = ${pct(r2)} for year 2 and $r_3$ = ${pct(r3)} for year 3. What is the fair price of the bond?`,
                given: {
                    "Face value": eur(F),
                    "Coupon p.a.": eur(C),
                    "$r_1$": pct(r1),
                    "$r_2$": pct(r2),
                    "$r_3$": pct(r3),
                },
                answer,
                explanation: String.raw`With forward rates each cash flow is discounted through the chain of one-year rates: $B_0 = \frac{C}{1 + r_1} + \frac{C}{(1 + r_1)(1 + r_2)} + \frac{C + B_N}{(1 + r_1)(1 + r_2)(1 + r_3)}$ = ${eur(C / q1)} + ${eur(C / (q1 * q2))} + ${eur((C + F) / (q1 * q2 * q3))} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-bond-immunize",
        subject: "finance",
        topic: "bonds",
        difficulty: "medium",
        kind: "numeric",
        unit: "percent",
        source: "TUM IVF FM catalogue Oct23, 4.1.15",
        build: (rng) => {
            const dA = rng.float(1.5, 3.5, 2);
            const dB = dA + rng.float(1.5, 4, 2);
            const target = Math.round((dA + (dB - dA) * rng.float(0.3, 0.7, 2)) * 100) / 100;
            const answer = ((dB - target) / (dB - dA)) * 100;
            return {
                prompt: `A pension fund must meet an obligation in exactly ${n(target)} years and wants its bond portfolio **immunized** against interest-rate changes at that horizon. Two bonds are available: bond A with a duration of ${n2(dA)} years and bond B with a duration of ${n2(dB)} years. What **fraction of the portfolio value must be invested in bond A**?`,
                given: {
                    "Duration bond A": `${n2(dA)} years`,
                    "Duration bond B": `${n2(dB)} years`,
                    "Planning horizon D*": `${n(target)} years`,
                },
                answer,
                explanation: String.raw`The portfolio duration is the value-weighted average: $x_A \cdot D_A + (1 - x_A) \cdot D_B = D^*$. Solving: $x_A = \frac{D_B - D^*}{D_B - D_A}$ = (${n2(dB)} − ${n2(target)}) / (${n2(dB)} − ${n2(dA)}) = ${pct(answer)}; the remaining ${pct(100 - answer)} go into bond B.`,
            };
        },
    },
    {
        id: "fin-bond-perp-duration",
        subject: "finance",
        topic: "bonds",
        difficulty: "easy",
        kind: "numeric",
        unit: "years",
        // Formula stated on the Bonds II duration slide; no worked number in the
        // material, value computed by us.
        source: "TUM IVF Tutorial Bonds II, duration of specific instruments",
        build: (rng) => {
            const r = rng.int(2, 10);
            const i = r / 100;
            const answer = (1 + i) / i;
            return {
                prompt: `A **perpetual bond (consol)** pays a fixed coupon forever and is never redeemed. The market interest rate is ${pct(r)}. What is the Macaulay duration of this bond?`,
                given: { "Market rate r": pct(r), "Maturity": "perpetual (no redemption)" },
                answer,
                explanation: String.raw`For a perpetual bond the duration converges to $D_{perp} = \frac{1 + i}{i}$ = ${n(1 + i)} / ${n(i)} = ${n2(answer)} years - finite even though the maturity is infinite, because distant coupons carry almost no present-value weight.`,
            };
        },
    },
    {
        id: "fin-bond-hpr-1y",
        subject: "finance",
        topic: "bonds",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM IVF FM catalogue Oct23, 4.2.7",
        build: (rng) => {
            const F = 1000;
            const c = rng.int(3, 9);
            const C = F * (c / 100);
            const r0 = rng.int(2, 9);
            const r1raw = rng.int(1, 8);
            const r1 = r1raw >= r0 ? r1raw + 1 : r1raw;
            const N = rng.int(4, 10);
            const { price: B0 } = macaulayDuration(C, F, r0 / 100, N);
            const { price: B1 } = macaulayDuration(C, F, r1 / 100, N - 1);
            const answer = ((B1 + C) / B0 - 1) * 100;
            return {
                prompt: `An investor buys a coupon bond (face value ${eur(F)}, coupon ${pct(c)}, remaining term ${N} years) when the market rate is ${pct(r0)}. One year later, immediately after the first coupon is paid, the market rate stands at ${pct(r1)} and she sells the bond. What **total return** did she earn over the year?`,
                given: {
                    "Face value": eur(F),
                    "Coupon p.a.": eur(C),
                    "Term at purchase": `${N} years`,
                    "Rate at purchase": pct(r0),
                    "Rate at sale": pct(r1),
                },
                answer,
                explanation: String.raw`Purchase price at ${pct(r0)}: $B_0$ = ${eur(B0)}. Selling price one year later, ${N - 1} years remaining, at ${pct(r1)}: $B_1$ = ${eur(B1)}. Total return $= \frac{B_1 + C}{B_0} - 1$ = (${eur(B1)} + ${eur(C)}) / ${eur(B0)} − 1 = ${pct(answer)} - a falling rate adds a price gain to the coupon, a rising rate eats into it.`,
            };
        },
    },

    // ---------------------------------------- equity valuation (IVF tutorials)
    {
        id: "fin-eq-one-year-price",
        subject: "finance",
        topic: "equity_valuation",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF FM catalogue Oct23, 5.1.1",
        build: (rng) => {
            const D1 = rng.float(0.5, 5, 2);
            const P1 = rng.int(20, 150);
            const rE = rng.float(5, 12, 1);
            const answer = (D1 + P1) / (1 + rE / 100);
            return {
                prompt: `An investor plans to hold a pharmaceutical stock for exactly one year. She expects a dividend of ${eur(D1)} and a selling price of ${eur(P1)} at the end of the year. Comparable investments with the same risk return ${pct(rE)}. What is the **maximum price** she should pay today?`,
                given: { "Expected dividend $D_1$": eur(D1), "Expected price $P_1$": eur(P1), "$r_E$": pct(rE) },
                answer,
                explanation: String.raw`$P_0 = \frac{D_1 + P_1}{1 + r_E}$ = (${eur(D1)} + ${eur(P1)}) / ${n(1 + rE / 100)} = ${eur(answer)}. At this price the investment earns exactly the required return; any higher price makes the NPV negative.`,
            };
        },
    },
    {
        id: "fin-eq-implied-growth",
        subject: "finance",
        topic: "equity_valuation",
        difficulty: "medium",
        kind: "numeric",
        unit: "percent",
        source: "TUM IVF FM catalogue Oct23, 5.1.3",
        build: (rng) => {
            const D1 = rng.float(1, 8, 2);
            const wT = rng.int(1, 5);
            const rE = wT + rng.int(3, 7);
            const P0 = Math.round(D1 / ((rE - wT) / 100));
            const answer = rE - (D1 / P0) * 100;
            return {
                prompt: `A regional bank's share trades at ${eur(P0)}. The dividend expected for next year is ${eur(D1)} and the cost of equity is ${pct(rE)}. Which **constant perpetual dividend growth rate w** justifies the current share price (Gordon growth model)?`,
                given: { "Share price $P_0$": eur(P0), "$D_1$": eur(D1), "$r_E$": pct(rE) },
                answer,
                explanation: String.raw`Invert the Gordon growth model $P_0 = \frac{D_1}{r_E - w}$: $w = r_E - \frac{D_1}{P_0}$ = ${pct(rE)} − ${eur(D1)} / ${eur(P0)} = ${pct(rE)} − ${pct((D1 / P0) * 100)} = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-eq-retention-price",
        subject: "finance",
        topic: "equity_valuation",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF FM catalogue Oct23, 5.1.6",
        build: (rng) => {
            const P0 = rng.int(30, 90);
            const rE = rng.int(8, 14);
            const EPS1 = (P0 * rE) / 100;
            const p = rng.pick([0.6, 0.7, 0.75, 0.8]);
            const roeCap = Math.min(20, Math.floor((rE - 2) / (1 - p)));
            const ROE = rng.int(6, roeCap);
            const w = (1 - p) * ROE;
            const D1 = p * EPS1;
            const answer = D1 / ((rE - w) / 100);
            return {
                prompt: `A sporting-goods chain expects earnings per share of ${eur(EPS1)} next year and so far pays out **all** earnings as dividends; under this zero-growth policy its share trades at ${eur(P0)}. Management now proposes to cut the payout ratio to ${pct(p * 100)} and invest the retained earnings in new stores earning a permanent return on equity of ${pct(ROE)}. What would the share price be under the new policy?`,
                given: {
                    "$EPS_1$": eur(EPS1),
                    "Price under full payout": eur(P0),
                    "New payout ratio p": pct(p * 100),
                    "ROE on new stores": pct(ROE),
                },
                answer,
                explanation: String.raw`From the zero-growth price the cost of equity is $r_E = \frac{EPS_1}{P_0}$ = ${pct(rE)}. The new dividend is $D_1 = p \cdot EPS_1$ = ${eur(D1)} and retention creates growth $w = (1 - p) \cdot ROE$ = ${pct(w)}. Gordon: $P_0' = \frac{D_1}{r_E - w}$ = ${eur(D1)} / ${n((rE - w) / 100)} = ${eur(answer)}. Retention ${ROE > rE ? "creates" : ROE < rE ? "destroys" : "neither creates nor destroys"} value because ROE ${ROE > rE ? ">" : ROE < rE ? "<" : "="} $r_E$.`,
            };
        },
    },
    {
        id: "fin-eq-pvgo",
        subject: "finance",
        topic: "equity_valuation",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF FM catalogue Oct23, 5.1.8",
        build: (rng) => {
            const P0 = rng.int(20, 120);
            const EPS1 = rng.float(1.5, 9, 2);
            const rE = rng.int(8, 14);
            const answer = P0 - EPS1 / (rE / 100);
            return {
                prompt: `A logistics company's share trades at ${eur(P0)}. Expected earnings per share for next year are ${eur(EPS1)} and the cost of equity is ${pct(rE)}. What is the **present value of growth opportunities (PVGO)** priced into the share? A negative value means the market prices the firm's reinvestment policy as value-destroying.`,
                given: { "Share price $P_0$": eur(P0), "$EPS_1$": eur(EPS1), "$r_E$": pct(rE) },
                answer,
                explanation: String.raw`The zero-growth value (all earnings paid out forever) is $P_0^* = \frac{EPS_1}{r_E}$ = ${eur(EPS1)} / ${n(rE / 100)} = ${eur(EPS1 / (rE / 100))}. Everything above it is growth value: $PVGO = P_0 - \frac{EPS_1}{r_E}$ = ${eur(P0)} − ${eur(EPS1 / (rE / 100))} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-eq-div-yield",
        subject: "finance",
        topic: "equity_valuation",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM IVF Tutorial Stocks, A.1",
        build: (rng) => {
            const issued = rng.int(100, 900) * 1000000;
            const treasury = rng.int(2, 30) * 1000000;
            const outstanding = issued - treasury;
            const P = rng.float(8, 120, 2);
            const dps = P * rng.float(0.01, 0.08, 4);
            const total = Math.round(outstanding * dps);
            const answer = (total / outstanding / P) * 100;
            return {
                prompt: `For the past fiscal year a telecom group distributes total dividends of ${eur(total)}. It has issued ${n(issued)} shares, of which ${n(treasury)} are held by the company itself (treasury shares receive no dividend). The share trades at ${eur(P)}. What is the **dividend yield**?`,
                given: {
                    "Total dividend payment": eur(total),
                    "Shares issued": n(issued),
                    "Treasury shares": n(treasury),
                    "Share price": eur(P),
                },
                answer,
                explanation: String.raw`Dividend per share on the ${n(outstanding)} outstanding shares: $DPS = \frac{\text{total dividends}}{\text{shares outstanding}}$ = ${eur(total / outstanding)}. Then $\text{dividend yield} = \frac{DPS}{P_0}$ = ${eur(total / outstanding)} / ${eur(P)} = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-eq-multiple",
        subject: "finance",
        topic: "equity_valuation",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF Tutorial Stocks, A.13",
        build: (rng) => {
            const pe1 = rng.float(6, 20, 1);
            const pe2 = rng.float(6, 20, 1);
            const pe3 = rng.float(6, 20, 1);
            const EPS = rng.float(1.5, 9, 2);
            const avg = (pe1 + pe2 + pe3) / 3;
            const answer = avg * EPS;
            return {
                prompt: `A chemicals company is to be valued with the **multiple approach**. Its three closest listed peers trade at price-earnings ratios of ${n(pe1)}, ${n(pe2)} and ${n(pe3)}. The company's expected earnings per share are ${eur(EPS)}. What share price does the average peer multiple imply?`,
                given: { "Peer P/E ratios": `${n(pe1)}, ${n(pe2)}, ${n(pe3)}`, "EPS of the company": eur(EPS) },
                answer,
                explanation: String.raw`Average peer multiple: $\overline{P/E} = \frac{${n(pe1)} + ${n(pe2)} + ${n(pe3)}}{3}$ = ${n2(avg)}. Then $P_0 = \overline{P/E} \cdot EPS$ = ${n2(avg)} · ${eur(EPS)} = ${eur(answer)}`,
            };
        },
    },

    // ---------------------------------------------- ratios (CF ch. 1 additions)
    {
        id: "fin-ratio-cash",
        subject: "finance",
        topic: "ratios",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "ratio",
        source: "TUM IVF CF catalogue Sep23, 1.4",
        build: (rng) => {
            const cash = rng.int(20, 150) * 1000;
            const CL = rng.int(100, 500) * 1000;
            const answer = cash / CL;
            return {
                prompt: `A company holds ${eur(cash)} in cash and cash equivalents against current liabilities of ${eur(CL)}. What is its **cash ratio**?`,
                given: { "Cash": eur(cash), "Current liabilities": eur(CL) },
                answer,
                explanation: String.raw`$\text{cash ratio} = \frac{\text{cash}}{CL}$ = ${eur(cash)} / ${eur(CL)} = ${n2(answer)} - the strictest liquidity ratio, counting only cash itself.`,
            };
        },
    },
    {
        id: "fin-ratio-ap-days",
        subject: "finance",
        topic: "ratios",
        difficulty: "medium",
        kind: "numeric",
        unit: "number",
        source: "TUM IVF CF catalogue Sep23, 1.5",
        build: (rng) => {
            const sales = rng.int(500, 3000) * 1000;
            const gross = Math.round(sales * rng.float(0.15, 0.4, 3));
            const AP = rng.int(30, 200) * 1000;
            const cos = sales - gross;
            const answer = AP / (cos / 365);
            return {
                prompt: `A wholesaler reports total sales of ${eur(sales)}, a gross profit of ${eur(gross)} and accounts payable of ${eur(AP)}. For how many **days** of purchases do the accounts payable stand (accounts payable days, 365-day year)?`,
                given: { "Total sales": eur(sales), "Gross profit": eur(gross), "Accounts payable": eur(AP) },
                answer,
                explanation: String.raw`Cost of sales = sales − gross profit = ${eur(cos)}, so average daily cost of sales = ${eur(cos)} / 365 = ${eur(cos / 365)}. Then $\text{AP days} = \frac{\text{accounts payable}}{\text{daily cost of sales}}$ = ${eur(AP)} / ${eur(cos / 365)} = ${n2(answer)} days`,
            };
        },
    },
    {
        id: "fin-ratio-roa",
        subject: "finance",
        topic: "ratios",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM IVF CF catalogue Sep23, 1.14",
        build: (rng) => {
            const NI = rng.int(10, 90) * 1000;
            const IE = rng.int(2, 30) * 1000;
            const TA = rng.int(300, 1500) * 1000;
            const answer = ((NI + IE) / TA) * 100;
            return {
                prompt: `A company reports net income of ${eur(NI)}, interest expense of ${eur(IE)} and total assets of ${eur(TA)}. What is its **return on assets (ROA)**, defined as (net income + interest expense) divided by total assets?`,
                given: { "Net income": eur(NI), "Interest expense": eur(IE), "Total assets": eur(TA) },
                answer,
                explanation: String.raw`$ROA = \frac{\text{net income} + \text{interest expense}}{\text{total assets}}$ - interest is added back so the return on ALL assets is measured before the split between debt and equity holders: (${eur(NI)} + ${eur(IE)}) / ${eur(TA)} = ${pct(answer)}`,
            };
        },
    },

    // -------------------------------- investment appraisal (CF chapters 2 & 3)
    {
        id: "fin-inv-annuity",
        subject: "finance",
        topic: "investment",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF CF catalogue Sep23, 2.34",
        build: (rng) => {
            const NPV = rng.int(20, 300) * 1000;
            const r = rng.int(4, 10);
            const N = rng.int(5, 15);
            const q = 1 + r / 100;
            const crf = (q ** N * (q - 1)) / (q ** N - 1);
            const answer = NPV * crf;
            return {
                prompt: `A project has a net present value of ${eur(NPV)} and runs for ${N} years; the cost of capital is ${pct(r)}. Using the **annuity method**, spread the NPV into an equivalent constant annual amount: what is the project's annuity?`,
                given: { "NPV": eur(NPV), "Term N": `${N} years`, "Cost of capital r": pct(r) },
                answer,
                explanation: String.raw`$A = NPV \cdot \frac{q^N (q - 1)}{q^N - 1}$ (capital-recovery factor) with $q = ${n(q)}$: the factor is ${n2(crf)}, so A = ${eur(NPV)} · ${n2(crf)} = ${eur(answer)}. Ranking projects of equal length by their annuity gives the same decision as the NPV rule.`,
            };
        },
    },
    {
        id: "fin-inv-npv-perpetual",
        subject: "finance",
        topic: "investment",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF CF catalogue Sep23, 2.33",
        build: (rng) => {
            const I0 = rng.int(50, 400) * 1000;
            const r = rng.int(5, 12);
            const cf = Math.round((I0 * (r / 100) * rng.float(0.75, 1.7, 3)) / 100) * 100;
            const answer = -I0 + cf / (r / 100);
            return {
                prompt: `A grid operator can buy a substation for ${eur(I0)} that produces a constant cash flow of ${eur(cf)} at the end of every year **forever**. The cost of capital is ${pct(r)}. What is the **NPV** of the project? A negative answer means the project destroys value.`,
                given: { "Investment $I_0$": eur(I0), "Perpetual CF p.a.": eur(cf), "r": pct(r) },
                answer,
                explanation: String.raw`The inflows form a perpetuity: $NPV = -I_0 + \frac{CF}{i}$ = −${eur(I0)} + ${eur(cf)} / ${n(r / 100)} = −${eur(I0)} + ${eur(cf / (r / 100))} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-inv-irr-lump",
        subject: "finance",
        topic: "investment",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM IVF CF catalogue Sep23, 2.31",
        build: (rng) => {
            const I0 = rng.int(10, 200) * 100;
            const T = rng.int(1, 4);
            const cf = Math.round(I0 * rng.float(1.15, 2.2, 3));
            const answer = ((cf / I0) ** (1 / T) - 1) * 100;
            return {
                prompt: `A forestry project requires ${eur(I0)} today and pays back a **single** cash flow of ${eur(cf)} after ${T} year${T > 1 ? "s" : ""} - nothing in between. What is the project's internal rate of return (IRR)?`,
                given: { "Investment $I_0$": eur(I0), [`Payoff in year ${T}`]: eur(cf) },
                answer,
                explanation: String.raw`Set the NPV to zero: $-I_0 + \frac{CF_T}{(1 + IRR)^T} = 0$, so $IRR = \sqrt[T]{\frac{CF_T}{I_0}} - 1$ = $\sqrt[${T}]{${n2(cf / I0)}} - 1$ = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-inv-irr-perp-growth",
        subject: "finance",
        topic: "investment",
        difficulty: "medium",
        kind: "numeric",
        unit: "percent",
        source: "TUM IVF CF chapter 02 (Berk/DeMarzo bookstore example)",
        build: (rng) => {
            const I0 = rng.int(100, 600) * 1000;
            const g = rng.int(1, 4);
            const cf1 = Math.round(I0 * rng.float(0.06, 0.2, 4));
            const answer = (cf1 / I0) * 100 + g;
            return {
                prompt: `Opening a bookshop costs ${eur(I0)}. It generates a first-year cash flow of ${eur(cf1)}, which then grows at a constant ${pct(g)} p.a. **forever**. What is the **IRR** of this investment?`,
                given: { "Investment $I_0$": eur(I0), "$CF_1$": eur(cf1), "Growth g": pct(g) },
                answer,
                explanation: String.raw`For a growing perpetuity $I_0 = \frac{CF_1}{IRR - g}$, so $IRR = \frac{CF_1}{I_0} + g$ = ${eur(cf1)} / ${eur(I0)} + ${pct(g)} = ${pct((cf1 / I0) * 100)} + ${pct(g)} = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-inv-payback-varying",
        subject: "finance",
        topic: "investment",
        difficulty: "easy",
        kind: "numeric",
        unit: "years",
        source: "TUM IVF CF catalogue Sep23, 2.7",
        build: (rng) => {
            const I0 = rng.int(50, 150) * 1000;
            const cfs = [
                Math.round((I0 * rng.float(0.25, 0.45, 2)) / 100) * 100,
                Math.round((I0 * rng.float(0.25, 0.45, 2)) / 100) * 100,
                Math.round((I0 * rng.float(0.25, 0.45, 2)) / 100) * 100,
                Math.round((I0 * rng.float(0.3, 0.6, 2)) / 100) * 100,
            ];
            let cum = 0;
            let k = 0;
            while (cum + cfs[k] < I0) {
                cum += cfs[k];
                k += 1;
            }
            const answer = k + (I0 - cum) / cfs[k];
            return {
                prompt: `A project costs ${eur(I0)} today and returns ${eur(cfs[0])} in year 1, ${eur(cfs[1])} in year 2, ${eur(cfs[2])} in year 3 and ${eur(cfs[3])} in year 4. What is its **payback period**, assuming the cash flows arrive evenly within each year?`,
                given: {
                    "Investment $I_0$": eur(I0),
                    "$CF_1$": eur(cfs[0]),
                    "$CF_2$": eur(cfs[1]),
                    "$CF_3$": eur(cfs[2]),
                    "$CF_4$": eur(cfs[3]),
                },
                answer,
                explanation: String.raw`$\text{payback} = k + \frac{I_0 - \sum_{t \le k} CF_t}{CF_{k+1}}$ - after ${k} full year${k === 1 ? "" : "s"} the cumulative inflow is ${eur(cum)}, leaving ${eur(I0 - cum)} of the investment unrecovered. The fraction of the following year needed is ${eur(I0 - cum)} / ${eur(cfs[k])} = ${n2((I0 - cum) / cfs[k])}, so payback = ${n(k)} + ${n2((I0 - cum) / cfs[k])} = ${n2(answer)} years`,
            };
        },
    },
    {
        id: "fin-cb-uni",
        subject: "finance",
        topic: "investment",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF CF catalogue Sep23, 3.5",
        build: (rng) => {
            const rev = rng.int(200, 900) * 1000;
            const costs = Math.round(rev * rng.float(0.4, 0.7, 2));
            const depr = Math.round(((rev - costs) * rng.float(0.15, 0.5, 2)) / 1000) * 1000;
            const tau = rng.pick([0.25, 0.3, 0.35]);
            const ebit = rev - costs - depr;
            const answer = ebit * (1 - tau);
            return {
                prompt: `A new production line generates revenues of ${eur(rev)} in its first year, cash operating costs of ${eur(costs)} and depreciation of ${eur(depr)}. The corporate tax rate is ${pct(tau * 100)}. What is the project's **incremental unlevered net income** in year 1?`,
                given: {
                    "Revenues": eur(rev),
                    "Operating costs": eur(costs),
                    "Depreciation": eur(depr),
                    "$τ_C$": pct(tau * 100),
                },
                answer,
                explanation: String.raw`$\text{Unlevered net income} = (\text{Revenue} - \text{Cost} - \text{Depreciation}) \cdot (1 - \tau_C)$ - EBIT is ${eur(ebit)}, taxed at ${pct(tau * 100)}: ${eur(ebit)} · ${n(1 - tau)} = ${eur(answer)}. Interest is deliberately excluded: the project is judged on its own, financing sits in the discount rate.`,
            };
        },
    },
    {
        id: "fin-cb-nwc",
        subject: "finance",
        topic: "investment",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF CF catalogue Sep23, 3.6",
        build: (rng) => {
            const sales = rng.int(100, 900) * 1000;
            const cashPct = rng.int(1, 4);
            const arPct = rng.int(3, 8);
            const invPct = rng.int(5, 12);
            const apPct = rng.int(2, 6);
            const answer = ((cashPct + arPct + invPct - apPct) / 100) * sales;
            return {
                prompt: `A project generates annual sales of ${eur(sales)}. To run it, the firm must hold ${pct(cashPct)} of annual sales in cash, ${pct(arPct)} in accounts receivable and ${pct(invPct)} in inventory, while suppliers finance ${pct(apPct)} of annual sales as accounts payable. What **net working capital** does the project tie up?`,
                given: {
                    "Annual sales": eur(sales),
                    "Cash": pct(cashPct),
                    "Accounts receivable": pct(arPct),
                    "Inventory": pct(invPct),
                    "Accounts payable": pct(apPct),
                },
                answer,
                explanation: String.raw`$NWC = \text{Cash} + \text{Inventory} + \text{Receivables} - \text{Payables}$ = (${pct(cashPct)} + ${pct(invPct)} + ${pct(arPct)} − ${pct(apPct)}) · ${eur(sales)} = ${pct(cashPct + arPct + invPct - apPct)} · ${eur(sales)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-cb-fcf-year",
        subject: "finance",
        topic: "investment",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF CF catalogue Sep23, 3.19",
        build: (rng) => {
            const rev = rng.int(200, 900) * 1000;
            const costs = Math.round(rev * rng.float(0.4, 0.7, 2));
            const depr = Math.round(((rev - costs) * rng.float(0.15, 0.5, 2)) / 1000) * 1000;
            const tau = rng.pick([0.25, 0.3, 0.35]);
            // 0 excluded - "NWC increases by 0.00" read wrong.
            let dNwc = rng.int(-20, 14) * 1000;
            if (dNwc === 0) dNwc = 15000;
            const ebit = rev - costs - depr;
            const answer = ebit * (1 - tau) + depr - dNwc;
            return {
                prompt: `Compute a project's **free cash flow** for one year: revenues ${eur(rev)}, cash operating costs ${eur(costs)}, depreciation ${eur(depr)}, tax rate ${pct(tau * 100)}. Net working capital ${dNwc >= 0 ? "increases" : "decreases"} by ${eur(Math.abs(dNwc))} during the year${dNwc < 0 ? " (working capital is released)" : ""}. There are no capital expenditures this year.`,
                given: {
                    "Revenues": eur(rev),
                    "Operating costs": eur(costs),
                    "Depreciation": eur(depr),
                    "$τ_C$": pct(tau * 100),
                    "Change in NWC": eur(dNwc),
                },
                answer,
                explanation: String.raw`$FCF = (\text{Rev} - \text{Cost} - \text{Depr}) \cdot (1 - \tau_C) + \text{Depr} - \Delta NWC$ - depreciation is added back because it is no cash outflow, it only shields taxes: ${eur(ebit * (1 - tau))} + ${eur(depr)} − (${eur(dNwc)}) = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-cb-fcf-initial",
        subject: "finance",
        topic: "investment",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF CF catalogue Sep23, 3.18",
        build: (rng) => {
            const capex = rng.int(100, 500) * 1000;
            const dev = rng.int(20, 120) * 1000;
            const nwc = rng.int(20, 100) * 1000;
            const tau = rng.pick([0.25, 0.3, 0.35]);
            const answer = -(dev * (1 - tau)) - capex - nwc;
            return {
                prompt: `A project starts in t = 0 with an investment of ${eur(capex)} in machinery (capitalized and depreciated from t = 1 on), non-capitalizable development costs of ${eur(dev)} (expensed immediately) and a build-up of net working capital of ${eur(nwc)}. The firm is profitable overall, so expensed costs create an immediate tax credit at the tax rate of ${pct(tau * 100)}. What is the **free cash flow in t = 0**? Give the answer as a signed number - an outflow is negative.`,
                given: {
                    "CapEx (t = 0)": eur(capex),
                    "Development costs (expensed)": eur(dev),
                    "NWC build-up": eur(nwc),
                    "$τ_C$": pct(tau * 100),
                },
                answer,
                explanation: String.raw`The expensed development costs reduce taxable income immediately, so their after-tax cost is $\text{Dev} \cdot (1 - \tau_C)$ = ${eur(dev * (1 - tau))}. CapEx and the NWC build-up are full cash outflows, but not tax-deductible in t = 0: $FCF_0 = -\text{Dev} \cdot (1 - \tau_C) - \text{CapEx} - \Delta NWC$ = −${eur(dev * (1 - tau))} − ${eur(capex)} − ${eur(nwc)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-cb-repl-initial",
        subject: "finance",
        topic: "investment",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF CF catalogue Sep23, 3.8",
        build: (rng) => {
            const pNew = rng.int(60, 200) * 1000;
            const book = rng.int(20, 80) * 1000;
            const salvage = Math.round((book * rng.float(0.4, 0.9, 2)) / 1000) * 1000;
            const tau = rng.pick([0.25, 0.3, 0.35]);
            const answer = -pNew + salvage + tau * (book - salvage);
            return {
                prompt: `A bakery replaces its old oven. The new oven costs ${eur(pNew)}. The old oven has a remaining book value of ${eur(book)} but can only be sold for ${eur(salvage)} today - the difference is a tax-deductible book loss, and the bakery is profitable, so the tax saving arrives immediately at the tax rate of ${pct(tau * 100)}. What is the **incremental cash flow in year 0** of the replacement? Give a signed number - a net outflow is negative.`,
                given: {
                    "Price new oven": eur(pNew),
                    "Book value old oven": eur(book),
                    "Sale price old oven": eur(salvage),
                    "$τ_C$": pct(tau * 100),
                },
                answer,
                explanation: String.raw`Selling below book value realizes a loss of ${eur(book - salvage)}, worth $\tau_C \cdot (\text{book} - \text{sale})$ = ${eur(tau * (book - salvage))} in saved taxes: $CF_0 = -P_{new} + \text{Sale} + \tau_C \cdot (\text{Book} - \text{Sale})$ = −${eur(pNew)} + ${eur(salvage)} + ${eur(tau * (book - salvage))} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-cb-repl-annual",
        subject: "finance",
        topic: "investment",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF CF catalogue Sep23, 3.9",
        build: (rng) => {
            const newEbitda = rng.int(40, 120) * 1000;
            const oldEbitda = Math.round((newEbitda * rng.float(0.5, 0.85, 2)) / 1000) * 1000;
            const newDepr = rng.int(8, 25) * 1000;
            const oldDepr = rng.int(3, 15) * 1000;
            const tau = rng.pick([0.25, 0.3, 0.35]);
            const dEbitda = newEbitda - oldEbitda;
            const dDepr = newDepr - oldDepr;
            const answer = (dEbitda - dDepr) * (1 - tau) + dDepr;
            return {
                prompt: `A print shop weighs replacing a machine. The new machine would produce EBITDA of ${eur(newEbitda)} per year with annual depreciation of ${eur(newDepr)}; the old machine produces EBITDA of ${eur(oldEbitda)} with annual depreciation of ${eur(oldDepr)}. All other items are identical, the firm is profitable, and the tax rate is ${pct(tau * 100)}. What is the **incremental annual free cash flow** of the replacement?`,
                given: {
                    "EBITDA new": eur(newEbitda),
                    "EBITDA old": eur(oldEbitda),
                    "Depreciation new": eur(newDepr),
                    "Depreciation old": eur(oldDepr),
                    "$τ_C$": pct(tau * 100),
                },
                answer,
                explanation: String.raw`Only the differences matter: $\Delta EBITDA$ = ${eur(dEbitda)} and $\Delta \text{Depr}$ = ${eur(dDepr)}. Then $\Delta FCF = (\Delta EBITDA - \Delta \text{Depr}) \cdot (1 - \tau_C) + \Delta \text{Depr}$ = ${eur((dEbitda - dDepr) * (1 - tau))} + ${eur(dDepr)} = ${eur(answer)}`,
            };
        },
    },

    // ----------------------------------------- cost of capital (CF chapter 4)
    {
        id: "fin-coc-debt-return",
        subject: "finance",
        topic: "cost_of_capital",
        difficulty: "medium",
        kind: "numeric",
        unit: "percent",
        source: "TUM IVF CF catalogue Sep23, 4.6",
        build: (rng) => {
            const p = rng.int(1, 10);
            const L = rng.int(30, 70);
            const el = (p * L) / 100;
            const ytm = Math.round((el + rng.float(0.5, 5, 1)) * 10) / 10;
            const answer = ytm - el;
            return {
                prompt: `A mining company's bond has a yield to maturity of ${pct(ytm)}. Rating statistics put its annual default probability at ${pct(p)}, and in default bondholders expect to lose ${pct(L)} of their investment. What is the **expected return** on this bond?`,
                given: {
                    "Yield to maturity y": pct(ytm),
                    "Default probability p": pct(p),
                    "Expected loss rate L": pct(L),
                },
                answer,
                explanation: String.raw`The promised yield overstates what investors expect to earn: $r_D = y - p \cdot L$ = ${pct(ytm)} − ${n(p / 100)} · ${pct(L)} = ${pct(ytm)} − ${pct(el)} = ${pct(answer)}. The riskier the bond, the larger the gap between yield and expected return.`,
            };
        },
    },
    {
        id: "fin-coc-net-debt-beta",
        subject: "finance",
        topic: "cost_of_capital",
        difficulty: "hard",
        kind: "numeric",
        unit: "ratio",
        source: "TUM IVF CF catalogue Sep23, 4.17",
        build: (rng) => {
            const E = rng.int(200, 900) * 1000;
            const D = rng.int(100, 600) * 1000;
            const C = Math.round((D * rng.float(0.1, 1.2, 2)) / 1000) * 1000;
            const betaE = rng.float(0.8, 1.8, 2);
            const betaD = rng.float(0.05, 0.3, 2);
            const nd = D - C;
            const answer = (E * betaE + nd * betaD) / (E + nd);
            return {
                prompt: `A company has equity worth ${eur(E)} with an equity beta of ${n2(betaE)}, debt of ${eur(D)} with a debt beta of ${n2(betaD)}, and holds ${eur(C)} of excess cash (risk-free, so it offsets the debt). Using **net debt** as the measure of leverage, what is the company's **unlevered (asset) beta**?`,
                given: {
                    "Equity E": eur(E),
                    "Debt D": eur(D),
                    "Excess cash C": eur(C),
                    "$β_E$": n2(betaE),
                    "$β_D$": n2(betaD),
                },
                answer,
                explanation: String.raw`Net debt = $D - C$ = ${eur(nd)}, so the enterprise is worth $E + D - C$ = ${eur(E + nd)}. Then $\beta_U = \frac{E}{E + D - C} \cdot \beta_E + \frac{D - C}{E + D - C} \cdot \beta_D$ = ${n2(E / (E + nd))} · ${n2(betaE)} + ${n2(nd / (E + nd))} · ${n2(betaD)} = ${n2(answer)}${nd < 0 ? " - with more cash than debt the asset beta exceeds the equity beta, because the risk-free cash cushions the equity" : ""}`,
            };
        },
    },
    {
        id: "fin-coc-sum-of-parts",
        subject: "finance",
        topic: "cost_of_capital",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM IVF CF catalogue Sep23, 4.9",
        build: (rng) => {
            const rf = rng.int(2, 4);
            const mrp = rng.int(4, 7);
            const g1 = rng.int(1, 3);
            const g2 = rng.int(1, 3);
            const bMin1 = Math.max(0.4, (g1 + 3 - rf) / mrp);
            const bMin2 = Math.max(0.4, (g2 + 3 - rf) / mrp);
            const beta1 = Math.round((bMin1 + rng.float(0.05, 0.9, 2)) * 100) / 100;
            const beta2 = Math.round((bMin2 + rng.float(0.05, 0.9, 2)) * 100) / 100;
            const fcf1 = rng.int(100, 600) * 1000;
            const fcf2 = rng.int(100, 600) * 1000;
            const r1 = rf + beta1 * mrp;
            const r2 = rf + beta2 * mrp;
            const v1 = fcf1 / ((r1 - g1) / 100);
            const v2 = fcf2 / ((r2 - g2) / 100);
            const answer = (v1 * r1 + v2 * r2) / (v1 + v2);
            return {
                prompt: `A family-owned group runs two divisions. Division A has an asset beta of ${n2(beta1)} and expects a free cash flow of ${eur(fcf1)} next year, growing at ${pct(g1)} forever; division B has an asset beta of ${n2(beta2)}, an expected free cash flow of ${eur(fcf2)} and perpetual growth of ${pct(g2)}. The risk-free rate is ${pct(rf)} and the market risk premium ${pct(mrp)}. What is the **cost of capital of the group as a whole** - the value-weighted average of the divisional costs of capital?`,
                given: {
                    "Division A": `β = ${n2(beta1)}, $FCF_1$ = ${eur(fcf1)}, g = ${pct(g1)}`,
                    "Division B": `β = ${n2(beta2)}, $FCF_1$ = ${eur(fcf2)}, g = ${pct(g2)}`,
                    "$r_f$": pct(rf),
                    "Market risk premium": pct(mrp),
                },
                answer,
                explanation: String.raw`CAPM per division: $r_i = r_f + \beta_i \cdot MRP$ gives $r_A$ = ${pct(r1)} and $r_B$ = ${pct(r2)}. Value each division as a growing perpetuity $V_i = \frac{FCF_1}{r_i - g_i}$: $V_A$ = ${eur(v1)}, $V_B$ = ${eur(v2)}. The group's cost of capital is the value-weighted average: ${n2(v1 / (v1 + v2))} · ${pct(r1)} + ${n2(v2 / (v1 + v2))} · ${pct(r2)} = ${pct(answer)}`,
            };
        },
    },
    {
        id: "fin-coc-re-ddm",
        subject: "finance",
        topic: "cost_of_capital",
        difficulty: "easy",
        kind: "numeric",
        unit: "percent",
        source: "TUM IVF CF catalogue Sep23, 5.25",
        build: (rng) => {
            const D0 = rng.float(0.8, 4, 2);
            const w = rng.int(2, 9);
            const dy = rng.float(2, 6, 2);
            const P0 = Math.round((D0 * (1 + w / 100)) / (dy / 100) * 100) / 100;
            const D1 = D0 * (1 + w / 100);
            const answer = (D1 / P0) * 100 + w;
            return {
                prompt: `Estimate a listed brewery's **cost of equity with the dividend discount model**: the dividend just paid was ${eur(D0)} per share, the market expects dividends to grow at a constant ${pct(w)} p.a., and the share trades at ${eur(P0)}.`,
                given: { "Dividend just paid $D_0$": eur(D0), "Growth w": pct(w), "Share price $P_0$": eur(P0) },
                answer,
                explanation: String.raw`Invert the Gordon growth model: $r_E = \frac{D_1}{P_0} + w$ with $D_1 = D_0 \cdot (1 + w)$ = ${eur(D1)}: ${eur(D1)} / ${eur(P0)} + ${pct(w)} = ${pct((D1 / P0) * 100)} + ${pct(w)} = ${pct(answer)}`,
            };
        },
    },

    // -------------------------------- capital structure (CF chapters 5 and 6)
    {
        id: "fin-cs-levered-return",
        subject: "finance",
        topic: "capital_structure",
        difficulty: "hard",
        kind: "numeric",
        unit: "percent",
        source: "TUM IVF CF catalogue Sep23, 5.3",
        build: (rng) => {
            const V0 = rng.int(200, 800) * 1000;
            const rf = rng.int(2, 6);
            // The bad-state factor is drawn first; the good-state factor is then
            // forced high enough that the expected asset return beats r_f by at
            // least ~2 pp, so the levered equity return is always positive.
            const fb = rng.float(0.7, 0.92, 2);
            const fg = Math.round((2 * (1 + (rf + 2) / 100) - fb + rng.float(0.02, 0.3, 2)) * 100) / 100;
            const Vg = Math.round((V0 * fg) / 1000) * 1000;
            const Vb = Math.round((V0 * fb) / 1000) * 1000;
            const D = Math.round((Vb * rng.float(0.3, 0.8, 2)) / (1 + rf / 100) / 1000) * 1000;
            const E = V0 - D;
            const ev1 = 0.5 * (Vg + Vb);
            const repay = D * (1 + rf / 100);
            const answer = ((ev1 - repay) / E - 1) * 100;
            return {
                prompt: `A firm's assets are worth ${eur(V0)} today. In one year they will be worth either ${eur(Vg)} (strong economy) or ${eur(Vb)} (weak economy), each with probability 50 %. The firm borrows ${eur(D)} today at the risk-free rate of ${pct(rf)}; in a perfect capital market (Modigliani-Miller) the equity is then worth the asset value minus the debt. What is the **expected return of the levered equity**?`,
                given: {
                    "Asset value today $V_0$": eur(V0),
                    "Value strong / weak": `${eur(Vg)} / ${eur(Vb)} (50/50)`,
                    "Debt D": eur(D),
                    "$r_f$": pct(rf),
                },
                answer,
                explanation: String.raw`MM: $E = V_0 - D$ = ${eur(E)}. Next year the debt holders receive $D \cdot (1 + r_f)$ = ${eur(repay)} in both states, so the equity holders expect $\mathbb{E}[V_1] - D(1 + r_f)$ = ${eur(ev1)} − ${eur(repay)} = ${eur(ev1 - repay)}. Expected return: ${eur(ev1 - repay)} / ${eur(E)} − 1 = ${pct(answer)} - above the unlevered expected return of ${pct((ev1 / V0 - 1) * 100)}, because leverage concentrates the asset risk on less equity.`,
            };
        },
    },
    {
        id: "fin-cs-eps-leverage",
        subject: "finance",
        topic: "capital_structure",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF CF catalogue Sep23, 5.15",
        build: (rng) => {
            const a = rng.int(2, 20) * 1000000;
            const P = rng.int(5, 40);
            const pe = rng.pick([8, 10, 12, 15]);
            const ebit = Math.round((a * P) / pe / 100000) * 100000;
            const buyback = Math.round((a * rng.float(0.15, 0.35, 2)) / 100000) * 100000;
            const D = buyback * P;
            const rD = rng.int(4, 9);
            const answer = (ebit - (rD / 100) * D) / (a - buyback);
            return {
                prompt: `An all-equity firm with ${n(a)} shares outstanding at a price of ${eur(P)} expects an EBIT of ${eur(ebit)} next year. It now borrows ${eur(D)} at ${pct(rD)} and uses the proceeds to repurchase ${n(buyback)} shares at the current price. Ignore taxes. What is the **earnings per share after the recapitalization**?`,
                given: {
                    "Shares outstanding a": n(a),
                    "Share price": eur(P),
                    "Expected EBIT": eur(ebit),
                    "New debt D": eur(D),
                    "$r_D$": pct(rD),
                    "Shares repurchased": n(buyback),
                },
                answer,
                explanation: String.raw`Earnings after interest (no taxes): $EBIT - r_D \cdot D$ = ${eur(ebit)} − ${eur((rD / 100) * D)} = ${eur(ebit - (rD / 100) * D)}, spread over $a - \frac{D}{P}$ = ${n(a - buyback)} remaining shares: $EPS = \frac{EBIT - r_D D}{a - D/P}$ = ${eur(answer)}. EPS rises above the unlevered ${eur(ebit / a)}, but only as compensation for the extra risk - the share price itself does not move (Modigliani-Miller).`,
            };
        },
    },
    {
        id: "fin-cs-recap-gain",
        subject: "finance",
        topic: "capital_structure",
        difficulty: "medium",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF CF catalogue Sep23, 6.9",
        build: (rng) => {
            const a = rng.int(5, 50) * 1000000;
            const P0 = rng.int(8, 40);
            const D = Math.round((a * P0 * rng.float(0.15, 0.45, 2)) / 1000000) * 1000000;
            const tau = rng.pick([0.25, 0.3, 0.35]);
            const answer = P0 + (tau * D) / a;
            return {
                prompt: `An all-equity firm with ${n(a)} shares trading at ${eur(P0)} announces that it will borrow ${eur(D)} **permanently** and pay the proceeds out to shareholders. The corporate tax rate is ${pct(tau * 100)}. In an otherwise perfect market, what is the **share price immediately after the announcement**?`,
                given: {
                    "Shares outstanding a": n(a),
                    "Price before $P_0$": eur(P0),
                    "Permanent debt D": eur(D),
                    "$τ_C$": pct(tau * 100),
                },
                answer,
                explanation: String.raw`Permanent debt creates a tax shield worth $\tau_C \cdot D$ = ${eur(tau * D)} (MM with taxes). Announced credibly, it accrues to the current shareholders at once: $P_{new} = P_0 + \frac{\tau_C \cdot D}{a}$ = ${eur(P0)} + ${eur((tau * D) / a)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-cs-tax-shield-annual",
        subject: "finance",
        topic: "capital_structure",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF CF catalogue Sep23, 6.1",
        build: (rng) => {
            const D = rng.int(100, 800) * 1000;
            const rD = rng.int(3, 8);
            const tau = rng.pick([0.25, 0.3, 0.35]);
            const answer = tau * (rD / 100) * D;
            return {
                prompt: `A retailer carries ${eur(D)} of debt at an interest rate of ${pct(rD)}. Its corporate tax rate is ${pct(tau * 100)}. How large is the **annual interest tax shield** - the taxes saved each year because interest is deductible?`,
                given: { "Debt D": eur(D), "$r_D$": pct(rD), "$τ_C$": pct(tau * 100) },
                answer,
                explanation: String.raw`$ITS = \tau_C \cdot \text{Interest} = \tau_C \cdot r_D \cdot D$ - the interest bill is ${eur((rD / 100) * D)}, of which the tax office effectively pays ${pct(tau * 100)}: ${n(tau)} · ${eur((rD / 100) * D)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-cs-pv-shield-growth",
        subject: "finance",
        topic: "capital_structure",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF CF catalogue Sep23, 6.7",
        build: (rng) => {
            const fcf = rng.int(200, 900) * 1000;
            const g = rng.int(2, 3);
            const rE = rng.int(11, 15);
            const rD = rng.int(5, 8);
            const tau = rng.pick([0.25, 0.3, 0.35]);
            const de = rng.pick([0.5, 1, 1.5]);
            const wE = 1 / (1 + de);
            const wD = de / (1 + de);
            const pre = wE * rE + wD * rD;
            const after = wE * rE + wD * rD * (1 - tau);
            const vU = fcf / ((pre - g) / 100);
            const vL = fcf / ((after - g) / 100);
            const answer = vL - vU;
            return {
                prompt: `A media group expects a free cash flow of ${eur(fcf)} next year, growing at ${pct(g)} p.a. forever. Its cost of equity is ${pct(rE)}, its cost of debt ${pct(rD)}, the tax rate is ${pct(tau * 100)}, and it permanently maintains a debt-to-equity ratio of ${n(de)}. What is the **value of its interest tax shield** - the difference between the levered firm value (discounted at the after-tax WACC) and the unlevered value (discounted at the pre-tax WACC)?`,
                given: {
                    "$FCF_1$": eur(fcf),
                    "Growth g": pct(g),
                    "$r_E$": pct(rE),
                    "$r_D$": pct(rD),
                    "$τ_C$": pct(tau * 100),
                    "Target D/E": n(de),
                },
                answer,
                explanation: String.raw`Weights: $\frac{E}{E+D}$ = ${n2(wE)}, $\frac{D}{E+D}$ = ${n2(wD)}. Pre-tax WACC $= w_E r_E + w_D r_D$ = ${pct(pre)} → $V_U = \frac{FCF_1}{r_{pre} - g}$ = ${eur(vU)}. After-tax WACC $= w_E r_E + w_D r_D (1 - \tau_C)$ = ${pct(after)} → $V_L$ = ${eur(vL)}. $PV(ITS) = V_L - V_U$ = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-cs-max-debt",
        subject: "finance",
        topic: "capital_structure",
        difficulty: "easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF CF catalogue Sep23, 6.11",
        build: (rng) => {
            const ebit = rng.int(200, 900) * 1000;
            const rD = rng.int(4, 9);
            const answer = ebit / (rD / 100);
            return {
                prompt: `A firm expects a stable EBIT of ${eur(ebit)} per year and pays ${pct(rD)} interest on its debt. From a pure tax-saving perspective, how much **debt can it carry at most** so that the interest payment still fully offsets taxable income - i.e. interest exactly equals EBIT?`,
                given: { "Expected EBIT": eur(ebit), "$r_D$": pct(rD) },
                answer,
                explanation: String.raw`The interest bill $r_D \cdot D$ may not exceed EBIT, so $D^{max} = \frac{EBIT}{r_D}$ = ${eur(ebit)} / ${n(rD / 100)} = ${eur(answer)}. Beyond this level extra interest no longer saves taxes - it only raises default risk.`,
            };
        },
    },

    // ---------------------------------------- rights issues (CF chapter 5)
    {
        id: "fin-ci-need",
        subject: "finance",
        topic: "capital_increase",
        difficulty: "hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF CF catalogue Sep23, 5.36",
        build: (rng) => {
            const nNew = rng.int(1, 20) * 100000;
            // Ratio capped at 25:1 - at 600:1 the right was worth fractions of
            // a cent, below the EUR grading tolerance floor.
            const b = rng.int(2, 25);
            const a = nNew * b;
            const IP = rng.int(20, 180);
            const Pcum = IP + rng.int(5, 60);
            const K = nNew * IP;
            const answer = (Pcum - IP) / (b + 1);
            return {
                prompt: `A supermarket chain with ${n(a)} shares outstanding needs ${eur(K)} of fresh equity and sets the subscription price of the new shares at ${eur(IP)}. After the announcement the share trades at ${eur(Pcum)}. What is the theoretical value of one **subscription right**?`,
                given: {
                    "Shares outstanding a": n(a),
                    "Capital needed K": eur(K),
                    "Subscription price IP": eur(IP),
                    "$P_{cum}$": eur(Pcum),
                },
                answer,
                explanation: String.raw`Number of new shares: $n = \frac{K}{IP}$ = ${n(nNew)}, so the subscription ratio is $BV = \frac{a}{n}$ = ${n(b)} : 1. Then $SR = \frac{P_{cum} - IP}{BV + 1}$ = (${eur(Pcum)} − ${eur(IP)}) / ${n(b + 1)} = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-ci-blanche",
        subject: "finance",
        topic: "capital_increase",
        difficulty: "hard",
        kind: "numeric",
        unit: "number",
        source: "TUM IVF CF catalogue Sep23, 5.38",
        build: (rng) => {
            const S = rng.int(40, 400);
            const b = rng.int(2, 8);
            const IP = rng.int(20, 60);
            const SR = rng.float(2, 15, 2);
            const answer = (S * IP) / (b * SR + IP);
            return {
                prompt: `In a rights issue with a subscription ratio of ${b}:1 and a subscription price of ${eur(IP)}, one subscription right is worth ${eur(SR)}. A shareholder owns ${n(S)} shares and holds no cash. How many of her ${n(S)} subscription rights must she **sell** so that the proceeds exactly pay for exercising the remaining rights (operation blanche)? Assume rights and shares are arbitrarily divisible.`,
                given: {
                    "Shares held (= rights) S": n(S),
                    "Subscription ratio": `${b}:1`,
                    "Subscription price IP": eur(IP),
                    "Value of one right SR": eur(SR),
                },
                answer,
                explanation: String.raw`Selling $x$ rights raises $x \cdot SR$; the remaining $S - x$ rights buy $\frac{S - x}{BV}$ new shares costing $\frac{S - x}{BV} \cdot IP$. Setting proceeds equal to cost and solving: $x = \frac{S \cdot IP}{BV \cdot SR + IP}$ = (${n(S)} · ${eur(IP)}) / (${b} · ${eur(SR)} + ${eur(IP)}) = ${n2(answer)} rights. Her total wealth is unchanged - the operation only converts rights into shares.`,
            };
        },
    },

    // ------------------------------------------------ options (IVF tutorial 07)
    {
        id: "fin-opt-put-profit",
        subject: "finance",
        topic: "options",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF Tutorial Options, A.1",
        build: (rng) => {
            const K = rng.int(30, 120);
            const prem = rng.float(2, 8, 2);
            const ST = K + rng.int(-25, 10);
            const payoff = Math.max(K - ST, 0);
            const answer = payoff - prem;
            return {
                prompt: `An investor buys a **European put** with strike ${eur(K)} for a premium of ${eur(prem)}. At maturity the share trades at ${eur(ST)}. What is the investor's **profit** from the position? Give a signed number - a loss is negative.`,
                given: { "Strike K": eur(K), "Premium paid P": eur(prem), "Share price at maturity $S_T$": eur(ST) },
                answer,
                explanation: String.raw`Exercise payoff: $P_T = \max(K - S_T,\ 0)$ = ${eur(payoff)}${payoff > 0 ? " (the put is exercised)" : " (the put expires worthless)"}. Profit = payoff − premium = ${eur(payoff)} − ${eur(prem)} = ${eur(answer)}. The position breaks even at $S_T = K - P$ = ${eur(K - prem)}.`,
            };
        },
    },
    {
        id: "fin-opt-call-breakeven",
        subject: "finance",
        topic: "options",
        difficulty: "very_easy",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF Tutorial Options, A.2",
        build: (rng) => {
            const K = rng.int(30, 120);
            const prem = rng.float(2, 9, 2);
            const answer = K + prem;
            return {
                prompt: `A trader **writes (sells) a European call** with strike ${eur(K)} and collects a premium of ${eur(prem)}. At what share price at maturity $S_T$ does the writer exactly **break even** - neither profit nor loss?`,
                given: { "Strike K": eur(K), "Premium received C": eur(prem) },
                answer,
                explanation: String.raw`The writer's profit is $C - \max(S_T - K,\ 0)$. Below the strike she keeps the full premium; above it the exercise loss grows one-for-one with $S_T$. The premium is used up exactly at $S_T = K + C$ = ${eur(K)} + ${eur(prem)} = ${eur(answer)} - above that the position loses money.`,
            };
        },
    },
    {
        id: "fin-opt-two-period-call",
        subject: "finance",
        topic: "options",
        difficulty: "very_hard",
        kind: "numeric",
        unit: "EUR",
        source: "TUM IVF Tutorial Options, A.4",
        build: (rng) => {
            const S = rng.int(60, 130);
            const rfp = rng.float(0.5, 4, 1);
            // Two decimals: n() renders at most 2, so 3-decimal draws showed
            // rounded factors while the key used the unrounded ones.
            const u = rng.float(1.05, 1.25, 2);
            const d = rng.float(0.8, 0.96, 2);
            const K = Math.round(S * rng.float(0.9, 1.1, 2));
            const p = (1 + rfp / 100 - d) / (u - d);
            const Cuu = Math.max(u * u * S - K, 0);
            const Cud = Math.max(u * d * S - K, 0);
            const Cdd = Math.max(d * d * S - K, 0);
            const answer = (p * p * Cuu + 2 * p * (1 - p) * Cud + (1 - p) * (1 - p) * Cdd) / (1 + rfp / 100) ** 2;
            return {
                prompt: `Value a **European call in a two-period binomial model**: the share trades at ${eur(S)} today and moves by the factor u = ${n(u)} or d = ${n(d)} in each of the two periods. The strike is ${eur(K)} and the risk-free rate is ${pct(rfp)} per period.`,
                given: { "$S_0$": eur(S), "K": eur(K), "u": n(u), "d": n(d), "$r_f$ per period": pct(rfp) },
                answer,
                explanation: String.raw`Risk-neutral probability: $p = \frac{(1 + r_f) - d}{u - d}$ = ${n2(p)}. Terminal payoffs: $C_{uu} = \max(u^2 S - K, 0)$ = ${eur(Cuu)}, $C_{ud}$ = ${eur(Cud)}, $C_{dd}$ = ${eur(Cdd)}. Discount the risk-neutral expectation over both periods: $C_0 = \frac{p^2 C_{uu} + 2p(1-p) C_{ud} + (1-p)^2 C_{dd}}{(1 + r_f)^2}$ = ${eur(answer)}`,
            };
        },
    },
    {
        id: "fin-opt-hedge-ratio",
        subject: "finance",
        topic: "options",
        difficulty: "hard",
        kind: "numeric",
        unit: "ratio",
        source: "TUM IVF Tutorial Options, A.4c",
        build: (rng) => {
            const S = rng.int(60, 130);
            const u = rng.float(1.1, 1.4, 2);
            const d = rng.float(0.7, 0.92, 2);
            const K = Math.round(S * (d + (u - d) * rng.float(0.3, 0.9, 2)));
            const Cu = u * S - K;
            const answer = (S * (u - d)) / Cu;
            return {
                prompt: `One-period binomial model: a share trades at ${eur(S)} and will be worth either ×${n2(u)} or ×${n2(d)} in one period. A European call on it has a strike of ${eur(K)} - it pays off only in the up state. To build a **risk-free hedge portfolio** of one share and m short calls, how many calls m must be written per share?`,
                given: { "$S_0$": eur(S), "u": n2(u), "d": n2(d), "Strike K": eur(K) },
                answer,
                explanation: String.raw`The call payoffs are $C_u = uS - K$ = ${eur(Cu)} and $C_d = 0$. The hedge portfolio must be worth the same in both states: $uS - m \cdot C_u = dS - m \cdot C_d$, so $m = \frac{uS - dS}{C_u - C_d}$ = ${eur(S * (u - d))} / ${eur(Cu)} = ${n2(answer)} calls per share.`,
            };
        },
    },
];
