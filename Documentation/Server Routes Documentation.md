# Server Routes Documentation

## Overview
This document outlines the server routes for the Faculty Feedback application, organized by functionality. Each route includes its HTTP method, endpoint, description, and key validations.

---

## Admin Routes (`/api/admin`)

### POST `/users`
- **Description**: Creates a new user (admin, student, or faculty) with role-specific profiles.
- **Validations**:
  - `userId`, `name`, `email`, `password`, `role` required.
  - Student: `branch`, `semester`, `section`, `academicYear`, `admissionYear`.
  - Faculty: `department`, `designation`, `joiningYear`, optional `subjects`, `qualifications`.
- **Response**: 201 on success, 400 for duplicates, 500 for errors.

### GET `/users`
- **Description**: Lists all users with pagination, excluding passwords.
- **Validations**: Optional `page`, `limit` (1-100).
- **Response**: 200 with user list and pagination metadata, 500 for errors.

### GET `/users/:id`
- **Description**: Fetches a specific user’s details and profile.
- **Validations**: `id` (MongoID).
- **Response**: 200 with user and profile, 404 if not found, 500 for errors.

### PUT `/users/:id`
- **Description**: Updates user details and role-specific profile.
- **Validations**: `id` (MongoID), optional fields like `name`, `email`, `password`, `role`, student/faculty fields.
- **Response**: 200 with updated user, 404 if not found, 500 for errors.

### DELETE `/users/:id`
- **Description**: Deletes a user and cascades to delete their profile.
- **Validations**: `id` (MongoID).
- **Response**: 200 on success, 404 if not found, 500 for errors.

### GET `/pending-students`
- **Description**: Retrieves students with `pendingMapping: false`.
- **Response**: 200 with student list, 500 for errors.

### PUT `/map-student/:id`
- **Description**: Maps a student to a class.
- **Validations**: `id` (MongoID), `classId` (MongoID).
- **Response**: 200 on success, 404 if not found, 500 for errors.

---

## Change Password (`/api/user`)

### PUT `/change-password`
- **Description**: Updates user password (authenticated).
- **Validations**: `currentPassword`, `newPassword` (min 6 chars).
- **Response**: 200 on success, 400 for incorrect password, 500 for errors.

---

## Classes (`/api/admin/classes`)

### POST `/`
- **Description**: Creates a new class.
- **Validations**: `name`, `branch`, `semester`, `year`, `section`, `academicYear`.
- **Response**: 201 on success, 400 for duplicates, 500 for errors.

### GET `/`
- **Description**: Lists all classes with pagination.
- **Validations**: Optional `page`, `limit` (1-100).
- **Response**: 200 with class list and pagination, 500 for errors.

### GET `/:id`
- **Description**: Retrieves a specific class.
- **Validations**: `id` (MongoID).
- **Response**: 200 with class details, 404 if not found, 500 for errors.

### PUT `/:id`
- **Description**: Updates a class.
- **Validations**: `id` (MongoID), optional fields like `name`, `branch`, etc.
- **Response**: 200 with updated class, 404 if not found, 500 for errors.

### DELETE `/:id`
- **Description**: Deletes a class.
- **Validations**: `id` (MongoID).
- **Response**: 200 on success, 404 if not found, 500 for errors.

---

## Faculty Ratings (`/api/admin/faculty-ratings`)

### GET `/`
- **Description**: Retrieves faculty ratings with filters (admin only).
- **Validations**: Optional `facultyId`, `subjectId`, `feedbackPeriodId` (MongoID), `page`, `limit` (1-100).
- **Response**: 200 with aggregated ratings and pagination, 500 for errors.

---

## Faculty Routes (`/api/faculty`)

### GET `/ratings`
- **Description**: Retrieves a faculty member’s aggregated ratings (authenticated).
- **Validations**: Optional `feedbackPeriod` (MongoID).
- **Response**: 200 with ratings by assignment, 404 if no period/assignments, 500 for errors.

### GET `/search`
- **Description**: Searches faculty by name (shared: admin, faculty, student).
- **Validations**: `name` (min 2 chars), optional `page`, `limit` (1-50).
- **Response**: 200 with faculty list and pagination, 500 for errors.

---

## Feedback Periods (`/api/admin/feedback-periods`)

### POST `/`
- **Description**: Creates a new feedback period.
- **Validations**: `name`, `semester` (1-12), `year`, `startDate`, `endDate` (ISO 8601), optional `isActive`.
- **Response**: 201 on success, 400 for invalid dates, 500 for errors.

### GET `/`
- **Description**: Lists all feedback periods with pagination.
- **Validations**: Optional `page`, `limit` (1-100).
- **Response**: 200 with periods and pagination, 500 for errors.

