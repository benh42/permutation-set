from flask import Flask, render_template
from flask_socketio import SocketIO, emit

from server_functions import *

N = 4
K = 3

game_state = initialize_game_state(K, N)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
socketio = SocketIO(app, cors_allowed_origins='*')
@socketio.on('connect')

def on_connect():
    game_state_update = {
        'type': 'INIT',
        'game_state': game_state,
        'K': K,
    }
    emit('update', game_state_update)

@socketio.on('check_subset')
def check_subset(data):
    print(data)
    selected_card_indices = data['selectedCardIndices']
    selected_card_indices.sort()
    selected_card_indices.reverse()
    
    is_correct_subset = is_identity_permutation([game_state['cards'][i] for i in selected_card_indices], K)

    if is_correct_subset:
        for i in selected_card_indices:
            game_state['cards'].pop(i)  # ok because they are in reverse order
        replenish_cards(game_state, K, N)

        game_state_update = {
            'type': 'CORRECT_SUBSET',
            'game_state': game_state
        }

        print("WIN")

        emit('update', game_state_update)

socketio.run(app, host='0.0.0.0', port=5001, allow_unsafe_werkzeug=True)