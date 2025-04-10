import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, getClasses, getTeachingAssignments } from '../services/api';
import '../styles/AdminDashboard.css'; // Import the CSS

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [userPage, setUserPage] = useState(1);
  const [classPage, setClassPage] = useState(1);
  const [assignmentPage, setAssignmentPage] = useState(1);
  const [totalUserPages, setTotalUserPages] = useState(1);
  const [totalClassPages, setTotalClassPages] = useState(1);
  const [totalAssignmentPages, setTotalAssignmentPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const usersData = await getUsers(token, userPage);
        console.log('Users Data:', usersData);
        setUsers(Array.isArray(usersData.users) ? usersData.users : []);
        setTotalUserPages(usersData.pagination?.totalPages || 1);

        const classesData = await getClasses(token, classPage);
        console.log('Classes Data:', classesData);
        setClasses(Array.isArray(classesData.classes) ? classesData.classes : []);
        setTotalClassPages(classesData.pagination?.totalPages || 1);

        const assignmentsData = await getTeachingAssignments(token, assignmentPage);
        console.log('Assignments Data:', assignmentsData);
        setAssignments(Array.isArray(assignmentsData.teachingAssignments) ? assignmentsData.teachingAssignments : []);
        setTotalAssignmentPages(assignmentsData.pagination?.totalPages || 1);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
        setUsers([]);
        setClasses([]);
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, userPage, classPage, assignmentPage]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handlePageChange = (type, newPage) => {
    if (type === 'users' && newPage >= 1 && newPage <= totalUserPages) {
      setUserPage(newPage);
    } else if (type === 'classes' && newPage >= 1 && newPage <= totalClassPages) {
      setClassPage(newPage);
    } else if (type === 'assignments' && newPage >= 1 && newPage <= totalAssignmentPages) {
      setAssignmentPage(newPage);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {/* Users Section */}
      <div className="section">
        <h2>Users</h2>
        {users.length === 0 ? (
          <p className="no-data">No users found</p>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.userId}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              <button
                onClick={() => handlePageChange('users', userPage - 1)}
                disabled={userPage === 1}
              >
                Previous
              </button>
              <span>Page {userPage} of {totalUserPages}</span>
              <button
                onClick={() => handlePageChange('users', userPage + 1)}
                disabled={userPage === totalUserPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Classes Section */}
      <div className="section">
        <h2>Classes</h2>
        {classes.length === 0 ? (
          <p className="no-data">No classes found</p>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Branch</th>
                  <th>Semester</th>
                  <th>Section</th>
                </tr>
              </thead>
              <tbody>
                {classes.map(cls => (
                  <tr key={cls._id}>
                    <td>{cls.name}</td>
                    <td>{cls.branch}</td>
                    <td>{cls.semester}</td>
                    <td>{cls.section}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              <button
                onClick={() => handlePageChange('classes', classPage - 1)}
                disabled={classPage === 1}
              >
                Previous
              </button>
              <span>Page {classPage} of {totalClassPages}</span>
              <button
                onClick={() => handlePageChange('classes', classPage + 1)}
                disabled={classPage === totalClassPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Teaching Assignments Section */}
      <div className="section">
        <h2>Teaching Assignments</h2>
        {assignments.length === 0 ? (
          <p className="no-data">No assignments found</p>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Subject</th>
                  <th>Class</th>
                  <th>Feedback Period</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(assignment => (
                  <tr key={assignment._id}>
                    <td>{assignment.faculty.name}</td>
                    <td>{assignment.subject.subjectName}</td>
                    <td>{assignment.class.name}</td>
                    <td>{assignment.feedbackPeriod.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              <button
                onClick={() => handlePageChange('assignments', assignmentPage - 1)}
                disabled={assignmentPage === 1}
              >
                Previous
              </button>
              <span>Page {assignmentPage} of {totalAssignmentPages}</span>
              <button
                onClick={() => handlePageChange('assignments', assignmentPage + 1)}
                disabled={assignmentPage === totalAssignmentPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;