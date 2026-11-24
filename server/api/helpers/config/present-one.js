/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  sync: true,

  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
  },

  fn(inputs) {
    const record = _.omit(inputs.record, Config.AI_SECRET_FIELD_NAMES);

    if (!record.aiBaseUrl && sails.config.custom.aiDefaultBaseUrl) {
      record.aiBaseUrl = sails.config.custom.aiDefaultBaseUrl;
    }
    if (!record.aiModel && sails.config.custom.aiDefaultModel) {
      record.aiModel = sails.config.custom.aiDefaultModel;
    }
    if (!record.aiApiKeyHint && sails.config.custom.aiDefaultApiKey) {
      record.aiApiKeyHint = 'Configured from environment';
    }

    if (sails.config.custom.smtpHost) {
      return _.omit(record, Config.SMTP_FIELD_NAMES);
    }

    if (record.smtpPassword) {
      return _.omit(record, 'smtpPassword');
    }

    return record;
  },
};
