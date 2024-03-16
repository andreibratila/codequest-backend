import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { JoiValidationSchema } from './config/joi.validation';
import { EnvConfiguration } from './config/env.config';

import { AuthModule } from './auth/auth.module';
import { LotteryModule } from './lottery/lottery.module';
import { CommonModule } from './common/common.module';

import { Auth } from './auth/entities/auth.entity';
import { SeedModule } from './seed/seed.module';

import { Lottery } from './lottery/model/lottery.model';
import { Prizes } from './prizes/model/prizes.model';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
      isGlobal: true,
    }),

    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: EnvConfiguration().dbHost,
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'mydb',
      autoLoadModels: true,
      synchronize: true, // TODO: false in production make validation with env configuration
      models: [Auth, Lottery, Prizes],
    }),
    SequelizeModule.forFeature([Lottery, Prizes]),

    AuthModule,
    LotteryModule,
    CommonModule,
    SeedModule,
  ],
  controllers: [],
  providers: [],
  exports: [SequelizeModule],
})
export class AppModule {}
