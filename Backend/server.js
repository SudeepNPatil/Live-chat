const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors());

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});


io.on('connection', (socket) => {
  console.log('user connected', socket.id);

  
// ------------ This is chat ----------------------

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log("Users in room:", roomId);
    console.log(`users :  ${socket.id}  joined to room : ${roomId}`);
  });

  socket.on('send-message', ({ roomId, text }) => {
    console.log(`${text}`);

    socket.to(roomId).emit('receive-message', {
      text,
      timestamp: new Date(),
    });
  });


  // ---------------this is for video call -------------

    socket.on('offer',({roomId,offer})=>{
    console.log("offer recieved");

    socket.to(roomId).emit('offer',{offer});
  });

  socket.on('answer',({roomId,answer})=>{
    console.log("answer recieved");

    socket.to(roomId).emit('answer',{answer});
  });

  socket.on('ice-candidate',({roomId,candidate})=>{
    console.log("ICE condidates recieved",candidate,"from",roomId);

    socket.to(roomId).emit('ice-candidate',{candidate});
  });

      socket.on("call-request", ({ roomId }) => {
        console.log("callrequest recieved")
      socket.to(roomId).emit("call-request");
    });

    socket.on("call-accepted", ({ roomId }) => {
       console.log("call accepted")
      socket.to(roomId).emit("call-accepted");
    });

    socket.on("call-rejected", ({ roomId }) => {
       console.log("call rejected")
      socket.to(roomId).emit("call-rejected");
    });

  socket.on('disconnect', () => {
    console.log('user disconnected!', socket.id);
  });
});

app.use('/', (req, res) => {
  res.send('Server live now, you can chat now');
});

server.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
