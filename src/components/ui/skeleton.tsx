import { cn } from "cn";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-100 motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
