# JUIT Attendance Management System

A web-based attendance management system for Jaypee University of Information Technology.

## Features

- Teacher Dashboard
- Student Dashboard
- Leave Request Management
- Attendance Tracking
- Course Management
- Notifications System

## Deployment Instructions

### Option 1: Deploy to Render.com (Free)

1. Create a Render account at [render.com](https://render.com)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the deployment:
   - Name: `juit-attendance-portal`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add Environment Variables:
     - `JWT_SECRET`: Your secret key
     - `SESSION_SECRET`: Your session secret
     - `PORT`: 3000

### Option 2: Deploy to Heroku

1. Create a Heroku account
2. Install Heroku CLI
3. Run:
   ```bash
   heroku create
   git push heroku main
   heroku config:set JWT_SECRET=your-secret
   heroku config:set SESSION_SECRET=your-secret
   ```

### Option 3: Deploy to DigitalOcean

1. Create a DigitalOcean account
2. Create a new App Platform
3. Connect your repository
4. Configure environment variables
5. Deploy

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file with required variables
4. Start the server:
   ```bash
   npm run dev
   ```

## Environment Variables

Required environment variables:
- `JWT_SECRET`: Secret key for JWT tokens
- `SESSION_SECRET`: Secret key for sessions
- `PORT`: Server port (default: 3000)

## Security Considerations

- Always use HTTPS in production
- Keep your environment variables secure
- Regularly update dependencies
- Use strong secrets for JWT and sessions

## Project Structure

- **`/models`**: Database models and queries
- **`/routes`**: API routes for authentication, student, and teacher functionalities
- **`/middleware`**: Authentication middleware
- **`/public`**: Frontend HTML pages

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up database and sample data:
   ```
   npm run setup
   ```
4. Start the server:
   ```
   npm start
   ```

## Demo Credentials

### Student Login
- **Roll Number**: 12018456
- **Password**: password123

### Teacher Login
- **Roll Number**: TCSE001
- **Password**: password123

## API Endpoints

### Authentication
- `POST /api/auth/login`: Login with roll number and password
- `POST /api/auth/logout`: Logout user
- `GET /api/auth/me`: Get current user info

### Student
- `GET /api/student/courses`: Get student's enrolled courses
- `GET /api/student/attendance`: Get attendance statistics for all courses
- `GET /api/student/attendance/recent`: Get recent attendance records
- `GET /api/student/attendance/:courseId`: Get attendance for a specific course

### Teacher
- `GET /api/teacher/courses`: Get teacher's courses
- `GET /api/teacher/courses/:courseId/students`: Get enrolled students for a course
- `GET /api/teacher/attendance/:courseId/:date`: Get attendance for a course on a specific date
- `POST /api/teacher/attendance`: Mark attendance for a student
- `POST /api/teacher/attendance/batch`: Mark attendance for multiple students
- `GET /api/teacher/low-attendance`: Get students with low attendance

## License

This project is licensed under the MIT License.