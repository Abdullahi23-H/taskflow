import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

type SearchCard = {
  id: string;
  title: string;
  list: {
    id: string;
    name: string;
    board: {
      id: string;
      name: string;
      workspace: { id: string; name: string };
    };
  };
};

type Props = {
  userName: string;
  onLogout: () => void;
};

export function Navbar({ userName, onLogout }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchCard[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce: wait 300ms after user stops typing, then call API
  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await apiFetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.cards ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(card: SearchCard) {
    navigate(
      `/workspaces/${card.list.board.workspace.id}/boards/${card.list.board.id}`,
      { state: { boardName: card.list.board.name, workspaceName: card.list.board.workspace.name } }
    );
    setQuery("");
    setOpen(false);
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-3 flex items-center gap-4">
      {/* Logo */}
      <div
        className="flex items-center gap-2 cursor-pointer flex-shrink-0"
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
      <nav className="flex gap-1 flex-shrink-0">
        <NavLink
          to="/dashboard"
          className={({ isActive }: { isActive: boolean }) =>
            `px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
              isActive ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/workspaces"
          className={({ isActive }: { isActive: boolean }) =>
            `px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
              isActive ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            }`
          }
        >
          Workspaces
        </NavLink>
      </nav>

      {/* Search bar */}
      <div ref={wrapperRef} className="relative flex-1 max-w-sm mx-4">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search cards…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none w-full"
          />
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
            {results.length === 0 ? (
              <p className="text-sm text-gray-400 px-4 py-3">No results found</p>
            ) : (
              results.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleSelect(card)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">{card.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {card.list.board.workspace.name} › {card.list.board.name} › {card.list.name}
                  </p>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-xs font-bold text-blue-600">{userName.charAt(0).toUpperCase()}</span>
        </div>
        <span className="text-sm text-gray-700 font-medium hidden sm:block">{userName}</span>
        <button onClick={onLogout} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
          Logout
        </button>
      </div>
    </header>
  );
}