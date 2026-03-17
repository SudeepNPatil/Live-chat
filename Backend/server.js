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
const roomUsers = {};

io.on('connection', (socket) => {
  console.log('user connected', socket.id);

  
// ------------ This is chat ----------------------

  socket.on('join-room', (roomId) => {
    socket.join(roomId);

  if (!roomUsers[roomId]) {
    roomUsers[roomId] = [];
  }

  // add user if not already present
  if (!roomUsers[roomId].includes(socket.id)) {
    roomUsers[roomId].push(socket.id);
  }

  // 🔥 SEND USERS LIST TO ROOM
  io.to(roomId).emit('users-in-room', roomUsers[roomId]);

    console.log("Users in room:", roomUsers[roomId]);
    console.log(`users :  ${socket.id}  joined to room : ${roomId}`);
  });

  socket.on('send-message', ({ roomId, text }) => {
    console.log(`${text}`);

    socket.to(roomId).emit('receive-message', {
      text,
      timestamp: new Date(),
    });
  });


  // ---------------this is for view call -------------

    // Call user (send offer)
  socket.on('call-user', ({ to, offer }) => {
    io.to(to).emit('incoming-call', {
      from: socket.id,
      offer,
    });
  });

  // Answer call
  socket.on('answer-call', ({ to, answer }) => {
    io.to(to).emit('call-answered', {
      from: socket.id,
      answer,
    });
  });

  // ICE candidate exchange
  socket.on('ice-candidate', ({ to, candidate }) => {
    io.to(to).emit('ice-candidate', {
      from: socket.id,
      candidate,
    });
  });

  socket.on('disconnect', () => {
      for (const roomId in roomUsers) {
    roomUsers[roomId] = roomUsers[roomId].filter(
      id => id !== socket.id
    );

    // update remaining users
    io.to(roomId).emit('users-in-room', roomUsers[roomId]);
  }
    console.log('user disconnected!', socket.id);
  });
});

app.use('/', (req, res) => {
  res.send('Server live now, you can chat now');
});

server.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
