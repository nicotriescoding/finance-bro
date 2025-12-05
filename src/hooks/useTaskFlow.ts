// src/hooks/useTaskFlow.ts
import { useState } from "react";

type TaskFlowOptions = {
    correctAnswer: string;
    onCorrect: () => void;
    onNext: () => void;
};

export function useTaskFlow({ correctAnswer, onCorrect, onNext }: TaskFlowOptions) {
    const [userAnswer, setUserAnswer] = useState("");
    const [feedback, setFeedback] = useState<string | null>(null);
    const [answered, setAnswered] = useState(false);

    const handleCheck = () => {
        if (answered) return;

        if (parseFloat(userAnswer).toFixed(2) === correctAnswer) {
            setFeedback("✅ Correct!");
            onCorrect();
        } else {
            setFeedback("❌ Wrong, right answer is: " + correctAnswer + "€");
        }

        setAnswered(true);
    };

    const handleNext = () => {
        setUserAnswer("");
        setFeedback(null);
        setAnswered(false);
        onNext();
    };

    return {
        userAnswer,
        setUserAnswer,
        feedback,
        answered,
        handleCheck,
        handleNext,
    };
}