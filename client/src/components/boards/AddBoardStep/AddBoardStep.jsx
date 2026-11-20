/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Form, Icon } from 'semantic-ui-react';
import { useDidUpdate, useToggle } from '../../../lib/hooks';
import { Input, Popup } from '../../../lib/custom-ui';

import entryActions from '../../../entry-actions';
import selectors from '../../../selectors';
import { BoardViews } from '../../../constants/Enums';
import { BoardViewIcons } from '../../../constants/Icons';
import { useForm, useNestedRef, useSteps } from '../../../hooks';
import ImportStep from './ImportStep';

import styles from './AddBoardStep.module.scss';

const StepTypes = {
  IMPORT: 'IMPORT',
};

const AddBoardStep = React.memo(({ onClose }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [data, handleFieldChange, setData] = useForm({
    name: '',
    import: null,
    defaultView: BoardViews.KANBAN,
    sourceBoardId: null,
  });
  const boards = useSelector(selectors.selectBoardsForCurrentProject);

  const [step, openStep, handleBack] = useSteps();
  const [focusNameFieldState, focusNameField] = useToggle();

  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');

  const handleSubmit = useCallback(() => {
    const { sourceBoardId, ...baseData } = data;
    const cleanData = {
      ...baseData,
      name: data.name.trim(),
      import:
        data.defaultView === BoardViews.TIMELINE || data.defaultView === BoardViews.CALENDAR
          ? null
          : data.import,
      ...([BoardViews.TIMELINE, BoardViews.CALENDAR].includes(data.defaultView) && {
        sourceBoardId,
      }),
    };

    if (
      !cleanData.name ||
      ([BoardViews.TIMELINE, BoardViews.CALENDAR].includes(cleanData.defaultView) &&
        !cleanData.sourceBoardId)
    ) {
      nameFieldRef.current.select();
      return;
    }

    dispatch(entryActions.createBoardInCurrentProject(cleanData));
    onClose();
  }, [onClose, dispatch, data, nameFieldRef]);

  const handleImportSelect = useCallback(
    (nextImport) => {
      setData((prevData) => ({
        ...prevData,
        import: nextImport,
      }));
    },
    [setData],
  );

  const handleImportBack = useCallback(() => {
    handleBack();
    focusNameField();
  }, [handleBack, focusNameField]);

  const handleImportClick = useCallback(() => {
    openStep(StepTypes.IMPORT);
  }, [openStep]);

  const handleTypeClick = useCallback(
    (_, { value }) => {
      setData((prevData) => ({
        ...prevData,
        defaultView: value,
        sourceBoardId: prevData.sourceBoardId || null,
      }));
    },
    [setData],
  );

  const handleSourceBoardChange = useCallback(
    (_, { value }) => {
      setData((prevData) => ({
        ...prevData,
        sourceBoardId: value,
      }));
    },
    [setData],
  );

  useEffect(() => {
    nameFieldRef.current.focus({
      preventScroll: true,
    });
  }, [nameFieldRef]);

  useDidUpdate(() => {
    nameFieldRef.current.focus();
  }, [focusNameFieldState]);

  if (step && step.type === StepTypes.IMPORT) {
    return <ImportStep onSelect={handleImportSelect} onBack={handleImportBack} />;
  }

  return (
    <>
      <Popup.Header>
        {t('common.createBoard', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.text}>{t('common.title')}</div>
          <Input
            fluid
            ref={handleNameFieldRef}
            name="name"
            value={data.name}
            maxLength={128}
            className={styles.field}
            onChange={handleFieldChange}
          />
          <div className={styles.text}>{t('common.view')}</div>
          <Button.Group fluid className={styles.typeButtons}>
            {[BoardViews.KANBAN, BoardViews.TIMELINE, BoardViews.CALENDAR].map((view) => (
              <Button
                key={view}
                type="button"
                value={view}
                active={data.defaultView === view}
                onClick={handleTypeClick}
              >
                <Icon name={BoardViewIcons[view]} />
                {t(`common.${view}`)}
              </Button>
            ))}
          </Button.Group>
          {[BoardViews.TIMELINE, BoardViews.CALENDAR].includes(data.defaultView) && (
            <>
              <div className={styles.text}>{t('common.sourceBoard')}</div>
              <Dropdown
                fluid
                selection
                value={data.sourceBoardId}
                options={boards
                  .filter(
                    (board) =>
                      ![BoardViews.TIMELINE, BoardViews.CALENDAR].includes(board.defaultView),
                  )
                  .map((board) => ({
                    key: board.id,
                    text: board.name,
                    value: board.id,
                  }))}
                placeholder={t('common.selectBoard')}
                className={styles.field}
                onChange={handleSourceBoardChange}
              />
            </>
          )}
          <div className={styles.controls}>
            <Button
              positive
              content={t(
                `action.create${data.defaultView === BoardViews.KANBAN ? 'Board' : 'View'}`,
              )}
              className={styles.button}
            />
            {data.defaultView === BoardViews.KANBAN && (
              <Button
                type="button"
                className={classNames(styles.button, styles.importButton)}
                onClick={handleImportClick}
              >
                <Icon
                  name={data.import ? data.import.type : 'arrow down'}
                  className={styles.importButtonIcon}
                />
                {data.import ? data.import.file.name : t('action.import')}
              </Button>
            )}
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

AddBoardStep.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default AddBoardStep;
