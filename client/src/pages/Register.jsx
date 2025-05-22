import "../styles/register.css";

import { useState } from "react";

const Register = () => {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [studentType, setStudentType] = useState("regular");
  const [course, setCourse] = useState("BSIT");
  const [section, setSection] = useState("");
  const [semester, setSemester] = useState("1st");

  const isStudent = role === "student";

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      role,
      email,
      username,
      password,
      ...(isStudent && {
        studentType,
        course,
        section,
        semester,
      }),
    };
    console.log("Registering:", data);
    // You can now send `data` to your backend
  };

  return (
    <div className="login-container">
      {/* LEFT PANEL */}
      <section className="left-side">
        <div className="branding">
          <div className="logo-container">
            <img
              src="https://scontent.fmnl17-7.fna.fbcdn.net/v/t39.30808-6/313439300_6561901387158129_8127585076437435119_n.jpg"
              alt="Logo"
              className="logo"
            />
          </div>
          <h1 className="school-name">GCST - ICT</h1>
        </div>
        <div className="welcome-info">
          <h2 className="welcome-title">
            WELCOME BACK
            <br />
            COLLEGE OF
            <br />
            INFORMATICS
          </h2>
          <p className="info-text">
            To use this app please login with your personal info.
          </p>
        </div>
      </section>

      {/* RIGHT PANEL */}
      <section className="right-side">
        <form className="register-form" onSubmit={handleSubmit}>
          <h2 className="form-title">GRANBY COLLEGES SCHEDULER</h2>

          {/* Username */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="student">Student</option>
              <option value="professor">Professor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Student-Specific Fields */}
          {isStudent && (
            <>
              <div className="form-group">
                <label htmlFor="studentType">Student Type</label>
                <select
                  id="studentType"
                  value={studentType}
                  onChange={(e) => setStudentType(e.target.value)}
                  required
                >
                  <option value="regular">Regular</option>
                  <option value="irregular">Irregular</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="course">Course</label>
                <select
                  id="course"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  required
                >
                  <option value="BSIT">BSIT</option>
                  <option value="BSCS">BSCS</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="section">Section</label>
                <input
                  type="text"
                  id="section"
                  placeholder="e.g., 2A"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="semester">Semester</label>
                <select
                  id="semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  required
                >
                  <option value="1st">1st</option>
                  <option value="2nd">2nd</option>
                </select>
              </div>
            </>
          )}

          {/* Submit */}
          <div className="form-group">
            <button type="submit" className="submit-btn">
              Register
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Register;
