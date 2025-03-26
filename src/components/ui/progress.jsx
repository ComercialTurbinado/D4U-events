
import React from "react";
import { cn } from "@/lib/utils";

// Componente próprio de Progress (sem depender do Radix UI)
const Progress = React.forwardRef(({ className, value, indicatorClassName, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-gray-200",
      className
    )}
    {...props}
  >
    <div
      className={cn(
        "h-full flex-1 bg-blue-600 transition-all",
        indicatorClassName
      )}
      style={{ width: `${value || 0}%` }}
    />
  </div>
));

Progress.displayName = "Progress";

export { Progress };
export default Progress;
