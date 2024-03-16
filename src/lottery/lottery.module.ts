import { Module } from '@nestjs/common';
import { LotteryService } from './lottery.service';
import { LotteryController } from './lottery.controller';
import { AuthModule } from 'src/auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Lottery } from './entities/lottery.entity';
import { Prizes } from './entities/prizes.entity';
import { Participants } from './entities/participants.entity';

@Module({
  controllers: [LotteryController],
  providers: [LotteryService],
  imports: [
    AuthModule,
    SequelizeModule.forFeature([Lottery, Prizes, Participants]),
  ],
})
export class LotteryModule {}
