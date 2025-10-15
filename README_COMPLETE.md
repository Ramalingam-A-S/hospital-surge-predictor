# MedCentric AI - Hospital Surge Predictor & Resource Recommender

## 🏥 Complete System Overview

MedCentric AI is a comprehensive hospital surge prediction and resource management system that combines rule-based quick checks with advanced AI-powered analysis to help hospitals prepare for patient surges and optimize resource allocation.

## 🚀 Features

### Core Capabilities
- **QuickCheck Analysis**: Fast, rule-based risk assessment (<100ms)
- **Agentic AI Analysis**: Multi-step LLM-powered deep analysis with reasoning
- **Auto-Escalation**: Automatic escalation from QuickCheck to AI for Medium/High risk
- **Real-time Monitoring**: Live resource tracking and capacity monitoring
- **Multi-Hospital Network**: Cross-facility coordination and transfer recommendations
- **Staff Wellness**: Built-in wellness checks and coping strategies
- **Webhook Notifications**: Instant alerts via Slack, Twilio SMS, and Email

### Agent System
1. **QuickCheck** - Rule-based rapid assessment
2. **AgenticAnalysis** - AI-powered comprehensive analysis
3. **ShiftOptimizer** - Staff redeployment recommendations
4. **MedAssist** - Clinical decision support with protocols
5. **TransferAdvisor** - Patient transfer coordination
6. **WellnessCheck** - Staff wellbeing monitoring
7. **ReportBuilder** - Automated report generation

## 📊 Database Schema

### Core Tables
- `hospital_snapshots` - Real-time hospital state data
- `ai_analyses` - AI predictions and recommendations
- `hospitals` - Hospital master data
- `live_resources` - Current resource availability
- `staff_roster` - Staff scheduling and availability
- `wellness_metrics` - Staff wellbeing tracking
- `user`, `session`, `account`, `verification` - Authentication tables

## 🔌 API Routes

### Analysis Endpoints
```
POST /api/quick_check           # Fast rule-based analysis
POST /api/agentic_analysis      # Full AI-powered analysis
POST /api/save-snapshot         # Save + auto-analyze + notify
GET  /api/history               # Historical data with filters
GET  /api/hospitals/status      # Network-wide status
```

### Agent Endpoints
```
POST /api/agents/shift-optimizer    # Staff optimization
POST /api/agents/med-assist         # Clinical protocols
POST /api/agents/transfer-advisor   # Transfer coordination
POST /api/agents/wellness-check     # Wellness monitoring
POST /api/agents/report-builder     # Report generation
```

### Notifications
```
POST /api/webhooks/notify       # Trigger alerts (Slack/Twilio/Email)
```

### Staff Management
```
GET  /api/staff/roster              # View staff roster
POST /api/staff/roster              # Add staff member
PUT  /api/staff/roster/:id          # Update staff member
POST /api/staff/wellness            # Log wellness metrics
```

## 🎯 Quick Start Guide

### 1. Environment Setup

Create `.env` file with required variables:

```env
# Database (Auto-configured by system)
DATABASE_URL=your_database_url

# Authentication (Auto-configured)
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000

# Webhook Notifications (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_FROM_NUMBER=+1234567890
TWILIO_TO_NUMBERS=+1987654321,+1555555555
EMAIL_RECIPIENTS=admin@hospital.com,emergency@hospital.com

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Installation

```bash
npm install
npm run db:push    # Initialize database
npm run db:seed    # Load sample data
npm run dev        # Start development server
```

### 3. Access the Application

- **Dashboard**: http://localhost:3000/dashboard
- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register

**Demo Credentials**:
- Email: `admin@medcentric.ai`
- Password: `admin123` (admin role)
- Email: `staff@medcentric.ai`
- Password: `staff123` (staff role)

## 📝 Demo Scenarios

### Scenario 1: Low Risk (Normal Operations)
```bash
curl -X POST http://localhost:3000/api/save-snapshot \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "MED-CENTRAL-001",
    "timestamp": "2025-10-15T10:00:00Z",
    "beds_total": 100,
    "beds_free": 60,
    "doctors_on_shift": 8,
    "nurses_on_shift": 15,
    "oxygen_cylinders": 40,
    "ventilators": 8,
    "incoming_emergencies": 1,
    "aqi": 80,
    "festival": "",
    "news_summary": ""
  }'
