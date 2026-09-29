import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import { getCurrentUser } from "./services/api";

function App() {
  const [page, setPage] = useState("loading");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("cloudplay_access_token");

    if (!token) {
      setPage("login");
      return;
    }

    getCurrentUser()
      .then((data) => {
        setUser(data);
        setPage("dashboard");
      })
      .catch(() => {
        localStorage.removeItem("cloudplay_access_token");
        localStorage.removeItem("cloudplay_id_token");
        setPage("login");
      });
  }, []);

  function handleLogin(userData) {
    setUser(userData);
    setPage("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("cloudplay_access_token");
    localStorage.removeItem("cloudplay_id_token");
    setUser(null);
    setPage("login");
  }

  if (page === "loading") {
    return <div className="loading-screen">Loading CloudPlay...</div>;
  }

  if (page === "login") {
    return (
      <Login
        onLogin={handleLogin}
        onSignup={() => setPage("signup")}
      />
    );
  }

  if (page === "signup") {
    return (
      <Signup
        onSignupComplete={() => setPage("login")}
        onLogin={() => setPage("login")}
      />
    );
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;