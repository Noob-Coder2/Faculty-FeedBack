# Server Code Documentation

## Overview
This document provides an overview of the main server files, middleware, and utilities for the Faculty Feedback System backend, including their purpose, key functionalities, and configurations.

---

## Main Server File (`server.js`)

### Purpose
The `server.js` file is the entry point for the Express.js backend, responsible for setting up the server, middleware, routes, MongoDB connection, and error handling.

### Key Functionalities
- **Express Setup**:
  - Initializes Express app and sets port (default: 5001 or `process.env.PORT`).
  - Configures middleware: CORS, cookie-parser, JSON parsing (100kb limit), URL-encoded parsing.
- **CORS Configuration**:
  - Allows requests from `http://localhost:5173` (dev) or production domain.
  - Supports credentials (cookies), specific methods, and headers.
- **Middleware**:
  - Logs incoming requests with method, path, body, and query.
  - Handles JSON parsing errors and unhandled server errors, with production-safe responses.
  - Logs request headers and raw body for debugging.
- **Routes**:
  - Mounts routes for authentication (`/api/auth`), admin (`/api/admin`), student (`/api/student`), faculty (`/api/faculty`), and more.
  - Applies authentication (`auth`) and role-checking (`checkRole`) middleware where needed.
  - Includes a logout route to clear `auth_token` cookie.
- **MongoDB Connection**:
  - Connects to MongoDB Atlas using `MONGODB_URI` with error handling and reconnection logic.
  - Monitors connection events (error, disconnected, reconnected).
- **Error Handling**:
  - Handles uncaught exceptions and unhandled promise rejections with logging.
  - Implements graceful shutdown on `SIGTERM` (closes server and MongoDB connection).
- **Environment Validation**:
  - Ensures `JWT_SECRET` and `MONGODB_URI` are set, exiting if missing.
- **Root Endpoint**:
  - `GET /`: Returns "Faculty Feedback System Backend is Running!".

---

## Middleware

### `auth.js`
- **Purpose**: Authenticates requests by verifying JWT tokens.
- **Functionality**:
  - Checks for `auth_token` in cookies.
  - Verifies token using `JWT_SECRET`, attaching decoded user data (`id`, `role`) to `req.user`.
  - Returns 401 for missing or invalid tokens, clearing cookie on invalid attempts.
  - Logs authentication success or failure.

### `ratelimiter.js`
- **Purpose**: Limits login attempts to prevent brute-force attacks.
- **Functionality**:
  - Uses `express-rate-limit` to allow 3 requests per IP every 15 minutes.
  - Returns 429 with a custom message on limit exceedance.
  - Logs rate limit violations with IP and path details.
  - Includes standard rate limit headers.

### `role.js`
- **Purpose**: Restricts access based on user roles.
- **Functionality**:
  - Takes an array of allowed roles and checks if `req.user.role` matches.
  - Returns 403 if role is not allowed, otherwise proceeds.
  - Logs role check results (pass or fail).

### `validate.js`
- **Purpose**: Validates request data using `express-validator`.
- **Functionality**:
  - Checks for validation errors in `req`.
  - Returns 400 with error details if validation fails, otherwise proceeds.
  - Logs validation results (pass or fail) with request context.

---

## Utilities

### `logger.js`
- **Purpose**: Provides structured logging using Winston.
- **Functionality**:
  - Configures logging with JSON format, timestamps, and error stack traces.
  - Sets log level to `debug` (development) or `info` (production).
  - Outputs to:
    - Console (colorized, simple format).
    - Daily rotated error logs (`logs/error-YYYY-MM-DD.log`, 14-day retention).
    - Daily rotated combined logs (`logs/combined-YYYY-MM-DD.log`, 14-day retention).
  - Adds request context (userId, method, URL) to logs.
  - Provides helper methods: `errorWithContext`, `infoWithContext`, `debugWithContext`.

---

## Seed File (`seed.js`)

### Purpose
Populates the MongoDB database with initial data for testing and development.

### Key Functionalities
- **Database Connection**:
  - Connects to MongoDB using `MONGODB_URI`.
  - Closes connection after seeding.
- **Data Clearing**:
  - Deletes all non-admin data (users, profiles, classes, subjects, etc.).
- **Seeding Data**:
  - **Classes**: 8 classes (e.g., CS101, EC201) with branch, semester, year, section, and academic year.
  - **Subjects**: 16 subjects (e.g., CS101: Introduction to Programming) with code, name, branch, and semester.
  - **Feedback Periods**: 1 active period (Spring 2025, April 1-15).
  - **Rating Parameters**: 5 parameters (Punctuality, Knowledge, Engagement, Clarity, Support).
  - **Faculty**: 8 faculty users with profiles (department, designation, joining year, qualifications, subjects).
  - **Students**: 12 student users with profiles (branch, semester, section, class, admission year).
  - **Class Updates**: Assigns students to respective classes.
  - **Teaching Assignments**: 19 assignments linking faculty, subjects, classes, and feedback periods.
  - **Aggregated Ratings**: Sample ratings for selected assignments (e.g., FAC001: CS101, CS302, CS303; FAC003: ME401).
- **Error Handling**:
  - Catches and logs seeding errors, ensuring connection closure.

### Notes
- Passwords are plaintext in the seed file (`faculty123`, `student123`, `student1234`) for simplicity; in production, they should be hashed.
- Uses MongoDB ObjectIDs for relationships (e.g., `classId`, `faculty`, `subject`).
- Assigns rating parameters to all teaching assignments for consistency.

---

## Dependencies
- **Express**: Web framework.
- **Mongoose**: MongoDB ODM.
- **CORS**: Cross-origin resource sharing.
- **Cookie-Parser**: Cookie handling.
- **Dotenv**: Environment variable management.
- **Body-Parser**: Request body parsing (used implicitly via Express).
- **JSONWebToken**: JWT authentication.
- **Express-Rate-Limit**: Rate limiting.
- **Express-Validator**: Request validation.
- **Winston**: Logging.
- **Winston-Daily-Rotate-File**: Log rotation.

---

## Environment Variables
- `PORT`: Server port (default: 5001).
- `MONGODB_URI`: MongoDB Atlas connection string.
- `JWT_SECRET`: Secret for JWT signing/verification.
- `NODE_ENV`: Environment (`development` or `production`).

---

## Error Handling
- **Global Error Middleware**: Catches JSON parsing errors (400) and unhandled errors (500, production-safe).
- **MongoDB Connection**: Handles connection failures, disconnections, and reconnections with logging.
- **Process Events**: Logs uncaught exceptions and unhandled promise rejections, exiting on critical errors.
- **Graceful Shutdown**: Closes server and MongoDB connection on `SIGTERM`.

---

## Security Considerations
- **CORS**: Restricts origins and methods, allows credentials.
- **Rate Limiting**: Protects login endpoint from brute-force attacks.
- **JWT**: Secure token-based authentication with cookie storage.
- **Logging**: Sanitizes sensitive data (e.g., passwords) in logs.
- **Environment**: Validates critical variables (`JWT_SECRET`, `MONGODB_URI`).