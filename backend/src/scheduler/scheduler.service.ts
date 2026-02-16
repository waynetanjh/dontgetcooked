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

  // Daily cron job - reads from CRON_TIME env var, defaults to 9:00 AM
  @Cron(process.env.CRON_TIME || '0 9 * * *', {
    timeZone: 'Asia/Singapore',
  })
  async handleDailyReminders() {
    await this.sendTodaysBirthdayNotifications();
  }

  // Public method to send today's birthday notifications (can be called manually)
  async sendTodaysBirthdayNotifications(): Promise<{
    count: number;
    events: string[];
  }> {
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

      // Get all users with linked Telegram chats
      const users = await this.prisma.user.findMany({
        where: {
          chatId: {
            not: null,
          },
        },
      });

      if (users.length === 0) {
        this.logger.log('No users with linked Telegram chats');
        return { count: 0, events: [] };
      }

      this.logger.log(`Found ${users.length} user(s) with linked chats`);

      const sentEvents: string[] = [];

      // Send notifications to each user for THEIR events only
      for (const user of users) {
        // Get only this user's events
        const userEvents = await this.prisma.event.findMany({
          where: {
            userId: user.id,
          },
        });

        // Filter events that match today's date (ignore year)
        const todaysEvents = userEvents.filter((event) => {
          const eventDate = new Date(event.eventDate);
          const eventMonth = eventDate.getMonth() + 1;
          const eventDay = eventDate.getDate();

          return eventMonth === todayMonth && eventDay === todayDay;
        });

        if (todaysEvents.length === 0) {
          this.logger.log(`No events for today for user ${user.email}`);
          continue;
        }

        this.logger.log(
          `Found ${todaysEvents.length} event(s) for today for user ${user.email}`,
        );

        for (const event of todaysEvents) {
          try {
            const success =
              await this.telegramService.sendBirthdayReminderToUser(
                user.id,
                event.name,
                event.eventLabel ?? undefined,
                event.notes ?? undefined,
              );

            if (success) {
              this.logger.log(
                `Sent reminder for ${event.name} to user ${user.email}`,
              );
              sentEvents.push(`${event.name} -> ${user.email}`);
            } else {
              this.logger.warn(
                `Failed to send reminder for ${event.name} to user ${user.email}`,
              );
            }
          } catch (error) {
            this.logger.error(
              `Error sending reminder for ${event.name} to ${user.email}: ${error.message}`,
            );
          }
        }
      }

      return { count: sentEvents.length, events: sentEvents };
    } catch (error) {
      this.logger.error(`Error in daily reminder check: ${error.message}`);
      throw error;
    }
  }
}
