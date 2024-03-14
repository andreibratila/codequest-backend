import { Model, Column, Table } from 'sequelize-typescript';

@Table
export class Lottery extends Model<Lottery> {
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
}
