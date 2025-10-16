"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface HospitalSnapshotFormProps {
  onAnalysisComplete: (result: any) => void;
}

export default function HospitalSnapshotForm({ onAnalysisComplete }: HospitalSnapshotFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hospital_id: "MED-CENTRAL-001",
    beds_total: 200,
    beds_free: 35,
    doctors_on_shift: 12,
    nurses_on_shift: 28,
    oxygen_cylinders: 45,
    ventilators: 15,
    medicines: JSON.stringify({ "Paracetamol": 500, "Antibiotics": 200, "Insulin": 150 }, null, 2),
    incoming_emergencies: 8,
    aqi: "",
    festival: "",
    news_summary: ""
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse medicines JSON
      let medicinesObj = {};
      try {
        medicinesObj = JSON.parse(formData.medicines);
      } catch {
        toast.error("Invalid medicines JSON format");
        setLoading(false);
        return;
      }

      const payload = {
        hospital_id: formData.hospital_id,
        beds_total: Number(formData.beds_total),
        beds_free: Number(formData.beds_free),
        doctors_on_shift: Number(formData.doctors_on_shift),
        nurses_on_shift: Number(formData.nurses_on_shift),
        oxygen_cylinders: Number(formData.oxygen_cylinders),
        ventilators: Number(formData.ventilators),
        medicines: medicinesObj,
        incoming_emergencies: Number(formData.incoming_emergencies),
        aqi: formData.aqi ? Number(formData.aqi) : null,
        festival: formData.festival || null,
        news_summary: formData.news_summary || null
      };

      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/snapshot", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (response.ok) {
        onAnalysisComplete(result);
        toast.success("Snapshot saved and analysis completed!");
      } else {
        console.error("Snapshot creation failed:", result.error);
        toast.error(result.error || "Failed to create snapshot");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit snapshot request");
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
                    name="hospital_id"
                    value={formData.hospital_id}
                    onChange={(e) => handleInputChange("hospital_id", e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beds_total">Total Beds</Label>
                  <Input
                    id="beds_total"
                    name="beds_total"
                    type="number"
                    value={formData.beds_total}
                    onChange={(e) => handleInputChange("beds_total", e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beds_free">Free Beds</Label>
                  <Input
                    id="beds_free"
                    name="beds_free"
                    type="number"
                    value={formData.beds_free}
                    onChange={(e) => handleInputChange("beds_free", e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incoming_emergencies">Incoming Emergencies</Label>
                  <Input
                    id="incoming_emergencies"
                    name="incoming_emergencies"
                    type="number"
                    value={formData.incoming_emergencies}
                    onChange={(e) => handleInputChange("incoming_emergencies", e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctors_on_shift">Doctors on Shift</Label>
                  <Input
                    id="doctors_on_shift"
                    name="doctors_on_shift"
                    type="number"
                    value={formData.doctors_on_shift}
                    onChange={(e) => handleInputChange("doctors_on_shift", e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nurses_on_shift">Nurses on Shift</Label>
                  <Input
                    id="nurses_on_shift"
                    name="nurses_on_shift"
                    type="number"
                    value={formData.nurses_on_shift}
                    onChange={(e) => handleInputChange("nurses_on_shift", e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oxygen_cylinders">Oxygen Cylinders</Label>
                  <Input
                    id="oxygen_cylinders"
                    name="oxygen_cylinders"
                    type="number"
                    value={formData.oxygen_cylinders}
                    onChange={(e) => handleInputChange("oxygen_cylinders", e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ventilators">Ventilators</Label>
                  <Input
                    id="ventilators"
                    name="ventilators"
                    type="number"
                    value={formData.ventilators}
                    onChange={(e) => handleInputChange("ventilators", e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicines">Medicines (JSON format)</Label>
                <Textarea
                  id="medicines"
                  name="medicines"
                  value={formData.medicines}
                  onChange={(e) => handleInputChange("medicines", e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                  autoComplete="off"
                />
              </div>
            </TabsContent>

            <TabsContent value="external" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="aqi">Air Quality Index (AQI)</Label>
                <Input
                  id="aqi"
                  name="aqi"
                  type="number"
                  placeholder="e.g., 150"
                  value={formData.aqi}
                  onChange={(e) => handleInputChange("aqi", e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="festival">Festival/Event Name</Label>
                <Input
                  id="festival"
                  name="festival"
                  placeholder="e.g., Diwali, New Year"
                  value={formData.festival}
                  onChange={(e) => handleInputChange("festival", e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="news_summary">Major News Summary</Label>
                <Textarea
                  id="news_summary"
                  name="news_summary"
                  placeholder="Describe any major events or news affecting the region..."
                  value={formData.news_summary}
                  onChange={(e) => handleInputChange("news_summary", e.target.value)}
                  rows={4}
                  autoComplete="off"
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