import db from './db.js';

// Get teacher profile
export function getTeacherProfile(teacherId) {
    const stmt = db.prepare('SELECT * FROM teachers WHERE id = ?');
    return stmt.get(teacherId);
}

// Get teacher's assigned courses
export function getTeacherCourses(teacherId) {
    const stmt = db.prepare(`
        SELECT c.*, 
               COUNT(DISTINCT e.student_id) as total_students,
               COUNT(DISTINCT CASE WHEN a.status = "present" THEN a.id END) as present_count,
               COUNT(DISTINCT a.id) as total_attendance
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN attendance a ON c.id = a.course_id
        WHERE c.teacher_id = ?
        GROUP BY c.id
    `);
    return stmt.all(teacherId);
}

// Get students in a course
export function getCourseStudents(courseId) {
    const stmt = db.prepare(`
        SELECT s.*, 
               COUNT(CASE WHEN a.status = "present" THEN 1 END) as present_count,
               COUNT(a.id) as total_attendance
        FROM students s
        JOIN enrollments e ON s.id = e.student_id
        LEFT JOIN attendance a ON s.id = a.student_id AND e.course_id = a.course_id
        WHERE e.course_id = ?
        GROUP BY s.id
    `);
    return stmt.all(courseId);
}

// Mark attendance for a course
export function markAttendance(courseId, date, attendanceData) {
    const stmt = db.prepare(`
        INSERT INTO attendance (student_id, course_id, date, status)
        VALUES (?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((attendanceData) => {
        for (const record of attendanceData) {
            stmt.run(record.studentId, courseId, date, record.status);
        }
    });
    
    return insertMany(attendanceData);
}

// Get attendance for a course on a specific date
export function getCourseAttendance(courseId, date) {
    const stmt = db.prepare(`
        SELECT a.*, s.name as student_name, s.roll_number
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.course_id = ? AND a.date = ?
    `);
    return stmt.all(courseId, date);
}

// Get leave requests for teacher's courses
export function getLeaveRequests(teacherId) {
    const stmt = db.prepare(`
        SELECT lr.*, s.name as student_name, s.roll_number, c.name as course_name
        FROM leave_requests lr
        JOIN students s ON lr.student_id = s.id
        JOIN courses c ON lr.course_id = c.id
        WHERE c.teacher_id = ?
        ORDER BY lr.created_at DESC
    `);
    return stmt.all(teacherId);
}

// Update leave request status
export function updateLeaveRequest(requestId, status) {
    const stmt = db.prepare(`
        UPDATE leave_requests 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `);
    return stmt.run(status, requestId);
}

// Send notification to students
export function sendNotification(teacherId, courseId, message) {
    const stmt = db.prepare(`
        INSERT INTO notifications (teacher_id, course_id, message, created_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `);
    return stmt.run(teacherId, courseId, message);
}

// Get teacher's notifications
export function getTeacherNotifications(teacherId) {
    const stmt = db.prepare(`
        SELECT n.*, c.name as course_name
        FROM notifications n
        LEFT JOIN courses c ON n.course_id = c.id
        WHERE n.teacher_id = ?
        ORDER BY n.created_at DESC
    `);
    return stmt.all(teacherId);
} 