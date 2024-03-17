import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { JoiValidationSchema } from './config/joi.validation';
import { EnvConfiguration } from './config/env.config';

import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';
import { CommonModule } from './common/common.module';
import { LotteryModule } from './lottery/lottery.module';

import { Auth } from './auth/entities/auth.entity';
import { Lottery } from './lottery/entities/lottery.entity';
import { Participants } from './lottery/entities/participants.entity';
import { Prizes } from './lottery/entities/prizes.entity';
import { DiscordModule } from '@discord-nestjs/core';
import { GatewayIntentBits } from 'discord.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
      isGlobal: true,
    }),

    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        dialect: configService.get<
          'postgres' | 'mysql' | 'sqlite' | 'mariadb' | 'mssql'
        >('dbDialect'),
        host: configService.get<string>('dbHost'),
        port: configService.get<number>('dbPort'),
        username: configService.get<string>('dbUsername'),
        password: configService.get<string>('dbPassword'),
        database: configService.get<string>('dbDatabase'),
        autoLoadModels: true,
        synchronize: configService.get<boolean>('dbSynchronize'),
        models: [Auth, Lottery, Participants, Prizes],
      }),
      inject: [ConfigService],
    }),
    SequelizeModule.forFeature([]),

    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        token: configService.get<string>('dBotId'),
        discordClientOptions: {
          intents: [GatewayIntentBits.Guilds],
        },
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    CommonModule,
    SeedModule,
    LotteryModule,
  ],
  controllers: [],
  providers: [],
  exports: [SequelizeModule],
})
export class AppModule {}
