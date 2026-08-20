/**
 * Sanity check for the whole question bank.
 * Run: npm run verify
 *
 * Builds every question against many seeds and fails on NaN / Infinity,
 * unfilled placeholders, unknown topics, or broken choice definitions.
 */
import { ALL_QUESTIONS } from "../src/content/questions";
import { buildInstance } from "../src/lib/questions/engine";
import { SUBJECT_MAP } from "../src/content/subjects";

const SEEDS = 200;
const errors: string[] = [];
const warnings: string[] = [];
const seenIds = new Set<string>();

for (const q of ALL_QUESTIONS) {
    if (seenIds.has(q.id)) errors.push(`${q.id}: duplicate question id`);
    seenIds.add(q.id);

    const subject = SUBJECT_MAP[q.subject];
    if (!subject) {
        errors.push(`${q.id}: unknown subject "${q.subject}"`);
        continue;
    }
    if (!subject.topics.some((t) => t.id === q.topic)) {
        errors.push(`${q.id}: topic "${q.topic}" is not defined for subject ${q.subject}`);
    }

    if (q.kind === "choice") {
        const idx = Array.isArray(q.correct) ? q.correct : [q.correct];
        if (idx.some((i) => i < 0 || i >= q.choices.length)) {
            errors.push(`${q.id}: correct index out of range`);
        }
        if (new Set(q.choices).size !== q.choices.length) {
            errors.push(`${q.id}: duplicate answer options`);
        }
        if (q.choices.length < 2) errors.push(`${q.id}: needs at least 2 options`);
        const inst = buildInstance(q, 1);
        if ((inst.correctIndices?.length ?? 0) !== idx.length) {
            errors.push(`${q.id}: shuffling lost a correct option`);
        }
        continue;
    }

    for (let seed = 1; seed <= SEEDS; seed++) {
        let inst;
        try {
            inst = buildInstance(q, seed * 7919);
        } catch (e) {
            errors.push(`${q.id} (seed ${seed}): threw ${(e as Error).message}`);
            break;
        }
        const a = inst.answer;
        if (a === undefined || !Number.isFinite(a)) {
            errors.push(`${q.id} (seed ${seed}): answer is ${a}`);
            break;
        }
        if (Math.abs(a) > 1e12) {
            warnings.push(`${q.id} (seed ${seed}): implausibly large answer ${a}`);
        }
        if (/\{[A-Za-z_]\w*\}/.test(inst.prompt)) {
            errors.push(`${q.id} (seed ${seed}): unfilled placeholder in prompt`);
            break;
        }
        if (/(NaN|Infinity|undefined)/.test(inst.prompt + (inst.explanation ?? ""))) {
            errors.push(`${q.id} (seed ${seed}): NaN/Infinity/undefined leaked into text`);
            break;
        }
    }
}

const bySubject = ALL_QUESTIONS.reduce<Record<string, number>>((acc, q) => {
    acc[q.subject] = (acc[q.subject] ?? 0) + 1;
    return acc;
}, {});

console.log(`Questions: ${ALL_QUESTIONS.length}`);
for (const [s, c] of Object.entries(bySubject)) console.log(`  ${s.padEnd(22)} ${c}`);
console.log(`Seeds per numeric question: ${SEEDS}`);

if (warnings.length) {
    console.log(`\n${warnings.length} warning(s):`);
    warnings.slice(0, 15).forEach((w) => console.log("  ! " + w));
}
if (errors.length) {
    console.error(`\n${errors.length} ERROR(S):`);
    errors.slice(0, 40).forEach((e) => console.error("  x " + e));
    process.exit(1);
}
console.log("\nAll questions build cleanly.");
