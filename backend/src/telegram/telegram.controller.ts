import { Controller, Post, UseGuards } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('telegram')
@UseGuards(JwtAuthGuard)
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

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
}
