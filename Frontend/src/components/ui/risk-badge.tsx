import { Badge } from "@/components/ui/badge";
import type { RiskLevel } from "@/types";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const variants = {
    low: "bg-risk-low-bg text-risk-low border-risk-low",
    moderate: "bg-risk-moderate-bg text-risk-moderate border-risk-moderate",
    high: "bg-risk-high-bg text-risk-high border-risk-high",
  };

  const labels = {
    low: "Low Risk",
    moderate: "Moderate Risk", 
    high: "High Risk",
  };

  return (
    <Badge 
      className={cn(
        variants[level], 
        "border font-medium capitalize",
        className
      )}
    >
      {labels[level]}
    </Badge>
  );
}