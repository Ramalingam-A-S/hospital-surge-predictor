"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Package, 
  ArrowRightLeft, 
  FileText, 
  CheckCircle,
  Bell,
  Download
} from "lucide-react";
import { toast } from "sonner";

interface RecommendedAction {
  step: number;
  type: "staff" | "supply" | "transfer" | "advisory";
  detail: string;
  qty: number | null;
  urgency: "low" | "medium" | "high";
  eta_hours: number | null;
}

interface ActionCardsProps {
  actions: RecommendedAction[];
  hospitalId?: string;
}

export default function ActionCards({ actions, hospitalId }: ActionCardsProps) {
  const top3Actions = actions.slice(0, 3);

  const getActionIcon = (type: string) => {
    switch (type) {
      case "staff":
        return Users;
      case "supply":
        return Package;
      case "transfer":
        return ArrowRightLeft;
      case "advisory":
        return FileText;
      default:
        return FileText;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "high":
        return <Badge variant="destructive" className="text-xs">High Priority</Badge>;
      case "medium":
        return <Badge variant="default" className="text-xs">Medium Priority</Badge>;
      case "low":
        return <Badge variant="secondary" className="text-xs">Low Priority</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{urgency}</Badge>;
    }
  };

  const handleAcknowledge = (action: RecommendedAction) => {
    toast.success(`Action ${action.step} acknowledged`, {
      description: `"${action.detail}" has been marked as acknowledged.`,
    });
  };

  const handleNotifyStaff = (action: RecommendedAction) => {
    toast.info("Notification sent", {
      description: `Staff have been notified about: "${action.detail}"`,
    });
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ actions, hospital_id: hospitalId, exported_at: new Date().toISOString() }, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hospital-actions-${hospitalId || "export"}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Actions exported", {
      description: "JSON file downloaded successfully",
    });
  };

  if (actions.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/50 rounded-lg">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <p className="text-lg font-medium">No immediate actions required</p>
        <p className="text-sm text-muted-foreground mt-1">
          All systems operating normally. Continue routine monitoring.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recommended Actions</h3>
        <Button onClick={handleExportJSON} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export JSON
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {top3Actions.map((action) => {
          const Icon = getActionIcon(action.type);
          
          return (
            <Card key={action.step} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">
                        Step {action.step}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground capitalize">
                        {action.type}
                      </p>
                    </div>
                  </div>
                  {getUrgencyBadge(action.urgency)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed min-h-[3rem]">
                  {action.detail}
                </p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {action.qty !== null && (
                    <span className="font-medium">Qty: {action.qty}</span>
                  )}
                  {action.eta_hours !== null && (
                    <span>ETA: {action.eta_hours}h</span>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleAcknowledge(action)}
                    variant="default"
                    size="sm"
                    className="flex-1"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Acknowledge
                  </Button>
                  <Button
                    onClick={() => handleNotifyStaff(action)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Bell className="h-3 w-3 mr-1" />
                    Notify
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {actions.length > 3 && (
        <div className="text-center pt-2">
          <Button variant="link" size="sm">
            View all {actions.length} actions →
          </Button>
        </div>
      )}
    </div>
  );
}