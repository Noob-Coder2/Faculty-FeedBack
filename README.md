# Faculty Feedback System

The **Faculty Feedback System** is a web-based application designed to streamline the process of collecting, managing, and analyzing feedback from students about faculty members. It allows administrators to manage users (students, faculty, admins), and students to submit anonymous feedback.

## 🚀 Key Features

*   **Role-Based Access Control**: Secure login for Admin, Faculty, and Student roles using JWT authentication.
*   **Admin Dashboard**:
    *   Manage Students, Faculty, and Administrators (Add, Edit, Delete).
    *   Monitor feedback statistics.
*   **Student Portal**:
    *   Submit feedback for assigned faculty.
    *   View past feedback history (if enabled).
*   **Faculty Portal**:
    *   View received feedback and performance metrics.
*   **Secure Authentication**: Password encryption, secure cookies, and session management.
*   **Data Management**: Support for seeding data and managing content via a clean UI.

## 🛠️ Technology Stack

**Frontend:**
*   **React** (Vite): Fast and modular UI development.
*   **Redux Toolkit**: Manage global application state (Authentication, User Data).
*   **Material UI / Emotion**: Modern, responsive component library and styling.
*   **React Router**: Client-side routing.
*   **Axios**: HTTP client for API requests.

**Backend:**
*   **Node.js & Express**: Scalable server-side framework.
*   **MongoDB & Mongoose**: NoSQL database for flexible data modeling.
*   **JSON Web Tokens (JWT)**: Stateless authentication.
*   **Bcrypt**: Password hashing for security.

## 📂 Project Structure

*   `client/`: React frontend application.
*   `server/`: Express backend API and database models.
*   `Documentation/`: Detailed documentation for backend, frontend, and development.

## ⚡ Quick Start

### Prerequisites
*   Node.js (v18+ recommended)
*   MongoDB (cloud or local instance)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd "Faculty FeedBack"
    ```

2.  **Install dependencies:**
    ```bash
    # Install client dependencies
    cd client
    npm install

    # Install server dependencies
    cd ../server
    npm install
    ```

3.  **Environment Setup:**
    *   Create a `.env` file in the `server` directory (see [Development Guide](Documentation/Development.md) for details).
    *   Create a `.env` file in the `client` directory if needed.

4.  **Run the application:**
    ```bash
    # Start the backend (from sever directory)
    npm run dev

    # Start the frontend (from client directory)
    npm run dev
    ```

For detailed setup, testing, and deployment instructions, please refer to the [Development Guide](Documentation/Development.md).
