/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { push } from '../../../lib/redux-router';

import selectors from '../../../selectors';
import Paths from '../../../constants/Paths';
import { buildTimeline, getViewColor } from '../../../utils/board-view';

import styles from './TimelineContent.module.scss';

const DAY_WIDTH = 38;

const TimelineContent = React.memo(() => {
  const board = useSelector(selectors.selectCurrentBoard);
  const viewData = useSelector(selectors.selectViewDataForCurrentBoard);
  const dispatch = useDispatch();
  const [t, i18n] = useTranslation();

  const timeline = useMemo(
    () => buildTimeline(viewData.cards, viewData.lists),
    [viewData.cards, viewData.lists],
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

  if (timeline.streams.length === 0) {
    return <div className={styles.empty}>{t('common.noCardsWithDueDates')}</div>;
  }

  const trackWidth = timeline.days.length * DAY_WIDTH;

  return (
    <div className={styles.wrapper}>
      <div className={styles.scroller}>
        <div className={styles.timeline} style={{ width: trackWidth + 190 }}>
          <div className={styles.header}>
            <div className={styles.streamHeader}>{t('common.columns')}</div>
            <div className={styles.days} style={{ width: trackWidth }}>
              {timeline.days.map((day) => (
                <div key={day.toISOString()} className={styles.day}>
                  <span>{i18n.dateFns.format(day, 'EEE')}</span>
                  <strong>{i18n.dateFns.format(day, 'd')}</strong>
                </div>
              ))}
            </div>
          </div>
          {timeline.streams.map(({ list, items }) => (
            <div
              key={list.id}
              className={styles.stream}
              style={{ height: items.length * 38 + 10 }}
            >
              <div className={styles.streamName}>
                <span
                  className={styles.swatch}
                  style={{ backgroundColor: getViewColor(board, list) }}
                />
                {list.name || t(`common.${list.type}`)}
              </div>
              <div
                className={styles.track}
                style={{
                  width: trackWidth,
                  backgroundSize: `${DAY_WIDTH}px 100%`,
                }}
              >
                {items.map(({ card, left, width }, index) => (
                  <button
                    key={card.id}
                    type="button"
                    className={styles.cardBar}
                    title={`${card.name} - ${i18n.dateFns.format(
                      new Date(card.dueDate),
                      'PP',
                    )}`}
                    style={{
                      backgroundColor: getViewColor(board, list),
                      left: `${left}%`,
                      top: index * 38 + 5,
                      width: `${Math.max(width, 1.2)}%`,
                    }}
                    onClick={() => handleCardClick(card.id)}
                  >
                    <span>{card.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default TimelineContent;
