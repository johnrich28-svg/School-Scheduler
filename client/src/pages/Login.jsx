import { useState } from "react";
import axios from "axios";
import "../styles/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      const token = response.data.token;
      localStorage.setItem("authToken", token);
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="login-container">
      {/* LEFT PANEL */}
      <section className="left-side">
        <div className="branding">
          <div className="logo-container">
            <img
              src="https://scontent.fmnl17-7.fna.fbcdn.net/v/t39.30808-6/313439300_6561901387158129_8127585076437435119_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeF-IRJnMGaXlntr5UTOMLmxtVjfDB530sq1WN8MHnfSyoQMJHgjGqZZlUfPVWn6R9NSazipyhQ9rtckYfYJyquH&_nc_ohc=Yq5y6kvA-yoQ7kNvwGOI43-&_nc_oc=Adl0w58UzTZtVLY9YoRKDft0jQmm07hnSn1O4ZcMarAoPcCuk53wdWnFZor9BUVSXL4&_nc_zt=23&_nc_ht=scontent.fmnl17-7.fna&_nc_gid=ZcpDbtluMiJ7oZVMvcxSpA&oh=00_AfLPcHDrnhDFIdLOqVHUv28uthVJaAx93FnfB_eyFVqKkQ&oe=6830D1CA"
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
        <form className="login-form" onSubmit={handleSubmit}>
          <h2 className="form-title">GRANBY COLLEGES SCHEDULER</h2>

          {error && (
            <p
              style={{
                color: "red",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

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

          {success && (
            <p
              style={{ color: "green", marginTop: "1rem", textAlign: "center" }}
            >
              Logged in successfully!
            </p>
          )}

          <div className="alternative-login">
            <p>or you can sign up using</p>
            <div className="social-icons">
              {/* Facebook SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="#1877F2"
                aria-label="Facebook"
                role="img"
              >
                <path d="M22.675 0h-21.35C.59 0 0 .59 0 1.325v21.351C0 23.41.59 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.894-4.788 4.66-4.788 1.325 0 2.466.099 2.798.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.312h3.59l-.467 3.622h-3.123V24h6.116c.735 0 1.324-.59 1.324-1.324V1.325C24 .59 23.41 0 22.675 0z" />
              </svg>

              {/* Google "G" SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 48 48"
                aria-label="Google"
                role="img"
              >
                <path
                  fill="#4285F4"
                  d="M24 9.5c3.54 0 6.68 1.22 9.13 3.23l6.84-6.83C34.67 2.67 29.74 0 24 0 14.62 0 6.62 6.04 3.31 14.68l7.94 6.17C12.67 14.45 17.84 9.5 24 9.5z"
                />
                <path
                  fill="#34A853"
                  d="M46.5 24c0-1.68-.15-3.3-.43-4.86H24v9.19h12.66c-.54 3-2.7 5.56-5.75 6.49l8.79 6.8C43.53 37.73 46.5 31.45 46.5 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.98 28.85A14.52 14.52 0 0110.35 24c0-1.57.3-3.07.83-4.47l-7.94-6.17A24.005 24.005 0 000 24c0 3.78 1.04 7.29 2.86 10.33l8.12-5.48z"
                />
                <path
                  fill="#EA4335"
                  d="M24 48c6.48 0 11.92-2.15 15.89-5.83l-7.57-5.85c-2.16 1.45-4.93 2.31-8.32 2.31-6.17 0-11.35-4.05-13.2-9.51l-8.12 5.48C6.6 42.83 14.62 48 24 48z"
                />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
            </div>
          </div>

          <hr />

          <div className="signup-redirect">
            <p>Not registered?</p>
            <a href="register">Create an account</a>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Login;
