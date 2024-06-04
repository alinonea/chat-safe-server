import { io } from "socket.io-client";
const socket = io("ws://localhost:3000", {
    reconnectionDelayMax: 10000,
});
socket.on("connect", () => {
    console.log('client connected to server');
    socket.emit('subscribe', ['a', 'b']);
    // socket.emit("accept-message", "abc", "hello")
    // socket.on('send-message', (message) => {
    //   console.log(message)
    // })
    // socket.emit("get-recent-messages", "abc")
});
