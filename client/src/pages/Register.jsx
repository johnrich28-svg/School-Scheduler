import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/register.css";

const Register = () => {
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);

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

  // Fetch subjects separately
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

  return (
    <div className="register-container">
      {/* LEFT PANEL */}
      <section className="register-left" aria-label="Welcome Panel">
        <header className="register-branding">
          <figure className="register-logo-container">
            <img
              src="https://scontent.fmnl17-7.fna.fbcdn.net/..."
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
        <form className="register-form">
          <label htmlFor="uname">Username</label>
          <input type="text" id="uname" name="uname" />

          <label htmlFor="email">Email</label>
          <input type="text" id="email" name="email" />

          <label htmlFor="pword">Password</label>
          <input type="password" id="pword" name="pword" />

          <label htmlFor="role">Role</label>
          <select id="role" name="role">
            <option value="">-- Select Role --</option>
            <option value="admin">Admin</option>
            <option value="student">Student</option>
            <option value="professor">Professor</option>
          </select>

          <label htmlFor="semester">Semester</label>
          <select id="semester" name="semester">
            <option value="">-- Select Semester --</option>
            <option value="1st">1st</option>
            <option value="2nd">2nd</option>
          </select>

          <label htmlFor="course">Course</label>
          <select id="course" name="course">
            <option value="">-- Select Course --</option>
            {courses.map((course) => (
              <option key={course._id} value={course.course}>
                {course.course}
              </option>
            ))}
          </select>

          <label htmlFor="yearLevel">Year Level</label>
          <select id="yearLevel" name="yearLevel">
            <option value="">-- Select Year Level --</option>
            {yearLevels.map((year, idx) => (
              <option key={idx} value={year.name}>
                {year.name}
              </option>
            ))}
          </select>

          <label htmlFor="section">Section</label>
          <select id="section" name="section">
            <option value="">-- Select Section --</option>
            {sections.map((section) => (
              <option key={section._id} value={section.name}>
                {section.name}
              </option>
            ))}
          </select>

          <label htmlFor="student-type">Student Type</label>
          <select id="student-type" name="studentType">
            <option value="">-- Select Type --</option>
            <option value="regular">Regular</option>
            <option value="irregular">Irregular</option>
          </select>

          <label htmlFor="preferred-subjects">Preferred Subjects</label>
          <select id="preferred-subjects" name="preferredSubjects">
            <option value="">-- Select Subject --</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject.subjectName}>
                {subject.subjectName}
              </option>
            ))}
          </select>
        </form>
      </section>
    </div>
  );
};

export default Register;
