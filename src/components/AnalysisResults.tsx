"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, TrendingUp, Download, Activity, Users, Pill, ArrowUpRight, Bell, CheckCircle, Gauge } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

interface AnalysisResultsProps {
  result: any;
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
  const [showHighRiskDialog, setShowHighRiskDialog] = useState(false);
  const [alertSent, setAlertSent] = useState(false);

  useEffect(() => {
    // Automatically show high-risk alert dialog
    if (result?.analysis?.risk === "High") {
      setShowHighRiskDialog(true);
      setAlertSent(false);
    }
  }, [result]);

  if (!result || !result.analysis) return null;

  const { analysis } = result;
  const riskColor = {
    Low: "bg-green-500",
    Medium: "bg-yellow-500",
    High: "bg-red-500"
  }[analysis.risk] || "bg-gray-500";

  const riskVariant = {
    Low: "default" as const,
    Medium: "secondary" as const,
    High: "destructive" as const
  }[analysis.risk] || "default" as const;

  // Generate 6-hour timeline data
  const timelineData = Array.from({ length: 7 }, (_, i) => {
    const hour = new Date();
    hour.setHours(hour.getHours() + i);
    return {
      time: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      current: Math.max(0, 165 - i * 5),
      predicted: 165 + Math.floor((analysis.predicted_additional_patients_next_6h / 6) * i),
      capacity: 200
    };
  });

