/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const getLocalParts = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  })
    .formatToParts(date)
    .reduce(
      (result, part) => ({
        ...result,
        ...(part.type !== 'literal' && { [part.type]: Number(part.value) }),
      }),
      {},
    );

  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
};

const getTimeZoneOffset = (date, timeZone) => {
  const { year, month, day, hour, minute, second } = getLocalParts(date, timeZone);
  return (
    Date.UTC(year, month - 1, day, hour, minute, second) -
    Math.floor(date.getTime() / 1000) * 1000
  );
};

const fromLocalParts = ({ year, month, day }, timeZone) => {
  const localAsUtc = Date.UTC(year, month - 1, day);
  let result = new Date(localAsUtc - getTimeZoneOffset(new Date(localAsUtc), timeZone));
  result = new Date(localAsUtc - getTimeZoneOffset(result, timeZone));
  return result;
};

const startOfDay = (date, timeZone) => {
  const parts = getLocalParts(date, timeZone);
  return fromLocalParts(parts, timeZone);
};

const addDays = (date, amount, timeZone) => {
  const parts = getLocalParts(date, timeZone);
  const shifted = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + amount));
  return fromLocalParts(
    {
      year: shifted.getUTCFullYear(),
      month: shifted.getUTCMonth() + 1,
      day: shifted.getUTCDate(),
    },
    timeZone,
  );
};

const startOfWeek = (date, timeZone) => {
  const parts = getLocalParts(date, timeZone);
  const weekday = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
  return addDays(startOfDay(date, timeZone), -((weekday + 6) % 7), timeZone);
};

const startOfMonth = (date, timeZone) => {
  const parts = getLocalParts(date, timeZone);
  return fromLocalParts(
    {
      year: parts.year,
      month: parts.month,
      day: 1,
    },
    timeZone,
  );
};

const addMonths = (date, amount, timeZone) => {
  const parts = getLocalParts(date, timeZone);
  const shifted = new Date(Date.UTC(parts.year, parts.month - 1 + amount, parts.day));
  return fromLocalParts(
    {
      year: shifted.getUTCFullYear(),
      month: shifted.getUTCMonth() + 1,
      day: shifted.getUTCDate(),
    },
    timeZone,
  );
};

const endExclusiveFrom = (start, amount, unit, timeZone) => {
  switch (unit) {
    case 'day':
      return addDays(start, amount, timeZone);
    case 'week':
      return addDays(start, amount * 7, timeZone);
    case 'month':
      return addMonths(start, amount, timeZone);
    default:
      return null;
  }
};

const parseRelativeRange = (text, now, timeZone) => {
  const thisDay = startOfDay(now, timeZone);

  if (/\btoday\b/.test(text)) {
    return {
      start: thisDay,
      end: addDays(thisDay, 1, timeZone),
      label: 'today',
    };
  }

  if (/\btomorrow\b/.test(text)) {
    const start = addDays(thisDay, 1, timeZone);
    return {
      start,
      end: addDays(start, 1, timeZone),
      label: 'tomorrow',
    };
  }

  if (/\byesterday\b/.test(text)) {
    return {
      start: addDays(thisDay, -1, timeZone),
      end: thisDay,
      label: 'yesterday',
    };
  }

  if (/\bthis week\b/.test(text)) {
    const start = startOfWeek(thisDay, timeZone);
    return {
      start,
      end: addDays(start, 7, timeZone),
      label: 'this week',
    };
  }

  if (/\bnext week\b/.test(text)) {
    const start = addDays(startOfWeek(thisDay, timeZone), 7, timeZone);
    return {
      start,
      end: addDays(start, 7, timeZone),
      label: 'next week',
    };
  }

  if (/\blast week\b/.test(text)) {
    const start = addDays(startOfWeek(thisDay, timeZone), -7, timeZone);
    return {
      start,
      end: addDays(start, 7, timeZone),
      label: 'last week',
    };
  }

  if (/\bthis month\b/.test(text)) {
    const start = startOfMonth(thisDay, timeZone);
    return {
      start,
      end: addMonths(start, 1, timeZone),
      label: 'this month',
    };
  }

  if (/\blast month\b/.test(text)) {
    const end = startOfMonth(thisDay, timeZone);
    return {
      start: addMonths(end, -1, timeZone),
      end,
      label: 'last month',
    };
  }

  if (/\bnext month\b/.test(text)) {
    const start = addMonths(startOfMonth(thisDay, timeZone), 1, timeZone);
    return {
      start,
      end: addMonths(start, 1, timeZone),
      label: 'next month',
    };
  }

  const relativeMatch = text.match(
    /\b(?:in the )?(last|past|next) (\d+) (day|days|week|weeks|month|months)\b/,
  );
  if (relativeMatch) {
    const amount = Number(relativeMatch[2]);
    const unit = relativeMatch[3].replace(/s$/, '');
    const direction = relativeMatch[1];

    if (direction === 'next') {
      return {
        start: thisDay,
        end: endExclusiveFrom(thisDay, amount, unit, timeZone),
        label: `the next ${amount} ${relativeMatch[3]}`,
      };
    }

    return {
      start:
        unit === 'day'
          ? addDays(thisDay, 1 - amount, timeZone)
          : endExclusiveFrom(thisDay, -amount, unit, timeZone),
      end: addDays(thisDay, 1, timeZone),
      label: `the last ${amount} ${relativeMatch[3]}`,
    };
  }

  const dateMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (dateMatch) {
    const [year, month, day] = dateMatch[1].split('-').map(Number);
    const date = fromLocalParts({ year, month, day }, timeZone);
    if (!Number.isNaN(date.getTime())) {
      return {
        start: date,
        end: addDays(date, 1, timeZone),
        label: dateMatch[1],
      };
    }
  }

  return {
    start: thisDay,
    end: addDays(thisDay, 1, timeZone),
    label: 'today',
  };
};

const parseAssistantQuery = (query, now = new Date(), timeZone = 'UTC') => {
  const text = query.trim().toLowerCase();
  const range = parseRelativeRange(text, now, timeZone);
  const isDue = /\b(due|deadline|overdue)\b/.test(text);
  const isCompleted =
    !isDue &&
    /\b(completed|complete|finished|done|closed)\b/.test(text) &&
    !/\bincomplete\b|\bopen\b|\bnot (?:completed|done|finished|closed)\b/.test(text);

  if (!isCompleted && !isDue) {
    return {
      supported: false,
      intent: null,
      range: null,
      list: /\b(list|show|which|what)\b/.test(text),
    };
  }

  const isOverdue = /\boverdue\b/.test(text);

  return {
    supported: true,
    intent: isCompleted ? 'completed' : 'due',
    range: isOverdue
      ? {
          start: new Date(0),
          end: startOfDay(now, timeZone),
          label: 'overdue',
        }
      : range,
    includeCompleted: isDue && (isCompleted || /\ball\b|\bincluding completed\b/.test(text)),
    list: /\b(list|show|which|what)\b/.test(text) || /\bitems?\b/.test(text) === false,
  };
};

const formatDateRange = ({ start, end }) => ({
  start: start.toISOString(),
  end: end.toISOString(),
});

const isTimeZone = (timeZone) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format();
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  formatDateRange,
  isTimeZone,
  parseAssistantQuery,
};
