/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');
const {
  formatDateRange,
  isTimeZone,
  parseAssistantQuery,
} = require('../../../utils/assistant-query');

const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  UNSUPPORTED_QUERY: {
    unsupportedQuery:
      'Ask about cards due or completed in a date range, for example "How many items are due next week?"',
  },
};

module.exports = {
  inputs: {
    projectId: {
      ...idInput,
      required: true,
    },
    query: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 500,
      required: true,
    },
    timeZone: {
      type: 'string',
      defaultsTo: 'UTC',
      custom: isTimeZone,
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
    unsupportedQuery: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;
    const project = await Project.qm.getOneById(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);
    const hasFullProjectVisibility =
      currentUser.role === User.Roles.ADMIN && !project.ownerProjectManagerId;
    const boardMemberships = await BoardMembership.qm.getByProjectIdAndUserId(
      project.id,
      currentUser.id,
    );

    let boards;
    if (isProjectManager || hasFullProjectVisibility) {
      boards = await Board.qm.getByProjectId(project.id);
    } else {
      if (boardMemberships.length === 0) {
        throw Errors.PROJECT_NOT_FOUND;
      }

      boards = await Board.qm.getByIds(
        sails.helpers.utils.mapRecords(boardMemberships, 'boardId'),
      );
    }

    boards = boards.filter((board) => !board.sourceBoardId);

    const parsed = parseAssistantQuery(inputs.query, new Date(), inputs.timeZone);
    if (!parsed.supported) {
      throw Errors.UNSUPPORTED_QUERY;
    }

    let cards = [];
    if (boards.length > 0) {
      const lists = (
        await Promise.all(
          boards.map((board) => List.qm.getByBoardId(board.id)),
        )
      )
        .flat()
        .filter((list) => sails.helpers.lists.isFinite(list));

      let isClosed;
      if (parsed.intent === 'completed') {
        isClosed = true;
      } else if (!parsed.includeCompleted) {
        isClosed = false;
      }

      cards = await Card.qm.getForAssistant(sails.helpers.utils.mapRecords(lists), {
        field: parsed.intent === 'completed' ? 'listChangedAt' : 'dueDate',
        start: parsed.range.start,
        end: parsed.range.end,
        isClosed,
      });
    }

    const boardById = _.keyBy(boards, 'id');
    const dateField = parsed.intent === 'completed' ? 'listChangedAt' : 'dueDate';
    const items = cards
      .sort((card1, card2) => new Date(card1[dateField]) - new Date(card2[dateField]))
      .map((card) => ({
        id: card.id,
        name: card.name,
        boardId: card.boardId,
        boardName: boardById[card.boardId] && boardById[card.boardId].name,
        listId: card.listId,
        dueDate: card.dueDate,
        isClosed: card.isClosed,
        listChangedAt: card.listChangedAt,
      }));

    const count = items.length;
    const message =
      parsed.intent === 'completed'
        ? `${count} ${count === 1 ? 'item was' : 'items were'} completed ${parsed.range.label}.`
        : `${count} ${count === 1 ? 'item is' : 'items are'} due ${parsed.range.label}.`;

    return {
      item: {
        query: inputs.query,
        message,
        count,
        intent: parsed.intent,
        range: formatDateRange(parsed.range),
        cards: items.slice(0, 50),
      },
    };
  },
};
