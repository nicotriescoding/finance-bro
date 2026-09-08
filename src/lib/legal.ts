/**
 * Shared legal constants (2026-09-08 DSA work). The contact address is the
 * Impressum one (temporary, see BACKLOG); the report mailto carries the
 * Art. 16 (2) DSA elements as a prefilled body so a notice arrives complete.
 */
export const CONTACT_EMAIL = "nicolas.dumpe@gmx.de";

const REPORT_SUBJECT = "Report a name on finance-bro.de";
const REPORT_BODY = [
    "Where I saw it (page / leaderboard / duel room):",
    "The display name:",
    "Why it is illegal or breaks the name rules:",
    "My name and e-mail address:",
    "I confirm in good faith that this report is accurate and complete.",
].join("\n");

export const REPORT_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    REPORT_SUBJECT,
)}&body=${encodeURIComponent(REPORT_BODY)}`;
