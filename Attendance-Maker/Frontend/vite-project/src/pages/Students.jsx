
import { useState } from "react";
import api from "../services/api";

import "./Students.css";

function Students() {
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editRollNumber, setEditRollNumber] = useState("");
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    fatherName: "",
    phone: "",
  });

  async function fetchStudents(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    setStudents([]);

    try {
      const response = await api.get("/student/allstudent", {
        params: { year, branch, semester },
      });

      setStudents(response.data);
      setMessage(`${response.data.length} student(s) found.`);
    } catch (err) {
      setError(
        err.response?.data?.error || "Unable to fetch students."
      );
    }
  }

  function startEdit(student) {
    setEditRollNumber(student.rollNumber);
    setEditData({
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      fatherName: student.fatherName || "",
      phone: student.phone || "",
    });
    setError("");
    setMessage("");
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.patch(
        `/student/${editRollNumber}`,
        editData
      );

      setMessage("Student updated successfully.");
      setEditRollNumber("");

      const response = await api.get("/student/allstudent", {
        params: { year, branch, semester },
      });

      setStudents(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error || "Unable to update student."
      );
    }
  }

  async function handleDelete(rollNumber) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${rollNumber}?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api.delete(`/student/${rollNumber}`);

      setStudents((current) =>
        current.filter((student) => student.rollNumber !== rollNumber)
      );

      setMessage("Student deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.error || "Unable to delete student."
      );
    }
  }


