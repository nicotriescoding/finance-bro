// src/lib/formulas/investment.ts

/**
 * Investment- und Projektbewertungsformeln
 * Enthält Kapitalwert, Rentabilität, EVA, IRR, Payback Period
 * Prozentwerte werden als r/100 interpretiert.
 */

export const investmentFormulas = {
    // --- NET PRESENT VALUE (Kapitalwert) ---
    npv: ({ CFt, r, T }) => {
        if (typeof CFt !== "number" || typeof r !== "number" || typeof T !== "number") return NaN;
        return Array.from({ length: T + 1 }, (_, t) => CFt / Math.pow(1 + r / 100, t))
            .reduce((a, b) => a + b, 0);
    },

    // --- PROFITABILITY INDEX (Rentabilitätsindex) ---
    profitability_index: ({ NPV, Resources }) =>
        typeof NPV === "number" && typeof Resources === "number" && Resources !== 0
            ? NPV / Resources
            : NaN,

    // --- ECONOMIC VALUE ADDED (EVA) ---
    eva: ({ EBIT_t, tauC, r, IC_t_minus_1 }) => {
        if ([EBIT_t, tauC, r, IC_t_minus_1].some(v => typeof v !== "number")) return NaN;
        return EBIT_t * (1 - tauC) - (r / 100) * IC_t_minus_1;
    },

    // --- INTERNAL RATE OF RETURN (IRR) ---
    irr: ({ CF, low = -0.99, high = 1.0, tol = 1e-6, maxIter = 1000 }) => {
        if (!Array.isArray(CF) || CF.length === 0) return NaN;
        let l = low, h = high;
        for (let i = 0; i < maxIter; i++) {
            const m = (l + h) / 2;
            const npv = CF.reduce((sum, cf, t) => sum + cf / Math.pow(1 + m, t), 0);
            if (Math.abs(npv) < tol) return m * 100; // Ergebnis in %
            if (npv > 0) l = m;
            else h = m;
        }
        return ((l + h) / 2) * 100;
    },

    // --- PAYBACK PERIOD (Amortisationsdauer) ---
    payback_period: ({ CF }) => {
        if (!Array.isArray(CF) || CF.length === 0) return NaN;
        let cum = 0;
        for (let t = 0; t < CF.length; t++) {
            const prev = cum;
            cum += CF[t];
            if (cum >= 0 && CF[t] !== 0) {
                return t + (0 - prev) / CF[t]; // lineare Interpolation
            }
        }
        return CF.length; // falls nie positiv
    },
};