import random

def is_identity_permutation(permutation_set, K):
    track = [i for i in range(K)]
    for permutation in permutation_set:
        track = [permutation[i] for i in track]
    return track == [0, 1, 2]

def generate_random_permutation(K):
    while True:
        permutation = [i for i in range(K)]
        random.shuffle(permutation)
        if permutation != [i for i in range(K)]:
            return permutation

def replenish_cards(game_state, K, N):
    num_cards_present = len(game_state['cards'])
    for _ in range(N - num_cards_present):
        game_state['cards'].append(generate_random_permutation(K))
    
def initialize_game_state(K, N):
    return {
        'cards': [generate_random_permutation(K) for _ in range(N)]
    }