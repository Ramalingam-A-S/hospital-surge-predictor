# MedCentric AI - API Reference

## Base URL
```
http://localhost:3000
```

## Authentication
The demo version uses mocked authentication stored in `sessionStorage`. No API authentication is required for the `/api/analyze` endpoint.

---

## Endpoints

### POST `/api/analyze`

Analyzes hospital snapshot data and returns risk assessment with actionable recommendations.

#### Request Headers
```
Content-Type: application/json
```

#### Request Body Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `hospital_id` | string | Yes | Unique hospital identifier |
| `timestamp` | string (ISO 8601) | Yes | Data submission timestamp |
| `beds_total` | number | Yes | Total hospital bed capacity |
| `beds_free` | number | Yes | Currently available beds |
| `expected_free_time` | string[] | No | Array of ISO timestamps for upcoming bed availability |
| `doctors_on_shift` | number | Yes | Number of doctors on duty |
| `nurses_on_shift` | number | Yes | Number of nurses on duty |
| `oxygen_cylinders` | number | Yes | Available oxygen cylinders |
| `ventilators` | number | Yes | Available ventilators |
| `key_meds` | object | No | Medications with quantities (e.g., `{"Paracetamol": 500}`) |
| `incoming_emergencies` | number | Yes | Number of incoming/expected emergency cases |
| `incident_description` | string | No | Description of current situation |
| `aqi` | number | No | Air Quality Index (0-500) |
| `festival_name` | string | No | Name of ongoing festival/event |
| `major_news_summary` | string | No | Summary of major regional events/news |

#### Example Request

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "MED-CENTRAL-001",
    "timestamp": "2024-01-15T10:00:00Z",
    "beds_total": 200,
    "beds_free": 35,
    "expected_free_time": ["2024-01-15T14:00:00Z"],
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
    "festival_name": "",
    "major_news_summary": ""
  }'
