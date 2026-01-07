# Cozi API Documentation

> **Note:** This is UNOFFICIAL documentation based on reverse engineering from the [py-cozi](https://github.com/Wetzel402/py-cozi) library and comprehensive API exploration including browser traffic analysis.
>
> **Last Updated:** January 2026
>
> **Status:** Complete coverage of Lists, Calendar/Appointments (with Reminders & Recurrence), Persons, Account, and Subscriptions

## Table of Contents

- [Authentication](#authentication)
- [Calendar & Appointments](#calendar--appointments)
  - [Get Calendar](#get-calendar)
  - [Create Appointment](#create-appointment)
  - [Edit Appointment](#edit-appointment)
  - [Delete Appointment](#delete-appointment)
  - [Reminders](#reminders)
  - [Recurrence](#recurrence)
- [Lists & Items](#lists--items)
- [Persons & Family](#persons--family)
- [Account](#account)
- [Subscriptions](#subscriptions)
- [Error Handling](#error-handling)

## Discovered Endpoints

### ✅ Working Endpoints

#### Lists
- **GET** `/api/ext/2004/{accountId}/list/` - Get all lists
- **GET** `/api/ext/2004/{accountId}/list/{listId}` - Get specific list
- **POST** `/api/ext/2004/{accountId}/list/{listId}/item/` - Add item to list
- **PUT** `/api/ext/2004/{accountId}/list/{listId}/item/{itemId}` - Edit/mark item
- **DELETE** `/api/ext/2004/{accountId}/list/{listId}/item/{itemId}` - Remove item

#### Calendar / Appointments
- **GET** `/api/ext/2004/{accountId}/calendar/{year}/{month}` - Get calendar for month
- **POST** `/api/ext/2004/{accountId}/calendar/{year}/{month}` - Create/Edit/Delete appointments

#### Account
- **GET** `/api/ext/2004/{accountId}/account/` - Get account details
  - Returns: accountId, name, timezone, etc.

### Authentication
- **POST** `/api/ext/2207/auth/login` - Login with username/password
  - Returns: `accessToken`, `accountId`, `expiresIn`
  - Token used as: `Authorization: Bearer {accessToken}`

## Calendar & Appointments

### Get Calendar
**Endpoint:** `GET /api/ext/2004/{accountId}/calendar/{year}/{month}`

**Query Parameters:**
- `apikey` (optional): API key for web client (e.g., `coziwc|v249_production`)

**Response Structure:**
```json
{
  "startDate": "2026-01-01",
  "endDate": "2026-01-31",
  "items": [
    {
      "id": "appointment-id",
      "subject": "Doctor Appointment",
      "startYear": 2026,
      "startMonth": 1,
      "startDay": 15,
      "start": "09:00",
      "end": "10:00",
      "dateSpan": 1,
      "location": "Medical Center",
      "notes": "Bring insurance card",
      "attendees": ["person-id-1", "person-id-2"],
      "reminders": [
        {"minutesBefore": 60},
        {"minutesBefore": 1440}
      ],
      "version": 1
    }
  ],
  "days": {
    "2026-01-15": [
      {"id": "appointment-id"}
    ]
  },
  "appointmentsById": {
    "appointment-id": { /* full appointment object */ }
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
[
  {
    "itemType": "appointment",
    "create": {
      "startDay": "2026-01-15",
      "details": {
        "startTime": "09:00",
        "endTime": "10:00",
        "dateSpan": 1,
        "attendeeSet": ["person-id-1"],
        "location": "Meeting Room",
        "notes": "Bring laptop",
        "subject": "Team Meeting"
      }
    }
  }
]
```

**Appointment with Reminders:**
```json
[
  {
    "itemType": "appointment",
    "notifyPersons": ["person-id-1", "person-id-2"],
    "create": {
      "startDay": "2026-01-15",
      "reminders": [
        {"minutesBefore": 30},
        {"minutesBefore": 1440},
        {"minutesBefore": 0}
      ],
      "details": {
        "startTime": "09:00",
        "endTime": "10:00",
        "dateSpan": 1,
        "location": "Meeting Room",
        "notes": "Important meeting",
        "subject": "Team Meeting"
      }
    }
  }
]
```

**Recurring Appointment:**
```json
[
  {
    "itemType": "appointment",
    "notifyPersons": ["person-id-1"],
    "create": {
      "startDay": "2026-01-15",
      "reminders": [{"minutesBefore": 30}],
      "recurrence": {
        "rules": [
          {
            "interval": 1,
            "frequency": "Weekly",
            "byDay": ["MO", "WE", "FR"],
            "end": {}
          }
        ]
      },
      "details": {
        "startTime": "14:00",
        "endTime": "15:00",
        "dateSpan": 1,
        "subject": "Daily Standup"
      }
    }
  }
]
```

**Field Descriptions:**
- `startDay`: Date in "YYYY-MM-DD" format
- `startTime`/`endTime`: Time in "HH:MM" format (24-hour)
- `dateSpan`: Number of days appointment spans (1 for single day)
- `attendeeSet`: Array of person IDs who are attending
- `notifyPersons`: Array of person IDs to notify about this appointment
- `reminders`: Array of reminder objects with `minutesBefore`
  - `0` = At event time
  - `30` = 30 minutes before
  - `1440` = 1 day before (24 hours)
  - `10080` = 1 week before
  - `20160` = 2 weeks before
- `recurrence`: Object defining recurring pattern
  - `frequency`: "Daily", "Weekly", "Monthly", "Yearly"
  - `interval`: Repeat every N periods (e.g., 2 for every 2 weeks)
  - `byDay`: Days of week ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]
  - `end`: Empty object for no end, or `{"until": "YYYY-MM-DD"}` or `{"count": 10}`

### Edit Appointment
**Endpoint:** `POST /api/ext/2004/{accountId}/calendar/{year}/{month}`

**Edit Single Appointment:**
```json
[
  {
    "itemType": "appointment",
    "edit": {
      "id": "appointment-id",
      "version": 1,
      "startDay": "2026-01-15",
      "reminders": [
        {"minutesBefore": 60},
        {"minutesBefore": 1440}
      ],
      "details": {
        "startTime": "10:00",
        "endTime": "11:00",
        "dateSpan": 1,
        "attendeeSet": ["person-id-1"],
        "location": "Updated Location",
        "notes": "Updated notes",
        "subject": "Updated Subject"
      }
    }
  }
]
```

**Edit Recurring Appointment:**
```json
[
  {
    "itemType": "appointment",
    "selectedDay": "2026-01-15",
    "extent": "forward",
    "notifyPersons": {"person-id-1": 0},
    "delete": {
      "id": "old-recurrence-id",
      "version": 1502
    }
  }
]
```

**Notes:**
- `version`: Must match current version (for optimistic locking)
- `extent`: For recurring events:
  - `"single"` = Edit only this occurrence
  - `"forward"` = Edit this and all future occurrences
  - `"all"` = Edit all occurrences
- `selectedDay`: Required when editing recurring events

### Delete Appointment
**Endpoint:** `POST /api/ext/2004/{accountId}/calendar/{year}/{month}`

**Payload:**
```json
[
  {
    "itemType": "appointment",
    "delete": {
      "id": "appointment-id"
    }
  }
]
```

**Note:** All appointment mutations (create/edit/delete) use POST to the same calendar endpoint with different payload structures.

## API Patterns

### Common Patterns
1. **Authentication:** All requests require `Authorization: Bearer {token}` header
2. **Account ID:** Most endpoints require account ID in path
3. **Version:** API uses `/api/ext/2004/` for most operations, `/api/ext/2207/` for auth
4. **Calendar Operations:** Single endpoint handles GET (retrieve), POST (create/edit/delete)

### Error Handling
- 401: Authentication failed
- 403: Forbidden (permission issue)
- 404: Resource not found
- 200/201: Success

## Not Found / Unsupported Endpoints

The following endpoints were tested but returned 404:
- `/api/ext/2004/{accountId}/profile/`
- `/api/ext/2004/{accountId}/settings/`
- `/api/ext/2004/{accountId}/family/`
- `/api/ext/2004/{accountId}/person/`
- `/api/ext/2004/{accountId}/message/`
- `/api/ext/2004/{accountId}/journal/`
- `/api/ext/2004/{accountId}/recipe/`
- `/api/ext/2004/{accountId}/contact/`
- `/api/ext/2004/{accountId}/reminder/`

## Implementation Notes

### Date/Time Handling
- Calendar is fetched by month (year/month required)
- Dates use ISO format for day: "YYYY-MM-DD"
- Times use 24-hour format: "HH:MM"
- Separate fields for year/month/day in response objects

### Person/Attendee IDs
- Attendees are referenced by person IDs
- Person endpoint exists: `/api/ext/2004/{accountId}/account/person/` (from py-cozi)
- Multiple attendees can be assigned to appointments

### Recurrence
- `recurrenceParentsById` in calendar response suggests recurrence support
- Implementation details not yet discovered

## References

- [py-cozi Python Library](https://github.com/Wetzel402/py-cozi) - Source of API patterns
- [hass-cozi](https://github.com/Wetzel402/hass-cozi) - Home Assistant integration using py-cozi
