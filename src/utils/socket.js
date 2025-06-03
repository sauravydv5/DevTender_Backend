const onlineUsers = new Map();

const initializeSocket = (server) => {
  const io = require("socket.io")(server, {
    cors: { origin: ["http://localhost:5173"] },
  });

  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.on("joinChat", ({ userId, targetUserId, firstName }) => {
      if (onlineUsers.has(userId)) {
        onlineUsers.get(userId).add(socket.id);
      } else {
        onlineUsers.set(userId, new Set([socket.id]));
      }

      const roomId = [userId, targetUserId].sort().join("_");
      socket.join(roomId);

      socket.to(roomId).emit("userOnline", { userId, firstName });

      console.log(`${firstName} joined room: ${roomId} and is online`);
    });

    socket.on("sendMessage", ({ firstName, userId, targetUserId, text }) => {
      const roomId = [userId, targetUserId].sort().join("_");
      io.to(roomId).emit("messageReceived", { firstName, text });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);

      for (const [userId, sockets] of onlineUsers.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            onlineUsers.delete(userId);

            io.emit("userOffline", { userId });
            console.log(`User ${userId} is now offline`);
          }
          break;
        }
      }
    });
  });
};

module.exports = initializeSocket;
