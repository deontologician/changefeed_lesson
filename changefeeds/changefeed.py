from flask import Flask, Response, render_template, send_from_directory
import json

from rethinkdb import r


app = Flask(__name__, static_url_path='/static')

@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/static/<path:path>')
def styles(path):
    return send_from_directory('static', path)


@app.route('/character/<char_id>')
def update_character():
    data = json.loads(request.body)
    # TODO: update in rethinkdb

@app.route('/sse_notify')
def sse_notify():
    print 'Opening an SSE feed'
    return Response(event_stream(), mimetype='text/event-stream')


def top_twenty_changes():
    '''Generator for changes to top twenty scoring characters'''
    conn = r.connect()
    query = None #TODO: write query
    try:
        for result in query.run(conn, time_format='raw'):
            yield 'data: %s\n\n' % json.dumps(result)
    except Exception as e:
        print 'Failed with %s' % e
        yield 'ERROR\n\n'
        conn.close()
        raise


if __name__ == '__main__':
    app.run(debug=True)
