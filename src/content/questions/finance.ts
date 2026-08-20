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
                given: { "Initial capital C₀": eur(C0), "Interest rate r": pct(r), "Term N": `${N} years` },
                answer,
                explanation: `C_N = C₀ · (1 + N · r) = ${eur(C0)} · (1 + ${N} · ${n(r / 100)}) = ${eur(answer)}`,
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
                given: { "Initial capital C₀": eur(C0), "Interest rate r": pct(r), "Term N": `${N} years` },
                answer,
                explanation: `C_N = C₀ · q^N with q = 1 + r = ${n(1 + r / 100)} → ${eur(C0)} · ${n(1 + r / 100)}^${N} = ${eur(answer)}`,
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
                given: { "C₀": eur(C0), "r (continuous)": pct(r), "N": `${N} years` },
                answer,
                explanation: `C_N = C₀ · e^(r·N) = ${eur(C0)} · e^(${n(r / 100)}·${N}) = ${eur(answer)}`,
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
                explanation: `r_eff = (1 + r/m)^m − 1 = (1 + ${n(r / 100)}/${m})^${m} − 1 = ${pct(answer)}`,
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
                explanation: `FV = C · (q^N − 1)/(q − 1) = ${eur(C)} · (${n(q)}^${N} − 1)/${n(q - 1)} = ${eur(answer)}`,
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
                explanation: `PV_due = C · (q^N − 1)/(q^N·(q − 1)) · q = ${eur(answer)}`,
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
                explanation: `PV = C / r = ${eur(C)} / ${n(r / 100)} = ${eur(answer)}`,
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
                given: { "C₁": eur(C), "Growth g": pct(g), "r": pct(r) },
                answer,
                explanation: `PV = C₁ / (r − g) = ${eur(C)} / (${n(r / 100)} − ${n(g / 100)}) = ${eur(answer)}`,
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
                given: { "Loan D₀": eur(D0), "Interest rate r": pct(r), "Term N": `${N} years` },
                answer,
                explanation: `A = D₀ · q^N·(q − 1)/(q^N − 1) = ${eur(answer)}`,
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
                given: { "D₀": eur(D0), "r": pct(r), "N": `${N} years`, "k": `${k} years` },
                answer,
                explanation: `D_k = D₀ · (q^N − q^k)/(q^N − 1) = ${eur(answer)}`,
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
            const tilgung = D0 / N;
            const zins = (D0 - tilgung * (k - 1)) * (r / 100);
            const answer = tilgung + zins;
            return {
                prompt: `An **installment loan** of ${eur(D0)} is repaid in ${N} equal principal repayments at an interest rate of ${pct(r)}. What is the total payment (principal repayment + interest) in year ${k}?`,
                given: { "D₀": eur(D0), "r": pct(r), "N": String(N), "Year k": String(k) },
                answer,
                explanation: `Principal repayment = D₀/N = ${eur(tilgung)}; interest = outstanding balance · r = ${eur(zins)}; total = ${eur(answer)}`,
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
                explanation: `B₀ = BN / (1 + r)^N = ${eur(answer)}`,
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
                explanation: `B₀ = Σ C/(1+r)^t + BN/(1+r)^N = ${eur(price)}`,
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
                explanation: `D = Σ t·CF_t/(1+r)^t ÷ Σ CF_t/(1+r)^t = ${n2(duration)} years`,
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
                given: { "Duration D": `${n2(duration)} years`, "r": pct(r), "Δr": `+${dr} bp` },
                answer,
                explanation: `D_mod = D/(1+r) = ${n2(dMod)}; ΔB/B ≈ −D_mod · Δr = ${pct(answer)}`,
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
                explanation: `f = [(1+i_T)^T / (1+i_S)^S]^(1/(T−S)) − 1 = ${pct(answer)}`,
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
                given: { "P₀": eur(P0), "P₁": eur(P1), "D₁": eur(D1) },
                answer,
                explanation: `r = (D₁ + P₁ − P₀)/P₀ = ${pct(answer)}`,
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
                given: { "D₁": eur(D1), "Growth w": pct(w), "r_E": pct(rE) },
                answer,
                explanation: `P₀ = D₁/(r_E − w) = ${eur(D1)}/(${n(rE / 100)} − ${n(w / 100)}) = ${eur(answer)}`,
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
                given: { "Price P₀": eur(P0), "EPS": eur(EPS) },
                answer,
                explanation: `P/E = P₀ / EPS = ${n2(answer)}`,
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
                given: { "D₁": eur(D1), "Phase 1 (N)": `${N} years @ ${pct(wa)}`, "Phase 2": `perpetual @ ${pct(wb)}`, "r_E": pct(rE) },
                answer,
                explanation: `PV of phase 1 = ${eur(pv)}; terminal value at t=${N}: ${eur(terminal)}; P₀ = ${eur(answer)}`,
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
                explanation: `Current ratio = CA / CL = ${n2(answer)}`,
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
                explanation: `D/E = ${n2(answer)}`,
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
                explanation: `ROE = NI / E = ${pct(answer)}`,
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
                given: { EBIT: eur(EBIT), "τ_C": pct(tauC * 100), "Invested Capital": eur(IC) },
                answer,
                explanation: `ROIC = EBIT·(1−τ)/IC = ${pct(answer)}`,
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
                explanation: `ICR = EBIT / interest expense = ${n2(answer)}`,
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
                given: { "Investment I₀": eur(I0), "Cash flow p.a.": eur(cf), "Term": `${T} years`, r: pct(r) },
                answer,
                explanation: `NPV = −I₀ + Σ CF/(1+r)^t = ${eur(answer)}`,
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
                given: { "I₀": eur(I0), "CF p.a.": eur(cf), Term: `${T} years` },
                answer,
                explanation: `The IRR is the rate at which NPV = 0 → ${pct(answer)}`,
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
                given: { "I₀": eur(I0), "CF p.a.": eur(cf) },
                answer,
                explanation: `Payback period = I₀ / CF = ${n2(answer)} years`,
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
                given: { EBIT: eur(EBIT), "τ_C": pct(tauC * 100), "r": pct(r), "IC": eur(IC) },
                answer,
                explanation: `EVA = NOPAT − r·IC = ${eur(EBIT * (1 - tauC))} − ${eur((r / 100) * IC)} = ${eur(answer)}`,
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
                given: { "r_f": pct(rRF), "r_M": pct(rM), "β": n2(beta) },
                answer,
                explanation: `r = r_f + β·(r_M − r_f) = ${pct(answer)}`,
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
                given: { E: eur(E), D: eur(D), "r_E": pct(rE), "r_D": pct(rD), "τ_C": pct(tauC * 100) },
                answer,
                explanation: `WACC = E/(E+D)·r_E + D/(E+D)·r_D·(1−τ) = ${pct(answer)}`,
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
                given: { "β_E": n2(betaE), D: eur(D), E: eur(E), "τ_C": pct(tauC * 100) },
                answer,
                explanation: `β_U = β_E / (1 + D/E·(1−τ)) = ${n2(answer)}`,
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
                given: { "r_U": pct(rU), "r_D": pct(rD), D: eur(D), E: eur(E) },
                answer,
                explanation: `r_E = r_U + D/E·(r_U − r_D) = ${pct(answer)}`,
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
                given: { "w_A": pct(wA * 100), "w_B": pct(wB * 100), "r_A": pct(rA), "r_B": pct(rB) },
                answer,
                explanation: `r_P = w_A·r_A + w_B·r_B = ${pct(answer)}`,
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
                prompt: `Portfolio of two assets: w_A = ${pct(wA * 100)}, σ_A = ${pct(sA)}, σ_B = ${pct(sB)}, correlation ρ = ${n2(rho)}. What is the **standard deviation of the portfolio**?`,
                given: { "w_A": pct(wA * 100), "w_B": pct(wB * 100), "σ_A": pct(sA), "σ_B": pct(sB), "ρ_AB": n2(rho) },
                answer,
                explanation: `σ_P = √(w_A²σ_A² + w_B²σ_B² + 2w_Aw_Bσ_Aσ_Bρ) = ${pct(answer)}`,
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
                prompt: `σ_A = ${pct(sA)}, σ_B = ${pct(sB)}, ρ = ${n2(rho)}. What weight **w_A** does asset A have in the minimum-variance portfolio?`,
                given: { "σ_A": pct(sA), "σ_B": pct(sB), "ρ_AB": n2(rho) },
                answer,
                explanation: `w_A* = (σ_B² − σ_Aσ_Bρ)/(σ_A² + σ_B² − 2σ_Aσ_Bρ) = ${pct(answer)}`,
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
                given: { "r_P": pct(rP), "r_f": pct(rF), "σ_P": pct(sP) },
                answer,
                explanation: `SR = (r_P − r_f)/σ_P = ${n2(answer)}`,
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
                given: { u: n2(u), d: n2(d), "r_f": pct(rRF) },
                answer,
                explanation: `p = (1 + r_f − d)/(u − d) = ${n2(answer)}`,
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
                given: { "S₀": eur(S), K: eur(K), u: n2(u), d: n2(d), "r_f": pct(rRF) },
                answer,
                explanation: `p = ${n2(p)}; C_u = ${eur(Cu)}, C_d = ${eur(Cd)}; C₀ = (p·C_u + (1−p)·C_d)/(1+r_f) = ${eur(answer)}`,
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
                given: { C: eur(C), "S₀": eur(S), K: eur(K), N: `${N} years`, r: pct(r) },
                answer,
                explanation: `P = C + K/(1+r)^N − S = ${eur(answer)}`,
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
                prompt: `Black-Scholes: S₀ = ${eur(S)}, strike ${eur(K)}, volatility ${pct(sigma)}, risk-free rate ${pct(r)}, term ${n(T)} years. What is the **value of the European call**?`,
                given: { "S₀": eur(S), K: eur(K), σ: pct(sigma), r: pct(r), T: `${n(T)} years` },
                answer,
                explanation: `d₁ = ${n2(d1)}, d₂ = ${n2(d2)}; N(d₁) = ${n2(normCdf(d1))}, N(d₂) = ${n2(normCdf(d2))}; C = S·N(d₁) − K·e^(−rT)·N(d₂) = ${eur(answer)}`,
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
                prompt: `A rights issue against contributions (Kapitalerhöhung gegen Einlagen) is carried out at a subscription ratio of ${BV}:1. The price before the rights issue is ${eur(Pcum)}, the issue price of the new shares is ${eur(IP)}. What is the **price after the rights issue (P_ex)**?`,
                given: { "Subscription ratio": `${BV}:1`, "P_cum": eur(Pcum), "Issue price": eur(IP) },
                answer,
                explanation: `P_ex = (BV·P_cum + IP)/(BV + 1) = ${eur(answer)}`,
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
                given: { "Subscription ratio": `${BV}:1`, "P_cum": eur(Pcum), "Issue price": eur(IP) },
                answer,
                explanation: `BR = (P_cum − IP)/(BV + 1) = ${eur(answer)}`,
            };
        },
    },
];
