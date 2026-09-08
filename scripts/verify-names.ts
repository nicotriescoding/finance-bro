/**
 * Pins the display-name decency filter (`sanitizeName` /
 * `isBlockedName` in src/lib/multiplayer/protocol.ts, shared with the
 * worker). Part of `npm run verify`. Two tables: names that MUST be
 * replaced with the placeholder, and names that MUST survive - a false
 * positive costs a student their name silently, so every word ever removed
 * from the list for that reason has its counterexample here.
 */
import { isBlockedName, sanitizeName } from "../src/lib/multiplayer/protocol";

const MUST_BLOCK = [
    "Hitler",
    "H1tl3r",
    "h.i.t.l.e.r",
    "Hïtler",
    "S13G H31L",
    "NeoNazi_99",
    "hurens0hn",
    "Hurensohn",
    "F@ggot",
    "n1gg4",
    "Judensau",
];

const MUST_PASS = [
    "Excel Intern #4127",
    "Cash Flow Casanova",
    "Marie",
    "Maximilian",
    "Nazim",
    "Isis Müller",
    "Enrique",
    "MongoDB fan",
    "Torpedo",
    "Slutsky",
    "Fagott",
    "Therapist",
    "Financial Therapist",
    "Cuntz",
    "Scunthorpe FC",
    "Retardant",
    "Chinkara",
    "Kanaka",
    "Bezos Jr",
];

const failures: string[] = [];
for (const n of MUST_BLOCK) {
    if (!isBlockedName(n) || sanitizeName(n) !== "Intern") failures.push(`should block: ${n}`);
}
for (const n of MUST_PASS) {
    if (isBlockedName(n) || sanitizeName(n) !== n.replace(/\s+/g, " ").trim().slice(0, 20)) {
        failures.push(`should pass: ${n}`);
    }
}
if (failures.length) {
    console.error(`Name filter: ${failures.length} failure(s)\n  ${failures.join("\n  ")}`);
    process.exit(1);
}
console.log(`Name filter: ${MUST_BLOCK.length} blocked, ${MUST_PASS.length} allowed - OK`);
