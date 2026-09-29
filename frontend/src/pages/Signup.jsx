import { useState } from "react";
import {
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from "amazon-cognito-identity-js";

const userPool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
});

function Signup({ onSignupComplete, onLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [confirmationCode, setConfirmationCode] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSignup(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();
    const cleanName = name.trim();

    const attributes = [
      new CognitoUserAttribute({
        Name: "email",
        Value: cleanEmail,
      }),
      new CognitoUserAttribute({
        Name: "name",
        Value: cleanName,
      }),
    ];

    userPool.signUp(
      cleanUsername,
      password,
      attributes,
      null,
      (err) => {
        setLoading(false);

        if (err) {
          setError(err.message || "Signup failed");
          return;
        }

        // Save username for the verification step
        localStorage.setItem(
          "cloudplay_signup_username",
          cleanUsername
        );

        setNeedsVerification(true);
        setMessage(
          "Account created. Check your email for the verification code."
        );
      }
    );
  }

  function verifyAccount(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    const savedUsername =
      localStorage.getItem("cloudplay_signup_username") ||
      username.trim();

    if (!savedUsername) {
      setLoading(false);
      setError(
        "Username not found. Please create the account again."
      );
      return;
    }

    const cognitoUser = new CognitoUser({
      Username: savedUsername,
      Pool: userPool,
    });

    cognitoUser.confirmRegistration(
      confirmationCode.trim(),
      true,
      (err) => {
        setLoading(false);

        if (err) {
          setError(err.message || "Verification failed");
          return;
        }

        localStorage.removeItem(
          "cloudplay_signup_username"
        );

        setMessage(
          "Email verified successfully. You can now sign in."
        );

        setTimeout(() => {
          onSignupComplete();
        }, 1000);
      }
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">

        {/* LEFT SIDE - SAME AS LOGIN */}
        <div className="login-brand">
          <div className="brand-icon">☁</div>

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

        {/* RIGHT SIDE */}
        <div className="login-card">

          {!needsVerification ? (
            <>
              <div className="login-header">
                <h2>Create your account</h2>

                <p>
                  Create your CloudPlay account to access
                  your cloud gaming infrastructure.
                </p>
              </div>

              <form onSubmit={handleSignup}>

                {/* USERNAME */}
                <div className="form-group">
                  <label>Username</label>

                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div className="form-group">
                  <label>Email</label>

                  <div className="input-wrapper">
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                {/* NAME */}
                <div className="form-group">
                  <label>Name</label>

                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="form-group">
                  <label>Password</label>

                  <div className="input-wrapper">
                    <input
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="login-error">
                    ⚠ {error}
                  </div>
                )}

                {message && (
                  <div className="login-success">
                    ✓ {message}
                  </div>
                )}

                <button
                  className="login-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Account"}
                </button>
              </form>

              <div className="auth-switch">
                <span>Already have an account?</span>

                <button
                  type="button"
                  onClick={onLogin}
                >
                  Sign In
                </button>
              </div>

              <div className="login-footer">
                <div className="secure-login">
                  🔒 Authentication secured by Amazon Cognito
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="login-header">
                <h2>Verify your email</h2>

                <p>
                  Enter the verification code sent to your
                  email address.
                </p>
              </div>

              <form onSubmit={verifyAccount}>

                <div className="form-group">
                  <label>Verification code</label>

                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Enter verification code"
                      value={confirmationCode}
                      onChange={(e) =>
                        setConfirmationCode(e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="login-error">
                    ⚠ {error}
                  </div>
                )}

                {message && (
                  <div className="login-success">
                    ✓ {message}
                  </div>
                )}

                <button
                  className="login-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Verifying..."
                    : "Verify Account"}
                </button>
              </form>

              <div className="auth-switch">
                <span>Already verified?</span>

                <button
                  type="button"
                  onClick={onLogin}
                >
                  Sign In
                </button>
              </div>

              <div className="login-footer">
                <div className="secure-login">
                  🔒 Authentication secured by Amazon Cognito
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default Signup;