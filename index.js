const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let players = {};

io.on('connection', (socket) => {
    // 2人まで受け入れる
    if (Object.keys(players).length < 2) {
        const side = Object.keys(players).length === 0 ? 'top' : 'bottom';
        players[socket.id] = { side, x: 200 };
        socket.emit('assign_side', side);
    }

    // 位置情報を全員に転送（ラグ対策：超高速で送る）
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            socket.broadcast.emit('update', { id: socket.id, x: data.x, side: players[socket.id].side });
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
