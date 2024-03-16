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

@Table({
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['lotteryId', 'position'], // Crea un índice único compuesto por lotteryId y position
    },
    {
      unique: true,
      fields: ['lotteryId', 'winner'],
    },
  ],
})
export class Prizes extends Model<Prizes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Unique
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => Lottery)
  @Column(DataType.UUID)
  lotteryId: string;

  @BelongsTo(() => Lottery)
  lottery: Lottery;

  @Column
  position: number;

  @Column
  prize: string;

  @Column
  winner: string;
}
