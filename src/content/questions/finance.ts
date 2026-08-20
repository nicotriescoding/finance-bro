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
                prompt: `Du legst ${eur(C0)} für ${N} Jahre zu ${pct(r)} p. a. an. Die Zinsen werden **nicht** mitverzinst (einfache Verzinsung). Welchen Betrag erhältst du am Ende?`,
                given: { "Startkapital C₀": eur(C0), "Zinssatz r": pct(r), "Laufzeit N": `${N} Jahre` },
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
                prompt: `${eur(C0)} werden ${N} Jahre lang mit ${pct(r)} p. a. **verzinst und wiederangelegt**. Wie hoch ist das Endkapital?`,
                given: { "Startkapital C₀": eur(C0), "Zinssatz r": pct(r), "Laufzeit N": `${N} Jahre` },
                answer,
                explanation: `C_N = C₀ · q^N mit q = 1 + r = ${n(1 + r / 100)} → ${eur(C0)} · ${n(1 + r / 100)}^${N} = ${eur(answer)}`,
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
                prompt: `${eur(C0)} werden ${N} Jahre **stetig** mit ${pct(r)} p. a. verzinst. Wie hoch ist das Endkapital?`,
                given: { "C₀": eur(C0), "r (stetig)": pct(r), "N": `${N} Jahre` },
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
            const label = m === 2 ? "halbjährlich" : m === 4 ? "quartalsweise" : "monatlich";
            return {
                prompt: `Ein Nominalzins von ${pct(r)} p. a. wird ${label} verzinst (m = ${m}). Wie hoch ist der **effektive** Jahreszins?`,
                given: { "Nominalzins r": pct(r), "Perioden m": String(m) },
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
                prompt: `Du zahlst ${N} Jahre lang **jeweils am Jahresende** ${eur(C)} auf ein Konto mit ${pct(r)} p. a. ein. Wie hoch ist der Endwert?`,
                given: { "Rate C": eur(C), "Zinssatz r": pct(r), "Anzahl Raten N": String(N) },
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
                prompt: `Eine Rente von ${eur(C)} wird ${N} Jahre lang **jeweils am Jahresanfang** (vorschüssig) gezahlt. Kalkulationszins ${pct(r)}. Wie hoch ist der Barwert?`,
                given: { "Rate C": eur(C), "r": pct(r), "N": String(N), "Zahlungszeitpunkt": "vorschüssig" },
                answer,
                explanation: `PV_vor = C · (q^N − 1)/(q^N·(q − 1)) · q = ${eur(answer)}`,
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
                prompt: `Eine **ewige** nachschüssige Rente zahlt jährlich ${eur(C)}. Der Kalkulationszins beträgt ${pct(r)}. Wie hoch ist der Barwert?`,
                given: { "Rate C": eur(C), "r": pct(r) },
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
                prompt: `Eine ewige Rente startet im nächsten Jahr mit ${eur(C)} und wächst danach mit ${pct(g)} p. a. Der Kalkulationszins ist ${pct(r)}. Wie hoch ist der Barwert?`,
                given: { "C₁": eur(C), "Wachstum g": pct(g), "r": pct(r) },
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
                prompt: `Ein Annuitätendarlehen über ${eur(D0)} läuft ${N} Jahre bei ${pct(r)} p. a. Wie hoch ist die **jährliche Annuität**?`,
                given: { "Darlehen D₀": eur(D0), "Zins r": pct(r), "Laufzeit N": `${N} Jahre` },
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
                prompt: `Ein Annuitätendarlehen über ${eur(D0)} (${pct(r)}, ${N} Jahre) läuft seit ${k} Jahren. Wie hoch ist die **Restschuld nach ${k} Jahren**?`,
                given: { "D₀": eur(D0), "r": pct(r), "N": `${N} Jahre`, "k": `${k} Jahre` },
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
                prompt: `Ein **Ratendarlehen** über ${eur(D0)} wird in ${N} gleichen Tilgungsraten zurückgezahlt, Zinssatz ${pct(r)}. Wie hoch ist die Gesamtzahlung (Tilgung + Zinsen) im Jahr ${k}?`,
                given: { "D₀": eur(D0), "r": pct(r), "N": String(N), "Jahr k": String(k) },
                answer,
                explanation: `Tilgung = D₀/N = ${eur(tilgung)}; Zinsen = Restschuld · r = ${eur(zins)}; Summe = ${eur(answer)}`,
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
                prompt: `Ein Zerobond mit Nominalwert ${eur(BN)} wird in ${N} Jahren zurückgezahlt. Der Marktzins beträgt ${pct(r)}. Wie hoch ist der heutige Kurs?`,
                given: { "Nominalwert": eur(BN), "Marktzins r": pct(r), "Restlaufzeit N": `${N} Jahre` },
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
                prompt: `Eine Anleihe (Nominalwert ${eur(BN)}, Kupon ${pct(couponRate)}, Restlaufzeit ${N} Jahre) wird am Markt mit ${pct(r)} diskontiert. Wie hoch ist der faire Kurs?`,
                given: { "Nominalwert": eur(BN), "Kupon p. a.": eur(C), "Marktzins r": pct(r), "N": `${N} Jahre` },
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
                prompt: `Berechne die **Macaulay-Duration** einer Anleihe: Nominalwert ${eur(BN)}, Kupon ${pct(couponRate)}, Restlaufzeit ${N} Jahre, Marktzins ${pct(r)}.`,
                given: { "Nominalwert": eur(BN), "Kupon": eur(C), "r": pct(r), "N": `${N} Jahre` },
                answer: duration,
                explanation: `D = Σ t·CF_t/(1+r)^t ÷ Σ CF_t/(1+r)^t = ${n2(duration)} Jahre`,
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
            const dr = rng.pick([25, 50, 75, 100]); // Basispunkte
            const { duration } = macaulayDuration(C, BN, r / 100, N);
            const dMod = duration / (1 + r / 100);
            const answer = -dMod * (dr / 10000) * 100;
            return {
                prompt: `Eine Anleihe (Kupon ${pct(couponRate)}, ${N} Jahre Restlaufzeit, Marktzins ${pct(r)}) hat eine Macaulay-Duration von ${n2(duration)} Jahren. Um wie viel **Prozent** ändert sich der Kurs näherungsweise, wenn der Marktzins um ${dr} Basispunkte **steigt**?`,
                given: { "Duration D": `${n2(duration)} Jahre`, "r": pct(r), "Δr": `+${dr} bp` },
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
                prompt: `Die Spot Rate für ${S} Jahre liegt bei ${pct(iS)}, für ${T} Jahre bei ${pct(iT)}. Wie hoch ist die **Forward Rate** für den Zeitraum von Jahr ${S} bis Jahr ${T}?`,
                given: { [`Spot ${S}J`]: pct(iS), [`Spot ${T}J`]: pct(iT) },
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
                prompt: `Du kaufst eine Aktie für ${eur(P0)}. Nach einem Jahr steht sie bei ${eur(P1)} und hat ${eur(D1)} Dividende gezahlt. Wie hoch ist die **Gesamtrendite**?`,
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
                prompt: `Eine Aktie zahlt im nächsten Jahr ${eur(D1)} Dividende, die danach konstant mit ${pct(w)} p. a. wächst. Die Eigenkapitalkosten betragen ${pct(rE)}. Wie hoch ist der faire Aktienkurs (Gordon Growth)?`,
                given: { "D₁": eur(D1), "Wachstum w": pct(w), "r_E": pct(rE) },
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
                prompt: `Eine Aktie notiert bei ${eur(P0)} und weist einen Gewinn je Aktie von ${eur(EPS)} aus. Wie hoch ist das **KGV (P/E)**?`,
                given: { "Kurs P₀": eur(P0), "EPS": eur(EPS) },
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
                prompt: `Zwei-Phasen-DDM: Die Dividende beträgt im nächsten Jahr ${eur(D1)} und wächst ${N} Jahre lang mit ${pct(wa)}, danach ewig mit ${pct(wb)}. Eigenkapitalkosten ${pct(rE)}. Wie hoch ist der faire Aktienkurs?`,
                given: { "D₁": eur(D1), "Phase 1 (N)": `${N} Jahre @ ${pct(wa)}`, "Phase 2": `ewig @ ${pct(wb)}`, "r_E": pct(rE) },
                answer,
                explanation: `PV Phase 1 = ${eur(pv)}; Terminal Value in t=${N}: ${eur(terminal)}; P₀ = ${eur(answer)}`,
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
                prompt: `Das Umlaufvermögen beträgt ${eur(CA)}, die kurzfristigen Verbindlichkeiten ${eur(CL)}. Wie hoch ist die **Current Ratio**?`,
                given: { "Umlaufvermögen": eur(CA), "kurzfr. Verbindlichkeiten": eur(CL) },
                answer,
                explanation: `Current Ratio = CA / CL = ${n2(answer)}`,
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
                prompt: `Ein Unternehmen hat ${eur(D)} Fremdkapital und ${eur(E)} Eigenkapital. Wie hoch ist der **Verschuldungsgrad (D/E)**?`,
                given: { "Fremdkapital D": eur(D), "Eigenkapital E": eur(E) },
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
                prompt: `Jahresüberschuss ${eur(NI)}, Eigenkapital ${eur(E)}. Wie hoch ist die **Eigenkapitalrendite (ROE)**?`,
                given: { "Jahresüberschuss": eur(NI), "Eigenkapital": eur(E) },
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
                prompt: `EBIT ${eur(EBIT)}, Steuersatz ${pct(tauC * 100)}, investiertes Kapital ${eur(IC)}. Wie hoch ist der **ROIC nach Steuern**?`,
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
                prompt: `EBIT ${eur(EBIT)}, Zinsaufwand ${eur(IE)}. Wie hoch ist der **Zinsdeckungsgrad (Interest Coverage)**?`,
                given: { EBIT: eur(EBIT), Zinsaufwand: eur(IE) },
                answer,
                explanation: `ICR = EBIT / Zinsaufwand = ${n2(answer)}`,
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
                prompt: `Eine Investition kostet heute ${eur(I0)} und erzeugt ${T} Jahre lang jeweils am Jahresende ${eur(cf)}. Der Kalkulationszins beträgt ${pct(r)}. Wie hoch ist der **Kapitalwert (NPV)**?`,
                given: { "Investition I₀": eur(I0), "Cashflow p. a.": eur(cf), "Laufzeit": `${T} Jahre`, r: pct(r) },
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
                prompt: `Eine Investition kostet ${eur(I0)} und bringt ${T} Jahre lang jeweils ${eur(cf)}. Wie hoch ist der **interne Zinsfuß (IRR)**?`,
                given: { "I₀": eur(I0), "CF p. a.": eur(cf), Laufzeit: `${T} Jahre` },
                answer,
                explanation: `IRR ist der Zins, bei dem NPV = 0 → ${pct(answer)}`,
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
                prompt: `Eine Investition von ${eur(I0)} erzeugt jährlich konstante Rückflüsse von ${eur(cf)}. Wie lang ist die **statische Amortisationsdauer**?`,
                given: { "I₀": eur(I0), "CF p. a.": eur(cf) },
                answer,
                explanation: `Amortisationsdauer = I₀ / CF = ${n2(answer)} Jahre`,
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
                prompt: `EBIT ${eur(EBIT)}, Steuersatz ${pct(tauC * 100)}, Kapitalkosten ${pct(r)}, investiertes Kapital zu Periodenbeginn ${eur(IC)}. Wie hoch ist der **EVA**?`,
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
                prompt: `Risikoloser Zins ${pct(rRF)}, erwartete Marktrendite ${pct(rM)}, Beta ${n2(beta)}. Wie hoch ist die nach **CAPM** erwartete Rendite?`,
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
                prompt: `Eigenkapital ${eur(E)} (Kosten ${pct(rE)}), Fremdkapital ${eur(D)} (Kosten ${pct(rD)}), Steuersatz ${pct(tauC * 100)}. Wie hoch ist der **WACC**?`,
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
                prompt: `Das verschuldete Beta beträgt ${n2(betaE)} bei ${eur(D)} Fremdkapital und ${eur(E)} Eigenkapital (Steuersatz ${pct(tauC * 100)}). Wie hoch ist das **unverschuldete Beta** (Hamada)?`,
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
                prompt: `Unverschuldete Kapitalkosten ${pct(rU)}, Fremdkapitalkosten ${pct(rD)}, Fremdkapital ${eur(D)}, Eigenkapital ${eur(E)} (MM ohne Steuern). Wie hoch sind die **Eigenkapitalkosten des verschuldeten Unternehmens**?`,
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
                prompt: `Ein Portfolio besteht zu ${pct(wA * 100)} aus Asset A (Rendite ${pct(rA)}) und zu ${pct(wB * 100)} aus Asset B (Rendite ${pct(rB)}). Wie hoch ist die **Portfoliorendite**?`,
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
                prompt: `Portfolio aus zwei Assets: w_A = ${pct(wA * 100)}, σ_A = ${pct(sA)}, σ_B = ${pct(sB)}, Korrelation ρ = ${n2(rho)}. Wie hoch ist die **Standardabweichung des Portfolios**?`,
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
                prompt: `σ_A = ${pct(sA)}, σ_B = ${pct(sB)}, ρ = ${n2(rho)}. Welches Gewicht **w_A** hat Asset A im Minimum-Varianz-Portfolio?`,
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
                prompt: `Portfoliorendite ${pct(rP)}, risikoloser Zins ${pct(rF)}, Standardabweichung ${pct(sP)}. Wie hoch ist die **Sharpe Ratio**?`,
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
                prompt: `Einperiodiges Binomialmodell: Up-Faktor u = ${n2(u)}, Down-Faktor d = ${n2(d)}, risikoloser Zins ${pct(rRF)}. Wie hoch ist die **risikoneutrale Wahrscheinlichkeit p** für den Up-Zustand?`,
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
                prompt: `Aktienkurs heute ${eur(S)}, in einem Jahr entweder ×${n2(u)} oder ×${n2(d)}. Strike ${eur(K)}, risikoloser Zins ${pct(rRF)}. Wie hoch ist der **Wert des europäischen Calls**?`,
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
                prompt: `Put-Call-Parität: Call ${eur(C)}, Aktienkurs ${eur(S)}, Strike ${eur(K)}, Laufzeit ${N} Jahre, Zins ${pct(r)}. Wie hoch ist der **Put**?`,
                given: { C: eur(C), "S₀": eur(S), K: eur(K), N: `${N} Jahre`, r: pct(r) },
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
                prompt: `Black-Scholes: S₀ = ${eur(S)}, Strike ${eur(K)}, Volatilität ${pct(sigma)}, risikoloser Zins ${pct(r)}, Laufzeit ${n(T)} Jahre. Wie hoch ist der **Wert des europäischen Calls**?`,
                given: { "S₀": eur(S), K: eur(K), σ: pct(sigma), r: pct(r), T: `${n(T)} Jahre` },
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
                prompt: `Kapitalerhöhung gegen Einlagen im Bezugsverhältnis ${BV}:1. Kurs vor der Kapitalerhöhung ${eur(Pcum)}, Ausgabepreis der jungen Aktien ${eur(IP)}. Wie hoch ist der **Kurs nach der Kapitalerhöhung (P_ex)**?`,
                given: { Bezugsverhältnis: `${BV}:1`, "P_cum": eur(Pcum), Ausgabepreis: eur(IP) },
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
                prompt: `Bezugsverhältnis ${BV}:1, Kurs vor Kapitalerhöhung ${eur(Pcum)}, Ausgabepreis ${eur(IP)}. Wie hoch ist der rechnerische Wert des **Bezugsrechts**?`,
                given: { Bezugsverhältnis: `${BV}:1`, "P_cum": eur(Pcum), Ausgabepreis: eur(IP) },
                answer,
                explanation: `BR = (P_cum − IP)/(BV + 1) = ${eur(answer)}`,
            };
        },
    },
];
