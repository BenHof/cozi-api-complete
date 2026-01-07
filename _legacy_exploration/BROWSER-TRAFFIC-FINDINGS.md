# Browser Traffic Capture Findings

## 🎉 New Endpoints Discovered from Browser Traffic

Based on the Puppeteer capture session, we discovered several new endpoints:

### ✅ **Reminders ARE in the API!**
- **Finding**: POST requests included reminder arrays
- **Location**: Reminders are embedded in appointment/calendar POST requests
- **Structure**: When creating/editing appointments, reminders are included as an array field
- **This explains why**: We didn't find a separate `/reminder/` endpoint - they're part of the appointment data structure!

### ✅ **Recipe/Food API** 
- **Endpoint Pattern**: `/food/recipe`
- **Methods**: POST (create recipe)
- **Features**: Includes photo upload capability
- **This is NEW** - not in py-cozi library

### ✅ **Calendar Search**
- **Functionality**: Calendar search endpoint exists
- **Use case**: Search appointments by keywords

### ✅ **Config/Settings Endpoints**
- Multiple endpoints for:
  - User configuration
  - Account settings
  - Subscription management (already discovered)

## Key Insights

### 1. Reminders Structure
Reminders are NOT separate entities. They are properties on appointments, likely in this format:
```json
{
  "subject": "Doctor Appointment",
  "startDay": "2026-01-15",
  "details": {
    "startTime": "09:00",
    "endTime": "10:00",
    "reminders": [
      {
        "type": "email",
        "minutesBefore": 15
      },
      {
        "type": "push",
        "minutesBefore": 60
      }
    ],
    ...
  }
}
```

### 2. Recipe API Structure
```
POST /food/recipe/
{
  "title": "...",
  "ingredients": [...],
  "instructions": "...",
  "photo": "..." // Base64 or URL
}
```

### 3. Full API Endpoint List

**Authentication:**
- POST `/api/ext/2207/auth/login`

**Calendar/Appointments:**
- GET `/api/ext/2004/{accountId}/calendar/{year}/{month}`
- POST `/api/ext/2004/{accountId}/calendar/{year}/{month}` (create/edit/delete)
- Reminders are embedded in appointment data

**Lists:**
- GET `/api/ext/2004/{accountId}/list/`
- GET `/api/ext/2004/{accountId}/list/{listId}`
- POST `/api/ext/2004/{accountId}/list/{listId}/item/`
- PUT `/api/ext/2004/{accountId}/list/{listId}/item/{itemId}`
- DELETE `/api/ext/2004/{accountId}/list/{listId}/item/{itemId}`

**Recipes/Food:**
- POST `/food/recipe/` (NEW!)
- Photo upload capability

**Account:**
- GET `/api/ext/2004/{accountId}/account/`
- GET `/api/ext/2004/{accountId}/account/person/`

**Subscriptions:**
- GET `/api/ext/2004/{accountId}/subscription/`

**Search:**
- Calendar search endpoint (path TBD - need to review captured data)

## Next Steps

1. **Extract full endpoint details** from the captured JSON (if saved)
2. **Test reminder structure** by creating an appointment with reminders
3. **Document recipe API** endpoints
4. **Update API documentation** with new findings

## Important Discovery

**Reminders are NOT a separate endpoint!** They're fields on appointment objects. This is why:
- py-cozi doesn't have a reminder implementation
- Our endpoint scans found nothing
- They appear in the appointment POST/PUT requests

To support reminders in the client library, we just need to:
1. Add `reminders` field to `CoziEvent`/`CoziAppointment` type
2. Include reminders array in create/edit requests
3. Parse reminders from GET responses
