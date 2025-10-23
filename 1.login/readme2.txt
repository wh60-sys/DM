================================================================================
DOKUMENTASI IMPLEMENTASI ROLE-BASED ACCESS CONTROL (RBAC) DAN SUPER ADMIN OVERRIDE
Project: [Nama Proyek Anda]
Framework: React (Vite)
Tanggal: 2025-10-23
================================================================================

TUJUAN:
1. Menerapkan sistem autentikasi dasar (Login, Logout, Sign Up).
2. Mengizinkan pendaftaran mandiri dengan semua pilihan Role (1 hingga 13, termasuk Role 10).
3. Membatasi akses Dashboard berdasarkan Nomor Role yang dipilih pengguna.
4. Membuat pengecualian/Override: Satu email admin khusus (warehouseppic60@gmail.com) memiliki akses ke SEMUA halaman, terlepas dari Role yang dipilihnya.
5. Menggunakan Nama Role kustom yang mudah diubah.

--------------------------------------------------------------------------------
LANGKAH 1: INISIALISASI PROYEK VITE & INSTALASI DEPENDENSI
--------------------------------------------------------------------------------

1. BUAT DIREKTORI PROYEK:
   (Lakukan di Terminal/Command Prompt)
   $ npm create vite@latest

   - Project name: my-react-app
   - Select framework: React
   - Select variant: JavaScript

2. MASUK KE DIREKTORI & INSTAL DEPENDENSI:
   $ cd my-react-app
   $ npm install

3. INSTALASI REACT ROUTER DOM (Untuk Navigasi Halaman):
   $ npm install react-router-dom

4. SIAPKAN STRUKTUR FILE:
   Buat struktur dasar di folder 'src':
   - src/context/AuthContext.jsx
   - src/pages/Login.jsx
   - src/pages/Dashboard.jsx
   - src/main.jsx (Konfigurasi Router)
   - src/App.jsx (Router utama)

--------------------------------------------------------------------------------
LANGKAH 2: IMPLEMENTASI AUTHENTICATION CONTEXT (src/context/AuthContext.jsx)
--------------------------------------------------------------------------------

Kode ini mendefinisikan Role kustom, email admin khusus, dan semua logika otentikasi (login, logout, signup).

// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

// Akun KHUSUS Super Admin (Akses Penuh berdasarkan email)
const SPECIAL_ADMIN_EMAIL = 'warehouseppic60@gmail.com';

// ====================================================================
// DEFINISI NAMA ROLE (Customizable)
// ====================================================================
export const ROLE_NAME_MAP = {
    1: "PPIC Dashboard User",
    2: "Order Input Staff",
    3: "Laporan Produksi Checker",
    4: "Master Bahan Baku Admin",
    5: "Master Kemasan Admin",
    6: "Gudang RM/Packing Staff",
    7: "QA/QC Staff",
    8: "Maintenance Team",
    9: "Finance Admin",
    10: "Super Admin Global", 
    11: "Logistik Inbound Staff",
    12: "Logistik Outbound Staff",
    13: "Rekap Harian User",
};
// ====================================================================


// Akun yang DITETAPKAN (Hardcoded)
const DUMMY_USERS = [
  { email: SPECIAL_ADMIN_EMAIL, password: 'Sriboga@2022', role: 10 }, 
  { email: 'user1@app.com', password: 'password', role: 1 }, 
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null) 

  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser')
    const loggedInRole = localStorage.getItem('currentUserRole') 
    if (loggedInUser && loggedInRole) {
      setUser(JSON.parse(loggedInUser))
      setUserRole(parseInt(loggedInRole, 10)) 
    }
    setLoading(false)
  }, [])

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
  }

  const signIn = async (email, password) => {
    const foundUser = findUserByCredentials(email, password);

    if (foundUser) {
      const userInfo = { email: foundUser.email, role: foundUser.role }
      setUser(userInfo)
      setUserRole(foundUser.role)
      localStorage.setItem('currentUser', JSON.stringify(userInfo))
      localStorage.setItem('currentUserRole', foundUser.role)
      return userInfo
    } else {
      throw new Error('Email atau password salah. Coba user1@app.com (password: password) atau admin (warehouseppic60@gmail.com, password: Sriboga@2022).')
    }
  }

  // FUNGSI SIGNUP MENGIZINKAN SEMUA ROLE (TERMASUK ROLE 10)
  const signUp = async (email, password, chosenRole) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (DUMMY_USERS.some(u => u.email === email) || localStorage.getItem(email)) {
            reject(new Error("Email sudah terdaftar. Silakan login."));
        }
        
        const assignedRole = parseInt(chosenRole, 10);
        
        const newUser = { email, password, role: assignedRole };
        localStorage.setItem(email, JSON.stringify(newUser));
        
        const roleName = ROLE_NAME_MAP[assignedRole] || `Role ${assignedRole}`;
        resolve({ email, message: `Pendaftaran berhasil. Anda ditetapkan sebagai **${roleName}** (Role ${assignedRole}).` });
      }, 500);
    });
  };

  const signOut = async () => {
    setUser(null)
    setUserRole(null)
    localStorage.removeItem('currentUser')
    localStorage.removeItem('currentUserRole')
  }

  const value = {
    user,
    userRole, 
    loading,
    signIn,
    signUp,
    signOut, 
    SPECIAL_ADMIN_EMAIL 
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} 
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}

