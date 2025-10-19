# Membuat Struktur Folder Berlapis (3 Level)
mkdir -p LevelA{1..3}/LevelB{1..2}/LevelC{1..2} && touch LevelA{1..3}/LevelB{1..2}/README.txt

npm create vite@latest .
npm i react-router-dom

# membuat file kosong di dalam folder
cd src && mkdir pages && cd pages && for i in {1..20}; do touch Page$i.jsx; done && cd ..

# Mengisi semua file dg Boilerplate
cd pages && for i in {1..20}; do echo "import React from 'react'; function Page$i() { return (<div><h1>Halaman $i</h1><p>Konten spesifik Halaman $i.</p></div>); } export default Page$i;" > Page$i.jsx; done && cd ..

# Mengimpor semua $20$ komponen di src/App/jsx
IMPOR SEMUA 20 HALAMAN

# Buat Komponen Navbar
cd src && mkdir components && touch components/Navbar.jsx

# Modifikasi src/App.jsx

# Modifikasi src/main.jsx