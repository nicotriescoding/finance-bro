import { FC, ReactNode } from "react";

type StatBadgeProps = {
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
};

const StatBadge: FC<StatBadgeProps> = ({ icon, children, className = "" }) => {
    return (
        <span
            className={`px-4 py-2 bg-yellow-300 text-black rounded-full shadow-md font-bold text-lg flex items-center gap-2 ${className}`}
        >
      {icon && <span>{icon}</span>}
            {children}
    </span>
    );
};

export default StatBadge;
