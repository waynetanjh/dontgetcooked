import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BirthdaysService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async getUpcoming(userId: string) {
    const timezone = this.configService.get<string>('TZ') || 'Asia/Singapore';
    const events = await this.prisma.event.findMany({
      where: {
        userId: userId,
      },
    });

    const today = new Date(
      new Date().toLocaleString('en-US', { timeZone: timezone }),
    );
    const currentYear = today.getFullYear();

    // Calculate next occurrence for each event
    const upcomingEvents = events
      .map((event) => {
        const eventDate = new Date(event.eventDate);
        const month = eventDate.getMonth();
        const day = eventDate.getDate();
        const originalYear = eventDate.getFullYear();

        let nextOccurrence: Date;
        let daysUntil: number;
        let yearCount: number;

        if (event.isRecurring) {
          // Recurring event: calculate next occurrence based on current year
          nextOccurrence = new Date(currentYear, month, day);

          // If the date has passed this year, use next year
          if (nextOccurrence < today) {
            nextOccurrence = new Date(currentYear + 1, month, day);
          }

          daysUntil = Math.ceil(
            (nextOccurrence.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          );

          // Calculate year count (how many years since the original date)
          yearCount = nextOccurrence.getFullYear() - originalYear;
        } else {
          // Non-recurring event: use the original date
          nextOccurrence = eventDate;

          daysUntil = Math.ceil(
            (nextOccurrence.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          );

          // For non-recurring events, yearCount is always 0
          yearCount = 0;
        }

        return {
          ...event,
          nextOccurrence: nextOccurrence.toISOString(),
          daysUntil,
          yearCount,
        };
      })
      // Filter out non-recurring events that have already passed
      .filter((event) => event.isRecurring || event.daysUntil >= 0);

    // Sort by days until next occurrence
    upcomingEvents.sort((a, b) => a.daysUntil - b.daysUntil);

    return {
      success: true,
      data: upcomingEvents,
      message: 'Upcoming events retrieved successfully',
    };
  }

  async exportCalendar(userId: string) {
    const events = await this.prisma.event.findMany({
      where: {
        userId: userId,
      },
    });
    
    // Generate iCalendar format
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Birthday Reminder App//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    events.forEach((event) => {
      const eventDate = new Date(event.eventDate);
      const year = eventDate.getFullYear();
      const month = String(eventDate.getMonth() + 1).padStart(2, '0');
      const day = String(eventDate.getDate()).padStart(2, '0');
      
      const dateStr = `${year}${month}${day}`;
      const uid = `${event.id}@birthdayreminder.app`;
      
      const summary = event.eventLabel
        ? `${event.name}'s ${event.eventLabel}`
        : event.name;
      
      const description = event.notes ? event.notes : '';

      const eventLines = [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART;VALUE=DATE:${dateStr}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
      ];

      // Only add RRULE if the event is recurring
      if (event.isRecurring) {
        eventLines.push('RRULE:FREQ=YEARLY');
      }

      eventLines.push(
        'BEGIN:VALARM',
        'TRIGGER:-PT9H',
        'ACTION:DISPLAY',
        `DESCRIPTION:${summary}`,
        'END:VALARM',
        'END:VEVENT',
      );

      icsContent.push(...eventLines);
    });

    icsContent.push('END:VCALENDAR');

    return icsContent.join('\r\n');
  }
}
