import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramService {
  private bot: TelegramBot;
  private chatId: string;
  private readonly logger = new Logger(TelegramService.name);

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');

    if (token && token !== 'your-telegram-bot-token') {
      try {
        this.bot = new TelegramBot(token, { polling: false });
      } catch (error) {
        this.logger.error('Failed to initialize Telegram bot', error);
      }
    } else {
      this.logger.warn('Telegram bot token not configured');
    }
  }

  async sendMessage(message: string): Promise<boolean> {
    if (!this.bot || !this.chatId || this.chatId === 'your-telegram-chat-id') {
      this.logger.warn('Telegram bot not configured properly');
      return false;
    }

    try {
      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'HTML',
      });
      this.logger.log(`Message sent successfully: ${message}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send Telegram message: ${error.message}`);
      return false;
    }
  }

  async sendTestMessage(): Promise<boolean> {
    const testMessage =
      '🎉 Test notification from Birthday Reminder App! Your notifications are working correctly.';
    return this.sendMessage(testMessage);
  }

  async sendBirthdayReminder(
    name: string,
    eventLabel?: string,
    notes?: string,
  ): Promise<boolean> {
    let message = `🎂 ${name}`;

    if (eventLabel) {
      message += `'s ${eventLabel}`;
    }

    if (notes) {
      message += `\n\nNote: ${notes}`;
    }

    return this.sendMessage(message);
  }
}
