"use client";
import Button from "@/components/ui/Button";

type StartScreenProps = {
    onStart: (difficulty: string) => void;
};

export default function StartScreen({ onStart }: StartScreenProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-6">
            <h1 className="text-2xl font-bold">🚀 Ready to start?</h1>
            <p className="text-gray-600">Choose your difficulty and start the challenge!</p>

            <div className="flex gap-4">
                <Button onClick={() => onStart("easy")} variant="primary">
                    Easy
                </Button>
                <Button onClick={() => onStart("medium")} variant="secondary">
                    Medium
                </Button>
                <Button onClick={() => onStart("hard")} variant="danger">
                    Hard
                </Button>
            </div>
        </div>
    );
}
