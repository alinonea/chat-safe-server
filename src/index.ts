import express from 'express';
import bodyParser from 'body-parser';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { WebSocketServer } from 'ws';
import keysRouter from './keysHandler'
import messagesRouter from './messagesHandler'
import { addSubscription, removeSubscriptionsForConnections } from './subscriptionsDB';
import { getMessagesAfter, storeMessage } from './messagesDB';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3003",
    credentials: true
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded(
  {extended: true}
));

app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', ['*']);
  res.append('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

app.use('/keys', keysRouter)
app.use('/messages', messagesRouter)

let onlineUsers = []

io.on('connect', (socket) => {
  console.log('a user has connected')

  // socket.on('subscribe', async(channels) => {
  //   const connectionId = socket.id
    
  //   for (const sub of channels) {
  //     await addSubscription(sub, connectionId)
  //   }
  // })

  socket.on('accept-message', async(address, message) => {
    await storeMessage(address, message)

    io.sockets.emit("send-message", {
      message: message,
      address: address
    });
  })

  socket.on('get-recent-messages', async(address) => {
    const items = await getMessagesAfter(address, Date.now() - 24 * 60 * 60 * 1000)
    console.log(items)
    for (const item of items) {
      console.log('sent: ' + item)
      socket.emit("send-message", item);
    }
  })

  socket.on('new-user', (data) => {
    //Adds the new user to the list of users
    onlineUsers.push(data);
    console.log(onlineUsers)
    // console.log(users);
    //Sends the list of users to the client
    socket.emit('new-user-notify', onlineUsers);
  });

  socket.on('disconnect', async(reason) => {
    // await removeSubscriptionsForConnections(socket.id)
    onlineUsers = onlineUsers.filter((user) => user.socketID !== socket.id);
    // console.log(users);
    //Sends the list of users to the client
    socket.emit('new-user-notify', onlineUsers);
    socket.disconnect();
  })
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});