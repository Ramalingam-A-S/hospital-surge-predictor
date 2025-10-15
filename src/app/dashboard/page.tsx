"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Activity, LogOut, Shield, User, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import HospitalSnapshotForm from "@/components/HospitalSnapshotForm";
import AnalysisResults from "@/components/AnalysisResults";
import HistoricalTrendsChart from "@/components/HistoricalTrendsChart";
import MultiHospitalComparison from "@/components/MultiHospitalComparison";
import NotificationPanel from "@/components/NotificationPanel";
import LiveResourceCards from "@/components/LiveResourceCards";
import RiskBanner from "@/components/RiskBanner";
import ActionCards from "@/components/ActionCards";
import { useSession, authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [hospitalId, setHospitalId] = useState<string>("MED-CENTRAL-001");

  useEffect(() => {
    // Redirect if not authenticated
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const handleLogout = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error("Logout failed");
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      toast.success("Logged out successfully");
      router.push("/");
    }
  };

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResult(result);
    if (result.hospital_id) {
      setHospitalId(result.hospital_id);
    }
  };

  // Show loading while checking auth
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session?.user) {
    return null;
  }

  const userRole = (session.user as any).role || "staff";
  const isAdmin = userRole === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-2">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">MedCentric AI</h1>
              <p className="text-sm text-muted-foreground">Hospital Surge Predictor</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-2 justify-end mb-1">
                <p className="text-sm font-medium">{session.user.name}</p>
                <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
                  {isAdmin ? (
                    <>
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </>
                  ) : (
                    <>
                      <User className="h-3 w-3 mr-1" />
                      Staff
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{session.user.email}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl mx-auto">
            <TabsTrigger value="analysis">Live Analysis</TabsTrigger>
            <TabsTrigger value="alerts">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="trends">Historical</TabsTrigger>
            <TabsTrigger value="comparison">
              {isAdmin ? "Network" : "Hospital"}
            </TabsTrigger>
          </TabsList>

          {/* Live Analysis Tab */}
          <TabsContent value="analysis" className="space-y-8">
            {/* Live Resource Cards */}
            <LiveResourceCards hospitalId={hospitalId} />

            {/* Risk Banner (when analysis available) */}
            {analysisResult && (
              <RiskBanner analysis={analysisResult} />
            )}

            {/* Form Section */}
            <HospitalSnapshotForm onAnalysisComplete={handleAnalysisComplete} />

            {/* Action Cards (when analysis available) */}
            {analysisResult && analysisResult.recommended_actions && (
              <ActionCards 
                actions={analysisResult.recommended_actions} 
                hospitalId={hospitalId}
              />
            )}

            {/* Results Section */}
            {analysisResult && (
              <div className="animate-in fade-in duration-500">
                <AnalysisResults result={analysisResult} />
              </div>
            )}

            {/* Sample Data Info */}
            {!analysisResult && (
              <div className="text-center py-12">
                <div className="inline-block p-4 rounded-full bg-muted mb-4">
                  <Activity className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Ready for Analysis</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Submit hospital snapshot data above to receive AI-powered surge predictions and resource recommendations.
                </p>
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg max-w-2xl mx-auto text-left">
                  <h3 className="font-semibold mb-2">💡 Sample Scenarios to Try:</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <strong>High Risk:</strong> Set beds_free to 15, incoming_emergencies to 25, AQI to 350</li>
                    <li>• <strong>Medium Risk:</strong> Set beds_free to 60, incoming_emergencies to 12, add festival_name</li>
                    <li>• <strong>Low Risk:</strong> Use default values with normal operations</li>
                    <li>• <strong>Major Incident:</strong> Add "major accident" or "disaster" to news summary</li>
                  </ul>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <NotificationPanel hospitalId={hospitalId} />
          </TabsContent>

          {/* Historical Trends Tab */}
          <TabsContent value="trends">
            <HistoricalTrendsChart hospitalId={hospitalId} />
          </TabsContent>

          {/* Multi-Hospital Comparison Tab */}
          <TabsContent value="comparison">
            <MultiHospitalComparison />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 text-center text-sm text-muted-foreground">
        <p>MedCentric AI © 2024 - Hospital Surge Predictor & Resource Recommender</p>
        <p className="mt-1">
          Powered by Emergent AI • Role-based Access • {isAdmin ? "Admin Dashboard" : "Staff Dashboard"}
        </p>
      </footer>
    </div>
  );
}