```

**Expected**: Risk = Low, QuickCheck only, no escalation

### Scenario 2: Medium Risk (Festival + Capacity Pressure)
```bash
curl -X POST http://localhost:3000/api/save-snapshot \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "MED-CENTRAL-001",
    "timestamp": "2025-10-15T14:00:00Z",
    "beds_total": 120,
    "beds_free": 25,
    "doctors_on_shift": 6,
    "nurses_on_shift": 12,
    "oxygen_cylinders": 15,
    "ventilators": 5,
    "incoming_emergencies": 3,
    "aqi": 150,
    "festival": "Regional fair",
    "news_summary": "Large festival attendance expected"
  }'
```

**Expected**: Risk = Medium, auto-escalates to AgenticAnalysis

### Scenario 3: High Risk (Mass Casualty Incident)
```bash
curl -X POST http://localhost:3000/api/save-snapshot \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "MED-CENTRAL-001",
    "timestamp": "2025-10-15T18:30:00Z",
    "beds_total": 100,
    "beds_free": 5,
    "doctors_on_shift": 6,
    "nurses_on_shift": 10,
    "oxygen_cylinders": 3,
    "ventilators": 2,
    "incoming_emergencies": 9,
    "aqi": 250,
    "festival": "Diwali",
    "news_summary": "Multiple fatalities in highway pileup. Mass casualty incident."
  }'
```

**Expected**: Risk = High, AgenticAnalysis + webhook notifications

## 🧪 Testing Agent Endpoints

### ShiftOptimizer
```bash
curl -X POST http://localhost:3000/api/agents/shift-optimizer \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "MED-CENTRAL-001",
    "snapshot": { "beds_free": 5, "beds_total": 100, "incoming_emergencies": 9 }
  }'
```

### MedAssist (Clinical Support)
```bash
curl -X POST http://localhost:3000/api/agents/med-assist \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": "chest pain, diaphoresis, shortness of breath",
    "vitals": {
      "bp_systolic": 85,
      "heart_rate": 125,
      "respiratory_rate": 26,
      "spo2": 89
    }
  }'
```

### TransferAdvisor
```bash
curl -X POST http://localhost:3000/api/agents/transfer-advisor \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "MED-CENTRAL-001",
    "required_beds": 15,
    "specialty": "ICU"
  }'
```

### WellnessCheck
```bash
# Get wellness prompt
curl -X POST http://localhost:3000/api/agents/wellness-check \
  -H "Content-Type: application/json" \
  -d '{"action": "prompt"}'

# Log wellness score
curl -X POST http://localhost:3000/api/agents/wellness-check \
  -H "Content-Type: application/json" \
  -d '{
    "action": "log",
    "user_id": "staff_001",
    "mood_score": 7,
    "note": "Feeling good today"
  }'
```

### ReportBuilder
```bash
curl -X POST http://localhost:3000/api/agents/report-builder \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "MED-CENTRAL-001",
    "report_type": "summary"
  }'
```

## 🔄 System Workflows

### Auto-Escalation Flow
1. **Snapshot Received** → Save to `hospital_snapshots`
2. **QuickCheck Runs** → Calculate risk, capacity, triggers
3. **Risk Assessment**:
   - **Low Risk**: Store basic analysis, return
   - **Medium/High Risk**: Escalate to AgenticAnalysis
4. **AgenticAnalysis** → LLM generates detailed recommendations
5. **Store Analysis** → Save to `ai_analyses` table
6. **Webhook Trigger** (if High risk) → Send alerts
7. **Return Results** → Dashboard displays recommendations

### Risk Calculation Logic

**QuickCheck Algorithm**:
```javascript
capacity_ratio = (beds_free / beds_total) * 100
predicted_need = max(beds_total * 0.10, incoming_emergencies * 1.5)

trigger_score = 0
if (aqi >= 200) trigger_score += 2
if (festival != "") trigger_score += 1
if (news contains "accident|mass casualty|collapse") trigger_score += 3
if (incoming_emergencies >= 5) trigger_score += 1

