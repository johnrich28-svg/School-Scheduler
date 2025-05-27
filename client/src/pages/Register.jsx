import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/register.css";

const Register = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedRole, setSelectedRole] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    semester: "",
    courseId: "",
    yearLevel: "",
    sectionId: "",
    studentType: "",
    preferredSubjects: [], // array of subject IDs
  });

  // For the single subject selected before clicking "+"
  const [selectedPreferredSubject, setSelectedPreferredSubject] = useState("");

  // Fetch courses, sections, year levels on mount
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [courseRes, sectionRes, yearRes] = await Promise.all([
          axios.get("http://localhost:5000/api/public/courses/get-courses"),
          axios.get("http://localhost:5000/api/public/sections/get-sections"),
          axios.get("http://localhost:5000/api/public/year-level/get-year"),
        ]);
        setCourses(courseRes.data);
        setSections(sectionRes.data);
        setYearLevels(yearRes.data);
      } catch (err) {
        console.error("Error fetching form data:", err);
      }
    };
    fetchAll();
  }, []);

  // Fetch subjects for professors
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/public/subjects/get-subjects"
        );
        setSubjects(res.data);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };
    fetchSubjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "role") {
      setSelectedRole(value);
      // Reset preferredSubjects and selectedPreferredSubject if role changes
      if (value !== "professor") {
        setFormData((prev) => ({
          ...prev,
          preferredSubjects: [],
        }));
        setSelectedPreferredSubject("");
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add selected subject from dropdown to preferredSubjects list
  const addPreferredSubject = () => {
    if (
      selectedPreferredSubject &&
      !formData.preferredSubjects.includes(selectedPreferredSubject)
    ) {
      setFormData((prev) => ({
        ...prev,
        preferredSubjects: [
          ...prev.preferredSubjects,
          selectedPreferredSubject,
        ],
      }));
      setSelectedPreferredSubject(""); // clear selection
    }
  };

  // Remove a subject from preferredSubjects list
  const removePreferredSubject = (subjectId) => {
    setFormData((prev) => ({
      ...prev,
      preferredSubjects: prev.preferredSubjects.filter(
        (id) => id !== subjectId
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    if (formData.role === "student") {
      payload = {
        ...payload,
        semester: formData.semester,
        courseId: formData.courseId,
        yearLevel: formData.yearLevel,
        sectionId: formData.sectionId,
        studentType: formData.studentType,
      };
    } else if (formData.role === "professor") {
      payload = {
        ...payload,
        preferredSubjects: formData.preferredSubjects,
      };
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        payload
      );

      if (response.status === 201 || response.status === 200) {
        alert("Account created! Waiting for admin approval.");
        navigate("/login");
      } else {
        alert("Failed to register. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert("Failed to register. Please try again.");
      }
    }
  };

  return (
    <div className="register-container">
      {/* LEFT PANEL */}
      <section className="register-left">
        <header className="register-branding">
          <figure className="register-logo-container">
            <img
              src="https://scontent.fmnl17-7.fna.fbcdn.net/..." // your logo URL
              alt="GCST ICT Logo"
              className="register-logo"
            />
          </figure>
          <h1 className="register-school-name">GCST - ICT</h1>
        </header>
        <article className="register-welcome-info">
          <h2 className="register-welcome-title">
            JOIN US AT
            <br />
            GCST COLLEGE OF
            <br />
            INFORMATICS
          </h2>
          <p className="register-info-text">
            To create an account, please fill in your personal details.
          </p>
        </article>
      </section>

      {/* RIGHT PANEL */}
      <section className="right-panel">
        <h1>GRANBY COLLEGES SCHEDULER</h1>
        <form className="register-form" onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label>Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Role --</option>
            <option value="admin">Admin</option>
            <option value="student">Student</option>
            <option value="professor">Professor</option>
          </select>

          {selectedRole === "student" && (
            <>
              <label>Semester</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Semester --</option>
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
              </select>

              <label>Course</label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Course --</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.course}
                  </option>
                ))}
              </select>

              <label>Year Level</label>
              <select
                name="yearLevel"
                value={formData.yearLevel}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Year Level --</option>
                {yearLevels.map((y, idx) => (
                  <option key={idx} value={y.name}>
                    {y.name}
                  </option>
                ))}
              </select>

              <label>Section</label>
              <select
                name="sectionId"
                value={formData.sectionId}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Section --</option>
                {sections.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <label>Student Type</label>
              <select
                name="studentType"
                value={formData.studentType}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Type --</option>
                <option value="regular">Regular</option>
                <option value="irregular">Irregular</option>
              </select>
            </>
          )}

          {selectedRole === "professor" && (
            <>
              <label>Preferred Subjects</label>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <select
                  name="preferredSubjects"
                  value={selectedPreferredSubject}
                  onChange={(e) => setSelectedPreferredSubject(e.target.value)}
                >
                  <option value="">-- Select Subject --</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.subjectName}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addPreferredSubject}
                  style={{
                    padding: "4px 12px",
                    fontWeight: "bold",
                    fontSize: "18px",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  aria-label="Add subject"
                  disabled={!selectedPreferredSubject}
                >
                  +
                </button>
              </div>

              {/* List of preferred subjects added */}
              {formData.preferredSubjects.length > 0 && (
                <ul
                  style={{
                    listStyleType: "none",
                    paddingLeft: 0,
                    marginTop: "8px",
                  }}
                >
                  {formData.preferredSubjects.map((subjectId) => {
                    const subject = subjects.find((s) => s._id === subjectId);
                    return (
                      <li
                        key={subjectId}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "4px",
                          background: "#eee",
                          padding: "4px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        <span>{subject ? subject.subjectName : subjectId}</span>
                        <button
                          type="button"
                          onClick={() => removePreferredSubject(subjectId)}
                          style={{
                            color: "red",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "16px",
                          }}
                          aria-label={`Remove ${
                            subject ? subject.subjectName : ""
                          }`}
                        >
                          &times;
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}

          <button type="submit" className="submit-btn">
            Register
          </button>
        </form>
      </section>
    </div>
  );
};

export default Register;
