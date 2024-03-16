import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Prizes } from './model/prizes.model';
import { CreatePrizeDto } from './dto/create-prize.dto';

@Injectable()
export class PrizesService {
  constructor(@InjectModel(Prizes) private prizesModel: typeof Prizes) {}

  async create(createPrizesDto: CreatePrizeDto) {
    const prizes = await this.prizesModel.create(createPrizesDto);

    return prizes;
  }

  async findAll() {
    const prizes = await this.prizesModel.findAll();

    return prizes;
  }

  async findOne(id: number) {
    const prizes = await this.prizesModel.findByPk(id);

    return prizes;
  }

  async findLotteryPrizes(lottery_id: number) {
    const prizes = await this.prizesModel.findAll({
      where: { lottery_id },
    });

    return prizes;
  }

  async update(id: number, updatePrizesDto: CreatePrizeDto) {
    const [numberOfAffectedRows, [prizes]] = await this.prizesModel.update(
      updatePrizesDto,
      {
        where: { id },
        returning: true,
      },
    );

    return { numberOfAffectedRows, prizes };
  }

  async remove(id: number) {
    const prizes = await this.findOne(id);
    await prizes.destroy();

    return prizes;
  }
}
