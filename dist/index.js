import express from 'express';
import bodyParser from 'body-parser';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import keysRouter from './keysHandler';
import messagesRouter from './messagesHandler';
import { addSubscription, removeSubscriptionsForConnections } from './subscriptionsDB';
import { getMessagesAfter, storeMessage } from './messagesDB';
const app = express();
const server = createServer(app);
const io = new Server(server);
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
io.on('connect', (socket) => {
    socket.on('subscribe', async (channels) => {
        const connectionId = socket.id;
        for (const sub of channels) {
            await addSubscription(sub, connectionId);
        }
    });
    socket.on('accept-message', async (address, message) => {
        await storeMessage(address, message);
        socket.emit("send-message", message);
    });
    socket.on('get-recent-messages', async (address) => {
        const items = await getMessagesAfter(address, Date.now() - 24 * 60 * 60 * 1000);
        console.log(items);
        for (const item of items) {
            socket.emit("send-message", item);
        }
    });
    socket.on('disconnect', async (reason) => {
        await removeSubscriptionsForConnections(socket.id);
    });
});
server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});
