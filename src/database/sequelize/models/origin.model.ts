import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Unique, Index } from 'sequelize-typescript';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

@Table({ tableName: 'origins', schema: 'public', timestamps: false })
export class Origin extends Model<InferAttributes<Origin>, InferCreationAttributes<Origin>> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @Unique
  @Index
  @Column(DataType.STRING)
  declare name: string;
}
