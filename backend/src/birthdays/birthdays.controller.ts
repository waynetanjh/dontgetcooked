import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import { BirthdaysService } from './birthdays.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('birthdays')
@UseGuards(JwtAuthGuard)
export class BirthdaysController {
  constructor(private readonly birthdaysService: BirthdaysService) {}

  @Get('upcoming')
  getUpcoming() {
    return this.birthdaysService.getUpcoming();
  }

  @Get('calendar/export')
  @Header('Content-Type', 'text/calendar')
  @Header('Content-Disposition', 'attachment; filename="birthdays.ics"')
  async exportCalendar() {
    return this.birthdaysService.exportCalendar();
  }
}
