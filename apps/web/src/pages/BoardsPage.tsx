import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { apiFetch } from "../lib/api";

type Board = { id: string; name: string; createdAt: string };
type Props = { onLogout: () => void };

export function BoardsPage({ onLogout }: Props) {
  const navigate = useNavigate();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const location = useLocation();
  const workspaceName = (location.state as any)?.workspaceName ?? "Workspace";

  const [boards, setBoards] = useState<Board[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`/api/workspaces/${workspaceId}/boards`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Failed to load boards"); return; }
        setBoards(data.boards);
      })
      .catch(() => setError("Could not reach API"))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/workspaces/${workspaceId}/boards`, {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create board"); return; }
      setBoards((prev) => [data.board, ...prev]);
      setName("");
    } catch {
      setError("Could not reach API");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(e: React.MouseEvent, boardId: string) {
    e.stopPropagation();
    if (!window.confirm("Delete this board and all its lists and cards?")) return;
    setError(null);
    setDeleting(boardId);
    try {
      const res = await apiFetch(`/api/workspaces/${workspaceId}/boards/${boardId}`, { method: "DELETE" });
      if (!res.ok) { setError("Failed to delete board"); return; }
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
    } catch {
      setError("Could not reach API");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/workspaces")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Workspaces
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-800">{workspaceName}</span>
        </div>
        <button
          onClick={onLogout}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg"
        >
          Log out
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{workspaceName}</h2>
          <p className="text-sm text-gray-400 mt-0.5">Select a board or create a new one</p>
        </div>

        <form onSubmit={handleCreate} className="flex gap-3 mb-10">
          <input
            type="text"
            placeholder="New board name…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm whitespace-nowrap"
          >
            {creating ? "Creating…" : "+ New board"}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <p className="text-gray-400 text-sm">Loading boards…</p>
          </div>
        )}

        {!loading && boards.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No boards yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first board to start organizing</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((b) => (
            <div
              key={b.id}
              onClick={() =>
                navigate(`/workspaces/${workspaceId}/boards/${b.id}`, {
                  state: { boardName: b.name, workspaceName },
                })
              }
              className="relative bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-50 group-hover:bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">{b.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Click to open</p>
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(e, b.id)}
                disabled={deleting === b.id}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                title="Delete board"
              >
                {deleting === b.id ? (
                  <span className="text-xs">…</span>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}