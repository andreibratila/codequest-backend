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
export class Participants extends Model<Participants> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Unique
  @Column(DataType.UUID)
  id: string;

  @Unique
  @Column(DataType.STRING) // o el tipo de datos adecuado
  username: string;

  @Unique
  @Column(DataType.STRING) // o el tipo de datos adecuado
  idDiscord: string;
}
