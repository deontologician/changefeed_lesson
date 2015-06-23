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


@app.route('/top_twenty')
def sse_notify():
    print 'Opening an SSE feed'
    return Response(top_twenty_score_stream(), mimetype='text/event-stream')


def top_twenty_score_stream():
    '''Generator for changes to top twenty scoring characters'''
    conn = r.connect()
    query = None  # TODO: write query
    try:
        for result in query.run(conn):
            yield 'data: %s\n\n' % json.dumps(result)
    except Exception as e:
        print 'Failed with %s' % e
        yield 'ERROR\n\n'
        conn.close()
        raise


if __name__ == '__main__':
    app.run(debug=True)
