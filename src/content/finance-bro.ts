/**
 * Copy for `/what-is-a-finance-bro` (2026-09-14). The glossary and the FAQ
 * live here because the FAQ is rendered twice: as text on the page and as
 * `FAQPage` structured data (same strings, so the rich result can never say
 * something the page does not). Plain text only - no markup, no em dashes.
 */

export const FINANCE_BRO_PATH = "/what-is-a-finance-bro";

export const FINANCE_BRO_GLOSSARY: { term: string; meaning: string }[] = [
    { term: "Let's circle back", meaning: "No." },
    { term: "Let's take this offline", meaning: "No, and stop talking about it in front of people." },
    { term: "Bandwidth", meaning: "Time. He has none, because he spent it saying bandwidth." },
    { term: "Low-hanging fruit", meaning: "The part of the project someone else already did." },
    { term: "Deck", meaning: "Forty slides, of which two are read." },
    { term: "The model", meaning: "An Excel file. It is always broken and it is never his fault." },
    { term: "Optionality", meaning: "Not deciding, but with a Latin root." },
    { term: "Grind", meaning: "Sitting in the library with a phone. Also posting about it." },
    { term: "Ping me", meaning: "Send me a message I will answer in three business days." },
    { term: "EOD", meaning: "End of day, which for him means 02:00 and for you means now." },
    { term: "Humbled", meaning: "Proud. See any LinkedIn post beginning with this word." },
    { term: "Drawdown", meaning: "A failed exam, once he has learned the word." },
];

export const FINANCE_BRO_FAQ: { q: string; a: string }[] = [
    {
        q: "What is a finance bro?",
        a: "A finance bro is a young man in, near, or aspiring to finance whose identity is built from a quarter-zip or fleece vest, gym and protein, LinkedIn, Excel shortcuts and corporate phrases such as 'let's circle back'. The term is affectionate mockery: he is usually a business student or junior analyst, not a millionaire.",
    },
    {
        q: "Do you have to work in finance to be a finance bro?",
        a: "No. Most finance bros are students. A single internship, a brokerage app and a strong opinion about compound interest are enough. Actual finance professionals are often quieter, because they are busy.",
    },
    {
        q: "What does a finance bro wear?",
        a: "A navy quarter-zip or fleece vest over a shirt, chinos or suit trousers, loafers, a watch that is larger than necessary, and a haircut with short sides. In summer the vest is replaced by nothing, because the vest was never about temperature.",
    },
    {
        q: "Who is BWL Marie?",
        a: "BWL Marie is the business-student counterpart to the finance bro: organized, pastel, iPad notes, matcha, a Kanken backpack and the exam dates in her calendar since week one. In group projects she is the reason the project got submitted.",
    },
    {
        q: "Who is Jura Justus?",
        a: "Jura Justus is the law-student neighbor of the finance bro: statute books, pale-blue shirts, a family opinion on wine, and the sentence 'that is, with respect, not quite right'. He and the finance bro are allies in loafers and rivals in everything else.",
    },
    {
        q: "Is 'finance bro' an insult?",
        a: "It is a joke that some people wear as a badge. It pokes at the performance (the posts, the vest, the phrases), not at working in finance. If someone calls you one and you feel humbled, you may already be one.",
    },
    {
        q: "How do I become a finance bro?",
        a: "The look is easy: vest, loafers, a LinkedIn banner. The part that survives an interview is the arithmetic - NPV, WACC, bond duration, break-even, elasticities. FinanceBro is a free exam trainer for exactly that: business-administration calculation questions with fresh numbers every run, no account needed.",
    },
];
