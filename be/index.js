require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const cors = require('cors');
const http = require('http'); // cần tạo server cho socket
const { swaggerUi, swaggerDocs } = require('./src/docs/swagger');
const adminRoutes = require('./src/routes/adminRoutes');
const teamRoutes = require('./src/routes/teamRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const voteRoutes = require('./src/routes/voteRoutes');
const postRoutes = require('./src/routes/postRoutes');
const teamRequestRoutes = require('./src/routes/teamRequestRoutes');
const lecturerRequestRoutes = require('./src/routes/lecturerRequestRoutes');
const jwt = require('jsonwebtoken'); // để xác thực token Socket.IO

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ Warning: JWT_SECRET is missing in .env file!');
} else {
  console.log('🔑 JWT_SECRET loaded successfully');
}

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API routes
app.use('/api', require('./src/routes/authRoutes'));
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/team-requests', teamRequestRoutes);
app.use('/api/lecturer-requests', lecturerRequestRoutes);

// Root
app.get('/', (req, res) => res.send('Backend is running!'));

// --------------------
// 🏁 Start HTTP + Socket.IO server
// --------------------
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: { origin: "*" },
});
app.set("io", io);

// Middleware xác thực Socket.IO (tùy chọn)
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(); // nếu muốn bắt buộc, hãy next(new Error("Auth required"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // gán thông tin user cho socket
    next();
  } catch (err) {
    console.warn('⚠️ Socket.IO auth failed:', err.message);
    next(); // vẫn cho connect nếu không muốn bắt buộc
  }
});

// --------------------
// Socket.IO events
// --------------------
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id, socket.user ? `userId=${socket.user.id}` : '');

  // Admin join room
  socket.on('join_admin_room', () => {
    socket.join('admins');
    console.log('🛡️ Admin joined room:', socket.id);
  });

  // Student join room riêng
  socket.on('join_student_room', ({ studentId }) => {
    if (studentId) {
      socket.join(`student_${studentId}`);
      console.log(`🎓 Student joined room: student_${studentId}`);
    }
  });

  // Student gửi request -> notify admin realtime
  socket.on('student_request', (requestData) => {
    console.log('📨 New student request:', requestData);

    io.to('admins').emit('new_request', requestData);

    if (requestData.studentId) {
      io.to(`student_${requestData.studentId}`).emit('request_sent', requestData);
    }
  });

  // --------------------
  // Realtime cho Posts & Comments
  // --------------------
  socket.on('new_post', (post) => {
    console.log('📝 New post created:', post);
    io.emit('post_created', post); // phát cho tất cả client
  });

  socket.on('new_comment', (comment) => {
    console.log('💬 New comment added:', comment);
    io.emit('comment_created', comment); // phát cho tất cả client
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});


// Start server
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📘 Swagger Docs: http://localhost:${PORT}/api-docs`);
});