// Catatan: Pastikan ROLE_NAME_MAP diekspor agar dapat diakses oleh Login dan Dashboard.

--------------------------------------------------------------------------------
LANGKAH 3: IMPLEMENTASI HALAMAN LOGIN & SIGNUP (src/pages/Login.jsx)
--------------------------------------------------------------------------------

Kode ini mengizinkan pengguna untuk memilih Role 1 hingga 13 saat mendaftar.

// src/pages/Login.jsx
import { useState } from 'react'
import { useAuth, ROLE_NAME_MAP } from '../context/AuthContext' // Import ROLE_NAME_MAP
import { useNavigate } from 'react-router-dom'

// Daftar role yang diizinkan diambil dari keys ROLE_NAME_MAP.
const AVAILABLE_ROLES = Object.keys(ROLE_NAME_MAP).map(Number); 

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [chosenRole, setChosenRole] = useState(AVAILABLE_ROLES[0]) 
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (isSignUp) {
        const result = await signUp(email, password, chosenRole) 
        alert(result.message); 
        setIsSignUp(false);
      } else {
        await signIn(email, password)
        navigate('/')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleToggleSignUp = () => {
      setIsSignUp(!isSignUp);
      setError('');
      setEmail('');
      setPassword('');
      setChosenRole(AVAILABLE_ROLES[0]);
  }

  return (
    <>
      <div>
        Login Page
      </div>

      <div>
        <div>
          <div>
            <h1>MyApp</h1>
            <p>
              {isSignUp ? 'Buat akun baru' : 'Masuk ke akun Anda'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
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
                        {AVAILABLE_ROLES.map(role => (
                            <option key={role} value={role}>
                                {ROLE_NAME_MAP[role]} (Role {role}) 
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {error && (
              <div>{error}</div>
            )}

            <button type="submit">
              {isSignUp ? 'Daftar' : 'Masuk'}
            </button>
          </form>

          <p>
            {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
            <button
              type="button"
              onClick={handleToggleSignUp}
            >
              {isSignUp ? 'Masuk di sini' : 'Daftar di sini'}
            </button>
          </p>
        </div>
      </div>
    </>
  )
}

--------------------------------------------------------------------------------
LANGKAH 4: IMPLEMENTASI DASHBOARD DENGAN RBAC & OVERRIDE (src/pages/Dashboard.jsx)
--------------------------------------------------------------------------------

Kode ini menerapkan logika:
1. Akses navigasi dan halaman hanya jika userRole cocok dengan nomor halaman (kecuali admin khusus).
2. Super Admin (email: warehouseppic60@gmail.com) memiliki akses ke semua halaman, mengabaikan nomor Role mereka.
3. Fix Logout menggunakan setTimeout.
4. Menampilkan Nama Role Kustom.

// src/pages/Dashboard.jsx
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth, ROLE_NAME_MAP } from "../context/AuthContext"; // Import ROLE_NAME_MAP
import { useState } from "react"; 

// ====================================================================
// DEFINISI 13 HALAMAN CUSTOM (Role = Page Number)
// ====================================================================
const PAGE_MAP = {
    1: "Dashboard PPIC",
    2: "Input Data Order",
    3: "Laporan Produksi", 
    4: "Master Bahan Baku",
    5: "Master Kemasan",
    6: "Gudang RM/Packing",
    7: "QA/QC",
    8: "Maintenance",
    9: "Finance",
    10: "Super Admin Settings",
    11: "Logistik Inbound",
    12: "Logistik Outbound",
    13: "Rekap Harian",
};
const pages = Object.keys(PAGE_MAP).map(Number); 
// ====================================================================


export default function Dashboard() {
  const { user, userRole, signOut, SPECIAL_ADMIN_EMAIL } = useAuth();
  const navigate = useNavigate();

  // FIX LOGOUT BOTTOM: Tambahkan setTimeout
  const handleLogout = async () => {
    await signOut();
    setTimeout(() => {
        navigate("/login");
    }, 10); 
  };

  // Cek apakah user yang login adalah Admin KHUSUS (Email Override)
  const isSpecialAdmin = user?.email === SPECIAL_ADMIN_EMAIL;

  // LOGIKA AKSES: Tampilkan semua halaman jika Admin Khusus, atau hanya halaman sesuai Role
  const accessiblePages = isSpecialAdmin
    ? pages 
    : pages.filter(num => num === userRole); 

  // MENDAPATKAN NAMA ROLE CUSTOM
  const userRoleName = ROLE_NAME_MAP[userRole] || `Role ${userRole}`;

  return (
    <div>
      <nav>
        <div>
          <div>
            <div>
              {accessiblePages.map((num) => (
                <Link 
                  key={num} 
                  to={`/page/${num}`} 
                >
                  {PAGE_MAP[num]} ({num})
                </Link>
              ))}
            </div>
          </div>
          <div>
            <span>
              Hello, <strong>{user?.email}</strong> 
              {/* PENGGUNAAN NAMA ROLE CUSTOM DI HEADER */}
              (Role: **{userRoleName}** - No. {userRole || 'N/A'}) 
              {isSpecialAdmin && <span> [SUPER ADMIN OVERRIDE]</span>}
            </span>
            <button onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main>
        <Routes>
          {pages.map((num) => (
            <Route
              key={num}
              path={`/page/${num}`}
              element={<PageContent 
                          number={num} 
                          userRole={userRole} 
                          pageName={PAGE_MAP[num]} 
                          isSpecialAdmin={isSpecialAdmin}
                      />} 
            />
          ))}
          <Route
            path="/"
            // PENGGUNAAN NAMA ROLE CUSTOM DI PESAN SAMBUTAN
            element={<h2>Selamat datang di Dashboard! Role Anda adalah **{userRoleName}** (No. {userRole}). Silakan klik link {isSpecialAdmin ? 'salah satu' : `**${PAGE_MAP[userRole]}** (${userRole})`} di atas.</h2>}
          />
        </Routes>
      </main>
    </div>
  );
}

function PageContent({ number, userRole, pageName, isSpecialAdmin }) {
    
    // Proteksi Akses: Jika bukan Admin Khusus DAN Role TIDAK cocok dengan halaman
    if (!isSpecialAdmin && userRole !== number) {
        const requiredPageName = PAGE_MAP[number];
        const userRoleName = ROLE_NAME_MAP[userRole] || `Role ${userRole}`; // Ambil nama role lagi
        return (
            <div>
                <h1>Akses Ditolak! 🛑</h1>
                {/* PENGGUNAAN NAMA ROLE CUSTOM DI PESAN ERROR */}
                <p>Anda adalah **{userRoleName} (Role {userRole})** dan hanya memiliki akses ke **{PAGE_MAP[userRole]} ({userRole})**.</p>
                <p>Halaman ini (**{pageName} ({number})**) hanya dapat diakses oleh **Role {number}**.</p>
            </div>
        );
    }
    
  if (number === 3) {
    // Implementasi Laporan Produksi yang kompleks harus diletakkan di sini
    // (Gunakan kode LaporanProduksiPageForPage3 Anda sebelumnya)
    return <div>Halaman Laporan Produksi (Konten Khusus)</div>; 
  }
  
  return (
    <div>
      <h1>{pageName} ({number}) {isSpecialAdmin ? '(Akses Super Admin Override)' : ''}</h1>
      <p>Ini adalah konten khusus untuk **Role {number}** ({pageName}).</p>
    </div>
  );
}
// Catatan: Pastikan Anda menyertakan komponen LaporanProduksiPageForPage3 Anda yang lengkap di file ini.

--------------------------------------------------------------------------------
LANGKAH 5: KONFIGURASI ROOT (src/App.jsx dan src/main.jsx)
--------------------------------------------------------------------------------

// src/App.jsx (Contoh implementasi App.jsx dengan Router dan Proteksi Route)
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Komponen untuk melindungi rute
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
      return <div>Loading...</div>; // Tampilkan loading saat cek status
  }
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}


// src/main.jsx (Pembungkus dengan Router dan Context)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);