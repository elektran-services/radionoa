import React from "react";
import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "gradient" | "success" | "danger";
  loading?: boolean;
  size?: "sm" | "md" | "lg";
};

export const Button: React.FC<ButtonProps> = ({
  className,
  children,
  variant = "primary",
  loading = false,
  disabled,
  size = "md",
  ...rest
}) => {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none gap-2 shadow-sm hover:shadow-md active:scale-[0.98]";
  
  const sizes: Record<string, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 focus-visible:ring-indigo-500 shadow-indigo-500/30 dark:shadow-indigo-400/20",
    secondary:
      "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus-visible:ring-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:focus-visible:ring-neutral-600 border border-neutral-200 dark:border-neutral-700",
    ghost:
      "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 shadow-none",
    gradient:
      "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 focus-visible:ring-purple-500 shadow-purple-500/30 dark:shadow-purple-400/20",
    success:
      "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 focus-visible:ring-emerald-500 shadow-emerald-500/30 dark:shadow-emerald-400/20",
    danger:
      "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 focus-visible:ring-red-500 shadow-red-500/30 dark:shadow-red-400/20",
  };

  return (
    <button
      className={clsx(base, sizes[size], variants[variant], className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      )}
      <span>{children}</span>
    </button>
  );
};

export default Button; 