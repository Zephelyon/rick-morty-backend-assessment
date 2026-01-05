import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { SEQUELIZE } from '../../../../../database/sequelize/sequelize.provider';
import { Character } from '../../../../../database/sequelize/models/characters.model';
import { Origin } from '../../../../../database/sequelize/models/origin.model';
import type { CharacterFilterInput } from '../../../interfaces/graphql/dto/character-filter.input';

@Injectable()
export class CharactersRepository {
  constructor(@Inject(SEQUELIZE) private readonly sequelize: Sequelize) {}

  /**
   * Query characters using optional filters.
   *
   * Supported filters: name, status, species, gender, origin (partial match, case-insensitive).
   * Pagination: limit (default 50) and offset (default 0). It's recommended to limit limit to a reasonable maximum.
   *
   */
  async findByFilter(filter: CharacterFilterInput = {}) {
    const repo = this.sequelize.getRepository(Character);
    const where: any = {};

    if (filter.name) where.name = { [Op.iLike]: `%${filter.name}%` };
    if (filter.status) where.status = { [Op.iLike]: `%${filter.status}%` };
    if (filter.species) where.species = { [Op.iLike]: `%${filter.species}%` };
    if (filter.gender) where.gender = { [Op.iLike]: filter.gender.trim() };
    if (filter.origin) where.origin = { [Op.iLike]: `%${filter.origin}%` };

    const limit = filter.limit ?? 50;
    const offset = filter.offset ?? 0;

    return repo.findAll({ where, limit, offset, order: [['id', 'ASC']] });
  }

  async findById(id: number) {
    const repo = this.sequelize.getRepository(Character);
    return repo.findByPk(id);
  }

  async create(data: Partial<Character>) {
    const repo = this.sequelize.getRepository(Character);
    let originId: number | null = null;
    if (typeof (data as any).origin === 'string' && (data as any).origin) {
      const originRepo = this.sequelize.getRepository(Origin);
      const [o] = await originRepo.findOrCreate({
        where: { name: (data as any).origin },
        defaults: { name: (data as any).origin as string },
      });
      originId = (o as any).id as number;
    } else if ((data as any).originId) {
      originId = (data as any).originId as any;
    }

    const payload: any = { ...data };
    if (originId !== undefined) payload.originId = originId;

    const created = await repo.create(payload);
    return created;
  }

  async updateById(id: number, data: Partial<Character>) {
    const repo = this.sequelize.getRepository(Character);
    const row = await repo.findByPk(id);
    if (!row) return null;

    let originId: number | null | undefined = undefined;
    if (Object.prototype.hasOwnProperty.call(data, 'origin')) {
      const originVal = (data as any).origin as string | null | undefined;
      if (originVal) {
        const originRepo = this.sequelize.getRepository(Origin);
        const [o] = await originRepo.findOrCreate({
          where: { name: originVal },
          defaults: { name: originVal },
        });
        originId = (o as any).id as number;
      } else {
        originId = null; // explicit null clears relation
      }
    }

    const changes: any = { ...data };
    if (originId !== undefined) changes.originId = originId;

    await row.update(changes);
    return row;
  }

  async deleteById(id: number) {
    const repo = this.sequelize.getRepository(Character);
    const deleted = await repo.destroy({ where: { id } });
    return deleted > 0;
  }
}
