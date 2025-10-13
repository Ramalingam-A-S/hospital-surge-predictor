"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, Download, Activity, Users, Pill, ArrowUpRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface AnalysisResultsProps {
  result: any;
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
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

  const topActions = analysis.recommended_actions.slice(0, 3);
  const occupancyRate = analysis.metrics?.occupancy_rate || 0;

  return (
    <div className="space-y-6">
      {/* Alert Message */}
      <Alert variant={riskVariant} className="border-2">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="text-lg font-bold">
          {analysis.risk} Risk Level Detected
        </AlertTitle>
        <AlertDescription className="mt-2 text-base">
          {analysis.alert_message}
        </AlertDescription>
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
      <div className="flex justify-end">
        <Button onClick={handleExport} variant="outline" size="lg">
          <Download className="mr-2 h-4 w-4" />
          Export Analysis (JSON)
        </Button>
      </div>
    </div>
  );
}