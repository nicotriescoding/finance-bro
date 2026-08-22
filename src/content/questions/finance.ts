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
];
