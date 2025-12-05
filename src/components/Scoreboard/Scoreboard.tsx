// src/components/Scoreboard/Scoreboard.tsx
"use client";
import ProgressBar from "@/components/ui/ProgressBar";
import {useLevel} from "@/hooks/useLevel";
import {usePrevious} from "@/hooks/usePrevious";
import RankBadge from "./RankBadge";
import LevelUpAnimation from "./LevelUpAnimation";

type ScoreboardProps = {
    score: number;
};

export default function Scoreboard({score}: ScoreboardProps) {
    const {level, progress, nextRequired} = useLevel(score);
    const prevLevel = usePrevious(level);

    // Detect Level-Up
    const leveledUp = prevLevel !== undefined && level > prevLevel;

    return (
        <div
            className={`relative text-white p-5 rounded-2xl shadow-lg mb-6 overflow-hidden transition-colors duration-700 ${
                leveledUp
                    ? "bg-gradient-to-r from-green-400 to-green-600"
                    : "bg-gradient-to-r from-purple-500 to-pink-500"
            }`}
        >
            {/* 💸 LevelUp Animation */}
            <LevelUpAnimation trigger={leveledUp}/>

            {/* Header: Score + Level */}
            <div className="flex justify-between items-center mb-2">
        <span className="px-4 py-2 bg-yellow-300 text-black rounded-full shadow-md font-bold text-lg">
          💸 {score} BroDollar
        </span>
                <div className="flex flex-col items-end">
                    <span className="text-lg font-semibold">Level {level}</span>
                    <RankBadge level={level}/>
                </div>
            </div>

            {/* Progressbar */}
            <p className="text-xs text-left mt-1">
                {Math.floor(progress * nextRequired)} / {nextRequired} BroDollar 💸
            </p>
            <ProgressBar progress={progress}/>
        </div>
    );
}