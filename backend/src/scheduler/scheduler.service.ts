import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private telegramService: TelegramService,
    private configService: ConfigService,
  ) {}

  // Daily cron job - default at 9:00 AM (0 9 * * *)
  @Cron('0 9 * * *', {
    timeZone: 'Asia/Singapore',
  })
  async handleDailyReminders() {
    this.logger.log('Running daily birthday reminder check...');

    try {
      const timezone =
        this.configService.get<string>('TZ') || 'Asia/Singapore';
      const today = new Date(
        new Date().toLocaleString('en-US', { timeZone: timezone }),
      );
      const todayMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
      const todayDay = today.getDate();

      this.logger.log(`Checking for events on ${todayMonth}/${todayDay}`);

      // Get all friends
      const friends = await this.prisma.friend.findMany();

      // Filter events that match today's date (ignore year)
      const todaysEvents = friends.filter((friend) => {
        const eventDate = new Date(friend.eventDate);
        const eventMonth = eventDate.getMonth() + 1;
        const eventDay = eventDate.getDate();

        return eventMonth === todayMonth && eventDay === todayDay;
      });

      if (todaysEvents.length === 0) {
        this.logger.log('No events for today');
        return;
      }

      this.logger.log(`Found ${todaysEvents.length} event(s) for today`);

      // Send notification for each event
      for (const event of todaysEvents) {
        try {
          const success = await this.telegramService.sendBirthdayReminder(
            event.name,
            event.eventLabel,
            event.notes,
          );

          if (success) {
            this.logger.log(`Sent reminder for: ${event.name}`);
          } else {
            this.logger.warn(`Failed to send reminder for: ${event.name}`);
          }
        } catch (error) {
          this.logger.error(
            `Error sending reminder for ${event.name}: ${error.message}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error in daily reminder check: ${error.message}`);
    }
  }
}
