import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-5 border-b border-gray-800">
      <h1 className="text-2xl font-bold text-blue-500">
        AI Monitor
      </h1>

      <div className="flex gap-8">
        <Link to="/" className="hover:text-blue-400">
          Home
        </Link>

        <Link to="/dashboard" className="hover:text-blue-400">
          Dashboard
        </Link>

        <Link to="/lecture-room" className="hover:text-blue-400">
          Lecture Room
        </Link>

        <Link to="/reports" className="hover:text-blue-400">
          Reports
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;