// src/lib/rankings.ts

export type Rank = {
    minLevel: number;
    title: string;
    emoji: string;
    /** one-line career perk, shown on the CAREER TRACK card (design 3a) */
    perk: string;
    /**
     * Last monthly payroll of the position in € - decorative satire for the
     * landing statement ("Salary · Unemployed +0.00 €"), NOT BroDollars.
     */
    salary: number;
    /**
     * Flat BroDollar bonus added to every correctly settled posting at this
     * rank. Small and static on purpose - seniority pays a little better,
     * it does not multiply.
     */
    bonus: number;
    /** Spending tier of the landing statement (EXPENSE_TIERS index). */
    tier: number;
};

// Level → rank. The ladder (titles + emoji) is original finance-bro canon -
// do not rename or reorder it. Nine in-between ranks were added 2026-09-07
// (Nico's picks). The perk lines are 3a microcopy.
export const ranks: Rank[] = [
    { minLevel: 1, title: "Pupil", emoji: "🎒", perk: "Pocket money. Homework due Monday.", salary: 20, bonus: 0, tier: 0 },
    { minLevel: 2, title: "Unemployed", emoji: "🛋️", perk: "Overdraft approved. Nothing else is.", salary: 0, bonus: 0, tier: 0 },
    { minLevel: 3, title: "Volunteer", emoji: "🧡", perk: "Paid in gratitude. Gratitude is not legal tender.", salary: 0, bonus: 1, tier: 0 },
    { minLevel: 4, title: "Unpaid Intern", emoji: "🧃", perk: "Experience is the compensation.", salary: 0, bonus: 2, tier: 0 },
    { minLevel: 5, title: "Low Earner", emoji: "🥲", perk: "Paid monthly, spent weekly.", salary: 1204, bonus: 5, tier: 0 },
    { minLevel: 6, title: "Minimum Wage Grunt", emoji: "🛠️", perk: "Every hour documented, none of them yours.", salary: 1872, bonus: 10, tier: 1 },
    { minLevel: 7, title: "Working Student", emoji: "📚", perk: "12 €/h, printer access.", salary: 1038, bonus: 15, tier: 1 },
    { minLevel: 8, title: "Excel Monkey", emoji: "🐒", perk: "VLOOKUP is a personality.", salary: 2450, bonus: 18, tier: 1 },
    { minLevel: 9, title: "Subcontractor", emoji: "🪪", perk: "Invoices monthly, paid quarterly.", salary: 3100, bonus: 20, tier: 1 },
    { minLevel: 10, title: "Junior Consultant", emoji: "🧑‍💼", perk: "Slide decks at 02:00.", salary: 3741, bonus: 25, tier: 2 },
    { minLevel: 11, title: "Consultant", emoji: "💼", perk: "Same decks, higher day rate.", salary: 5983, bonus: 35, tier: 2 },
    { minLevel: 12, title: "LinkedIn Thought Leader", emoji: "🎙️", perk: "Agree? Repost. 👇", salary: 7400, bonus: 40, tier: 2 },
    { minLevel: 13, title: "Investmentbanker", emoji: "🏦", perk: "The desk has a cot now.", salary: 11250, bonus: 50, tier: 3 },
    { minLevel: 14, title: "Crypto Bro", emoji: "🪙", perk: "Net worth depends on the hour.", salary: 13370, bonus: 55, tier: 3 },
    { minLevel: 15, title: "VC Guy", emoji: "🚀", perk: "Loses other people's money, confidently.", salary: 14801, bonus: 65, tier: 3 },
    { minLevel: 16, title: "Managing Director", emoji: "📈", perk: "Reads one number per meeting.", salary: 33333, bonus: 80, tier: 4 },
    { minLevel: 17, title: "Hedge Fund Guy", emoji: "🦈", perk: "2 and 20. Mostly the 2.", salary: 41667, bonus: 90, tier: 4 },
    { minLevel: 18, title: "Unicorn Founder", emoji: "🦄", perk: "Profitable at some point, allegedly.", salary: 1, bonus: 100, tier: 4 },
    { minLevel: 19, title: "Family Office Heir", emoji: "🎾", perk: "Worked hard. Chose the right parents.", salary: 250000, bonus: 110, tier: 5 },
    { minLevel: 20, title: "Jeff Bezzo’s", emoji: "🚀🛸", perk: "Owns the warehouse. And the weekend.", salary: 12700416, bonus: 120, tier: 5 },
    { minLevel: 21, title: "FinanceBro", emoji: "💸💪", perk: "The market fears you. So does HR.", salary: 2147483647, bonus: 150, tier: 5 },
];

