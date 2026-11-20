/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Header, Tab } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import LIST_COLORS, { LIST_COLOR_VALUES } from '../../../../constants/ListColors';
import { BoardViewColorModes } from '../../../../constants/Enums';

import styles from './ViewSettings.module.scss';

const ViewSettings = React.memo(() => {
  const selectBoardById = useMemo(() => selectors.makeSelectBoardById(), []);
  const board = useSelector(selectors.selectCurrentBoard);
  const sourceBoard = useSelector((state) => selectBoardById(state, board.sourceBoardId));
  const viewData = useSelector(selectors.selectViewDataForCurrentBoard);
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleColorModeClick = useCallback(
    (_, { value }) => {
      dispatch(
        entryActions.updateBoard(board.id, {
          viewColorMode: value,
        }),
      );
    },
    [board.id, dispatch],
  );

  const handleColorClick = useCallback(
    (listId, color) => {
      dispatch(
        entryActions.updateBoard(board.id, {
          viewColors: {
            ...(board.viewColors || {}),
            [listId]: color,
          },
        }),
      );
    },
    [board.id, board.viewColors, dispatch],
  );

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <Divider horizontal className={styles.firstDivider}>
        <Header as="h4">{t('common.sourceBoard')}</Header>
      </Divider>
      <div className={styles.sourceBoard}>{sourceBoard?.name || t('common.boardUnavailable')}</div>
      <Divider horizontal>
        <Header as="h4">{t('common.streamColors')}</Header>
      </Divider>
      <Button.Group fluid className={styles.modeButtons}>
        <Button
          value={BoardViewColorModes.COLUMN}
          active={board.viewColorMode === BoardViewColorModes.COLUMN}
          onClick={handleColorModeClick}
        >
          {t('common.useColumnColors')}
        </Button>
        <Button
          value={BoardViewColorModes.CUSTOM}
          active={board.viewColorMode === BoardViewColorModes.CUSTOM}
          onClick={handleColorModeClick}
        >
          {t('common.customColors')}
        </Button>
      </Button.Group>
      {board.viewColorMode === BoardViewColorModes.CUSTOM && (
        <div className={styles.streams}>
          {viewData.lists.map((list) => (
            <div key={list.id} className={styles.stream}>
              <div className={styles.streamName}>{list.name || t(`common.${list.type}`)}</div>
              <div className={styles.colors}>
                {LIST_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={color}
                    className={classNames(
                      styles.color,
                      ((board.viewColors || {})[list.id] || list.color) === color &&
                        styles.colorActive,
                    )}
                    style={{ backgroundColor: LIST_COLOR_VALUES[color] }}
                    onClick={() => handleColorClick(list.id, color)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Tab.Pane>
  );
});

export default ViewSettings;
