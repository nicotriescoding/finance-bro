// src/app/multiplayer/page.tsx
"use client";

export default function MultiplayerPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Multiplayer 🥋
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">
                Du bist aktuell <span className="font-bold text-red-500">arbeitslos</span> 🫠.
                <br />
                Erhöhe erst deinen <span className="font-semibold text-blue-600">Corporate Rank</span>,
                bevor du von einem <span className="text-yellow-600">Manager</span> dominiert wirst.
            </p>
            <div className="mt-6 text-gray-400 italic">
                (Feature in Entwicklung — bald kannst du gegen andere FinanceBro’s antreten 💪)
            </div>
        </div>
    );
}