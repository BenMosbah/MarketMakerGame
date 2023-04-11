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
            askPriceInput.value = Math.min(100, bidPrice + 1);
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

    submitButton.addEventListener('click', () => {
        const bidPrice = bidPriceInput.value;
        const askPrice = askPriceInput.value;
        const bidSize = bidSizeInput.value;
        const askSize = askSizeInput.value;

        // Do something with the input data, e.g., send to the server, update the game state, etc.
        console.log('Bid Price:', bidPrice);
        console.log('Bid Size:', bidSize);
        console.log('Ask Price:', askPrice);
        console.log('Ask Size:', askSize);
    });

    // Initialize price displays
    updatePriceDisplays();
});

