
import { NavLink, useNavigate } from "react-router-dom";

import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  
return (
  <nav className="navbar">
    <NavLink to="/students" className="navbar-brand">
    
      <span className="brand-icon">🎓</span>
      <span>Attendance Maker</span>
    </NavLink>

    <div className="nav-links">
      <NavLink to="/students">Students</NavLink>
      <NavLink to="/add-student">Add Student</NavLink>
      <NavLink to="/subjects">Subjects</NavLink>
      <NavLink to="/attendance">Attendance</NavLink>
      <NavLink to="/history">History</NavLink>

      <button
        type="button"
        className="logout-btn"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  </nav>
);

 
}

export default Navbar;

//  return (
//     <nav className="navbar">
//       <h2>Attendance Maker</h2>

//       <div className="nav-links">
//         <Link to="/students">Students</Link>
//          <Link to="/add-student">Add Student</Link>
//           <Link to="/subjects">Subjects</Link>
//         <Link to="/attendance">Attendance</Link>
//         <Link to="/history">History</Link>
       

//         <button onClick={handleLogout}>Logout</button>
//       </div>
//     </nav>
//   );
