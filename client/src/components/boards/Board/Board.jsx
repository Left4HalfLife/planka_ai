/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors';
import ModalTypes from '../../../constants/ModalTypes';
import { BoardContexts, BoardViews } from '../../../constants/Enums';
import KanbanContent from './KanbanContent';
import FiniteContent from './FiniteContent';
import EndlessContent from './EndlessContent';
import TimelineContent from './TimelineContent';
import CalendarContent from './CalendarContent';
import ShortcutsProvider from './ShortcutsProvider';
import CardModal from '../../cards/CardModal';
import BoardActivitiesModal from '../../activities/BoardActivitiesModal';

const Board = React.memo(() => {
  const board = useSelector(selectors.selectCurrentBoard);
  const modal = useSelector(selectors.selectCurrentModal);
  const isCardModalOpened = useSelector((state) => !!selectors.selectPath(state).cardId);
  const isDerivedView = [BoardViews.TIMELINE, BoardViews.CALENDAR].includes(board.view);

  let Content;
  switch (board.view) {
    case BoardViews.KANBAN:
      Content = KanbanContent;

      break;
    case BoardViews.TIMELINE:
      Content = TimelineContent;

      break;
    case BoardViews.CALENDAR:
      Content = CalendarContent;

      break;
    default:
      switch (board.context) {
        case BoardContexts.BOARD:
          Content = FiniteContent;

          break;
        case BoardContexts.ARCHIVE:
        case BoardContexts.TRASH:
          Content = EndlessContent;

          break;
        default:
      }
  }

  let modalNode = null;
  if (isCardModalOpened) {
    modalNode = <CardModal />;
  } else if (modal) {
    switch (modal.type) {
      case ModalTypes.BOARD_ACTIVITIES:
        modalNode = <BoardActivitiesModal />;

        break;
      default:
    }
  }

  return (
    <>
      {isDerivedView ? (
        <Content />
      ) : (
        <ShortcutsProvider>
          <Content />
        </ShortcutsProvider>
      )}
      {modalNode}
    </>
  );
});

export default Board;
