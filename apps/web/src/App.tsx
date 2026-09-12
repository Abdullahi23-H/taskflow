import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { apiFetch } from "./lib/api";
import { clearToken, getToken } from "./lib/auth-storage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { WorkspacesPage } from "./pages/WorkspacesPage";
import { BoardsPage } from "./pages/BoardsPage";
import { BoardView } from "./pages/BoardView";
import { DashboardPage } from "./pages/DashboardPage";
import { Navbar } from "./components/Navbar";


type User = { id: string; email: string; name: string };
function ProtectedLayout({user,onLogout,children}:{user:User; onLogout:()=>void; children:React.ReactNode}) {
  return(
    <>
    <Navbar userName={user.name} onLogout={onLogout}/>
  {children}
    </>
  )
}
function App() {
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
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? <Navigate to="/dashboard" replace /> : <LoginPage onSuccess={setUser} />
        }
      />
      <Route
        path="/register"
        element={
          user ? <Navigate to="/dashboard" replace /> : <RegisterPage />
        }
      />
      <Route
        path="/workspaces"
        element={
          user ? (
            <ProtectedLayout user={user} onLogout={handleLogout}>
              <WorkspacesPage userName={user.name} userEmail={user.email} />
            </ProtectedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/workspaces/:workspaceId"
        element={user ? <ProtectedLayout user={user} onLogout={handleLogout}><BoardsPage /></ProtectedLayout> : <Navigate to="/login" replace />}      />
      <Route
        path="/workspaces/:workspaceId/boards/:boardId"
        element={user ? <ProtectedLayout user={user} onLogout={handleLogout}><BoardView /></ProtectedLayout> : <Navigate to="/login" replace />}
      />
      <Route
        path="/dashboard"
        element={user ? <ProtectedLayout user={user} onLogout={handleLogout}><DashboardPage /></ProtectedLayout> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default App;