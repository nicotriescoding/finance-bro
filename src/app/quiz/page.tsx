import { Suspense } from "react";
import type { Metadata } from "next";
import QuizClient from "@/components/quiz/QuizClient";

export const metadata: Metadata = {
    title: "Quiz",
    description:
        "Practice business-administration exam questions by subject and topic: Finance, Econ 1 & 2, Financial Accounting, Cost Accounting, Entrepreneurship and Marketing.",
};

export default function QuizPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading…</div>}>
            <QuizClient />
        </Suspense>
    );
}
