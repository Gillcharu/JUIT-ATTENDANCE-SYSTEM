import express from 'express';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import { getTeacherProfile, getCoursesByTeacher } from '../models/attendanceModel.js';
import { getCourseStudents, markAttendance, getCourseAttendance, getLeaveRequests, updateLeaveRequest, sendNotification, getTeacherNotifications } from '../models/teacherModel.js';

const router = express.Router();

// Get teacher profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const profile = getTeacherProfile(req.user.id);
        if (!profile) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.json({ profile });
    } catch (error) {
        console.error('Error getting teacher profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get teacher's courses
router.get('/courses', authenticateToken, async (req, res) => {
    try {
        const courses = getCoursesByTeacher(req.user.id);
        res.json({ courses });
    } catch (error) {
        console.error('Error getting teacher courses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get students in a course
router.get('/courses/:courseId/students', authenticateToken, async (req, res) => {
    try {
        const students = getCourseStudents(req.params.courseId);
        res.json(students);
    } catch (error) {
        console.error('Error getting course students:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Mark attendance for a course
router.post('/courses/:courseId/attendance', authenticateToken, async (req, res) => {
    try {
        const { date, attendanceData } = req.body;
        if (!date || !attendanceData) {
            return res.status(400).json({ error: 'Date and attendance data are required' });
        }
        
        const result = markAttendance(req.params.courseId, date, attendanceData);
        res.json({ message: 'Attendance marked successfully', result });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get attendance for a course on a specific date
router.get('/courses/:courseId/attendance/:date', authenticateToken, async (req, res) => {
    try {
        const attendance = getCourseAttendance(req.params.courseId, req.params.date);
        res.json(attendance);
    } catch (error) {
        console.error('Error getting course attendance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get leave requests
router.get('/leave-requests', authenticateToken, async (req, res) => {
    try {
        const requests = getLeaveRequests(req.user.id);
        res.json(requests);
    } catch (error) {
        console.error('Error getting leave requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update leave request status
router.put('/leave-requests/:requestId', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Valid status is required' });
        }
        
        const result = updateLeaveRequest(req.params.requestId, status);
        res.json({ message: 'Leave request updated successfully', result });
    } catch (error) {
        console.error('Error updating leave request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Send notification
router.post('/notifications', authenticateToken, async (req, res) => {
    try {
        const { courseId, message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        const result = sendNotification(req.user.id, courseId, message);
        res.json({ message: 'Notification sent successfully', result });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get teacher's notifications
router.get('/notifications', authenticateToken, async (req, res) => {
    try {
        const notifications = getTeacherNotifications(req.user.id);
        res.json(notifications);
    } catch (error) {
        console.error('Error getting teacher notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;