import * as React from "react";
import { cn } from "cn";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[110px] w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base leading-relaxed text-slate-900 shadow-sm transition-all duration-150 placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 aria-invalid:border-red-400 aria-invalid:ring-2 aria-invalid:ring-red-500/30",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
