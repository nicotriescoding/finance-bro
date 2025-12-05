// src/lib/formulas/annuities.ts

export const annuityFormulas = {
    // --- BASIC ANNUITIES ---
    annuity_immediate_FV: ({ C, r, N }) => {
        const q = 1 + r / 100;
        return C * (Math.pow(q, N) - 1) / (q - 1);
    },
    annuity_due_FV: ({ Cdue, r, N }) => {
        const q = 1 + r / 100;
        return Cdue * q * (Math.pow(q, N) - 1) / (q - 1);
    },
    annuity_immediate_PV: ({ C, r, N }) => {
        const q = 1 + r / 100;
        return C * (1 / Math.pow(q, N)) * ((Math.pow(q, N) - 1) / (q - 1));
    },
    annuity_due_PV: ({ Cdue, r, N }) => {
        const q = 1 + r / 100;
        return Cdue * (1 / Math.pow(q, N - 1)) * ((Math.pow(q, N) - 1) / (q - 1));
    },

    // --- ARITHMETICALLY GROWING ANNUITIES ---
    arithm_growing_FV_immediate: ({ C, d, r, N }) => {
        const q = 1 + r / 100;
        return (C + d / (q - 1)) * ((Math.pow(q, N) - 1) / (q - 1)) - (N * d) / (q - 1);
    },
    arithm_growing_FV_due: ({ Cdue, d, r, N }) => {
        const q = 1 + r / 100;
        return (Cdue + d / (q - 1)) * q * ((Math.pow(q, N) - 1) / (q - 1)) - (N * d * q) / (q - 1);
    },
    arithm_growing_PV_immediate: ({ C, d, r, N }) => {
        const q = 1 + r / 100;
        return (C + d / (q - 1)) * ((Math.pow(q, N) - 1) / (Math.pow(q, N) * (q - 1))) -
            (N * d) / (Math.pow(q, N) * (q - 1));
    },
    arithm_growing_PV_due: ({ Cdue, d, r, N }) => {
        const q = 1 + r / 100;
        return (Cdue + d / (q - 1)) * ((Math.pow(q, N) - 1) / (Math.pow(q, N - 1) * (q - 1))) -
            (N * d) / (Math.pow(q, N - 1) * (q - 1));
    },

    // --- GEOMETRICALLY GROWING ANNUITIES ---
    geom_growing_FV_immediate_equal: ({ C, q, N }) => C * N * Math.pow(q, N - 1),
    geom_growing_FV_immediate_neq: ({ C, g, q, N }) => C * ((Math.pow(g, N) - Math.pow(q, N)) / (g - q)),
    geom_growing_FV_due_equal: ({ Cdue, q, N }) => Cdue * N * Math.pow(q, N),
    geom_growing_FV_due_neq: ({ Cdue, g, q, N }) => Cdue * q * ((Math.pow(g, N) - Math.pow(q, N)) / (g - q)),
    geom_growing_PV_immediate_equal: ({ C, q, N }) => C * (N / q),
    geom_growing_PV_immediate_neq: ({ C, g, q, N }) => C * ((Math.pow(g / q, N) - 1) / (g - q)) * q,
    geom_growing_PV_due_equal: ({ Cdue, N }) => Cdue * N,
    geom_growing_PV_due_neq: ({ Cdue, g, q, N }) => Cdue * q * ((Math.pow(g / q, N) - 1) / (g - q)),

    // --- PERPETUAL ANNUITIES ---
    perpetual_annuity_PV_immediate: ({ C, r }) => C / (r / 100),
    perpetual_annuity_PV_due: ({ Cdue, r }) => (1 + r / 100) * (Cdue / (r / 100)),
    growing_perpetual_annuity_PV_immediate: ({ C, q, g }) => C / (q - g),
    growing_perpetual_annuity_PV_due: ({ Cdue, q, g }) => q * Cdue / (q - g),

    // --- REPLACEMENT & REPAYMENT ---
    replacement_annuity_immediate: ({ C, r, m }) => C * (m + r * (m - 1) / 2),
    replacement_annuity_due: ({ Cdue, r, m }) => Cdue * (m + r * (m + 1) / 2),

    installment_repayment_Ak: ({ D0, r, k, N }) => D0 * (r * (1 - (k - 1) / N) + 1 / N),
    installment_repayment_Dk: ({ D0, k, N }) => D0 * (1 - k / N),
    annuity_repayment_A: ({ D0, r, N }) => {
        const q = 1 + r / 100;
        return D0 * (Math.pow(q, N) * (q - 1)) / (Math.pow(q, N) - 1);
    },
    annuity_repayment_Dk: ({ D0, r, N, k }) => {
        const q = 1 + r / 100;
        return D0 * (Math.pow(q, N) - Math.pow(q, k)) / (Math.pow(q, N) - 1);
    },
};