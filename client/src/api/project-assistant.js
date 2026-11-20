/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

const queryProjectAssistant = (projectId, query, timeZone, headers) =>
  socket.post(`/projects/${projectId}/assistant`, { query, timeZone }, headers);

export default {
  queryProjectAssistant,
};
