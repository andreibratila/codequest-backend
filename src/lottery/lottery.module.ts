import { Module } from '@nestjs/common';
import { LotteryService } from './lottery.service';
import { LotteryController } from './lottery.controller';
import { Lottery } from './model/lottery.model';
import { Participants } from 'src/participants/model/participants.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([Lottery, Participants])],
  controllers: [LotteryController],
  providers: [LotteryService],
})
export class LotteryModule {}
