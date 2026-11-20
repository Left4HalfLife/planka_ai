/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports.up = async (knex) => {
  await knex.schema.alterTable('board', (table) => {
    table
      .bigInteger('source_board_id')
      .nullable()
      .references('id')
      .inTable('board')
      .onDelete('RESTRICT');
    table.text('view_color_mode').notNullable().defaultTo('column');
    table.jsonb('view_colors').notNullable().defaultTo('{}');
  });

  return knex.schema.alterTable('board', (table) => {
    table.index('source_board_id');
  });
};

module.exports.down = (knex) =>
  knex.schema.alterTable('board', (table) => {
    table.dropForeign('source_board_id');
    table.dropIndex('source_board_id');
    table.dropColumn('view_colors');
    table.dropColumn('view_color_mode');
    table.dropColumn('source_board_id');
  });
