# Cozi API Quick Reference

Quick lookup for common operations. See [API-REFERENCE.md](./API-REFERENCE.md) for complete documentation.

## Authentication

```bash
POST https://rest.cozi.com/api/ext/2207/auth/login
Content-Type: application/json

{"username": "user@example.com", "password": "pass", "issueRefresh": true}
```

## Get Calendar

```bash
GET https://rest.cozi.com/api/ext/2004/{accountId}/calendar/2026/1
Authorization: Bearer {token}
```

## Create Appointment with Reminder

```bash
POST https://rest.cozi.com/api/ext/2004/{accountId}/calendar/2026/1
Authorization: Bearer {token}
Content-Type: application/json

[{
  "itemType": "appointment",
  "notifyPersons": ["person-id"],
  "create": {
    "startDay": "2026-01-15",
    "reminders": [{"minutesBefore": 30}],
    "details": {
      "startTime": "14:00",
      "endTime": "15:00",
      "dateSpan": 1,
      "subject": "Meeting"
    }
  }
}]
```

## Recurring Appointment

```bash
"recurrence": {
  "rules": [{
    "frequency": "Weekly",
    "interval": 1,
    "byDay": ["MO", "WE", "FR"],
    "end": {}
  }]
}
```

## Reminder Times (minutesBefore)

- `0` - At event time
- `15` - 15 minutes
- `30` - 30 minutes  
- `60` - 1 hour
- `1440` - 1 day
- `10080` - 1 week
- `20160` - 2 weeks

## List Operations

```bash
# Get lists
GET /api/ext/2004/{accountId}/list/

# Add item
POST /api/ext/2004/{accountId}/list/{listId}/item/
{"text": "Milk"}

# Mark complete
PUT /api/ext/2004/{accountId}/list/{listId}/item/{itemId}
{"status": "complete"}
```

## Common Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ext/2207/auth/login` | POST | Authenticate |
| `/api/ext/2004/{accountId}/calendar/{year}/{month}` | GET | Get calendar |
| `/api/ext/2004/{accountId}/calendar/{year}/{month}` | POST | Create/Edit/Delete appointment |
| `/api/ext/2004/{accountId}/list/` | GET | Get all lists |
| `/api/ext/2004/{accountId}/account/person/` | GET | Get family members |
| `/api/ext/2004/{accountId}/account/` | GET | Get account info |
| `/api/ext/2004/{accountId}/subscription/` | GET | Get subscription |

## Recurrence Frequencies

- `Daily`
- `Weekly` (requires `byDay`)
- `Monthly`
- `Yearly`

## Day Codes

`MO`, `TU`, `WE`, `TH`, `FR`, `SA`, `SU`

## Status Codes

- `200` - Success
- `401` - Invalid/expired token
- `404` - Not found
- `409` - Version conflict

## Key Discoveries

✅ **Reminders** are embedded in appointments (not separate endpoint)  
✅ **Recurrence** is fully supported with flexible rules  
✅ **Notifications** can be sent to family members via `notifyPersons`  
✅ **Version control** prevents conflicts with `version` field
