"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, TrendingUp } from "lucide-react";

interface HistoricalTrendsChartProps {
  hospitalId: string;
}

export default function HistoricalTrendsChart({ hospitalId }: HistoricalTrendsChartProps) {
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState("7");
  const [trendsData, setTrendsData] = useState<any[]>([]);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/historical-trends?hospital_id=${hospitalId}&days=${days}`);
      const data = await response.json();
      
      if (data.data_points) {
        // Format data for chart
        const formattedData = data.data_points.map((point: any) => ({
          timestamp: new Date(point.timestamp).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit'
          }),
          occupancy: point.occupancy_rate,
          emergencies: point.incoming_emergencies,
          predicted_surge: point.predicted_additional_patients_6h || 0,
          staff: point.staff_on_shift,
        }));
        setTrendsData(formattedData);
      }
    } catch (error) {
      console.error("Failed to fetch historical data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hospitalId) {
      fetchHistoricalData();
    }
  }, [hospitalId, days]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Historical Trends
            </CardTitle>
            <CardDescription>
              View past snapshots and predictions over time
            </CardDescription>
          </div>
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24h</SelectItem>
              <SelectItem value="3">Last 3 days</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : trendsData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No historical data available for this time period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="occupancy" 
                stroke="#3b82f6" 
                name="Occupancy (%)"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="emergencies" 
                stroke="#ef4444" 
                name="Emergencies"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="predicted_surge" 
                stroke="#f59e0b" 
                name="Predicted Surge"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Line 
                type="monotone" 
                dataKey="staff" 
                stroke="#10b981" 
                name="Staff on Shift"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}