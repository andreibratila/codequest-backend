import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Sequelize } from 'sequelize-typescript';
import { Order, UniqueConstraintError, Op } from 'sequelize';

import { validate as isUUID } from 'uuid';

import { CreateLotteryDto } from './dto/create-lottery.dto';
import { UpdateLotteryDto } from './dto/update-lottery.dto';

import { Lottery } from './entities/lottery.entity';
import { Prizes } from './entities/prizes.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class LotteryService {
  private readonly logger = new Logger('LotteryService');

  constructor(
    @InjectModel(Lottery) private lotteryModel: typeof Lottery,
    @InjectModel(Prizes) private prizeModel: typeof Prizes,
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

  // update(id: number, updateLotteryDto: UpdateLotteryDto) {
  //   return `This action updates a #${id} lottery`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} lottery`;
  // }

  private handleDBError(error) {
    if (error instanceof UniqueConstraintError && error.fields.slug) {
      throw new BadRequestException('The slug is in use, please select other');
    }

    this.logger.log(`Error: ${error.message}\nStack: ${error.stack}`);
    throw new InternalServerErrorException('See the Lottery Logs');
  }
}
