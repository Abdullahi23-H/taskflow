import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

type Stats = {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
};

type DashboardCard = {
  id: string;
  title: string;
  status: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string | null;
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

const priorityDot: Record<string, string> = {
  LOW: "bg-gray-400",
  MEDIUM: "bg-yellow-400",
  HIGH: "bg-red-500",
};

const statusColor: Record<string, string> = {
  todo: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

export function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [cards, setCards] = useState<DashboardCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "todo" | "in_progress" | "done" | "overdue">("all");

  useEffect(() => {
    apiFetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setCards(data.cards);
      })
      .catch(() => setError("Could not reach API"))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const filtered = cards.filter((c) => {
    if (filter === "overdue") return c.dueDate && new Date(c.dueDate) < now && c.status !== "done";
    if (filter === "all") return true;
    return c.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
           {[
  { label: "Total", value: stats.total, color: "text-blue-600", border: "border-t-blue-500", icon: (
    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
  )},
  { label: "To do", value: stats.todo, color: "text-indigo-600", border: "border-t-indigo-400", icon: (
    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth={2} /></svg>
  )},
  { label: "In progress", value: stats.inProgress, color: "text-blue-600", border: "border-t-blue-400", icon: (
    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  )},
  { label: "Done", value: stats.done, color: "text-green-600", border: "border-t-green-400", icon: (
    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  )},
  { label: "Overdue", value: stats.overdue, color: "text-red-600", border: "border-t-red-400", icon: (
    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
  )},
].map((s) => (
  <div key={s.label} className={`bg-white border border-gray-200 border-t-[4px] ${s.border} rounded-2xl p-4 text-center`}>
    <div className="flex justify-center mb-2">{s.icon}</div>
    <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
  </div>
))}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "todo", "in_progress", "done", "overdue"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                filter === f
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {f === "in_progress" ? "In progress" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Cards list */}
        {loading ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-sm">No cards found.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((card) => {
              const isOverdue = card.dueDate && new Date(card.dueDate) < now && card.status !== "done";
              return (
                <div
                  key={card.id}
                  onClick={() =>
                    navigate(
                      `/workspaces/${card.list.board.workspace.id}/boards/${card.list.board.id}`,
                      { state: { boardName: card.list.board.name, workspaceName: card.list.board.workspace.name } }
                    )
                  }
                  className="bg-white border border-gray-200 rounded-2xl px-5 py-5 flex items-center gap-4 cursor-pointer hover:bg-blue-50 hover:shadow-sm transition-all border-l-4"
style={{ borderLeftColor: card.priority === "HIGH" ? "#ef4444" : card.priority === "MEDIUM" ? "#facc15" : "#9ca3af" }}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[card.priority]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{card.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {card.list.board.workspace.name} › {card.list.board.name} › {card.list.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[card.status] ?? statusColor.todo}`}>
                      {card.status.replace("_", " ")}
                    </span>
                    {card.dueDate && (
  isOverdue ? (
    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-red-500 text-white">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      {new Date(card.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
    </span>
  ) : (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
      {new Date(card.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
    </span>
  )
)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}