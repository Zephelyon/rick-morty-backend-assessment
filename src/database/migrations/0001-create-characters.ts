import { QueryInterface, DataTypes } from 'sequelize';
import type { MigrationFn } from 'umzug';

export const up: MigrationFn<QueryInterface> = async ({ context: queryInterface }) => {
  // Ensure table is created in the public schema explicitly (avoids search_path issues)
  const table = { tableName: 'characters', schema: 'public' } as any;

  // Create characters table
  await queryInterface.createTable(table, {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    species: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    origin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  // Helpful indexes for filtering
  await queryInterface.addIndex(table, ['name']);
  await queryInterface.addIndex(table, ['status']);
  await queryInterface.addIndex(table, ['species']);
  await queryInterface.addIndex(table, ['gender']);
  await queryInterface.addIndex(table, ['origin']);

};

export const down: MigrationFn<QueryInterface> = async ({ context: queryInterface }) => {
  const table = { tableName: 'characters', schema: 'public' } as any;
  await queryInterface.dropTable(table);
};