/**
 * BroDollars needed to get FROM level i+1 TO level i+2 (`LEVEL_COSTS[0]` is
 * the cost of level 1 → 2). Two warm-up steps (50, 100 - one question each),
 * then geometric ×1.45, exactly 1,000,000 💸 from Pupil to FinanceBro
 * (21 ranks) - Nico's number. Calibrated
 * 2026-09-07 against a full Econ 1 marathon (107 postings, ~18,700 💸 at
 * average speed + the rank bonus): the first run ends at Junior Consultant,
 * Jeff Bezzo's takes ~25 full runs, FinanceBro ~35. Past FinanceBro the
 * level keeps climbing at the final cost, but the TITLE comes from the
 * semester leaderboard (see `endgameRank`).
 */
export const LEVEL_COSTS = [
    50, 100, 550, 800, 1200, 1700, 2500, 3600, 5200, 7550, 10950, 15900, 23050,
    33450, 48500, 70300, 101950, 147800, 214300, 310550,
] as const;

const COST_PAST_LADDER = 310550;

export function levelCost(level: number): number {
    return LEVEL_COSTS[level - 1] ?? COST_PAST_LADDER;
}

/** Pure level math: cumulative score → level, progress to next, cost of next. */
export function levelFromScore(score: number): {
    level: number;
    progress: number;
    nextRequired: number;
} {
    let level = 1;
    let remaining = Math.max(0, score);
    let required = levelCost(level);

    while (remaining >= required) {
        remaining -= required;
        level++;
        required = levelCost(level);
    }

    return {
        level,
        progress: remaining / required, // 0..1, drives the progress bar
        nextRequired: required,
    };
}

// Helper: find the current rank for a level
export function getRank(level: number): Rank {
    let current = ranks[0];
    for (const r of ranks) {
        if (level >= r.minLevel) {
            current = r;
        } else {
            break;
        }
    }
    return current;
}

/** Position of a level's rank on the ladder (0 = Pupil). */
export function rankIndex(level: number): number {
    return ranks.indexOf(getRank(level));
}

/** The rank after the current one, or null at the top of the ladder. */
export function getNextRank(level: number): Rank | null {
    const current = getRank(level);
    const i = ranks.indexOf(current);
    return i >= 0 && i + 1 < ranks.length ? ranks[i + 1] : null;
}

/** Flat completion bonus for the rank a given score has reached. */
export function bonusForScore(score: number): number {
    return getRank(levelFromScore(score).level).bonus;
}

// ---------------------------------------------------------------------------
// Endgame - past FinanceBro the ladder is the international leaderboard

/** The level at which the ladder ends and the leaderboard takes over. */
export const FINANCEBRO_LEVEL = ranks[ranks.length - 1].minLevel;

export function isEndgame(level: number): boolean {
    return level >= FINANCEBRO_LEVEL;
}

function ordinal(n: number): string {
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
    switch (n % 10) {
        case 1:
            return `${n}st`;
        case 2:
            return `${n}nd`;
        case 3:
            return `${n}rd`;
        default:
            return `${n}th`;
    }
}

/**
 * Title for a FinanceBro by their position on the overall semester
 * leaderboard: #1 is The Richest Person, #2-#10 the Nth Richest Person,
 * #11 Almost Made It, everyone below is FinanceBro #position. Unknown
 * position (offline, desk not staffed, nothing earned this semester) → the
 * plain FinanceBro rank.
 */
export function endgameRank(position: number | null): Rank {
    const top = ranks[ranks.length - 1];
    if (position === null || position < 1) return top;
    const base = { minLevel: top.minLevel, salary: top.salary, bonus: top.bonus, tier: top.tier };
    if (position === 1)
        return { ...base, title: "The Richest Person", emoji: "👑", perk: "Forbes has your number. So does the tax office." };
    if (position === 2)
        return { ...base, title: "2nd Richest Person", emoji: "🥈", perk: "One trade away from the top." };
    if (position === 3)
        return { ...base, title: "3rd Richest Person", emoji: "🥉", perk: "Podium. The champagne is expensed." };
    if (position <= 10)
        return { ...base, title: `${ordinal(position)} Richest Person`, emoji: "💎", perk: "Top 10. The yacht is on order." };
    if (position === 11)
        return { ...base, title: "Almost Made It", emoji: "🫠", perk: "11th. Nobody remembers 11th." };
    return {
        ...base,
        title: `FinanceBro #${position}`,
        emoji: top.emoji,
        perk: `${position - 1} desks from the top. Keep posting.`,
    };
}
