# Calendar Search API Discovery

**Date**: January 7, 2026  
**API Version**: 2004  
**Status**: ✅ DISCOVERED

---

## 🎉 Success!

We successfully discovered the **Calendar Search API** through targeted browser traffic capture!

## API Endpoint

### Calendar Search
```
GET /api/ext/2004/{accountId}/search/calendar/?apikey=coziwc|v249_production&q={query}
```

**Parameters**:
- `q` - Search query string (required)
- `apikey` - API key (required for search)

**Example**:
```
GET /api/ext/2004/{accountId}/search/calendar/?apikey=coziwc|v249_production&q=test
GET /api/ext/2004/{accountId}/search/calendar/?apikey=coziwc|v249_production&q=Mitchell
```

---

## Response Structure

The search returns a calendar-like structure with matched appointments:

```json
{
  "startDate": "2025-03-06T10:30:00",
  "endDate": "2026-06-25T00:00:00",
  "selectedDay": "2026-01-07",
  "hasNext": true,
  "hasPrevious": false,
  "days": {
    "2026-01-07": [
      {
        "id": "appointment-id",
        "multiday": {
          "startDay": "2026-01-07",
          "endDay": "2026-01-08"
        }
      }
    ]
  },
  "items": {
    "appointment-id": {
      "item": {
        "itemType": "appointment",
        "itemVersion": 1507,
        "startTime": "14:00:00",
        "endTime": "15:00:00",
        "dateSpan": 1,
        "description": "API Test - Please Delete",
        "itemDetails": {
          "notes": "This is a test appointment...",
          "location": "Test Location"
        }
      },
      "highlight": {
        "notes": "This is a **test** appointment...",
        "description": "API **Test** - Please Delete",
        "location": "**Test** Location"
      }
    }
  }
}
```

---

## Key Features

### 1. Search Highlighting
The response includes a `highlight` object for each matched item with **markdown bold** (`**text**`) around matched terms:

```json
{
  "item": {
    "description": "API Test - Please Delete"
  },
  "highlight": {
    "description": "API **Test** - Please Delete"
  }
}
```

This allows the UI to highlight search matches.

### 2. Pagination
- `hasNext`: Boolean indicating if there are more results
- `hasPrevious`: Boolean indicating if there are previous results
- `startDate` / `endDate`: Date range of returned results

### 3. Response Format
Identical to regular calendar GET response:
- `days` object with dates as keys
- `items` object with full appointment details
- Includes recurring appointment instances

### 4. Search Scope
Searches across:
- ✅ Appointment titles/subjects (`description`)
- ✅ Appointment notes (`itemDetails.notes`)
- ✅ Appointment locations (`itemDetails.location`)
- ✅ Attendee names (searches return appointments they're invited to)

---

## Search Behavior

### What Gets Searched
Based on testing with "test" and "Mitchell":

1. **Appointment Titles** - Matches in description/subject
2. **Notes** - Matches in appointment notes
3. **Locations** - Matches in location field
4. **Attendees** - Returns appointments where person is an attendee
5. **Case-Insensitive** - "test" matches "Test"

### What Doesn't Get Searched
- ❌ List items (no shopping/todo search discovered)
- ❌ Recipes (separate API)
- ❌ Person names (unless they're in appointment fields)

---

## Implementation Notes

### Required Parameters
1. **API Key**: Must include `?apikey=coziwc|v249_production`
2. **Query**: `q={searchTerm}` parameter is required

### Response Processing
1. Parse response same as calendar GET
2. Use `highlight` object to show matched terms
3. Check `hasNext`/`hasPrevious` for pagination
4. Display date range from `startDate`/`endDate`

### Example Usage
```typescript
async function searchCalendar(query: string) {
  const response = await axios.get(
    `${API_BASE}/${accountId}/search/calendar/`,
    {
      params: {
        apikey: 'coziwc|v249_production',
        q: query
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return {
    results: response.data.items,
    highlights: response.data.items.map(item => item.highlight),
    hasMore: response.data.hasNext,
    dateRange: {
      start: response.data.startDate,
      end: response.data.endDate
    }
  };
}
```

---

## Limitations

### Only Calendar Search
- Only searches calendar/appointments
- No global search across all Cozi data
- No list/shopping item search discovered

### No Advanced Filters
- No date range filtering
- No filter by attendee
- No filter by location
- Search is simple text matching

### Pagination Unknown
- `hasNext`/`hasPrevious` flags exist
- Pagination parameters not discovered
- May auto-limit results to date range

---

## What's Still Unknown

1. **List/Shopping Search** - No endpoint found for searching lists
2. **Recipe Search** - Likely separate endpoint or client-side filtering
3. **Pagination Parameters** - How to get next/previous page
4. **Advanced Filters** - Date range, attendee filtering, etc.
5. **Search Limits** - Maximum results per query
6. **Global Search** - Cross-feature search endpoint

---

## Summary

✅ **Discovered Calendar Search API**
- Endpoint: `GET /search/calendar/?q={query}`
- Requires API key parameter
- Returns calendar-formatted results
- Includes search highlighting
- Supports pagination (flags present)

### What Works
- Text search across appointment titles, notes, locations
- Case-insensitive matching
- Attendee-based search (returns their appointments)
- Search result highlighting with markdown bold

### What's Missing
- List/shopping item search
- Recipe search
- Pagination controls
- Advanced filtering options

---

## Files Generated

1. `targeted-traffic-capture-autosave.json` - Raw captured search traffic (6 requests)
2. `SEARCH-API-DISCOVERY.md` - This document

---

## Next Steps

1. ✅ Document search endpoint in API-REFERENCE.md
2. ✅ Add TypeScript types for search responses
3. ⚠️ Test pagination (if parameters exist)
4. ⚠️ Look for list/shopping search endpoint
5. ⚠️ Look for recipe search endpoint
6. ⚠️ Test search with special characters
