// src/components/GameContainer.tsx


"use client";

import { useState } from "react";
import { useGame } from "@/hooks/useGame";
import { useScore } from "@/hooks/useScore";
import { useStopwatch } from "@/hooks/useStopwatch";
import { useTaskFlow } from "@/hooks/useTaskFlow";
import { difficultyTimes } from "@/lib/scoring";

import TaskCard from "@/components/TaskCard";
import Button from "@/components/ui/Button";
import Scoreboard from "@/components/Scoreboard/Scoreboard";

export default function GameContainer() {
    const {
        tasks,
        currentTaskIndex,
        setCurrentTaskIndex,
        variables,
        currentTask,
        correctAnswer,
    } = useGame();

    const { score, addScore } = useScore();
    const { elapsedMs, start, stop, resetAndStart, reset } = useStopwatch();
    const [started, setStarted] = useState(false);

    const flow = useTaskFlow({
        correctAnswer: correctAnswer ?? "",
        onCorrect: () => {
            const timeSpent = Math.round(elapsedMs / 1000);
            const diff = (currentTask?.difficulty as keyof typeof difficultyTimes) ?? "easy";
            const target = difficultyTimes[diff] ?? 120;
            addScore(diff, timeSpent, target);
        },
        onNext: () =>
            setCurrentTaskIndex((prev) => (prev + 1 < tasks.length ? prev + 1 : 0)),
    });

    if (!currentTask || !variables || !correctAnswer) {
        return <p className="p-4">Loading...</p>;
    }

    // --- Wrapper für Stopwatch-Handling ---
    const handleCheckWrapped = () => {
        stop(); // Stoppuhr stoppen
        flow.handleCheck();
    };

    const handleNextWrapped = () => {
        resetAndStart(); // neue Aufgabe → Stopwatch reset + start
        flow.handleNext();
    };

    return (
        <>
            {!started ? (
                <div className="flex flex-col items-center justify-center h-full gap-6">
                    <h1 className="text-2xl font-bold">🚀 Ready for the Tasks?</h1>
                    <Button
                        onClick={() => {
                            setStarted(true);
                            reset();
                            start();
                        }}
                        variant="primary"
                    >
                        Start
                    </Button>
                </div>
            ) : (
                <>
                    <TaskCard
                        task={currentTask}
                        variables={variables}
                        userAnswer={flow.userAnswer}
                        setUserAnswer={flow.setUserAnswer}
                        feedback={flow.feedback}
                        answered={flow.answered}
                        handleCheck={handleCheckWrapped}
                        handleNext={handleNextWrapped}
                    />
                </>
            )}

            {/* Scoreboard immer sichtbar */}
            <Scoreboard score={score} />
        </>
    );
}
