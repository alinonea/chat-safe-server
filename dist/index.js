import express from 'express';
import bodyParser from 'body-parser';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import keysRouter from './keysHandler';
import messagesRouter from './messagesHandler';
import roomsRouter from './roomsHandler';
import { storeMessage } from './messages-db';
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3001",
        credentials: true
    }
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', ['*']);
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});
app.use('/keys', keysRouter);
app.use('/messages', messagesRouter);
app.use('/rooms', roomsRouter);
let onlineUsers = [];
io.on('connect', (socket) => {
    console.log('a user has connected');
    socket.on('accept-message', async (address, message, room) => {
        const sentMessage = {
            roomId: room,
            address,
            message,
            timestamp: Date.now()
        };
        await storeMessage(sentMessage);
        const from = address;
        io.to(room).emit("send-message", sentMessage, from);
    });
    socket.on('join', (room) => {
        socket.join(room);
    });
    socket.on('new-user', (data) => {
        //Adds the new user to the list of users
        onlineUsers.push(data);
        //Sends the list of users to the client
        socket.emit('new-user-notify', onlineUsers);
    });
    socket.on('disconnect', async (reason) => {
        onlineUsers = onlineUsers.filter((user) => user.socketID !== socket.id);
        //Sends the list of users to the client
        socket.emit('new-user-notify', onlineUsers);
        socket.disconnect();
    });
});
server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});
