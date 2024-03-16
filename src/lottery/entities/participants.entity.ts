import {
  Model,
  Column,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  BeforeCreate,
} from 'sequelize-typescript';
import { Lottery } from './lottery.entity';

@Table({
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['lotteryId', 'user_discord'],
    },
  ],
})
export class Participants extends Model<Participants> {
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
  user_discord: string;

  @BeforeCreate
  static createSlug(instance: Participants) {
    if (instance.user_discord) {
      instance.user_discord = instance.user_discord.trim();
    }
  }
}
