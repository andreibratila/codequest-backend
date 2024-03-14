import { Model, Column, Table, ForeignKey } from 'sequelize-typescript';
import { Lottery } from '../../lottery/model/lottery.model';

@Table
export class Prizes extends Model<Prizes> {
  @Column
  prize_name: string;

  @Column
  description: string;

  @Column
  value: number;

  @Column
  @ForeignKey(() => Lottery)
  lottery_id: number;
}
