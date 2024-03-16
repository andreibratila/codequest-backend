import {
  Model,
  Column,
  Table,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  DataType,
  Unique,
  Default,
} from 'sequelize-typescript';
import { Lottery } from './lottery.entity';

@Table
export class Prizes extends Model<Prizes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Unique
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => Lottery)
  @Column(DataType.UUID)
  lotteryId: string;

  // Include data to asociated library
  // TODO: maibe delete
  @BelongsTo(() => Lottery)
  lottery: Lottery;

  @Column
  position: number;

  @Column
  prize: string;
}
