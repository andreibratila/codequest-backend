import { IsString, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLotteryDto {
  @ApiProperty()
  @IsString()
  lottery_name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  min_participants: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  max_participants: number;

  @ApiProperty()
  @IsBoolean()
  public_access: boolean;

  @ApiProperty()
  @IsString()
  secret_code: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  number_of_winners: number;

  @ApiProperty()
  @IsString()
  id_server: string;
}

export class UpdateLotteryDto extends CreateLotteryDto {
  @ApiProperty()
  id: number;
}
