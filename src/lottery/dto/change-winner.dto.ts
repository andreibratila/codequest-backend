import { IsString } from 'class-validator';

export class ChangeWinnerDto {
  @IsString()
  changeWinner: string;
}
