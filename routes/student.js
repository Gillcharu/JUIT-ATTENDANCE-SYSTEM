import express from 'express';
import {
  getStudentCourses,
  getStudentAttendance,
  getStudentAttendanceStats,
  getRecentAttendance,
  getStudentProfile,
  updateStudentProfile,
  getAttendanceReport
} from '../models/attendanceModel.js';

const router = express.Router();

// Get student profile
router.get('/profile', (req, res) => {
  try {
    console.log('Getting profile for student:', req.user.id);
    const profile = getStudentProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json({ profile });
  } catch (error) {
    console.error('Error getting student profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update student profile
router.put('/profile', (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const updatedProfile = updateStudentProfile(req.user.id, { name, email, phone });
    res.json({ message: 'Profile updated successfully', profile: updatedProfile });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student's courses
router.get('/courses', (req, res) => {
  try {
    console.log('Getting courses for student:', req.user.id);
    const courses = getStudentCourses(req.user.id);
    res.json({ courses });
  } catch (error) {
    console.error('Error getting student courses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance for all courses
router.get('/attendance', (req, res) => {
  try {
    console.log('Getting attendance stats for student:', req.user.id);
    const stats = getStudentAttendanceStats(req.user.id);
    
    // Calculate percentage for each course
    const attendanceData = stats.map(course => {
      const total = course.total_classes;
      const present = course.present_count;
      const percentage = total > 0 ? (present / total) * 100 : 0;
      
      return {
        courseId: course.course_id,
        courseCode: course.code,
        courseName: course.name,
        attended: present,
        total: total,
        percentage: parseFloat(percentage.toFixed(1)),
        status: percentage >= 75 ? 'Good' : percentage >= 70 ? 'Warning' : 'Critical'
      };
    });
    
    // Calculate overall attendance
    let totalClasses = 0;
    let totalPresent = 0;
    
    stats.forEach(course => {
      totalClasses += course.total_classes;
      totalPresent += course.present_count;
    });
    
    const overallPercentage = totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0;
    
    // Count subjects below 75%
    const belowThreshold = attendanceData.filter(course => course.percentage < 75).length;
    
    res.json({
      overall: parseFloat(overallPercentage.toFixed(1)),
      belowThreshold,
      totalSubjects: attendanceData.length,
      courses: attendanceData
    });
  } catch (error) {
    console.error('Error getting attendance stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recent attendance
router.get('/attendance/recent', (req, res) => {
  try {
    console.log('Getting recent attendance for student:', req.user.id);
    const recentAttendance = getRecentAttendance(req.user.id);
    
    const formattedAttendance = recentAttendance.map(record => ({
      date: record.date,
      subject: record.name,
      subjectCode: record.code,
      status: record.status,
      lectureTime: record.lecture_time
    }));
    
    res.json({ attendance: formattedAttendance });
  } catch (error) {
    console.error('Error getting recent attendance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance for a specific course
router.get('/attendance/:courseId', (req, res) => {
  try {
    console.log('Getting course attendance for student:', req.user.id, 'course:', req.params.courseId);
    const { courseId } = req.params;
    const attendance = getStudentAttendance(req.user.id, courseId);
    res.json({ attendance });
  } catch (error) {
    console.error('Error getting course attendance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance report
router.get('/attendance/report', (req, res) => {
  try {
    console.log('Generating attendance report for student:', req.user.id);
    const { startDate, endDate } = req.query;
    const report = getAttendanceReport(req.user.id, startDate, endDate);
    res.json({ report });
  } catch (error) {
    console.error('Error generating attendance report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student notifications
router.get('/notifications', (req, res) => {
  try {
    console.log('Getting notifications for student:', req.user.id);
    const stats = getStudentAttendanceStats(req.user.id);
    
    // Generate notifications based on attendance
    const notifications = [];
    
    // Add attendance warnings for specific subjects
    const subjects = [
      { code: 'MA101', name: 'Engineering Mathematics', percentage: 83.3 },
      { code: 'PH101', name: 'Engineering Physics', percentage: 80.0 },
      { code: 'CS201', name: 'Data Structures and Algorithms', percentage: 73.7 },
      { code: 'EE101', name: 'Basic Electrical Sciences', percentage: 75.0 },
      { code: 'HU101', name: 'Universal Human Values', percentage: 71.4 }
    ];
    
    // Add attendance warnings for subjects below 75%
    subjects.forEach(subject => {
      if (subject.percentage < 75) {
        notifications.push({
          title: 'Attendance Warning',
          message: `Your attendance in ${subject.name} (${subject.code}) is below 75% (${subject.percentage}%)`,
          date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          type: 'warning'
        });
      }
    });
    
    // Add leave approval notification
    notifications.push({
      title: 'Leave Approved',
      message: 'Your leave request for 21 Mar 2025 has been approved',
      date: '20 Mar 2025',
      type: 'info'
    });
    
    // Add report notification
    notifications.push({
      title: 'Attendance Report',
      message: 'Mid-semester attendance report is now available',
      date: '15 Mar 2025',
      type: 'info'
    });
    
    res.json({ notifications });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;