const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { timeStamp } = require('console');
const PORT = process.env.PORT;

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('user connected', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`users :  ${socket.id}  joined to room : ${roomId}`);
  });

  socket.on('send-message', ({ roomId, text }) => {
    console.log(`${text}`);

    socket.to(roomId).emit('receive-message', {
      text,
      timestamp: new Date(),
    });
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
