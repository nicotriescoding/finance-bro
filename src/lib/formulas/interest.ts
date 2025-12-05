// src/lib/formulas/interest.ts

/**
 * Zinsrechnungen (Interest Calculations)
 * Vollständige Abdeckung aller im Datensatz vorkommenden Zins-Typen.
 * Alle Berechnungen auf Prozentbasis (r/100).
 */

export const interestFormulas = {
    // --- SIMPLE INTEREST (Einfache Verzinsung) ---
    simple_interest: ({ C0, N, r }) =>
        C0 * (1 + N * (r / 100)),

    // --- COMPOUND INTEREST (Zinseszins) ---
    compound_interest: ({ C0, r, N }) =>
        C0 * Math.pow(1 + r / 100, N),

    // --- CONTINUOUS COMPOUNDING (Kontinuierliche Verzinsung) ---
    continuous_interest_CN: ({ C0, r, n }) =>
        C0 * Math.exp((r / 100) * n),

    // --- EFFECTIVE ANNUAL RATE (Effektivzins bei m Zahlungen pro Jahr) ---
    effective_rate_m: ({ r, m }) =>
        Math.pow(1 + r / (100 * m), m) - 1,

    // --- EFFECTIVE RATE CONTINUOUS (Kontinuierlich kapitalisierter Effektivzins) ---
    effective_rate_continuous: ({ r }) =>
        Math.exp(r / 100) - 1,

    // --- INTRA-YEAR INTEREST (Zins innerhalb des Jahres) ---
    intra_year_interest_N: ({ m, n }) =>
        m * n,
};