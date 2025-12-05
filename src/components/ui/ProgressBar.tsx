import { FC } from "react";

type ProgressBarProps = {
    progress: number; // 0..1
    className?: string;
    color?: string; // Tailwind-Farbe z. B. "bg-green-400"
};

const ProgressBar: FC<ProgressBarProps> = ({
                                               progress,
                                               className = "",
                                               color = "bg-green-400",
                                           }) => {
    return (
        <div className={`w-full bg-white/30 rounded-full h-3 ${className}`}>
            <div
                className={`${color} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(progress * 100, 100)}%` }}
            />
        </div>
    );
};

export default ProgressBar;
