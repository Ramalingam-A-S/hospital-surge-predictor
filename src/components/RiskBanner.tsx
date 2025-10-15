"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";

interface RiskBannerProps {
  risk: "Low" | "Medium" | "High";
  alertMessage: string;
  confidence?: number;
  predictedPatients?: number;
}

export default function RiskBanner({
  risk,
  alertMessage,
  confidence,
  predictedPatients,
}: RiskBannerProps) {
  const getRiskConfig = () => {
    switch (risk) {
      case "High":
        return {
          icon: AlertTriangle,
          variant: "destructive" as const,
          bgColor: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900",
          badgeVariant: "destructive" as const,
        };
      case "Medium":
        return {
          icon: AlertCircle,
          variant: "default" as const,
          bgColor: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900",
          badgeVariant: "default" as const,
        };
      case "Low":
        return {
          icon: CheckCircle,
          variant: "default" as const,
          bgColor: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900",
          badgeVariant: "secondary" as const,
        };
    }
  };

  const config = getRiskConfig();
  const Icon = config.icon;

  return (
    <Alert className={`${config.bgColor} transition-all duration-300`}>
      <Icon className="h-5 w-5" />
      <AlertTitle className="flex items-center gap-3 mb-2">
        <span className="text-lg font-bold">Risk Assessment</span>
        <Badge variant={config.badgeVariant} className="text-sm px-3 py-1">
          {risk} Risk
        </Badge>
        {confidence !== undefined && (
          <span className="text-sm text-muted-foreground ml-auto">
            Confidence: {Math.round(confidence * 100)}%
          </span>
        )}
      </AlertTitle>
      <AlertDescription className="space-y-2">
        <p className="text-sm leading-relaxed">{alertMessage}</p>
        {predictedPatients !== undefined && predictedPatients > 0 && (
          <div className="flex items-center gap-2 text-sm pt-2">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">
              Predicted additional patients (6h): {predictedPatients}
            </span>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}