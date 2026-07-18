import { useEffect, useState } from "react";
import { apiFetch } from "./lib/api";
import { clearToken, getToken } from "./lib/auth-storage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { WorkspacesPage } from "./pages/WorkspacesPage";

type User = { id: string; email: string; name: string };
type View = "login" | "register";

function App() {
  const [view, setView] = useState<View>("login");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    apiFetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUser(data.user);
      })
      .catch(() => { clearToken(); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    clearToken();
    setUser(null);
    setView("login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    );
  }

  if (user) {
    return <WorkspacesPage userName={user.name} userEmail={user.email} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">TaskFlow</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your work, your way</p>
        </div>
        {view === "login" ? (
          <LoginPage onSuccess={setUser} onGoRegister={() => setView("register")} />
        ) : (
          <RegisterPage onGoLogin={() => setView("login")} />
        )}
      </div>
    </div>
  );
}

export default App;
