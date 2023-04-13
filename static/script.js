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

    submitButton.addEventListener('click', async () => {
        const bidPrice = bidPriceInput.value;
        const askPrice = askPriceInput.value;
        const bidSize = bidSizeInput.value;
        const askSize = askSizeInput.value;

        // Send the submitted data to the server
        const response = await postData('/submit_data', {
            bidPrice: bidPrice,
            bidSize: bidSize,
            askPrice: askPrice,
            askSize: askSize
        });

        // Update the player's position
        const playerPositionElement = document.querySelector('#player-position span');
        playerPositionElement.textContent = response.exposure;
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
    });

    // Initialize price displays
    updatePriceDisplays();
});

