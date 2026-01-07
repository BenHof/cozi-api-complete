/**
 * Cozi API Client Types
 *
 * Based on reverse engineering from py-cozi library and browser traffic.
 *
 * NOTE: This is an UNOFFICIAL client. Cozi does not provide a public API.
 * Use at your own risk. The API may change without notice.
 */

// --- Authentication & Account ---

export interface CoziCredentials {
  username: string;
  password: string;
}

export interface CoziSession {
  accessToken: string;
  accountId: string;
  accountPersonId: string;
  expiresAt: Date;
}

export interface CoziAuthResponse {
  accountId: string;
  accountPersonId: string;
  accessToken: string;
  expiresIn: number; // seconds
}

export interface CoziApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface CoziAccount {
  accountId: string;
  name: string;
  timezone: string;
  regionDesignator: string;
  languageDesignator: string;
  creationDate: string;
  photo?: CoziPhoto;
}

export interface CoziSubscription {
  status: string;
  tier: string;
  expiresAt?: string;
}

export interface CoziSubscriptionProducts {
  premiumBundleId: string;
  products: CoziProduct[];
  offeringUrl?: string;
  termsOfUseUrl?: string;
  couponData?: unknown;
}

export interface CoziProduct {
  productName: string;
  providerName: string;
  entitlementId: string;
  features: string[];
  price?: number;
  currency?: string;
}

export interface CoziConfig {
  features: string[];
  featureKeys: string[];
  app: {
    colors: {
      attendeeList: string[];
      attendeePalette: Record<string, unknown>;
    };
    images: Record<string, string>;
    strings: Record<string, string>;
  };
}

export interface CoziPhoto {
  url?: string;
  thumbUrl?: string;
  id?: string;
}

// --- Family / Persons ---

export type PersonType = 'user' | 'attendee';

export interface CoziPerson {
  accountPersonId: string;
  name: string;
  email?: string;
  accountPersonType: PersonType;
  notifiable: boolean;
  notifiableFeatures?: string[];
  colorIndex: number;
  isAdult: boolean;
  version: number;
  settings?: Record<string, unknown>;
}

export interface CreatePersonRequest {
  name: string;
  accountPersonType: PersonType;
  colorIndex: number;
  isAdult: boolean;
}

export interface UpdatePersonRequest {
  name?: string;
  colorIndex?: number;
  email?: string;
  notifiable?: boolean;
}

// --- Lists & Items ---

export interface CoziList {
  listId: string;
  title: string;
  listType: 'shopping' | 'todo';
  items: CoziListItem[];
  version: number;
  notes?: string | null;
  owner?: string | null;
}

// Keeping legacy aliases for backward compatibility if needed,
// or clean break to new types. Lets prefer new types matching docs.
// But CoziApiClient.ts currently uses old types.
// We will update CoziApiClient to new types.

export type ListItemType = 'header' | null;

export interface CoziListItem {
  id: string; // Documented as 'id', was 'itemId'
  text: string;
  completed: boolean; // Documented as boolean 'completed'
  position?: number;
  version: number;
  itemType?: ListItemType; // 'header' = section header, null = regular item
  notes?: string | null;
  owner?: string | null;
}

export interface CreateListRequest {
  name: string;
  type: 'shopping' | 'todo';
}

export interface AddListItemRequest {
  text: string;
  completed?: boolean;
  itemType?: ListItemType; // Set to 'header' to create a section
}

export interface UpdateListItemRequest {
  text?: string;
  completed?: boolean;
  version: number;
  itemType?: ListItemType;
}

// --- Push Notifications (Iterable) ---

export interface CoziIterableToken {
  token: string;
  expiresAt: string;
}

// --- Birthdays & Holidays (embedded in Calendar response) ---

export interface CoziBirthday {
  id: string;
  name: string;
  date: string;
  personId?: string;
  age?: number;
}

export interface CoziHoliday {
  id: string;
  name: string;
  date: string;
  country?: string;
}

// --- Meals Config ---

export interface CoziMealsConfig {
  curated: {
    recipes: CoziRecipeCategory[];
  };
}

export interface CoziRecipeCategory {
  tag: string;
  category: string;
  urlKey: string;
  isSponsored: boolean;
  isUpsell: boolean;
}

// --- Calendar & Appointments ---

export interface CoziCalendarResponse {
  startDate: string;
  endDate: string;
  items: CoziAppointment[];
  days?: Record<string, unknown>;
  appointmentsById?: Record<string, CoziAppointment>;
  birthdaysById?: Record<string, CoziBirthday>;
  holidaysById?: Record<string, CoziHoliday>;
}

export interface CoziAppointment {
  itemType: 'appointment';
  id?: string; // Optional for creation
  version?: number;

  // Creation/Edit payload wrappers
  create?: CoziAppointmentDetailsWrapper;
  edit?: CoziAppointmentDetailsWrapper;
  delete?: { id: string; version: number };

  // Recurrence modifiers
  selectedDay?: string;
  extent?: 'single' | 'forward' | 'all';

  // Notification
  notifyPersons?: string[] | Record<string, number>;

  // When reading
  subject?: string;
  location?: string;
  notes?: string;
  startDay?: string;
  startTime?: string;
  endTime?: string;
  attendees?: string[];
  reminders?: CoziReminder[];
  recurrence?: CoziRecurrence;
}

interface CoziAppointmentDetailsWrapper {
  startDay?: string;
  details?: CoziAppointmentDetails;
  reminders?: CoziReminder[];
  recurrence?: CoziRecurrence;
}

interface CoziAppointmentDetails {
  startTime?: string;
  endTime?: string;
  dateSpan?: number;
  subject?: string;
  location?: string;
  notes?: string;
  attendeeSet?: string[];
}

export interface CoziReminder {
  minutesBefore: number;
}

export interface CoziRecurrence {
  rules: CoziRecurrenceRule[];
}

export interface CoziRecurrenceRule {
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  interval: number;
  byDay?: string[]; // MO, TU, WE, etc.
  end: {
    until?: string;
    count?: number;
  };
}

export interface CoziCalendarSearchResponse {
  items: Record<
    string,
    {
      item: {
        description: string;
        itemDetails: { notes?: string };
      };
      highlight: {
        description: string;
        notes?: string;
      };
    }
  >;
}

// --- Recipes ---

export interface CoziRecipe {
  recipeId: string;
  name: string;
  description?: string;
  instructions?: string;
  ingredients: CoziIngredient[];
  photos: CoziPhoto[];
  recipeSource?: string;
  sourceRaw?: string;
  sourceUrl?: string;
  sourceUrlText?: string;
  sourceLogoUrl?: string;
  isPublished?: boolean;
  prepTimeText?: string;
  cookTimeText?: string;
  totalTimeText?: string;
  servings?: string;
  servingSize?: string;
  nutrition?: unknown;
  tags?: Record<string, string[]>;
}

export interface CoziIngredient {
  ingredientId?: string;
  name: string;
  amount?: string;
  unit?: string;
  parsedName?: string;
  preparation?: string;
}

export interface CreateRecipeRequest extends Omit<CoziRecipe, 'photos' | 'recipeId'> {
  recipeId?: string; // Optional for creation - server generates if not provided
}
