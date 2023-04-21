async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    return await response.json();
}

async function getResults() {
    try {
        const response = await fetch('/get_results');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

async function initializeGame() {
  const loadRules = async () => {
    const response = await fetch('static/rules.html');
    const content = await response.text();
    return content;
  };

  const rulesContent = await loadRules();

  Swal.fire({
    title: 'Welcome to the Game',
    html: rulesContent,
    confirmButtonText: 'OK',
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false
  });
}


window.addEventListener('DOMContentLoaded', () => {
    const bidPriceInput = document.getElementById('bid-price');
    const bidPriceDisplay = document.getElementById('bid-price-display');
    const askPriceInput = document.getElementById('ask-price');
    const askPriceDisplay = document.getElementById('ask-price-display');
    const bidSizeInput = document.getElementById('bid-size');
    const askSizeInput = document.getElementById('ask-size');
    const displayBidSize = document.querySelector('.display-bid-size');
    const displayAskSize = document.querySelector('.display-ask-size');
    const submitButton = document.getElementById('submit');
    initializeGame();

    displayQuestion(config.question);

    // Set the input attributes using the config values
    bidPriceInput.min = config.price_bounds.min;
    bidPriceInput.max = config.price_bounds.max;
    bidPriceInput.step = config.step_size;

    askPriceInput.min = config.price_bounds.min;
    askPriceInput.max = config.price_bounds.max;
    askPriceInput.step = config.step_size;

    function displayQuestion(question) {
    const questionElement = document.getElementById('question');
    questionElement.textContent = question;
    }


    function createDisk() {
        const disk = document.createElement('div');
        disk.classList.add('disk');
        return disk;
    }

    function updateDisplaySize(size, displayElement) {
        displayElement.innerHTML = '';
        for (let i = 0; i < size; i++) {
            displayElement.appendChild(createDisk());
        }
    }

    function updatePriceDisplays() {
        const bidPrice = parseInt(bidPriceInput.value);
        const askPrice = parseInt(askPriceInput.value);

        if (bidPrice >= askPrice) {
            askPriceInput.value = Math.min(config.price_bounds.max, bidPrice + parseInt(config.step_size));
        } else {
            askPriceInput.value = askPrice;
        }

        bidPriceDisplay.textContent = parseInt(bidPriceInput.value).toLocaleString();
        askPriceDisplay.textContent = parseInt(askPriceInput.value).toLocaleString();
    }

    bidPriceInput.addEventListener('input', updatePriceDisplays);
    askPriceInput.addEventListener('input', updatePriceDisplays);

    bidSizeInput.addEventListener('input', () => {
        updateDisplaySize(bidSizeInput.value, displayBidSize);
    });

    askSizeInput.addEventListener('input', () => {
        updateDisplaySize(askSizeInput.value, displayAskSize);
    });

    function validateSizes(bidSize, askSize, currentPosition) {
    const bidSizeInt = parseInt(bidSize);
    const askSizeInt = parseInt(askSize);
    const newPositionBid = currentPosition + bidSizeInt;
    const newPositionAsk = currentPosition - askSizeInt;

    if (newPositionBid > 10 || newPositionAsk < -10) {
        return false;
    }

    return true;
    }

    function updateSizeOptions(currentPosition) {
        const bidSizeSelect = document.getElementById('bid-size');
        const askSizeSelect = document.getElementById('ask-size');

        bidSizeSelect.innerHTML = '';
        askSizeSelect.innerHTML = '';

        const maxBidSize = Math.min(10 - currentPosition, 10);
        const maxAskSize = Math.min(10 + currentPosition, 10);

        for (let i = 1; i <= maxBidSize; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.text = i;
            bidSizeSelect.add(option);
        }

        for (let i = 1; i <= maxAskSize; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.text = i;
            askSizeSelect.add(option);
        }
    }

    function createResultsTable(data) {
    const table = document.createElement('table');
    table.classList.add('results-table');

    const td = (content) => {
        const cell = document.createElement('td');
        cell.classList.add('results-table-cell');
        cell.textContent = content;
        return cell;
    };

    const addRow = (label, value) => {
        const row = document.createElement('tr');
        const labelCell = document.createElement('td');
        const valueCell = document.createElement('td');
        labelCell.textContent = label;
        valueCell.textContent = value;
        row.appendChild(labelCell);
        row.appendChild(valueCell);
        table.appendChild(row);
    };

    addRow('Your PnL score:', data.pnl_score);
    addRow('Your tightness score:', data.tightness_score);
    addRow('You brought on average this much liquidity:', data.liquidity_score);
    addRow('Your inventory score:', data.inventory_score);

    return table;
    }

    let getResultsButton;
    submitButton.addEventListener('click', async () => {
        // Check if the maximum number of rounds is reached
        const roundCounterElement = document.querySelector('#round-counter span');
        const currentRound = parseInt(roundCounterElement.textContent);
        if (currentRound <= config.maximum_number_of_rounds)
        {
        // Get the current position
        const currentPosition = parseInt(document.querySelector('#player-position span').textContent);
        // Validate the bidSize and askSize values
        const bidPrice = bidPriceInput.value;
        const askPrice = askPriceInput.value;
        const bidSize = bidSizeInput.value;
        const askSize = askSizeInput.value;
        // Get the current round number
        //const roundCounterElement = document.querySelector('#round-counter span');
        //const currentRound = parseInt(roundCounterElement.textContent);
        // Send the submitted data to the server
        const response = await postData('/submit_data', {
            bidPrice: bidPrice,
            bidSize: bidSize,
            askPrice: askPrice,
            askSize: askSize,
            round: currentRound
        });

        // Update the player's position
        const playerPositionElement = document.querySelector('#player-position span');
        playerPositionElement.textContent = response.exposure;
        // UpdateSizeOptions based on new trade
        updateSizeOptions(parseInt(playerPositionElement.textContent));
        // Update the table of trades
        const tradesTableBody = document.querySelector('#trades-table tbody');
        tradesTableBody.innerHTML = '';
        response.trades.forEach(trade => {

        const row = document.createElement('tr');
        const actionCell = document.createElement('td');
        let fill;
        if (trade.fill_type == 'buy') {
            fill = 'bought';
        } else {
            fill = 'sold';
        }
        actionCell.textContent = `You ${fill}`;
        const sizeCell = document.createElement('td');
        sizeCell.textContent = trade.trading_size;
        const priceCell = document.createElement('td');
        priceCell.textContent = trade.order_price;

        row.appendChild(actionCell);
        row.appendChild(sizeCell);
        row.appendChild(priceCell);

        tradesTableBody.appendChild(row);
        });

        // Increment the round number

        roundCounterElement.textContent = currentRound + 1;
        }

        else{// Fetch the results from the backend
            submitButton.style.display = 'none';

            if (!getResultsButton) {
                        getResultsButton = document.createElement('button');
                        getResultsButton.textContent = 'Get Results!';
                        getResultsButton.id = 'get-results';
                        submitButton.parentElement.appendChild(getResultsButton);

                        getResultsButton.addEventListener('click', async () => {
                            const results = await getResults();
                            const resultsTable = createResultsTable(results);
                            Swal.fire({
                                title: 'Your Results',
                                html: resultsTable.outerHTML,
                                confirmButtonText: 'OK',
                                allowOutsideClick: false,
                                allowEscapeKey: false,
                                allowEnterKey: false
                            });
                        });
                    }
            }

        updateDisplaySize(0, displayAskSize)
        updateDisplaySize(0, displayBidSize)
    });

    // Initialize price displays
    updatePriceDisplays();
    updateSizeOptions(0);
});

