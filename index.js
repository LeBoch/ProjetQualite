import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { handleConnection } from './Controllers/SocketController.js';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.static('public'));

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    }
});

const rooms = {}; // Définir les rooms ici

io.on('connection', (socket) => {
    handleConnection(socket, rooms); // Passer rooms à votre contrôleur
});

server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});