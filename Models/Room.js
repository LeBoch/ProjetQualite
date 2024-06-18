export function createRoom(user, socket) {
    return {
        sockets: { [user]: socket },
        messages: []
    };
}

export function addMessage(room, message) {
    room.messages.push(message);
}

export function getSockets(room) {
    return room.sockets;
}

export function deleteSocket(room, user) {
    delete room.sockets[user];
}

export function getMessages(room, roomName) {
    return room.messages.map(e => ({ room: roomName, ...e }));
}