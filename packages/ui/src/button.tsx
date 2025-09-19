import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

export function Button({ children, className = "", ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className={
        "px-3 py-2 rounded-md bg-[#4F46E5] text-white hover:bg-[#4338CA] disabled:opacity-50 " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}
