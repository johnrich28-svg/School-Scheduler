import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

// Helper to decode base64 URL-safe strings
const base64UrlDecode = (str) => {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = str.length % 4;
  if (pad) {
    str += "=".repeat(4 - pad);
  }
  return atob(str);
};

// Decode JWT token payload
const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(base64UrlDecode(payload));
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      console.log("Response data:", response.data);

      const token = response.data.token;
      if (!token) {
        setError("No token received from server.");
        return;
      }

      const decoded = decodeToken(token);
      console.log("Decoded token:", decoded);

      if (decoded && decoded.role) {
        localStorage.setItem("authToken", token);
        setSuccess(true);
        if (decoded.role.toLowerCase() === "superadmin") {
          navigate("/superadmin");
        } else if (decoded.role.toLowerCase() === "admin") {
          navigate("/admin");
        } else {
          setError("You are not authorized as an Admin or SuperAdmin.");
        }
      } else {
        setError("Invalid token received.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
    <main className="login-container">
      {/* LEFT PANEL */}
      <section className="left-side" aria-label="Welcome Panel">
        <header className="branding">
          <figure className="logo-container">
            <img
              src="https://scontent.fmnl4-7.fna.fbcdn.net/v/t39.30808-6/313439300_6561901387158129_8127585076437435119_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeF-IRJnMGaXlntr5UTOMLmxtVjfDB530sq1WN8MHnfSyoQMJHgjGqZZlUfPVWn6R9NSazipyhQ9rtckYfYJyquH&_nc_ohc=UtYW2OYSeEoQ7kNvwEd4VHJ&_nc_oc=Adn6KFtuwARR4viS-kphMjwbOzmM80OP6qSkFLRuT41oxjH6e5JQyqDV326HWokMVZKYG9E1lYLeYf2VwtSNpW39&_nc_zt=23&_nc_ht=scontent.fmnl4-7.fna&_nc_gid=EtQ2T5XA-Wd2CjKhArnhMA&oh=00_AfKUo2L-vNoM2KxPSRxBY9Z4REKlGyKqIfrMWuR80eIfrw&oe=6837694A"
              alt="GCST ICT Logo"
              className="logo"
            />
          </figure>
          <h1 className="school-name">GCST - ICT</h1>
        </header>

        <article className="welcome-info">
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
        </article>
      </section>

      {/* RIGHT PANEL */}
      <section className="right-side" aria-label="Login Form Panel">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2 className="form-title">GRANBY COLLEGES SCHEDULER</h2>

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">Logged in successfully!</p>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button">
            LOG IN
          </button>

          <hr />

          <nav className="signup-redirect">
            <p>
              Not registered? <a href="register">Create an account</a>
            </p>
          </nav>
        </form>
      </section>
    </main>
  );
};

export default Login;
