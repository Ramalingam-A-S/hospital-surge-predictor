"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, AlertTriangle, TrendingUp, CheckCircle, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface NotificationPanelProps {
  hospitalId: string;
}

interface AlertNotification {
  id: string;
  timestamp: string;
  risk_level: string;
  alert_message: string;
  predicted_patients: number;
  read: boolean;
}

export default function NotificationPanel({ hospitalId }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/get-predictions?hospital_id=${hospitalId}&limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const alerts: AlertNotification[] = data
          .filter((pred: any) => pred.risk_level === "High" || pred.risk_level === "Medium")
          .map((pred: any) => ({
            id: pred.id.toString(),
            timestamp: pred.created_at,
            risk_level: pred.risk_level,
            alert_message: pred.alert_message,
            predicted_patients: pred.predicted_additional_patients_6h,
            read: false,
          }));
        
        setNotifications(alerts);
        
        // Show toast for new high-risk alerts
        const highRiskCount = alerts.filter(a => a.risk_level === "High" && !a.read).length;
        if (highRiskCount > 0 && alerts.length > 0) {
          toast.warning(`${highRiskCount} high-risk alert${highRiskCount > 1 ? 's' : ''} detected`);
        }
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [hospitalId]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchAlerts();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, hospitalId]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    toast.success("All notifications marked as read");
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Alert Center</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "text-green-600" : ""}
            >
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={fetchAlerts} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        <CardDescription>
          Real-time monitoring of high and medium risk alerts
          {autoRefresh && <span className="text-green-600 ml-2">(Auto-refresh enabled)</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="px-6 pb-3 border-b flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {notifications.length} total alert{notifications.length !== 1 ? 's' : ''}
          </p>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[500px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No alerts found</p>
              <p className="text-xs text-muted-foreground mt-1">
                High and Medium risk predictions will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors ${
                    !notification.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {notification.risk_level === "High" ? (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        ) : (
                          <TrendingUp className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={notification.risk_level === "High" ? "destructive" : "secondary"}
                          >
                            {notification.risk_level} Risk
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            +{notification.predicted_patients} patients
                          </Badge>
                          {!notification.read && (
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium mb-1">
                          {notification.alert_message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}