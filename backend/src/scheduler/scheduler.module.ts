import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [ScheduleModule.forRoot(), forwardRef(() => TelegramModule)],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
