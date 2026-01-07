import { BaseService } from './BaseService';
import {
  CoziCalendarResponse,
  CoziAppointment,
  CoziCalendarSearchResponse,
  CoziBirthday,
  CoziHoliday
} from '../types';
import { CoziCalendarResponseSchema, CoziCalendarSearchResponseSchema } from '../schemas';

export class CalendarService extends BaseService {
  /**
   * Get calendar for a specific month
   */
  async getCalendar(year: number, month: number): Promise<CoziCalendarResponse> {
    const accountId = this.requireAccountId();
    // Month should probably be 1-indexed based on typical API usage
    const response = await this.client.get<CoziCalendarResponse>(
      `/api/ext/2004/${accountId}/calendar/${year}/${month}`
    );
    return CoziCalendarResponseSchema.parse(response.data);
  }

  /**
   * Create appointments
   */
  async createAppointment(appointments: CoziAppointment[]): Promise<void> {
    const accountId = this.requireAccountId();
    // Calendar URL requires year/month. Usually standard rest API lets you post to Base collection?
    // Reference says: POST /api/ext/2004/{accountId}/calendar/{year}/{month}
    // "year/month" of what? The event?
    // If we create multiple events, they might span months?
    // Let's assume we use the start date of the first event to determine the URL,
    // or just checking if the API allows any efficient POST.
    // The Reference example uses: POST .../calendar/2026/1
    // for an event in "2026-01-15".
    // So we need to parse the date from the first appointment.

    if (appointments.length === 0) return;

    const firstAppt = appointments[0];
    const startDay = firstAppt.create?.startDay || firstAppt.startDay;
    if (!startDay) throw new Error('Appointment must have a startDay');

    const date = new Date(startDay);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    await this.client.post(
      this.withApiKey(`/api/ext/2004/${accountId}/calendar/${year}/${month}`),
      appointments
    );
  }

  /**
   * Update appointment
   */
  async updateAppointment(appointment: CoziAppointment): Promise<void> {
    const accountId = this.requireAccountId();

    // Need to extract date to build URL
    // For edits, we might need the ORIGINAL date?
    // The example says: edit: { startDay: "2026-01-15" }
    const startDay = appointment.edit?.startDay || appointment.startDay || appointment.selectedDay;
    if (!startDay) throw new Error('Update requires startDay to determine endpoint URL');

    const date = new Date(startDay);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    await this.client.post(
      this.withApiKey(`/api/ext/2004/${accountId}/calendar/${year}/${month}`),
      [appointment]
    );
  }

  /**
   * Delete appointment
   */
  async deleteAppointment(appointment: CoziAppointment): Promise<void> {
    const accountId = this.requireAccountId();

    // For deletes, we often just need ID, but Cozi docs say we post to the calendar/year/month
    // So we probably need to know the date of the event we are deleting?
    // The payload has "delete: { id: ... }"
    // But the URL is .../calendar/2026/1
    // It seems we must know the date.
    // If the caller just passes ID, we can't construct the URL.
    // The interface expects CoziAppointment which has recurrence/date info.
    // We'll rely on the caller providing a populated object or at least one with selectedDay/startDay.

    const targetDate = appointment.selectedDay || appointment.startDay;
    if (!targetDate)
      throw new Error(
        'Delete requires date context (selectedDay or startDay) to determine endpoint URL'
      );

    const date = new Date(targetDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    await this.client.post(
      this.withApiKey(`/api/ext/2004/${accountId}/calendar/${year}/${month}`),
      [appointment]
    );
  }

  /**
   * Search calendar
   */
  async search(query: string): Promise<CoziCalendarSearchResponse> {
    const accountId = this.requireAccountId();
    const response = await this.client.get<CoziCalendarSearchResponse>(
      this.withApiKey(`/api/ext/2004/${accountId}/search/calendar/`) +
      `&q=${encodeURIComponent(query)}`
    );
    return CoziCalendarSearchResponseSchema.parse(response.data);
  }

  /**
   * Get birthdays from calendar response
   * Helper that extracts birthdays embedded in calendar data
   */
  async getBirthdays(year: number, month: number): Promise<CoziBirthday[]> {
    const calendar = await this.getCalendar(year, month);
    if (!calendar.birthdaysById) return [];
    return Object.values(calendar.birthdaysById);
  }

  /**
   * Get holidays from calendar response
   * Helper that extracts holidays embedded in calendar data
   */
  async getHolidays(year: number, month: number): Promise<CoziHoliday[]> {
    const calendar = await this.getCalendar(year, month);
    if (!calendar.holidaysById) return [];
    return Object.values(calendar.holidaysById);
  }
}
