/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Divider, Header, Tab } from 'semantic-ui-react';

import DefaultView from './DefaultView';
import DefaultCardType from './DefaultCardType';
import Others from './Others';
import ViewSettings from './ViewSettings';
import selectors from '../../../../selectors';
import { BoardViews } from '../../../../constants/Enums';

import styles from './PreferencesPane.module.scss';

const PreferencesPane = React.memo(() => {
  const [t] = useTranslation();
  const board = useSelector(selectors.selectCurrentBoard);

  if ([BoardViews.TIMELINE, BoardViews.CALENDAR].includes(board.defaultView)) {
    return <ViewSettings />;
  }

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <Divider horizontal className={styles.firstDivider}>
        <Header as="h4">
          {t('common.defaultView', {
            context: 'title',
          })}
        </Header>
      </Divider>
      <DefaultView />
      <Divider horizontal>
        <Header as="h4">
          {t('common.defaultCardType', {
            context: 'title',
          })}
        </Header>
      </Divider>
      <DefaultCardType />
      <Divider horizontal>
        <Header as="h4">
          {t('common.others', {
            context: 'title',
          })}
        </Header>
      </Divider>
      <Others />
    </Tab.Pane>
  );
});

export default PreferencesPane;
