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

    // Set the input attributes using the config values
    bidPriceInput.min = config.price_bounds.min;
    bidPriceInput.max = config.price_bounds.max;
    bidPriceInput.step = config.step_size;

    askPriceInput.min = config.price_bounds.min;
    askPriceInput.max = config.price_bounds.max;
    askPriceInput.step = config.step_size;
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

        bidPriceDisplay.textContent = bidPriceInput.value;
        askPriceDisplay.textContent = askPriceInput.value;
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

    submitButton.addEventListener('click', async () => {
        // Get the current position
        const currentPosition = parseInt(document.querySelector('#player-position span').textContent);
        // Validate the bidSize and askSize values
        const bidPrice = bidPriceInput.value;
        const askPrice = askPriceInput.value;
        const bidSize = bidSizeInput.value;
        const askSize = askSizeInput.value;
        // Get the current round number
        const roundCounterElement = document.querySelector('#round-counter span');
        const currentRound = parseInt(roundCounterElement.textContent);
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
        actionCell.textContent = `You ${trade.fill_type}d`;
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
        updateDisplaySize(0, displayAskSize)
        updateDisplaySize(0, displayBidSize)
    });

    // Initialize price displays
    updatePriceDisplays();
    updateSizeOptions(0);
});

