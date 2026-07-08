import Home from "../pages/Home/Home";
import Dashboard from "../pages/Dashboard/Dashboard";
import LectureRoom from "../pages/LectureRoom/LectureRoom";
import Reports from "../pages/Reports/Reports";
import TeacherLogin from "../pages/TeacherLogin/TeacherLogin";
import TeacherDashboard from "../pages/TeacherDashboard/TeacherDashboard";
import StudentLogin from "../pages/StudentLogin/StudentLogin";
import JoinRoom from "../pages/JoinRoom/JoinRoom";

export const routeConfig = [
  { path: "/", element: <Home /> },
  { path: "/teacher-login", element: <TeacherLogin /> },
  { path: "/teacher-dashboard", element: <TeacherDashboard /> },
  { path: "/student-login", element: <StudentLogin /> },
  { path: "/join-room", element: <JoinRoom /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/lecture-room", element: <LectureRoom /> },
  { path: "/reports", element: <Reports /> },
];
