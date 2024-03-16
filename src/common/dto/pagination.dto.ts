import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    default: 10,
    description: 'How many rows do you need',
  })
  @IsOptional()
  @IsPositive()
  @Max(40) // Maximum 40
  @Type(() => Number) // enableImplicitConversions: true
  limit?: number;

  @ApiProperty({
    default: 0,
    description: 'How many rows do you want to skip',
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number) // enableImplicitConversions: true
  offset?: number;

  @ApiProperty({
    default: '',
    description: 'If you want to see public, private or all',
  })
  @IsOptional()
  @IsString()
  @Length(3, 15)
  type?: 'public' | 'private';
}
