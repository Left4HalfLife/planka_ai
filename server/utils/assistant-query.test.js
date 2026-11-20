const { expect } = require('chai');

const { formatDateRange, parseAssistantQuery } = require('./assistant-query');

describe('assistant-query', () => {
  const now = new Date('2026-11-18T15:30:00.000Z');

  it('parses next-week due-date questions', () => {
    const parsed = parseAssistantQuery('How many items are due next week?', now);

    expect(parsed.supported).to.equal(true);
    expect(parsed.intent).to.equal('due');
    expect(formatDateRange(parsed.range)).to.deep.equal({
      start: '2026-11-23T00:00:00.000Z',
      end: '2026-11-30T00:00:00.000Z',
    });
  });

  it('parses completed items from the previous calendar month', () => {
    const parsed = parseAssistantQuery(
      'How many items have been completed in the last month?',
      now,
    );

    expect(parsed.supported).to.equal(true);
    expect(parsed.intent).to.equal('completed');
    expect(formatDateRange(parsed.range)).to.deep.equal({
      start: '2026-10-01T00:00:00.000Z',
      end: '2026-11-01T00:00:00.000Z',
    });
  });

  it('supports rolling day ranges and rejects unsupported questions', () => {
    const parsed = parseAssistantQuery('Show items completed in the last 7 days', now);
    expect(parsed.range.start.toISOString()).to.equal('2026-11-12T00:00:00.000Z');
    expect(parsed.range.end.toISOString()).to.equal('2026-11-19T00:00:00.000Z');

    expect(parseAssistantQuery('Who is my manager?', now).supported).to.equal(false);
  });

  it('keeps completed as an inclusion modifier on due-date queries', () => {
    const parsed = parseAssistantQuery(
      'Show all items due next month, including completed',
      now,
    );

    expect(parsed.intent).to.equal('due');
    expect(parsed.includeCompleted).to.equal(true);
  });

  it('uses the requested time zone for calendar boundaries', () => {
    const parsed = parseAssistantQuery(
      'How many items are due today?',
      new Date('2026-11-18T15:00:00.000Z'),
      'America/New_York',
    );

    expect(parsed.range.start.toISOString()).to.equal('2026-11-18T05:00:00.000Z');
    expect(parsed.range.end.toISOString()).to.equal('2026-11-19T05:00:00.000Z');
  });
});
