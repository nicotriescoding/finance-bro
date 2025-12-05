// src/app/language/page.tsx
"use client";

export default function LanguagePage() {
    return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Language Settings 🎤
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">
                Bald kannst du hier deine bevorzugte Sprache auswählen 🌍.
                <br />
                (Englisch, Deutsch, Bro-Slang, oder <span className="italic">Consultantish</span>.)
            </p>
            <div className="mt-6 text-gray-400 italic">
                (Multilingual Support wird gerade implementiert 🧠)
            </div>
        </div>
    );
}

