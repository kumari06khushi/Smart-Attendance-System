
import { useState } from "react";
import api from "../services/api";

import "./Attendance.css";

function Attendance() {
  const [filters, setFilters] = useState({
    year: "",
    branch: "",
    semester: "",
    subjectCode: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentsLoaded, setStudentsLoaded] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function fetchStudents(e) {
    e.preventDefault();

    setMessage("");
    setError("");
    setStudents([]);
    setAttendance({});
    setStudentsLoaded(false);

    try {
      const response = await api.get("/student/allstudent", {
        params: {
          year: filters.year,
          branch: filters.branch,
          semester: filters.semester,
        },
      });

      setStudents(response.data);

      const initialAttendance = {};

      response.data.forEach((student) => {
        initialAttendance[student.rollNumber] = 0;
      });

      setAttendance(initialAttendance);
      setStudentsLoaded(true);
      setMessage(`${response.data.length} student(s) found.`);
    } catch (err) {
      setError(
        err.response?.data?.error || "Unable to fetch students."
      );
    }
  }

  function toggleAttendance(rollNumber) {
    setAttendance((prev) => ({
      ...prev,
      [rollNumber]: prev[rollNumber] === 1 ? 0 : 1,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (students.length === 0) {
      setError("Please load students before submitting attendance.");
      return;
    }

    if (!filters.subjectCode.trim()) {
      setError("Please enter the subject code.");
      return;
    }

    setLoading(true);

    try {
      const attendanceData = students.map((student) => ({
        rollNumber: student.rollNumber,
        status: attendance[student.rollNumber],
      }));

      const response = await api.post("/attendancepage/submit", {
        date: filters.date,
        year: Number(filters.year),
        branch: filters.branch,
        semester: Number(filters.semester),
        subjectCode: filters.subjectCode.trim(),
        attendance: attendanceData,
      });

      setMessage(response.data.message);
    } catch (err) {
      setError(
        err.response?.data?.error || "Unable to submit attendance."
      );
    } finally {
      setLoading(false);
    }
  }

  const presentCount = Object.values(attendance).filter(
    (status) => status === 1
  ).length;

  const absentCount = Object.values(attendance).filter(
    (status) => status === 0
  ).length;

  
  return (
    <main className="attendance-page">
      <header className="attendance-header">
        <div className="attendance-title-icon">✓</div>

        <div>
          <h1>Take Attendance</h1>
          <p>Select class details and mark student attendance.</p>
        </div>
      </header>

      <form className="attendance-filter-card" onSubmit={fetchStudents}>
        <div className="attendance-section-heading">
          <div>
            <h2>Class Details</h2>
            <p>Choose the class and subject for attendance.</p>
          </div>
          <span className="attendance-filter-icon">▤</span>
        </div>

        <div className="attendance-filter-grid">
          <div className="attendance-field">
            <label htmlFor="year">Admission Year</label>
            <input
              id="year"
              name="year"
              type="number"
              placeholder="e.g. 2026"
              value={filters.year}
              onChange={handleChange}
              min="2000"
              max="2099"
              required
            />
          </div>

          <div className="attendance-field">
            <label htmlFor="branch">Branch</label>
            <select
              id="branch"
              name="branch"
              value={filters.branch}
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

          <div className="attendance-field">
            <label htmlFor="semester">Semester</label>
            <select
              id="semester"
              name="semester"
              value={filters.semester}
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

          <div className="attendance-field">
            <label htmlFor="date">Attendance Date</label>
            <input
              id="date"
              name="date"
              type="date"
              value={filters.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="attendance-field">
            <label htmlFor="subjectCode">Subject Code</label>
            <input
              id="subjectCode"
              name="subjectCode"
              type="text"
              placeholder="e.g. ME101"
              value={filters.subjectCode}
              onChange={handleChange}
              required
            />
          </div>

          <div className="attendance-load-wrapper">
            <button type="submit" className="attendance-load-btn">
              Load Students
            </button>
          </div>
        </div>
      </form>

      {message && (
        <div className="attendance-message attendance-success">
          <span>✓</span>
          {message}
        </div>
      )}

      {error && (
        <div className="attendance-message attendance-error">
          <span>!</span>
          {error}
        </div>
      )}

      {studentsLoaded && (
        <>
          <section className="attendance-stats">
            <div className="attendance-stat-card total-stat">
              <span className="attendance-stat-icon">▤</span>
              <div>
                <p>Total Students</p>
                <h3>{students.length}</h3>
              </div>
            </div>

            <div className="attendance-stat-card present-stat">
              <span className="attendance-stat-icon">✓</span>
              <div>
                <p>Present</p>
                <h3>{presentCount}</h3>
              </div>
            </div>

            <div className="attendance-stat-card absent-stat">
              <span className="attendance-stat-icon">×</span>
              <div>
                <p>Absent</p>
                <h3>{absentCount}</h3>
              </div>
            </div>
          </section>

          <section className="attendance-list-card">
            <div className="attendance-list-header">
              <div>
                <h2>Student List</h2>
                <p>Click the status to mark attendance.</p>
              </div>

              <span className="attendance-student-count">
                {students.length} Students
              </span>
            </div>

            {students.length === 0 ? (
              <div className="attendance-empty-state">
                <span>▤</span>
                <h3>No students found</h3>
                <p>
                  Try selecting a different year, branch or semester.
                </p>
              </div>
            ) : (
              <div className="attendance-table-wrapper">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>STUDENT</th>
                      <th>ROLL NUMBER</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((student) => {
                      const isPresent =
                        attendance[student.rollNumber] === 1;

                      return (
                        <tr key={student._id}>
                          <td>
                            <div className="attendance-student-cell">
                              <div className="attendance-avatar">
                                {(student.firstName || "?")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <span className="attendance-student-name">
                                {student.firstName}{" "}
                                {student.lastName || ""}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span className="attendance-roll-number">
                              {student.rollNumber}
                            </span>
                          </td>

                          <td>
                            <button
                              type="button"
                              className={`attendance-status-btn ${
                                isPresent
                                  ? "status-present"
                                  : "status-absent"
                              }`}
                              onClick={() =>
                                toggleAttendance(student.rollNumber)
                              }
                              aria-label={`Mark ${student.rollNumber} ${
                                isPresent ? "absent" : "present"
                              }`}
                            >
                              <span className="status-dot" />
                              {isPresent
                                ? "1 · Present"
                                : "0 · Absent"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {students.length > 0 && (
              <div className="attendance-submit-row">
                <p>
                  <span className="attendance-submit-hint">ⓘ</span>
                  Verify each student's status before submitting.
                </p>

                <button
                  type="button"
                  className="attendance-submit-btn"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "✓ Submit Attendance"}
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );


}

export default Attendance;

//  return (
//     <div className="page-container">
//       <h1>Attendance Sheet</h1>
//       <p>Select the details to load students and mark attendance.</p>

//       <form onSubmit={fetchStudents}>
//         <label htmlFor="date">Date</label>
//         <input
//           id="date"
//           name="date"
//           type="date"
//           value={filters.date}
//           onChange={handleChange}
//           required
//         />

//         <label htmlFor="year">Admission Year</label>
//         <input
//           id="year"
//           name="year"
//           type="number"
//           placeholder="Enter admission year"
//           value={filters.year}
//           onChange={handleChange}
//           min="2000"
//           max="2099"
//           required
//         />

//         <label htmlFor="branch">Branch</label>
//         <select
//           id="branch"
//           name="branch"
//           value={filters.branch}
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

//         <label htmlFor="semester">Semester</label>
//         <select
//           id="semester"
//           name="semester"
//           value={filters.semester}
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

//         <label htmlFor="subjectCode">Subject Code</label>
//         <input
//           id="subjectCode"
//           name="subjectCode"
//           type="text"
//           placeholder="Enter subject code (CS101)"
//           value={filters.subjectCode}
//           onChange={handleChange}
//           required
//         />

//         <button type="submit">Load Students</button>
//       </form>

//       {message && <p className="success-message">{message}</p>}
//       {error && <p className="error-message">{error}</p>}

//       {studentsLoaded && students.length > 0 && (
//         <>
//           <h2>Mark Attendance</h2>

//           <p>
//             Present: {presentCount} | Absent: {absentCount}
//           </p>

//           <p>Click a status box to switch between Present and Absent.</p>

//           <div style={{ overflowX: "auto" }}>
//             <table border="1" cellPadding="8" cellSpacing="0">
//               <thead>
//                 <tr>
//                   <th>Roll Number</th>
//                   <th>Student Name</th>
//                   <th>Attendance Status</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {students.map((student) => {
//                   const isPresent =
//                     attendance[student.rollNumber] === 1;

//                   return (
//                     <tr key={student._id}>
//                       <td>{student.rollNumber}</td>
//                       <td>
//                         {student.firstName} {student.lastName || ""}
//                       </td>
//                       <td>
//                         <button
//                           type="button"
//                           onClick={() =>
//                             toggleAttendance(student.rollNumber)
//                           }
//                           aria-label={`Mark ${student.rollNumber} ${
//                             isPresent ? "absent" : "present"
//                           }`}
//                         >
//                           {isPresent ? "1 - Present" : "0 - Absent"}
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           <button
//             type="button"
//             onClick={handleSubmit}
//             disabled={loading}
//           >
//             {loading ? "Submitting..." : "Submit Attendance"}
//           </button>
//         </>
//       )}
//     </div>
//   );

