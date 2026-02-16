import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BirthdaysService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async getUpcoming() {
    const timezone = this.configService.get<string>('TZ') || 'Asia/Singapore';
    const friends = await this.prisma.friend.findMany();

    const today = new Date(
      new Date().toLocaleString('en-US', { timeZone: timezone }),
    );
    const currentYear = today.getFullYear();

    // Calculate next occurrence for each event
    const upcomingEvents = friends.map((friend) => {
      const eventDate = new Date(friend.eventDate);
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
        ...friend,
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

  async exportCalendar() {
    const friends = await this.prisma.friend.findMany();
    
    // Generate iCalendar format
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Birthday Reminder App//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    friends.forEach((friend) => {
      const eventDate = new Date(friend.eventDate);
      const year = eventDate.getFullYear();
      const month = String(eventDate.getMonth() + 1).padStart(2, '0');
      const day = String(eventDate.getDate()).padStart(2, '0');
      
      const dateStr = `${year}${month}${day}`;
      const uid = `${friend.id}@birthdayreminder.app`;
      
      const summary = friend.eventLabel
        ? `${friend.name}'s ${friend.eventLabel}`
        : friend.name;
      
      const description = friend.notes ? friend.notes : '';

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