```

#### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Request success status |
| `hospital_id` | string | Echo of hospital identifier |
| `timestamp` | string | Server processing timestamp |
| `analysis` | object | Analysis results object |
| `analysis.risk` | string | Risk level: "Low", "Medium", or "High" |
| `analysis.predicted_additional_patients_next_6h` | number | Predicted patient surge count |
| `analysis.recommended_actions` | array | Array of action objects |
| `analysis.alert_message` | string | Human-readable alert summary |
| `analysis.metrics` | object | Additional metrics |

#### Action Object Schema

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | "staff", "supply", "transfer", or "advisory" |
| `detail` | string | Action description |
| `qty` | number | Quantity (optional, for staff/supply actions) |
| `urgency` | string | "Low", "Medium", or "High" |

#### Example Response (Medium Risk)

```json
{
  "success": true,
  "hospital_id": "MED-CENTRAL-001",
  "timestamp": "2024-01-15T10:05:30.123Z",
  "analysis": {
    "risk": "Medium",
    "predicted_additional_patients_next_6h": 20,
    "recommended_actions": [
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
    "alert_message": "Hospital MED-CENTRAL-001 is experiencing medium risk levels. Moderate surge expected with 20 additional patients anticipated. Monitor closely and prepare resources.",
    "metrics": {
      "occupancy_rate": 83,
      "staff_available": 40,
      "critical_supplies_status": "adequate"
    }
  }
}
```

#### Example Response (High Risk)

```json
{
  "success": true,
  "hospital_id": "MED-CENTRAL-001",
  "timestamp": "2024-01-15T22:35:10.456Z",
  "analysis": {
    "risk": "High",
    "predicted_additional_patients_next_6h": 70,
    "recommended_actions": [
      {
        "type": "staff",
        "detail": "Call in additional doctors and nurses for emergency shifts",
        "qty": 8,
        "urgency": "High"
      },
      {
        "type": "supply",
        "detail": "Order emergency oxygen cylinders",
        "qty": 20,
        "urgency": "High"
      },
      {
        "type": "transfer",
        "detail": "Prepare to transfer non-critical patients to nearby facilities",
        "urgency": "High"
      },
      {
        "type": "supply",
        "detail": "Stock up on critical medications",
        "qty": 50,
        "urgency": "High"
      },
      {
        "type": "advisory",
        "detail": "Alert administrative staff to prepare surge protocols",
        "urgency": "Medium"
      },
      {
        "type": "advisory",
        "detail": "Expedite patient discharge procedures for stable cases",
        "urgency": "High"
      }
    ],
    "alert_message": "Hospital MED-CENTRAL-001 is experiencing high risk levels. URGENT: Expected surge of 70 patients in next 6 hours. Immediate action required. Current occupancy at 90.0%.",
    "metrics": {
      "occupancy_rate": 90,
      "staff_available": 26,
      "critical_supplies_status": "low"
    }
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Failed to analyze hospital data",
  "message": "Invalid input format"
}
```

**HTTP Status**: 500 Internal Server Error

---

## Risk Calculation Algorithm

### Occupancy-Based Risk
```
occupancy_rate = ((beds_total - beds_free) / beds_total) * 100

if occupancy_rate > 85%: risk = High
else if occupancy_rate > 70%: risk = Medium
else: risk = Low
```

### Surge Prediction
```
base_prediction = incoming_emergencies * multiplier

multipliers:
- High risk: 2.5x
- Medium risk: 2.0x
- Low risk: 1.5x

Additional factors:
- Festival/Event: +10 patients
- Major incident (accident/disaster): +15 patients
```

### Risk Escalation Factors

| Factor | Threshold | Effect |
|--------|-----------|--------|
| Occupancy | >85% | High Risk |
| Occupancy | >70% | Medium Risk |
| Incoming Emergencies | >20 | High Risk |
| Incoming Emergencies | >10 | Medium Risk |
| AQI | >300 | High Risk |
| Staff Ratio | <15 | Risk +1 level |
| Oxygen Cylinders | <30 | Supply alert |
| Ventilators | <10 | Equipment alert |
| Festival/Event | Present | Risk +1 level |
| Major Incident | Keywords detected | High Risk |

---

## Action Types

### Staff Actions
- **Type**: `staff`
- **Purpose**: Personnel allocation
- **Examples**: 
  - Call in additional doctors/nurses
  - Activate on-call staff
  - Request temporary staff support

### Supply Actions
- **Type**: `supply`
- **Purpose**: Medical supply management
- **Examples**:
  - Order oxygen cylinders
  - Replenish medications
  - Request equipment

### Transfer Actions
- **Type**: `transfer`
- **Purpose**: Patient movement coordination
- **Examples**:
  - Transfer non-critical patients
  - Coordinate with nearby facilities
  - Prepare for patient redistribution

### Advisory Actions
- **Type**: `advisory`
- **Purpose**: Protocol and procedural guidance
- **Examples**:
  - Activate surge protocols
  - Expedite discharge procedures
  - Alert administrative staff

---

## Testing with cURL

### Test Low Risk Scenario
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "TEST-001",
    "timestamp": "2024-01-15T10:00:00Z",
    "beds_total": 200,
    "beds_free": 80,
    "doctors_on_shift": 15,
    "nurses_on_shift": 35,
    "oxygen_cylinders": 60,
    "ventilators": 20,
    "incoming_emergencies": 5
  }'
```

### Test High Risk Scenario
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "TEST-001",
    "timestamp": "2024-01-15T22:00:00Z",
    "beds_total": 200,
    "beds_free": 20,
    "doctors_on_shift": 8,
    "nurses_on_shift": 18,
    "oxygen_cylinders": 25,
    "ventilators": 8,
    "incoming_emergencies": 28,
    "aqi": 320,
    "major_news_summary": "Major accident reported"
  }'
```

---

## Rate Limiting

**Demo Version**: No rate limiting implemented.

**Production Considerations**: 
- Implement rate limiting (e.g., 100 requests/minute)
- Add API authentication
- Log all requests for audit

---

## Data Validation

The API performs basic validation:
- Required fields must be present
- Numeric fields must be valid numbers
- JSON parsing for `key_meds` object
- ISO timestamp format for time fields

Invalid data returns a 500 error with details in the response message.

---

## Changelog

### v1.0.0 (Demo)
- Initial implementation
- Deterministic risk calculation
- Six action types supported
- Metrics tracking included
- JSON export compatible

---

## Support

For API issues or integration questions, refer to:
- Main documentation: `README_MEDCENTRIC.md`
- Sample data: `SAMPLE_DATA.json`
- Source code: `src/app/api/analyze/route.ts