if (capacity_ratio < 10 OR oxygen < max(5, predicted_need/2) OR trigger_score >= 3)
  → Risk = "High"
else if (capacity_ratio < 30 OR oxygen < predicted_need)
  → Risk = "Medium"
else
  → Risk = "Low"
```

**AgenticAnalysis Amplification**:
```javascript
baseline = beds_total * 0.10
amplification = {0: 1.0, 1: 1.5, 2: 2.0, 3+: 2.8}[trigger_score]
predicted_surge = baseline * amplification
```

## 📱 UI Components

### Dashboard Tabs
- **Live Analysis**: Submit snapshots, view real-time analysis
- **Alerts**: Notification panel with historical alerts
- **Historical**: Trend charts and historical data
- **Network/Hospital**: Multi-hospital comparison

### Key UI Features
- **Live Resource Cards**: Real-time bed, oxygen, ventilator status
- **Risk Banner**: Visual risk indicator with confidence score
- **Action Cards**: Top-3 prioritized recommendations with CTA buttons
- **Timeline Chart**: 6-hour prediction visualization

## 🔐 Authentication

### User Roles
- **Admin**: Full access, network view, all agent features
- **Staff**: Hospital-specific access, limited agent features

### Protected Routes
All `/dashboard/*` routes require authentication. Middleware automatically redirects to `/login` for unauthenticated users.

## 🌐 Webhook Configuration

### Slack Integration
1. Create Slack Incoming Webhook: https://api.slack.com/messaging/webhooks
2. Add `SLACK_WEBHOOK_URL` to `.env`
3. High-risk alerts automatically post to Slack channel

### Twilio SMS
1. Sign up for Twilio account
2. Add credentials to `.env`
3. Configure `TWILIO_TO_NUMBERS` (comma-separated)

### Email (Production)
Integrate with SendGrid, Mailgun, or AWS SES. Current implementation shows email structure (mock).

## 📦 Seeded Data

### Hospitals
- `MED-CENTRAL-001` - Central Medical Center (100 beds)
- `HOSP-B` - Eastside Community Hospital (80 beds)
- `HOSP-C` - Riverside Memorial Hospital (150 beds)

### Sample Snapshots
5 pre-seeded scenarios covering low, medium, and high risk situations with varied conditions (festivals, AQI, emergencies).

## 🛠️ Development

### Database Management
```bash
npm run db:studio  # Open Drizzle Studio (GUI)
npm run db:push    # Push schema changes
npm run db:seed    # Reseed sample data
```

### Testing
```bash
npm run test       # Run test suite
npm run lint       # Lint code
npm run type-check # TypeScript validation
```

## 🚨 Troubleshooting

### Common Issues

**Build Errors**: Clear Next.js cache
```bash
rm -rf .next
npm run dev
```

**Database Connection**: Verify `DATABASE_URL` in `.env`

**Webhook Not Triggering**: Check risk level is "High" and webhook URLs are configured

**API Timeout**: AgenticAnalysis may take 3-5s for LLM response. Increase timeout if needed.

## 📚 Additional Resources

- **API Reference**: See `API_REFERENCE.md`
- **Demo Payloads**: See `DEMO_PAYLOADS.json`
- **Sample Data**: See `SAMPLE_DATA.json`

## 🎓 Demo Walkthrough

1. **Login** as admin@medcentric.ai
2. **View Dashboard** - observe live resource cards
3. **Submit High-Risk Scenario** using form or JSON upload
4. **Watch Auto-Escalation** - QuickCheck → AgenticAnalysis
5. **Review Recommendations** - top-3 actions with reasoning
6. **Check Alerts Tab** - see notification log
7. **Historical Tab** - view trends over time
8. **Network Tab** (admin) - compare hospitals
9. **Test Agents** - try ShiftOptimizer, MedAssist, etc.
10. **Webhook Logs** - check Slack/SMS notifications (if configured)

## 🤝 Support

For questions or issues:
- Check `README_MEDCENTRIC.md` for original requirements
- Review `DEMO_PAYLOADS.json` for test scenarios
- Examine API responses for debugging

---

**MedCentric AI** - Powered by Emergent AI • Built with Next.js 15, Drizzle ORM, Better-Auth