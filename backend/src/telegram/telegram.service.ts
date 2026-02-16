import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramService {
  private bot: TelegramBot;
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    if (token && token !== 'your-telegram-bot-token') {
      try {
        this.bot = new TelegramBot(token, { polling: true });
        this.setupCommands();
        this.logger.log('Telegram bot initialized with long-polling');
      } catch (error) {
        this.logger.error('Failed to initialize Telegram bot', error);
      }
    } else {
      this.logger.warn('Telegram bot token not configured');
    }
  }

  private setupCommands(): void {
    // Handle /start command - Auto-link chat to user account
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramUsername = msg.from?.username;
      const displayName = msg.from?.first_name || 'there';

      if (!telegramUsername) {
        const noUsernameMessage = `
Hello ${displayName}! 👋

⚠️ <b>Username Required</b>

To use this bot, you need to set a Telegram username:
1. Go to Telegram Settings
2. Set a username (e.g., @yourname)
3. Come back and press /start again

A username is required so we can link your account securely.
        `.trim();

        await this.bot.sendMessage(chatId, noUsernameMessage, {
          parse_mode: 'HTML',
        });
        return;
      }

      // Try to find user by telegram username (case-insensitive)
      const user = await this.prisma.user.findFirst({
        where: {
          telegramUsername: {
            equals: telegramUsername,
            mode: 'insensitive',
          },
        },
      });

      if (user) {
        // Link chat to existing user
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            chatId: BigInt(chatId),
            chatLinkedAt: new Date(),
          },
        });

        const linkedMessage = `
Hello ${displayName}! 👋

✅ <b>Chat Linked Successfully!</b>

Your Telegram account (@${telegramUsername}) is now linked to your Birthday Reminder account.

You'll automatically receive daily notifications for:
🎂 Birthdays
💝 Anniversaries  
🎉 Special events

<b>Commands:</b>
/start - Link or relink your account
/unlink - Unlink this chat
/status - Check link status
        `.trim();

        await this.bot.sendMessage(chatId, linkedMessage, {
          parse_mode: 'HTML',
        });

        this.logger.log(
          `Chat ${chatId} linked to user ${user.email} (@${telegramUsername})`,
        );
      } else {
        // No account found with this username
        const noAccountMessage = `
Hello @${telegramUsername}! 👋

⚠️ <b>Account Not Found</b>

We couldn't find an account registered with your Telegram username (@${telegramUsername}).

<b>To get started:</b>
1. Create an account at the Birthday Reminder app
2. Use <b>@${telegramUsername}</b> as your Telegram username during registration
3. Come back here and press /start

Once you create an account, your notifications will be automatically enabled!
        `.trim();

        await this.bot.sendMessage(chatId, noAccountMessage, {
          parse_mode: 'HTML',
        });

        this.logger.log(
          `No user found for Telegram username @${telegramUsername}`,
        );
      }
    });

    // Handle /unlink command
    this.bot.onText(/\/unlink/, async (msg) => {
      const chatId = msg.chat.id;

      const user = await this.prisma.user.findFirst({
        where: { chatId: BigInt(chatId) },
      });

      if (user) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            chatId: null,
            chatLinkedAt: null,
          },
        });

        await this.bot.sendMessage(
          chatId,
          '✅ Chat unlinked successfully. Press /start to relink.',
        );
        this.logger.log(`Chat ${chatId} unlinked from user ${user.email}`);
      } else {
        await this.bot.sendMessage(chatId, '❌ No linked account found.');
      }
    });

    // Handle /status command
    this.bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;

      const user = await this.prisma.user.findFirst({
        where: { chatId: BigInt(chatId) },
      });

      if (user) {
        const statusMessage = `
✅ <b>Chat Linked</b>

<b>Account:</b> ${user.email}
<b>Telegram:</b> @${user.telegramUsername}
<b>Linked:</b> ${user.chatLinkedAt ? new Date(user.chatLinkedAt).toLocaleString() : 'Unknown'}

You'll receive daily notifications for your events!
        `.trim();

        await this.bot.sendMessage(chatId, statusMessage, {
          parse_mode: 'HTML',
        });
      } else {
        await this.bot.sendMessage(
          chatId,
          '❌ No linked account found. Press /start to link.',
        );
      }
    });
  }

  async sendMessageToChat(chatId: bigint, message: string): Promise<boolean> {
    if (!this.bot) {
      this.logger.warn('Telegram bot not configured');
      return false;
    }

    try {
      await this.bot.sendMessage(chatId.toString(), message, {
        parse_mode: 'HTML',
      });
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send message to chat ${chatId}: ${error.message}`,
      );
      return false;
    }
  }

  async sendTestMessageToUser(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.chatId) {
      this.logger.warn(`User ${userId} has no linked chat`);
      return false;
    }

    const testMessage =
      '🎉 Test notification from Birthday Reminder App! Your notifications are working correctly.';
    return this.sendMessageToChat(user.chatId, testMessage);
  }

  async sendBirthdayReminderToUser(
    userId: string,
    name: string,
    eventLabel?: string,
    notes?: string,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.chatId) {
      this.logger.warn(`User ${userId} has no linked chat`);
      return false;
    }

    let message = `🎂 ${name}`;

    if (eventLabel) {
      message += `'s ${eventLabel}`;
    }

    if (notes) {
      message += `\n\nNote: ${notes}`;
    }

    return this.sendMessageToChat(user.chatId, message);
  }
}
