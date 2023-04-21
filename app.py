from flask import Flask, render_template, request, jsonify, session
from flask_session import Session
import json
from player import Player
from main import *

# Import your desired Python function here, e.g., from your_module import your_python_function

app = Flask(__name__)
# Set up the session configuration
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SECRET_KEY'] = 'your-secret-key'  # Replace with a secure secret key
Session(app)


def initialize_player():
    player = Player()
    session['player'] = player
    session.modified = True


@app.route('/')
def index():
    with open('config.json', 'r') as config_file:
        config = json.load(config_file)
    initialize_player()
    print(config)
    return render_template('index.html', config=config)


@app.route('/submit_data', methods=['POST'])
def submit_data():
    market_provided = request.get_json()
    player = session['player']
    # Call your Python function with the submitted data
    new_state = play_a_round(market_provided, player)
    session['player'] = player
    session.modified = True
    print(new_state)
    return jsonify(new_state)


@app.route('/get_results', methods=['GET','POST'])
def get_results():
    player = session['player']
    pnl_score = str(player.calculate_pnl(true_value))+'%'
    tightness_score = str(player.get_tightness_score())+'%'
    liquidity_score = str(player.get_liquidity_score())
    inventory_score = str(player.get_inventory_score())
    print(pnl_score)
    # Return the results as a JSON response
    return jsonify({'pnl_score': pnl_score,
                    'tightness_score': tightness_score,
                    'liquidity_score': liquidity_score,
                    'inventory_score': inventory_score})


if __name__ == '__main__':
    app.run(debug=True)
