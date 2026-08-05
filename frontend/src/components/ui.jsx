import React from 'react';
import { cn } from '../lib/utils';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', isLoading, children, ...props }, ref) => {
    const variants = {
        primary: 'bg-primary text-white hover:bg-emerald-800 shadow-md',
        secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
        ghost: 'hover:bg-slate-100 text-slate-700',
        outline: 'border-2 border-primary text-primary hover:bg-primary/5'
    };

    const sizes = {
        default: 'h-11 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-14 px-8 text-lg'
    };

    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
});
Button.displayName = "Button";

export const Input = React.forwardRef(({ className, type, label, error, ...props }, ref) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && <label className="text-sm font-semibold text-slate-700 tracking-tight">{label}</label>}
            <input
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
                    error && "border-red-500 focus-visible:ring-red-500/20",
                    className
                )}
                ref={ref}
                {...props}
            />
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>
    );
});
Input.displayName = "Input";

export const Select = React.forwardRef(({ className, label, options, error, placeholder, ...props }, ref) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && <label className="text-sm font-semibold text-slate-700 tracking-tight">{label}</label>}
            <div className="relative">
                <select
                    className={cn(
                        "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
                        error && "border-red-500 focus-visible:ring-red-500/20",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {placeholder && <option value="" disabled selected>{placeholder}</option>}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </div>
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>
    )
});
Select.displayName = "Select";
