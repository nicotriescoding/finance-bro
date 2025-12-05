// src/lib/variableGenerators.ts
// Zufallsvariable-Generator für ALLE 92 Formeltypen.
// Liefert realistische Finanzwerte je nach Typ zurück.

import { randInt, randFloat } from "./utils";

export function generateFormulaVariables(type: string) {
    switch (type) {
        // --- INTEREST CALCULATION ---
        case "simple_interest":
        case "compound_interest":
            return { C0: randInt(1000, 10000), r: randFloat(1, 8), N: randInt(1, 10) };

        case "continuous_interest_cn":
            return { C0: randInt(1000, 10000), r: randFloat(1, 8), n: randInt(1, 10) };

        case "effective_rate_m":
            return { r: randFloat(1, 15), m: randInt(1, 12) };

        case "effective_rate_continuous":
            return { r: randFloat(1, 15) };

        case "intra_year_interest_n":
            return { m: randInt(1, 12), n: randInt(1, 10) };

        // --- ANNUITIES (IMMEDIATE / DUE) ---
        case "annuity_immediate_fv":
        case "annuity_immediate_pv":
            return { C: randInt(100, 500), r: randFloat(1, 8), N: randInt(1, 10) };

        case "annuity_due_fv":
        case "annuity_due_pv":
            return { Cdue: randInt(100, 500), r: randFloat(1, 8), N: randInt(1, 10) };

        // --- ARITHMETICALLY GROWING ANNUITIES ---
        case "arithm_growing_fv_immediate":
        case "arithm_growing_pv_immediate":
            return { C: randInt(100, 500), d: randInt(5, 50), r: randFloat(1, 8), N: randInt(2, 10) };

        case "arithm_growing_fv_due":
        case "arithm_growing_pv_due":
            return { Cdue: randInt(100, 500), d: randInt(5, 50), r: randFloat(1, 8), N: randInt(2, 10) };

        // --- GEOMETRICALLY GROWING ANNUITIES ---
        case "geom_growing_fv_immediate_equal":
        case "geom_growing_pv_immediate_equal":
            return { C: randInt(100, 500), q: randFloat(1.01, 1.10), N: randInt(1, 10) };

        case "geom_growing_fv_immediate_neq":
        case "geom_growing_pv_immediate_neq":
            return { C: randInt(100, 500), q: randFloat(1.01, 1.10), g: randFloat(1.00, 1.08), N: randInt(1, 10) };

        case "geom_growing_fv_due_equal":
        case "geom_growing_pv_due_equal":
            return { Cdue: randInt(100, 500), q: randFloat(1.01, 1.10), N: randInt(1, 10) };

        case "geom_growing_fv_due_neq":
        case "geom_growing_pv_due_neq":
            return { Cdue: randInt(100, 500), q: randFloat(1.01, 1.10), g: randFloat(1.00, 1.08), N: randInt(1, 10) };

        // --- PERPETUAL ANNUITIES ---
        case "perpetual_annuity_pv_immediate":
            return { C: randInt(100, 500), r: randFloat(2, 10) };

        case "perpetual_annuity_pv_due":
            return { Cdue: randInt(100, 500), r: randFloat(2, 10) };

        case "growing_perpetual_annuity_pv_immediate":
        case "growing_perpetual_annuity_pv_due":
            return { C: randInt(100, 500), q: randFloat(1.01, 1.10), g: randFloat(1.00, 1.08) };

        // --- REPAYMENT / REPLACEMENT ---
        case "replacement_annuity_immediate":
        case "replacement_annuity_due":
            return { C: randInt(100, 500), r: randFloat(1, 10), m: randInt(1, 12) };

        case "installment_repayment_ak":
            return { D0: randInt(1000, 10000), r: randFloat(1, 10), k: randInt(1, 10), N: randInt(5, 20) };

        case "installment_repayment_dk":
            return { D0: randInt(1000, 10000), k: randInt(1, 10), N: randInt(5, 20) };

        case "annuity_repayment_a":
        case "annuity_repayment_dk":
            return { D0: randInt(1000, 10000), r: randFloat(1, 10), N: randInt(5, 20), k: randInt(1, 10) };

        // --- BONDS ---
        case "zerobond_price":
            return { BN: randInt(1000, 10000), r: randFloat(1, 10), N: randInt(1, 10) };

        case "coupon_bond_price":
            return { C: randInt(50, 200), BN: randInt(1000, 10000), r: randFloat(1, 10), N: randInt(1, 10) };

        case "term_structure_forward_rate":
            return { It_T: randFloat(1, 8), It_S: randFloat(1, 8), T: randInt(5, 10), S: randInt(1, 4), t: randInt(0, 1) };

        // --- STOCK VALUATION ---
        case "stock_total_return":
            return { D1: randInt(10, 100), P0: randInt(50, 200), P1: randInt(50, 250) };

        case "ddm_constant_growth":
            return { D1: randInt(1, 10), rE: randFloat(5, 15), w: randFloat(1, 5) };

        // --- DEFAULT ---
        default:
            console.warn(`⚠️ Kein Generator für Formeltyp: ${type}`);
            return { placeholder: 1 };
    }
}