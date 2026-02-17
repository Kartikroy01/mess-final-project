// server.js
const express = require('express');
// Force backend restart for menu updates (2)
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mess_management')
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const messOffRoutes = require('./routes/messOff');
const feedbackRoutes = require('./routes/feedback');
const menuRoutes = require('./routes/menu');
const billRoutes = require('./routes/bill');
const munshiRoutes = require('./routes/munshi');
const { getPublicMenu, upsertPublicMenu } = require('./controllers/menuPageController');

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.path}`);
  next();
});

console.log('[Server] Registering routes...');

// PUBLIC MENU ENDPOINT - Must be registered BEFORE protected routes
app.get('/api/menu/public', getPublicMenu);
app.put('/api/menu/public', upsertPublicMenu);
console.log('[Server] Registered /api/menu/public (PUBLIC - NO AUTH)');

// Use Routes
app.use('/api/auth', authRoutes);
console.log('[Server] Registered /api/auth');

app.use('/api/student', studentRoutes);
console.log('[Server] Registered /api/student');

app.use('/api/mess-off', messOffRoutes);
console.log('[Server] Registered /api/mess-off');

app.use('/api/feedback', feedbackRoutes);
console.log('[Server] Registered /api/feedback');

app.use('/api/munshi/menu', menuRoutes); // Munshi-protected menu routes
console.log('[Server] Registered /api/munshi/menu (PROTECTED)');

app.use('/api/bill', billRoutes);
console.log('[Server] Registered /api/bill');

const addBillRoutes = require('./routes/addBill');
app.use('/api/munshi/bill', addBillRoutes);
console.log('[Server] Registered /api/munshi/bill (PROTECTED)');

app.use('/api/munshi', munshiRoutes);
console.log('[Server] Registered /api/munshi');

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!', 
        error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});