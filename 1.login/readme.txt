================================================================================
                            CAPTAIN DOCUMENTATION
           Web App Login + Dashboard + 20 Halaman (Vite + React + Supabase)
================================================================================

Tech Stack:
- Vite + React
- Supabase (Auth + DB)
- Tailwind CSS v3
- React Router DOM
- Node.js v22.12.0

================================================================================
1. PRASYARAT (WAJIB)
================================================================================
- Node.js: v22.12.0
- npm: 10.9.0+
- Supabase Project (dapatkan URL & ANON KEY)

Cek versi:
  node -v
  npm -v

================================================================================
2. SETUP NODE.JS DENGAN NVM (WAJIB!)
================================================================================
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc

nvm list-remote
nvm install 22.12.0
nvm use 22.12.0

node -v  # Harus: v22.12.0
npm -v   # Harus: 10.9.0+

================================================================================
3. BUAT PROYEK VITE + REACT
================================================================================
npm create vite@latest 1.login -- --template react
cd 1.login

================================================================================
4. INSTALL DEPENDENCIES
================================================================================
npm install @supabase/supabase-js react-router-dom
npm install -D tailwindcss postcss autoprefixer

================================================================================
5. BERSIHKAN & INSTALL ULANG (JIKA ERROR)
================================================================================
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm install -D tailwindcss postcss autoprefixer

================================================================================
6. SETUP TAILWIND CSS (MANUAL - 100% AMAN)
================================================================================
# Buat tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Buat postcss.config.js
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Buat src/index.css
mkdir -p src
echo '@tailwind base;
@tailwind components;
@tailwind utilities;

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}' > src/index.css

================================================================================
7. SETUP SUPABASE (.env)
================================================================================
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
EOF

# Tambahkan ke .gitignore
echo ".env
node_modules/
dist/" > .gitignore

================================================================================
8. IMPORT CSS DI main.jsx
================================================================================
Pastikan di src/main.jsx ada:
import './index.css'

================================================================================
9. JALANKAN APLIKASI
================================================================================
npm run dev
Buka: http://localhost:5173

================================================================================
10. STRUKTUR FOLDER (CAPTAIN STANDARD)
================================================================================
1.login/
├── .env
├── .gitignore
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── vite.config.js
└── src/
    ├── context/
    │   └── AuthContext.jsx
    ├── lib/
    │   └── supabaseClient.js
    ├── components/
    │   └── ProtectedRoute.jsx
    ├── pages/
    │   ├── Login.jsx
    │   └── Dashboard.jsx
    ├── App.jsx
    ├── main.jsx
    └── index.css

================================================================================
11. FITUR YANG SUDAH ADA
================================================================================
- Login / Sign Up (Supabase Auth)
- Protected Route
- Dashboard + Navbar
- 20 Halaman (Page 1 - 20)
- Tailwind CSS Responsif
- Dark Mode Ready (opsional)

================================================================================
12. TROUBLESHOOTING (CAPTAIN FIX)
================================================================================
npx tailwindcss init -p gagal?
→ Gunakan CARA MANUAL (Langkah 6)

EJSONPARSE di package.json?
→ Ganti dengan JSON valid (lihat contoh di bawah)

Tailwind tidak muncul?
→ Cek @tailwind di index.css + import di main.jsx

Login gagal?
→ Cek .env + Supabase URL & Key

================================================================================
13. CONTOH package.json (VALID)
================================================================================
{
  "name": "1.login",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.4",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.9.0",
    "postcss": "^8.4.41",
    "tailwindcss": "^3.4.10",
    "vite": "^7.1.11"
  }
}

================================================================================
14. DEPLOY KE VERCEL (1 MENIT)
================================================================================
git add .
git commit -m "feat: login + dashboard"
git push

1. Buka: https://vercel.com
2. Import GitHub repo
3. Tambah Environment Variables:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
4. Deploy → LIVE!

================================================================================
15. PERINTAH CAPTAIN (COPY-PASTE ALL)
================================================================================
nvm install 22.12.0 && nvm use 22.12.0
npm create vite@latest 1.login -- --template react
cd 1.login
npm install @supabase/supabase-js react-router-dom
npm install -D tailwindcss postcss autoprefixer

npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Manual Tailwind Config
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
EOF

cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

echo '@tailwind base; @tailwind components; @tailwind utilities;' > src/index.css

npm run dev

================================================================================
CAPTAIN MODE: ON
================================================================================
Kamu sekarang punya template siap pakai untuk semua proyek React + Supabase + Tailwind.
Simpan file ini di root proyek: CAPTAIN-DOCUMENTATION.txt

================================================================================
SELESAI! KAMU ADALAH CAPTAIN!
================================================================================