return (
  <div className="students-page">
    <header className="students-page-header">
      <div>
        <span className="section-eyebrow">STUDENT MANAGEMENT</span>
        <h1>Student Directory</h1>
        <p>Search, view and manage your student records.</p>
      </div>
      <div className="directory-label">
        <span className="directory-dot"></span>
        Student Records
      </div>
    </header>

    <section className="student-filter-card">
      <div className="filter-card-heading">
        <div className="filter-icon">
          <span>⌕</span>
        </div>
        <div>
          <h2>Find Students</h2>
          <p>Choose the admission details to filter students.</p>
        </div>
      </div>

      <form onSubmit={fetchStudents}>
        <div className="student-filter-grid">
          <div className="student-form-group">
            <label htmlFor="year">Admission Year</label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            >
              <option value="">Select admission year</option>
              {[2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035].map(
                (item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="student-form-group">
            <label htmlFor="branch">Branch</label>
            <select
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              required
            >
              <option value="">Select branch</option>
              <option value="Civil">Civil</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Electrical">Electrical</option>
              <option value="Electrical & Communication">
                Electrical &amp; Communication
              </option>
              <option value="Electrical & Electronics">
                Electrical &amp; Electronics
              </option>
              <option value="Computer Science">Computer Science</option>
            </select>
          </div>

          <div className="student-form-group">
            <label htmlFor="semester">Semester</label>
            <select
              id="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              required
            >
              <option value="">Select semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <option key={item} value={item}>
                  Semester {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="student-search-btn">
          <span>⌕</span> Search Students
        </button>
      </form>
    </section>

    {message && <p className="students-message">{message}</p>}
    {error && <p className="students-error">{error}</p>}

    {students.length > 0 && (
      <section className="student-results-section">
        <div className="results-heading">
          <div>
            <h2>Search Results</h2>
            <p>Students matching your selected filters.</p>
          </div>
          <span className="results-count">
            {students.length} {students.length === 1 ? "Student" : "Students"}
          </span>
        </div>

        <div className="table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Name</th>
                <th>Father Name</th>
                <th>Phone</th>
                <th>Branch</th>
                <th>Year</th>
                <th>Semester</th>
                <th>Gender</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>
                    <span className="roll-number">{student.rollNumber}</span>
                  </td>
                  <td>{student.firstName} {student.lastName}</td>
                  <td>{student.fatherName}</td>
                  <td>{student.phone}</td>
                  <td>{student.branch}</td>
                  <td>{student.year}</td>
                  <td>{student.semester}</td>
                  <td>{student.gender}</td>
                  <td>
                    <div className="student-actions">
                      <button
                        type="button"
                        className="student-edit-btn"
                        onClick={() => startEdit(student)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="student-delete-btn"
                        onClick={() => handleDelete(student.rollNumber)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )}

    {students.length === 0 && message && !error && (
      <div className="students-empty-state">
        <div className="empty-state-icon">⌕</div>
        <h3>No students found</h3>
        <p>Try checking your admission year, branch and semester.</p>
      </div>
    )}

    {editRollNumber && (
      <section className="student-edit-card">
        <div className="edit-card-heading">
          <div>
            <span className="section-eyebrow">UPDATE RECORD</span>
            <h2>Edit Student</h2>
            <p>Roll Number: <strong>{editRollNumber}</strong></p>
          </div>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="student-edit-grid">
            <div className="student-form-group">
              <label htmlFor="edit-firstName">First Name</label>
              <input
                id="edit-firstName"
                value={editData.firstName}
                onChange={(e) =>
                  setEditData({ ...editData, firstName: e.target.value })
                }
                required
              />
            </div>

            <div className="student-form-group">
              <label htmlFor="edit-lastName">Last Name</label>
              <input
                id="edit-lastName"
                value={editData.lastName}
                onChange={(e) =>
                  setEditData({ ...editData, lastName: e.target.value })
                }
              />
            </div>

            <div className="student-form-group">
              <label htmlFor="edit-fatherName">Father Name</label>
              <input
                id="edit-fatherName"
                value={editData.fatherName}
                onChange={(e) =>
                  setEditData({ ...editData, fatherName: e.target.value })
                }
                required
              />
            </div>

            <div className="student-form-group">
              <label htmlFor="edit-phone">Phone</label>
              <input
                id="edit-phone"
                value={editData.phone}
                onChange={(e) =>
                  setEditData({ ...editData, phone: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="student-edit-actions">
            <button type="submit" className="student-search-btn">
              Save Changes
            </button>
            <button
              type="button"
              className="student-cancel-btn"
              onClick={() => setEditRollNumber("")}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    )}
  </div>
);



}

export default Students;

  // return (
  //   <div>
  //     <h1>Students</h1>
  //     <p>Search and manage student records.</p>

  //     <form onSubmit={fetchStudents}>
  //       <label>Year</label>
  //       <select
  //         value={year}
  //         onChange={(e) => setYear(e.target.value)}
  //         required
  //       >
  //         <option value="">Admission Year</option>
  //         <option value="2026">2026</option>
  //         <option value="2027">2027</option>
  //         <option value="2028">2028</option>
  //         <option value="2029">2029</option>
  //         <option value="2030">2030</option>
  //         <option value="2031">2031</option>
  //         <option value="2032">2032</option>
  //         <option value="2033">2033</option>
  //         <option value="2034">2034</option>
  //         <option value="2035">2035</option>
  //       </select>

  //       <label>Branch</label>
  //       <select
  //         value={branch}
  //         onChange={(e) => setBranch(e.target.value)}
  //         required
  //       >
  //         <option value="">Select Branch</option>
  //         <option value="Civil">Civil</option>
  //         <option value="Mechanical">Mechanical</option>
  //         <option value="Electrical">Electrical</option>
  //         <option value="Electrical & Communication">
  //           Electrical & Communication
  //         </option>
  //         <option value="Electrical & Electronics">
  //           Electrical & Electronics
  //         </option>
  //         <option value="Computer Science">Computer Science</option>
  //       </select>

  //       <label>Semester</label>
  //       <select
  //         value={semester}
  //         onChange={(e) => setSemester(e.target.value)}
  //         required
  //       >
  //         <option value="">Select Semester</option>
  //         {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
  //           <option key={item} value={item}>
  //             Semester {item}
  //           </option>
  //         ))}
  //       </select>

  //       <button type="submit">Search Students</button>
  //     </form>

  //     {message && <p className="success-message">{message}</p>}
  //     {error && <p className="error-message">{error}</p>}

  //     {students.length > 0 && (
  //       <div style={{ overflowX: "auto" }}>
  //         <table border="1" cellPadding="8" cellSpacing="0">
  //           <thead>
  //             <tr>
  //               <th>Roll Number</th>
  //               <th>Name</th>
  //               <th>Father Name</th>
  //               <th>Phone</th>
  //               <th>Branch</th>
  //               <th>Year</th>
  //               <th>Semester</th>
  //               <th>Gender</th>
  //               <th>Actions</th>
  //             </tr>
  //           </thead>

  //           <tbody>
  //             {students.map((student) => (
  //               <tr key={student._id}>
  //                 <td>{student.rollNumber}</td>
  //                 <td>
  //                   {student.firstName} {student.lastName}
  //                 </td>
  //                 <td>{student.fatherName}</td>
  //                 <td>{student.phone}</td>
  //                 <td>{student.branch}</td>
  //                 <td>{student.year}</td>
  //                 <td>{student.semester}</td>
  //                 <td>{student.gender}</td>
  //                 <td>
  //                   <button
  //                     type="button"
  //                     onClick={() => startEdit(student)}
  //                   >
  //                     Edit
  //                   </button>{" "}
  //                   <button
  //                     type="button"
  //                     onClick={() => handleDelete(student.rollNumber)}
  //                   >
  //                     Delete
  //                   </button>
  //                 </td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </table>
  //       </div>
  //     )}

  //     {editRollNumber && (
  //       <form onSubmit={handleUpdate}>
  //         <h2>Edit Student: {editRollNumber}</h2>

  //         <label>First Name</label>
  //         <input
  //           value={editData.firstName}
  //           onChange={(e) =>
  //             setEditData({ ...editData, firstName: e.target.value })
  //           }
  //           required
  //         />

  //         <label>Last Name</label>
  //         <input
  //           value={editData.lastName}
  //           onChange={(e) =>
  //             setEditData({ ...editData, lastName: e.target.value })
  //           }
  //         />

  //         <label>Father Name</label>
  //         <input
  //           value={editData.fatherName}
  //           onChange={(e) =>
  //             setEditData({ ...editData, fatherName: e.target.value })
  //           }
  //           required
  //         />

  //         <label>Phone</label>
  //         <input
  //           value={editData.phone}
  //           onChange={(e) =>
  //             setEditData({ ...editData, phone: e.target.value })
  //           }
  //           required
  //         />

  //         <button type="submit">Save Changes</button>
  //         <button
  //           type="button"
  //           onClick={() => setEditRollNumber("")}
  //         >
  //           Cancel
  //         </button>
  //       </form>
  //     )}
  //   </div>
  // );
