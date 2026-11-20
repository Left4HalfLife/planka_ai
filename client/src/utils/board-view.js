/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import {
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfWeek,
  max,
  min,
  startOfDay,
  startOfWeek,
} from 'date-fns';

import LIST_COLORS, { LIST_COLOR_VALUES } from '../constants/ListColors';
import { BoardViewColorModes } from '../constants/Enums';

const getDate = (value) => (value instanceof Date ? value : new Date(value));

const getFallbackColor = (listId) => {
  const hash = [...listId].reduce((total, character) => total + character.charCodeAt(0), 0);
  return LIST_COLORS[hash % LIST_COLORS.length];
};

export const getViewColor = (board, list) => {
  if (
    board.viewColorMode === BoardViewColorModes.CUSTOM &&
    board.viewColors &&
    board.viewColors[list.id] &&
    LIST_COLOR_VALUES[board.viewColors[list.id]]
  ) {
    return LIST_COLOR_VALUES[board.viewColors[list.id]];
  }

  return LIST_COLOR_VALUES[list.color || getFallbackColor(list.id)];
};

export const buildTimeline = (cards, lists) => {
  const cardsWithDueDate = cards.filter((card) => card.dueDate);

  if (cardsWithDueDate.length === 0) {
    return {
      days: [],
      streams: [],
    };
  }

  const starts = cardsWithDueDate.map((card) => {
    const dueDate = startOfDay(getDate(card.dueDate));
    const createdAt = card.createdAt ? startOfDay(getDate(card.createdAt)) : dueDate;

    return createdAt < dueDate ? createdAt : dueDate;
  });
  const ends = cardsWithDueDate.map((card) => startOfDay(getDate(card.dueDate)));
  const rangeStart = startOfWeek(min(starts));
  const rangeEnd = endOfWeek(max(ends));
  const days = eachDayOfInterval({
    start: rangeStart,
    end: rangeEnd,
  });
  const totalDays = Math.max(days.length, 1);

  const streams = lists
    .map((list) => ({
      list,
      items: cardsWithDueDate
        .filter((card) => card.listId === list.id)
        .map((card) => {
          const dueDate = startOfDay(getDate(card.dueDate));
          const createdAt = card.createdAt ? startOfDay(getDate(card.createdAt)) : dueDate;
          const start = createdAt < dueDate ? createdAt : dueDate;
          const left = (differenceInCalendarDays(start, rangeStart) / totalDays) * 100;
          const duration = Math.max(differenceInCalendarDays(dueDate, start) + 1, 1);

          return {
            card,
            left,
            width: Math.min((duration / totalDays) * 100, 100 - left),
          };
        }),
    }))
    .filter((stream) => stream.items.length > 0);

  return {
    days,
    streams,
  };
};

export const getCalendarDateKey = (date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export const groupCardsByCalendarDate = (cards) =>
  cards.reduce((result, card) => {
    if (!card.dueDate) {
      return result;
    }

    const key = getCalendarDateKey(getDate(card.dueDate));
    return {
      ...result,
      [key]: [...(result[key] || []), card],
    };
  }, {});
