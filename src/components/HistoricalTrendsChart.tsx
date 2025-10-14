"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, TrendingUp, Filter, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface HistoricalTrendsChartProps {
  hospitalId: string;
}

export default function HistoricalTrendsChart({ hospitalId: defaultHospitalId }: HistoricalTrendsChartProps) {
  const [loading, setLoading] = useState(false);
  const [hospitalId, setHospitalId] = useState(defaultHospitalId);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [snapshots, setSnapshots] = useState<any[]>([]);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (hospitalId) params.append("hospital_id", hospitalId);
      if (startDate) params.append("start_date", new Date(startDate).toISOString());
      if (endDate) params.append("end_date", new Date(endDate).toISOString());
      params.append("limit", "100");

      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/snapshots?${params.toString()}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch snapshots");
      }

      const data = await response.json();
      setSnapshots(data);
    } catch (error) {
      console.error("Failed to fetch historical data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalData();
  }, []);

  // Format data for risk level chart
  const riskChartData = snapshots
    .filter(s => s.analysis)
    .map((snapshot) => ({
      timestamp: new Date(snapshot.timestamp).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit'
      }),
      risk: snapshot.analysis.risk === "High" ? 3 : snapshot.analysis.risk === "Medium" ? 2 : 1,
      capacity: snapshot.capacity_ratio ? snapshot.capacity_ratio * 100 : 0,
      predicted_patients: snapshot.analysis.predicted_additional_patients_6h,
    }))
    .reverse();

  // Get recommended actions history
  const actionsHistory = snapshots
    .filter(s => s.analysis && s.analysis.recommended_actions)
    .slice(0, 20)
    .map(snapshot => ({
      timestamp: snapshot.timestamp,
      hospital_id: snapshot.hospital_id,
      risk: snapshot.analysis.risk,
      actions: Array.isArray(snapshot.analysis.recommended_actions) 
        ? snapshot.analysis.recommended_actions 
        : JSON.parse(snapshot.analysis.recommended_actions as string)
    }));

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High": return "destructive";
      case "Medium": return "default";
      case "Low": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filters</CardTitle>
          </div>
          <CardDescription>Filter snapshots by hospital and date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hospital_id">Hospital ID</Label>
              <Input
                id="hospital_id"
                placeholder="e.g., MED-CENTRAL-001"
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={fetchHistoricalData} className="mt-4 w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Risk Level Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <CardTitle>Risk Level Over Time</CardTitle>
          </div>
          <CardDescription>
            Historical risk levels and capacity trends ({snapshots.length} snapshots)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : riskChartData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No historical data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={riskChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  yAxisId="left"
                  domain={[0, 3.5]}
                  ticks={[1, 2, 3]}
                  tickFormatter={(value) => value === 3 ? "High" : value === 2 ? "Medium" : "Low"}
                />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    if (name === "risk") {
                      return value === 3 ? "High" : value === 2 ? "Medium" : "Low";
                    }
                    if (name === "capacity") {
                      return `${Math.round(value)}%`;
                    }
                    return value;
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="risk" 
                  stroke="#ef4444" 
                  name="Risk Level"
                  strokeWidth={3}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="capacity" 
                  stroke="#3b82f6" 
                  name="Capacity %"
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="predicted_patients" 
                  stroke="#f59e0b" 
                  name="Predicted Patients"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recommended Actions History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions History</CardTitle>
          <CardDescription>Recent AI recommendations across snapshots</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : actionsHistory.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No actions history available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Recommended Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actionsHistory.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{item.hospital_id}</TableCell>
                      <TableCell>
                        <Badge variant={getRiskColor(item.risk) as any}>
                          {item.risk}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {item.actions.slice(0, 3).map((action: any, i: number) => (
                            <li key={i} className="text-muted-foreground">
                              <span className="font-medium text-foreground">
                                {action.action}
                              </span>
                              {action.priority && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {action.priority}
                                </Badge>
                              )}
                            </li>
                          ))}
                          {item.actions.length > 3 && (
                            <li className="text-xs text-muted-foreground italic">
                              +{item.actions.length - 3} more...
                            </li>
                          )}
                        </ul>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}