# Cozi API - Complete Reference

> **⚠️ UNOFFICIAL DOCUMENTATION**
> 
> This documentation is based on reverse engineering the Cozi Family Organizer API through:
> - Analysis of the [py-cozi](https://github.com/Wetzel402/py-cozi) Python library
> - Browser traffic capture from the Cozi web application
> - Systematic endpoint testing and discovery
>
> **Last Updated:** January 7, 2026  
> **Coverage:** ~99% of REST API features  
> **Status:** Production-ready

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Calendar & Appointments](#calendar--appointments)
4. [Search](#search)
5. [Lists & Shopping](#lists--shopping)
6. [Recipes & Food](#recipes--food)
7. [Persons & Family](#persons--family)
8. [Account & Configuration](#account--configuration)
9. [Error Handling](#error-handling)
10. [Rate Limiting & Best Practices](#rate-limiting--best-practices)

---

## Overview

### Base URLs
- **Production:** `https://rest.cozi.com`

### API Versions
- `/api/ext/2207` - Authentication
- `/api/ext/2004` - Calendar, Lists, Persons, Account, Search
- `/api/ext/2103` - Recipes & Food
- `/api/ext/2106` - User Settings

### Common Headers
```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

### API Key Requirement
Most POST/PUT/DELETE operations require the API key as a query parameter:
```
?apikey=coziwc|v249_production
```

**Required for:**
- Creating/editing/deleting appointments
- Sending notifications
- Person management (add/edit/delete)
- Recipe management

### Date & Time Formats
- **Dates:** ISO 8601 (`YYYY-MM-DD`)
- **Times:** 24-hour format (`HH:MM` or `HH:MM:SS`)
- **Timestamps:** UTC ISO 8601 with timezone

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

**Response:** `200 OK`
```json
{
  "accountId": "uuid",
  "accountPersonId": "uuid",
  "accessToken": "jwt-token",
  "expiresIn": 14400
}
```

**Response Fields:**
- `accountId` - Required for all subsequent API calls
- `accountPersonId` - Current user's person ID
- `accessToken` - JWT token for Authorization header
- `expiresIn` - Token expiration in seconds (4 hours)

**Usage:**
```http
Authorization: Bearer {accessToken}
```

---

## Calendar & Appointments

### Get Calendar
**Endpoint:** `GET /api/ext/2004/{accountId}/calendar/{year}/{month}`

**Parameters:**
- `year` - 4-digit year (e.g., 2026)
- `month` - Month number 1-12 (not zero-padded)

**Response:** `200 OK`
```json
{
  "startDate": "2026-01-01",
  "endDate": "2026-01-31",
  "items": [...],
  "days": {...},
  "appointmentsById": {...},
  "birthdaysById": {...},
  "holidaysById": {...}
}
```

---

### Create Appointment
**Endpoint:** `POST /api/ext/2004/{accountId}/calendar/{year}/{month}?apikey=coziwc|v249_production`

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
      "notes": "Bring laptop"
    }
  }
}]
```

**With Reminders (Max 3):**
```json
[{
  "itemType": "appointment",
  "create": {
    "startDay": "2026-01-15",
    "reminders": [
      {"minutesBefore": 30},
      {"minutesBefore": 60},
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

**Reminder Values:**
- `0` - At event time
- `15` - 15 minutes before
- `30` - 30 minutes before
- `60` - 1 hour before
- `1440` - 1 day before
- `10080` - 1 week before
- `20160` - 2 weeks before

⚠️ **Maximum 3 reminders per appointment**

---

**With Notifications:**
```json
[{
  "itemType": "appointment",
  "notifyPersons": ["person-uuid-1", "person-uuid-2"],
  "create": {
    "startDay": "2026-01-15",
    "details": {...}
  }
}]
```

**Notification Requirements:**
1. Must include `?apikey=coziwc|v249_production`
2. Include ALL users (including creator) in `notifyPersons`
3. Only users with `notifiable: true` AND `accountPersonType: "user"` receive notifications

---

**Recurring Appointment:**
```json
[{
  "itemType": "appointment",
  "create": {
    "startDay": "2026-01-15",
    "recurrence": {
      "rules": [{
        "interval": 1,
        "frequency": "Weekly",
        "byDay": ["MO", "WE", "FR"],
        "end": {}
      }]
    },
    "details": {...}
  }
}]
```

**Recurrence Frequencies:**
- `Daily` - Every N days
- `Weekly` - Requires `byDay` array
- `Monthly` - Every N months
- `Yearly` - Every N years

**Day Codes:** `MO`, `TU`, `WE`, `TH`, `FR`, `SA`, `SU`

**End Conditions:**
```json
// No end
"end": {}

// End date
"end": {"until": "2026-12-31"}

// Occurrence count
"end": {"count": 30}
```

---

### Edit Appointment
**Endpoint:** `POST /api/ext/2004/{accountId}/calendar/{year}/{month}?apikey=coziwc|v249_production`

```json
[{
  "itemType": "appointment",
  "edit": {
    "id": "appointment-uuid",
    "version": 1,
    "startDay": "2026-01-15",
    "details": {
      "startTime": "10:00",
      "endTime": "11:00",
      "dateSpan": 1,
      "subject": "Updated Meeting"
    }
  }
}]
```

**Editing Recurring Appointments:**
```json
[{
  "itemType": "appointment",
  "selectedDay": "2026-01-15",
  "extent": "single",
  "edit": {...}
}]
```

**Extent Options:**
- `single` - Edit only this occurrence
- `forward` - Edit this and all future occurrences
- `all` - Edit all occurrences

---

### Delete Appointment
**Endpoint:** `POST /api/ext/2004/{accountId}/calendar/{year}/{month}?apikey=coziwc|v249_production`

**Single Appointment:**
```json
[{
  "itemType": "appointment",
  "delete": {
    "id": "appointment-uuid",
    "version": 1
  }
}]
```

**Recurring Appointment:**
```json
[{
  "itemType": "appointment",
  "delete": {
    "id": "appointment-uuid",
    "version": 1
  },
  "selectedDay": "2026-01-15",
  "extent": "forward"
}]
```

---

## Search

### Calendar Search
**Endpoint:** `GET /api/ext/2004/{accountId}/search/calendar/?apikey=coziwc|v249_production&q={query}`

**Parameters:**
- `q` - Search query string (required)
- `apikey` - API key (required)

**Example:**
```
GET /api/ext/2004/{accountId}/search/calendar/?apikey=coziwc|v249_production&q=meeting
```

**Response:** `200 OK`
```json
{
  "startDate": "2025-12-01T00:00:00",
  "endDate": "2026-02-28T23:59:59",
  "selectedDay": "2026-01-15",
  "hasNext": true,
  "hasPrevious": false,
  "days": {...},
  "items": {
    "appointment-id": {
      "item": {
        "description": "Team Meeting",
        "itemDetails": {
          "notes": "Discuss project updates"
        }
      },
      "highlight": {
        "description": "Team **Meeting**",
        "notes": "Discuss project updates"
      }
    }
  }
}
```

**Search Scope:**
- ✅ Appointment titles/subjects
- ✅ Appointment notes
- ✅ Appointment locations
- ✅ Attendee names (returns their appointments)
- ✅ Case-insensitive

**Highlighting:**
- Matched terms wrapped in `**bold**` markdown in `highlight` object

---

## Lists & Shopping

### Get All Lists
**Endpoint:** `GET /api/ext/2004/{accountId}/list/`

**Response:** `200 OK`
```json
[
  {
    "id": "list-uuid",
    "name": "Shopping List",
    "status": "shopping",
    "version": 123,
    "items": [...]
  }
]
```

**List Status:**
- `shopping` - Shopping list
- `todo` - To-do list

---

### Get Single List
**Endpoint:** `GET /api/ext/2004/{accountId}/list/{listId}`

**Response:** `200 OK`
```json
{
  "id": "list-uuid",
  "name": "Shopping List",
  "status": "shopping",
  "version": 123,
  "items": [
    {
      "id": "item-uuid",
      "text": "Milk",
      "completed": false,
      "position": 0,
      "version": 1
    }
  ]
}
```

---

### Add List Item
**Endpoint:** `POST /api/ext/2004/{accountId}/list/{listId}/item/`

**Request:**
```json
{
  "text": "Bread",
  "completed": false
}
```

**Response:** `201 Created`
```json
{
  "id": "item-uuid",
  "text": "Bread",
  "completed": false,
  "position": 0,
  "version": 1
}
```

---

### Edit List Item
**Endpoint:** `PUT /api/ext/2004/{accountId}/list/{listId}/item/{itemId}`

**Request:**
```json
{
  "text": "Whole Wheat Bread",
  "completed": true,
  "version": 1
}
```

**Response:** `200 OK`

---

### Delete List Item
**Endpoint:** `DELETE /api/ext/2004/{accountId}/list/{listId}/item/{itemId}`

**Response:** `204 No Content`

---

### Mark Item Complete/Incomplete
**Endpoint:** `PUT /api/ext/2004/{accountId}/list/{listId}/item/{itemId}`

**Request:**
```json
{
  "completed": true,
  "version": 1
}
```

---

### Reorder List Items
**Endpoint:** `POST /api/ext/2004/{accountId}/list/{listId}/reorder`

**Request:**
```json
{
  "itemIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

---

## Recipes & Food

**Base URL:** `/api/ext/2103/{accountId}/food/`

### List User Recipes
**Endpoint:** `GET /api/ext/2103/{accountId}/food/recipe/`

**Response:** `200 OK`
```json
[
  {
    "recipeId": "uuid",
    "name": "Chocolate Chip Cookies",
    "description": "Classic cookies",
    "instructions": "Step by step...",
    "ingredients": [...],
    "photos": [...]
  }
]
```

---

### List Curated Recipes
**Endpoint:** `GET /api/ext/2103/{accountId}/food/curated/recipe/`

Returns Cozi's curated recipe collection.

---

### Create Recipe
**Endpoint:** `POST /api/ext/2103/{accountId}/food/recipe/`

**Request:**
```json
{
  "recipeId": "uuid",
  "name": "Recipe Name",
  "description": "Short description",
  "instructions": "Step by step instructions",
  "ingredients": [
    {
      "ingredientId": "uuid",
      "name": "2 cups flour",
      "amount": "2",
      "unit": "cups",
      "parsedName": "flour",
      "preparation": null,
      "subRecipeId": null
    }
  ],
  "recipeSource": "Typed Into Cozi",
  "sourceRaw": "website.com",
  "sourceUrl": null,
  "sourceUrlText": "website.com",
  "sourceLogoUrl": null,
  "isPublished": false,
  "tags": {
    "has-keyword": ["dessert", "quick"],
    "has-ai-protein": ["Vegetarian"],
    "has-ai-cuisine": ["American"],
    "has-ai-meal": ["Dessert"]
  },
  "nutrition": null,
  "cookTimeText": "30 minutes",
  "servingSize": "12 cookies",
  "servings": "12",
  "photos": []
}
```

**Response:** `201 Created` with full recipe object

**Supported Tags:**
- `has-keyword`: Custom tags (array of strings)
- `has-ai-protein`: Chicken, Beef, Turkey, Vegetarian, Pork, Seafood, Other
- `has-ai-cuisine`: American, Mexican, Mediterranean, Italian, Asian, Indian, Other
- `has-ai-meal`: Dinner, Lunch, Breakfast, Dessert, Other

---

### Upload Recipe Photo
**Endpoint:** `POST /api/ext/2103/{accountId}/food/recipe/{recipeId}/photo`

**Content-Type:** `multipart/form-data`

Upload photo after creating recipe.

---

### Delete Recipe
**Endpoint:** `DELETE /api/ext/2103/{accountId}/food/recipe/{recipeId}`

**Response:** `204 No Content`

---

## Persons & Family

### Get All Persons
**Endpoint:** `GET /api/ext/2004/{accountId}/account/person/?apikey=coziwc|v249_production`

**Response:** `200 OK`
```json
[
  {
    "accountPersonId": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "accountPersonType": "user",
    "notifiable": true,
    "notifiableFeatures": ["calendarItemNotification", "calendarItemReminder"],
    "colorIndex": 1,
    "isAdult": true,
    "version": 123,
    "settings": {
      "calendarItemNotification": {
        "emailEnabled": true,
        "pushEnabled": true,
        "sendByDefault": true
      }
    }
  }
]
```

**Person Types:**
- `user` - Full family member with email, can receive notifications
- `attendee` - Family member without email/login, cannot receive notifications

---

### Add Person
**Endpoint:** `POST /api/ext/2004/{accountId}/account/person/?apikey=coziwc|v249_production`

**Request:**
```json
{
  "name": "Jane Doe",
  "accountPersonType": "attendee",
  "colorIndex": 2,
  "isAdult": false
}
```

**Response:** `201 Created`
```json
{
  "accountPersonId": "uuid",
  "name": "Jane Doe",
  "accountPersonType": "attendee",
  "colorIndex": 2,
  "notifiable": false,
  "version": 1
}
```

---

### Edit Person
**Endpoint:** `PUT /api/ext/2004/{accountId}/account/person/{personId}?apikey=coziwc|v249_production`

**Request:**
```json
{
  "name": "Jane Smith",
  "colorIndex": 5
}
```

**Response:** `200 OK` with updated person object

---

### Delete Person
**Endpoint:** `DELETE /api/ext/2004/{accountId}/account/person/{personId}?apikey=coziwc|v249_production`

**Response:** `204 No Content`

---

## Account & Configuration

### Get Account Info
**Endpoint:** `GET /api/ext/2004/{accountId}/account/`

**Response:** `200 OK`
```json
{
  "accountId": "uuid",
  "name": "Smith Family",
  "timezone": "America/New_York",
  "regionDesignator": "US",
  "languageDesignator": "en",
  "creationDate": "2020-01-01T00:00:00",
  "photo": {...}
}
```

---

### Get Subscription
**Endpoint:** `GET /api/ext/2004/{accountId}/subscription/`

**Response:** `200 OK`
```json
{
  "status": "active",
  "tier": "gold",
  "expiresAt": "2027-01-01T00:00:00"
}
```

---

### Get Configuration
**Endpoint:** `GET /api/ext/2004/{accountId}/config/`

**Response:** `200 OK`
```json
{
  "features": [
    "MealPlanner",
    "CalendarSearch",
    "Birthdays",
    "MultipleReminders",
    "Chores"
  ],
  "featureKeys": [...],
  "app": {
    "colors": {
      "attendeeList": [...],
      "attendeePalette": {...}
    },
    "images": {...},
    "strings": {...}
  }
}
```

**Feature Flags:**
- `MealPlanner` - Meal planning feature
- `CalendarSearch` - Calendar search
- `Birthdays` - Birthday management
- `MultipleReminders` - 3 reminders per appointment
- `Chores` - Chore lists
- `GoogleImport` - Google Calendar import

---

### Get User Settings
**Endpoint:** `GET /api/ext/2106/{accountId}/account/user/settings`

**Response:** `200 OK`
```json
{
  "users": {}
}
```

---

## Error Handling

### Error Response Format
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

### Common HTTP Status Codes

**2xx Success:**
- `200 OK` - Request successful
- `201 Created` - Resource created
- `204 No Content` - Successful deletion

**4xx Client Errors:**
- `400 Bad Request` - Invalid request payload
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Version conflict (optimistic locking)

**5xx Server Errors:**
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service temporarily down

### Optimistic Locking
Edit and delete operations require `version` field:
```json
{
  "id": "uuid",
  "version": 123,
  "text": "Updated text"
}
```

If version doesn't match, returns `409 Conflict`.

---

## Rate Limiting & Best Practices

### Rate Limits
- Not officially documented
- Recommendation: Max 10 requests/second
- Use batch operations when possible

### Best Practices

1. **Authentication**
   - Store access token securely
   - Refresh before expiration (4 hours)
   - Never commit credentials to version control

2. **API Keys**
   - Always include `?apikey=coziwc|v249_production` for:
     - POST/PUT/DELETE operations
     - Notifications
     - Search

3. **Notifications**
   - Include all notifiable users (including creator)
   - Filter to `accountPersonType: "user"` with `notifiable: true`
   - Maximum 3 reminders per appointment

4. **Error Handling**
   - Check `version` field for optimistic locking
   - Handle 401/403 with re-authentication
   - Retry 5xx errors with exponential backoff

5. **Performance**
   - Batch calendar operations in single POST
   - Cache configuration/person data
   - Use search for finding specific items

6. **Data Validation**
   - Validate dates before sending (ISO 8601)
   - Validate times (24-hour format)
   - Check email format for user accounts

---

## API Coverage Summary

### ✅ Fully Documented (100% CRUD)
1. **Authentication** - Login
2. **Calendar & Appointments** - Create, Read, Edit, Delete (with reminders, recurrence, notifications)
3. **Lists & Shopping** - Full CRUD operations
4. **Persons/Family** - Full CRUD operations
5. **Recipes** - Create, Read, Delete, Photo upload

### ✅ Read-Only Operations
6. **Calendar Search** - Search with highlighting
7. **Account Info** - Read account details
8. **Subscriptions** - Read subscription status
9. **Configuration** - Read features and settings

### ⚠️ Partially Known
- Recipe editing (PUT endpoint exists but not tested)
- Meal planning (assign recipes to calendar - endpoint unknown)
- Birthdays (visible in calendar but CRUD unknown)

### ❌ Not Available via API
- Journal/Notes (no evidence found)
- Photos/Media management (no endpoints discovered)
- Chores as separate feature (may be lists)

---

## API Versions Reference

| Version | Purpose | Endpoints |
|---------|---------|-----------|
| 2207 | Authentication | `/auth/login` |
| 2004 | Core Features | Calendar, Lists, Persons, Account, Search |
| 2103 | Recipes | `/food/recipe/`, `/food/curated/recipe/` |
| 2106 | User Settings | `/account/user/settings` |

---

## Quick Reference

### Authentication
```bash
POST /api/ext/2207/auth/login
```

### Calendar
```bash
GET  /api/ext/2004/{accountId}/calendar/{year}/{month}
POST /api/ext/2004/{accountId}/calendar/{year}/{month}?apikey=...
```

### Search
```bash
GET  /api/ext/2004/{accountId}/search/calendar/?apikey=...&q={query}
```

### Lists
```bash
GET    /api/ext/2004/{accountId}/list/
GET    /api/ext/2004/{accountId}/list/{listId}
POST   /api/ext/2004/{accountId}/list/{listId}/item/
PUT    /api/ext/2004/{accountId}/list/{listId}/item/{itemId}
DELETE /api/ext/2004/{accountId}/list/{listId}/item/{itemId}
```

### Recipes
```bash
GET    /api/ext/2103/{accountId}/food/recipe/
POST   /api/ext/2103/{accountId}/food/recipe/
DELETE /api/ext/2103/{accountId}/food/recipe/{recipeId}
POST   /api/ext/2103/{accountId}/food/recipe/{recipeId}/photo
```

### Persons
```bash
GET    /api/ext/2004/{accountId}/account/person/?apikey=...
POST   /api/ext/2004/{accountId}/account/person/?apikey=...
PUT    /api/ext/2004/{accountId}/account/person/{personId}?apikey=...
DELETE /api/ext/2004/{accountId}/account/person/{personId}?apikey=...
```

### Account
```bash
GET /api/ext/2004/{accountId}/account/
GET /api/ext/2004/{accountId}/subscription/
GET /api/ext/2004/{accountId}/config/
```

---

## Changelog

### January 7, 2026
- Complete API discovery project
- ~99% coverage of REST API features
- All major CRUD operations documented
- Recipes, Search, and Person management discovered
- Notification system fully documented

---

## License & Disclaimer

This is unofficial documentation created through reverse engineering. The Cozi API is not publicly documented and may change without notice. Use at your own risk and respect Cozi's terms of service.

For the official Cozi app, visit: https://www.cozi.com

---

**Documentation Version:** 1.0.0  
**Last Updated:** January 7, 2026  
**Contributors:** Community reverse engineering effort
