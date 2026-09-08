/**
 * The month's spending on the landing statement, one list per rung of the
 * ladder (2026-09-08, Nico: custom jokes for every employment level). The
 * array is aligned with `ranks` in `src/lib/rankings.ts` - index 0 is Pupil,
 * the last entry FinanceBro (and every endgame title past it).
 *
 * House rules: € amounts, decorative satire, one joke per line, no em
 * dashes. Running gags climb the ladder with the player - LinkedIn Premium
 * (trial → declined → paid → expensed → bought the company), the matcha, the
 * vest, the gym, and the 0DTE SPY calls that close every statement because
 * they are always a sure thing.
 */

import { ranks } from "@/lib/rankings";

export type Expense = {
    label: string;
    detail: string;
    amount: number;
    status?: "DECLINED" | "UNDER REVIEW";
};

const spy = (amount: number): Expense => ({
    label: "0DTE SPY calls",
    detail: "Last Friday · it was a sure thing",
    amount,
    status: "DECLINED",
});

export const STATEMENTS: Expense[][] = [
    // 1 · Pupil 🎒 - pocket money economics
    [
        { label: "Gummy bears, 200 g", detail: "Today · school kiosk · lunch, apparently", amount: -1.5 },
        { label: "Fortnite V-Bucks", detail: "Today · 'everyone has the skin'", amount: -9.99, status: "DECLINED" },
        { label: "Bus ticket, forgot the student pass", detail: "Yesterday · the inspector was not moved", amount: -3.4 },
        { label: "Pencil case, third this year", detail: "Yesterday · the other two are 'somewhere'", amount: -7.95 },
        { label: "LinkedIn account", detail: "3 days ago · minimum age is 16 · nice try", amount: -0.0, status: "DECLINED" },
        { label: "Tutoring, paid to older sibling", detail: "Last Friday · learned nothing, paid in full", amount: -5 },
        { label: "Swapped lunch for a Capri-Sun", detail: "Last Friday · realised value: none", amount: -2.2 },
        spy(-4.2),
    ],
    // 2 · Unemployed 🛋️ - the couch is the office
    [
        { label: "Instant noodles ×24, bulk", detail: "Today · meal plan Q3", amount: -13.8 },
        { label: "Netflix, with ads", detail: "Today · the password crackdown got Mom too", amount: -4.99 },
        { label: "Job board premium, 'see who viewed you'", detail: "Yesterday · nobody did", amount: -19.99, status: "DECLINED" },
        { label: "LinkedIn Premium, free trial", detail: "Yesterday · Open To Work frame activated", amount: -0.0 },
        { label: "Gym membership, unused", detail: "3 days ago · month 14 of going 'next week'", amount: -9.9 },
        { label: "Supermarket own-brand matcha", detail: "3 days ago · almost tastes real", amount: -6.99 },
        {
            label: "Bottle deposit refund, reversed",
            detail: "Last Friday · the machine rejected the crate",
            amount: -3.75,
            status: "UNDER REVIEW",
        },
        spy(-12.4),
    ],
    // 3 · Volunteer 🧡 - paid in gratitude
    [
        { label: "Train to the volunteering site", detail: "Today · 'we cover travel' · they did not", amount: -14.6 },
        { label: "Lanyard, own purchase", detail: "Today · the badge came without one", amount: -2.99 },
        { label: "Pizza for the whole team, 'my treat'", detail: "Yesterday · nobody else offered", amount: -38.5 },
        { label: "LinkedIn Premium, trial extended", detail: "Yesterday · 'Volunteer Experience' section filled", amount: -0.0 },
        { label: "Oat milk flat white, one, shared", detail: "3 days ago · campus coffee cart", amount: -4.65 },
        { label: "Certificate of appreciation, framing", detail: "3 days ago · frame cost more than the gratitude", amount: -12.9 },
        { label: "Reimbursement claim, form B-7", detail: "Last Friday · pending since April", amount: -0.0, status: "UNDER REVIEW" },
        spy(-18.0),
    ],
    // 4 · Unpaid Intern 🧃 - experience is the compensation
    [
        { label: "Lunch runs for the team, own card", detail: "Today · 'we'll sort it out' · they will not", amount: -47.3 },
        { label: "Business-casual shirt, one, ironed nightly", detail: "Today · the uniform, unpaid edition", amount: -29.99 },
        { label: "Printer credits, campus", detail: "Yesterday · 400 pages of someone else's deck", amount: -8 },
        { label: "LinkedIn Premium", detail: "Yesterday · trial ended, card declined, dignity intact", amount: -39.99, status: "DECLINED" },
        { label: "Juice box, meeting room fridge", detail: "3 days ago · the only perk, and it was counted", amount: -1.2 },
        { label: "Energy drinks ×6", detail: "3 days ago · 'we start at 7'", amount: -7.5 },
        { label: "Rent, parents", detail: "Last Friday · 'just this month' · month 5", amount: -350, status: "UNDER REVIEW" },
        spy(-25.0),
    ],
    // 5 · Low Earner 🥲 - paid monthly, spent weekly
    [
        { label: "Rent, shared flat, the small room", detail: "Today · the window faces a wall", amount: -540 },
        { label: "Groceries, discounter, own brand", detail: "Today · the cart costs more than the dinner", amount: -61.2 },
        { label: "LinkedIn Premium", detail: "Yesterday · accepted this time · 'an investment'", amount: -39.99 },
        { label: "Oat milk flat white ×3", detail: "Yesterday · a weekly luxury, budgeted", amount: -13.95 },
        { label: "Gym membership, unused", detail: "3 days ago · month 15 of 'next week'", amount: -9.9 },
        { label: "Phone contract, 3 GB", detail: "3 days ago · data gone by the 9th", amount: -14.99 },
        { label: "Aperol Spritz, one, 'networking'", detail: "Last Friday · networked with the bartender", amount: -8.4 },
        spy(-60.0),
    ],
    // 6 · Minimum Wage Grunt 🛠️ - every hour documented
    [
        { label: "Steel-toe boots, safety class S3", detail: "Today · 'provided by the employer' · eventually", amount: -49.9 },
        { label: "Time-tracking app, premium", detail: "Today · to prove the overtime nobody pays", amount: -4.99 },
        { label: "Matcha, ceremonial grade", detail: "Yesterday · limited seasonal drop", amount: -9.4 },
        { label: "Used textbook, previous owner cried in it", detail: "Yesterday · campus bookstore", amount: -24.9 },
        { label: "LinkedIn Premium", detail: "3 days ago · headline now says 'Operations'", amount: -39.99 },
        { label: "Blue-light glasses, no prescription", detail: "3 days ago · for the grind aesthetic", amount: -34.99 },
        { label: "Patagonia vest, outlet version", detail: "Last Friday · the uniform, entry level", amount: -49.9 },
        spy(-240.69),
    ],
    // 7 · Working Student 📚 - 12 €/h, printer access
    [
        { label: "Semester ticket", detail: "Today · the only subsidy that shows up", amount: -89 },
        { label: "Noise-cancelling headphones", detail: "Today · the library has a talker", amount: -119 },
        { label: "Oat milk flat white ×4", detail: "Yesterday · campus coffee cart · loyalty card full", amount: -18.6 },
        { label: "LinkedIn Premium", detail: "Yesterday · headline: 'Working Student @ Big Name'", amount: -39.99 },
        { label: "Aperol Spritz ×3, 'networking'", detail: "3 days ago · nobody networked", amount: -25.2 },
        { label: "Exam fee, second attempt", detail: "3 days ago · the quiet fear was justified", amount: -0.0, status: "UNDER REVIEW" },
        { label: "Printer access, abused", detail: "Last Friday · 600 pages of flatmate's thesis", amount: -0.0 },
        spy(-350.0),
    ],
    // 8 · Excel Monkey 🐒 - VLOOKUP is a personality
    [
        { label: "Mechanical keyboard, clicky", detail: "Today · the open-plan office filed a complaint", amount: -139 },
        { label: "Second monitor, vertical", detail: "Today · for the 40,000-row sheet", amount: -219 },
        { label: "Excel course, 'Advanced Pivot Tables'", detail: "Yesterday · already knew it, bought it anyway", amount: -89 },
        { label: "LinkedIn Premium", detail: "Yesterday · skills: Excel, Excel, Excel", amount: -39.99 },
        { label: "Wrist rest, memory foam", detail: "3 days ago · the RSI has a name now", amount: -24.9 },
        { label: "Matcha, ceremonial grade ×2", detail: "3 days ago · one per monitor", amount: -18.8 },
        { label: "Macro that broke the model", detail: "Last Friday · cost centre 'lessons learned'", amount: -0.0, status: "UNDER REVIEW" },
        spy(-480.0),
    ],
    // 9 · Subcontractor 🪪 - invoices monthly, paid quarterly
    [
        { label: "Liability insurance, freelancer", detail: "Today · in case the deck is wrong", amount: -68.4 },
        { label: "Invoicing software, pro", detail: "Today · to chase invoice #0031, again", amount: -19 },
        { label: "Co-working desk, hot", detail: "Yesterday · someone else's crumbs", amount: -249 },
        { label: "LinkedIn Premium Business", detail: "Yesterday · 'Founder' is now on the headline", amount: -59.99 },
        { label: "Tax advisor, first consultation", detail: "3 days ago · 'you should have called in January'", amount: -180 },
        { label: "Patagonia vest, outlet version, second", detail: "3 days ago · the first one is at the client", amount: -49.9 },
        { label: "Invoice #0031, client", detail: "Last Friday · net 90, day 112", amount: -0.0, status: "UNDER REVIEW" },
        spy(-720.0),
    ],
    // 10 · Junior Consultant 🧑‍💼 - slide decks at 02:00
    [
        { label: "Patagonia vest", detail: "Today · the uniform", amount: -149 },
        { label: "Rimowa carry-on, polished nightly", detail: "Today · consultant starter pack", amount: -680 },
        { label: "Hotel minibar, all of it", detail: "Yesterday · 'client engagement expense'", amount: -64.2, status: "UNDER REVIEW" },
        { label: "LinkedIn Premium", detail: "Yesterday · expensed · the partner does it too", amount: -39.99 },
        { label: "14 productivity apps, one used", detail: "3 days ago · the stack", amount: -87.32 },
        { label: "Taxi home, 02:40", detail: "3 days ago · the deck is 'directionally there'", amount: -31.5 },
        { label: "Rolex Submariner, financing", detail: "Last Friday · month 1 of 96", amount: -312.5, status: "DECLINED" },
        spy(-2406.9),
    ],
    // 11 · Consultant 💼 - same decks, higher day rate
    [
        { label: "Rolex Submariner, financing", detail: "Today · month 1 of 96 · approved this time", amount: -312.5 },
        { label: "Bottle service, table by the DJ", detail: "Today · P1 Munich", amount: -840, status: "DECLINED" },
        { label: "Business-class upgrade, own card", detail: "Yesterday · the policy said economy · the ego said no", amount: -420 },
        { label: "LinkedIn Premium Business", detail: "Yesterday · expensed under 'market research'", amount: -59.99 },
        { label: "Protein powder, 5 kg, 'bulking'", detail: "3 days ago · the shaker lives at the client", amount: -90, status: "UNDER REVIEW" },
        { label: "Frameworks, 2×2, laminated", detail: "3 days ago · every problem has four quadrants", amount: -12.9 },
        { label: "Matcha latte ×9, airport", detail: "Last Friday · 'per diem'", amount: -67.5 },
        spy(-4800.0),
    ],
    // 12 · LinkedIn Thought Leader 🎙️ - Agree? Repost. 👇
    [
        { label: "Ring light, 18 inch", detail: "Today · for the 'authentic' selfie video", amount: -79 },
        { label: "Ghostwriter, 12 posts", detail: "Today · 'I woke up at 4am and realised…'", amount: -1200 },
        { label: "LinkedIn Premium Business + Sales Navigator", detail: "Yesterday · 'my personal brand is an asset class'", amount: -99.99 },
        { label: "Podcast microphone, never plugged in", detail: "Yesterday · episode 1 is 'in post'", amount: -249 },
        { label: "Headshot, natural light, 'candid'", detail: "3 days ago · four hours of candid", amount: -350 },
        { label: "Engagement pod, monthly", detail: "3 days ago · 47 likes, 46 from the pod", amount: -49, status: "UNDER REVIEW" },
        { label: "Carousel template pack", detail: "Last Friday · 'Here's what nobody tells you'", amount: -29 },
        spy(-7400.0),
    ],
    // 13 · Investmentbanker 🏦 - the desk has a cot now
    [
        { label: "Rolex Submariner, paid in full", detail: "Today · the financing was beneath me", amount: -9150 },
        { label: "Personal trainer, 05:30 slot", detail: "Today · before the desk, after the cot", amount: -220 },
        { label: "Omakase, 'business development'", detail: "Yesterday · no business was developed", amount: -780, status: "UNDER REVIEW" },
        { label: "Maximilianstraße apartment, rent", detail: "Yesterday · 41 m² of location", amount: -4850 },
        { label: "LinkedIn Premium", detail: "3 days ago · logged in once, in 2023", amount: -39.99 },
        { label: "Champagne tower, table by the DJ", detail: "3 days ago · P1 Munich, both floors", amount: -3200 },
        { label: "Cot, ergonomic, under the desk", detail: "Last Friday · HR called it 'a wellness initiative'", amount: -640 },
        spy(-48000.0),
    ],
    // 14 · Crypto Bro 🪙 - net worth depends on the hour
    [
        { label: "Hardware wallet ×3", detail: "Today · seed phrase on a Post-it, obviously", amount: -447 },
        { label: "Lambo, deposit", detail: "Today · 'when it hits 100k'", amount: -25000, status: "DECLINED" },
        { label: "Meme coin, 'community'", detail: "Yesterday · the dev left the group chat", amount: -12000 },
        { label: "LinkedIn Premium", detail: "Yesterday · headline: 'Web3 · DeFi · Vibes'", amount: -39.99 },
        { label: "Dubai, one-way, 'tax reasons'", detail: "3 days ago · the airline still wants euros", amount: -3400 },
        { label: "Gas fees", detail: "3 days ago · the transaction failed anyway", amount: -890 },
        { label: "Electricity, mining rig, spare room", detail: "Last Friday · the flatmate moved out warm", amount: -1670, status: "UNDER REVIEW" },
        spy(-133700.0),
    ],
    // 15 · VC Guy 🚀 - loses other people's money, confidently
    [
        { label: "Angel check, vibes-based due diligence", detail: "Today · 'the founder has great energy'", amount: -25000, status: "UNDER REVIEW" },
        { label: "Allbirds, fourth pair", detail: "Today · the uniform, Sand Hill Road edition", amount: -135 },
        { label: "Patagonia vest, embroidered with the fund logo", detail: "Yesterday · limited partner edition", amount: -189 },
        { label: "LinkedIn Premium Business", detail: "Yesterday · headline: 'Investing in the future of X'", amount: -59.99 },
        { label: "Demo day, sponsor table", detail: "3 days ago · 34 pitches, zero notes taken", amount: -8500 },
        { label: "Retreat, Lake Tahoe, 'thesis offsite'", detail: "3 days ago · the thesis is 'AI, but for'", amount: -14800 },
        { label: "Portfolio company, bridge round", detail: "Last Friday · the bridge leads to another bridge", amount: -150000, status: "UNDER REVIEW" },
        spy(-148000.0),
    ],
    // 16 · Managing Director 📈 - reads one number per meeting
    [
        { label: "G-Wagon lease ×2", detail: "Today · one for each mood", amount: -4380 },
        { label: "Leadership retreat, desert, barefoot", detail: "Today · found purpose, lost the Q3 numbers", amount: -27900 },
        { label: "Executive coach, 'presence'", detail: "Yesterday · a pause before saying nothing", amount: -3500 },
        { label: "LinkedIn Premium", detail: "Yesterday · the assistant posts · the assistant likes", amount: -39.99 },
        { label: "Boarding school fees, twins", detail: "3 days ago · the twins email quarterly", amount: -18400 },
        { label: "Contemporary art, uninspected", detail: "3 days ago · 'for the office' · never shipped", amount: -95000, status: "UNDER REVIEW" },
        { label: "Divorce lawyer, retainer", detail: "Last Friday · she found the second G-Wagon", amount: -50000 },
        spy(-333330.0),
    ],
    // 17 · Hedge Fund Guy 🦈 - 2 and 20, mostly the 2
    [
        { label: "Bloomberg terminal, second, for the bathroom", detail: "Today · the market does not wait", amount: -2400 },
        { label: "Yacht, fractional, back half", detail: "Today · 1/8th of the part that doesn't steer", amount: -62500 },
        { label: "Short squeeze, covered", detail: "Yesterday · Reddit was 'irrational'", amount: -1850000, status: "UNDER REVIEW" },
        { label: "LinkedIn Premium", detail: "Yesterday · 'my views are not investment advice'", amount: -39.99 },
        { label: "Greenwich mansion, gardener, annual", detail: "3 days ago · the hedges are the only hedge that worked", amount: -84000 },
        { label: "Congressional testimony, prep", detail: "3 days ago · 'I don't recall' ×40", amount: -220000 },
        { label: "Fine wine, 'alternative asset'", detail: "Last Friday · drank the alternative", amount: -31000 },
        spy(-850000.0),
    ],
    // 18 · Unicorn Founder 🦄 - profitable at some point, allegedly
    [
        { label: "Founder hoodie, 400 units, 'culture'", detail: "Today · nobody wears it twice", amount: -18000 },
        { label: "Office, 'campus', three floors empty", detail: "Today · growth is 'planned'", amount: -480000 },
        { label: "Free lunch, 900 employees", detail: "Yesterday · the burn rate has a kitchen", amount: -71000 },
        { label: "LinkedIn Premium", detail: "Yesterday · the comms team runs it · 'humbled to announce'", amount: -39.99 },
        { label: "Series D, legal fees", detail: "3 days ago · the term sheet has a term sheet", amount: -1900000 },
        { label: "Pivot to AI, rebrand", detail: "3 days ago · same product, new landing page", amount: -320000 },
        { label: "Profitability, Q4", detail: "Last Friday · 'next year' · every year", amount: -0.0, status: "UNDER REVIEW" },
        spy(-4200000.0),
    ],
    // 19 · Family Office Heir 🎾 - chose the right parents
    [
        { label: "Tennis coach, ex-pro, Tuesdays", detail: "Today · the backhand is 'in transition'", amount: -1800 },
        { label: "Art-history degree, seventh year", detail: "Today · Florence, 'research'", amount: -34000 },
        { label: "Polo pony, second", detail: "Yesterday · the first one is 'tired'", amount: -180000 },
        { label: "LinkedIn Premium", detail: "Yesterday · headline: 'Principal, Family Office' · never been", amount: -39.99 },
        { label: "Trust distribution, quarterly", detail: "3 days ago · calls it 'my salary'", amount: -0.0 },
        { label: "Charity gala, table of ten", detail: "3 days ago · the cause was mentioned once", amount: -125000 },
        { label: "Startup, 'my own thing'", detail: "Last Friday · Dad's money, Dad's lawyer, Dad's idea", amount: -2500000, status: "UNDER REVIEW" },
        spy(-25000000.0),
    ],
    // 20 · Jeff Bezzo's 🚀🛸 - owns the warehouse and the weekend
    [
        { label: "Rocket fuel, top-up", detail: "Today · Tuesday joyride", amount: -2400000 },
        { label: "Cowboy hat, for the launch", detail: "Today · 11 minutes in space, one hat", amount: -890 },
        { label: "Newspaper, whole", detail: "Yesterday · 'democracy dies in darkness' · bought the lights", amount: -250000000 },
        { label: "LinkedIn Premium", detail: "Yesterday · still on the trial · never asked to pay", amount: -0.0 },
        { label: "Superyacht, mast too tall for the bridge", detail: "3 days ago · the harbour said no", amount: -500000000 },
        { label: "Same-day delivery, own driveway", detail: "3 days ago · the van got lost on the estate", amount: -12.99 },
        { label: "The weekend, acquired", detail: "Last Friday · owns the warehouse · now Saturday too", amount: -38000000000, status: "UNDER REVIEW" },
        spy(-2147483647.0),
    ],
    // 21 · FinanceBro 💸💪 (and every endgame title) - the statement of a small nation
    [
        { label: "Doomsday bunker, New Zealand", detail: "Today · 'a hedge, basically'", amount: -12500000 },
        { label: "Mona Lisa, replica, told everyone it's real", detail: "Today · the Louvre wouldn't pick up", amount: -450000 },
        { label: "Senate hearing prep, consultants", detail: "Yesterday · 'I'll just be myself' · overruled", amount: -1200000 },
        { label: "LinkedIn, the company", detail: "Yesterday · Premium is free now · for one user", amount: -26000000000 },
        { label: "Small coastal island, impulse", detail: "3 days ago · it was next to the other one", amount: -380000000 },
        { label: "Social media platform, impulse", detail: "3 days ago · renamed it by Monday", amount: -44000000000, status: "UNDER REVIEW" },
        { label: "Patagonia, the company", detail: "Last Friday · the vest is finally free", amount: -3000000000 },
        spy(-2147483647.0),
    ],
];

if (STATEMENTS.length !== ranks.length) {
    throw new Error(
        `statements.ts: ${STATEMENTS.length} statements for ${ranks.length} ranks - one list per rung, aligned with rankings.ts`
    );
}

/** The statement for a ladder position (0 = Pupil); endgame titles share FinanceBro's. */
export function statementFor(ladderIndex: number): Expense[] {
    return STATEMENTS[Math.min(STATEMENTS.length - 1, Math.max(0, ladderIndex))];
}
