# Project Assistant Manual Test

## Setup

Use one project with two normal boards (`Delivery` and `Backlog`) and a normal board member.

Create these active cards:

| Board | Card | Due date | State |
| --- | --- | --- | --- |
| Delivery | API launch | first day of next week | open |
| Delivery | Client demo | middle of next week | open |
| Backlog | Research | middle of next week | open |
| Delivery | Old release | tomorrow | closed/completed |
| Delivery | Next month open | middle of next month | open |
| Backlog | Next month closed | end of next month | closed/completed |

For completion testing, move at least three cards into a closed list during test setup:

- `Completed this month` during the current month.
- `Completed last month A` during the previous calendar month.
- `Completed last month B` during the previous calendar month.

Keep one overdue open card outside all requested ranges.

If the test environment was not available last month, backdate the two previous-month
fixtures before starting the browser test:

```sql
UPDATE card
SET list_changed_at = '2026-10-15 12:00:00+00'
WHERE name IN ('Completed last month A', 'Completed last month B');
```

Replace the example date with a timestamp in the previous calendar month and use the
test database only.

## UI tests

1. Open the project and click the circular chat button at the bottom-right.
2. Enter `How many items are due next week?`
   - Expected: the response reports `3`, does not include the closed card, and shows three clickable cards.
3. Enter `How many items have been completed in the last month?`
   - Expected: the response reports `2` and only shows cards whose completion occurred in the previous calendar month.
4. Enter `Show items completed in the last 7 days`
   - Expected: the count and card links reflect completion time in the rolling seven-day window.
5. Enter `Show all items due next month, including completed`
   - Expected: exactly the two next-month fixture cards are included, one open and one closed.
6. Click a returned card.
   - Expected: the standard card editor opens and the card can be edited according to the user's source-board role.
7. Enter `Who is the project owner?`
   - Expected: a helpful unsupported-question message appears and no project data is exposed.
8. Sign in as a user with access to only one board and repeat the tests.
   - Expected: only cards from that user's accessible normal boards are counted.

## API test

Run the following with a valid signed-in API token or browser cookie:

```bash
curl -X POST "$PLANKA_URL/api/projects/$PROJECT_ID/assistant" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PLANKA_ACCESS_TOKEN" \
  --data '{"query":"How many items are due next week?"}'
```

Verify that the response has:

- `item.query`
- `item.message`
- `item.count`
- `item.intent`
- `item.range.start` and `item.range.end` in ISO-8601 form
- `item.cards` with at most 50 card links and no inaccessible board/card data

## Date-boundary tests

Repeat the due query on a Sunday and Monday. "Next week" must always mean the next Monday-through-Sunday calendar week, not the next seven rolling days.

Repeat the completion query near the first day of a month. "Last month" must mean the full previous calendar month.