  const handleExport = () => {
    const exportData = {
      ...result,
      exported_at: new Date().toISOString()
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hospital-analysis-${result.hospital_id}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSendAlert = () => {
    // Simulate autonomous alert sending
    setAlertSent(true);
    toast.success("🚨 Emergency Alert Sent!", {
      description: `Alert dispatched to hospital administration, emergency response team, and on-call staff. All recommended actions flagged as urgent.`,
    });
    
    // Log the action for audit
    console.log("AUTONOMOUS_ALERT_SENT:", {
      timestamp: new Date().toISOString(),
      hospital_id: result.hospital_id,
      risk_level: analysis.risk,
      predicted_patients: analysis.predicted_additional_patients_next_6h,
      user_id: result.user_id,
      user_name: result.user_name,
      alert_message: analysis.alert_message,
      actions_count: analysis.recommended_actions.length
    });
  };

  const topActions = analysis.recommended_actions.slice(0, 3);
  const occupancyRate = analysis.metrics?.occupancy_rate || 0;
  const confidenceScore = analysis.confidence_score ? Math.round(analysis.confidence_score * 100) : null;

  return (
    <div className="space-y-6">
      {/* High Risk Alert Dialog */}
      <Dialog open={showHighRiskDialog} onOpenChange={setShowHighRiskDialog}>
        <DialogContent className="sm:max-w-[600px] border-2 border-red-500">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 text-xl">
              <AlertTriangle className="h-6 w-6" />
              🚨 HIGH RISK SURGE DETECTED
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {analysis.alert_message}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200">
                <p className="text-xs text-muted-foreground mb-1">Predicted Surge</p>
                <p className="text-2xl font-bold text-red-600">+{analysis.predicted_additional_patients_next_6h}</p>
                <p className="text-xs text-muted-foreground">patients in 6 hours</p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200">
                <p className="text-xs text-muted-foreground mb-1">Current Occupancy</p>
                <p className="text-2xl font-bold text-orange-600">{occupancyRate}%</p>
                <p className="text-xs text-muted-foreground">bed utilization</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Immediate Actions Required:
              </h4>
              <div className="space-y-2">
                {topActions.map((action: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-sm p-2 bg-muted/50 rounded">
                    <Badge variant="destructive" className="mt-0.5">{idx + 1}</Badge>
                    <span>{action.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowHighRiskDialog(false)}>
              Review Later
            </Button>
            <Button variant="destructive" onClick={handleSendAlert} disabled={alertSent}>
              {alertSent ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Alert Sent
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Send Emergency Alert
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Message */}
      <Alert variant={riskVariant} className="border-2">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="text-lg font-bold flex items-center justify-between">
          <span>{analysis.risk} Risk Level Detected</span>
          {confidenceScore && (
            <Badge variant="outline" className="ml-2 flex items-center gap-1">
              <Gauge className="h-3 w-3" />
              {confidenceScore}% confidence
            </Badge>
          )}
        </AlertTitle>
        <AlertDescription className="mt-2 text-base">
          {analysis.alert_message}
        </AlertDescription>
        {analysis.risk === "High" && !alertSent && (
          <div className="mt-4">
            <Button variant="destructive" size="sm" onClick={handleSendAlert}>
              <Bell className="mr-2 h-4 w-4" />
              Send Emergency Alert
            </Button>
          </div>
        )}
      </Alert>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Capacity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analysis.metrics?.critical_supplies_status === 'adequate' ? 'Within normal range' : 'Supplies running low'}
            </p>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${riskColor} transition-all`}
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted Surge</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">+{analysis.predicted_additional_patients_next_6h}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Next 6 hours
            </p>
            <div className="flex items-center mt-3 text-sm">
              <ArrowUpRight className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-muted-foreground">Incoming patients</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Available</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analysis.metrics?.staff_available || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Doctors & Nurses on duty
            </p>
            <Badge variant="outline" className="mt-3">
              Active shift
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* AI Confidence Score Card */}
      {confidenceScore && (
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-blue-600" />
              AI Confidence Score
            </CardTitle>
            <CardDescription>Model prediction accuracy and reliability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="text-5xl font-bold text-blue-600">{confidenceScore}%</div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${confidenceScore}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {confidenceScore >= 90 ? "Excellent - High reliability" :
                   confidenceScore >= 75 ? "Good - Reliable prediction" :
                   confidenceScore >= 60 ? "Moderate - Use with caution" :
                   "Low - Additional verification recommended"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Recommended Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Top 3 Recommended Actions</span>
            <Badge variant={riskVariant}>{analysis.risk} Priority</Badge>
          </CardTitle>
          <CardDescription>Immediate actions to manage the predicted surge</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topActions.map((action: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {action.type === 'staff' && <Users className="h-5 w-5 text-blue-500" />}
                  {action.type === 'supply' && <Pill className="h-5 w-5 text-green-500" />}
                  {action.type === 'transfer' && <ArrowUpRight className="h-5 w-5 text-orange-500" />}
                  {action.type === 'advisory' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="capitalize">{action.type}</Badge>
                    <Badge variant={action.urgency === 'High' ? 'destructive' : 'secondary'} className="text-xs">
                      {action.urgency} Urgency
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{action.detail}</p>
                  {action.qty && (
                    <p className="text-xs text-muted-foreground mt-1">Quantity: {action.qty}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 6-Hour Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle>6-Hour Patient Capacity Timeline</CardTitle>
          <CardDescription>Predicted patient load vs. hospital capacity</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="current" stroke="#3b82f6" name="Current Patients" strokeWidth={2} />
              <Line type="monotone" dataKey="predicted" stroke="#ef4444" name="Predicted Patients" strokeWidth={2} />
              <Line type="monotone" dataKey="capacity" stroke="#22c55e" name="Max Capacity" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* All Recommended Actions */}
      <Card>
        <CardHeader>
          <CardTitle>All Recommended Actions</CardTitle>
          <CardDescription>Complete list of suggested interventions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.recommended_actions.map((action: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="capitalize">{action.type}</Badge>
                    {action.qty && <span className="text-xs text-muted-foreground">Qty: {action.qty}</span>}
                  </div>
                  <p className="text-sm">{action.detail}</p>
                </div>
                <Badge variant={action.urgency === 'High' ? 'destructive' : action.urgency === 'Medium' ? 'secondary' : 'default'}>
                  {action.urgency}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end gap-3">
        {analysis.risk === "High" && (
          <Button onClick={handleSendAlert} disabled={alertSent} variant="destructive">
            {alertSent ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Alert Sent
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Send Emergency Alert
              </>
            )}
          </Button>
        )}
        <Button onClick={handleExport} variant="outline" size="lg">
          <Download className="mr-2 h-4 w-4" />
          Export Analysis (JSON)
        </Button>
      </div>
    </div>
  );
}