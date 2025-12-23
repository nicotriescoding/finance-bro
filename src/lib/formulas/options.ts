// --- Typdefinitionen ---

type BinomialRiskNeutralInput = {
    rRF: number;
    u: number;
    d: number;
};

type BinomialCallInput = {
    p: number;
    Cu: number;
    Cd: number;
    rRF: number;
};

type BinomialPutInput = {
    p: number;
    Pu: number;
    Pd: number;
    rRF: number;
};

type D1Input = {
    S: number;
    K: number;
    r: number;
    sigma: number;
    T: number;
};

type D2Input = {
    d1: number;
    sigma: number;
    T: number;
};

type BlackScholesInput = {
    S: number;
    K: number;
    r: number;
    T: number;
    Nd1: number;
    Nd2: number;
};

type PutCallParityInput = {
    C: number;
    P: number;
    S: number;
    K: number;
    r: number;
    N: number;
};

// --- Formeln ---

export const optionFormulas = {
    // --- BINOMIAL MODEL ---

    binomial_risk_neutral_p: ({ rRF, u, d }: BinomialRiskNeutralInput) =>
        (1 + rRF - d) / (u - d),

    binomial_call_value: ({ p, Cu, Cd, rRF }: BinomialCallInput) =>
        (p * Cu + (1 - p) * Cd) / (1 + rRF / 100),

    binomial_put_value: ({ p, Pu, Pd, rRF }: BinomialPutInput) =>
        (p * Pu + (1 - p) * Pd) / (1 + rRF / 100),

    // --- BLACK-SCHOLES ---

    d1: ({ S, K, r, sigma, T }: D1Input) =>
        (Math.log(S / K) +
            (r / 100 + 0.5 * Math.pow(sigma / 100, 2)) * T) /
        ((sigma / 100) * Math.sqrt(T)),

    d2: ({ d1, sigma, T }: D2Input) =>
        d1 - (sigma / 100) * Math.sqrt(T),

    black_scholes_call: ({ S, K, r, T, Nd1, Nd2 }: BlackScholesInput) =>
        S * Nd1 - K * Math.exp((-r / 100) * T) * Nd2,

    black_scholes_put: ({ S, K, r, T, Nd1, Nd2 }: BlackScholesInput) =>
        K * Math.exp((-r / 100) * T) * (1 - Nd2) - S * (1 - Nd1),

    // --- PUT-CALL PARITY ---

    put_call_parity: ({ C, P, S, K, r, N }: PutCallParityInput) =>
        C + K / Math.pow(1 + r / 100, N) - S - P,
};