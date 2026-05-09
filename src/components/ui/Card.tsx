import React from "react";
import clsx from "clsx";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
  hover?: boolean;
  gradient?: boolean;
};

export const Card: React.FC<CardProps> = ({ 
  className, 
  padded = true, 
  hover = false,
  gradient = false,
  children, 
  ...rest 
}) => {
  return (
    <div
      className={clsx(
        "rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg transition-all duration-300",
        padded && "p-6",
        hover && "hover:shadow-2xl hover:scale-[1.02] hover:border-indigo-200 dark:hover:border-indigo-900",
        gradient && "bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card; 