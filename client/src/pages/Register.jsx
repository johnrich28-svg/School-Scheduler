import "../styles/register.css";

const Register = () => {
  return (
    <div>
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
        <form className="login-form">
          <h2 className="form-title">GRANBY COLLEGES SCHEDULER</h2>
        </form>
      </section>
    </div>
  );
};

export default Register;
