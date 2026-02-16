import { Controller, Post, UseGuards } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { SchedulerService } from '../scheduler/scheduler.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('telegram')
@UseGuards(JwtAuthGuard)
export class TelegramController {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly schedulerService: SchedulerService,
  ) {}

  @Post('test')
  async test() {
    const success = await this.telegramService.sendTestMessage();

    if (success) {
      return {
        success: true,
        data: null,
        message: 'Test notification sent successfully',
      };
    } else {
      return {
        success: false,
        data: null,
        message: 'Failed to send test notification. Please check your Telegram configuration.',
      };
    }
  }

  @Post('today-birthdays')
  async sendTodayBirthdays() {
    try {
      const result =
        await this.schedulerService.sendTodaysBirthdayNotifications();

      if (result.count === 0) {
        return {
          success: true,
          data: result,
          message: 'No birthdays today',
        };
      }

      return {
        success: true,
        data: result,
        message: `Sent ${result.count} birthday notification(s) successfully`,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'Failed to send birthday notifications. Please check your configuration.',
      };
    }
  }
}
