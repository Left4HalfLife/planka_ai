/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import deletedUserAvatar from '../assets/images/deleted-user.png';
import plankaiUserAvatar from '../assets/images/plankai-user.svg';

export const StaticUserIds = {
  DELETED: null,
  PLANKAI: '1',
};

const DELETED = {
  id: StaticUserIds.DELETED,
  name: 'deletedUser',
  avatar: {
    thumbnailUrls: {
      cover180: deletedUserAvatar,
    },
  },
};

// Resolved without ever being fetched, so the assistant's actions render even on boards
// the account is not a member of.
const PLANKAI = {
  id: StaticUserIds.PLANKAI,
  name: 'plankaiUser',
  avatar: {
    thumbnailUrls: {
      cover180: plankaiUserAvatar,
    },
  },
};

export const STATIC_USER_BY_ID = {
  [StaticUserIds.DELETED]: DELETED,
  [StaticUserIds.PLANKAI]: PLANKAI,
};

export default {
  DELETED,
  PLANKAI,
};
