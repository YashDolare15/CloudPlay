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
  const [moonlightLoading, setMoonlightLoading] = useState(false);
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
   * Session countdown timer
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

  /*
   * Start CloudPlay 1-hour session
   */
  async function handleStartSession() {
    setActionLoading(true);
    setError("");

    try {
      const data = await startSession();

      setSession(data);
      setTimeLeft(60 * 60);
    } catch (err) {
      setError(
        err.message || "Unable to start gaming session."
      );
    } finally {
      setActionLoading(false);
    }
  }

  /*
   * End CloudPlay session
   */
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

  /*
   * Open Moonlight through the local CloudPlay Launcher.
   *
   * The launcher runs on the CLIENT laptop:
   *
   * http://127.0.0.1:8765
   *
   * It then starts Moonlight.exe and connects
   * to the gaming PC through Tailscale.
   */
  async function handleOpenMoonlight() {
    if (!sessionActive) {
      setError("Start a CloudPlay session first.");
      return;
    }

    setMoonlightLoading(true);
    setError("");

    try {
      const launcherUrl =
        "http://127.0.0.1:8765/connect";

      console.log(
        "Connecting to CloudPlay Launcher:",
        launcherUrl
      );

      const response = await fetch(launcherUrl, {
        method: "GET",
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error(
          `CloudPlay Launcher returned HTTP ${response.status}`
        );
      }

      const data = await response.json();

      console.log("CloudPlay Launcher response:", data);

      if (!data.success) {
        throw new Error(
          data.error || "Unable to start Moonlight."
        );
      }

      console.log(
        "Moonlight launch requested successfully."
      );
    } catch (err) {
      console.error(
        "CloudPlay Launcher connection error:",
        err
      );

      setError(
        "Unable to connect to the CloudPlay Launcher. Make sure launcher.py is running on this laptop at http://127.0.0.1:8765 and try again."
      );
    } finally {
      setMoonlightLoading(false);
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

  const sessionActive = Boolean(
    session && timeLeft > 0
  );

  return (
    <div className="app-shell">

      {/* NAVBAR */}
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


        {/* ERROR MESSAGE */}
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


            {/* ACTIVE SESSION INFORMATION */}
            {sessionActive && (

              <div className="spec-grid">

                <div>

                  <span>
                    Time Remaining
                  </span>

                  <strong>
                    {formatTime(timeLeft)}
                  </strong>

                </div>


                <div>

                  <span>
                    Host
                  </span>

                  <strong>
                    Gaming Laptop
                  </strong>

                </div>

              </div>

            )}


            {/* AVAILABLE SESSION INFORMATION */}
            {!sessionActive && (

              <div className="spec-grid">

                <div>

                  <span>
                    Session Duration
                  </span>

                  <strong>
                    1 Hour
                  </strong>

                </div>


                <div>

                  <span>
                    Status
                  </span>

                  <strong>
                    Available
                  </strong>

                </div>

              </div>

            )}

          </div>


          {/* ACTION BUTTONS */}
          <div className="cloud-actions">

            {/* START SESSION */}
            {!sessionActive && (

              <button
                className="primary-button"
                onClick={handleStartSession}
                disabled={
                  actionLoading ||
                  loading
                }
              >

                {actionLoading
                  ? "Starting..."
                  : "START 1-HOUR SESSION"}

              </button>

            )}


            {/* ACTIVE SESSION ACTIONS */}
            {sessionActive && (

              <>

                {/* CONNECT TO MOONLIGHT */}
                <button
                  className="primary-button"
                  onClick={handleOpenMoonlight}
                  disabled={
                    actionLoading ||
                    moonlightLoading
                  }
                >

                  {moonlightLoading
                    ? "OPENING MOONLIGHT..."
                    : "OPEN MOONLIGHT"}

                </button>


                {/* EXIT SESSION */}
                <button
                  className="secondary-button"
                  onClick={handleEndSession}
                  disabled={
                    actionLoading ||
                    moonlightLoading
                  }
                >

                  {actionLoading
                    ? "Ending..."
                    : "EXIT SESSION"}

                </button>

              </>

            )}


            {/* REFRESH */}
            <button
              className="secondary-button"
              onClick={loadData}
              disabled={
                loading ||
                actionLoading ||
                moonlightLoading
              }
            >
              Refresh
            </button>

          </div>

        </section>


        {/* GAMES */}
        <div className="section-heading">

          <h2>
            CloudPlay Games
          </h2>

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


        {/* GAME LAUNCHERS */}
        <div className="section-heading">

          <h2>
            Your Game Launchers
          </h2>

          <p>
            Use your own Steam or Epic Games account
            through the gaming machine.
          </p>

        </div>


        <div className="launcher-grid">


          {/* STEAM */}
          <div className="launcher-card">

            <h3>
              Steam
            </h3>

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


          {/* EPIC GAMES */}
          <div className="launcher-card">

            <h3>
              Epic Games
            </h3>

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