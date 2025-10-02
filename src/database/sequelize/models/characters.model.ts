import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Origin } from './origin.model';

@Table({ tableName: 'characters', timestamps: false })
export class Character extends Model<Character> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.STRING)
  declare status: string;

  @Column(DataType.STRING)
  declare species: string;

  @Column(DataType.STRING)
  declare gender: string;

  @Column({ type: DataType.STRING, field: 'origin' })
  declare origin: string;

  @ForeignKey(() => Origin)
  @Column({ type: DataType.INTEGER, field: 'origin_id', allowNull: true })
  declare originId: number | null;

  @BelongsTo(() => Origin, { foreignKey: 'originId', targetKey: 'id' })
  declare originRef?: Origin;
}
