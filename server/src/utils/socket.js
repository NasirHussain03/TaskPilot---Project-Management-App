const { Server } = require('socket.io');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

let io;

const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Allow development origins
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join room for specific projects (can be useful for granular events)
    socket.on('join_project', (projectId) => {
      socket.join(projectId);
      console.log(`Socket ${socket.id} joined project room: ${projectId}`);
    });

    // Leave room
    socket.on('leave_project', (projectId) => {
      socket.leave(projectId);
      console.log(`Socket ${socket.id} left project room: ${projectId}`);
    });

    // Real-time chat messaging handler
    socket.on('send_chat_message', async (data) => {
      try {
        const { userId, text } = data;
        if (!userId || !text || !text.trim()) return;

        // Persist message
        const message = await ChatMessage.create({
          user: userId,
          text: text.trim(),
        });

        // Populate sender info
        const populatedMessage = await ChatMessage.findById(message._id).populate(
          'user',
          'name email role'
        );

        // Broadcast to all connected clients
        io.emit('chat:message', populatedMessage);
      } catch (err) {
        console.error('Error handling live chat message:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};

module.exports = {
  init,
  getIO,
};
