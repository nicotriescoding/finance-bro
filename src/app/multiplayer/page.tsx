// src/app/multiplayer/page.tsx
"use client";

/** Placeholder page - the copy is original finance-bro canon, do not touch. */
export default function MultiplayerPage() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
            <div className="flex max-w-xl flex-col items-center gap-4 rounded-[14px] border border-hairline bg-surface px-6 py-10 shadow-[0_1px_2px_rgba(15,33,55,.05)] sm:px-10">
                <span className="caps-label text-[10px] text-muted-light">
                    Service notice · desk not staffed
                </span>
                <h1 className="text-3xl font-extrabold tracking-[-0.02em]">Multiplayer 🥋</h1>
                <p className="max-w-lg text-lg leading-relaxed text-muted">
                    You are currently <span className="font-extrabold text-warn">unemployed</span> 🫠.
                    <br />
                    Raise your <span className="font-bold text-ink">Corporate Rank</span> first,
                    before a <span className="font-bold text-warn-bright">Manager</span> dominates you.
                </p>
                <div className="text-sm italic text-muted-light">
                    (Feature in development - soon you can go head to head with other FinanceBros 💪)
                </div>
            </div>
        </div>
    );
}
