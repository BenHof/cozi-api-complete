# Cozi API Exploration Guide

This guide covers the exploration scripts created to discover and test Cozi API endpoints.

## Available Exploration Scripts

### 1. `explore-appointment-crud.ts`
**Purpose**: Test complete appointment lifecycle (Create, Read, Update, Delete)

**What it tests**:
- ✅ Create a simple appointment
- ✅ Read/verify the appointment from calendar
- ✅ Edit the appointment (change time, subject, location)
- ✅ Verify the edit worked
- ✅ Delete the appointment (optional)

**Run it**:
```bash
npx tsx explore-appointment-crud.ts
```

**What you'll need**: Your Cozi credentials

**Output**: Real-time test results showing each CRUD operation

---

### 2. `explore-unknown-endpoints.ts`
**Purpose**: Systematically test unknown/untested Cozi API endpoints

**What it tests**:
- 🍽️ **Meals & Menu Planning**: `/meal/`, `/menu/`, `/mealplan/`, `/food/`
- 📖 **Recipes**: `/food/recipe/`, `/recipe/`, `/cookbook/`
- 📝 **Journal & Notes**: `/journal/`, `/journal/entry/`, `/note/`, `/message/`
- 🎂 **Birthdays & Holidays**: `/birthday/`, `/holiday/`, `/specialday/`
- 🔍 **Search & Query**: Calendar search, general search
- ⚙️ **Settings**: User settings, preferences, config
- 📷 **Other**: Photos, media, contacts, activity, notifications

**Run it**:
```bash
npx tsx explore-unknown-endpoints.ts
```

**What you'll need**: Your Cozi credentials

**Output**: 
- Real-time test results for each endpoint
- Summary of successful vs failed tests
- JSON file `endpoint-discovery-results.json` with all results

---

### 3. `explore-person-management.ts`
**Purpose**: Test family member/person management operations

**What it tests**:
- 📖 Read all current family members
- ➕ Add a new person (tries multiple endpoint variations)
- ✏️ Edit person details (tries PUT, PATCH, POST methods)
- 🗑️ Delete person (optional, tries multiple endpoint variations)
- ⚙️ Read person settings

**Run it**:
```bash
npx tsx explore-person-management.ts
```

**What you'll need**: 
- Your Cozi credentials
- A test name for adding a person (e.g., "Test User")

**Interactive**: Asks for confirmation before adding/deleting

---

## Running All Tests

You can run all exploration scripts sequentially:

```bash
# 1. Test appointments
npx tsx explore-appointment-crud.ts

# 2. Discover unknown endpoints (saves results to JSON)
npx tsx explore-unknown-endpoints.ts

# 3. Test person management
npx tsx explore-person-management.ts
```

## What We're Looking For

### Success Indicators
- ✅ HTTP 200/201 responses
- ✅ Valid JSON responses with expected data
- ✅ Operations that create/modify data and can be verified

### Failure Analysis
- 📍 **404 Not Found**: Endpoint doesn't exist or path is wrong
- 🚫 **403 Forbidden**: Endpoint exists but requires different permissions
- 🔒 **401 Unauthorized**: Auth issue (shouldn't happen after login)
- ⚠️ **400 Bad Request**: Endpoint exists but payload is wrong

## Results

### Already Documented (Working)
- ✅ Authentication (`POST /auth/login`)
- ✅ Calendar - Read (`GET /calendar/{year}/{month}`)
- ✅ Appointments - Create (`POST /calendar/{year}/{month}`)
- ✅ Appointments - Edit (untested, but structure known)
- ✅ Appointments - Delete (untested, but structure known)
- ✅ Lists - Read all (`GET /list/`)
- ✅ Lists - Read one (`GET /list/{listId}`)
- ✅ List Items - Add, Edit, Delete, Reorder
- ✅ Persons - Read (`GET /account/person/`)
- ✅ Account - Read (`GET /account/`)
- ✅ Subscriptions - Read (`GET /subscription/`)
- ✅ Reminders - Embedded in appointments (max 3 per appointment)
- ✅ Notifications - Requires `?apikey=coziwc|v249_production`

### Unknown/Untested Areas
- ❓ Meals & Menu planning
- ❓ Recipes & Cookbook
- ❓ Journal entries
- ❓ Birthday management (seen in responses but CRUD unknown)
- ❓ Person management (read works, but add/edit/delete untested)
- ❓ Search functionality
- ❓ Photos/Media
- ❓ Settings modification

## Tips for Manual Testing

### Using the Browser Capture
If you want to see actual Cozi web app requests:
1. Open `https://my.cozi.com` in Chrome
2. Open DevTools (F12)
3. Go to Network tab
4. Filter by "Fetch/XHR"
5. Perform the action you want to reverse engineer
6. Look at the request/response

### Common Patterns
- Most endpoints use `/api/ext/2004/{accountId}/...`
- Auth uses `/api/ext/2207/...`
- Many POST operations need `?apikey=coziwc|v249_production`
- Optimistic locking via `version` field for edits
- Array payloads for batch operations: `[{...}]`

## Safety Notes

⚠️ **These scripts interact with your real Cozi account**

- Scripts that ADD data clearly label what they're adding
- Scripts that DELETE data ask for confirmation first
- All test appointments/items include "TEST" or "CRUD Test" in the name
- You can safely skip any destructive operations

## Next Steps After Running Tests

1. Review `endpoint-discovery-results.json` for successful endpoints
2. Check console output for interesting response structures
3. Document any new working endpoints in `API-REFERENCE.md`
4. Update TypeScript types in `src/types.ts` for new data structures
5. Implement new methods in `src/CoziApiClient.ts`

## Questions?

If you find a working endpoint:
1. Note the exact URL pattern
2. Note the HTTP method (GET/POST/PUT/DELETE)
3. Note the request payload structure
4. Note the response structure
5. Add it to API-REFERENCE.md

Good luck exploring! 🚀
