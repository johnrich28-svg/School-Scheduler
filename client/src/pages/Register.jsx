import "../styles/register.css";

const Register = () => {
  return (
    <div className="register-container">
      {/* LEFT PANEL */}
      <section className="register-left" aria-label="Welcome Panel">
        <header className="register-branding">
          <figure className="register-logo-container">
            <img
              src="https://scontent.fmnl17-7.fna.fbcdn.net/v/t39.30808-6/313439300_6561901387158129_8127585076437435119_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeF-IRJnMGaXlntr5UTOMLmxtVjfDB530sq1WN8MHnfSyoQMJHgjGqZZlUfPVWn6R9NSazipyhQ9rtckYfYJyquH&_nc_ohc=Yq5y6kvA-yoQ7kNvwGOI43-&_nc_oc=Adl0w58UzTZtVLY9YoRKDft0jQmm07hnSn1O4ZcMarAoPcCuk53wdWnFZor9BUVSXL4&_nc_zt=23&_nc_ht=scontent.fmnl17-7.fna&_nc_gid=ZcpDbtluMiJ7oZVMvcxSpA&oh=00_AfLPcHDrnhDFIdLOqVHUv28uthVJaAx93FnfB_eyFVqKkQ&oe=6830D1CA"
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
    </div>
  );
};

export default Register;
