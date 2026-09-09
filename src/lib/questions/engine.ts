import { createRng, randomSeed } from "./rng";
import type { Question, QuestionInstance } from "./types";

/**
 * Resolve a question template against a seed.
 * For numeric questions the prompt and the answer come out of the SAME draw,
 * which is what guarantees the student is graded on the numbers they can see.
 */
export function buildInstance(question: Question, seed = randomSeed()): QuestionInstance {
    const key = `${question.id}#${seed}`;

    if (question.kind === "numeric") {
        const rng = createRng(seed);
        const built = question.build(rng);
        return {
            key,
            question,
            prompt: built.prompt,
            given: built.given,
            explanation: built.explanation ?? question.explanation,
            answer: built.answer,
            unit: question.unit,
            hint: built.hint,
        };
    }

    // choice: shuffle the options so the answer is never always "A"
    const rng = createRng(seed);
    const correctSet = new Set(
        Array.isArray(question.correct) ? question.correct : [question.correct]
    );
    const indexed = question.choices.map((text, i) => ({ text, correct: correctSet.has(i) }));
    const shuffled = rng.shuffle(indexed);

    return {
        key,
        question,
        prompt: question.prompt,
        explanation: question.explanation,
        choices: shuffled.map((c) => c.text),
        correctIndices: shuffled.reduce<number[]>((acc, c, i) => (c.correct ? [...acc, i] : acc), []),
    };
}
