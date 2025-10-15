"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Bed, Wind, Droplet, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LiveResource {
  id: number;
  hospital_id: string;
  beds_total: number;
  beds_free: number;
  oxygen_cylinders: number;
  ventilators: number;
  last_updated: string;
}

interface LiveResourceCardsProps {
  hospitalId: string;
}

export default function LiveResourceCards({ hospitalId }: LiveResourceCardsProps) {
  const [resource, setResource] = useState<LiveResource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveResources();
    // Refresh every 30 seconds
    const interval = setInterval(fetchLiveResources, 30000);
    return () => clearInterval(interval);
  }, [hospitalId]);

  const fetchLiveResources = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/hospitals/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const hospitalResource = data.find((r: LiveResource) => r.hospital_id === hospitalId);
        setResource(hospitalResource || null);
      }
    } catch (error) {
      console.error("Failed to fetch live resources:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 w-20 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded mb-2"></div>
              <div className="h-3 w-24 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center p-8 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">No live resource data available for this hospital.</p>
      </div>
    );
  }

  const bedsCapacity = (resource.beds_free / resource.beds_total) * 100;
  const bedsStatus = bedsCapacity > 40 ? "good" : bedsCapacity > 20 ? "warning" : "critical";
  
  const oxygenStatus = resource.oxygen_cylinders > 30 ? "good" : resource.oxygen_cylinders > 15 ? "warning" : "critical";
  const ventilatorsStatus = resource.ventilators > 8 ? "good" : resource.ventilators > 4 ? "warning" : "critical";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30";
      case "critical":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30";
      default:
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30";
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "good":
        return "secondary";
      case "warning":
        return "default";
      case "critical":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Live Resource Status</h3>
        <p className="text-sm text-muted-foreground">
          Updated: {new Date(resource.last_updated).toLocaleTimeString()}
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Beds Card */}
        <Card className={getStatusColor(bedsStatus)}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bed className="h-4 w-4" />
              Available Beds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resource.beds_free} / {resource.beds_total}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={getStatusBadgeVariant(bedsStatus)} className="text-xs">
                {Math.round(bedsCapacity)}% free
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Oxygen Card */}
        <Card className={getStatusColor(oxygenStatus)}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wind className="h-4 w-4" />
              Oxygen Cylinders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resource.oxygen_cylinders}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={getStatusBadgeVariant(oxygenStatus)} className="text-xs">
                {oxygenStatus === "good" ? "Adequate" : oxygenStatus === "warning" ? "Low" : "Critical"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Ventilators Card */}
        <Card className={getStatusColor(ventilatorsStatus)}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Droplet className="h-4 w-4" />
              Ventilators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resource.ventilators}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={getStatusBadgeVariant(ventilatorsStatus)} className="text-xs">
                {ventilatorsStatus === "good" ? "Available" : ventilatorsStatus === "warning" ? "Limited" : "Critical"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Staff Status Card (Placeholder) */}
        <Card className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Staff On Duty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                View Roster
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}