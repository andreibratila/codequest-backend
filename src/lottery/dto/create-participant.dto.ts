import { IsString } from 'class-validator';

export class CreateParticipantDto {
  @IsString()
  user_discord: string;
}
