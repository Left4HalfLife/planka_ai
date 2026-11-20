/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';
import { selectPath } from './router';
import { selectCurrentUserId } from './users';
import { isLocalId } from '../utils/local-id';
import { isListArchiveOrTrash } from '../utils/record-helpers';
import { ListTypes } from '../constants/Enums';

export const makeSelectBoardById = () =>
  createSelector(
    orm,
    (_, id) => id,
    (state) => selectPath(state).boardId,
    ({ Board }, id) => {
      const boardModel = Board.withId(id);

      if (!boardModel) {
        return boardModel;
      }

      return {
        ...boardModel.ref,
        isPersisted: !isLocalId(boardModel.id),
      };
    },
  );

export const selectBoardById = makeSelectBoardById();

export const makeSelectCurrentUserMembershipByBoardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    (state) => selectCurrentUserId(state),
    ({ Board }, id, currentUserId) => {
      if (!id) {
        return id;
      }

      const boardModel = Board.withId(id);

      if (!boardModel) {
        return boardModel;
      }

      const boardMembershipModel = boardModel.getMembershipModelByUserId(currentUserId);

      if (!boardMembershipModel) {
        return boardMembershipModel;
      }

      return boardMembershipModel.ref;
    },
  );

const selectCurrentUserMembershipByBoardId = makeSelectCurrentUserMembershipByBoardId();

export const makeSelectNotificationsTotalByBoardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    (state) => selectCurrentUserId(state),
    ({ Board }, id) => {
      const boardModel = Board.withId(id);

      if (!boardModel) {
        return boardModel;
      }

      return boardModel.getUnreadNotificationsQuerySet().count();
    },
  );

export const selectNotificationsTotalByBoardId = makeSelectNotificationsTotalByBoardId();

export const makeSelectNotificationServiceIdsByBoardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    (state) => selectCurrentUserId(state),
    ({ Board }, id) => {
      const boardModel = Board.withId(id);

      if (!boardModel) {
        return boardModel;
      }

      return boardModel
        .getNotificationServicesQuerySet()
        .toRefArray()
        .map((notificationService) => notificationService.id);
    },
  );

export const selectNotificationServiceIdsByBoardId = makeSelectNotificationServiceIdsByBoardId();

export const selectIsBoardWithIdAvailableForCurrentUser = createSelector(
  orm,
  (_, id) => id,
  (state) => selectCurrentUserId(state),
  ({ Board, User }, id, currentUserId) => {
    const boardModel = Board.withId(id);

    if (!boardModel) {
      return false;
    }

    const currentUserModel = User.withId(currentUserId);
    return boardModel.isAvailableForUser(currentUserModel);
  },
);

export const selectCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel.ref;
  },
);

export const selectMembershipsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel
      .getMembershipsQuerySet()
      .toModelArray()
      .map((boardMembershipModel) => ({
        ...boardMembershipModel.ref,
        isPersisted: !isLocalId(boardMembershipModel.id),
        user: boardMembershipModel.user.ref,
      }));
  },
);

export const selectMemberUserIdsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel
      .getMembershipsQuerySet()
      .toModelArray()
      .map((boardMembershipModel) => boardMembershipModel.user.id);
  },
);

export const selectCurrentUserMembershipForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  (state) => selectCurrentUserId(state),
  ({ Board }, id, currentUserId) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    const boardMembershipModel = boardModel.getMembershipModelByUserId(currentUserId);

    if (!boardMembershipModel) {
      return boardMembershipModel;
    }

    return boardMembershipModel.ref;
  },
);

export const selectLabelsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel.getLabelsQuerySet().toRefArray();
  },
);

export const selectArchiveListIdForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    const listModel = boardModel
      .getListsQuerySet()
      .filter({
        type: ListTypes.ARCHIVE,
      })
      .first();

    return listModel && listModel.id;
  },
);

export const selectTrashListIdForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    const listModel = boardModel
      .getListsQuerySet()
      .filter({
        type: ListTypes.TRASH,
      })
      .first();

    return listModel && listModel.id;
  },
);