### GET `/:id`
- **Description**: Retrieves a specific feedback period.
- **Validations**: `id` (MongoID).
- **Response**: 200 with period details, 404 if not found, 500 for errors.

### PUT `/:id`
- **Description**: Updates a feedback period.
- **Validations**: `id` (MongoID), optional fields like `name`, `semester`, etc.
- **Response**: 200 with updated period, 404 if not found, 400 for invalid dates, 500 for errors.

---

## Login (`/api/auth`)

### POST `/login`
- **Description**: Authenticates user and issues JWT.
- **Validations**: `userId`, `password`.
- **Response**: 200 with user details and token, 401 for invalid credentials, 500 for errors.

---

## Profile (`/api/users`)

### GET `/profile`
- **Description**: Fetches authenticated user’s profile.
- **Response**: 200 with user and profile details, 404 if not found, 500 for errors.

### PATCH `/profile`
- **Description**: Updates authenticated user’s email.
- **Validations**: `email`.
- **Response**: 200 with updated profile, 400 for duplicate email, 404 if user not found, 500 for errors.

---

## Register (`/api/auth`)

### POST `/register`
- **Description**: Registers a new user (student or faculty).
- **Validations**: `userId`, `name`, `email`, `password`, `role`, student/faculty fields.
- **Response**: 201 with token, 400 for duplicates, 403 for admin role, 500 for errors.

---

## Student Routes (`/api/student`)

### GET `/assignments`
- **Description**: Lists teaching assignments for student feedback.
- **Response**: 200 with pending assignments and rating parameters, 400/404 for invalid profile/period, 500 for errors.

### POST `/feedback`
- **Description**: Submits feedback for a teaching assignment (5 ratings).
- **Validations**: `teachingAssignment` (MongoID), `ratings` (array of 5, with `ratingParameter` and `value` 1-5).
- **Response**: 201 on success, 400 for invalid data, 500 for errors.

### GET `/submission-status`
- **Description**: Checks feedback submission status for a period.
- **Validations**: Optional `feedbackPeriod` (MongoID).
- **Response**: 200 with submission stats, 404 if no period, 500 for errors.

### GET `/faculty-ratings/:facultyId`
- **Description**: Retrieves ratings for a specific faculty.
- **Validations**: `facultyId`, optional `feedbackPeriod` (MongoID).
- **Response**: 200 with ratings, 404 if faculty/period not found, 500 for errors.

---

## Subjects (`/api/admin/subjects`)

### POST `/`
- **Description**: Creates a new subject.
- **Validations**: `subjectCode`, `subjectName`, `branch`, `semester` (1-8).
- **Response**: 201 on success, 400 for duplicates, 500 for errors.

### GET `/`
- **Description**: Lists all subjects with pagination.
- **Validations**: Optional `page`, `limit` (1-100).
- **Response**: 200 with subject list and pagination, 500 for errors.

### GET `/:id`
- **Description**: Retrieves a specific subject.
- **Validations**: `id` (MongoID).
- **Response**: 200 with subject details, 404 if not found, 500 for errors.

### PUT `/:id`
- **Description**: Updates a subject.
- **Validations**: `id` (MongoID), optional fields like `subjectCode`, `subjectName`, etc.
- **Response**: 200 with updated subject, 404 if not found, 400 for duplicates, 500 for errors.

### DELETE `/:id`
- **Description**: Deletes a subject.
- **Validations**: `id` (MongoID).
- **Response**: 200 on success, 404 if not found, 500 for errors.

---

## Teaching Assignments (`/api/admin/teaching-assignments`)

### POST `/`
- **Description**: Creates a new teaching assignment.
- **Validations**: `faculty`, `subject`, `classId`, `feedbackPeriod` (MongoID).
- **Response**: 201 on success, 400 for invalid data/duplicates, 500 for errors.

### GET `/`
- **Description**: Lists all teaching assignments with pagination.
- **Validations**: Optional `page`, `limit` (1-100).
- **Response**: 200 with assignments and pagination, 500 for errors.

### GET `/:id`
- **Description**: Retrieves a specific teaching assignment.
- **Validations**: `id` (MongoID).
- **Response**: 200 with assignment details, 404 if not found, 500 for errors.

### PUT `/:id`
- **Description**: Updates a teaching assignment.
- **Validations**: `id` (MongoID), optional `faculty`, `subject`, `classId`, `feedbackPeriod`.
- **Response**: 200 with updated assignment, 404 if not found, 400 for invalid data/duplicates, 500 for errors.

### DELETE `/:id`
- **Description**: Deletes a teaching assignment.
- **Validations**: `id` (MongoID).
- **Response**: 200 on success, 404 if not found, 500 for errors.