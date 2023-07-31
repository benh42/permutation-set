$(document).ready(function() {
    // Store the selected cards in a Set
    var selectedCardIndices = new Set();

    var N = null;
    var K = null;

    var score = 0;

    var topRow = $('#topRow');

    // Connect to the WebSocket server
    const socket = io.connect('http://34.125.224.212:5001')  // 'http://34.125.243.146:5001');

    // Function to initialize the game state
    function initializeGameState(gameStateUpdate) {
        N = gameStateUpdate.game_state.cards.length;
        K = gameStateUpdate.K;

        topRow.empty();

        gameStateUpdate.game_state.cards.forEach(card => {
            appendCard(card);
        });
    }
    
    function appendCard(card) {
        const placeholderCard = createPlaceholderCard(card);
        topRow.append(placeholderCard);
        placeholderCard.addClass("active");
    }

    function removeCard(card_index) {
        const $topRowCards = topRow.children('.card');
        const $selectedCard = $topRowCards.eq(card_index);
            
        // Add a CSS class to handle the transition animation
        $selectedCard.removeClass('active');
        
        // Listen for the 'transitionend' event and remove the card once the transition is complete
        $selectedCard.on('transitionend', () => {
            $selectedCard.remove();
        });

        if (selectedCardIndices.has(card_index)) {
            selectedCardIndices.delete(card_index);
        }
    }

    // Function to replace selected cards with new random cards
    // function replaceSelectedCards(selectedCards) {
    //     // Remove selected cards from the top row
    //     selectedCards.forEach(card => {
    //         card.style.transform = "translateY(100px)";
    //         card.classList.remove('selected');
    //         card.remove(); // Remove the card element from the DOM
    //     });
    //     selectedCards.clear();

    //     // Slide remaining cards to the left
    //     slideRemainingCards();
    // }

    function createPlaceholderCard(permutation) {
        console.log(`${permutation.join('')}.png`);
        return $(`<div class="card" data-permutation="${permutation}">
                    <img src="${permutation.join('')}.png" alt="${permutation.join('')}">
                </div>`);
        // return $(`<div class="card" data-permutation="${permutation}">
        //         <span class="permutation-value">${permutation}</span>
        //     </div>`);
    }

    // Function to handle the result of subset validation
    // function handleSubsetResult(result) {
    //     if (result.isCorrectSubset) {
    //         // If the subset is correct, remove the selected cards from the UI
    //         replaceSelectedCards(selectedCards);
    //         setCorrectCardsAnimation();
    //     } else {
    //         // If the subset is incorrect, deselect the cards
    //         selectedCards.forEach(card => {
    //             card.classList.remove('selected');
    //         });
    //     }

    //     selectedCards.length = 0; // Clear the selectedCards array
    // }

    // Function to check if the selected cards form the identity permutation
    function checkSubset() {
        // Emit the selected card IDs to the server for validation
        var selectedCardIndicesArray = [...selectedCardIndices];
        socket.emit('check_subset', { 'selectedCardIndices': selectedCardIndicesArray });
    }

    function handleCardClick(event) {

        // Get all the cards in the top row
        const $topRowCards = topRow.children('.card');

        var $selectedCard = $(this);
        // console.log($selectedCard.attr('data-permutation'));

        $selectedCard.toggleClass('selected');

        var index = $topRowCards.index($selectedCard);
        if (selectedCardIndices.has(index)) {
            selectedCardIndices.delete(index);
        } else {
            selectedCardIndices.add(index);
        }

        if (selectedCardIndices.size !== 0) {
            checkSubset();
        }
    }

    function handleCorrectSubset(gameStateUpdate) {
        if (gameStateUpdate.subset === selectedCardIndices) {
            score++;
        }
        gameStateUpdate.subset.forEach(index => {
            removeCard(index);
        });
        for (let index = N - gameStateUpdate.subset.length; index < N; index++) {
            appendCard(gameStateUpdate.game_state.cards[index]);
        }
        updateScoreDisplay();
    }

    function updateScoreDisplay() {
        score_box = $('#score');
        score_box.text('Score: ' + score);
    }

    // Listen for game_state event from the server
    socket.on('update', (gameStateUpdate) => {
        switch (gameStateUpdate.type) {
            case 'INIT':
                initializeGameState(gameStateUpdate)
                break;
            case 'CORRECT_SUBSET':
                handleCorrectSubset(gameStateUpdate);
                break;
            default:
                console.log(gameStateUpdate);
                break;
          }
    });

    // Click event listener for the cards
    $(document).on('click', ".card", handleCardClick);

    updateScoreDisplay();

    // $('#topRow').on('click', handleCardClick);
});
