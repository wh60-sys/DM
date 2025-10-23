// src/pages/Login.jsx (REVISI - Menggunakan ROLE_NAME_MAP)
import { useState } from "react";
import { useAuth, ROLE_NAME_MAP } from "../context/AuthContext"; // <-- Import ROLE_NAME_MAP
import { useNavigate } from "react-router-dom";

// Daftar role yang diizinkan untuk dipilih oleh user saat pendaftaran.
// Role yang tersedia didapat dari keys ROLE_NAME_MAP.
const AVAILABLE_ROLES = Object.keys(ROLE_NAME_MAP).map(Number); // [1, 2, ..., 13]

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [chosenRole, setChosenRole] = useState(AVAILABLE_ROLES[0]);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isSignUp) {
        const result = await signUp(email, password, chosenRole);
        alert(result.message);
        setIsSignUp(false);
      } else {
        await signIn(email, password);
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setEmail("");
    setPassword("");
    setChosenRole(AVAILABLE_ROLES[0]);
  };

  return (
    <>
      <div>Login Page</div>

      {/* LOGIN FORM */}
      <div>
        <div>
          <div>
            <h1>MyApp</h1>
            <p>{isSignUp ? "Buat akun baru" : "Masuk ke akun Anda"}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* ... (Input Email & Password sama) ... */}
            <div>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Anda"
                required
              />
            </div>

            <div>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>

            {isSignUp && (
              <div>
                <label>Pilih Role Anda</label>
                <select
                  value={chosenRole}
                  onChange={(e) => setChosenRole(e.target.value)}
                  required
                >
                  {AVAILABLE_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role} {ROLE_NAME_MAP[role]}
                      {/* <-- Menggunakan ROLE_NAME_MAP */}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && <div>{error}</div>}

            <button type="submit">{isSignUp ? "Daftar" : "Masuk"}</button>
          </form>

          <p>
            {isSignUp ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <button type="button" onClick={handleToggleSignUp}>
              {isSignUp ? "Masuk di sini" : "Daftar di sini"}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
