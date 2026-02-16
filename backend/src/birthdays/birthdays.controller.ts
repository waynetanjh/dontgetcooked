import { Controller, Get, Header, UseGuards, Request } from '@nestjs/common';
import { BirthdaysService } from './birthdays.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('birthdays')
@UseGuards(JwtAuthGuard)
export class BirthdaysController {
  constructor(private readonly birthdaysService: BirthdaysService) {}

  @Get('upcoming')
  getUpcoming(@Request() req) {
    const userId = req.user.id;
    return this.birthdaysService.getUpcoming(userId);
  }

  @Get('calendar/export')
  @Header('Content-Type', 'text/calendar')
  @Header('Content-Disposition', 'attachment; filename="birthdays.ics"')
  async exportCalendar(@Request() req) {
    const userId = req.user.id;
    return this.birthdaysService.exportCalendar(userId);
  }
}
