import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { google } from 'googleapis';
import { CalendarEvent } from './calendar-event.entity';

@Injectable()
export class CalendarIntegrationService {
  private readonly logger = new Logger(CalendarIntegrationService.name);
  private googleAuth: any;

  constructor() {
    // Initialize Google OAuth2 client
    if (process.env.GOOGLE_CALENDAR_CLIENT_ID && process.env.GOOGLE_CALENDAR_CLIENT_SECRET) {
      this.googleAuth = new google.auth.OAuth2(
        process.env.GOOGLE_CALENDAR_CLIENT_ID,
        process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        process.env.FRONTEND_URL + '/calendar/google/callback'
      );
    }
  }

  /**
   * Sync event to Google Calendar
   */
  async syncToGoogleCalendar(event: CalendarEvent, accessToken: string): Promise<string> {
    try {
      if (!this.googleAuth) {
        throw new BadRequestException('Google Calendar integration is not configured');
      }

      this.googleAuth.setCredentials({ access_token: accessToken });
      const calendar = google.calendar({ version: 'v3', auth: this.googleAuth });

      const googleEvent = {
        summary: event.title,
        description: event.description,
        location: event.location,
        start: {
          dateTime: event.startDate.toISOString(),
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: event.endDate.toISOString(),
          timeZone: 'America/New_York',
        },
      };

      if (event.googleEventId) {
        // Update existing event
        const response = await calendar.events.update({
          calendarId: 'primary',
          eventId: event.googleEventId,
          requestBody: googleEvent,
        });
        this.logger.log(`Updated Google Calendar event: ${response.data.id}`);
        return response.data.id;
      } else {
        // Create new event
        const response = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: googleEvent,
        });
        this.logger.log(`Created Google Calendar event: ${response.data.id}`);
        return response.data.id;
      }
    } catch (error) {
      this.logger.error('Error syncing to Google Calendar:', error);
      throw new BadRequestException('Failed to sync to Google Calendar: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Delete event from Google Calendar
   */
  async deleteFromGoogleCalendar(googleEventId: string, accessToken: string): Promise<void> {
    try {
      if (!this.googleAuth) {
        throw new BadRequestException('Google Calendar integration is not configured');
      }

      this.googleAuth.setCredentials({ access_token: accessToken });
      const calendar = google.calendar({ version: 'v3', auth: this.googleAuth });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: googleEventId,
      });

      this.logger.log(`Deleted Google Calendar event: ${googleEventId}`);
    } catch (error) {
      this.logger.error('Error deleting from Google Calendar:', error);
      throw new BadRequestException('Failed to delete from Google Calendar: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Sync event to Outlook Calendar
   */
  async syncToOutlookCalendar(event: CalendarEvent, accessToken: string): Promise<string> {
    try {
      const outlookEvent = {
        subject: event.title,
        body: {
          contentType: 'HTML',
          content: event.description || '',
        },
        start: {
          dateTime: event.startDate.toISOString(),
          timeZone: 'Eastern Standard Time',
        },
        end: {
          dateTime: event.endDate.toISOString(),
          timeZone: 'Eastern Standard Time',
        },
        location: {
          displayName: event.location || '',
        },
      };

      const url = event.outlookEventId
        ? `https://graph.microsoft.com/v1.0/me/events/${event.outlookEventId}`
        : 'https://graph.microsoft.com/v1.0/me/events';

      const method = event.outlookEventId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(outlookEvent),
      });

      if (!response.ok) {
        const errorData: any = await response.json();
        throw new Error(errorData.error?.message || 'Unknown error');
      }

      const data: any = await response.json();
      this.logger.log(`${event.outlookEventId ? 'Updated' : 'Created'} Outlook Calendar event: ${data.id}`);
      return data.id;
    } catch (error) {
      this.logger.error('Error syncing to Outlook Calendar:', error);
      throw new BadRequestException('Failed to sync to Outlook Calendar: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Delete event from Outlook Calendar
   */
  async deleteFromOutlookCalendar(outlookEventId: string, accessToken: string): Promise<void> {
    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/events/${outlookEventId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData: any = await response.json();
        throw new Error(errorData.error?.message || 'Unknown error');
      }

      this.logger.log(`Deleted Outlook Calendar event: ${outlookEventId}`);
    } catch (error) {
      this.logger.error('Error deleting from Outlook Calendar:', error);
      throw new BadRequestException('Failed to delete from Outlook Calendar: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Get Google OAuth URL for user authorization
   */
  getGoogleAuthUrl(): string {
    if (!this.googleAuth) {
      throw new BadRequestException('Google Calendar integration is not configured');
    }

    const scopes = ['https://www.googleapis.com/auth/calendar'];

    return this.googleAuth.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  }

  /**
   * Exchange Google authorization code for tokens
   */
  async getGoogleTokens(code: string): Promise<any> {
    if (!this.googleAuth) {
      throw new BadRequestException('Google Calendar integration is not configured');
    }

    const { tokens } = await this.googleAuth.getToken(code);
    return tokens;
  }

  /**
   * Get Outlook OAuth URL for user authorization
   */
  getOutlookAuthUrl(): string {
    const clientId = process.env.OUTLOOK_CLIENT_ID;
    if (!clientId) {
      throw new BadRequestException('Outlook Calendar integration is not configured');
    }

    const redirectUri = encodeURIComponent(process.env.FRONTEND_URL + '/calendar/outlook/callback');
    const scopes = encodeURIComponent('Calendars.ReadWrite offline_access');

    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}`;
  }

  /**
   * Exchange Outlook authorization code for tokens
   */
  async getOutlookTokens(code: string): Promise<any> {
    const clientId = process.env.OUTLOOK_CLIENT_ID;
    const clientSecret = process.env.OUTLOOK_CLIENT_SECRET;
    const redirectUri = process.env.FRONTEND_URL + '/calendar/outlook/callback';

    if (!clientId || !clientSecret) {
      throw new BadRequestException('Outlook Calendar integration is not configured');
    }

    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!response.ok) {
      const errorData: any = await response.json();
      throw new BadRequestException('Failed to get Outlook tokens: ' + errorData.error_description);
    }

    return await response.json();
  }
}
