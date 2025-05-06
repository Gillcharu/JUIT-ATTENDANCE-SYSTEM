import express from 'express';
import jwt from 'jsonwebtoken';
import { getUserByRollNumber, getUserByTeacherId, verifyPassword } from '../models/userModel.js';

const router = express.Router();

// Login route
router.post('/login', (req, res) => {
  try {
    const { role, id, password } = req.body;
    
    // Find user based on role and ID
    let user;
    if (role === 'student') {
      user = getUserByRollNumber(id);
    } else if (role === 'teacher') {
      user = getUserByTeacherId(id);
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify user role matches the requested role
    if (user.role !== role) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isValidPassword = verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    // Send user info (excluding password)
    const { password: _, ...userInfo } = user;
    
    res.json({
      message: 'Login successful',
      user: userInfo,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
});

// Get current user
router.get('/me', (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = getUserByRollNumber(decoded.roll_number);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    const { password: _, ...userInfo } = user;
    res.json({ user: userInfo });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;