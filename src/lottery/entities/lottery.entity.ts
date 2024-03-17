import {
  Model,
  Column,
  Table,
  HasMany,
  Default,
  NotEmpty,
  PrimaryKey,
  DataType,
  Unique,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import { Participants } from './participants.entity';
import { Prizes } from './prizes.entity';

@Table
export class Lottery extends Model<Lottery> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Unique
  @Column(DataType.UUID)
  id: string;

  @NotEmpty
  @Column
  lottery_name: string;

  @NotEmpty
  @Unique
  @Column
  slug: string;

  @NotEmpty
  @Column
  description: string;

  @NotEmpty
  @Column
  min_participants: number;

  @NotEmpty
  @Column
  max_participants: number;

  @NotEmpty
  @Column
  public_access: boolean;

  @Default(0)
  @NotEmpty
  @Column
  ammount_participants: number;

  @NotEmpty
  @Column
  end_date: string;

  @Column
  secret_code: string;

  @NotEmpty
  @Column
  number_of_winners: number;

  @Default(false)
  @NotEmpty
  @Column
  finished: boolean;

  @HasMany(() => Participants)
  participants: Participants[];

  @HasMany(() => Prizes)
  prizes: Prizes[];

  // Hook beforeCreate para manejar el slug antes de crear
  @BeforeCreate
  static createSlug(instance: Lottery) {
    if (!instance.slug) {
      instance.slug = instance.lottery_name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^\w-]+/g, '');
    }
  }

  // Hook beforeUpdate para manejar el slug antes de actualizar
  @BeforeUpdate
  static updateSlug(instance: Lottery) {
    if (instance.slug) {
      instance.slug = instance.slug
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^\w-]+/g, '');
    }
  }
}
