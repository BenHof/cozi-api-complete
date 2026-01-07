import { z } from 'zod';

// --- Authentication & Account ---

export const CoziCredentialsSchema = z.object({
    username: z.string(),
    password: z.string(),
});

export const CoziSessionSchema = z.object({
    accessToken: z.string(),
    accountId: z.string(),
    accountPersonId: z.string(),
    expiresAt: z.date(),
});

export const CoziAuthResponseSchema = z.object({
    accountId: z.string(),
    accountPersonId: z.string(),
    accessToken: z.string(),
    expiresIn: z.number(), // seconds
});

// --- Family / Persons ---

export const PersonTypeSchema = z.enum(['user', 'attendee']);

export const CoziPersonSchema = z.object({
    accountPersonId: z.string(),
    name: z.string(),
    email: z.string().optional(),
    accountPersonType: PersonTypeSchema,
    notifiable: z.boolean(),
    notifiableFeatures: z.array(z.string()).optional(),
    colorIndex: z.number(),
    isAdult: z.boolean(),
    version: z.number(),
    settings: z.record(z.string(), z.unknown()).optional(),
});

// --- Lists & Items ---

export const ListItemTypeSchema = z.literal('header').nullable();

export const CoziListItemSchema = z.preprocess(
    (val: any) => {
        if (val && typeof val === 'object' && val.itemId && !val.id) {
            return { ...val, id: val.itemId };
        }
        return val;
    },
    z.object({
        id: z.string(),
        text: z.string(),
        completed: z.boolean(),
        position: z.number().optional(),
        version: z.number(),
        itemType: ListItemTypeSchema.optional(),
        notes: z.string().nullable().optional(),
        owner: z.string().nullable().optional(),
    })
);

export const CoziListSchema = z.object({
    listId: z.string(),
    title: z.string(),
    listType: z.enum(['shopping', 'todo']),
    items: z.array(CoziListItemSchema).nullable().optional().transform(val => val || []),
    version: z.number(),
    notes: z.string().nullable().optional(),
    owner: z.string().nullable().optional(),
});

// --- Calendar & Appointments ---

export const CoziReminderSchema = z.object({
    minutesBefore: z.number(),
});

export const CoziRecurrenceRuleSchema = z.object({
    frequency: z.enum(['Daily', 'Weekly', 'Monthly', 'Yearly']),
    interval: z.number(),
    byDay: z.array(z.string()).optional(),
    end: z.object({
        until: z.string().optional(),
        count: z.number().optional(),
    }),
});

export const CoziRecurrenceSchema = z.object({
    rules: z.array(CoziRecurrenceRuleSchema),
});

// Nested details within create/edit wrappers
const CoziAppointmentDetailsSchema = z.object({
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    dateSpan: z.number().optional(),
    subject: z.string().optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
    attendeeSet: z.array(z.string()).optional(),
});

const CoziAppointmentDetailsWrapperSchema = z.object({
    startDay: z.string().optional(),
    details: CoziAppointmentDetailsSchema.optional(),
    reminders: z.array(CoziReminderSchema).optional(),
    recurrence: CoziRecurrenceSchema.optional(),
});

export const CoziAppointmentSchema = z.object({
    itemType: z.literal('appointment'),
    id: z.string().optional(),
    version: z.number().optional(),

    create: CoziAppointmentDetailsWrapperSchema.optional(),
    edit: CoziAppointmentDetailsWrapperSchema.optional(),
    delete: z.object({ id: z.string(), version: z.number() }).optional(),

    selectedDay: z.string().optional(),
    extent: z.enum(['single', 'forward', 'all']).optional(),

    // Notification can be array of IDs or map of ID -> Method
    notifyPersons: z.union([z.array(z.string()), z.record(z.string(), z.number())]).optional(),

    // Read view properties
    subject: z.string().optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
    startDay: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    attendees: z.array(z.string()).optional(),
    reminders: z.array(CoziReminderSchema).optional(),
    recurrence: CoziRecurrenceSchema.optional(),
});

// ...
export const CoziBirthdaySchema = z.object({
    id: z.string(),
    name: z.string(),
    date: z.string(),
    personId: z.string().optional(),
    age: z.number().optional(),
});

export const CoziHolidaySchema = z.object({
    id: z.string(),
    name: z.string(),
    date: z.string(),
    country: z.string().optional(),
});

export const CoziCalendarResponseSchema = z.object({
    startDate: z.string(),
    endDate: z.string(),
    items: z.array(CoziAppointmentSchema),
    days: z.record(z.string(), z.unknown()).optional(),
    appointmentsById: z.record(z.string(), CoziAppointmentSchema).optional(),
    birthdaysById: z.record(z.string(), CoziBirthdaySchema).optional(),
    holidaysById: z.record(z.string(), CoziHolidaySchema).optional(),
});

// --- Recipes ---

export const CoziIngredientSchema = z.object({
    ingredientId: z.string().optional(),
    name: z.string(),
    amount: z.string().optional(),
    unit: z.string().optional(),
    parsedName: z.string().optional(),
    preparation: z.string().optional(),
});

export const CoziPhotoSchema = z.object({
    url: z.string().optional(),
    thumbUrl: z.string().optional(),
    id: z.string().optional(),
});

export const CoziRecipeSchema = z.object({
    recipeId: z.string(),
    name: z.string(),
    description: z.string().optional(),
    instructions: z.string().optional(),
    ingredients: z.array(CoziIngredientSchema),
    photos: z.array(CoziPhotoSchema),
    prepTimeText: z.string().optional(),
    cookTimeText: z.string().optional(),
    totalTimeText: z.string().optional(),
    servings: z.string().optional(),
    tags: z.record(z.string(), z.array(z.string())).optional(),
});

export const CoziCalendarSearchResponseSchema = z.object({
    items: z.record(
        z.string(),
        z.object({
            item: z.object({
                description: z.string(),
                itemDetails: z.object({
                    notes: z.string().optional()
                })
            }),
            highlight: z.object({
                description: z.string(),
                notes: z.string().optional()
            })
        })
    )
});
