import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const roleBadge = {
  admin: 'bg-orange-50 text-orange-700 border border-orange-200',
  ngo:   'bg-teal-50   text-teal-700   border border-teal-200',
  donor: 'bg-amber-50  text-amber-700  border border-amber-200',
};

const RoleIcon = ({ role, cls = 'w-3 h-3' }) => {
  if (role === 'admin') return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
  if (role === 'ngo')   return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
  return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
};

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (p) => location.pathname === p;

  const NavLink = ({ to, children }) => (
    <Link to={to} onClick={() => setOpen(false)}
      className={`relative text-sm font-medium transition-colors duration-200 px-1 py-0.5 ${isActive(to) ? 'text-stone-900' : 'text-stone-500 hover:text-stone-800'}`}>
      {children}
      {isActive(to) && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-stone-800 rounded-full" />}
    </Link>
  );

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-sm shadow-stone-200/60' : 'bg-white/95 backdrop-blur-sm border-b border-stone-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-stone-800 flex items-center justify-center shadow-md group-hover:bg-stone-700 transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold text-stone-800">NGO</span>
              <span className="text-base font-bold gradient-text"> Platform</span>
            </div>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-7">
            {user ? (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/projects">Projects</NavLink>
                {user.role === 'ngo' && (
                  <Link to="/projects/create" className="flex items-center gap-1.5 text-sm font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New Project
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-5 border-l border-stone-200">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-stone-800 leading-tight">{user.name}</p>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[user.role]}`}>
                      <RoleIcon role={user.role} /> {user.role}
                    </span>
                  </div>
                  <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-medium text-stone-400 hover:text-stone-700 hover:bg-stone-100 px-3 py-2 rounded-lg transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <Link to="/register" className="btn-primary flex items-center gap-2">
                  Get Started
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors text-stone-600">
            {open
              ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            }
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 pt-2 border-t border-stone-100 space-y-1 animate-fade-in-up">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-stone-50 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center text-white font-bold text-sm">{user.name[0].toUpperCase()}</div>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{user.name}</p>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[user.role]}`}><RoleIcon role={user.role} /> {user.role}</span>
                  </div>
                </div>
                {[{ to: '/dashboard', label: 'Dashboard' }, { to: '/projects', label: 'Projects' }].map(l => (
                  <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(l.to) ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-50'}`}>
                    {l.label}
                  </Link>
                ))}
                {user.role === 'ngo' && (
                  <Link to="/projects/create" onClick={() => setOpen(false)} className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New Project
                  </Link>
                )}
                <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-stone-500 hover:bg-stone-50 transition-colors">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-stone-800 text-center">Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
