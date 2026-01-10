# Frontend Documentation

The frontend of the Faculty Feedback System is a Single Page Application (SPA) built with **React** and **Vite**. It uses **Redux Toolkit** for state management and **Material UI** for styling.

## 🏗️ Architecture

The `client` directory is structured as follows:

*   **`src/components/`**: Reusable UI components (e.g., `Navbar`, `Footer`, `AuthForm`).
*   **`src/pages/`**: Page-level components corresponding to routes (e.g., `LoginPage`, `AdminDashboard`, `StudentPortal`).
*   **`src/store/`**: Redux store configuration and slices (`authSlice`, `userSlice`).
*   **`src/services/`**: API service modules for making HTTP requests (`authService.js`, `apiUtils.js`).
*   **`src/utils/`**: Utility functions and constants.

## 🧩 Key Components

### Authentication
*   **`LoginPage.jsx`**: Handles user login. Dispatches the `login` action to the Redux store.
*   **`ProtectedRoute.jsx`**: A wrapper component that checks if a user is authenticated and has the correct role before rendering the child component. Redirects to `/login` if unauthorized.

### Dashboards
*   **`AdminDashboard.jsx`**: The main hub for administrators to manage users and view stats.
*   **`StudentPortal.jsx`**: Allows students to select faculty and submit feedback forms.

## 📦 State Management (Redux)

The global state is managed using Redux Toolkit.

*   **`authSlice`**:
    *   `user`: Stores current user info (id, name, role).
    *   `token`: Stores the JWT access token.
    *   `isAuthenticated`: Boolean flag.
    *   **Actions**: `login`, `logout`.
*   **`feedbackSlice`** (if applicable): Manages the state of feedback forms and submissions.

## 🛣️ Routing

Client-side routing is handled by `react-router-dom`. The main routes are defined in `App.jsx`.

| Path | Component | Access |
| :--- | :--- | :--- |
| `/login` | `LoginPage` | Public |
| `/admin/*` | `AdminDashboard` | Admin Role |
| `/student/*` | `StudentPortal` | Student Role |
| `/faculty/*` | `FacultyDashboard` | Faculty Role |
| `/` | Redirects to Dashboard based on Role | Authenticated |

## 🎨 Styling

The application uses **Material UI** for pre-built components and **Emotion** for custom styling.
*   Global styles are defined in `index.css`.
*   Theme customization (colors, typography) can be found in `src/theme.js` (if created).
