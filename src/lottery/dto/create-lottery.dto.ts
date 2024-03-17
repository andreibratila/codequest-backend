import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
  IsArray,
  ValidateNested,
  ValidateIf,
  IsDateString,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

import { Prizes } from '../entities/prizes.entity';

import { PrizeDto } from './prize.dto';

export class CreateLotteryDto {
  @IsString()
  @Length(1, 255)
  lottery_name: string;

  @IsString()
  @Length(1, 500)
  description: string;

  @IsInt()
  @Min(1)
  min_participants: number;

  @IsInt()
  @IsOptional()
  max_participants?: number;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsBoolean()
  public_access: boolean;

  @IsDateString()
  end_date: string;

  @ValidateIf((o) => o.public_access === false)
  @IsString()
  @Length(1, 255)
  secret_code?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PrizeDto)
  prizes: Prizes[];
}
