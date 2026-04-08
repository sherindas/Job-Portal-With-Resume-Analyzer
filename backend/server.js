require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

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
app.use('/api/auth',         require('./routes/auth.routes'));
app.use('/api/users',        require('./routes/user.routes'));
app.use('/api/jobs',         require('./routes/job.routes'));
app.use('/api/applications', require('./routes/application.routes'));
app.use('/api/resume',       require('./routes/resume.routes'));
app.use('/api/companies',    require('./routes/company.routes'));
app.use('/api/notifications',require('./routes/notification.routes'));
app.use('/api/messages',     require('./routes/message.routes'));

// Health
app.get('/api/health', (_, res) => res.json({ status: 'OK', time: new Date() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
