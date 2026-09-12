import { NavLink, useNavigate } from "react-router-dom";

type Props = {
  userName: string;
  onLogout: () => void;
};

export function Navbar({ userName, onLogout }: Props) {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-3 flex items-center gap-4">
      {/* Logo */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span className="font-bold text-gray-900">TaskFlow</span>
      </div>

      {/* Nav links */}
      <nav className="flex gap-1 ml-4">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/workspaces"
          className={({ isActive }) =>
            `px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            }`
          }
        >
          Workspaces
        </NavLink>
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-xs font-bold text-blue-600">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-sm text-gray-700 font-medium hidden sm:block">{userName}</span>
        <button
          onClick={onLogout}
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}