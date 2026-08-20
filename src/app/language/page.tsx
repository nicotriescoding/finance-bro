// src/app/language/page.tsx
"use client";

export default function LanguagePage() {
    return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Language Settings 🎤
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">
                Soon you will be able to pick your preferred language here 🌍.
                <br />
                (English, German, Bro-Slang, or <span className="italic">Consultantish</span>.)
            </p>
            <div className="mt-6 text-gray-400 italic">
                (Multilingual support is being implemented 🧠)
            </div>
        </div>
    );
}
