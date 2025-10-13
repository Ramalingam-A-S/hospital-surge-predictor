"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Building2, RefreshCw, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

interface Hospital {
  hospital_id: string;
  hospital_name: string;
  location: string;
  capacity_total: number;
  latest_snapshot: {
    occupancy_rate: number;
    beds_free: number;
    staff_total: number;
    incoming_emergencies: number;
    aqi: number | null;
  } | null;
  latest_prediction: {
    risk_level: string;
    predicted_additional_patients_6h: number;
    confidence_score: number | null;
    alert_message: string;
  } | null;
}

export default function MultiHospitalComparison() {
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  const fetchComparisonData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/multi-hospital-comparison");
      const data = await response.json();
      
      if (data.comparison_data) {
        setHospitals(data.comparison_data);
      }
    } catch (error) {
      console.error("Failed to fetch comparison data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisonData();
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "high":
        return <AlertCircle className="h-4 w-4" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4" />;
      case "low":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 85) return "text-red-600 dark:text-red-400";
    if (rate >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Multi-Hospital Comparison
            </CardTitle>
            <CardDescription>
              Real-time status of all hospitals in the network
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchComparisonData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && hospitals.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : hospitals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No hospital data available</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {hospitals.map((hospital) => (
              <Card key={hospital.hospital_id} className="overflow-hidden">
                <div className={`h-2 ${hospital.latest_prediction ? getRiskColor(hospital.latest_prediction.risk_level) : 'bg-gray-300'}`} />
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{hospital.hospital_name}</CardTitle>
                  <CardDescription className="text-xs">{hospital.location}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hospital.latest_snapshot ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Occupancy</span>
                        <span className={`text-lg font-bold ${getOccupancyColor(hospital.latest_snapshot.occupancy_rate)}`}>
                          {hospital.latest_snapshot.occupancy_rate}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Beds Free</span>
                        <span className="font-medium">{hospital.latest_snapshot.beds_free}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Staff</span>
                        <span className="font-medium">{hospital.latest_snapshot.staff_total}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Emergencies</span>
                        <span className="font-medium">{hospital.latest_snapshot.incoming_emergencies}</span>
                      </div>
                      {hospital.latest_snapshot.aqi && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">AQI</span>
                          <span className="font-medium">{hospital.latest_snapshot.aqi}</span>
                        </div>
                      )}
                      {hospital.latest_prediction && (
                        <>
                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Risk Level</span>
                              <Badge className={getRiskColor(hospital.latest_prediction.risk_level)}>
                                {getRiskIcon(hospital.latest_prediction.risk_level)}
                                <span className="ml-1">{hospital.latest_prediction.risk_level}</span>
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Predicted Surge (6h)</span>
                              <span className="font-bold text-orange-600 dark:text-orange-400">
                                +{hospital.latest_prediction.predicted_additional_patients_6h}
                              </span>
                            </div>
                            {hospital.latest_prediction.confidence_score && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Confidence</span>
                                <span className="text-sm font-medium">
                                  {(hospital.latest_prediction.confidence_score * 100).toFixed(0)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      No recent data available
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}