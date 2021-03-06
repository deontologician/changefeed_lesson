# Changefeeds for realtime applications
## Basics
 - Changefeeds let you subscribe to the results of queries
 - In most cases, you just need to tack on `.changes()` to the end of your query
 - Sometimes you may need to specify an index for a query (`order_by`, `between`)
 - Changefeed tables, and individual documents
 - Limitations:
   - Changefeeds work on queries that are "maps" underneath
   - Changefeeds don't (yet!) work on queries that require a "reduce" step
     - This means you can't use changefeeds that depend on multiple
       tables to decide if a change happened
   - Changefeeds don't have guaranteed delivery (the client doesn't
     ACK each change). So think "subscribe to notifications" not
     "message queue".
     - Basic python code for a changefeed:

```python
for change in query.changes().run(conn):
   change['new_val']... # do something with the new value of the query
   change['old_val']... # do something with the old val
```
 - Example query and results:
   - `r.table('superheroes').changes()`
   - results:
```json
      {
        "old_val": {
          "id": "2784ae20-de37-4db1-be42-ca4c4e192938",
          "name": "Superman",
          "love_interest": "Lana Lang"
        },
        "new_val": {
          "id": "2784ae20-de37-4db1-be42-ca4c4e192938",
          "name": "Superman",
          "love_interest": "Lois Lane"
        }
      }
```
 - If `new_val` and `old_val` keys are both present, the document was updated
 - If just the `new_val` key is present, the document is new
 - If just the `old_val` key is present, the document was deleted
## What changefeed queries look like
 - `r.table('characters').min(index='score').changes()`
 - `r.table('characters').max(index='score').changes()`
 - `r.table('characters').filter({name: 'Q'}).changes()`
 - `r.table('characters').map(r.row['name'] + ' chan').changes()`
   - This is anything that is really a map underneath:
   - `r.table('characters')['name'].changes()`
     - This is different from `r.table('characters').changes()('name')` !
   - `r.table('characters').pluck('name', 'score').changes()`
   - `r.table('characters').without('name').changes()`
   - `r.table('characters').merge({some_new_field: 'constant_string'}).changes()`
 - `r.table('characters').filter(r.row['species'].contains('Human'))['name'].changes()`
   - Can combine map and filter together
   - Any name changes of human characters
 - `r.table('characters').get_all('Human', index='species')['name'].changes()`
   - More efficient than above. Assumes a multi-index on species (an array field)
 - `r.table('characters').between(30, 40, index='score').changes()`
 - `r.table('characters').union(r.table('teams')).changes()`
 - `r.table('characters').order_by(index='score').limit(20)`
   - This is the "leaderboard" query
   - order_by must have an index specified
   - both order_by and limit must be present
## Chaining operations after a changefeed
 - Manipulating documents before `.changes()` vs. after
   - r.table('characters')['name'].changes()['new_val']`
     - Will return the new name whenever a character's name changes
   - r.table('characters').changes()['name']['new_val']`
     - Will return the name of any character that changes in any way
## Getting state changes
 - You can specify that you'd like to know when the state of a feed
   changes with `.changes(include_states=True)`
 - Right now, this is useful only in the .order_by.limit changefeed,
   since that will give you the initial values
 - Result looks like extra documents in the changefeed, but instead of
   the `new_val`, `old_val` keys, you'll get a `state` key that's either "initializing" or "ready"
 - Example:
   - `{state: 'initializing'}`
   - `{new_val: <initial result of query>}`
   - `{new_val: <another initial result>}`
   - ... rest of initial query results
   - `{state: 'ready'}`
   - ... some time passes ...
   - `{new_val: <changed document>}`
 - In RethinkDB 2.2, all changefeeds will have the option of providing
   initial results
## Taming changefeeds
 - Problem: Sometimes you want to throttle changefeeds
   - Solution: use the 'squash' parameters to `.changes()`
   - `query.changes(squash=5)`
     - squash all changes to a document in a 5 second window into a
       single change in the changefeed
     - max of 5 seconds, the first batch won't wait that long, and we
       won't wait that long when sending initial values
## Advanced changefeed techniques
 - Chaining further operations can be used to join in data from other
   tables when a change comes through

```python
r.table('characters')
 .changes()['new_val']
 .merge({'team': r.table('team').get(r.row['team_id'])})
```
   - This will add a new field to every change coming through, it
     looks up the corresponding document in the "team" table and
     merges it into the character document from the change
   - Caveats:
     - You can't get the "old_val" version of the "team" table's
       values, it doesn't exist any more!
     - It isn't atomic, so it's possible the team document could
       change between when the change on the character is generated
       and when the team document is fetched.
   - Takeaway: useful, but only safe to use this technique where one
     table will be relatively unchanging. If teams don't change a lot,
     but the members do, then this could work
 - Comparing new_val and old_val in a single query:

```python
r.table('characters').changes().filter(
    lambda change: change['new_val']['score'] > change['old_val']['score']
)['new_val']
```
   - This will get characters whose scores increase
