// src/app/language/page.tsx
"use client";

import AdRail from "@/components/AdRail";

/** Placeholder page - the copy is original finance-bro canon, do not touch.
 *  Rails added 2026-08-29: every page except /, /library and /career carries
 *  the sticky desktop skyscraper rail. */
export default function LanguagePage() {
    return (
        <div className="mx-auto flex max-w-[1440px] gap-[18px] lg:px-[22px]">
            <AdRail />
            <div className="flex min-h-[70vh] min-w-0 flex-1 flex-col items-center justify-center p-6 text-center">
                <div className="flex max-w-xl flex-col items-center gap-4 rounded-[14px] border border-hairline bg-surface px-6 py-10 shadow-[0_1px_2px_rgba(15,33,55,.05)] sm:px-10">
                    <span className="caps-label text-[10px] text-muted-light">
                        Service notice · counter closed
                    </span>
                    <h1 className="text-3xl font-extrabold tracking-[-0.02em]">Language Settings 🎤</h1>
                    <p className="max-w-lg text-lg leading-relaxed text-muted">
                        Soon you will be able to pick your preferred language here 🌍.
                        <br />
                        (English, German, Bro-Slang, or <span className="italic">Consultantish</span>.)
                    </p>
                    <div className="text-sm italic text-muted-light">
                        (Multilingual support is being implemented 🧠)
                    </div>
                </div>
            </div>
            <AdRail />
        </div>
    );
}
