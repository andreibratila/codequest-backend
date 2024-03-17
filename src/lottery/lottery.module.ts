import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DiscordModule } from '@discord-nestjs/core';

import { LotteryService } from './lottery.service';
import { LotteryController } from './lottery.controller';

import { AuthModule } from 'src/auth/auth.module';

import { Lottery } from './entities/lottery.entity';
import { Prizes } from './entities/prizes.entity';
import { Participants } from './entities/participants.entity';

@Module({
  controllers: [LotteryController],
  providers: [LotteryService],
  imports: [
    AuthModule,
    SequelizeModule.forFeature([Lottery, Prizes, Participants]),
    DiscordModule.forFeature(),
  ],
})
export class LotteryModule {}
