import { IsNotEmpty, IsString, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class CreateFriendDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  eventDate: string;

  @IsString()
  @IsOptional()
  eventLabel?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;
}
