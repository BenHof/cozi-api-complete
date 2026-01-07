# Cozi API Notifications - Testing Findings

## Summary
After extensive testing, we discovered the exact requirements for calendar appointment notifications to work correctly with the Cozi API.

## ✅ Working Solution

### Required Components

1. **API Key Query Parameter** (CRITICAL)
   ```
   ?apikey=coziwc|v249_production
   ```
   - Must be appended to the calendar endpoint URL
   - Without this, appointments are created but NO notifications are sent
   - This was the missing piece that prevented notifications initially

2. **notifyPersons Array**
   ```json
   {
     "notifyPersons": ["person-id-1", "person-id-2", "person-id-3"]
   }
   ```
   - Include ALL users who should receive notifications
   - **MUST include the creator** (yourself) - not just other people
   - Only users with `notifiable: true` AND `accountPersonType: "user"` can be notified

3. **Filter Out Non-Notifiable Users**
   ```typescript
   const notifiablePersons = persons.filter((p: any) => 
     p.notifiable === true && 
     p.accountPersonType === 'user'
   );
   const notifyPersonIds = notifiablePersons.map((p: any) => p.accountPersonId);
   ```

### Complete Working Example

```typescript
// 1. Get all persons
const personsResponse = await axios.get(
  `https://rest.cozi.com/api/ext/2004/${accountId}/account/person/`,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }
);

// 2. Filter to only notifiable users
const persons = personsResponse.data;
const notifiablePersons = persons.filter((p: any) => 
  p.notifiable === true && 
  p.accountPersonType === 'user'
);
const notifyPersonIds = notifiablePersons.map((p: any) => p.accountPersonId);

// 3. Create appointment with notifications
const appointmentData = [{
  itemType: 'appointment',
  notifyPersons: notifyPersonIds,  // Include ALL notifiable users (including yourself)
  create: {
    startDay: '2026-01-08',
    reminders: [
      { minutesBefore: 30 },
      { minutesBefore: 60 },
      { minutesBefore: 1440 }
    ],
    details: {
      startTime: '14:00',
      endTime: '15:00',
      dateSpan: 1,
      subject: 'Test Event',
      location: 'Location',
      notes: 'Notes'
    }
  }
}];

// 4. POST with apikey parameter (CRITICAL!)
const response = await axios.post(
  `https://rest.cozi.com/api/ext/2004/${accountId}/calendar/${year}/${month}?apikey=coziwc|v249_production`,
  appointmentData,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }
);
```

## Person Types and Notification Eligibility

### Notifiable Users (can receive notifications)
```json
{
  "notifiable": true,
  "accountPersonType": "user",
  "notifiableFeatures": ["calendarItemNotification", "calendarItemReminder"],
  "settings": {
    "calendarItemNotification": {
      "emailEnabled": true,
      "pushEnabled": true,
      "sendByDefault": true
    }
  }
}
```

### Attendees (CANNOT receive notifications)
```json
{
  "notifiable": false,
  "accountPersonType": "attendee",
  "notifiableFeatures": [],
  "email": null
}
```

## Key Insights from Testing

### What Didn't Work
1. ❌ Omitting `notifyPersons` field entirely (no notifications sent)
2. ❌ Excluding yourself from `notifyPersons` (no notifications sent)
3. ❌ Missing `?apikey=` query parameter (no notifications sent, but appointment created)
4. ❌ Including attendee-type users in `notifyPersons` (they are silently ignored)

### What Did Work
1. ✅ Including apikey query parameter
2. ✅ Including ALL notifiable users (including creator) in `notifyPersons` array
3. ✅ Filtering out attendee-type users before sending

## Additional Limits Discovered

### Reminder Limit: Maximum 3 Reminders
When we attempted to create an appointment with 5 reminders, Cozi returned an error:
```
Maximum of 3 reminders allowed per appointment
```

Valid reminder values (minutesBefore):
- 0 = At event time
- 15 = 15 minutes before
- 30 = 30 minutes before
- 60 = 1 hour before
- 1440 = 1 day before
- 10080 = 1 week before
- 20160 = 2 weeks before

## Browser Traffic Analysis

From captured browser requests, we found that the Cozi web app:
- Always includes `?apikey=coziwc|v249_production` on calendar POST requests
- When creating an event, only includes the creator's person ID in `notifyPersons`
- Uses different format for delete operations: object with indices instead of array

Example from browser:
```json
{
  "url": "https://rest.cozi.com/api/ext/2004/{accountId}/calendar/2026/4?apikey=coziwc|v249_production",
  "postData": [{
    "itemType": "appointment",
    "notifyPersons": ["16b5c6ae-7089-4365-85ce-f6661ceba63d"],
    "create": {
      "startDay": "2026-04-30",
      "reminders": [{"minutesBefore": 20160}, {"minutesBefore": 30}, {"minutesBefore": 0}],
      "details": {...}
    }
  }]
}
```

## Testing Timeline

1. **Initial Test**: Created appointment without apikey - SUCCESS but no notifications
2. **Second Test**: Tried with 5 reminders - ERROR: max 3 reminders
3. **Third Test**: Used 3 reminders, excluded self - SUCCESS but no notifications
4. **Fourth Test**: Omitted notifyPersons - SUCCESS but no notifications
5. **Final Test**: Added apikey + included all notifiable users - ✅ NOTIFICATIONS WORK!

## Verified Test Results

**Final successful test**:
- Appointment ID: (generated)
- Date: 2026-01-08
- Notified: Ben, Colleen, Matthew (all 3 notifiable users)
- Result: ✅ Ben received notification email/push
- Reminders: 30 min, 1 hour, 1 day before (all 3 working)

## Recommendation for Implementation

When implementing this in the TypeScript client library:

1. Always include `?apikey=coziwc|v249_production` on calendar POST requests
2. Provide a helper method to get notifiable persons:
   ```typescript
   async getNotifiablePersons(): Promise<string[]> {
     const persons = await this.getPersons();
     return persons
       .filter(p => p.notifiable && p.accountPersonType === 'user')
       .map(p => p.accountPersonId);
   }
   ```
3. Document the 3-reminder limit clearly
4. Warn users that attendee-type persons cannot be notified
5. Consider a `notifyAll` option that automatically includes all notifiable users
