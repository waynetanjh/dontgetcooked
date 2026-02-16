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

Your Telegram account (@${telegramUsername}) is now linked to your Don't Get Cooked account.

You'll automatically receive daily notifications for:
🎂 Birthdays
💝 Anniversaries  
🎉 Special events

Head to <b>Settings</b> on the website to send a test notification and make sure everything works!

Notifications are sent once daily at 9:00 AM (SGT) if there are any events for the day.

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
        // No account yet — save pending link so we can auto-link on registration
        await this.prisma.pendingTelegramLink.upsert({
          where: { telegramUsername },
          update: { chatId: BigInt(chatId) },
          create: {
            telegramUsername,
            chatId: BigInt(chatId),
          },
        });

        const welcomeMessage = `
Hello ${displayName}! 👋

Welcome to <b>Don't Get Cooked</b> — your personal event reminder bot! 🎂

<b>To complete setup:</b>
1. Go to <a href="https://dontgetcooked.vercel.app">dontgetcooked.vercel.app</a>
2. Create an account using <b>@${telegramUsername}</b> as your Telegram username
3. That's it! I'll message you here once your account is linked ✅

Once set up, you'll receive daily notifications at 9:00 AM (SGT) for your events.
        `.trim();

        await this.bot.sendMessage(chatId, welcomeMessage, {
          parse_mode: 'HTML',
        });

        this.logger.log(
          `Saved pending Telegram link for @${telegramUsername} (chat ${chatId})`,
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
