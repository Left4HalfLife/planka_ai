/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { Button, Icon } from 'semantic-ui-react';
import { push } from '../../../lib/redux-router';

import selectors from '../../../selectors';
import Paths from '../../../constants/Paths';
import {
  getCalendarDateKey,
  getViewColor,
  groupCardsByCalendarDate,
} from '../../../utils/board-view';

import styles from './CalendarContent.module.scss';

const CalendarContent = React.memo(() => {
  const board = useSelector(selectors.selectCurrentBoard);
  const viewData = useSelector(selectors.selectViewDataForCurrentBoard);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const dispatch = useDispatch();
  const [t, i18n] = useTranslation();

  const cardsByDate = useMemo(
    () => groupCardsByCalendarDate(viewData.cards),
    [viewData.cards],
  );
  const listById = useMemo(
    () => Object.fromEntries(viewData.lists.map((list) => [list.id, list])),
    [viewData.lists],
  );
  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(month)),
        end: endOfWeek(endOfMonth(month)),
      }),
    [month],
  );

  const handleCardClick = useCallback(
    (cardId) => {
      dispatch(
        push(Paths.CARDS.replace(':id', cardId), {
          returnBoardId: board.id,
        }),
      );
    },
    [board.id, dispatch],
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <Button icon basic onClick={() => setMonth((value) => subMonths(value, 1))}>
          <Icon name="angle left" />
        </Button>
        <h2>{i18n.dateFns.format(month, 'MMMM yyyy')}</h2>
        <Button icon basic onClick={() => setMonth((value) => addMonths(value, 1))}>
          <Icon name="angle right" />
        </Button>
        <Button
          basic
          className={styles.todayButton}
          onClick={() => setMonth(startOfMonth(new Date()))}
        >
          {t('common.today')}
        </Button>
      </div>
      <div className={styles.grid}>
        {eachDayOfInterval({
          start: startOfWeek(month),
          end: endOfWeek(startOfWeek(month)),
        }).map((day) => (
          <div key={day.toISOString()} className={styles.weekday}>
            {i18n.dateFns.format(day, 'EEE')}
          </div>
        ))}
        {days.map((day) => {
          const dayCards = cardsByDate[getCalendarDateKey(day)] || [];

          return (
            <div
              key={day.toISOString()}
              className={classNames(styles.day, !isSameMonth(day, month) && styles.dayMuted)}
            >
              <div className={styles.dayNumber}>{i18n.dateFns.format(day, 'd')}</div>
              <div className={styles.cards}>
                {dayCards.map((card) => {
                  const list = listById[card.listId];
                  return (
                    <button
                      key={card.id}
                      type="button"
                      className={styles.card}
                      title={card.name}
                      style={{
                        borderLeftColor: list ? getViewColor(board, list) : undefined,
                      }}
                      onClick={() => handleCardClick(card.id)}
                    >
                      {card.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default CalendarContent;
