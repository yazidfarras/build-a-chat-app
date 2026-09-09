import http from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';

const PORT = 3001;

const server = http.createServer((req, res) => {
    fs.readFile('./public/index.html', (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
});

const WSS = new WebSocketServer({ server });

// 4. Ketika client terhubung
WSS.on('connection', (socket, req) => {
    const username = new URL(
        req.url,
        'http://localhost'
    ).searchParams.get('username');

    // Broadcast pesan system bahwa user bergabung
    WSS.clients.forEach((client) => {
        client.send(JSON.stringify({
            type: 'system',
            text: `${username} joined`
        }));
    });

    // 5. Menerima pesan dari client
    socket.on('message', (data) => {
        const { username, text } = JSON.parse(data);

        WSS.clients.forEach((client) => {
            client.send(JSON.stringify({
                type: 'chat',
                username,
                text
            }));
        });
    });

    // 6. Ketika client keluar
    socket.on('close', () => {
        WSS.clients.forEach((client) => {
            client.send(JSON.stringify({
                type: 'system',
                text: `${username} left`
            }));
        });
    });
});

// 7. Menjalankan server
server.listen(PORT, () => {
    console.log(`Chat server running at http://localhost:${PORT}`);
});
