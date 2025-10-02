import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { SEQUELIZE } from '../../../../../database/sequelize/sequelize.provider';
import { Character } from '../../../../../database/sequelize/models/characters.model';
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
}
