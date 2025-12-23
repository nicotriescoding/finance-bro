// src/lib/utils.ts

export function normalizeFormulaName(type: string): string {
    return type?.trim() ?? "";
}

export function parseVariables(vars: string | Record<string, any> | null): Record<string, number> {
    if (!vars) return {};
    if (typeof vars === "object") return vars;

    const obj: Record<string, number> = {};
    vars.split(/[;,]/).forEach((pair) => {
        const [key, value] = pair.split("=").map((v) => v.trim());
        if (key && !isNaN(Number(value))) obj[key] = Number(value);
    });
    return obj;
}


export function randFloat(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function generateVariables(formula: string) {
    switch (formula) {
        // --- ZINSBERECHNUNG ---
        case "simple_interest":
        case "compound_interest":
        case "continuous_interest_CN":
        case "intra_year_interest_N":
            return { C0: randInt(1000, 10000), r: randInt(1, 10), N: randInt(1, 10), n: randInt(1, 5), m: randInt(1, 12) };
        case "effective_rate_m":
        case "effective_rate_continuous":
            return { r: randInt(1, 12), m: randInt(1, 12) };

        // --- ANNUITÄTEN (konstant) ---
        case "annuity_immediate_FV":
        case "annuity_due_FV":
        case "annuity_immediate_PV":
        case "annuity_due_PV":
            return { C: randInt(100, 500), Cdue: randInt(100, 500), r: randInt(1, 8), N: randInt(2, 10) };

        // --- ARITHMETISCH WACHSENDE RENTEN ---
        case "arithm_growing_FV_immediate":
        case "arithm_growing_FV_due":
        case "arithm_growing_PV_immediate":
        case "arithm_growing_PV_due":
            return {
                C: randInt(100, 300),
                Cdue: randInt(100, 300),
                d: randInt(5, 30), // jährliche Steigerung
                r: randInt(2, 8),
                N: randInt(3, 12)
            };

        // --- GEOMETRISCH WACHSENDE RENTEN ---
        case "geom_growing_FV_immediate_equal":
        case "geom_growing_FV_immediate_neq":
        case "geom_growing_FV_due_equal":
        case "geom_growing_FV_due_neq":
        case "geom_growing_PV_immediate_equal":
        case "geom_growing_PV_immediate_neq":
        case "geom_growing_PV_due_equal":
        case "geom_growing_PV_due_neq":
            return {
                C: randInt(100, 300),
                Cdue: randInt(100, 300),
                q: 1 + randInt(2, 8) / 100,   // Zinsfaktor
                g: 1 + randInt(0, 6) / 100,   // Wachstumsfaktor (unterhalb von q)
                N: randInt(3, 10)
            };

        // --- EWIGE RENTEN ---
        case "perpetual_annuity_PV_immediate":
        case "perpetual_annuity_PV_due":
            return { C: randInt(200, 1000), Cdue: randInt(200, 1000), r: randInt(2, 8) };

        // --- EWIGE WACHSENDE RENTEN ---
        case "growing_perpetual_annuity_PV_immediate":
        case "growing_perpetual_annuity_PV_due":
            return {
                C: randInt(200, 1000),
                Cdue: randInt(200, 1000),
                q: 1 + randInt(3, 8) / 100,
                g: 1 + randInt(1, 4) / 100
            };

        // --- ERSATZ- UND TILGUNGSZAHLUNGEN ---
        case "replacement_annuity_immediate":
        case "replacement_annuity_due":
            return { C: randInt(100, 400), Cdue: randInt(100, 400), r: randInt(1, 8), m: randInt(1, 12) };

        case "installment_repayment_Ak":
        case "installment_repayment_Dk":
        case "annuity_repayment_A":
        case "annuity_repayment_Dk":
            return { D0: randInt(1000, 5000), r: randInt(2, 8), N: randInt(3, 10), k: randInt(1, 10) };


        // --- BONDS / ANLEIHEN ---
        case "zerobond_price":
        case "zerobond":
            return {
                BN: randInt(500, 10000),   // Rückzahlungsbetrag (Nominalwert)
                r: randInt(1, 8),          // Zinssatz in %
                N: randInt(1, 30)          // Laufzeit in Jahren
            };

        case "coupon_bond_price":
        case "coupon_bond":
            return {
                C: randInt(20, 300),       // jährlicher Coupon
                BN: randInt(1000, 10000),  // Rückzahlung (Nominalwert)
                r: randInt(1, 8),          // Marktzins in %
                N: randInt(2, 30)          // Restlaufzeit in Jahren
            };

        case "bond_duration_D":
            return {
                B0: randInt(900, 1100),    // aktueller Kurs in EUR
                Ck: randInt(20, 300),      // jährlicher Coupon
                BN: randInt(1000, 10000),  // Rückzahlung
                r: randInt(1, 8),          // Marktzins
                N: randInt(2, 30)          // Laufzeit
            };

        case "bond_modified_duration":
            return {
                D: randInt(3, 10),         // Macaulay-Duration in Jahren
                r: randInt(1, 8)           // Zinssatz
            };

        case "bond_price_change_approx":
            return {
                Dmod: randInt(3, 10),      // Modifizierte Duration
                dr: (Math.random() * 0.05).toFixed(3) // kleine Zinsänderung (0–5 %)
            };

        case "term_structure_forward_rate":
            return {
                It_T: randInt(1, 8),       // Spot Rate bis T
                It_S: randInt(1, 8),       // Spot Rate bis S
                T: randInt(5, 10),         // längere Laufzeit
                S: randInt(1, 4),          // kürzere Laufzeit
                t: randInt(0, 1)           // Startzeitpunkt (z. B. heute)
            };

        // --- CAPITAL INCREASE (KAPITALERHÖHUNG) ---
        case "capital_increase_cash_Pex":
            return {
                BV: randInt(1, 5),          // Bezugsverhältnis (z.B. 3 alte : 1 neue)
                Pcum: randInt(80, 150),     // Kurs der Aktie vor Kapitalerhöhung (€)
                IP: randInt(50, 120)        // Ausgabepreis der neuen Aktie (€)
            };

        case "capital_increase_SR_no_div_disadv":
            return {
                Pcum: randInt(80, 150),     // Kurs vor Kapitalerhöhung (€)
                IP: randInt(50, 120),       // Ausgabepreis der neuen Aktie (€)
                BV: randInt(1, 5)           // Bezugsverhältnis
            };

        case "capital_increase_SR_with_div_disadv":
            return {
                Pcum: randInt(80, 150),     // Kurs vor Kapitalerhöhung (€)
                IP: randInt(50, 120),       // Ausgabepreis (€)
                Diva: randInt(2, 6),        // Dividende alte Aktie (€)
                Divn: randInt(1, 5),        // Dividende neue Aktie (€)
                q: (1 + Math.random() * 0.05).toFixed(3), // Diskontierungsfaktor (1–1.05)
                t: randInt(0, 1),           // Zeit bis Auszahlung
                BV: randInt(1, 5)           // Bezugsverhältnis
            };

        case "capital_increase_from_funds_Pex":
            return {
                Pcum: randInt(80, 150),     // Kurs vor Kapitalerhöhung (€)
                BV: randInt(1, 5)           // Bezugsverhältnis
            };

        // --- INVESTMENT ANALYSIS ---
        case "npv":
            return {
                CFt: randInt(100, 500), // gleichmäßiger Cashflow
                r: randInt(3, 12),      // Diskontierungszins in %
                T: randInt(3, 10)       // Laufzeit in Jahren
            };

        case "profitability_index":
            return {
                NPV: randInt(1000, 10000),  // Kapitalwert (€)
                Resources: randInt(2000, 15000) // Investitionsvolumen (€)
            };

        case "eva":
            return {
                EBIT_t: randInt(1000, 10000),   // Earnings Before Interest and Taxes
                tauC: Math.random() * 0.3,      // Unternehmenssteuersatz (0–30%)
                r: randInt(5, 15),              // Kapitalkosten in %
                IC_t_minus_1: randInt(5000, 20000) // Investiertes Kapital (€)
            };

        case "irr":
            return {
                CF: Array.from({ length: randInt(3, 7) }, (_, i) =>
                    i === 0 ? -randInt(5000, 15000) : randInt(1000, 7000)
                ) // typischer Cashflow mit negativem Start-Invest
            };

        case "payback_period":
            return {
                CF: (() => {
                    const years = randInt(3, 8);
                    const cashflows = [-randInt(5000, 15000)];
                    for (let i = 1; i < years; i++) cashflows.push(randInt(1000, 7000));
                    return cashflows;
                })()
            };

        // --- OPTIONS & DERIVATIVES ---
        case "risk_neutral_prob_up":
        case "option_value_binomial":
        case "binomial_call_value":
        case "binomial_put_value":
            return {
                rRF: randInt(1, 6),       // risikofreier Zins (%)
                u: 1 + Math.random() * 0.2, // Up-Faktor (z. B. +10–20%)
                d: 1 - Math.random() * 0.2, // Down-Faktor (z. B. -10–20%)
                p: Math.random(),         // Risikoneutrale Wahrscheinlichkeit
                Cu: randInt(50, 200),     // Call-Wert bei Kursanstieg
                Cd: randInt(10, 150),     // Call-Wert bei Kursrückgang
                Pu: randInt(10, 150),     // Put-Wert bei Kursanstieg
                Pd: randInt(20, 200)      // Put-Wert bei Kursrückgang
            };

        case "intrinsic_value_call":
        case "intrinsic_value_put":
        case "put_call_parity":
            return {
                S: randInt(80, 120),      // aktueller Kurs
                K: randInt(80, 120),      // Strike Price
                r: randInt(1, 6),         // Zinssatz (%)
                N: randInt(1, 5),         // Laufzeit (Jahre)
                C: randInt(5, 20),        // Callpreis
                P: randInt(5, 20)         // Putpreis
            };

        case "d1":
        case "d2":
        case "black_scholes_call":
        case "black_scholes_put":
            return {
                S: randInt(80, 120),       // Spot Price
                K: randInt(80, 120),       // Strike
                r: randInt(1, 6),          // Zinsrate (%)
                sigma: randInt(10, 40),    // Volatilität (%)
                T: parseFloat((Math.random() * 2).toFixed(2)), // Zeit bis Verfall (0–2 Jahre)
                Nd1: Math.random(),        // N(d1) - Normalverteilte Werte (0–1)
                Nd2: Math.random()         // N(d2)
            };

        // --- PORTFOLIO THEORY & RISK METRICS ---
        case "portfolio_return_two_assets":
        case "portfolio_variance_two_assets":
        case "portfolio_stddev_two_assets":
        case "minimum_variance_weight_A":
            return {
                wA: parseFloat((Math.random()).toFixed(2)), // Gewichtung Asset A
                wB: parseFloat((Math.random()).toFixed(2)), // Gewichtung Asset B
                rA: randInt(2, 12),                        // Rendite A (%)
                rB: randInt(2, 12),                        // Rendite B (%)
                sigmaA: randInt(5, 25),                    // Volatilität A (%)
                sigmaB: randInt(5, 25),                    // Volatilität B (%)
                rhoAB: parseFloat((Math.random() * 2 - 1).toFixed(2)) // Korrelation (-1 bis +1)
            };

        case "expected_value":
        case "variance":
        case "cov_xy":
        case "corr_xy":
            const numOutcomes = randInt(3, 5);
            const probs = Array.from({ length: numOutcomes }, () => parseFloat(Math.random().toFixed(2)));
            const outcomes = Array.from({ length: numOutcomes }, () => randInt(-20, 20));
            const X = Array.from({ length: numOutcomes }, () => randInt(-10, 10));
            const Y = Array.from({ length: numOutcomes }, () => randInt(-10, 10));
            const sumProbs = probs.reduce((a, b) => a + b, 0);
            const normalizedProbs = probs.map(p => parseFloat((p / sumProbs).toFixed(2)));
            return { probs: normalizedProbs, outcomes, X, Y, sigmaX: randInt(5, 25), sigmaY: randInt(5, 25), covXY: randInt(-10, 10) };

        case "std_deviation":
            return { variance: randInt(5, 50) };

        // --- PERFORMANCE METRICS ---
        case "sharpe_ratio":
        case "treynor_ratio":
        case "jensen_alpha":
            return {
                rP: randInt(5, 15),       // Portfolio-Rendite (%)
                rF: randInt(1, 5),        // Risikofreier Zins (%)
                sigmaP: randInt(5, 25),   // Standardabweichung (%)
                betaP: parseFloat((Math.random() * 1.5).toFixed(2)), // Beta
                rM: randInt(5, 15)        // Marktrendite (%)
            };


        // --- FINANCIAL RATIOS ---
        case "ratio_invested_capital":
            return { E: randInt(50000, 200000), NFO: randInt(20000, 150000) };

        case "ratio_net_debt":
            return { D: randInt(50000, 200000), FA: randInt(10000, 80000) };

        case "ratio_debt_to_capital":
        case "ratio_debt_to_equity":
            return { D: randInt(20000, 150000), E: randInt(30000, 200000) };

        case "ratio_nfl":
        case "ratio_debt_to_ev":
            return {
                NFO: randInt(50000, 250000),
                E: randInt(40000, 250000),
                MV_E: randInt(100000, 300000),
            };

        case "ratio_interest_coverage":
            return { EBIT: randInt(20000, 100000), IE: randInt(1000, 20000) };

        case "ratio_current":
        case "ratio_quick":
            return {
                CA: randInt(50000, 200000),
                CL: randInt(20000, 150000),
                Cash: randInt(5000, 50000),
                STI: randInt(5000, 40000),
                AR: randInt(5000, 50000),
            };

        case "ratio_roe":
            return { NI: randInt(10000, 80000), E: randInt(50000, 200000) };

        case "ratio_roic_at":
            return { EBIT: randInt(20000, 120000), tauC: 0.3, IC: randInt(100000, 400000) };

        case "ratio_nfe":
            return { FE: randInt(10000, 60000), NFO: randInt(80000, 250000) };

        case "ratio_ebit_margin":
        case "ratio_net_profit_margin":
            return { EBIT: randInt(20000, 120000), NI: randInt(10000, 80000), Sales: randInt(100000, 500000) };

        case "ratio_eps":
        case "ratio_diluted_eps_simple":
            return { NI: randInt(10000, 80000), a: randInt(1000, 10000), df: randInt(1, 2) };

        case "ratio_pe_from_mc":
            return { MC: randInt(1000000, 5000000), NI: randInt(50000, 300000) };

        case "ratio_ebitda_multiple":
            return { EV: randInt(1000000, 5000000), EBITDA: randInt(100000, 600000) };

        case "ratio_market_to_book":
            return { P0: randInt(10, 200), a: randInt(1000, 10000), VE: randInt(100000, 1000000) };



        // --- VALUATION FORMULAS ---
        case "stock_total_return":
            return {
                D1: randInt(1, 10),      // Dividende je Aktie
                P0: randInt(50, 200),    // Anfangskurs
                P1: randInt(50, 250),    // Endkurs
            };

        case "ddm_constant_growth":
            return {
                D1: randInt(2, 10),      // Dividende im nächsten Jahr
                rE: randInt(6, 12),      // Eigenkapitalkosten (%)
                w: randInt(1, 5),        // konstantes Dividendenwachstum (%)
            };

        case "ddm_changing_growth":
            return {
                D1: randInt(1, 8),       // Dividende im nächsten Jahr
                wa: randInt(3, 10),      // Wachstumsrate in der ersten Phase (%)
                wb: randInt(1, 5),       // Wachstumsrate in der ewigen Rente (%)
                rE: randInt(6, 12),      // Eigenkapitalkosten (%)
                N: randInt(3, 7),        // Dauer der ersten Wachstumsphase (Jahre)
            };

        case "multiple_PE":
            return {
                P0: randInt(10, 300),    // Aktienkurs
                EPS: parseFloat((Math.random() * 10 + 1).toFixed(2)), // Gewinn je Aktie
            };

        case "multiple_PB":
            return {
                P0: randInt(10, 300),    // Aktienkurs
                VE: parseFloat((Math.random() * 50 + 10).toFixed(2)), // Buchwert je Aktie
            };


// --- WACC & COST OF CAPITAL ---
        case "capm_expected_return":
            return {
                rRF: randInt(1, 4),                         // Risikofreier Zinssatz (%)
                rMkt: randInt(6, 12),                       // Marktrendite (%)
                beta_i: parseFloat((Math.random() * 1.5).toFixed(2)), // Beta des Unternehmens
            };

        case "unlevered_cost_no_taxes":
            return {
                E: randInt(50000, 300000),                  // Eigenkapital
                D: randInt(20000, 200000),                  // Fremdkapital
                rE: randInt(6, 14),                         // Eigenkapitalkosten (%)
                rD: randInt(2, 8),                          // Fremdkapitalkosten (%)
            };

        case "levered_equity_cost_no_taxes":
            return {
                rU: randInt(6, 10),                         // Unverschuldete Kapitalkosten (%)
                rD: randInt(2, 8),                          // Fremdkapitalkosten (%)
                D: randInt(30000, 250000),                  // Fremdkapital
                E: randInt(50000, 300000),                  // Eigenkapital
            };

        case "unlevered_beta":
            return {
                beta_E: parseFloat((Math.random() * 1.5 + 0.5).toFixed(2)), // Beta des EK
                beta_D: parseFloat((Math.random() * 0.5).toFixed(2)),       // Beta des FK (nahe 0)
                E: randInt(50000, 300000),
                D: randInt(20000, 200000),
            };

        case "equity_beta":
            return {
                beta_U: parseFloat((Math.random() * 1.2 + 0.3).toFixed(2)), // Unlevered Beta
                beta_D: parseFloat((Math.random() * 0.5).toFixed(2)),       // Beta FK
                E: randInt(60000, 350000),
                D: randInt(20000, 200000),
            };

        case "wacc_with_taxes":
            return {
                E: randInt(50000, 300000),
                D: randInt(20000, 200000),
                rE: randInt(6, 14),
                rD: randInt(2, 8),
                tauC: parseFloat((Math.random() * 0.25 + 0.15).toFixed(2)), // Unternehmenssteuersatz (15–40 %)
            };

        case "wacc_target_leverage":
            return {
                rU: randInt(6, 10),                         // Unverschuldete Kapitalkosten (%)
                D: randInt(20000, 200000),
                E: randInt(50000, 300000),
                tauC: parseFloat((Math.random() * 0.25 + 0.15).toFixed(2)), // Steuersatz
                rD: randInt(2, 8),
            };

        case "hamada_unlevered_beta":
            return {
                beta_E: parseFloat((Math.random() * 1.5 + 0.5).toFixed(2)), // Levered Beta
                D: randInt(20000, 200000),
                E: randInt(50000, 300000),
                tauC: parseFloat((Math.random() * 0.25 + 0.15).toFixed(2)), // Steuersatz
            };

        case "levered_firm_value":
            return {
                VU: randInt(500000, 3000000),               // Unternehmenswert unverschuldet
                PV_ITS: randInt(20000, 500000),             // Barwert Steuervorteil aus FK
            };

// --- FREE CASH FLOW TO THE FIRM (FCF) ---
        case "fcf_to_firm":
            return {
                EBIT: randInt(50000, 500000),                // Ergebnis vor Zinsen und Steuern
                tauC: parseFloat((Math.random() * 0.25 + 0.15).toFixed(2)), // Unternehmenssteuersatz (15–40 %)
                Depr: randInt(10000, 80000),                 // Abschreibungen
                NCExp: randInt(5000, 30000),                 // Sonstige nicht zahlungswirksame Aufwendungen
                NCEarn: randInt(2000, 20000),                // Sonstige nicht zahlungswirksame Erträge
                DeltaNWC: randInt(-20000, 40000),            // Veränderung des Nettoumlaufvermögens (+ = Mittelabfluss)
                CFI: randInt(-200000, -50000),               // Cashflow aus Investitionstätigkeit (negativ, Mittelabfluss)
            };

// --- RISK-NEUTRAL PROBABILITY ---
        case "risk_neutral_probability":
            return {
                rRF: randInt(2, 8),                         // Risikofreier Zinssatz (%)
                u: parseFloat((1 + Math.random() * 0.4 + 0.05).toFixed(2)), // Up-Faktor (z. B. 1.05–1.45)
                d: parseFloat((1 - Math.random() * 0.3 - 0.05).toFixed(2)), // Down-Faktor (z. B. 0.65–0.95)
            };


        // --- EQUITY VALUE (EQUITY METHOD) ---
        case "equity_value_equity_method":
            return {
                FCFE_t: randInt(20000, 200000),             // Erwarteter Free Cash Flow to Equity im nächsten Jahr
                rE: randInt(6, 14),                         // Eigenkapitalkosten (%)
            };

        // --- RETURN ON EQUITY (DUPONT IDENTITY) ---
        case "roe_dupont":
            return {
                NPM: parseFloat((Math.random() * 0.15 + 0.05).toFixed(2)), // Net Profit Margin (5–20 %)
                AT: parseFloat((Math.random() * 1.5 + 0.5).toFixed(2)),    // Asset Turnover (0.5–2.0)
                EM: parseFloat((Math.random() * 2 + 1).toFixed(2)),        // Equity Multiplier (1–3)
            };

// --- FREE CASH FLOW TO THE FIRM (FCF) ---
        case "fcf_to_firm":
            return {
                EBIT: randInt(50000, 600000),                // Ergebnis vor Zinsen und Steuern
                tauC: parseFloat((Math.random() * 0.25 + 0.15).toFixed(2)), // Unternehmenssteuersatz (15–40 %)
                Depr: randInt(10000, 90000),                 // Abschreibungen
                NCExp: randInt(5000, 40000),                 // Nicht-zahlungswirksame Aufwendungen
                NCEarn: randInt(2000, 20000),                // Nicht-zahlungswirksame Erträge
                DeltaNWC: randInt(-30000, 40000),            // Veränderung Nettoumlaufvermögen (+ = Mittelabfluss)
                CFI: randInt(-250000, -50000),               // Cashflow aus Investitionstätigkeit (meist negativ)
            };




        // --- DEFAULT ---
        default:
            return {};
    }
}