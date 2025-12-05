import { ReactNode, MouseEventHandler } from "react";

type ButtonProps = {
    children: ReactNode;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    className?: string;
    variant?: "primary" | "secondary" | "danger";
    disabled?: boolean;
};

export default function Button({
                                   children,
                                   onClick,
                                   className,
                                   variant = "primary",
                                   disabled,
                               }: ButtonProps) {
    const base = "px-4 py-2 rounded font-medium transition-colors disabled:opacity-50";
    const variants = {
        primary: "bg-blue-500 text-white hover:bg-blue-600",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        danger: "bg-red-500 text-white hover:bg-red-600",
    } as const;

    return (
        <button
            onClick={onClick}
            className={`${base} ${variants[variant]} ${className || ""}`}
            //disabled={disabled} diese werden nicht benötigt
        >
            {children}
        </button>
    );
}
