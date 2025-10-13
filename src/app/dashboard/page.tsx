"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Activity, LogOut } from "lucide-react";
import HospitalSnapshotForm from "@/components/HospitalSnapshotForm";
import AnalysisResults from "@/components/AnalysisResults";

export default function DashboardPage() {
  const router = useRouter();
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    // Check authentication
    const isAuth = sessionStorage.getItem("medcentric_auth");
    const user = sessionStorage.getItem("medcentric_user");
    
    if (!isAuth) {
      router.push("/login");
      return;
    }
    
    setUsername(user || "Admin");
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("medcentric_auth");
    sessionStorage.removeItem("medcentric_user");
    router.push("/login");
  };

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResult(result);
  };

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
              <p className="text-sm font-medium">{username}</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Form Section */}
        <HospitalSnapshotForm onAnalysisComplete={handleAnalysisComplete} />

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
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 text-center text-sm text-muted-foreground">
        <p>MedCentric AI © 2024 - Hospital Surge Predictor & Resource Recommender</p>
        <p className="mt-1">Demo mode with mocked authentication and deterministic predictions</p>
      </footer>
    </div>
  );
}