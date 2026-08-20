import type { Question, SubjectId } from "@/lib/questions/types";
import { financeQuestions } from "./finance";
import { econ1Questions } from "./econ1";
import { econ2Questions } from "./econ2";
import { financialAccountingQuestions } from "./financial_accounting";
import { costAccountingQuestions } from "./cost_accounting";
import { entrepreneurshipQuestions } from "./entrepreneurship";
import { marketingQuestions } from "./marketing";

/**
 * The whole question bank, bundled with the app.
 * No network call, no database - the quiz cannot break because something
 * upstream is paused or slow.
 *
 * Adding questions from a past exam: append objects to the matching subject
 * file. `topic` must be one of the topic ids in content/subjects.ts.
 */
export const ALL_QUESTIONS: Question[] = [
    ...financeQuestions,
    ...econ1Questions,
    ...econ2Questions,
    ...financialAccountingQuestions,
    ...costAccountingQuestions,
    ...entrepreneurshipQuestions,
    ...marketingQuestions,
];

export function questionsForSubject(subject: SubjectId): Question[] {
    return ALL_QUESTIONS.filter((q) => q.subject === subject);
}

export function questionsFor(subject: SubjectId, topicIds: string[]): Question[] {
    if (topicIds.length === 0) return [];
    const wanted = new Set(topicIds);
    return ALL_QUESTIONS.filter((q) => q.subject === subject && wanted.has(q.topic));
}

/** How many questions exist per topic - used to grey out empty topics in the UI. */
export function countsByTopic(subject: SubjectId): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const q of ALL_QUESTIONS) {
        if (q.subject !== subject) continue;
        counts[q.topic] = (counts[q.topic] ?? 0) + 1;
    }
    return counts;
}

export function countForSubject(subject: SubjectId): number {
    return questionsForSubject(subject).length;
}
