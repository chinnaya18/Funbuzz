const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join rooms based on role
    socket.on('join', (data) => {
      if (data.role === 'admin') {
        socket.join('admins');
        console.log(`Admin joined: ${socket.id}`);
      } else if (data.role === 'participant') {
        socket.join('participants');
        socket.join(`participant:${data.participantId}`);
        console.log(`Participant joined: ${socket.id} (${data.participantId})`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;
