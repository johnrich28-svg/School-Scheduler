import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/admin.css';

const API_BASE_URL = 'http://localhost:5000';

const Admin = () => {
  // State for different sections
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [years, setYears] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Form states with validation
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'professor'
  });
  const [userErrors, setUserErrors] = useState({});

  const [newYear, setNewYear] = useState({ name: '' });
  const [yearErrors, setYearErrors] = useState({});

  const [newSection, setNewSection] = useState({
    name: '',
    courseId: '',
    yearId: '',
    capacity: 40
  });
  const [sectionErrors, setSectionErrors] = useState({});

  const [newSubject, setNewSubject] = useState({
    subjectCode: '',
    subjectName: '',
    courseId: '',
    yearLevelId: '',
    units: 3
  });
  const [subjectErrors, setSubjectErrors] = useState({});

  const [newRoom, setNewRoom] = useState({ room: '' });
  const [roomErrors, setRoomErrors] = useState({});

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('No authentication token found. Please log in again.');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch courses for dropdowns
        const coursesRes = await axios.get(`${API_BASE_URL}/api/public/courses/get-courses`, { headers });
        setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);

        switch (activeTab) {
          case 'users':
            const usersRes = await axios.get(`${API_BASE_URL}/api/auth/admin/get-users`, { headers });
            setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
            break;
          case 'years':
            const yearsRes = await axios.get(`${API_BASE_URL}/api/admin/years/get-year`, { headers });
            setYears(Array.isArray(yearsRes.data) ? yearsRes.data : []);
            break;
          case 'sections':
            const sectionsRes = await axios.get(`${API_BASE_URL}/api/admin/sections/get-section`, { headers });
            setSections(Array.isArray(sectionsRes.data) ? sectionsRes.data : []);
            break;
          case 'subjects':
            const subjectsRes = await axios.get(`${API_BASE_URL}/api/admin/subjects/get-subject`, { headers });
            setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
            break;
          case 'rooms':
            const roomsRes = await axios.post(`${API_BASE_URL}/api/admin/rooms/get-room`, {}, { headers });
            setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
            break;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response) {
          setError(`Failed to fetch data: ${error.response.data.message || 'Please try again.'}`);
        } else {
          setError('An error occurred. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Validation functions
  const validateUser = () => {
    const errors = {};
    if (!newUser.username) errors.username = 'Username is required';
    if (!newUser.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(newUser.email)) errors.email = 'Email is invalid';
    if (!newUser.password) errors.password = 'Password is required';
    else if (newUser.password.length < 6) errors.password = 'Password must be at least 6 characters';
    setUserErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateYear = () => {
    const errors = {};
    if (!newYear.name) errors.name = 'Year level is required';
    else if (!['1st', '2nd', '3rd', '4th'].includes(newYear.name)) {
      errors.name = 'Year level must be 1st, 2nd, 3rd, or 4th';
    }
    setYearErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSection = () => {
    const errors = {};
    if (!newSection.name) errors.name = 'Section name is required';
    if (!newSection.courseId) errors.courseId = 'Course is required';
    if (!newSection.yearId) errors.yearId = 'Year level is required';
    if (newSection.capacity < 1 || newSection.capacity > 40) {
      errors.capacity = 'Capacity must be between 1 and 40';
    }
    setSectionErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSubject = () => {
    const errors = {};
    if (!newSubject.subjectCode) errors.subjectCode = 'Subject code is required';
    if (!newSubject.subjectName) errors.subjectName = 'Subject name is required';
    if (!newSubject.courseId) errors.courseId = 'Course is required';
    if (!newSubject.yearLevelId) errors.yearLevelId = 'Year level is required';
    if (!newSubject.units || newSubject.units < 1) errors.units = 'Units must be at least 1';
    setSubjectErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRoom = () => {
    const errors = {};
    if (!newRoom.room) errors.room = 'Room name is required';
    setRoomErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submissions
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!validateUser()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await axios.post(`${API_BASE_URL}/api/auth/admin/create-user`, newUser, { headers });
      setNewUser({ username: '', email: '', password: '', role: 'professor' });
      setSuccess('User created successfully');
      
      // Refresh users list
      const usersRes = await axios.get(`${API_BASE_URL}/api/auth/admin/get-users`, { headers });
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response) {
        setError(`Failed to create user: ${error.response.data.message || 'Please try again.'}`);
      } else {
        setError('Failed to create user. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleYearSubmit = async (e) => {
    e.preventDefault();
    if (!validateYear()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await axios.post(`${API_BASE_URL}/api/admin/years/create-year`, newYear, { headers });
      setNewYear({ name: '' });
      setSuccess('Year level created successfully');
      
      // Refresh years list
      const yearsRes = await axios.get(`${API_BASE_URL}/api/admin/years/get-year`, { headers });
      setYears(Array.isArray(yearsRes.data) ? yearsRes.data : []);
    } catch (error) {
      console.error('Error creating year:', error);
      if (error.response) {
        setError(`Failed to create year: ${error.response.data.message || 'Please try again.'}`);
      } else {
        setError('Failed to create year. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    if (!validateSection()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await axios.post(`${API_BASE_URL}/api/admin/sections/create-section`, newSection, { headers });
      setNewSection({ name: '', courseId: '', yearId: '', capacity: 40 });
      setSuccess('Section created successfully');
      
      // Refresh sections list
      const sectionsRes = await axios.get(`${API_BASE_URL}/api/admin/sections/get-section`, { headers });
      setSections(Array.isArray(sectionsRes.data) ? sectionsRes.data : []);
    } catch (error) {
      console.error('Error creating section:', error);
      if (error.response) {
        setError(`Failed to create section: ${error.response.data.message || 'Please try again.'}`);
      } else {
        setError('Failed to create section. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!validateSubject()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await axios.post(`${API_BASE_URL}/api/admin/subjects/create-subject`, newSubject, { headers });
      setNewSubject({ subjectCode: '', subjectName: '', courseId: '', yearLevelId: '', units: 3 });
      setSuccess('Subject created successfully');
      
      // Refresh subjects list
      const subjectsRes = await axios.get(`${API_BASE_URL}/api/admin/subjects/get-subject`, { headers });
      setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
    } catch (error) {
      console.error('Error creating subject:', error);
      if (error.response) {
        setError(`Failed to create subject: ${error.response.data.message || 'Please try again.'}`);
      } else {
        setError('Failed to create subject. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    if (!validateRoom()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await axios.post(`${API_BASE_URL}/api/admin/rooms/create-room`, newRoom, { headers });
      setNewRoom({ room: '' });
      setSuccess('Room created successfully');
      
      // Refresh rooms list
      const roomsRes = await axios.post(`${API_BASE_URL}/api/admin/rooms/get-room`, {}, { headers });
      setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
    } catch (error) {
      console.error('Error creating room:', error);
      if (error.response) {
        setError(`Failed to create room: ${error.response.data.message || 'Please try again.'}`);
      } else {
        setError('Failed to create room. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="admin-container">
      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          {['users', 'years', 'sections', 'subjects', 'rooms'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="admin-content-area">
          {loading && (
            <div className="loading-spinner">
              Loading...
            </div>
          )}

          {/* Users Section */}
          {activeTab === 'users' && (
            <div>
              <h2 className="section-header">User Management</h2>
              <form onSubmit={handleUserSubmit} className="admin-form">
                <div className="form-grid form-grid-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      className={`form-input ${userErrors.username ? 'error' : ''}`}
                    />
                    {userErrors.username && <span className="error-text">{userErrors.username}</span>}
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className={`form-input ${userErrors.email ? 'error' : ''}`}
                    />
                    {userErrors.email && <span className="error-text">{userErrors.email}</span>}
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className={`form-input ${userErrors.password ? 'error' : ''}`}
                    />
                    {userErrors.password && <span className="error-text">{userErrors.password}</span>}
                  </div>
                </div>
                <div className="form-grid">
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="form-select"
                  >
                    <option value="professor">Professor</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                  Add User
                </button>
              </form>
              <div className="data-grid">
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <div key={user._id} className="data-card">
                      <h3 className="data-title">{user.username}</h3>
                      <p className="data-subtitle">{user.email}</p>
                      <p className="data-subtitle">Role: {user.role}</p>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No users found</p>
                )}
              </div>
            </div>
          )}

          {/* Years Section */}
          {activeTab === 'years' && (
            <div>
              <h2 className="section-header">Year Level Management</h2>
              <form onSubmit={handleYearSubmit} className="admin-form">
                <div className="form-grid">
                  <div>
                    <select
                      value={newYear.name}
                      onChange={(e) => setNewYear({ name: e.target.value })}
                      className={`form-select ${yearErrors.name ? 'error' : ''}`}
                    >
                      <option value="">Select Year Level</option>
                      <option value="1st">1st Year</option>
                      <option value="2nd">2nd Year</option>
                      <option value="3rd">3rd Year</option>
                      <option value="4th">4th Year</option>
                    </select>
                    {yearErrors.name && <span className="error-text">{yearErrors.name}</span>}
                  </div>
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                  Add Year Level
                </button>
              </form>
              <div className="data-grid">
                {years && years.length > 0 ? (
                  years.map((year) => (
                    <div key={year._id} className="data-card">
                      <h3 className="data-title">{year.name}</h3>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No years found</p>
                )}
              </div>
            </div>
          )}

          {/* Sections Section */}
          {activeTab === 'sections' && (
            <div>
              <h2 className="section-header">Section Management</h2>
              <form onSubmit={handleSectionSubmit} className="admin-form">
                <div className="form-grid form-grid-2">
                  <div>
                    <input
                      type="text"
                      placeholder="Section Name (e.g., BSIT-1A)"
                      value={newSection.name}
                      onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                      className={`form-input ${sectionErrors.name ? 'error' : ''}`}
                    />
                    {sectionErrors.name && <span className="error-text">{sectionErrors.name}</span>}
                  </div>
                  <div>
                    <select
                      value={newSection.courseId}
                      onChange={(e) => setNewSection({ ...newSection, courseId: e.target.value })}
                      className={`form-select ${sectionErrors.courseId ? 'error' : ''}`}
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.course}
                        </option>
                      ))}
                    </select>
                    {sectionErrors.courseId && <span className="error-text">{sectionErrors.courseId}</span>}
                  </div>
                  <div>
                    <select
                      value={newSection.yearId}
                      onChange={(e) => setNewSection({ ...newSection, yearId: e.target.value })}
                      className={`form-select ${sectionErrors.yearId ? 'error' : ''}`}
                    >
                      <option value="">Select Year Level</option>
                      {years.map((year) => (
                        <option key={year._id} value={year._id}>
                          {year.name}
                        </option>
                      ))}
                    </select>
                    {sectionErrors.yearId && <span className="error-text">{sectionErrors.yearId}</span>}
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Capacity (max 40)"
                      value={newSection.capacity}
                      onChange={(e) => setNewSection({ ...newSection, capacity: parseInt(e.target.value) })}
                      min="1"
                      max="40"
                      className={`form-input ${sectionErrors.capacity ? 'error' : ''}`}
                    />
                    {sectionErrors.capacity && <span className="error-text">{sectionErrors.capacity}</span>}
                  </div>
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                  Add Section
                </button>
              </form>
              <div className="data-grid">
                {sections && sections.length > 0 ? (
                  sections.map((section) => (
                    <div key={section._id} className="data-card">
                      <h3 className="data-title">{section.name}</h3>
                      <p className="data-subtitle">
                        Course: {courses.find(c => c._id === section.courseId)?.course}
                      </p>
                      <p className="data-subtitle">
                        Year Level: {years.find(y => y._id === section.yearId)?.name}
                      </p>
                      <p className="data-subtitle">Capacity: {section.capacity}</p>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No sections found</p>
                )}
              </div>
            </div>
          )}

          {/* Subjects Section */}
          {activeTab === 'subjects' && (
            <div>
              <h2 className="section-header">Subject Management</h2>
              <form onSubmit={handleSubjectSubmit} className="admin-form">
                <div className="form-grid form-grid-2">
                  <div>
                    <input
                      type="text"
                      placeholder="Subject Code"
                      value={newSubject.subjectCode}
                      onChange={(e) => setNewSubject({ ...newSubject, subjectCode: e.target.value })}
                      className={`form-input ${subjectErrors.subjectCode ? 'error' : ''}`}
                    />
                    {subjectErrors.subjectCode && <span className="error-text">{subjectErrors.subjectCode}</span>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Subject Name"
                      value={newSubject.subjectName}
                      onChange={(e) => setNewSubject({ ...newSubject, subjectName: e.target.value })}
                      className={`form-input ${subjectErrors.subjectName ? 'error' : ''}`}
                    />
                    {subjectErrors.subjectName && <span className="error-text">{subjectErrors.subjectName}</span>}
                  </div>
                  <div>
                    <select
                      value={newSubject.courseId}
                      onChange={(e) => setNewSubject({ ...newSubject, courseId: e.target.value })}
                      className={`form-select ${subjectErrors.courseId ? 'error' : ''}`}
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.course}
                        </option>
                      ))}
                    </select>
                    {subjectErrors.courseId && <span className="error-text">{subjectErrors.courseId}</span>}
                  </div>
                  <div>
                    <select
                      value={newSubject.yearLevelId}
                      onChange={(e) => setNewSubject({ ...newSubject, yearLevelId: e.target.value })}
                      className={`form-select ${subjectErrors.yearLevelId ? 'error' : ''}`}
                    >
                      <option value="">Select Year Level</option>
                      {years.map((year) => (
                        <option key={year._id} value={year._id}>
                          {year.name}
                        </option>
                      ))}
                    </select>
                    {subjectErrors.yearLevelId && <span className="error-text">{subjectErrors.yearLevelId}</span>}
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Units"
                      value={newSubject.units}
                      onChange={(e) => setNewSubject({ ...newSubject, units: parseInt(e.target.value) })}
                      min="1"
                      className={`form-input ${subjectErrors.units ? 'error' : ''}`}
                    />
                    {subjectErrors.units && <span className="error-text">{subjectErrors.units}</span>}
                  </div>
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                  Add Subject
                </button>
              </form>
              <div className="data-grid">
                {subjects && subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <div key={subject._id} className="data-card">
                      <h3 className="data-title">{subject.subjectName}</h3>
                      <p className="data-subtitle">Code: {subject.subjectCode}</p>
                      <p className="data-subtitle">
                        Course: {courses.find(c => c._id === subject.courseId)?.course}
                      </p>
                      <p className="data-subtitle">
                        Year Level: {years.find(y => y._id === subject.yearLevelId)?.name}
                      </p>
                      <p className="data-subtitle">Units: {subject.units}</p>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No subjects found</p>
                )}
              </div>
            </div>
          )}

          {/* Rooms Section */}
          {activeTab === 'rooms' && (
            <div>
              <h2 className="section-header">Room Management</h2>
              <form onSubmit={handleRoomSubmit} className="admin-form">
                <div className="form-grid">
                  <div>
                    <input
                      type="text"
                      placeholder="Room Name"
                      value={newRoom.room}
                      onChange={(e) => setNewRoom({ room: e.target.value })}
                      className={`form-input ${roomErrors.room ? 'error' : ''}`}
                    />
                    {roomErrors.room && <span className="error-text">{roomErrors.room}</span>}
                  </div>
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                  Add Room
                </button>
              </form>
              <div className="data-grid">
                {rooms && rooms.length > 0 ? (
                  rooms.map((room) => (
                    <div key={room._id} className="data-card">
                      <h3 className="data-title">{room.room}</h3>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No rooms found</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
