import type { SubjectId } from "@/lib/questions/types";

/**
 * Copy for the static course pages (`/finance`, `/econ-1`, ...) and the city
 * entrance page (`/bwl-muenchen`) - scenario C of the 2026-09-11 SEO
 * decision. These pages exist for search engines and for people who arrive
 * from one; they are linked from the footer's course line only.
 *
 * Rules that keep them out of trouble:
 *   - Every page has its own copy (the notes below differ per subject, the
 *     campus lines are written per place). Five pages with the same text
 *     would be doorway pages - a Google spam policy, not a ranking detail.
 *   - TUM is named descriptively (the course the questions train for) and
 *     the not-affiliated line sits at the top of every page, above the fold.
 *     No "official", no chair or professor names, no TUM logo or blue.
 *   - English, like the rest of the site. The one German thing on a page is
 *     the course's timetable name in quotes ("Investition und Finanzierung")
 *     - that is the phrase students google, and it is a proper name.
 *   - Jokes are fine for search engines as long as the facts are on the page
 *     too (topics, question count, how the trainer works). Keep both.
 */

export type CoursePageCopy = {
    /** The German timetable name, in quotes on the page. */
    timetableName: string;
    /** One sentence on where and how this course is studied - place names in. */
    whereItLives: string;
    /** Three short survival notes in the site's voice. */
    notes: string[];
};

export const COURSE_PAGES: Record<SubjectId, CoursePageCopy> = {
    finance: {
        timetableName: "Investition und Finanzierung",
        whereItLives:
            "Taught on the main campus on Arcisstraße, revised in the Garching library because the main-campus one is full by 9:10, and failed for the first time in the same exam hall by roughly everyone you admire on LinkedIn.",
        notes: [
            "The exam is a calculator and a formula sheet in a trench coat. Nobody asks you what NPV means; they hand you six cash flows and a discount rate and watch.",
            "Duration is not how long you studied. Modified duration is how much the bond price moves when you did not.",
            "WACC questions are the one place in life where debt makes you look better. Enjoy it, it ends at graduation.",
        ],
    },
    econ1: {
        timetableName: "Mikroökonomie",
        whereItLives:
            "The first-semester rite of passage: lectures in the Audimax on Arcisstraße, tutorials wherever there was a free room, and the exam in Garching with a seating plan longer than the syllabus.",
        notes: [
            "Everything is a curve, and the curve always shifts right after you have drawn it. Draw in pencil, price in ink.",
            "Deadweight loss is what happens to your weekend when you leave the surplus questions for Sunday night.",
            "A Pigouvian tax is the one tax the lecture wants you to like. Your first payslip will have opinions about the others.",
        ],
    },
    econ2: {
        timetableName: "Makroökonomie",
        whereItLives:
            "Second semester, same Audimax, larger numbers. The GDP you compute in the exam is bigger than Ottobrunn's, Straubing's and Heilbronn's combined, and it still has to add up.",
        notes: [
            "Real versus nominal is the whole course. If a number went up and nobody is happier, deflate it.",
            "The Solow model has a steady state. Your study plan does not. One of these is examinable.",
            "The fiscal multiplier explains why one round of drinks in the Mensa becomes four. Aggregate demand, empirically confirmed.",
        ],
    },
    financial_accounting: {
        timetableName: "Buchführung und Bilanzierung",
        whereItLives:
            "The course that turns the Arcisstraße lecture hall into a very large ledger. Debits on the left, credits on the right, the exit at the back.",
        notes: [
            "Questions are in the works: balance sheets, journal entries, depreciation, provisions and cash-flow statements in the course's HGB / IFRS setting.",
            "Until then the shelf has Finance and Cost Accounting, which is where most of the numbers on a balance sheet come from anyway.",
            "Every posting balances, eventually. That is the one promise this subject makes and the one the trainer will keep.",
        ],
    },
    cost_accounting: {
        timetableName: "Kostenrechnung",
        whereItLives:
            "The course where the Garching Mensa becomes a case study: material costs, overhead rates and one cost centre called 'the coffee machine' that never gets allocated correctly.",
        notes: [
            "FIFO, LIFO, weighted average: three answers to 'what did that cost', all correct, only one on the exam sheet.",
            "Reciprocal service centres allocate cost to each other in a loop. So does your study group. The exam wants the equation system, not the group chat.",
            "Break-even is the volume at which the exam stops hurting. It is higher than you think and the fixed costs were you.",
        ],
    },
    entrepreneurship: {
        timetableName: "Entrepreneurship",
        whereItLives:
            "Lives between the Arcisstraße lecture hall and the incubator on the Garching campus, where every second pitch deck has a TAM the size of Bavaria.",
        notes: [
            "Questions are in the works: business models, market sizing, funding rounds, cap tables and start-up valuation.",
            "A pre-money valuation is what you believe; a post-money valuation is what you believe plus what they paid to hear it.",
            "The dilution maths is the only part of a funding round nobody posts about on LinkedIn. It is also the part on the exam.",
        ],
    },
    marketing: {
        timetableName: "Marketing",
        whereItLives:
            "Taught in München, practised on Instagram, examined on paper: segmentation, market research statistics and pricing, with a lecture hall on Arcisstraße as the sample population.",
        notes: [
            "Questions are in the works: segmentation, market research statistics, pricing and the marketing mix.",
            "The 4 Ps are product, price, place and promotion. The fifth P, panic, is not in the lecture but does show up in the exam hall.",
            "Price elasticity explains why the matcha near campus can cost nine euros and still sell out. You are the demand curve.",
        ],
    },
};

/** One line per place, used on the city page and (one at a time) on the course pages. */
export const CAMPUS_NOTES: { place: string; note: string }[] = [
    {
        place: "Garching",
        note: "End of the U6, start of the exam. The library opens early, the wind never closes, and the Mensa queue is the only equilibrium anyone reaches before noon.",
    },
    {
        place: "Arcisstraße",
        note: "The main campus in the middle of München: the Audimax, the courtyard, and the ten-minute walk from the U-Bahn during which most of the lecture is forgotten again.",
    },
    {
        place: "Straubing",
        note: "The campus on the Danube. Fewer people, same formulas, better air. The BroDollars count exactly the same there.",
    },
    {
        place: "Heilbronn",
        note: "The management campus: the one place where business administration is the main event and not the thing engineers walk past. The leaderboard does not know the difference.",
    },
    {
        place: "Ottobrunn",
        note: "Rockets and aerospace by day. The cost of capital works the same at launch altitude, and so does the exam tolerance.",
    },
];
