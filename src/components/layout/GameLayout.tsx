import Navbar from "@/components/layout/Navbar";
import { ReactNode } from "react";

type GameLayoutProps = {
    ads: ReactNode;
    task: ReactNode;
    scoreboard: ReactNode;
};

export default function GameLayout({ ads, task, scoreboard }: GameLayoutProps) {
    return (
        <div>

            {/* Alter Grid-Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 max-w-7xl mx-auto">
                <div className="hidden md:flex flex-col gap-4">{ads}</div>
                <div className="flex flex-col">{task}</div>
                <div className="w-full">{scoreboard}</div>
            </div>
        </div>
    );
}