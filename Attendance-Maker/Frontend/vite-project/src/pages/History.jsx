import { useState } from "react";
import api from "../services/api";

import "./History.css";

function History() {
  const [filters, setFilters] = useState({
    branch: "",
    month: "",
    semester: "",
    subjectCode: "",
  });

  const [history, setHistory] = useState([]);
  const [workingDays, setWorkingDays] = useState(0);
  const [subjectName, setSubjectName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setError("");
    setHistory([]);
    setWorkingDays(0);
    setSubjectName("");
    setLoading(true);

    try {
      const response = await api.get("/attendancepage/history", {
        params: {
          branch: filters.branch,
          month: filters.month,
          semester: filters.semester,
          subjectCode: filters.subjectCode.trim(),
        },
      });

      setHistory(response.data.history);
      setWorkingDays(response.data.workingDays);
      setSubjectName(response.data.subject);

      setMessage("Attendance history loaded successfully.");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to fetch attendance history."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="history-page">
      <header className="history-header">
        <div className="history-title-icon">
          <span>◷</span>
        </div>

        <div>
          <h1>Attendance History</h1>
          <p>Track and review monthly student attendance.</p>
        </div>
      </header>

      <form className="history-filter-card" onSubmit={handleSubmit}>
        <div className="history-section-heading">
          <div>
            <h2>Filter Records</h2>
            <p>Select class and subject details to view history.</p>
          </div>
          <span className="history-filter-icon">☷</span>
        </div>

        <div className="history-filter-grid">
          <div className="history-field">
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

          <div className="history-field">
            <label htmlFor="month">Month</label>
            <input
              id="month"
              name="month"
              type="month"
              value={filters.month}
              onChange={handleChange}
              required
            />
          </div>

          <div className="history-field">
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

          <div className="history-field">
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
        </div>

        <div className="history-filter-actions">
          <button
            type="submit"
            className="history-search-btn"
            disabled={loading}
          >
            {loading ? "Loading..." : <><span className="history-search-icon">⌕</span> View History</>}
          
          </button>
        </div>
      </form>

      {message && (
        <div className="history-message history-success">
          <span>✓</span>
          {message}
        </div>
      )}

      {error && (
        <div className="history-message history-error">
          <span>!</span>
          {error}
        </div>
      )}

      {history.length > 0 && (
        <>
          <section className="history-stats">
            <div className="history-stat-card">
              <div className="history-stat-icon">♙</div>
              <div>
                <p>Total Students</p>
                <h3>{history.length}</h3>
              </div>
            </div>

            <div className="history-stat-card history-working-stat">
              <div className="history-stat-icon">▦</div>
              <div>
                <p>Working Days</p>
                <h3>{workingDays}</h3>
              </div>
            </div>

            <div className="history-stat-card history-subject-stat">
              <div className="history-stat-icon">▤</div>
              <div>
                <p>Subject</p>
                <h3>{subjectName || filters.subjectCode}</h3>
              </div>
            </div>
          </section>

          <section className="history-records-card">
            <div className="history-records-header">
              <div>
                <h2>Student Attendance Records</h2>
                <p>Monthly attendance summary for each student.</p>
              </div>

              <span className="history-record-count">
                {history.length} Students
              </span>
            </div>

            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>STUDENT</th>
                    <th>PRESENT</th>
                    <th>ABSENT</th>
                    <th>WORKING DAYS</th>
                    <th>ATTENDANCE</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((student) => {
                    const present = Number(student.presentDays) || 0;
                    const absent = Number(student.absentDays) || 0;
                    const days =
                      Number(student.workingDays) || workingDays;

                    const percentage =
                      days > 0
                        ? Math.round((present / days) * 100)
                        : 0;

                    return (
                      <tr key={student.rollNumber}>
                        <td>
                          <div className="history-student-cell">
                            <div className="history-avatar">
                              {(student.studentName || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="history-student-info">
                              <span className="history-student-name">
                                {student.studentName}
                              </span>
                              <span className="history-roll-number">
                                {student.rollNumber}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="history-count history-present">
                            {present}
                          </span>
                        </td>

                        <td>
                          <span className="history-count history-absent">
                            {absent}
                          </span>
                        </td>

                        <td>
                          <span className="history-working-days">
                            {student.workingDays}
                          </span>
                        </td>

                        <td>
                          <div className="history-percentage-cell">
                            <span
                              className={`history-percentage ${
                                percentage < 75
                                  ? "history-low-percentage"
                                  : ""
                              }`}
                            >
                              {percentage}%
                            </span>

                            <div className="history-progress-track">
                              <div
                                className="history-progress-fill"
                                style={{
                                  width: `${Math.min(percentage, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {!loading && !error && history.length === 0 && message === "" && (
        <div className="history-empty-state">
          <div className="history-empty-icon">◷</div>
          <h3>Attendance History</h3>
          <p>
            Select your filters above and click View History to see
            student attendance records.
          </p>
        </div>
      )}
    </main>
  );

  
}

export default History;

// return (
//     <div className="page-container">
//       <h1>Attendance History</h1>

//       <p>
//         Select branch, month, semester and subject code to view
//         attendance history.
//       </p>

//       <form onSubmit={handleSubmit}>
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

//           <option value="Computer Science">
//             Computer Science
//           </option>
//         </select>

//         <label htmlFor="month">Month</label>

//         <input
//           id="month"
//           name="month"
//           type="month"
//           value={filters.month}
//           onChange={handleChange}
//           required
//         />

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
//           placeholder="Enter subject code"
//           value={filters.subjectCode}
//           onChange={handleChange}
//           required
//         />

//         <button type="submit" disabled={loading}>
//           {loading ? "Loading..." : "View"}
//         </button>
//       </form>

//       {message && (
//         <p className="success-message">{message}</p>
//       )}

//       {error && (
//         <p className="error-message">{error}</p>
//       )}

//       {history.length > 0 && (
//         <>
//           <h2>Attendance History</h2>

//           <p>
//             <strong>Subject:</strong> {subjectName}
//           </p>

//           <p>
//             <strong>Working Days:</strong> {workingDays}
//           </p>

//           <div style={{ overflowX: "auto" }}>
//             <table border="1" cellPadding="8" cellSpacing="0">
//               <thead>
//                 <tr>
//                   <th>Roll Number</th>
//                   <th>Student Name</th>
//                   <th>Present</th>
//                   <th>Absent</th>
//                   <th>Working Days</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {history.map((student) => (
//                   <tr key={student.rollNumber}>
//                     <td>{student.rollNumber}</td>

//                     <td>{student.studentName}</td>

//                     <td>{student.presentDays}</td>

//                     <td>{student.absentDays}</td>

//                     <td>{student.workingDays}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}

//       {!loading &&
//         !error &&
//         history.length === 0 &&
//         message === "" && (
//           <p>No attendance history to show.</p>
//         )}
//     </div>
//   );