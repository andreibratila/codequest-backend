import { Injectable } from '@nestjs/common';
import { CreateLotteryDto } from './dto/create-lottery.dto';
import { UpdateLotteryDto } from './dto/update-lottery.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Lottery } from './model/lottery.model';
import { Participants } from 'src/participants/model/participants.model';

@Injectable()
export class LotteryService {
  constructor(
    @InjectModel(Lottery) private lotteryModel: typeof Lottery,
    @InjectModel(Participants) private participantsModel: typeof Participants,
  ) {}

  async create(createLotteryDto: CreateLotteryDto) {
    const lottery = await this.lotteryModel.create(createLotteryDto);

    return lottery;
  }

  async findAll() {
    const lotteries = await this.lotteryModel.findAll();

    return lotteries;
  }

  async findOne(id: number) {
    const lottery = await this.lotteryModel.findOne({
      where: { id },
      include: [{ model: Participants, as: 'participants' }],
    });

    return lottery;
  }

  async update(id: number, updateLotteryDto: UpdateLotteryDto) {
    const [numberOfAffectedRows, [lottery]] = await this.lotteryModel.update(
      updateLotteryDto,
      {
        where: { id },
        returning: true,
      },
    );

    return { numberOfAffectedRows, lottery };
  }

  async remove(id: number) {
    const lottery = await this.findOne(id);
    await lottery.destroy();

    return lottery;
  }

  async addParticipant(lotteryId: number, participantId: number) {
    const lottery = await this.lotteryModel.findByPk(lotteryId);

    if (!lottery) {
      throw new Error('Lottery not found');
    }

    //Search user in Discord and collect data and save in the database
    const participant = await this.participantsModel.findByPk(participantId);

    await lottery.$add('participant', participant);

    return lottery;
  }
}
