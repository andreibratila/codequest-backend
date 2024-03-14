import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
  Default,
  Unique,
} from 'sequelize-typescript';

@Table
export class Auth extends Model<Auth> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Unique
  @Column(DataType.UUID)
  id: string;

  @Unique
  @Column
  user: string;

  @Column
  password: string;

  @Column(DataType.UUID)
  createdBy: string;
}
