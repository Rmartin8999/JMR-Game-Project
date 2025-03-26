// Initialize Socket.IO connection
const socket = io();

// Game state
let balance = 10000;
let portfolio = {};
let stocks = [];

// DOM Elements
const stockList = document.getElementById('stockList');
const portfolioList = document.getElementById('portfolioList');
const balanceElement = document.getElementById('balance');

// Update balance display
function updateBalance() {
    balanceElement.textContent = `$${balance.toFixed(2)}`;
}

// Create stock item element
function createStockElement(stock) {
    const div = document.createElement('div');
    div.className = 'stock-item';
    div.innerHTML = `
        <div class="stock-info">
            <span class="stock-name">${stock.name}</span>
            <span class="stock-price ${stock.priceChange > 0 ? 'price-up' : 'price-down'}">
                $${stock.price.toFixed(2)}
            </span>
        </div>
        <div class="trade-buttons">
            <button class="btn btn-success btn-trade" onclick="buyStock(${stock.id})">Buy</button>
            <button class="btn btn-danger btn-trade" onclick="sellStock(${stock.id})">Sell</button>
        </div>
    `;
    return div;
}

// Create portfolio item element
function createPortfolioElement(stockId, quantity) {
    const stock = stocks.find(s => s.id === stockId);
    if (!stock) return null;

    const div = document.createElement('div');
    div.className = 'portfolio-item';
    div.innerHTML = `
        <div class="d-flex justify-content-between">
            <span>${stock.name}</span>
            <span>${quantity} shares</span>
        </div>
        <div class="d-flex justify-content-between">
            <span>Current Value: $${(stock.price * quantity).toFixed(2)}</span>
            <span>Price: $${stock.price.toFixed(2)}</span>
        </div>
    `;
    return div;
}

// Update portfolio display
function updatePortfolio() {
    portfolioList.innerHTML = '';
    Object.entries(portfolio).forEach(([stockId, quantity]) => {
        const element = createPortfolioElement(parseInt(stockId), quantity);
        if (element) portfolioList.appendChild(element);
    });
}

// Buy stock
function buyStock(stockId) {
    const stock = stocks.find(s => s.id === stockId);
    if (!stock) return;

    const quantity = 1;
    const cost = stock.price * quantity;

    if (balance >= cost) {
        balance -= cost;
        portfolio[stockId] = (portfolio[stockId] || 0) + quantity;
        updateBalance();
        updatePortfolio();
    } else {
        alert('Insufficient funds!');
    }
}

// Sell stock
function sellStock(stockId) {
    const stock = stocks.find(s => s.id === stockId);
    if (!stock) return;

    const quantity = 1;
    if (portfolio[stockId] >= quantity) {
        const earnings = stock.price * quantity;
        balance += earnings;
        portfolio[stockId] -= quantity;
        if (portfolio[stockId] === 0) {
            delete portfolio[stockId];
        }
        updateBalance();
        updatePortfolio();
    } else {
        alert('Not enough shares to sell!');
    }
}

// Socket.IO event handlers
socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('requestStocks');
});

socket.on('stocks', (updatedStocks) => {
    stocks = updatedStocks;
    stockList.innerHTML = '';
    stocks.forEach(stock => {
        stockList.appendChild(createStockElement(stock));
    });
});

socket.on('stockUpdate', (updatedStock) => {
    const index = stocks.findIndex(s => s.id === updatedStock.id);
    if (index !== -1) {
        stocks[index] = updatedStock;
        stockList.innerHTML = '';
        stocks.forEach(stock => {
            stockList.appendChild(createStockElement(stock));
        });
        updatePortfolio();
    }
}); 