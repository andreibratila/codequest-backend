import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Sequelize } from 'sequelize-typescript';
import { Order, UniqueConstraintError, Op } from 'sequelize';

import { validate as isUUID } from 'uuid';

import { Lottery } from './entities/lottery.entity';
import { Prizes } from './entities/prizes.entity';

import { CreateLotteryDto } from './dto/create-lottery.dto';
import { UpdateLotteryDto } from './dto/update-lottery.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { Participants } from './entities/participants.entity';

@Injectable()
export class LotteryService {
  private readonly logger = new Logger('LotteryService');

  constructor(
    @InjectModel(Lottery) private lotteryModel: typeof Lottery,
    @InjectModel(Prizes) private prizeModel: typeof Prizes,
    @InjectModel(Participants) private participantModel: typeof Participants,
    private sequelize: Sequelize,
  ) {}

  async createLottery(createLotteryDto: CreateLotteryDto) {
    const transaction = await this.sequelize.transaction();

    try {
      const lottery = await this.lotteryModel.create(
        {
          ...createLotteryDto,
          prizes: createLotteryDto.prizes,
        },
        {
          include: [this.prizeModel],
          transaction, // Use transaction here
        },
      );

      //If all is ok confirm the transaction
      await transaction.commit();
      return lottery;
    } catch (error) {
      await transaction.rollback(); // If somethinks bad revert transaction
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
    console.log(term, 'term');
    if (isUUID(term)) {
      console.log('is uuid');
      lottery = await this.lotteryModel.findOne({
        where: { id: term },

        include: [this.prizeModel],
      });
    } else {
      lottery = await this.lotteryModel.findOne({
        where: { slug: term },
        include: [this.prizeModel],
      });
    }

    if (!lottery) {
      throw new NotFoundException(
        `Lottery not found with id or slug '${term}'`,
      );
    }

    return lottery;
  }

  async update(
    id: string,
    updateLotteryDto: UpdateLotteryDto,
  ): Promise<Lottery> {
    // Verify if lotery exists
    const lottery = await this.lotteryModel.findByPk(id);
    if (!lottery) {
      throw new NotFoundException(`Lottery not found with id '${id}'.`);
    }

    const transaction = await this.sequelize.transaction();
    try {
      // Actualizar datos de la lotería, excluyendo los premios
      const { prizes, ...lotteryData } = updateLotteryDto;
      lotteryData.secret_code = updateLotteryDto.secret_code ?? '';

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

      // Confirmar transacción
      await transaction.commit();

      // Devolver la lotería actualizada, incluyendo los premios nuevos
      return this.lotteryModel.findByPk(id, {
        include: [this.prizeModel],
      });
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
    const { id } = result;
    const transaction = await this.sequelize.transaction();
    //TODO: validate addParticipants with discord
    try {
      const participants = await this.participantModel.create(
        { ...addParticipants, lotteryId: id },
        {
          transaction,
        },
      );

      //If all is ok confirm the transaction
      await transaction.commit();
      return participants;
    } catch (error) {
      await transaction.rollback();
      this.handleDBError(error);
    }
    return result;
  }

  async generateWinner(id: string) {
    const lottery = await this.lotteryModel.findOne({
      where: { id },

      include: [this.prizeModel, this.participantModel],
    });
    if (!lottery) {
      throw new NotFoundException(`Lottery not found with id '${id}'`);
    }
    //TODO: verificar que el tiempo se cumple para llamar aqui
    if (
      !lottery.participants ||
      lottery.participants.length < lottery.number_of_winners
    ) {
      throw new BadRequestException('Not enough participants');
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
        winners.add(lottery.participants[randomIndex].id);
      }

      const winnerIds = Array.from(winners);
      for (let i = 0; i < positions.length && i < winnerIds.length; i++) {
        await this.prizeModel.update(
          { winner: winnerIds[i].toString() },
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
