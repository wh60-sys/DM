import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  // Daftar 20 link (Path dan Label)
  const links = [
    { to: '/', label: 'Home (Halaman 1)' },
    { to: '/halaman-2', label: 'Halaman 2' },
    { to: '/halaman-3', label: 'Halaman 3' },
    { to: '/halaman-4', label: 'Halaman 4' },
    { to: '/halaman-5', label: 'Halaman 5' },
    { to: '/halaman-6', label: 'Halaman 6' },
    { to: '/halaman-7', label: 'Halaman 7' },
    { to: '/halaman-8', label: 'Halaman 8' },
    { to: '/halaman-9', label: 'Halaman 9' },
    { to: '/halaman-10', label: 'Halaman 10' },
    { to: '/halaman-11', label: 'Halaman 11' },
    { to: '/halaman-12', label: 'Halaman 12' },
    { to: '/halaman-13', label: 'Halaman 13' },
    { to: '/halaman-14', label: 'Halaman 14' },
    { to: '/halaman-15', label: 'Halaman 15' },
    { to: '/halaman-16', label: 'Halaman 16' },
    { to: '/halaman-17', label: 'Halaman 17' },
    { to: '/halaman-18', label: 'Halaman 18' },
    { to: '/halaman-19', label: 'Halaman 19' },
    { to: '/halaman-20', label: 'Halaman 20' },
  ];

  return (
    <nav className="app-navbar">
      {links.map((link) => (
        <Link key={link.to} to={link.to} className="nav-link">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export default Navbar;