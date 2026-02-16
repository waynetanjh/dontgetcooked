import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateFriendDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsDateString()
  @IsOptional()
  eventDate?: string;

  @IsString()
  @IsOptional()
  eventLabel?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
