import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initUserTable, createUser } from './models/userModel.js';
import { initCourseTable, createCourse, initEnrollmentTable, enrollStudent } from './models/courseModel.js';
import { initAttendanceTable, markAttendance } from './models/attendanceModel.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Initialize database tables
const initDatabase = () => {
  try {
    // Initialize tables
    initUserTable();
    initCourseTable();
    initEnrollmentTable();
    initAttendanceTable();
    
    console.log('Database tables created successfully');
    
    // Seed initial data
    seedData();
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Seed initial data
const seedData = () => {
  try {
    // Create teachers
    const teacher1 = createUser({
      roll_number: 'TCSE001',
      name: 'Dr. Priya Mehta',
      password: 'password123',
      role: 'teacher',
      department: 'Computer Science'
    });
    
    const teacher2 = createUser({
      roll_number: 'TCSE002',
      name: 'Dr. Vikram Singh',
      password: 'password123',
      role: 'teacher',
      department: 'Computer Science'
    });
    
    // Create students
    const students = [];
    for (let i = 1; i <= 10; i++) {
      const rollNum = `120180${i.toString().padStart(2, '0')}`;
      const student = createUser({
        roll_number: rollNum,
        name: `Student ${i}`,
        password: 'password123',
        role: 'student',
        department: 'Computer Science'
      });
      students.push(student);
    }
    
    // Create a specific student for the demo
    const demoStudent = createUser({
      roll_number: '12018456',
      name: 'Rahul Sharma',
      password: 'password123',
      role: 'student',
      department: 'Computer Science'
    });
    students.push(demoStudent);
    
    // Create courses
    const courses = [
      createCourse({
        code: 'CS301',
        name: 'Data Structures',
        teacher_id: teacher1.id,
        department: 'Computer Science'
      }),
      createCourse({
        code: 'CS302',
        name: 'Algorithms',
        teacher_id: teacher1.id,
        department: 'Computer Science'
      }),
      createCourse({
        code: 'CS303',
        name: 'Database Systems',
        teacher_id: teacher2.id,
        department: 'Computer Science'
      }),
      createCourse({
        code: 'CS304',
        name: 'Computer Networks',
        teacher_id: teacher2.id,
        department: 'Computer Science'
      }),
      createCourse({
        code: 'HU301',
        name: 'Professional Ethics',
        teacher_id: teacher2.id,
        department: 'Humanities'
      })
    ];
    
    // Enroll students in courses
    students.forEach(student => {
      courses.forEach(course => {
        enrollStudent(student.id, course.id);
      });
    });
    
    // Mark sample attendance for each student
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];
    
    const dates = [today, yesterday, twoDaysAgo];
    const lectureTime = ['10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '1:00 PM - 2:00 PM'];
    
    students.forEach(student => {
      courses.forEach(course => {
        dates.forEach(date => {
          lectureTime.forEach(time => {
            // Randomly decide attendance status
            const randomNum = Math.random();
            let status;
            
            if (randomNum < 0.8) {
              status = 'present';
            } else if (randomNum < 0.9) {
              status = 'absent';
            } else {
              status = 'leave';
            }
            
            markAttendance({
              student_id: student.id,
              course_id: course.id,
              date,
              lecture_time: time,
              status,
              marked_by: course.teacher_id
            });
          });
        });
      });
    });
    
    console.log('Sample data created successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

// Run the initialization
initDatabase();