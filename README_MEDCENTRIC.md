# MedCentric AI - Hospital Surge Predictor & Resource Recommender

A responsive web application built with Next.js 15, React, and Tailwind CSS that provides AI-powered predictive analytics for hospital resource management during surge events.

## 🚀 Features

### Core Functionality
- **Admin Authentication**: Mocked login system (accepts any credentials for demo)
- **Hospital Snapshot Submission**: Comprehensive form for real-time hospital data
- **AI-Powered Analysis**: Surge prediction and risk assessment
- **Smart Recommendations**: Actionable insights for staff, supplies, and protocols
- **Real-time Dashboard**: Capacity monitoring and trend visualization
- **Data Export**: JSON export functionality for analysis results

### Data Collection
The system collects and analyzes:
- **Hospital Metrics**: Bed capacity, staff levels, equipment availability
- **Medical Supplies**: Oxygen cylinders, ventilators, key medications
- **Emergency Data**: Incoming emergencies, incident descriptions
- **External Factors**: AQI, festivals/events, major news

## 📋 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm/bun package manager

### Installation

```bash
# Install dependencies
npm install
# or
bun install

# Run development server
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Authentication

**Demo Mode**: The application uses mocked authentication for demonstration purposes.

- Navigate to `/login`
- Enter any username and password
- Click "Sign In" to access the dashboard

Authentication state is stored in `sessionStorage` and persists during the browser session.

## 📊 Using the Dashboard

### 1. Submit Hospital Snapshot

Fill out the form with hospital data across three tabs:

**Basic Info Tab:**
- Hospital ID
- Total beds and free beds
- Incoming emergencies count
- Expected bed free times (optional)
- Incident description

**Resources Tab:**
- Doctors on shift
- Nurses on shift
- Oxygen cylinders available
- Ventilators available
- Key medications (JSON format)

**External Factors Tab:**
- Air Quality Index (AQI)
- Festival/event name
- Major news summary

### 2. View Analysis Results

After submission, the dashboard displays:

- **Risk Level**: Low, Medium, or High
- **Alert Message**: Human-readable situation summary
- **Capacity Cards**: Current occupancy, predicted surge, staff availability
- **Top 3 Actions**: Priority recommendations
- **Timeline Chart**: 6-hour patient capacity projection
- **Complete Action List**: All recommended interventions
- **Export Button**: Download analysis as JSON

## 🔌 API Documentation

### POST `/api/analyze`

Analyzes hospital snapshot data and returns risk assessment with recommendations.

#### Request Body

```json
{
  "hospital_id": "MED-CENTRAL-001",
  "timestamp": "2024-01-15T10:00:00Z",
  "beds_total": 200,
  "beds_free": 35,
  "expected_free_time": ["2024-01-15T14:00:00Z", "2024-01-15T18:00:00Z"],
  "doctors_on_shift": 12,
  "nurses_on_shift": 28,
  "oxygen_cylinders": 45,
  "ventilators": 15,
  "key_meds": {
    "Paracetamol": 500,
    "Antibiotics": 200,
    "Insulin": 150
  },
  "incoming_emergencies": 8,
  "incident_description": "Normal operations",
  "aqi": 150,
  "festival_name": "Diwali",
  "major_news_summary": "Heavy traffic expected"
}
```

#### Response

```json
{
  "success": true,
  "hospital_id": "MED-CENTRAL-001",
  "timestamp": "2024-01-15T10:05:30Z",
  "analysis": {
    "risk": "Medium",
    "predicted_additional_patients_next_6h": 20,
    "recommended_actions": [
      {
        "type": "staff",
        "detail": "Call in additional doctors and nurses for emergency shifts",
        "qty": 8,
        "urgency": "High"
      },
      {
        "type": "supply",
        "detail": "Stock up on critical medications",
        "qty": 50,
        "urgency": "Medium"
      },
      {
        "type": "advisory",
        "detail": "Alert administrative staff to prepare surge protocols",
        "urgency": "Medium"
      }
    ],
    "alert_message": "Hospital MED-CENTRAL-001 is experiencing medium risk levels...",
    "metrics": {
      "occupancy_rate": 83,
      "staff_available": 40,
      "critical_supplies_status": "adequate"
    }
  }
}
```

#### Risk Calculation Logic

The system uses deterministic algorithms based on:

1. **Occupancy Rate**: `(beds_total - beds_free) / beds_total * 100`
   - >85% → High Risk
   - >70% → Medium Risk
   - ≤70% → Low Risk

2. **External Factors**:
   - AQI > 300 → Risk escalation
   - Festival/event → +10 patients, risk escalation
   - Major incidents (accident/disaster) → +15 patients, High Risk

3. **Staff Ratio**: `doctors_on_shift + nurses_on_shift`
   - <15 → Risk escalation

4. **Supply Levels**:
   - Oxygen cylinders < 30 → Supply alert
   - Ventilators < 10 → Equipment alert

#### Action Types

- **staff**: Personnel recommendations (doctors, nurses, support)
- **supply**: Medical supply replenishment (meds, equipment)
- **transfer**: Patient transfer suggestions
- **advisory**: Protocol and procedural recommendations

#### Urgency Levels

- **High**: Immediate action required (0-1 hour)
- **Medium**: Action needed within shift (1-4 hours)
- **Low**: Monitoring and planning required

## 🧪 Sample Test Scenarios

### High Risk Scenario
```json
{
  "beds_free": 15,
  "incoming_emergencies": 25,
  "aqi": 350,
  "major_news_summary": "Major accident on highway"
}
```
Expected: High risk, 50+ predicted patients, urgent actions

### Medium Risk Scenario
```json
{
  "beds_free": 60,
  "incoming_emergencies": 12,
  "festival_name": "New Year",
  "aqi": 180
}
```
Expected: Medium risk, 25-30 predicted patients, moderate actions

### Low Risk Scenario
```json
{
  "beds_free": 80,
  "incoming_emergencies": 5,
  "oxygen_cylinders": 60,
  "ventilators": 20
}
```
Expected: Low risk, <10 predicted patients, standard protocols

## 📁 Project Structure

```
medcentric-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyze/
│   │   │       └── route.ts          # Analysis API endpoint
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Main dashboard
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Homepage
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── ui/                       # Shadcn/ui components
│   │   ├── HospitalSnapshotForm.tsx  # Data submission form
│   │   └── AnalysisResults.tsx       # Results display
│   └── lib/
│       └── utils.ts                  # Utility functions
├── public/                           # Static assets
└── README_MEDCENTRIC.md             # This file
```

## 🎨 Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React

## 🔒 Security Notes (Production Considerations)

This is a **DEMO APPLICATION** with mocked features:

- ✅ Mocked authentication (no real user management)
- ✅ Deterministic predictions (no actual AI model)
- ✅ Client-side session storage (not secure for production)

For production deployment:
- Implement real authentication (e.g., NextAuth.js)
- Add database for persistent storage
- Integrate actual AI/ML models
- Add role-based access control
- Implement audit logging
- Use secure session management
- Add rate limiting and validation

## 📤 Export Functionality

Click the "Export Analysis (JSON)" button to download complete analysis results including:
- Hospital snapshot data
- Risk assessment
- All recommendations
- Metrics and predictions
- Export timestamp

File format: `hospital-analysis-{hospital_id}-{timestamp}.json`

## 🎯 Key Features Summary

✅ Responsive design (mobile, tablet, desktop)  
✅ Dark mode support  
✅ Real-time form validation  
✅ Loading states and error handling  
✅ Interactive charts and visualizations  
✅ Deterministic predictions for consistent demos  
✅ Comprehensive action recommendations  
✅ JSON export functionality  
✅ Mocked authentication flow  
✅ Professional UI with Shadcn components  

## 📞 Support

For issues or questions about this demo application, please refer to the documentation or contact the development team.

---

**MedCentric AI** © 2024 - Hospital Surge Predictor & Resource Recommender  
*Demo Version - Not for production use*