import { useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

import Page1 from './pages/Page1'; 
import Page2 from './pages/Page2';
import Page3 from './pages/Page3';
import Page4 from './pages/Page4';
import Page5 from './pages/Page5';
import Page6 from './pages/Page6';
import Page7 from './pages/Page7';
import Page8 from './pages/Page8';
import Page9 from './pages/Page9';
import Page10 from './pages/Page10';
import Page11 from './pages/Page11';
import Page12 from './pages/Page12';
import Page13 from './pages/Page13';
import Page14 from './pages/Page14';
import Page15 from './pages/Page15';
import Page16 from './pages/Page16';
import Page17 from './pages/Page17';
import Page18 from './pages/Page18';
import Page19 from './pages/Page19';
import Page20 from './pages/Page20';


function App() {
  return (
    <div className="app-wrapper"> 
      <Navbar /> 
      
      <main className="app-main-content">
        <Routes>
          <Route path="/" element={<Page1 />} /> 
          <Route path="/halaman-2" element={<Page2 />} />
          <Route path="/halaman-3" element={<Page3 />} />
          <Route path="/halaman-4" element={<Page4 />} />
          <Route path="/halaman-5" element={<Page5 />} />
          <Route path="/halaman-6" element={<Page6 />} />
          <Route path="/halaman-7" element={<Page7 />} />
          <Route path="/halaman-8" element={<Page8 />} />
          <Route path="/halaman-9" element={<Page9 />} />
          <Route path="/halaman-10" element={<Page10 />} />
          <Route path="/halaman-11" element={<Page11 />} />
          <Route path="/halaman-12" element={<Page12 />} />
          <Route path="/halaman-13" element={<Page13 />} />
          <Route path="/halaman-14" element={<Page14 />} />
          <Route path="/halaman-15" element={<Page15 />} />
          <Route path="/halaman-16" element={<Page16 />} />
          <Route path="/halaman-17" element={<Page17 />} />
          <Route path="/halaman-18" element={<Page18 />} />
          <Route path="/halaman-19" element={<Page19 />} />
          <Route path="/halaman-20" element={<Page20 />} />
          <Route path="*" element={<h1 style={{ textAlign: 'center', marginTop: '50px' }}>404 | Halaman Tidak Ditemukan</h1>} />
        </Routes>
      </main>
      
    </div>
  );
}

export default App