
import { useState } from "react";
import api from "../services/api";

import "./AddStudent.css";

function AddStudent() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    fatherName: "",
    phone: "",
    branch: "",
    gender: "",
    year: "",
    semester: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/student/newstudent", {
        ...formData,
        year: Number(formData.year),
        semester: Number(formData.semester),
      });

      setMessage(
        `${response.data.message}. Roll Number: ${response.data.newStudent.rollNumber}`
      );

      setFormData({
        firstName: "",
        lastName: "",
        fatherName: "",
        phone: "",
        branch: "",
        gender: "",
        year: "",
        semester: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.error || "Unable to add student."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="add-student-page">
      <div className="add-student-layout">
        <aside className="add-student-info">
          <div className="add-student-logo">🎓</div>

          <h2>New Student</h2>
          <p className="info-description">
            Add a new student to your attendance management system.
          </p>

          <div className="info-divider"></div>

          <div className="info-feature">
            <span>01</span>
            <div>
              <h4>Personal Details</h4>
              <p>Student and contact information</p>
            </div>
          </div>

          <div className="info-feature">
            <span>02</span>
            <div>
              <h4>Academic Details</h4>
              <p>Branch, admission year and semester</p>
            </div>
          </div>

          <div className="info-feature">
            <span>03</span>
            <div>
              <h4>Student Registration</h4>
              <p>Register and manage student records</p>
            </div>
          </div>
        </aside>

        <section className="add-student-form-panel">
          <div className="form-heading">
            <h1>Add Student</h1>
            <p>Fill in the details to register a new student.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <h3 className="form-section-title">Personal Information</h3>

            <div className="add-student-grid">
              <div className="add-student-field">
                <label htmlFor="firstName">First Name *</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="add-student-field">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>

              <div className="add-student-field">
                <label htmlFor="fatherName">Father Name *</label>
                <input
                  id="fatherName"
                  name="fatherName"
                  type="text"
                  placeholder="Enter father's name"
                  value={formData.fatherName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="add-student-field">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="10-digit phone number"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <h3 className="form-section-title academic-title">
              Academic Information
            </h3>

            <div className="add-student-grid">
              <div className="add-student-field">
                <label htmlFor="branch">Branch *</label>
                <select
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Branch</option>
                  <option value="Civil">Civil</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Electrical & Communication">
                    Electrical & Communication
                  </option>
                  <option value="Electrical & Electronics">
                    Electrical & Electronics
                  </option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>

              <div className="add-student-field">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="add-student-field">
                <label htmlFor="year">Admission Year *</label>
                <input
                  id="year"
                  name="year"
                  type="number"
                  placeholder="e.g. 2026"
                  value={formData.year}
                  onChange={handleChange}
                  min="2000"
                  max="2099"
                  required
                />
              </div>

              <div className="add-student-field">
                <label htmlFor="semester">Semester *</label>
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                    <option key={item} value={item}>
                      Semester {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="add-student-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Adding Student..." : "+ Add Student"}
              </button>
            </div>
          </form>

          {message && (
            <p className="add-student-success">{message}</p>
          )}

          {error && (
            <p className="add-student-error">{error}</p>
          )}
        </section>
      </div>
    </div>
  );

 
}

export default AddStudent;

//  return (
//     <div className="page-container">
//       <h1>Add Student</h1>
//       <p>Enter the student details below.</p>

//       <form onSubmit={handleSubmit}>
//         <label htmlFor="firstName">First Name</label>
//         <input
//           id="firstName"
//           name="firstName"
//           type="text"
//           value={formData.firstName}
//           onChange={handleChange}
//           required
//         />

//         <label htmlFor="lastName">Last Name</label>
//         <input
//           id="lastName"
//           name="lastName"
//           type="text"
//           value={formData.lastName}
//           onChange={handleChange}
//         />

//         <label htmlFor="fatherName">Father Name</label>
//         <input
//           id="fatherName"
//           name="fatherName"
//           type="text"
//           value={formData.fatherName}
//           onChange={handleChange}
//           required
//         />

//         <label htmlFor="phone">Phone Number</label>
//         <input
//           id="phone"
//           name="phone"
//           type="tel"
//           pattern="[0-9]{10}"
//           maxLength={10}
//           value={formData.phone}
//           onChange={handleChange}
//           required
//         />

//         <label htmlFor="branch">Branch</label>
//         <select
//           id="branch"
//           name="branch"
//           value={formData.branch}
//           onChange={handleChange}
//           required
//         >
//           <option value="">Select Branch</option>
//           <option value="Civil">Civil</option>
//           <option value="Mechanical">Mechanical</option>
//           <option value="Electrical">Electrical</option>
//           <option value="Electrical & Communication">
//             Electrical & Communication
//           </option>
//           <option value="Electrical & Electronics">
//             Electrical & Electronics
//           </option>
//           <option value="Computer Science">Computer Science</option>
//         </select>

//         <label htmlFor="gender">Gender</label>
//         <select
//           id="gender"
//           name="gender"
//           value={formData.gender}
//           onChange={handleChange}
//           required
//         >
//           <option value="">Select Gender</option>
//           <option value="Male">Male</option>
//           <option value="Female">Female</option>
//           <option value="Other">Other</option>
//         </select>

//         <label htmlFor="year">Admission Year</label>
        
//      <input
//   id="year"
//   name="year"
//   type="number"
//   placeholder="Enter Admission Year (e.g. 2026)"
//   value={formData.year}
//   onChange={handleChange}
//   min="2000"
//   max="2099"
//   required
// />


//         <label htmlFor="semester">Semester</label>
//         <select
//           id="semester"
//           name="semester"
//           value={formData.semester}
//           onChange={handleChange}
//           required
//         >
//           <option value="">Select Semester</option>
//           {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
//             <option key={item} value={item}>
//               Semester {item}
//             </option>
//           ))}
//         </select>

//         <button type="submit" disabled={loading}>
//           {loading ? "Adding Student..." : "Add Student"}
//         </button>
//       </form>

//       {message && <p className="success-message">{message}</p>}
//       {error && <p className="error-message">{error}</p>}
//     </div>
//   );
