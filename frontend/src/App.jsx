import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Dashboard from "./pages/Dashboard/Dashboard";
import LectureRoom from "./pages/LectureRoom/LectureRoom";
import Reports from "./pages/Reports/Reports";

import TeacherLogin from "./pages/TeacherLogin/TeacherLogin";
import TeacherDashboard from "./pages/TeacherDashboard/TeacherDashboard";
import StudentLogin from "./pages/StudentLogin/StudentLogin";
import JoinRoom from "./pages/JoinRoom/JoinRoom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/teacher-login"
          element={<TeacherLogin />}
        />

        <Route
          path="/teacher-dashboard"
          element={<TeacherDashboard />}
        />

        <Route
          path="/student-login"
          element={<StudentLogin />}
        />

        <Route
          path="/join-room"
          element={<JoinRoom />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/lecture-room"
          element={<LectureRoom />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;