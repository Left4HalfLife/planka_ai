import LIST_COLORS, { LIST_COLOR_VALUES } from '../constants/ListColors';
import { BoardViewColorModes } from '../constants/Enums';
import {
  buildTimeline,
  getCalendarDateKey,
  getViewColor,
  groupCardsByCalendarDate,
} from './board-view';

describe('board view utilities', () => {
  test('builds one stream per list and spans each card through its due date', () => {
    const lists = [
      { id: 'list-1', name: 'Doing' },
      { id: 'list-2', name: 'Done' },
    ];
    const cards = [
      {
        id: 'card-1',
        listId: 'list-1',
        createdAt: new Date(2026, 0, 5),
        dueDate: new Date(2026, 0, 8),
      },
      {
        id: 'card-2',
        listId: 'list-2',
        createdAt: new Date(2026, 0, 6),
        dueDate: null,
      },
    ];

    const timeline = buildTimeline(cards, lists);

    expect(timeline.streams).toHaveLength(1);
    expect(timeline.streams[0].list.id).toBe('list-1');
    expect(timeline.streams[0].items[0].card.id).toBe('card-1');
    expect(timeline.streams[0].items[0].width).toBeGreaterThan(0);
  });

  test('groups cards by their local due-date calendar day', () => {
    const dueDate = new Date(2026, 4, 12, 23, 30);
    const grouped = groupCardsByCalendarDate([
      { id: 'card-1', dueDate },
      { id: 'card-2', dueDate: null },
    ]);

    expect(grouped[getCalendarDateKey(dueDate)].map(({ id }) => id)).toEqual(['card-1']);
  });

  test('uses column colors by default and configured colors in custom mode', () => {
    const list = { id: 'list-1', color: LIST_COLORS[0] };

    expect(
      getViewColor(
        { viewColorMode: BoardViewColorModes.COLUMN, viewColors: {} },
        list,
      ),
    ).toBe(LIST_COLOR_VALUES[LIST_COLORS[0]]);

    expect(
      getViewColor(
        {
          viewColorMode: BoardViewColorModes.CUSTOM,
          viewColors: { 'list-1': LIST_COLORS[1] },
        },
        list,
      ),
    ).toBe(LIST_COLOR_VALUES[LIST_COLORS[1]]);
  });
});
