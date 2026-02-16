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
    const upcomingEvents = events.map((event) => {
      const eventDate = new Date(event.eventDate);
      const month = eventDate.getMonth();
      const day = eventDate.getDate();
      const originalYear = eventDate.getFullYear();

      // Create next occurrence in current year
      let nextOccurrence = new Date(currentYear, month, day);

      // If the date has passed this year, use next year
      if (nextOccurrence < today) {
        nextOccurrence = new Date(currentYear + 1, month, day);
      }

      const daysUntil = Math.ceil(
        (nextOccurrence.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Calculate year count (how many years since the original date)
      const yearCount = nextOccurrence.getFullYear() - originalYear;

      return {
        ...event,
        nextOccurrence: nextOccurrence.toISOString(),
        daysUntil,
        yearCount,
      };
    });

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

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART;VALUE=DATE:${dateStr}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        'RRULE:FREQ=YEARLY',
        'BEGIN:VALARM',
        'TRIGGER:-PT9H',
        'ACTION:DISPLAY',
        `DESCRIPTION:${summary}`,
        'END:VALARM',
        'END:VEVENT',
      );
    });

    icsContent.push('END:VCALENDAR');

    return icsContent.join('\r\n');
  }
}
