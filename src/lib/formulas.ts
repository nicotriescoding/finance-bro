// src/lib/formulas.ts
// Vollständige Abdeckung aller 92 Aufgaben-Typen aus ivf_tasks_full_difficulty.csv
// Alle Berechnungen in EUR-Logik mit Prozent in Dezimal (r/100).

export const formulaMap: Record<string, (vars: any) => number> = {
    // --- INTEREST CALCULATION ---
    simple_interest: ({ C0, N, r }) => C0 * (1 + N * (r / 100)),
    compound_interest: ({ C0, r, N }) => C0 * Math.pow(1 + r / 100, N),
    continuous_interest_CN: ({ C0, r, n }) => C0 * Math.exp((r / 100) * n),
    effective_rate_m: ({ r, m }) => Math.pow(1 + r / (100 * m), m) - 1,
    effective_rate_continuous: ({ r }) => Math.exp(r / 100) - 1,
    intra_year_interest_N: ({ m, n }) => m * n,

    // --- ANNUITIES (BASIS) ---
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

    // --- BOND VALUATION ---
    zerobond_price: ({ BN, r, N }) => BN / Math.pow(1 + r / 100, N),
    coupon_bond_price: ({ C, BN, r, N }) =>
        (C * ((Math.pow(1 + r / 100, N) - 1) / (r / 100)) + BN) /
        Math.pow(1 + r / 100, N),
    bond_duration_D: ({ B0, Ck, BN, r, N }) =>
        (1 / B0) * ((Ck * N) / Math.pow(1 + r / 100, N) + (N * BN) / Math.pow(1 + r / 100, N)),
    bond_modified_duration: ({ D, r }) => D / (1 + r / 100),
    bond_price_change_approx: ({ Dmod, dr }) => -Dmod * dr,

    // ✅ HIER: FEHLENDE FORMEL TERM STRUCTURE
    term_structure_forward_rate: ({ It_T, It_S, T, S, t }) => {
        // (1 + rS_T)^(T-S) = (1 + It_T)^(T-t) / (1 + It_S)^(S-t)
        // => rS_T = ((1 + It_T)^(T-t) / (1 + It_S)^(S-t))^(1/(T-S)) - 1
        return Math.pow(
            (Math.pow(1 + It_T / 100, T - t) / Math.pow(1 + It_S / 100, S - t)),
            1 / (T - S)
        ) - 1;
    },

    // --- STOCK VALUATION ---
    stock_total_return: ({ D1, P0, P1 }) => D1 / P0 + (P1 - P0) / P0,
    ddm_constant_growth: ({ D1, rE, w }) => D1 / ((rE / 100) - (w / 100)),
    ddm_changing_growth: ({ D1, wa, wb, rE, N }) => {
        const part1 = Array.from({ length: N }, (_, t) =>
            D1 * Math.pow(1 + wa / 100, t) / Math.pow(1 + rE / 100, t + 1)
        ).reduce((a, b) => a + b, 0);
        const part2 =
            (D1 * Math.pow(1 + wa / 100, N) * (1 + wb / 100)) /
            ((rE / 100) - (wb / 100)) /
            Math.pow(1 + rE / 100, N + 1);
        return part1 + part2;
    },
    multiple_PE: ({ P0, EPS }) => P0 / EPS,
    multiple_PB: ({ P0, VE }) => P0 / VE,

    // --- FINANCIAL RATIOS ---
    ratio_invested_capital: ({ E, NFO }) => E + NFO,
    ratio_net_debt: ({ D, FA }) => D - FA,
    ratio_debt_to_capital: ({ D, E }) => D / (E + D),
    ratio_debt_to_equity: ({ D, E }) => D / E,
    ratio_nfl: ({ NFO, E }) => NFO / E,
    ratio_debt_to_ev: ({ NFO, MV_E }) => NFO / (MV_E + NFO),
    ratio_interest_coverage: ({ EBIT, IE }) => EBIT / IE,
    ratio_current: ({ CA, CL }) => CA / CL,
    ratio_quick: ({ Cash, STI, AR, CL }) => (Cash + STI + AR) / CL,
    ratio_roe: ({ NI, E }) => NI / E,
    ratio_roic_at: ({ EBIT, tauC, IC }) => (EBIT * (1 - tauC)) / IC,
    ratio_nfe: ({ FE, NFO }) => FE / NFO,
    ratio_ebit_margin: ({ EBIT, Sales }) => EBIT / Sales,
    ratio_net_profit_margin: ({ NI, Sales }) => NI / Sales,
    ratio_eps: ({ NI, a }) => NI / a,
    ratio_diluted_eps_simple: ({ NI, a, df }) => NI / (a * df),
    ratio_pe_from_mc: ({ MC, NI }) => MC / NI,
    ratio_ebitda_multiple: ({ EV, EBITDA }) => EV / EBITDA,
    ratio_market_to_book: ({ P0, a, VE }) => (P0 * a) / VE,

    // --- DILUTED EARNINGS ---
    dilution_DF1: ({ n, a, X, S }) => Math.max(1, 1 + (n / a) * (1 - X / S)),
    dilution_DF2: ({ n, a, NV, c, NI, tauC }) =>
        Math.max(1, 1 + (n / a) / (1 + NV * (1 - tauC) * c / NI)),
    diluted_eps: ({ EPS, DF1, DF2 }) => EPS / (DF1 * DF2),

    // --- DUPONT / LEVERAGE ---
    dupont_identity: ({ NPM, AT, EM }) => NPM * AT * EM,
    book_leverage_equation: ({ ROICaT, NFL, NFE, tauC }) =>
        ROICaT + NFL * (ROICaT - NFE * (1 - tauC)),

    // --- INVESTMENT ANALYSIS ---
    npv: ({ CFt, r, T }) =>
        Array.from({ length: T + 1 }, (_, t) => CFt / Math.pow(1 + r / 100, t)).reduce(
            (a, b) => a + b,
            0
        ),
    profitability_index: ({ NPV, Resources }) => NPV / Resources,
    eva: ({ EBIT_t, tauC, r, IC_t_minus_1 }) =>
        EBIT_t * (1 - tauC) - (r / 100) * IC_t_minus_1,

    // --- COST OF CAPITAL & CAPM ---
    capm_expected_return: ({ rRF, rMkt, beta_i }) =>
        rRF + (rMkt - rRF) * beta_i,
    unlevered_cost_no_taxes: ({ E, D, rE, rD }) =>
        (E / (E + D)) * rE + (D / (E + D)) * rD,
    levered_equity_cost_no_taxes: ({ rU, rD, D, E }) =>
        rU + (D / E) * (rU - rD),
    unlevered_beta: ({ beta_E, beta_D, E, D }) =>
        (E / (E + D)) * beta_E + (D / (E + D)) * beta_D,
    equity_beta: ({ beta_U, beta_D, E, D }) =>
        beta_U + (D / E) * (beta_U - beta_D),
    wacc_with_taxes: ({ E, D, rE, rD, tauC }) =>
        (E / (E + D)) * rE + (D / (E + D)) * rD * (1 - tauC),
    wacc_target_leverage: ({ rU, D, E, tauC, rD }) =>
        rU - (D / (E + D)) * tauC * rD,
    hamada_unlevered_beta: ({ beta_E, D, E, tauC }) =>
        beta_E / (1 + (D / E) * (1 - tauC)),
    levered_firm_value: ({ VU, PV_ITS }) => VU + PV_ITS,

    // --- CORPORATE VALUATION ---
    equity_method_value: ({ FCFE_t, rE }) => FCFE_t / (rE / 100),
    entity_method_value: ({ FCF_t, rWACC }) => FCF_t / (rWACC / 100),
    apv_method_value: ({ FCF_t, rU, D, rD, tauC }) =>
        FCF_t / (rU / 100) + tauC * D * rD / (1 + rD / 100),

    //hier hab ich mit zweiten gpt die forrmeln eingefügt

    // --- OPTION PRICING (BINOMIAL & BLACK-SCHOLES) ---
    risk_neutral_prob_up: ({ rRF, u, d }) => (1 + rRF / 100 - d) / (u - d),
    option_value_binomial: ({ p, Cu, Cd, rRF }) =>
        (p * Cu + (1 - p) * Cd) / (1 + rRF / 100),
    intrinsic_value_call: ({ S, K }) => Math.max(S - K, 0),
    intrinsic_value_put: ({ S, K }) => Math.max(K - S, 0),
    put_call_parity: ({ C, P, S, K, r, N }) =>
        C + K / Math.pow(1 + r / 100, N) - S - P,







    // --- PORTFOLIO THEORY ---
    portfolio_return_two_assets: ({ wA, rA, wB, rB }) =>
        wA * (rA / 100) + wB * (rB / 100),
    portfolio_variance_two_assets: ({ wA, wB, sigmaA, sigmaB, rhoAB }) =>
        Math.pow(wA * (sigmaA / 100), 2) +
        Math.pow(wB * (sigmaB / 100), 2) +
        2 * wA * wB * (sigmaA / 100) * (sigmaB / 100) * rhoAB,
    portfolio_stddev_two_assets: ({ varP }) => Math.sqrt(varP),

    minimum_variance_weight_A: ({ sigmaA, sigmaB, rhoAB }) =>
        (Math.pow(sigmaB / 100, 2) - (sigmaA / 100) * (sigmaB / 100) * rhoAB) /
        (Math.pow(sigmaA / 100, 2) + Math.pow(sigmaB / 100, 2) - 2 * (sigmaA / 100) * (sigmaB / 100) * rhoAB),

    // --- EXPECTED VALUE & RISK METRICS ---
    expected_value: ({ probs, outcomes }) =>
        probs.reduce((sum: number, p: number, i: number) => sum + p * outcomes[i], 0),
    variance: ({ probs, outcomes }) => {
        const EV =
            probs.reduce((sum: number, p: number, i: number) => sum + p * outcomes[i], 0);
        return probs.reduce((sum: number, p: number, i: number) => sum + p * Math.pow(outcomes[i] - EV, 2), 0);
    },
    std_deviation: ({ variance }) => Math.sqrt(variance),
    cov_xy: ({ probs, X, Y }) => {
        const EX = probs.reduce((a: number, p: number, i: number) => a + p * X[i], 0);
        const EY = probs.reduce((a: number, p: number, i: number) => a + p * Y[i], 0);
        return probs.reduce((sum: number, p: number, i: number) => sum + p * (X[i] - EX) * (Y[i] - EY), 0);
    },
    corr_xy: ({ covXY, sigmaX, sigmaY }) =>
        covXY / ((sigmaX / 100) * (sigmaY / 100)),

    // --- PERFORMANCE METRICS ---
    sharpe_ratio: ({ rP, rF, sigmaP }) => (rP - rF) / sigmaP,
    treynor_ratio: ({ rP, rF, betaP }) => (rP - rF) / betaP,
    jensen_alpha: ({ rP, rF, betaP, rM }) =>
        rP - (rF + betaP * (rM - rF)),

    // --- RISK VALUE METRICS ---
    value_at_risk: ({ mu, sigma, z, V0 }) =>
        V0 * (mu / 100 - z * sigma / 100),
    expected_shortfall: ({ mu, sigma, z, V0, pdf_z }) =>
        V0 * (mu / 100 - (pdf_z / (1 - z)) * sigma / 100),

    // --- BLACK-SCHOLES FORMULAS (EUROPEAN CALL & PUT) ---
    d1: ({ S, K, r, sigma, T }) =>
        (Math.log(S / K) + (r / 100 + 0.5 * Math.pow(sigma / 100, 2)) * T) /
        ((sigma / 100) * Math.sqrt(T)),
    d2: ({ d1, sigma, T }) => d1 - (sigma / 100) * Math.sqrt(T),
    black_scholes_call: ({ S, K, r, T, Nd1, Nd2 }) =>
        S * Nd1 - K * Math.exp(-r / 100 * T) * Nd2,
    black_scholes_put: ({ S, K, r, T, Nd1, Nd2 }) =>
        K * Math.exp(-r / 100 * T) * (1 - Nd2) - S * (1 - Nd1),
//stopp hier zweites gpt

    // --- OPTION VALUATION
    binomial_risk_neutral_p: ({ rRF, u, d }) =>
        (1 + rRF - d) / (u - d),
    binomial_call_value: ({ p, Cu, Cd, rRF }) =>
        (p * Cu + (1 - p) * Cd) / (1 + rRF),
    binomial_put_value: ({ p, Pu, Pd, rRF }) =>
        (p * Pu + (1 - p) * Pd) / (1 + rRF),

    // --- FINANCIAL ANALYSIS METRICS ---
    fcf_definition: ({ EBIT, tauC, Depr, NCExp, NCEarn, DeltaNWC, CFI }) =>
        EBIT * (1 - tauC) + Depr + NCExp - NCEarn + DeltaNWC + CFI,

    fcfe_definition: ({ NI, Depr, NCExp, NCEarn, DeltaNWC, CFI, CFF }) =>
        NI + Depr + NCExp - NCEarn + DeltaNWC + CFI + CFF,

    // --- INVESTMENT ANALYSIS METRICS (kompakt) ---
    irr: ({ CF, low = -0.99, high = 1.0, tol = 1e-6, maxIter = 1000 }) => {
        if (!Array.isArray(CF) || CF.length === 0) return NaN; // Schutz gegen undefined oder leere Arrays

        let l = low, h = high;
        for (let i = 0; i < maxIter; i++) {
            const m = (l + h) / 2;
            const npv = CF.reduce((sum, cf, t) => sum + cf / Math.pow(1 + m, t), 0);
            if (Math.abs(npv) < tol) return m;
            if (npv > 0) l = m; else h = m;
        }
        return (l + h) / 2;
    },


    payback_period: ({ CF }) => {
        if (!Array.isArray(CF) || CF.length === 0) return NaN; // Schutz gegen undefined oder leere Arrays
        let cum = 0;
        for (let t = 0; t < CF.length; t++) {
            const prev = cum;
            cum += CF[t];
            if (cum >= 0) return t + (0 - prev) / CF[t]; // lineare Interpolation
        }
        return CF.length; // falls nie positiv
    },

// --- CAPITAL INCREASE METRICS ---
    capital_increase_cash_Pex: ({ BV, Pcum, IP }) =>
        (BV * Pcum + IP) / (BV + 1),

    capital_increase_SR_no_div_disadv: ({ Pcum, IP, BV }) =>
        (Pcum - IP) / (BV + 1),

    capital_increase_SR_with_div_disadv: ({ Pcum, IP, Diva, Divn, q, t, BV }) =>
        (Pcum - IP - (Diva - Divn) * Math.pow(q, -t)) / (BV + 1),

    capital_increase_from_funds_Pex: ({ Pcum, BV }) =>
        Pcum / (1 + 1 / BV),






    // --- FALLBACK ---
    default: () => NaN,
};