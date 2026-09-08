/**
 * Build-time loader (Turbopack, see next.config.ts): removes the `source`
 * field from every question before the bank enters a bundle.
 *
 * `source` names the TUM exam a question was modelled on ("TUM Economics I
 * Exercise Exam WT22/23, Q3"). It is internal provenance - never rendered,
 * read only by `npm run verify` and the reviewers - yet the quiz client
 * imports the banks, so until 2026-09-08 all of it shipped in the JS bundle.
 * The redesign policy is the legal line (§ 2 UrhG protects expression, not
 * the task type); this keeps the provenance map off the wire regardless.
 *
 * Runs on the raw TypeScript text. A `source` line is always its own line
 * in the banks (`.claude/rules/questions.md` and prettier keep it that way):
 *     source: "TUM ...",
 * Anything else is left untouched; `npm run smoke` asserts no exam label
 * survives in the built chunks, so a formatting drift fails the gate rather
 * than leaking.
 */
const SOURCE_LINE = /^[ \t]*source:\s*(["'`])(?:(?!\1).)*\1\s*,?[ \t]*\r?\n/gm;

export default function stripQuestionSource(code) {
    return code.replace(SOURCE_LINE, "");
}
