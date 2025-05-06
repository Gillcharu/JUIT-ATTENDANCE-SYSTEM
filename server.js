import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import teacherRoutes from './routes/teacher.js';
import { authenticateToken as authenticateUser, checkRole } from './middleware/auth.js';

// Load environment variables
dotenv.config();

// Create express app
const app = express();
const PORT = process.env.PORT || 3000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'juit-attendance-portal-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', authenticateUser, checkRole('student'), studentRoutes);
app.use('/api/teacher', authenticateUser, checkRole('teacher'), teacherRoutes);

// Placeholder API for images
app.get('/api/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  res.redirect(`https://via.placeholder.com/${width}x${height}`);
});

// Serve pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', authenticateUser, (req, res) => {
  if (req.user.role === 'student') {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'teacher.html'));
  }
});

// Add route for leave request page
app.get('/leave-request', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'leave-request.html'));
});

// Catch-all route
app.get('*', (req, res) => {
  res.redirect('/');
});

const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
    });
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} is in use, trying ${PORT + 1}`);
      app.listen(PORT + 1, () => {
        console.log(`Server running on port ${PORT + 1}`);
      });
    } else {
      console.error('Error starting server:', error);
    }
  }
};

startServer();