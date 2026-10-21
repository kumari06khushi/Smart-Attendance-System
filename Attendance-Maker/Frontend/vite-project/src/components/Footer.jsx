

import { FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";
import "./Footer.css";

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">

        {/* Project Information */}
        <div className="footer-section footer-project">
          <div className="footer-brand">
            <span className="footer-brand-icon">🎓</span>
            <h2>Attendance Maker</h2>
          </div>

          <p>
            Track Attendance • Save Time • Stay Organized.

          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>

          <div className="footer-links">
            <a href="/students">Students</a>
            <a href="/attendance">Attendance</a>
            <a href="/history">History</a>
            <a href="/add-student">Add Student</a>
          </div>
        </div>

        {/* Developer */}
        <div className="footer-section">
          <h3>Developed By</h3>

          <h4>Khushi Kumari</h4>

          <p className="footer-role">
            Mechanical Engineering Student
          </p>

         <div className="social-links">
  <a
    href="https://www.linkedin.com/in/khushi-kumari-a91240366?utm_source=share_via&utm_content=profile&utm_medium=member_android"
    target="_blank"
    rel="noreferrer"
    aria-label="LinkedIn"
    title="LinkedIn"
  >
    <FaLinkedin />
  </a>

  <a
    href="https://github.com/kumari06khushi"
    target="_blank"
    rel="noreferrer"
    aria-label="GitHub"
    title="GitHub"
  >
    <FaGithub />
  </a>

  <a
    href="mailto:khushi16bce@gmail.com"
    aria-label="Email"
    title="Email"
  >
    <FaEnvelope />
  </a>
</div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <p>
          Built with React • Node.js • Express • MongoDB
        </p>

        <p>
          © 2026 Khushi Kumari • Attendance Maker
        </p>

      </div>
    </footer>
  );
}

export default Footer;
