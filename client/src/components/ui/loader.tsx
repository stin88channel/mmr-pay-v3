import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Loader({ className, size = "md" }: LoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div
        className={cn(
          "animate-spin rounded-full border-4 border-primary/20 border-t-primary",
          sizeClasses[size],
          className
        )}
      />
    </div>
  );
} 