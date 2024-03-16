import {
  Model,
  Column,
  Table,
  PrimaryKey,
  Unique,
  ForeignKey,
} from 'sequelize-typescript';
import { Participants } from 'src/participants/model/participants.model';

@Table
export class Lottery extends Model<Lottery> {
  @PrimaryKey
  @Unique
  @Column
  id: number;

  @Column
  lottery_name: string;

  @Column
  description: string;

  @Column
  min_participants: number;

  @Column
  max_participants: number;

  @Column
  public_access: boolean;

  @Column
  secret_code: string;

  @Column
  number_of_winners: number;

  @Column
  @ForeignKey(() => Participants)
  participants: number;
}
