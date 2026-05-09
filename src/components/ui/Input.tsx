import React from "react";
import clsx from "clsx";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input: React.FC<InputProps> = ({ id, label, error, className, ...rest }) => {
  const reactId = React.useId();
  const inputId = id || rest.name || reactId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          "w-full h-11 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 text-sm",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
          "placeholder:text-neutral-400 dark:placeholder:text-neutral-600",
          "shadow-sm hover:border-neutral-400 dark:hover:border-neutral-600",
          error && "border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-950/20",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input; 