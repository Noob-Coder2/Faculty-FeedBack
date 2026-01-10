# Server Models Documentation

## Overview
This document describes the Mongoose schemas for the server models used in the application, defining the structure and constraints for MongoDB collections.

---

## AggregatedRating
Stores aggregated feedback ratings for a teaching assignment and rating parameter.

- **Fields**:
  - `teachingAssignment`: ObjectId, ref: TeachingAssignment, required
  - `ratingParameter`: ObjectId, ref: RatingParameter, required
  - `totalResponses`: Number, required, min: 0
  - `ratingSum`: Number, required, min: 0
  - `averageRating`: Number, required, min: 1, max: 5
- **Indexes**:
  - Unique: `{ teachingAssignment: 1, ratingParameter: 1 }`
  - `{ teachingAssignment: 1 }`
- **Model**: `AggregatedRating`

---

## Class
Represents a class with details like name, branch, and academic year.

- **Fields**:
  - `name`: String, required, trimmed
  - `branch`: String, required, trimmed
  - `semester`: String, required, trimmed
  - `year`: Number, required, min: 2000, max: current year
  - `section`: String, required, trimmed
  - `academicYear`: String, required, trimmed
- **Timestamps**: Enabled
- **Model**: `Class`

---

## FacultyProfile
Stores faculty details linked to a user.

- **Fields**:
  - `user`: ObjectId, ref: User, required, unique
  - `department`: String, required, trimmed
  - `subjects`: Array of ObjectId, ref: Subject, default: []
  - `designation`: String, required, trimmed
  - `joiningYear`: Number, required, min: 1900, max: current year
  - `qualifications`: Array of String, default: []
  - `isActive`: Boolean, default: true
- **Timestamps**: Enabled
- **Model**: `FacultyProfile`

---

## FeedbackPeriod
Manages feedback periods with start/end dates and status.

- **Fields**:
  - `name`: String, required
  - `semester`: Number, required
  - `year`: Number, required
  - `startDate`: Date, required
  - `endDate`: Date, required
  - `isActive`: Boolean, default: false
  - `status`: String, enum: ['upcoming', 'active', 'closed'], default: 'upcoming'
- **Timestamps**: Enabled
- **Model**: `FeedbackPeriod`

---

## RatingParameter
Defines rating parameters for feedback.

- **Fields**:
  - `parameterId`: String, required, unique
  - `questionText`: String, required
  - `order`: Number, default: 0
  - `isActive`: Boolean, default: true
- **Timestamps**: Enabled
- **Model**: `RatingParameter`

---

## StudentProfile
Stores student details linked to a user.

- **Fields**:
  - `user`: ObjectId, ref: User, required, unique
  - `branch`: String, enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'CSE AIML', 'CSE DS'], required
  - `semester`: Number, enum: [1, 2, 3, 4, 5, 6, 7, 8], required
  - `section`: String, enum: ['A', 'B', 'C'], required
  - `classId`: ObjectId, ref: Class
  - `admissionYear`: Number, required
  - `status`: String, enum: ['active', 'graduated', 'inactive', 'dropped'], default: 'active'
  - `pendingMapping`: Boolean, default: true
- **Timestamps**: Enabled
- **Model**: `StudentProfile`

---

## Subject
Represents a subject with code, name, branch, and semester.

- **Fields**:
  - `subjectCode`: String, required, unique
  - `subjectName`: String, required
  - `branch`: String, required
  - `semester`: Number, required
- **Timestamps**: Enabled
- **Model**: `Subject`

---

## TeachingAssignment
Links faculty, subject, class, and feedback period for teaching assignments.

- **Fields**:
  - `faculty`: ObjectId, ref: User, required
  - `subject`: ObjectId, ref: Subject, required
  - `class`: ObjectId, ref: Class, required
  - `feedbackPeriod`: ObjectId, ref: FeedbackPeriod, required
- **Indexes**:
  - Unique: `{ faculty: 1, subject: 1, class: 1, feedbackPeriod: 1 }`
- **Timestamps**: Enabled
- **Model**: `TeachingAssignment`

---

## User
Stores user details with authentication.

- **Fields**:
  - `userId`: String, required, unique, trimmed
  - `name`: String, required, trimmed
  - `email`: String, required, unique, lowercase, trimmed, email format
  - `password`: String, required, minlength: 6
  - `role`: String, enum: ['student', 'faculty', 'admin'], required
  - `isActive`: Boolean, default: true
- **Middleware**: Hashes password before saving using bcrypt
- **Methods**: `comparePassword` for password verification
- **Timestamps**: Enabled
- **Model**: `User`