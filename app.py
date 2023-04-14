from flask import Flask, render_template, request, jsonify
import json
from main import *

# Import your desired Python function here, e.g., from your_module import your_python_function

app = Flask(__name__)


@app.route('/')
def index():
    with open('config.json', 'r') as config_file:
        config = json.load(config_file)

    return render_template('index.html', config=config)


@app.route('/submit_data', methods=['POST'])
def submit_data():
    market_provided = request.get_json()
    print(market_provided)
    # Call your Python function with the submitted data
    new_state = play_a_round(market_provided)
    print(new_state)
    return jsonify(new_state)


if __name__ == '__main__':
    app.run(debug=True)
