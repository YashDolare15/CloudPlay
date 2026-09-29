import { useEffect, useState } from "react";
import {
  getGames,
  startSession,
  getMySession,
  endSession,
} from "../services/api";

function Dashboard({ user, onLogout }) {
  const [games, setGames] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [gameData, sessionData] = await Promise.all([
        getGames(),
        getMySession(),
      ]);

      setGames(gameData.games || []);

      if (sessionData.active) {
        setSession(sessionData.session);
      } else {
        setSession(null);
      }
    } catch (err) {
      setError(err.message || "Unable to load CloudPlay data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  /*
   * Calculate remaining session time.
   */
  useEffect(() => {
    if (!session?.expires_at) {
      setTimeLeft(0);
      return;
    }

    function updateTimer() {
      const expiresAt = new Date(session.expires_at).getTime();
      const now = Date.now();

      const remaining = Math.max(
        0,
        Math.floor((expiresAt - now) / 1000)
      );

      setTimeLeft(remaining);

      if (remaining <= 0) {
        setSession(null);
      }
    }

    updateTimer();

    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [session]);

  async function handleStartSession() {
    setActionLoading(true);
    setError("");

    try {
      const data = await startSession();

      setSession(data);
    } catch (err) {
      setError(
        err.message || "Unable to start gaming session."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleEndSession() {
    setActionLoading(true);
    setError("");

    try {
      await endSession();

      setSession(null);
      setTimeLeft(0);
    } catch (err) {
      setError(
        err.message || "Unable to end gaming session."
      );
    } finally {
      setActionLoading(false);
    }
  }

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  const sessionActive = Boolean(session && timeLeft > 0);

  return (
    <div className="app-shell">
      <nav className="navbar">
        <strong>CloudPlay</strong>

        <div className="nav-actions">
          <span>
            {user?.username || "CloudPlay User"}
          </span>

          <button
            className="small-button"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard">

        {/* PAGE HEADING */}
        <div className="page-heading">
          <div className="eyebrow">
            CLOUD GAMING PLATFORM
          </div>

          <h1>
            Welcome, {user?.username || "User"}
          </h1>

          <p>
            Start a gaming session and connect through
            Moonlight.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="message">
            {error}
          </div>
        )}

        {/* GAMING SESSION */}
        <section className="cloud-card">
          <div>
            <div className="card-title">
              Gaming Session
            </div>

            <div className="status">
              <span
                className={`status-dot ${
                  sessionActive ? "running" : ""
                }`}
              />

              {sessionActive
                ? "Session Active"
                : "Available"}
            </div>

            {sessionActive && (
              <div className="spec-grid">

                <div>
                  <span>Time Remaining</span>

                  <strong>
                    {formatTime(timeLeft)}
                  </strong>
                </div>

                <div>
                  <span>Host</span>

                  <strong>
                    Gaming Laptop
                  </strong>
                </div>

              </div>
            )}

            {!sessionActive && (
              <div className="spec-grid">
                <div>
                  <span>Session Duration</span>

                  <strong>
                    1 Hour
                  </strong>
                </div>

                <div>
                  <span>Status</span>

                  <strong>
                    Available
                  </strong>
                </div>
              </div>
            )}
          </div>

          <div className="cloud-actions">

            {!sessionActive && (
              <button
                className="primary-button"
                onClick={handleStartSession}
                disabled={actionLoading || loading}
              >
                {actionLoading
                  ? "Starting..."
                  : "START 1-HOUR SESSION"}
              </button>
            )}

            {sessionActive && (
              <>
                <button
                  className="primary-button"
                  onClick={() => {
                    window.open(
                      "moonlight://",
                      "_blank"
                    );
                  }}
                >
                  OPEN MOONLIGHT
                </button>

                <button
                  className="secondary-button"
                  onClick={handleEndSession}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Ending..."
                    : "EXIT SESSION"}
                </button>
              </>
            )}

            <button
              className="secondary-button"
              onClick={loadData}
              disabled={loading || actionLoading}
            >
              Refresh
            </button>

          </div>
        </section>

        {/* GAMES */}
        <div className="section-heading">
          <h2>CloudPlay Games</h2>

          <p>
            Games available on the CloudPlay gaming
            machine.
          </p>
        </div>

        <div className="game-grid">
          {games.map((game) => (
            <div
              className="game-card"
              key={game.id}
            >
              <div className="game-icon">
                🎮
              </div>

              <h3>
                {game.name}
              </h3>

              <p>
                {game.category}
              </p>

              <button
                className="secondary-button"
                disabled={
                  game.status !== "available" ||
                  !sessionActive
                }
              >
                {game.status === "available"
                  ? sessionActive
                    ? "PLAY"
                    : "START SESSION"
                  : "COMING SOON"}
              </button>
            </div>
          ))}
        </div>

        {/* LAUNCHERS */}
        <div className="section-heading">
          <h2>Your Game Launchers</h2>

          <p>
            Use your own Steam or Epic Games account
            through the gaming machine.
          </p>
        </div>

        <div className="launcher-grid">

          <div className="launcher-card">
            <h3>Steam</h3>

            <p>
              Access your Steam library through
              Moonlight.
            </p>

            <button
              className="secondary-button"
              disabled={!sessionActive}
            >
              OPEN STEAM
            </button>
          </div>

          <div className="launcher-card">
            <h3>Epic Games</h3>

            <p>
              Access your Epic Games library through
              Moonlight.
            </p>

            <button
              className="secondary-button"
              disabled={!sessionActive}
            >
              OPEN EPIC
            </button>
          </div>

        </div>

      </main>
    </div>
  );
}

export default Dashboard;