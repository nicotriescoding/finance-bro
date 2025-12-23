// Gemeinsame Basistypen
type AnnuityBase = {
    r: number;
};

type ImmediateAnnuity = AnnuityBase & {
    C: number;
    N: number;
};

type DueAnnuity = AnnuityBase & {
    Cdue: number;
    N: number;
};

type ArithmeticGrowingImmediate = AnnuityBase & {
    C: number;
    d: number;
    N: number;
};

type ArithmeticGrowingDue = AnnuityBase & {
    Cdue: number;
    d: number;
    N: number;
};

type GeometricImmediateEqual = {
    C: number;
    q: number;
    N: number;
};

type GeometricImmediateNotEqual = {
    C: number;
    g: number;
    q: number;
    N: number;
};

type GeometricDueEqual = {
    Cdue: number;
    q: number;
    N: number;
};

type GeometricDueNotEqual = {
    Cdue: number;
    g: number;
    q: number;
    N: number;
};

type PerpetualImmediate = {
    C: number;
    r: number;
};

type PerpetualDue = {
    Cdue: number;
    r: number;
};

type GrowingPerpetualImmediate = {
    C: number;
    q: number;
    g: number;
};

type GrowingPerpetualDue = {
    Cdue: number;
    q: number;
    g: number;
};

type ReplacementImmediate = {
    C: number;
    r: number;
    m: number;
};

type ReplacementDue = {
    Cdue: number;
    r: number;
    m: number;
};

type InstallmentAk = {
    D0: number;
    r: number;
    k: number;
    N: number;
};

type InstallmentDk = {
    D0: number;
    k: number;
    N: number;
};

type AnnuityRepaymentA = {
    D0: number;
    r: number;
    N: number;
};

type AnnuityRepaymentDk = {
    D0: number;
    r: number;
    N: number;
    k: number;
};

export const annuityFormulas = {
    // --- BASIC ANNUITIES ---
    annuity_immediate_FV: ({ C, r, N }: ImmediateAnnuity) => {
        const q = 1 + r / 100;
        return C * (Math.pow(q, N) - 1) / (q - 1);
    },

    annuity_due_FV: ({ Cdue, r, N }: DueAnnuity) => {
        const q = 1 + r / 100;
        return Cdue * q * (Math.pow(q, N) - 1) / (q - 1);
    },

    annuity_immediate_PV: ({ C, r, N }: ImmediateAnnuity) => {
        const q = 1 + r / 100;
        return C * (1 / Math.pow(q, N)) * ((Math.pow(q, N) - 1) / (q - 1));
    },

    annuity_due_PV: ({ Cdue, r, N }: DueAnnuity) => {
        const q = 1 + r / 100;
        return Cdue * (1 / Math.pow(q, N - 1)) * ((Math.pow(q, N) - 1) / (q - 1));
    },

    // --- ARITHMETICALLY GROWING ANNUITIES ---
    arithm_growing_FV_immediate: ({ C, d, r, N }: ArithmeticGrowingImmediate) => {
        const q = 1 + r / 100;
        return (C + d / (q - 1)) * ((Math.pow(q, N) - 1) / (q - 1)) - (N * d) / (q - 1);
    },

    arithm_growing_FV_due: ({ Cdue, d, r, N }: ArithmeticGrowingDue) => {
        const q = 1 + r / 100;
        return (Cdue + d / (q - 1)) * q * ((Math.pow(q, N) - 1) / (q - 1)) - (N * d * q) / (q - 1);
    },

    arithm_growing_PV_immediate: ({ C, d, r, N }: ArithmeticGrowingImmediate) => {
        const q = 1 + r / 100;
        return (
            (C + d / (q - 1)) *
            ((Math.pow(q, N) - 1) / (Math.pow(q, N) * (q - 1))) -
            (N * d) / (Math.pow(q, N) * (q - 1))
        );
    },

    arithm_growing_PV_due: ({ Cdue, d, r, N }: ArithmeticGrowingDue) => {
        const q = 1 + r / 100;
        return (
            (Cdue + d / (q - 1)) *
            ((Math.pow(q, N) - 1) / (Math.pow(q, N - 1) * (q - 1))) -
            (N * d) / (Math.pow(q, N - 1) * (q - 1))
        );
    },

    // --- GEOMETRICALLY GROWING ANNUITIES ---
    geom_growing_FV_immediate_equal: ({ C, q, N }: GeometricImmediateEqual) =>
        C * N * Math.pow(q, N - 1),

    geom_growing_FV_immediate_neq: ({ C, g, q, N }: GeometricImmediateNotEqual) =>
        C * ((Math.pow(g, N) - Math.pow(q, N)) / (g - q)),

    geom_growing_FV_due_equal: ({ Cdue, q, N }: GeometricDueEqual) =>
        Cdue * N * Math.pow(q, N),

    geom_growing_FV_due_neq: ({ Cdue, g, q, N }: GeometricDueNotEqual) =>
        Cdue * q * ((Math.pow(g, N) - Math.pow(q, N)) / (g - q)),

    geom_growing_PV_immediate_equal: ({ C, q, N }: GeometricImmediateEqual) =>
        C * (N / q),

    geom_growing_PV_immediate_neq: ({ C, g, q, N }: GeometricImmediateNotEqual) =>
        C * ((Math.pow(g / q, N) - 1) / (g - q)) * q,

    geom_growing_PV_due_equal: ({ Cdue, N }: { Cdue: number; N: number }) =>
        Cdue * N,

    geom_growing_PV_due_neq: ({ Cdue, g, q, N }: GeometricDueNotEqual) =>
        Cdue * q * ((Math.pow(g / q, N) - 1) / (g - q)),

    // --- PERPETUAL ANNUITIES ---
    perpetual_annuity_PV_immediate: ({ C, r }: PerpetualImmediate) =>
        C / (r / 100),

    perpetual_annuity_PV_due: ({ Cdue, r }: PerpetualDue) =>
        (1 + r / 100) * (Cdue / (r / 100)),

    growing_perpetual_annuity_PV_immediate: ({ C, q, g }: GrowingPerpetualImmediate) =>
        C / (q - g),

    growing_perpetual_annuity_PV_due: ({ Cdue, q, g }: GrowingPerpetualDue) =>
        (q * Cdue) / (q - g),

    // --- REPLACEMENT & REPAYMENT ---
    replacement_annuity_immediate: ({ C, r, m }: ReplacementImmediate) =>
        C * (m + (r * (m - 1)) / 2),

    replacement_annuity_due: ({ Cdue, r, m }: ReplacementDue) =>
        Cdue * (m + (r * (m + 1)) / 2),

    installment_repayment_Ak: ({ D0, r, k, N }: InstallmentAk) =>
        D0 * (r * (1 - (k - 1) / N) + 1 / N),

    installment_repayment_Dk: ({ D0, k, N }: InstallmentDk) =>
        D0 * (1 - k / N),

    annuity_repayment_A: ({ D0, r, N }: AnnuityRepaymentA) => {
        const q = 1 + r / 100;
        return D0 * (Math.pow(q, N) * (q - 1)) / (Math.pow(q, N) - 1);
    },

    annuity_repayment_Dk: ({ D0, r, N, k }: AnnuityRepaymentDk) => {
        const q = 1 + r / 100;
        return D0 * (Math.pow(q, N) - Math.pow(q, k)) / (Math.pow(q, N) - 1);
    },
};