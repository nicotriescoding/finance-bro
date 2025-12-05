import { ReactNode } from "react";

type CardProps = {
    children: ReactNode;
    className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
    return (
        <div className={`bg-white shadow-lg rounded-2xl p-6 border border-gray-200 ${className}`}>
            {children}
        </div>
    );
}