-- View Users
SELECT '=== USERS (Students and Teachers) ===' as '';
SELECT 
    roll_number as 'ID/Roll Number',
    name as 'Name',
    role as 'Role',
    department as 'Department'
FROM users
ORDER BY role DESC, roll_number;

-- View Courses
SELECT '=== COURSES ===' as '';
SELECT 
    code as 'Course Code',
    name as 'Course Name',
    (SELECT name FROM users WHERE id = teacher_id) as 'Teacher Name',
    department as 'Department'
FROM courses;

-- View Student Enrollments
SELECT '=== STUDENT ENROLLMENTS ===' as '';
SELECT 
    u.roll_number as 'Student Roll',
    u.name as 'Student Name',
    c.code as 'Course Code',
    c.name as 'Course Name'
FROM enrollments e
JOIN users u ON e.student_id = u.id
JOIN courses c ON e.course_id = c.id
ORDER BY u.roll_number, c.code
LIMIT 15;

-- View Recent Attendance
SELECT '=== RECENT ATTENDANCE RECORDS ===' as '';
SELECT 
    u.roll_number as 'Student Roll',
    u.name as 'Student Name',
    c.code as 'Course',
    a.date as 'Date',
    a.lecture_time as 'Time',
    a.status as 'Status',
    (SELECT name FROM users WHERE id = a.marked_by) as 'Marked By'
FROM attendance a
JOIN users u ON a.student_id = u.id
JOIN courses c ON a.course_id = c.id
ORDER BY a.date DESC, a.lecture_time
LIMIT 15; 