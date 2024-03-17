import { IsOptional, IsString, Length } from 'class-validator';

export class CreateParticipantDto {
  @IsString()
  user_discord: string;

  @IsString()
  @IsOptional()
  @Length(1, 255)
  secretCode: string;
}
