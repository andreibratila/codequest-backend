import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { InjectDiscordClient } from '@discord-nestjs/core';

import { Sequelize } from 'sequelize-typescript';
import { Order, UniqueConstraintError, Op } from 'sequelize';

import { validate as isUUID } from 'uuid';
import * as bcrypt from 'bcrypt';
import { Client } from 'discord.js';

import { Lottery } from './entities/lottery.entity';
import { Prizes } from './entities/prizes.entity';
import { Participants } from './entities/participants.entity';

import { CreateLotteryDto } from './dto/create-lottery.dto';
import { UpdateLotteryDto } from './dto/update-lottery.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { ChangeWinnerDto } from './dto/change-winner.dto';

@Injectable()
export class LotteryService {
  private readonly logger = new Logger('LotteryService');
  private dIdDiscordServer: number;

  constructor(
    @InjectModel(Lottery) private lotteryModel: typeof Lottery,
    @InjectModel(Prizes) private prizeModel: typeof Prizes,
    @InjectModel(Participants) private participantModel: typeof Participants,
    @InjectDiscordClient() private readonly clientDiscord: Client,
    private sequelize: Sequelize,
    private configService: ConfigService,
  ) {
    this.dIdDiscordServer = configService.get('dIdDiscordServer');
  }

  async createLottery(createLotteryDto: CreateLotteryDto) {
    const transaction = await this.sequelize.transaction();
    const lotteryData = {
      ...createLotteryDto,
      number_of_winners: createLotteryDto.prizes.length,

      prizes: createLotteryDto.prizes,
    };

    if (lotteryData.min_participants < lotteryData.number_of_winners) {
      throw new BadRequestException(
        'The minimum number of participants must be greater than or equal to the number of prizes to be distributed.',
      );
    }

    try {
      if (createLotteryDto.secret_code) {
        lotteryData.secret_code = await bcrypt.hashSync(
          createLotteryDto.secret_code,
          10,
        );
      }

      const lottery = await this.lotteryModel.create(lotteryData, {
        include: [this.prizeModel],
        transaction,
      });

      //If all is ok confirm the transaction
      await transaction.commit();
      return lottery;
    } catch (error) {
      await transaction.rollback();
      this.handleDBError(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, type = '' } = paginationDto;

    let whereCondition = {};

    // Determina la condición de búsqueda basada en el tipo
    if (type === 'public') {
      whereCondition = { public_access: true };
    } else if (type === 'private') {
      whereCondition = { public_access: false };
    }

    // Configurate the search options
    const options = {
      limit,
      offset,
      where: whereCondition,
      include: [this.prizeModel],
      order: [['createdAt', 'DESC']] as Order,
    };

    const response = await this.lotteryModel.findAndCountAll(options);
    return {
      data: response.rows,
      count: response.count,
      limit,
      offset,
    };
  }

  async findOne(term: string) {
    let lottery: Lottery;

    if (isUUID(term)) {
      lottery = await this.findById({
        id: term,
        includePrizes: true,
      });
    } else {
      lottery = await this.lotteryModel.findOne({
        where: { slug: term },
        include: [this.prizeModel],
      });
    }

    if (!lottery) {
      throw new NotFoundException(`Lottery not found with slug '${term}'`);
    }

    return lottery;
  }

  async update(
    id: string,
    updateLotteryDto: UpdateLotteryDto,
  ): Promise<Lottery> {
    // Verify if lotery exists
    const lottery = await this.findById({ id, verifyFinishLotery: true });

    if (updateLotteryDto.secret_code) {
      const hashedSecretCode = await bcrypt.hash(
        updateLotteryDto.secret_code,
        10,
      );
      updateLotteryDto.secret_code = hashedSecretCode;
    }

    const { prizes, ...lotteryData } = updateLotteryDto;

    const updateData = {
      number_of_winners: updateLotteryDto.prizes.length,
      ...lotteryData,
    };

    if (updateData.min_participants < updateData.number_of_winners) {
      throw new BadRequestException(
        'The minimum number of participants must be greater than or equal to the number of prizes to be distributed.',
      );
    }

    const transaction = await this.sequelize.transaction();
    try {
      // Actualizar datos de la lotería, excluyendo los premios

      await lottery.update(lotteryData, { transaction });

      // Eliminar todos los premios existentes asociados a esta lotería
      await this.prizeModel.destroy({
        where: { lotteryId: id },
        transaction,
      });

      // Crear los nuevos premios con los datos proporcionados
      if (prizes && Array.isArray(prizes)) {
        for (const prizeData of prizes) {
          await this.prizeModel.create(
            {
              ...prizeData,
              lotteryId: id,
            },
            { transaction },
          );
        }
      }

      await transaction.commit();
      return await this.findById({ id, includePrizes: true });
    } catch (error) {
      // En caso de error, revertir la transacción
      await transaction.rollback();
      this.handleDBError(error);
    }
  }

  async remove(id: string) {
    const deletionResponse = await this.lotteryModel.destroy({
      where: { id },
    });

    if (deletionResponse === 0) {
      throw new NotFoundException(`Lottery not found with id '${id}'.`);
    }

    return { deleted: true };
  }

  async addParticipants(term: string, addParticipants: CreateParticipantDto) {
    const result = await this.findOne(term);
    const { user_discord, secretCode } = addParticipants;

    if (result.finished) {
      throw new BadRequestException(
        `Lottery with id or slug: ${term} is finished`,
      );
    }
    if (!result.public_access) {
      if (!secretCode) {
        throw new BadRequestException(
          'You need to provide the secred code to participate',
        );
      }
      const validSecretCode = await bcrypt.compareSync(
        secretCode,
        result.secret_code,
      );
      if (!validSecretCode) {
        throw new UnauthorizedException('Credentials are not valid');
      }
    }
    if (
      result.max_participants &&
      result.max_participants <= result.ammount_participants
    ) {
      throw new BadRequestException(
        'The lottery is full, no more users can register',
      );
    }

    const deadline = new Date(result.end_date);
    const now = new Date();
    if (deadline < now) {
      throw new BadRequestException(
        'The registration time for the giveaway has ended, you can no longer register',
      );
    }

    await this.verifyDiscordMember(user_discord);

    const { id } = result;
    const transaction = await this.sequelize.transaction();
    try {
      const participants = await this.participantModel.create(
        { user_discord, lotteryId: id },
        {
          transaction,
        },
      );

      await result.update(
        { ammount_participants: result.ammount_participants + 1 },
        { transaction },
      );

      await transaction.commit();
      return participants;
    } catch (error) {
      await transaction.rollback();
      this.handleDBError(error);
    }
    return result;
  }

  async generateWinner(id: string) {
    const lottery = await this.findById({
      id,
      includeParticipants: true,
      includePrizes: true,
      verifyFinishLotery: true,
    });

    // veryify if there are winners asigned
    const alreadyHasWinners = lottery.prizes.some((prize) => prize.winner);
    if (alreadyHasWinners) {
      throw new BadRequestException(
        'Winners have already been assigned for this lottery.',
      );
    }

    if (
      !lottery.participants ||
      lottery.participants.length < lottery.number_of_winners
    ) {
      throw new BadRequestException('Not enough participants');
    }

    if (lottery.ammount_participants > lottery.min_participants) {
      throw new BadRequestException(
        `minimum participants have not been reached. actual participants: ${lottery.ammount_participants}, minumum participants:${lottery.min_participants}`,
      );
    }

    // Verify if the countdown finished
    const deadline = new Date(lottery.end_date);
    const now = new Date();
    if (deadline > now) {
      throw new BadRequestException(
        'The current date is less than the deadline to register users, you cannot generate winners',
      );
    }

    const transaction = await this.sequelize.transaction();
    try {
      const winners = new Set();
      const positions = lottery.prizes.map((prize) => prize.position).sort();

      const ammountPositions = positions.length;

      while (winners.size < ammountPositions) {
        const randomIndex = Math.floor(
          Math.random() * lottery.participants.length,
        );
        winners.add(lottery.participants[randomIndex].user_discord);
      }

      const winnersUser = Array.from(winners);
      for (let i = 0; i < positions.length && i < winnersUser.length; i++) {
        await this.prizeModel.update(
          { winner: winnersUser[i].toString() },
          { where: { lotteryId: id, position: positions[i] }, transaction },
        );
      }

      await transaction.commit();

      return `Winners assigned for lottery ${id}`;
    } catch (error) {
      await transaction.rollback();
      this.handleDBError(error);
    }
  }

  async changeWinner(id: string, changeWinner: ChangeWinnerDto) {
    const lottery = await this.findById({
      id,
      includeParticipants: true,
      includePrizes: true,
      verifyFinishLotery: true,
    });

    // Find the prize to change based on the current winner we want to replace
    const prizeToChange = lottery.prizes.find(
      (prize) => prize.winner === changeWinner.changeWinner,
    );

    if (!prizeToChange) {
      throw new NotFoundException('Prize for the specified winner not found.');
    }

    // Arrray with current winners
    const currentWinners = lottery.prizes
      .filter((prize) => prize.winner)
      .map((prize) => prize.winner);

    // array with all participants excluding the currents winners
    const eligibleParticipants = lottery.participants.filter(
      (participant) => !currentWinners.includes(participant.user_discord),
    );

    const transaction = await this.sequelize.transaction();
    try {
      let newWinner;
      const participants = eligibleParticipants.length;
      do {
        const randomIndex = Math.floor(Math.random() * participants);
        newWinner = eligibleParticipants[randomIndex].user_discord;
      } while (currentWinners.includes(newWinner));

      await this.prizeModel.update(
        { winner: newWinner },
        { where: { id: prizeToChange.id }, transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      this.handleDBError(error);
    }

    return prizeToChange;
  }

  async lotteryFinished(id: string) {
    const lottery = await this.findById({ id });

    const transaction = await this.sequelize.transaction();
    try {
      await lottery.update({ finished: true }, { transaction });
      await transaction.commit();

      return await this.findById({ id });
    } catch (error) {
      await transaction.rollback();
      this.handleDBError(error);
    }
  }

  private async findById({
    id,
    includePrizes = false,
    includeParticipants = false,
    verifyFinishLotery = false,
  }) {
    const includes = [
      includeParticipants ? this.participantModel : null,
      includePrizes ? this.prizeModel : null,
    ].filter((model) => model !== null);

    const lottery = await this.lotteryModel.findByPk(id, {
      include: includes,
    });

    if (!lottery) {
      throw new NotFoundException(`Lottery not found with id '${id}'.`);
    }

    if (verifyFinishLotery) {
      if (lottery.finished) {
        throw new BadRequestException(`Lottery with id: ${id} is finished`);
      }
    }

    return lottery;
  }

  private async verifyDiscordMember(queryUser: string) {
    let guild;

    try {
      guild = await this.clientDiscord.guilds.fetch(
        this.dIdDiscordServer.toString(),
      );
      // console.log('guild', guild);
    } catch (error) {
      this.logger.log(`Error: ${error.message}\nStack: ${error.stack}`);
      console.log('error en verify', error);
      throw new InternalServerErrorException(
        'See the Lottery logs (verifyDiscordMember)',
      );
    }
    const searchOptions = { query: queryUser, limit: 1 };
    const members = await guild.members.search(searchOptions);

    if (members.size === 0) {
      throw new UnauthorizedException('The user id dont exists in the server');
    }
    console.log('no hay miembro');

    return;
  }

  private handleDBError(error) {
    if (error instanceof UniqueConstraintError) {
      if (error.fields && error.fields.slug) {
        throw new ConflictException('The slug is in use, please select other');
      }
      if (error.fields && error.fields.position) {
        throw new ConflictException('There are 2 prizes with same position');
      }
      if (error.fields && error.fields.user_discord) {
        throw new ConflictException('This user is registered');
      }
      throw new ConflictException('A unique constraint violation occurred.');
    }

    this.logger.log(`Error: ${error.message}\nStack: ${error.stack}`);
    throw new InternalServerErrorException('See the Lottery Logs');
  }
}
