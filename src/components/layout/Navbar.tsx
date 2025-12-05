"use client";

import NavLink from "@/components/ui/NavLink";

export default function Navbar() {
    return (
        <nav className="w-full bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
                {/* Logo / Brand */}
                <NavLink href="/">FinanceBRO's 💸</NavLink>

                {/* Navigation Links */}
                <div className="flex gap-6">
                    <NavLink href="/products">Only for True Finance Bro's 💸</NavLink>
                    <NavLink href="/multiplayer">Multiplayer 🥋</NavLink>
                    <NavLink href="/language">Language 🎤</NavLink>
                </div>
            </div>
        </nav>
    );
}
