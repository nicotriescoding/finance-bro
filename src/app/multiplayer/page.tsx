// src/app/multiplayer/page.tsx
"use client";

export default function MultiplayerPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Multiplayer 🥋
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">
                You are currently <span className="font-bold text-red-500">unemployed</span> 🫠.
                <br />
                Raise your <span className="font-semibold text-blue-600">Corporate Rank</span> first,
                before a <span className="text-yellow-600">Manager</span> dominates you.
            </p>
            <div className="mt-6 text-gray-400 italic">
                (Feature in development — soon you can go head to head with other FinanceBros 💪)
            </div>
        </div>
    );
}
