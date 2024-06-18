import { createRoom, addMessage, getSockets, deleteSocket, getMessages } from '../Models/Room.js';

export function handleConnection(socket, rooms) {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on('join', ({ name, user }) => {
        if (!rooms[name]) {
            rooms[name] = createRoom(user, socket);
        } else {
            if (rooms[name].sockets[user]) {
                socket.emit("alreadyConnected", { room: name, user: "INFO", text: 'Vous êtes déjà dans le salon.' });
                return;
            }
            rooms[name].sockets[user] = socket;
            socket.emit("messages", getMessages(rooms[name], name));
        }

        for (const oUser in rooms[name].sockets) {
            const oSocket = rooms[name].sockets[oUser];
            oSocket.emit("message", { room: name, user: "INFO", text: `<i>${user} a rejoint le salon</i>` });
        }
    });

    socket.on('message', ({ room, user, text }) => {
        if (rooms[room]) {
            addMessage(rooms[room], { user, text });
            for (const oUser in rooms[room].sockets) {
                const oSocket = rooms[room].sockets[oUser];
                oSocket.emit("message", { room, user, text });
            }
        }
    });

    socket.on('disconnect', () => {
        for (const name in rooms) {
            const room = rooms[name];
            for (const user in room.sockets) {
                const oSocket = room.sockets[user];
                if (oSocket === socket) {
                    deleteSocket(room, user);
                    for (const oUser in room.sockets) {
                        const oUserSocket = room.sockets[oUser];
                        oUserSocket.emit("message", { room: name, user: "INFO", text: `<i>${user} a quitté le salon<i>` });
                    }
                }
            }
        }
    });
}