
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import Attendance from "./pages/Attendance";
import History from "./pages/History";
import Subjects from "./pages/Subjects";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Footer from "./components/Footer";


import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/students" element={<Students />} />
          <Route path="/add-student" element={<AddStudent />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/history" element={<History />} />
          <Route path="/subjects" element={<Subjects />} />
        </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
