import db from './db.js';

// Initialize courses table
export const initCourseTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      teacher_id INTEGER NOT NULL,
      department TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES users (id) 
    )
  `;
  
  db.prepare(createTableQuery).run();
};

// Create a new course
export const createCourse = (courseData) => {
  const { code, name, teacher_id, department } = courseData;
  
  const query = `
    INSERT INTO courses (code, name, teacher_id, department)
    VALUES (?, ?, ?, ?)
  `;
  
  try {
    const result = db.prepare(query).run(code, name, teacher_id, department);
    return { id: result.lastInsertRowid, code, name, teacher_id, department };
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

// Get course by code
export const getCourseByCode = (code) => {
  const query = `SELECT * FROM courses WHERE code = ?`;
  return db.prepare(query).get(code);
};

// Get course by ID
export const getCourseById = (id) => {
  const query = `SELECT * FROM courses WHERE id = ?`;
  return db.prepare(query).get(id);
};

// Get all courses
export const getAllCourses = () => {
  const query = `SELECT * FROM courses`;
  return db.prepare(query).all();
};

// Get courses by teacher ID
export const getCoursesByTeacher = (teacherId) => {
  const query = `SELECT * FROM courses WHERE teacher_id = ?`;
  return db.prepare(query).all(teacherId);
};

// Enroll student in course
export const enrollStudent = (studentId, courseId) => {
  const query = `
    INSERT INTO enrollments (student_id, course_id)
    VALUES (?, ?)
  `;
  
  try {
    const result = db.prepare(query).run(studentId, courseId);
    return { id: result.lastInsertRowid, student_id: studentId, course_id: courseId };
  } catch (error) {
    console.error('Error enrolling student:', error);
    throw error;
  }
};

// Initialize enrollments table
export const initEnrollmentTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users (id),
      FOREIGN KEY (course_id) REFERENCES courses (id),
      UNIQUE(student_id, course_id)
    )
  `;
  
  db.prepare(createTableQuery).run();
};

// Get enrolled students for a course
export const getEnrolledStudents = (courseId) => {
  const query = `
    SELECT u.id, u.roll_number, u.name 
    FROM users u
    JOIN enrollments e ON u.id = e.student_id
    WHERE e.course_id = ?
  `;
  
  return db.prepare(query).all(courseId);
};

// Get courses for a student
export const getStudentCourses = (studentId) => {
  const query = `
    SELECT c.*, u.name as teacher_name
    FROM courses c
    JOIN enrollments e ON c.id = e.course_id
    JOIN users u ON c.teacher_id = u.id
    WHERE e.student_id = ?
  `;
  
  return db.prepare(query).all(studentId);
};