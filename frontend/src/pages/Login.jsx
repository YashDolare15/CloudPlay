import { useState } from "react";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from "amazon-cognito-identity-js";

const userPool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
});

function Login({ onLogin, onSignup }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const cleanUsername = username.trim();

    // Basic validation
    if (!cleanUsername) {
      setLoading(false);
      setError("Please enter your username.");
      return;
    }

    if (!password) {
      setLoading(false);
      setError("Please enter your password.");
      return;
    }

    // Remove any old login tokens before trying again
    localStorage.removeItem("cloudplay_access_token");
    localStorage.removeItem("cloudplay_id_token");

    // Debug information
    console.log("========== CLOUDPLAY LOGIN ==========");
    console.log("Username being sent to Cognito:", cleanUsername);
    console.log("User Pool ID:", import.meta.env.VITE_COGNITO_USER_POOL_ID);
    console.log("Client ID:", import.meta.env.VITE_COGNITO_CLIENT_ID);
    console.log("=====================================");

    /*
     * Cognito authentication details
     *
     * Your Cognito User Pool is configured for
     * USERNAME sign-in, so we must send the
     * Cognito username here.
     */
    const authenticationDetails =
      new AuthenticationDetails({
        Username: cleanUsername,
        Password: password,
      });

    /*
     * Create Cognito user using the exact username
     */
    const cognitoUser = new CognitoUser({
      Username: cleanUsername,
      Pool: userPool,
    });

    /*
     * Authenticate with Cognito
     */
    cognitoUser.authenticateUser(
      authenticationDetails,
      {
        /*
         * ======================================
         * LOGIN SUCCESS
         * ======================================
         */
        onSuccess: (session) => {
          console.log("CloudPlay login successful.");

          const accessToken =
            session
              .getAccessToken()
              .getJwtToken();

          const idToken =
            session
              .getIdToken()
              .getJwtToken();

          /*
           * Store Cognito tokens
           */
          localStorage.setItem(
            "cloudplay_access_token",
            accessToken
          );

          localStorage.setItem(
            "cloudplay_id_token",
            idToken
          );

          setLoading(false);

          /*
           * Send user information to App.jsx
           */
          onLogin({
            username: cognitoUser.getUsername(),
          });
        },

        /*
         * ======================================
         * LOGIN FAILED
         * ======================================
         */
        onFailure: (err) => {
          console.error(
            "CloudPlay Cognito login error:",
            err
          );

          setLoading(false);

          /*
           * Handle specific Cognito errors
           */
          if (
            err?.code ===
            "UserNotConfirmedException"
          ) {
            setError(
              "Your account is not verified yet. Please verify your email first."
            );
            return;
          }

          if (
            err?.code ===
            "NotAuthorizedException"
          ) {
            setError(
              "Incorrect username or password."
            );
            return;
          }

          if (
            err?.code ===
            "UserNotFoundException"
          ) {
            setError(
              "User not found. Check your username."
            );
            return;
          }

          if (
            err?.code ===
            "PasswordResetRequiredException"
          ) {
            setError(
              "Password reset is required for this account."
            );
            return;
          }

          setError(
            err?.message || "Login failed."
          );
        },

        /*
         * ======================================
         * NEW PASSWORD REQUIRED
         * ======================================
         */
        newPasswordRequired: () => {
          setLoading(false);

          setError(
            "A new password is required for this account."
          );
        },
      }
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">

        {/* =====================================
            LEFT BRAND SECTION
            ===================================== */}

        <div className="login-brand">

          <div className="brand-icon">
            ☁
          </div>

          <h1>
            Cloud<span>Play</span>
          </h1>

          <p className="brand-tagline">
            Your personal cloud gaming infrastructure.
          </p>

          <div className="brand-features">

            <div>
              <span>⚡</span>
              <p>On-demand cloud PC</p>
            </div>

            <div>
              <span>☁</span>
              <p>Persistent cloud infrastructure</p>
            </div>

            <div>
              <span>🎮</span>
              <p>Play your own games</p>
            </div>

          </div>

        </div>

        {/* =====================================
            LOGIN CARD
            ===================================== */}

        <div className="login-card">

          <div className="login-header">

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to access your CloudPlay
              infrastructure.
            </p>

          </div>

          <form onSubmit={handleLogin}>

            {/* =================================
                USERNAME
                ================================= */}

            <div className="form-group">

              <label>
                Username
              </label>

              <div className="input-wrapper">

                <input
                  type="text"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  autoComplete="username"
                  required
                />

              </div>

            </div>

            {/* =================================
                PASSWORD
                ================================= */}

            <div className="form-group">

              <label>
                Password
              </label>

              <div className="input-wrapper">

                <input
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="current-password"
                  required
                />

              </div>

            </div>

            {/* =================================
                ERROR
                ================================= */}

            {error && (
              <div className="login-error">
                ⚠ {error}
              </div>
            )}

            {/* =================================
                SIGN IN BUTTON
                ================================= */}

            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>

          </form>

          {/* =================================
              CREATE ACCOUNT
              ================================= */}

          <div className="auth-switch">

            <span>
              Don't have an account?
            </span>

            <button
              type="button"
              onClick={onSignup}
            >
              Create account
            </button>

          </div>

          {/* =================================
              FOOTER
              ================================= */}

          <div className="login-footer">

            <div className="secure-login">
              🔒 Authentication secured by
              Amazon Cognito
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;