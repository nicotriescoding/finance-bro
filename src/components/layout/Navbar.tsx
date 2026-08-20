"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
    { href: "/quiz?subject=finance", label: "Quiz 🧠", match: "/quiz" },
    { href: "/products", label: "Bro Shop 💸", match: "/products" },
    { href: "/multiplayer", label: "Multiplayer 🥋", match: "/multiplayer" },
    { href: "/language", label: "Language 🎤", match: "/language" },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
                    finance-bro 💸
                </Link>
                <div className="flex gap-1 text-sm">
                    {LINKS.map((link) => {
                        const active = pathname === link.match;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`rounded-lg px-3 py-1.5 font-medium transition ${
                                    active
                                        ? "bg-slate-900 text-white"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
