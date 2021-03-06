# Getting set up

First we need to set up the tables we'll use. (RethinkDB must be
running). Go to http://localhost:8080/#dataexplorer and run these
queries to create the tables (hit the "Run" button between each query)

```js
r.tableCreate('characters')
r.table('characters').indexCreate('score') // creates an index for each character's score
r.table('characters').indexCreate('species', {multi: true}) // creates an index entry for each species
r.table('characters').indexCreate('team_id')
r.table('characters').insert(r.http("https://goo.gl/j0rb2x", {resultFormat: 'json'}))

r.tableCreate('teams')
r.table('teams').indexCreate('attributes', {multi: true}) // team attributes
r.table("teams").insert(r.http("https://goo.gl/CYaNrC", {resultFormat: 'json'}))
```

Now that it's set up, it's best to create a virtual
environment. (guide
[here](http://docs.python-guide.org/en/latest/dev/virtualenvs/)).

Once that's set up, install the module with:

```bash
(my-virtualenv) $ python setup.py develop
```

Then to run the server, we need to use gunicorn. It runs lots of
copies of our flask app over the same port, which we'll need since
each browser connection to the server needs to stay open.

```bash
(my-virtualenv) $ cd changefeeds/
(my-virtualenv) $ gunicorn -k gevent -b '0.0.0.0:5000' changefeed:app
```

The file to modify is `changefeeds/changefeed.py` and the server is
available on localhost:5000.
