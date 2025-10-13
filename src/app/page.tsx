"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowRight, Shield, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const isAuth = sessionStorage.getItem("medcentric_auth");
    if (isAuth) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-primary rounded-full p-4">
              <Activity className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            MedCentric AI
          </h1>
          <p className="text-2xl text-muted-foreground mb-2">
            Hospital Surge Predictor & Resource Recommender
          </p>
          <p className="text-lg text-muted-foreground mb-8">
            AI-powered predictive analytics for hospital resource management during surge events
          </p>
          <Button size="lg" onClick={() => router.push("/login")} className="text-lg px-8 py-6">
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3 w-fit mb-3">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Surge Prediction</CardTitle>
              <CardDescription>
                Predict patient surges up to 6 hours in advance using real-time hospital data and external factors
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-3 w-fit mb-3">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Smart Recommendations</CardTitle>
              <CardDescription>
                Get actionable recommendations for staff, supplies, transfers, and protocols based on risk analysis
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3 w-fit mb-3">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Real-time Analytics</CardTitle>
              <CardDescription>
                Monitor capacity, visualize trends, and export detailed reports for comprehensive hospital management
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Submit Hospital Snapshot</h3>
                  <p className="text-sm text-muted-foreground">
                    Input current bed availability, staff on duty, supplies, and incoming emergencies
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Add External Factors</h3>
                  <p className="text-sm text-muted-foreground">
                    Include AQI data, festival/event information, and major news summaries affecting your region
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Get AI-Powered Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive risk assessment, surge predictions, and prioritized action recommendations within seconds
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Hospital Resources?</h2>
          <p className="text-lg mb-6 opacity-90">
            Join hospitals using AI to predict surges and manage resources effectively
          </p>
          <Button size="lg" variant="secondary" onClick={() => router.push("/login")} className="text-lg px-8 py-6">
            Access Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>MedCentric AI © 2024 - Demo Version</p>
        <p className="mt-1">Mocked authentication • Deterministic predictions • For demonstration purposes</p>
      </footer>
    </div>
  );
}