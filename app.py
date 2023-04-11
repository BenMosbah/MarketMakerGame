from flask import Flask, render_template
import json

app = Flask(__name__)


@app.route('/')
def index():
    with open('config.json', 'r') as config_file:
        config = json.load(config_file)

    return render_template('index.html', config=config)


if __name__ == '__main__':
    app.run(debug=True)
