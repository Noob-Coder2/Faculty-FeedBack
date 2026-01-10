# Development Guide

This guide provides instructions for setting up the Faculty Feedback System locally for development and testing.

## ✅ Prerequisites

Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [MongoDB](https://www.mongodb.com/) (Local instance or Atlas URI)
*   [Git](https://git-scm.com/)

## ⚙️ Environment Setup

### Server Configuration
Create a `.env` file in the `server/` directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/university_feedback
JWT_SECRET=your_super_secret_key_change_this
NODE_ENV=development
```

*(Note: Adjust `MONGO_URI` if you are using a cloud database).*

### Client Configuration
Create a `.env` file in the `client/` directory (if needed). React apps created with Vite use `VITE_` prefix.

```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Installation & Running Locally

1.  **Clone the Repository**
    ```bash
    git clone <repository_url>
    cd "Faculty FeedBack"
    ```

2.  **Install Dependencies**
    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

3.  **Start the Development Servers**

    *   **Backend**: Open a terminal in `server/` and run:
        ```bash
        npm run dev
        ```
        (This runs the server with `nodemon` for hot-reloading).

    *   **Frontend**: Open a new terminal in `client/` and run:
        ```bash
        npm run dev
        ```
        Access the app at `http://localhost:5173` (or the port shown in terminal).

## 🌱 Seeding Data

To populate the database with initial test data (Admin user, Sample Faculty, etc.):

1.  Ensure MongoDB is running.
2.  Navigate to the `server/` directory.
3.  Run the seed script:
    ```bash
    node seed.js
    ```
    *Check the console output for the default Admin credentials (usually `admin@example.com` / `password123` or similar).*

## 🧪 Running Tests

(If tests are implemented)
*   **Server**: `npm test` inside `server/` directory.
*   **Client**: `npm test` inside `client/` directory.