export const selectCurrentUserMembershipForCurrentCardBoard = createSelector(
  orm,
  (state) => selectPath(state).cardId,
  (state) => selectCurrentUserId(state),
  ({ Card }, cardId, currentUserId) => {
    if (!cardId) {
      return cardId;
    }

    const cardModel = Card.withId(cardId);

    if (!cardModel || !cardModel.list || !cardModel.list.board) {
      return undefined;
    }

    const boardMembershipModel = cardModel.list.board.getMembershipModelByUserId(currentUserId);
    return boardMembershipModel && boardMembershipModel.ref;
  },
);

export const selectKanbanListIdsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel
      .getKanbanListsQuerySet()
      .toRefArray()
      .map((list) => list.id);
  },
);

// TODO: rename?
export const selectAvailableListsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel
      .getListsQuerySet()
      .toRefArray()
      .filter((list) => !isListArchiveOrTrash(list));
  },
);

export const selectCardsExceptCurrentForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  (state) => selectPath(state).cardId,
  ({ Board }, id, cardId) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel
      .getCardsModelArray()
      .filter((cardModel) => cardModel.id !== cardId)
      .map((cardModel) => cardModel.ref);
  },
);

export const selectFilteredCardIdsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel.getFilteredCardsModelArray().map((cardModel) => cardModel.id);
  },
);

export const selectViewDataForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    const dataBoardModel = boardModel.sourceBoard || boardModel;

    return {
      boardId: dataBoardModel.id,
      lists: dataBoardModel.getKanbanListsQuerySet().toRefArray(),
      cards: boardModel.getFilteredCardsModelArray().map((cardModel) => cardModel.ref),
    };
  },
);

export const selectCustomFieldGroupIdsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel
      .getCustomFieldGroupsQuerySet()
      .toRefArray()
      .map((customFieldGroup) => customFieldGroup.id);
  },
);

export const selectCustomFieldGroupsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel
      .getCustomFieldGroupsQuerySet()
      .toModelArray()
      .map((customFieldGroupModel) => {
        if (!customFieldGroupModel.name) {
          return {
            ...customFieldGroupModel.ref,
            name: customFieldGroupModel.baseCustomFieldGroup.name,
          };
        }

        return customFieldGroupModel.ref;
      });
  },
);

export const selectActivityIdsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel.getActivitiesModelArray().map((activity) => activity.id);
  },
);

export const selectFilterUserIdsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel.filterUsers.toRefArray().map((user) => user.id);
  },
);

export const selectFilterLabelIdsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel.filterLabels.toRefArray().map((label) => label.id);
  },
);

export const selectIsBoardWithIdExists = createSelector(
  orm,
  (_, id) => id,
  ({ Board }, id) => Board.idExists(id),
);

export default {
  makeSelectBoardById,
  selectBoardById,
  makeSelectCurrentUserMembershipByBoardId,
  selectCurrentUserMembershipByBoardId,
  makeSelectNotificationsTotalByBoardId,
  selectNotificationsTotalByBoardId,
  makeSelectNotificationServiceIdsByBoardId,
  selectNotificationServiceIdsByBoardId,
  selectIsBoardWithIdAvailableForCurrentUser,
  selectCurrentBoard,
  selectMembershipsForCurrentBoard,
  selectMemberUserIdsForCurrentBoard,
  selectCurrentUserMembershipForCurrentBoard,
  selectCurrentUserMembershipForCurrentCardBoard,
  selectLabelsForCurrentBoard,
  selectArchiveListIdForCurrentBoard,
  selectTrashListIdForCurrentBoard,
  selectKanbanListIdsForCurrentBoard,
  selectAvailableListsForCurrentBoard,
  selectCardsExceptCurrentForCurrentBoard,
  selectFilteredCardIdsForCurrentBoard,
  selectViewDataForCurrentBoard,
  selectCustomFieldGroupIdsForCurrentBoard,
  selectCustomFieldGroupsForCurrentBoard,
  selectActivityIdsForCurrentBoard,
  selectFilterUserIdsForCurrentBoard,
  selectFilterLabelIdsForCurrentBoard,
  selectIsBoardWithIdExists,
};
