import {
  Model,
  Column,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { Lottery } from './lottery.entity';

@Table
export class Participants extends Model<Participants> {
  @ForeignKey(() => Lottery)
  @Column(DataType.UUID)
  lotteryId: string;

  @BelongsTo(() => Lottery)
  lottery: Lottery;
}
