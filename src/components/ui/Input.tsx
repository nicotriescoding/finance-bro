import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: InputProps) {
    return (
        <input
            {...props}
            className={`w-full px-4 py-2 rounded-lg border border-black text-black 
                  focus:ring-2 focus:ring-blue-500 focus:outline-none ${className}`}
        />
    );
}