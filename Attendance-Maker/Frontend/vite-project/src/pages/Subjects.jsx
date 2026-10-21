
import { useEffect, useState } from "react";
import api from "../services/api";

import "./Subjects.css";

function Subjects() {
  const [form, setForm] = useState({
    subject: "",
    subCode: "",
    branch: "",
    semester: "",
  });

  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  async function fetchSubjects() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/subject/allsubject");
      setSubjects(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error || "Unable to fetch subjects."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubjects();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setError("");
    setSaving(true);

    try {
      const response = await api.post("/subject/newsubject", {
        subject: form.subject.trim(),
        subCode: form.subCode.trim(),
        branch: form.branch,
        semester: Number(form.semester),
      });

      setMessage(response.data.message);

      setForm({
        subject: "",
        subCode: "",
        branch: "",
        semester: "",
      });

      await fetchSubjects();
    } catch (err) {
      setError(
        err.response?.data?.error || "Unable to add subject."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subject?"
    );

    if (!confirmed) return;

    setMessage("");
    setError("");
    setDeletingId(id);

    try {
      const response = await api.delete(`/subject/${id}`);

      setMessage(response.data.message);
      setSubjects((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (err) {
      setError(
        err.response?.data?.error || "Unable to delete subject."
      );
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="subjects-page">
      <header className="subjects-header">
        <div>
          <h1>Subject Management</h1>
          <p>Manage subjects by branch and semester.</p>
        </div>

        <div className="subjects-total">
          <span className="total-icon">▤</span>
          <div>
            <span>Total Subjects</span>
            <strong>{subjects.length}</strong>
          </div>
        </div>
      </header>

      <div className="subjects-layout">
        <section className="subject-form-panel">
          <div className="subject-panel-heading">
            <div className="subject-heading-icon">＋</div>
            <div>
              <h2>Add New Subject</h2>
              <p>Enter the academic subject details.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="subject-field">
              <label htmlFor="subject">Subject Name *</label>
              <input
                id="subject"
                name="subject"
                type="text"
                placeholder="e.g. Engineering Mathematics"
                value={form.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="subject-field">
              <label htmlFor="subCode">Subject Code *</label>
              <input
                id="subCode"
                name="subCode"
                type="text"
                placeholder="e.g. ME101"
                value={form.subCode}
                onChange={handleChange}
                required
              />
            </div>

            <div className="subject-field">
              <label htmlFor="branch">Branch *</label>
              <select
                id="branch"
                name="branch"
                value={form.branch}
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

            <div className="subject-field">
              <label htmlFor="semester">Semester *</label>
              <select
                id="semester"
                name="semester"
                value={form.semester}
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

            <button
              className="subject-submit-btn"
              type="submit"
              disabled={saving}
            >
              {saving ? "Adding..." : "+ Add Subject"}
            </button>
          </form>
        </section>

        <section className="subject-list-panel">
          <div className="subject-list-heading">
            <div>
              <h2>Subject List</h2>
              <p>All registered academic subjects</p>
            </div>

            <button
              className="subject-refresh-btn"
              type="button"
              onClick={fetchSubjects}
              disabled={loading}
              title="Refresh subjects"
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>

          {message && (
            <p className="subject-success">{message}</p>
          )}

          {error && (
            <p className="subject-error">{error}</p>
          )}

          {loading ? (
            <div className="subject-empty-state">
              Loading subjects...
            </div>
          ) : subjects.length === 0 ? (
            <div className="subject-empty-state">
              <div className="subject-empty-icon">▤</div>
              <h3>No subjects yet</h3>
              <p>Add your first subject using the form.</p>
            </div>
          ) : (
            <div className="subject-list">
              {subjects.map((item) => (
                <article className="subject-item" key={item._id}>
                  <div className="subject-item-icon">▤</div>

                  <div className="subject-item-details">
                    <h3>{item.subject}</h3>
                    <span className="subject-code">
                      {item.subCode}
                    </span>

                    <div className="subject-meta">
                      <span>{item.branch}</span>
                      <span>Semester {item.semester}</span>
                    </div>
                  </div>

                  <button
                    className="subject-delete-btn"
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId === item._id}
                    title="Delete subject"
                  >
                    {deletingId === item._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );

  
}

export default Subjects;

// return (
//     <div className="page-container">
//       <h1>Subject Management</h1>
//       <p>Add subjects, view all subjects, and delete subjects.</p>

//       <h2>Add Subject</h2>

//       <form onSubmit={handleSubmit}>
//         <label htmlFor="subject">Subject Name</label>
//         <input
//           id="subject"
//           name="subject"
//           type="text"
//           placeholder="Enter subject name"
//           value={form.subject}
//           onChange={handleChange}
//           required
//         />

//         <label htmlFor="subCode">Subject Code</label>
//         <input
//           id="subCode"
//           name="subCode"
//           type="text"
//           placeholder="Enter subject code"
//           value={form.subCode}
//           onChange={handleChange}
//           required
//         />

//         <label htmlFor="branch">Branch</label>
//         <select
//           id="branch"
//           name="branch"
//           value={form.branch}
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
//           value={form.semester}
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

//         <button type="submit" disabled={saving}>
//           {saving ? "Adding..." : "Add Subject"}
//         </button>
//       </form>

//       {message && <p className="success-message">{message}</p>}
//       {error && <p className="error-message">{error}</p>}

//       <h2>All Subjects</h2>

//       <button
//         type="button"
//         onClick={fetchSubjects}
//         disabled={loading}
//       >
//         {loading ? "Loading..." : "Refresh Subjects"}
//       </button>

//       {loading ? (
//         <p>Loading subjects...</p>
//       ) : subjects.length === 0 ? (
//         <p>No subjects added yet.</p>
//       ) : (
//         <div style={{ overflowX: "auto", marginTop: "16px" }}>
//           <table border="1" cellPadding="8" cellSpacing="0">
//             <thead>
//               <tr>
//                 <th>Subject Name</th>
//                 <th>Subject Code</th>
//                 <th>Branch</th>
//                 <th>Semester</th>
//                 <th>Action</th>
//               </tr>
//             </thead>

//             <tbody>
//               {subjects.map((item) => (
//                 <tr key={item._id}>
//                   <td>{item.subject}</td>
//                   <td>{item.subCode}</td>
//                   <td>{item.branch}</td>
//                   <td>{item.semester}</td>
//                   <td>
//                     <button
//                       type="button"
//                       onClick={() => handleDelete(item._id)}
//                       disabled={deletingId === item._id}
//                     >
//                       {deletingId === item._id
//                         ? "Deleting..."
//                         : "Delete"}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
