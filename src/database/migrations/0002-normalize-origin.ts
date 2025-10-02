import { QueryInterface, DataTypes } from 'sequelize';
import type { MigrationFn } from 'umzug';

export const up: MigrationFn<QueryInterface> = async ({ context: qi }) => {
  // 1) Create origins table
  const originsTable = { tableName: 'origins', schema: 'public' } as any;
  await qi.createTable(originsTable, {
    id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  });
  await qi.addIndex(originsTable, ['name']);

  // 2) Add origin_id to characters (nullable)
  const charactersTable = { tableName: 'characters', schema: 'public' } as any;
  await qi.addColumn(charactersTable, 'origin_id', {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'origins', key: 'id' } as any,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  } as any);
  await qi.addIndex(charactersTable, ['origin_id']);

  // 3) Backfill: insert distinct origins and set origin_id
  await qi.sequelize.query(`
    INSERT INTO public.origins (name)
    SELECT DISTINCT origin
    FROM public.characters
    WHERE origin IS NOT NULL AND origin <> ''
      AND NOT EXISTS (
        SELECT 1 FROM public.origins o WHERE o.name = public.characters.origin
      );
  `);

  await qi.sequelize.query(`
    UPDATE public.characters c
    SET origin_id = o.id
    FROM public.origins o
    WHERE c.origin = o.name;
  `);
};

export const down: MigrationFn<QueryInterface> = async ({ context: qi }) => {
  const charactersTable = { tableName: 'characters', schema: 'public' } as any;
  await qi.removeIndex(charactersTable, ['origin_id']);
  await qi.removeColumn(charactersTable, 'origin_id');

  const originsTable = { tableName: 'origins', schema: 'public' } as any;
  await qi.dropTable(originsTable);
};
