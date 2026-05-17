const jwt = require('jsonwebtoken');

module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
      } catch {
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      console.log(`👤 User ${socket.userId} connected`);
    }

    socket.on('joinSession', (sessionId) => {
      socket.join(`session:${sessionId}`);
    });

    socket.on('leaveSession', (sessionId) => {
      socket.leave(`session:${sessionId}`);
    });

    socket.on('timerSync', ({ sessionId, timerData }) => {
      socket.to(`session:${sessionId}`).emit('timerSync', timerData);
    });

    socket.on('workoutUpdate', ({ sessionId, exerciseIndex, setData }) => {
      socket.to(`session:${sessionId}`).emit('workoutUpdate', { exerciseIndex, setData });
    });

    socket.on('watchUser', (userId) => {
      socket.join(`watch:${userId}`);
    });

    socket.on('typing', ({ postId, username }) => {
      socket.to(`post:${postId}`).emit('typing', { username });
    });

    socket.on('stopTyping', ({ postId }) => {
      socket.to(`post:${postId}`).emit('stopTyping');
    });

    socket.on('joinPost', (postId) => socket.join(`post:${postId}`));
    socket.on('leavePost', (postId) => socket.leave(`post:${postId}`));

    socket.on('disconnect', () => {
      if (socket.userId) console.log(`👋 User ${socket.userId} disconnected`);
    });
  });
};
