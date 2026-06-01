import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "default";
  size?: "sm" | "md" | "lg";
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    
    const base =
      "inline-flex items-center justify-center rounded-md font-medium transition";

    const variants = {
      primary: "bg-yellow-500 text-black hover:bg-yellow-400",
      secondary: "bg-neutral-800 text-white hover:bg-neutral-700",
      danger: "bg-red-600 text-white hover:bg-red-500",
      default: "bg-neutral-900 text-white border border-neutral-700 hover:bg-neutral-800",
      ghost: "bg-transparent text-gray-300 hover:bg-neutral-800",
    };

    const sizes = {
      sm: "text-xs px-3 py-1",
      md: "text-sm px-4 py-2",
      lg: "text-base px-5 py-3",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;