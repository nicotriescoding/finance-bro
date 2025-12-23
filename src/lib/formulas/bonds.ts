// --- Typdefinitionen ---

type ZeroBond = {
    BN: number;
    r: number;
    N: number;
};

type CouponBond = {
    C: number;
    BN: number;
    r: number;
    N: number;
};

type BondDuration = {
    B0: number;
    Ck: number;
    BN: number;
    r: number;
    N: number;
};

type ModifiedDuration = {
    D: number;
    r: number;
};

type PriceChangeApprox = {
    Dmod: number;
    dr: number;
};

type ForwardRate = {
    It_T: number;
    It_S: number;
    T: number;
    S: number;
    t: number;
};

// --- Formeln ---

export const bondFormulas = {
    // --- BASIC BOND VALUATION ---
    zerobond_price: ({ BN, r, N }: ZeroBond) =>
        BN / Math.pow(1 + r / 100, N),

    coupon_bond_price: ({ C, BN, r, N }: CouponBond) =>
        (C * ((Math.pow(1 + r / 100, N) - 1) / (r / 100)) + BN) /
        Math.pow(1 + r / 100, N),

    // --- DURATION & PRICE SENSITIVITY ---
    bond_duration_D: ({ B0, Ck, BN, r, N }: BondDuration) =>
        (1 / B0) *
        ((Ck * N) / Math.pow(1 + r / 100, N) +
            (N * BN) / Math.pow(1 + r / 100, N)),

    bond_modified_duration: ({ D, r }: ModifiedDuration) =>
        D / (1 + r / 100),

    bond_price_change_approx: ({ Dmod, dr }: PriceChangeApprox) =>
        -Dmod * dr,

    // --- TERM STRUCTURE (FORWARD RATES) ---
    term_structure_forward_rate: ({
                                      It_T,
                                      It_S,
                                      T,
                                      S,
                                      t,
                                  }: ForwardRate) => {
        return (
            Math.pow(
                Math.pow(1 + It_T / 100, T - t) /
                Math.pow(1 + It_S / 100, S - t),
                1 / (T - S)
            ) - 1
        );
    },
};