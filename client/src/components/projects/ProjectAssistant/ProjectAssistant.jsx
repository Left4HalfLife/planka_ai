/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form, Icon, Input, Loader } from 'semantic-ui-react';
import { push } from '../../../lib/redux-router';

import api from '../../../api';
import selectors from '../../../selectors';
import Paths from '../../../constants/Paths';

import styles from './ProjectAssistant.module.scss';

let nextMessageId = 0;

const createMessage = (data) => {
  nextMessageId += 1;
  return {
    id: nextMessageId,
    ...data,
  };
};

const ProjectAssistant = React.memo(() => {
  const project = useSelector(selectors.selectCurrentProject);
  const board = useSelector(selectors.selectCurrentBoard);
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [isOpened, setIsOpened] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const handleToggle = useCallback(() => {
    setIsOpened((value) => !value);
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isLoading) {
      return;
    }

    setMessages((value) => [...value, createMessage({ type: 'question', text: trimmedQuery })]);
    setQuery('');
    setIsLoading(true);

    try {
      const { item } = await api.queryProjectAssistant(
        project.id,
        trimmedQuery,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      );
      setMessages((value) => [
        ...value,
        createMessage({
          type: 'answer',
          text: item.message,
          cards: item.cards,
        }),
      ]);
    } catch (error) {
      setMessages((value) => [
        ...value,
        createMessage({
          type: 'error',
          text:
            (error && (error.message || error.unsupportedQuery || error.projectNotFound)) ||
            t('common.projectAssistantError'),
        }),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, project.id, query, t]);

  const handleCardClick = useCallback(
    (cardId) => {
      dispatch(
        push(Paths.CARDS.replace(':id', cardId), {
          returnBoardId: board && board.id,
        }),
      );
    },
    [board, dispatch],
  );

  return (
    <>
      {isOpened && (
        <aside className={styles.panel} aria-label={t('common.projectAssistant')}>
          <div className={styles.header}>
            <span>{t('common.projectAssistant')}</span>
            <button type="button" className={styles.close} onClick={handleToggle}>
              <Icon fitted name="close" />
            </button>
          </div>
          <div className={styles.messages}>
            {messages.length === 0 && (
              <div className={styles.hint}>{t('common.projectAssistantHint')}</div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${styles[message.type]}`}
              >
                <div>{message.text}</div>
                {message.cards &&
                  message.cards.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      className={styles.card}
                      onClick={() => handleCardClick(card.id)}
                    >
                      <span>{card.name}</span>
                      <small>{card.boardName}</small>
                    </button>
                  ))}
              </div>
            ))}
            {isLoading && <Loader active inline="centered" size="small" />}
          </div>
          <Form className={styles.form} onSubmit={handleSubmit}>
            <Input
              fluid
              action={
                <Button
                  primary
                  icon
                  disabled={!query.trim() || isLoading}
                  aria-label={t('action.send')}
                >
                  <Icon name="paper plane" />
                </Button>
              }
              value={query}
              placeholder={t('common.askProjectQuestion')}
              onChange={(_, { value }) => setQuery(value)}
            />
          </Form>
        </aside>
      )}
      {!isOpened && (
        <Button
          circular
          primary
          icon
          className={styles.launcher}
          aria-label={t('common.projectAssistant')}
          onClick={handleToggle}
        >
          <Icon name="comment alternate outline" />
        </Button>
      )}
    </>
  );
});

export default ProjectAssistant;
