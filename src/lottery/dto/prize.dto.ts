import { IsInt, IsString, Length } from 'class-validator';

export class PrizeDto {
  @IsInt()
  position: number;

  @IsString()
  @Length(1, 500)
  prize: string;
}
