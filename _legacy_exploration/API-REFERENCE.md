# Cozi API Complete Reference

> **⚠️ UNOFFICIAL DOCUMENTATION**
> 
> This is reverse-engineered documentation based on:
> - [py-cozi](https://github.com/Wetzel402/py-cozi) Python library analysis
> - Browser traffic capture from Cozi web application
> - Systematic API endpoint testing
>
> **Last Updated:** January 2026  
> **API Version:** 2004 (primary), 2207 (auth)

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Calendar & Appointments](#calendar--appointments)
4. [Reminders](#reminders)
5. [Recurring Appointments](#recurring-appointments)
6. [Lists & Items](#lists--items)
7. [Persons & Family](#persons--family)
8. [Account](#account)
9. [Subscriptions](#subscriptions)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)
12. [Best Practices](#best-practices)

---

## Overview

### Base URLs
- **Production:** `https://rest.cozi.com`
- **API Versions:**
  - `/api/ext/2207` - Authentication endpoints
  - `/api/ext/2004` - All other endpoints

### Common Patterns
- All requests require `Authorization: Bearer {token}` header
- Dates use ISO 8601 format: `YYYY-MM-DD`
- Times use 24-hour format: `HH:MM`
- All timestamps in UTC
- Optimistic locking via `version` field

---

## Authentication

### Login
**Endpoint:** `POST /api/ext/2207/auth/login`

**Request:**
```json
{
  "username": "user@example.com",
  "password": "password123",
  "issueRefresh": true
}
```

**Response:**
```json
{
  "accountId": "account-uuid",
  "accountPersonId": "person-uuid",
  "accessToken": "eyJ...",
  "expiresIn": 86400
}
```

**Response Fields:**
- `accountId`: Account identifier (required for all API calls)
- `accountPersonId`: Current user's person ID
- `accessToken`: JWT token for Authorization header
- `expiresIn`: Token expiration in seconds

**Usage:**
```
Authorization: Bearer {accessToken}
```

---

## Calendar & Appointments

### Get Calendar
**Endpoint:** `GET /api/ext/2004/{accountId}/calendar/{year}/{month}`

**Parameters:**
- `year`: 4-digit year (e.g., 2026)
- `month`: Month number 1-12 (not zero-padded)
- `apikey` (optional query param): Web client key

**Response:**
```json
{
  "startDate": "2026-01-01",
  "endDate": "2026-01-31",
  "items": [
    {
      "id": "appt-uuid",
      "subject": "Doctor Appointment",
      "startYear": 2026,
      "startMonth": 1,
      "startDay": 15,
      "start": "09:00",
      "end": "10:00",
      "dateSpan": 1,
      "location": "123 Main St",
      "notes": "Bring insurance card",
      "attendees": ["person-uuid-1"],
      "reminders": [
        {"minutesBefore": 60},
        {"minutesBefore": 1440}
      ],
      "version": 1,
      "recurrence": null
    }
  ],
  "days": {
    "2026-01-15": [{"id": "appt-uuid"}]
  },
  "appointmentsById": {
    "appt-uuid": { /* full appointment */ }
  },
  "birthdaysById": {},
  "holidaysById": {},
  "recurrenceParentsById": {}
}
```

### Create Appointment
**Endpoint:** `POST /api/ext/2004/{accountId}/calendar/{year}/{month}`

**Simple Appointment:**
```json
[{
  "itemType": "appointment",
  "create": {
    "startDay": "2026-01-15",
    "details": {
      "startTime": "09:00",
      "endTime": "10:00",
      "dateSpan": 1,
      "subject": "Meeting",
      "location": "Conference Room",
      "notes": "Bring laptop",
      "attendeeSet": ["person-uuid-1", "person-uuid-2"]
    }
  }
}]
```

**With Reminders & Notifications:**
```json
[{
  "itemType": "appointment",
  "notifyPersons": ["person-uuid-1"],
  "create": {
    "startDay": "2026-01-15",
    "reminders": [
      {"minutesBefore": 30},
      {"minutesBefore": 1440}
    ],
    "details": {
      "startTime": "09:00",
      "endTime": "10:00",
      "dateSpan": 1,
      "subject": "Important Meeting"
    }
  }
}]
```

**Recurring Appointment:**
```json
[{
  "itemType": "appointment",
  "notifyPersons": ["person-uuid-1"],
  "create": {
    "startDay": "2026-01-15",
    "reminders": [{"minutesBefore": 30}],
    "recurrence": {
      "rules": [{
        "interval": 1,
        "frequency": "Weekly",
        "byDay": ["MO", "WE", "FR"],
        "end": {}
      }]
    },
    "details": {
      "startTime": "14:00",
      "endTime": "15:00",
      "dateSpan": 1,
      "subject": "Team Standup"
    }
  }
}]
```

### Edit Appointment
**Endpoint:** `POST /api/ext/2004/{accountId}/calendar/{year}/{month}`

```json
[{
  "itemType": "appointment",
  "edit": {
    "id": "appt-uuid",
    "version": 1,
    "startDay": "2026-01-15",
    "reminders": [{"minutesBefore": 60}],
    "details": {
      "startTime": "10:00",
      "endTime": "11:00",
      "dateSpan": 1,
      "subject": "Updated Meeting",
      "location": "New Location",
      "notes": "Updated notes"
    }
  }
}]
```

### Delete Appointment
**Endpoint:** `POST /api/ext/2004/{accountId}/calendar/{year}/{month}`

**Single Appointment:**
```json
[{
  "itemType": "appointment",
  "delete": {
    "id": "appt-uuid"
  }
}]
```

**Recurring Appointment:**
```json
[{
  "itemType": "appointment",
  "delete": {
    "id": "appt-uuid",
    "version": 1502
  },
  "selectedDay": "2026-01-15",
  "extent": "forward"
}]
```

**Extent Options:**
- `"single"` - Delete only this occurrence
- `"forward"` - Delete this and all future occurrences
- `"all"` - Delete all occurrences

---

## Reminders

### Reminder Structure
Reminders are embedded in appointment objects, not separate entities.

```json
{
  "reminders": [
    {"minutesBefore": 0},      // At event time
    {"minutesBefore": 15},     // 15 minutes before
    {"minutesBefore": 30},     // 30 minutes before
    {"minutesBefore": 60},     // 1 hour before
    {"minutesBefore": 1440},   // 1 day before (24 hours)
    {"minutesBefore": 2880},   // 2 days before
    {"minutesBefore": 10080},  // 1 week before
    {"minutesBefore": 20160}   // 2 weeks before
  ]
}
```

### Notification to Family Members
Use `notifyPersons` to send notifications when creating/editing:

```json
{
  "notifyPersons": ["person-uuid-1", "person-uuid-2"]
}
```

Or with indices (for recurring event modifications):
```json
{
  "notifyPersons": {
    "person-uuid-1": 0,
    "person-uuid-2": 1
  }
}
```

**CRITICAL Requirements for Notifications**:
1. **API Key Required**: MUST include `?apikey=coziwc|v249_production` in the URL or notifications will NOT be sent
2. **Include Creator**: The `notifyPersons` array should include the person creating the appointment (yourself)
3. **Notifiable Users Only**: Only users where `notifiable: true` AND `accountPersonType: "user"` can receive notifications
4. **Reminder Limit**: Maximum 3 reminders per appointment

---

## Recurring Appointments

### Recurrence Rules

**Daily:**
```json
{
  "recurrence": {
    "rules": [{
      "frequency": "Daily",
      "interval": 1,
      "end": {}
    }]
  }
}
```

**Weekly (specific days):**
```json
{
  "recurrence": {
    "rules": [{
      "frequency": "Weekly",
      "interval": 1,
      "byDay": ["MO", "WE", "FR"],
      "end": {}
    }]
  }
}
```

**Every 2 weeks:**
```json
{
  "recurrence": {
    "rules": [{
      "frequency": "Weekly",
      "interval": 2,
      "byDay": ["TH"],
      "end": {}
    }]
  }
}
```

**Monthly:**
```json
{
  "recurrence": {
    "rules": [{
      "frequency": "Monthly",
      "interval": 1,
      "end": {}
    }]
  }
}
```

**With end date:**
```json
{
  "recurrence": {
    "rules": [{
      "frequency": "Weekly",
      "interval": 1,
      "byDay": ["MO"],
      "end": {
        "until": "2026-12-31"
      }
    }]
  }
}
```

**With occurrence count:**
```json
{
  "recurrence": {
    "rules": [{
      "frequency": "Daily",
      "interval": 1,
      "end": {
        "count": 30
      }
    }]
  }
}
```

### Day Codes
- `MO` - Monday
- `TU` - Tuesday
- `WE` - Wednesday
- `TH` - Thursday
- `FR` - Friday
- `SA` - Saturday
- `SU` - Sunday

---

## Lists & Items

### Get All Lists
**Endpoint:** `GET /api/ext/2004/{accountId}/list/`

**Response:**
```json
[
  {
    "listId": "list-uuid",
    "title": "Grocery Shopping",
    "listType": "shopping",
    "items": [
      {
        "itemId": "item-uuid",
        "text": "Milk",
        "status": "incomplete",
        "version": 1
      }
    ],
    "version": 1
  }
]
```

### Get Single List
**Endpoint:** `GET /api/ext/2004/{accountId}/list/{listId}`

### Add Item to List
**Endpoint:** `POST /api/ext/2004/{accountId}/list/{listId}/item/`

```json
{
  "text": "Bread"
}
```

### Edit Item
**Endpoint:** `PUT /api/ext/2004/{accountId}/list/{listId}/item/{itemId}`

```json
{
  "text": "Whole Wheat Bread"
}
```

### Mark Item Complete/Incomplete
**Endpoint:** `PUT /api/ext/2004/{accountId}/list/{listId}/item/{itemId}`

```json
{
  "status": "complete"
}
```

Status values: `"complete"` or `"incomplete"`

### Delete Item
**Endpoint:** `DELETE /api/ext/2004/{accountId}/list/{listId}/item/{itemId}`

---

## Persons & Family

### Get Family Members
**Endpoint:** `GET /api/ext/2004/{accountId}/account/person/`

**Response:**
```json
[
  {
    "personId": "person-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "colorIndex": 1,
    "notifiableFeatures": {
      "calendarItemReminder": true,
      "calendarItemNotification": true
    }
  }
]
```

---

## Account

### Get Account Details
**Endpoint:** `GET /api/ext/2004/{accountId}/account/`

**Response:**
```json
{
  "accountId": "account-uuid",
  "name": "Doe Family",
  "cobrand": null,
  "creationDate": "2020-01-01T00:00:00Z",
  "colorIndex": 0,
  "timezone": "America/Los_Angeles",
  "regionDesignator": "US",
  "languageDesignator": "en",
  "analyticsOn": true,
  "signupSource": "web",
  "photo": null
}
```

---

## Subscriptions

### Get Subscription Info
**Endpoint:** `GET /api/ext/2004/{accountId}/subscription/`

**Response:**
```json
[
  {
    "subscriptionId": "sub-uuid",
    "subscriptionStatus": "active",
    "subscriptionProduct": "cozi_gold_stripe_yearly_39",
    "productProvider": "stripe",
    "subscriptionStartDate": "2023-11-01T01:53:48",
    "subscriptionEndDate": null,
    "nextPaymentDate": "2026-11-01T01:53:48",
    "subscriptionAmount": 3900,
    "inTrial": false,
    "renewing": true,
    "entitlementId": "cozi_gold",
    "paymentMethod": {
      "brand": "Visa",
      "lastFour": "1234",
      "expMonth": 12,
      "expYear": 2028
    }
  }
]
```

---

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid appointment date"
  }
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (version mismatch)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Rate Limiting

- No official rate limits documented
- Recommended: Max 10 requests per second
- Use exponential backoff for retries
- Cache calendar data when possible

---

## Best Practices

### 1. Version Management
Always include `version` field when editing/deleting to prevent conflicts:
```json
{
  "edit": {
    "id": "appt-uuid",
    "version": 1,
    ...
  }
}
```

### 2. Date Handling
- Always use UTC for timestamps
- Format dates as `YYYY-MM-DD`
- Format times as `HH:MM` (24-hour)
- Use correct year/month in API path

### 3. Reminders
- Multiple reminders are supported
- Common values: 0, 15, 30, 60, 1440 (minutes)
- Users can customize reminder times

### 4. Recurring Events
- Use `extent` carefully when editing/deleting
- Test with single occurrences first
- `byDay` is required for Weekly frequency

### 5. Error Handling
- Always check `version` mismatches (409)
- Refresh token on 401 errors
- Implement exponential backoff for 429

### 6. Caching
- Calendar data: Cache for 5-10 minutes
- Account/Person data: Cache for 1 hour
- Lists: Real-time updates recommended

---

## Examples

### Complete Workflow Example

```typescript
// 1. Authenticate
const auth = await fetch('https://rest.cozi.com/api/ext/2207/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    username: 'user@example.com',
    password: 'password',
    issueRefresh: true
  })
});
const { accessToken, accountId } = await auth.json();

// 2. Create appointment with reminders
const create = await fetch(
  `https://rest.cozi.com/api/ext/2004/${accountId}/calendar/2026/1`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{
      itemType: 'appointment',
      notifyPersons: ['person-id'],
      create: {
        startDay: '2026-01-15',
        reminders: [
          { minutesBefore: 30 },
          { minutesBefore: 1440 }
        ],
        details: {
          startTime: '14:00',
          endTime: '15:00',
          dateSpan: 1,
          subject: 'Team Meeting',
          location: 'Conference Room'
        }
      }
    }])
  }
);

// 3. Get calendar
const calendar = await fetch(
  `https://rest.cozi.com/api/ext/2004/${accountId}/calendar/2026/1`,
  {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  }
);
const data = await calendar.json();
```

---

## Changelog

### January 2026
- Initial comprehensive documentation
- Discovered reminders structure (embedded in appointments)
- Documented recurrence patterns
- Added notification system details
- Confirmed subscription endpoint

---

## Contributing

This documentation is community-maintained. If you discover new endpoints or corrections, please contribute!

## Legal Notice

This is unofficial documentation for educational purposes. Cozi does not provide a public API. Use at your own risk. Not affiliated with or endorsed by Cozi, Inc.
