import db from './db.js';
import bcrypt from 'bcryptjs';

// Initialize users table
export const initUserTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roll_number TEXT UNIQUE,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.prepare(createTableQuery).run();
};

// Create a new user
export const createUser = (userData) => {
  const { roll_number, name, password, role, department } = userData;
  
  // Hash password
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  
  const query = `
    INSERT INTO users (roll_number, name, password, role, department)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  try {
    const result = db.prepare(query).run(roll_number, name, hashedPassword, role, department);
    return { id: result.lastInsertRowid, roll_number, name, role, department };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Get user by roll number
export const getUserByRollNumber = (rollNumber) => {
  const query = `SELECT * FROM users WHERE roll_number = ?`;
  return db.prepare(query).get(rollNumber);
};

// Get user by teacher ID
export const getUserByTeacherId = (teacherId) => {
  const query = `SELECT * FROM users WHERE roll_number = ? AND role = 'teacher'`;
  return db.prepare(query).get(teacherId);
};

// Get user by ID
export const getUserById = (id) => {
  const query = `SELECT * FROM users WHERE id = ?`;
  return db.prepare(query).get(id);
};

// Get user by email
export const getUserByEmail = (email) => {
  const query = `SELECT * FROM users WHERE email = ?`;
  return db.prepare(query).get(email);
};

// Verify password
export const verifyPassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

// Get all students
export const getAllStudents = () => {
  const query = `SELECT id, roll_number, name, department FROM users WHERE role = 'student'`;
  return db.prepare(query).all();
};

// Get all teachers
export const getAllTeachers = () => {
  const query = `SELECT id, roll_number, name, department FROM users WHERE role = 'teacher'`;
  return db.prepare(query).all();
};

// Update user password
export const updateUserPassword = (userId, newPassword) => {
  // Hash password
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(newPassword, salt);
  
  const query = `
    UPDATE users 
    SET password = ? 
    WHERE id = ?
  `;
  
  try {
    db.prepare(query).run(hashedPassword, userId);
    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};