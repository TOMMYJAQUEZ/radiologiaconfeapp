import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    
    let variantClasses = "bg-brand-accent text-[#111] hover:bg-brand-accent-dark";
    if (variant === "destructive") variantClasses = "bg-brand-error text-white hover:bg-brand-error/90";
    if (variant === "outline") variantClasses = "border border-brand-border bg-transparent hover:bg-brand-gray text-brand-white";
    if (variant === "secondary") variantClasses = "bg-brand-dark text-brand-white hover:bg-brand-gray";
    if (variant === "ghost") variantClasses = "hover:bg-brand-gray text-brand-white";
    if (variant === "link") variantClasses = "text-brand-accent underline-offset-4 hover:underline";

    let sizeClasses = "h-11 px-5 py-2";
    if (size === "sm") sizeClasses = "h-9 rounded-md px-3";
    if (size === "lg") sizeClasses = "h-12 rounded-md px-8 text-base";
    if (size === "icon") sizeClasses = "h-10 w-10";

    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent disabled:pointer-events-none disabled:opacity-50";

    return (
      <button
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
