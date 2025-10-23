// src/context/AuthContext.jsx (REVISI - Menambah ROLE_NAME_MAP)
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Akun KHUSUS Super Admin (Akses Penuh berdasarkan email)
const SPECIAL_ADMIN_EMAIL = "warehouseppic60@gmail.com";

// ====================================================================
// DEFINISI NAMA ROLE (Customizable)
// ====================================================================
export const ROLE_NAME_MAP = {
  1: "",
  2: "",
  3: "",
  4: "",
  5: "",
  6: "",
  7: "",
  8: "",
  9: "",
  10: "",
  11: "",
  12: "",
  13: "",
  14: "",
  15: "",
  // Tambahkan Role custom lainnya di sini jika diperlukan
};
// ====================================================================

// Akun yang DITETAPKAN (Hardcoded)
const DUMMY_USERS = [
  // Akun ini adalah Super Admin, Role 10 di sini adalah nilai awal
  { email: SPECIAL_ADMIN_EMAIL, password: "Sriboga@2022", role: 10 },
  { email: "user1@app.com", password: "password", role: 1 },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("currentUser");
    const loggedInRole = localStorage.getItem("currentUserRole");
    if (loggedInUser && loggedInRole) {
      setUser(JSON.parse(loggedInUser));
      setUserRole(parseInt(loggedInRole, 10));
    }
    setLoading(false);
  }, []);

  // ... (findUserByCredentials, signIn, signUp sama seperti sebelumnya)

  const findUserByCredentials = (email, password) => {
    // 1. Cek di Hardcoded DUMMY_USERS
    const foundDummy = DUMMY_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (foundDummy) return foundDummy;

    // 2. Cek di LocalStorage (untuk user yang self-registered)
    const storedUser = localStorage.getItem(email);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.password === password) {
        return parsedUser;
      }
    }
    return null;
  };

  const signIn = async (email, password) => {
    const foundUser = findUserByCredentials(email, password);

    if (foundUser) {
      const userInfo = { email: foundUser.email, role: foundUser.role };
      setUser(userInfo);
      setUserRole(foundUser.role);
      localStorage.setItem("currentUser", JSON.stringify(userInfo));
      localStorage.setItem("currentUserRole", foundUser.role);
      return userInfo;
    } else {
      throw new Error(
        "Email atau password salah. Coba user1@app.com (password: password) atau admin (warehouseppic60@gmail.com, password: Sriboga@2022)."
      );
    }
  };

  const signUp = async (email, password, chosenRole) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (
          DUMMY_USERS.some((u) => u.email === email) ||
          localStorage.getItem(email)
        ) {
          reject(new Error("Email sudah terdaftar. Silakan login."));
        }

        const assignedRole = parseInt(chosenRole, 10);

        const newUser = { email, password, role: assignedRole };
        localStorage.setItem(email, JSON.stringify(newUser));

        // Menggunakan ROLE_NAME_MAP untuk pesan sukses
        const roleName = ROLE_NAME_MAP[assignedRole] || `Role ${assignedRole}`;
        resolve({
          email,
          message: `Pendaftaran berhasil. Anda ditetapkan sebagai **${roleName}** (Role ${assignedRole}).`,
        });
      }, 500);
    });
  };

  const signOut = async () => {
    setUser(null);
    setUserRole(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentUserRole");
  };

  const value = {
    user,
    userRole,
    loading,
    signIn,
    signUp,
    signOut,
    SPECIAL_ADMIN_EMAIL,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
// Catatan: ROLE_NAME_MAP diekspor secara terpisah di bagian atas file
