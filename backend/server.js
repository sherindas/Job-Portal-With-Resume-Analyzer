require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// Make io accessible in controllers
app.set('io', io);

// Connect DB
connectDB();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/users',         require('./routes/user.routes'));
app.use('/api/jobs',          require('./routes/job.routes'));
app.use('/api/applications',  require('./routes/application.routes'));
app.use('/api/resume',        require('./routes/resume.routes'));
app.use('/api/companies',     require('./routes/company.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/messages',      require('./routes/message.routes'));

// Health
app.get('/api/health', (_, res) => res.json({ status: 'OK', time: new Date() }));

// Socket.io — authenticate then join personal room
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('No token'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  // Each user joins their own room so we can target them directly
  socket.join(socket.userId);

  // Join a conversation room when user opens a chat
  socket.on('join_conversation', (appId) => {
    socket.join(`conv_${appId}`);
  });

  socket.on('leave_conversation', (appId) => {
    socket.leave(`conv_${appId}`);
  });

  socket.on('disconnect', () => {});
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
