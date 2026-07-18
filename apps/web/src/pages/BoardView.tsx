import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

type Card = { id: string; title: string; status: string; position: number };
type List = { id: string; name: string; position: number; cards?: Card[] };

type Props = {
  workspaceId: string;
  boardId: string;
  boardName: string;
  onBack: () => void;
};

export function BoardView({ workspaceId, boardId, boardName, onBack }: Props) {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");
  const [creatingList, setCreatingList] = useState(false);
  const [newCardTitles, setNewCardTitles] = useState<Record<string, string>>({});
  const [addingCardTo, setAddingCardTo] = useState<string | null>(null);
  const [deletingList, setDeletingList] = useState<string | null>(null);
  const [deletingCard, setDeletingCard] = useState<string | null>(null);

  const base = `/api/workspaces/${workspaceId}/boards/${boardId}`;

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch(`${base}/lists`);
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Failed to load lists"); return; }
        const listsWithCards: List[] = await Promise.all(
          data.lists.map(async (list: List) => {
            const cRes = await apiFetch(`${base}/lists/${list.id}/cards`);
            const cData = await cRes.json();
            return { ...list, cards: cRes.ok ? cData.cards : [] };
          })
        );
        setLists(listsWithCards);
      } catch {
        setError("Could not reach API");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [base]);

  async function handleCreateList(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newListName.trim()) return;
    setCreatingList(true);
    try {
      const res = await apiFetch(`${base}/lists`, {
        method: "POST",
        body: JSON.stringify({ name: newListName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create list"); return; }
      setLists((prev) => [...prev, { ...data.list, cards: [] }]);
      setNewListName("");
    } catch {
      setError("Could not reach API");
    } finally {
      setCreatingList(false);
    }
  }

  async function handleDeleteList(listId: string) {
    if (!window.confirm("Delete this list and all its cards?")) return;
    setError(null);
    setDeletingList(listId);
    try {
      const res = await apiFetch(`${base}/lists/${listId}`, { method: "DELETE" });
      if (!res.ok) { setError("Failed to delete list"); return; }
      setLists((prev) => prev.filter((l) => l.id !== listId));
    } catch {
      setError("Could not reach API");
    } finally {
      setDeletingList(null);
    }
  }

  async function handleCreateCard(listId: string) {
    const title = (newCardTitles[listId] ?? "").trim();
    if (!title) return;
    try {
      const res = await apiFetch(`${base}/lists/${listId}/cards`, {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create card"); return; }
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId ? { ...l, cards: [...(l.cards ?? []), data.card] } : l
        )
      );
      setNewCardTitles((prev) => ({ ...prev, [listId]: "" }));
      setAddingCardTo(null);
    } catch {
      setError("Could not reach API");
    }
  }

  async function handleDeleteCard(listId: string, cardId: string) {
    setError(null);
    setDeletingCard(cardId);
    try {
      const res = await apiFetch(`${base}/lists/${listId}/cards/${cardId}`, {
        method: "DELETE",
      });
      if (!res.ok) { setError("Failed to delete card"); return; }
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId
            ? { ...l, cards: (l.cards ?? []).filter((c) => c.id !== cardId) }
            : l
        )
      );
    } catch {
      setError("Could not reach API");
    } finally {
      setDeletingCard(null);
    }
  }

  const statusColor: Record<string, string> = {
    todo: "bg-gray-200 text-gray-600",
    in_progress: "bg-blue-100 text-blue-700",
    done: "bg-green-100 text-green-700",
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#1d2b3a" }}>
      {/* Navbar */}
      <header className="flex items-center gap-3 px-6 py-4 flex-shrink-0" style={{ background: "#17202b" }}>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Boards
        </button>
        <span className="text-gray-600">›</span>
        <h1 className="text-sm font-semibold text-white">{boardName}</h1>
        <span className="ml-auto text-xs text-gray-500">
          {lists.length} lists · {lists.reduce((a, l) => a + (l.cards?.length ?? 0), 0)} cards
        </span>
      </header>

      {error && (
        <div className="mx-6 mt-3 bg-red-900/40 border border-red-700/50 rounded-xl px-4 py-3">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Loading board…</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-4 px-6 py-6 overflow-x-auto items-start">

          {lists.map((list) => (
            <div
              key={list.id}
              className="w-72 flex-shrink-0 rounded-2xl flex flex-col group/list"
              style={{ background: "#243447" }}
            >
              {/* List header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <h3 className="text-sm font-semibold text-gray-200">{list.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">
                    {list.cards?.length ?? 0}
                  </span>
                  <button
                    onClick={() => handleDeleteList(list.id)}
                    disabled={deletingList === list.id}
                    className="opacity-0 group-hover/list:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/20 transition-all"
                    title="Delete list"
                  >
                    {deletingList === list.id ? (
                      <span className="text-xs">…</span>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 px-3 pb-2 min-h-[40px]">
                {(list.cards ?? []).map((card) => (
                  <div
                    key={card.id}
                    className="bg-white rounded-xl px-3 py-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-default group/card relative"
                  >
                    <p className="text-sm text-gray-800 font-medium leading-snug pr-6">{card.title}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[card.status] ?? statusColor.todo}`}>
                        {card.status.replace("_", " ")}
                      </span>
                    </div>
                    {/* Card delete button */}
                    <button
                      onClick={() => handleDeleteCard(list.id, card.id)}
                      disabled={deletingCard === card.id}
                      className="absolute top-2.5 right-2.5 opacity-0 group-hover/card:opacity-100 w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Delete card"
                    >
                      {deletingCard === card.id ? (
                        <span className="text-xs">…</span>
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Add card */}
              <div className="px-3 pb-3">
                {addingCardTo === list.id ? (
                  <div className="bg-white rounded-xl p-2 shadow-sm">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Card title…"
                      value={newCardTitles[list.id] ?? ""}
                      onChange={(e) =>
                        setNewCardTitles((prev) => ({ ...prev, [list.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateCard(list.id);
                        if (e.key === "Escape") setAddingCardTo(null);
                      }}
                      className="w-full text-sm text-gray-800 px-2 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleCreateCard(list.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Add card
                      </button>
                      <button
                        onClick={() => setAddingCardTo(null)}
                        className="text-gray-400 hover:text-gray-600 text-xs px-2 py-1.5 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingCardTo(list.id)}
                    className="w-full flex items-center gap-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 px-3 py-2 rounded-xl transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add a card
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add list */}
          <div className="w-72 flex-shrink-0">
            <form
              onSubmit={handleCreateList}
              className="rounded-2xl p-4 flex flex-col gap-3"
              style={{ background: "#243447aa" }}
            >
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Add a list</p>
              <input
                type="text"
                placeholder="List name…"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                required
                maxLength={100}
                className="text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                style={{ background: "#17202b", border: "1px solid #2e4057" }}
              />
              <button
                type="submit"
                disabled={creatingList}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {creatingList ? "Adding…" : "+ Add list"}
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}