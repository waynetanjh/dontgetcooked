import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [ScheduleModule.forRoot(), TelegramModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
