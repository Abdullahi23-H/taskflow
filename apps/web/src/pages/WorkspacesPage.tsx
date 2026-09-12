import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

type Workspace = { id: string; name: string; createdAt: string };
type Props = { userName: string; userEmail: string };

export function WorkspacesPage(_props: Props) {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/api/workspaces")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Failed to load"); return; }
        setWorkspaces(data.workspaces);
      })
      .catch(() => setError("Could not reach API"))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await apiFetch("/api/workspaces", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create"); return; }
      setWorkspaces((prev) => [data.workspace, ...prev]);
      setName("");
    } catch {
      setError("Could not reach API");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!window.confirm("Delete this workspace and all its boards?")) return;
    setError(null);
    setDeleting(id);
    try {
      const res = await apiFetch(`/api/workspaces/${id}`, { method: "DELETE" });
      if (!res.ok) { setError("Failed to delete workspace"); return; }
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    } catch {
      setError("Could not reach API");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Workspaces</h2>
            <p className="text-sm text-gray-400 mt-0.5">Select a workspace or create a new one</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="flex gap-3 mb-10">
          <input
            type="text"
            placeholder="New workspace name…"
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
            {creating ? "Creating…" : "+ New workspace"}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <p className="text-gray-400 text-sm">Loading workspaces…</p>
          </div>
        )}

        {!loading && workspaces.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No workspaces yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first workspace to get started</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              onClick={() => navigate(`/workspaces/${ws.id}`, { state: { workspaceName: ws.name } })}
              className="relative bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">{ws.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Click to open</p>
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(e, ws.id)}
                disabled={deleting === ws.id}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                title="Delete workspace"
              >
                {deleting === ws.id ? (
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