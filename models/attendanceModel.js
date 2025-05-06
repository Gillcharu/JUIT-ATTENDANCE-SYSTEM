import db from './db.js';

// Initialize attendance table
export const initAttendanceTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      lecture_time TEXT NOT NULL,
      status TEXT NOT NULL, -- 'present', 'absent', 'leave'
      marked_by INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users (id),
      FOREIGN KEY (course_id) REFERENCES courses (id),
      FOREIGN KEY (marked_by) REFERENCES users (id),
      UNIQUE(student_id, course_id, date, lecture_time)
    )
  `;
  
  db.prepare(createTableQuery).run();
};

// Get student profile
export const getStudentProfile = (studentId) => {
  const query = `
    SELECT id, roll_number, name, department, created_at
    FROM users
    WHERE id = ? AND role = 'student'
  `;
  return db.prepare(query).get(studentId);
};

// Update student profile
export const updateStudentProfile = (studentId, { name, email, phone }) => {
  const query = `
    UPDATE users
    SET name = ?, email = ?, phone = ?
    WHERE id = ? AND role = 'student'
  `;
  db.prepare(query).run(name, email, phone, studentId);
  return getStudentProfile(studentId);
};

// Get teacher profile
export const getTeacherProfile = (teacherId) => {
  const query = `
    SELECT id, roll_number, name, department, email, phone
    FROM users
    WHERE id = ? AND role = 'teacher'
  `;
  return db.prepare(query).get(teacherId);
};

// Update teacher profile
export const updateTeacherProfile = (teacherId, { name, email, phone }) => {
  const query = `
    UPDATE users
    SET name = ?, email = ?, phone = ?
    WHERE id = ? AND role = 'teacher'
  `;
  db.prepare(query).run(name, email, phone, teacherId);
  return getTeacherProfile(teacherId);
};

// Get courses by teacher
export const getCoursesByTeacher = (teacherId) => {
  const query = `
    SELECT id, code, name, department
    FROM courses
    WHERE teacher_id = ?
  `;
  return db.prepare(query).all(teacherId);
};

// Get course statistics
export const getCourseStats = (courseId) => {
  const query = `
    SELECT 
      COUNT(DISTINCT student_id) as total_students,
      COUNT(CASE WHEN status = 'present' THEN 1 END) as total_present,
      COUNT(CASE WHEN status = 'absent' THEN 1 END) as total_absent,
      COUNT(CASE WHEN status = 'leave' THEN 1 END) as total_leave,
      COUNT(DISTINCT date) as total_classes
    FROM attendance
    WHERE course_id = ?
  `;
  return db.prepare(query).get(courseId);
};

// Get enrolled students
export const getEnrolledStudents = (courseId) => {
  const query = `
    SELECT u.id, u.roll_number, u.name, u.department
    FROM users u
    JOIN enrollments e ON u.id = e.student_id
    WHERE e.course_id = ?
  `;
  return db.prepare(query).all(courseId);
};

// Mark attendance
export const markAttendance = (attendanceData) => {
  const { student_id, course_id, date, lecture_time, status, marked_by } = attendanceData;
  
  const query = `
    INSERT INTO attendance (student_id, course_id, date, lecture_time, status, marked_by)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(student_id, course_id, date, lecture_time) 
    DO UPDATE SET status = excluded.status, marked_by = excluded.marked_by
  `;
  
  try {
    const result = db.prepare(query).run(student_id, course_id, date, lecture_time, status, marked_by);
    return { id: result.lastInsertRowid, student_id, course_id, date, lecture_time, status };
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
};

// Get attendance by date
export const getAttendanceByDate = (courseId, date) => {
  const query = `
    SELECT 
      a.*,
      u.roll_number,
      u.name as student_name,
      c.code as course_code,
      c.name as course_name
    FROM attendance a
    JOIN users u ON a.student_id = u.id
    JOIN courses c ON a.course_id = c.id
    WHERE a.course_id = ? AND a.date = ?
    ORDER BY u.roll_number
  `;
  return db.prepare(query).all(courseId, date);
};

// Get student attendance
export const getStudentAttendance = (studentId, courseId) => {
  const query = `
    SELECT 
      a.*,
      c.code as course_code,
      c.name as course_name,
      u.name as marked_by_name
    FROM attendance a
    JOIN courses c ON a.course_id = c.id
    JOIN users u ON a.marked_by = u.id
    WHERE a.student_id = ? AND a.course_id = ?
    ORDER BY a.date DESC, a.lecture_time
  `;
  return db.prepare(query).all(studentId, courseId);
};

// Get student attendance stats
export const getStudentAttendanceStats = (studentId) => {
  const query = `
    SELECT 
      c.id as course_id,
      c.code,
      c.name,
      COUNT(*) as total_classes,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    LEFT JOIN attendance a ON e.course_id = a.course_id AND e.student_id = a.student_id
    WHERE e.student_id = ?
    GROUP BY c.id, c.code, c.name
  `;
  return db.prepare(query).all(studentId);
};

// Get recent attendance
export const getRecentAttendance = (studentId) => {
  const query = `
    SELECT 
      a.*,
      c.code,
      c.name
    FROM attendance a
    JOIN courses c ON a.course_id = c.id
    WHERE a.student_id = ?
    ORDER BY a.date DESC, a.lecture_time
    LIMIT 10
  `;
  return db.prepare(query).all(studentId);
};

// Get students with low attendance
export const getStudentsWithLowAttendance = (threshold = 75) => {
  const query = `
    WITH attendance_stats AS (
      SELECT 
        u.id,
        u.roll_number,
        u.name,
        c.id as course_id,
        c.code as course_code,
        c.name as course_name,
        COUNT(*) as total_classes,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
        (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)) as attendance_percentage
      FROM users u
      JOIN enrollments e ON u.id = e.student_id
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN attendance a ON e.course_id = a.course_id AND e.student_id = a.student_id
      WHERE u.role = 'student'
      GROUP BY u.id, u.roll_number, u.name, c.id, c.code, c.name
      HAVING attendance_percentage < ?
    )
    SELECT * FROM attendance_stats
    ORDER BY attendance_percentage ASC
  `;
  return db.prepare(query).all(threshold);
};

// Generate attendance report
export const generateAttendanceReport = (courseId, startDate, endDate) => {
  const query = `
    SELECT 
      u.roll_number,
      u.name as student_name,
      COUNT(*) as total_classes,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
      COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
      COUNT(CASE WHEN a.status = 'leave' THEN 1 END) as leave_count,
      (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)) as attendance_percentage
    FROM users u
    JOIN enrollments e ON u.id = e.student_id
    LEFT JOIN attendance a ON e.course_id = a.course_id AND e.student_id = a.student_id
    WHERE e.course_id = ? AND a.date BETWEEN ? AND ?
    GROUP BY u.roll_number, u.name
    ORDER BY u.roll_number
  `;
  return db.prepare(query).all(courseId, startDate, endDate);
};

// Get attendance report for a student
export const getAttendanceReport = (studentId, startDate, endDate) => {
  const query = `
    SELECT 
      c.code as course_code,
      c.name as course_name,
      COUNT(*) as total_classes,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
      COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
      COUNT(CASE WHEN a.status = 'leave' THEN 1 END) as leave_count,
      (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)) as attendance_percentage
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    LEFT JOIN attendance a ON e.course_id = a.course_id AND e.student_id = a.student_id
    WHERE e.student_id = ? AND a.date BETWEEN ? AND ?
    GROUP BY c.code, c.name
    ORDER BY c.code
  `;
  return db.prepare(query).all(studentId, startDate, endDate);
};

// Get student's enrolled courses
export const getStudentCourses = (studentId) => {
  const query = `
    SELECT 
      c.id,
      c.code,
      c.name,
      c.department,
      u.name as teacher_name,
      c.schedule
    FROM courses c
    JOIN enrollments e ON c.id = e.course_id
    LEFT JOIN users u ON c.teacher_id = u.id
    WHERE e.student_id = ?
    ORDER BY c.code
  `;
  return db.prepare(query).all(studentId);
};