# Backend Documentation

The backend of the Faculty Feedback System is built using **Node.js** and **Express**, with **MongoDB** as the database. It follows a modular MVC-like structure to separate concerns.

## 🏗️ Architecture

The server application is organized into the following directories:

*   **`models/`**: Mongoose schemas defining the data structure (e.g., `User.js`, `Feedback.js`).
*   **`routes/`**: Express routers handling API endpoints (e.g., `auth.js`, `student.js`).
*   **`middleware/`**: Custom middleware for authentication (`auth.js`), error handling, and request validation.
*   **`utils/`**: Helper functions for tasks like sending emails or formatting data.
*   **`config/`**: Configuration files (e.g., database connection).

## 🔒 Authentication Flow

The application uses **JWT (JSON Web Token)** for secure authentication.

1.  **Login**: User sends credentials to `/api/auth/login`.
    *   Server verifies credentials against the hashed password (using `bcrypt`).
    *   If valid, an `accessToken` is generated and sent back to the client.
    *   *(Note: Depending on implementation, tokens might be set in HttpOnly cookies or sent in the response body).*
2.  **Protected Routes**: Detailed in `middleware/auth.js`.
    *   Middleware checks for the token in the `Authorization` header (`Bearer <token>`).
    *   Decodes the token to verify validity and extract user roles.
    *   Grants access if the user's role matches the required role for the route.

## 🗄️ Database Schema

The database consists of several primary collections. Please refer to `Server Models Documentation.md` (if available) for field-level details.

*   **Users**: Stores all user accounts (Admin, Faculty, Student). Distinguished by a `role` field.
*   **Feedback**: Stores feedback submitted by students. Links `studentId` and `facultyId`.
*   **Courses/Subjects**: (If implemented) metadata for academic subjects.

## 📡 API Reference

For a complete list of API endpoints, request parameters, and responses, please refer to the detailed server documentation files located in this directory:

*   [Server Routes Documentation](Server%20Routes%20Documentation.md)
*   [Server Models Documentation](Server%20Models%20Documentation.md)
