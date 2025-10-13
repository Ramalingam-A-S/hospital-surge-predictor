"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface HospitalSnapshotFormProps {
  onAnalysisComplete: (result: any) => void;
}

export default function HospitalSnapshotForm({ onAnalysisComplete }: HospitalSnapshotFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hospital_id: "MED-CENTRAL-001",
    timestamp: new Date().toISOString(),
    beds_total: 200,
    beds_free: 35,
    expected_free_time: "",
    doctors_on_shift: 12,
    nurses_on_shift: 28,
    oxygen_cylinders: 45,
    ventilators: 15,
    key_meds: JSON.stringify({ "Paracetamol": 500, "Antibiotics": 200, "Insulin": 150 }, null, 2),
    incoming_emergencies: 8,
    incident_description: "",
    aqi: "",
    festival_name: "",
    major_news_summary: ""
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse expected_free_time as array of ISO timestamps
      const expectedFreeTimeArray = formData.expected_free_time
        ? formData.expected_free_time.split(",").map(t => t.trim())
        : [];

      // Parse key_meds JSON
      let keyMeds = {};
      try {
        keyMeds = JSON.parse(formData.key_meds);
      } catch {
        keyMeds = {};
      }

      const payload = {
        ...formData,
        timestamp: new Date().toISOString(),
        beds_total: Number(formData.beds_total),
        beds_free: Number(formData.beds_free),
        expected_free_time: expectedFreeTimeArray,
        doctors_on_shift: Number(formData.doctors_on_shift),
        nurses_on_shift: Number(formData.nurses_on_shift),
        oxygen_cylinders: Number(formData.oxygen_cylinders),
        ventilators: Number(formData.ventilators),
        key_meds: keyMeds,
        incoming_emergencies: Number(formData.incoming_emergencies),
        aqi: formData.aqi ? Number(formData.aqi) : undefined,
      };

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (result.success) {
        onAnalysisComplete(result);
      } else {
        console.error("Analysis failed:", result.error);
        alert("Analysis failed: " + result.error);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit analysis request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hospital Snapshot Submission</CardTitle>
        <CardDescription>Enter current hospital data for surge prediction analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="external">External Factors</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hospital_id">Hospital ID</Label>
                  <Input
                    id="hospital_id"
                    value={formData.hospital_id}
                    onChange={(e) => handleInputChange("hospital_id", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beds_total">Total Beds</Label>
                  <Input
                    id="beds_total"
                    type="number"
                    value={formData.beds_total}
                    onChange={(e) => handleInputChange("beds_total", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beds_free">Free Beds</Label>
                  <Input
                    id="beds_free"
                    type="number"
                    value={formData.beds_free}
                    onChange={(e) => handleInputChange("beds_free", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incoming_emergencies">Incoming Emergencies</Label>
                  <Input
                    id="incoming_emergencies"
                    type="number"
                    value={formData.incoming_emergencies}
                    onChange={(e) => handleInputChange("incoming_emergencies", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_free_time">Expected Free Times (comma-separated ISO timestamps)</Label>
                <Input
                  id="expected_free_time"
                  placeholder="2024-01-15T10:00:00Z, 2024-01-15T14:00:00Z"
                  value={formData.expected_free_time}
                  onChange={(e) => handleInputChange("expected_free_time", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="incident_description">Incident Description</Label>
                <Textarea
                  id="incident_description"
                  placeholder="Describe any ongoing incidents or emergencies..."
                  value={formData.incident_description}
                  onChange={(e) => handleInputChange("incident_description", e.target.value)}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctors_on_shift">Doctors on Shift</Label>
                  <Input
                    id="doctors_on_shift"
                    type="number"
                    value={formData.doctors_on_shift}
                    onChange={(e) => handleInputChange("doctors_on_shift", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nurses_on_shift">Nurses on Shift</Label>
                  <Input
                    id="nurses_on_shift"
                    type="number"
                    value={formData.nurses_on_shift}
                    onChange={(e) => handleInputChange("nurses_on_shift", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oxygen_cylinders">Oxygen Cylinders</Label>
                  <Input
                    id="oxygen_cylinders"
                    type="number"
                    value={formData.oxygen_cylinders}
                    onChange={(e) => handleInputChange("oxygen_cylinders", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ventilators">Ventilators</Label>
                  <Input
                    id="ventilators"
                    type="number"
                    value={formData.ventilators}
                    onChange={(e) => handleInputChange("ventilators", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="key_meds">Key Medications (JSON format)</Label>
                <Textarea
                  id="key_meds"
                  value={formData.key_meds}
                  onChange={(e) => handleInputChange("key_meds", e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="external" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="aqi">Air Quality Index (AQI)</Label>
                <Input
                  id="aqi"
                  type="number"
                  placeholder="e.g., 150"
                  value={formData.aqi}
                  onChange={(e) => handleInputChange("aqi", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="festival_name">Festival/Event Name</Label>
                <Input
                  id="festival_name"
                  placeholder="e.g., Diwali, New Year"
                  value={formData.festival_name}
                  onChange={(e) => handleInputChange("festival_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="major_news_summary">Major News Summary</Label>
                <Textarea
                  id="major_news_summary"
                  placeholder="Describe any major events or news affecting the region..."
                  value={formData.major_news_summary}
                  onChange={(e) => handleInputChange("major_news_summary", e.target.value)}
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>

          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Submit & Analyze"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}