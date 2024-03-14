import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

import { Auth } from 'src/auth/entities/auth.entity';

@Module({
  imports: [SequelizeModule.forFeature([Auth])],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
