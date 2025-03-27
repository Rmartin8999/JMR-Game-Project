const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Pokemon data (we'll move this to a separate file later)
let pokemonStocks = [
    { id: 1, name: 'Pikachu', price: 1000, volatility: 0.3, priceChange: 0 },
    { id: 2, name: 'Charizard', price: 800, volatility: 0.25, priceChange: 0 },
    { id: 3, name: 'Mewtwo', price: 500, volatility: 0.1, priceChange: 0 },
    { id: 4, name: 'Snorlax', price: 700, volatility: 0.2, priceChange: 0 },
    { id: 5, name: 'Gyarados', price: 600, volatility: 0.16, priceChange: 0 }
];

// Routes
app.get('/api/stocks', (req, res) => {
    res.json(pokemonStocks);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('requestStocks', () => {
        socket.emit('stocks', pokemonStocks);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Update stock prices periodically
setInterval(() => {
    pokemonStocks = pokemonStocks.map(stock => {
        const change = (Math.random() - 0.5) * stock.volatility * 2;
        const newPrice = stock.price * (1 + change);
        return {
            ...stock,
            price: newPrice,
            priceChange: change
        };
    });
    io.emit('stocks', pokemonStocks);
}, 5000); // Update every 5 seconds

// Start server
http.listen(port, () => {
    console.log(`Pokemon Stock Market running on port ${port}`);
});