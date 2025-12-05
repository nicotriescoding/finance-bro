// src/lib/formulas/bonds.ts

export const bondFormulas = {
    // --- BASIC BOND VALUATION ---
    zerobond_price: ({ BN, r, N }) => BN / Math.pow(1 + r / 100, N),

    coupon_bond_price: ({ C, BN, r, N }) =>
        (C * ((Math.pow(1 + r / 100, N) - 1) / (r / 100)) + BN) /
        Math.pow(1 + r / 100, N),

    // --- DURATION & PRICE SENSITIVITY ---
    bond_duration_D: ({ B0, Ck, BN, r, N }) =>
        (1 / B0) *
        ((Ck * N) / Math.pow(1 + r / 100, N) +
            (N * BN) / Math.pow(1 + r / 100, N)),

    bond_modified_duration: ({ D, r }) => D / (1 + r / 100),

    bond_price_change_approx: ({ Dmod, dr }) => -Dmod * dr,

    // --- TERM STRUCTURE (FORWARD RATES) ---
    term_structure_forward_rate: ({ It_T, It_S, T, S, t }) => {
        // (1 + rS_T)^(T-S) = (1 + It_T)^(T-t) / (1 + It_S)^(S-t)
        // => rS_T = ((1 + It_T)^(T-t) / (1 + It_S)^(S-t))^(1/(T-S)) - 1
        return (
            Math.pow(
                (Math.pow(1 + It_T / 100, T - t) /
                    Math.pow(1 + It_S / 100, S - t)),
                1 / (T - S)
            ) - 1
        );
    },
};