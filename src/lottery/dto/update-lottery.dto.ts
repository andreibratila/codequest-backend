import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateIf,
  Length,
} from 'class-validator';

import { PartialType } from '@nestjs/mapped-types';
import { CreateLotteryDto } from './create-lottery.dto';

export class UpdateLotteryDto extends PartialType(CreateLotteryDto) {
  @IsOptional()
  @IsBoolean()
  public_access?: boolean;

  @ValidateIf((o) => o.public_access === false)
  @IsString()
  @Length(1, 255)
  secret_code?: string;
}
