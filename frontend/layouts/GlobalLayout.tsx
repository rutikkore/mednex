
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSync } from '../hooks/useSync';
import { NotificationDropdown } from '../src/components/NotificationDropdown';
import { useHospital } from '../hooks/useHospital';
import { HospitalSelector } from '../src/components/HospitalSelector';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: boolean;
}

const GlobalLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { lastEvent } = useSync();
  const { hospitalId } = useHospital();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (lastEvent) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [lastEvent]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    // Cleanup and re-run on path change
    setIsMenuOpen(false);
    return () => {
      revealElements.forEach(el => observer.unobserve(el));
    };
  }, [location.pathname]);

  const navItems: Record<string, NavItem[]> = {
    patient: [
      { label: 'Book', path: '/patient/book', icon: 'add_circle' },
      { label: 'Track', path: '/track', icon: 'radar', badge: true },
      { label: 'Dash', path: '/patient', icon: 'dashboard' },
      { label: 'Emergency', path: '/patient/emergency', icon: 'emergency' },
      { label: 'Blood Bank', path: '/patient/blood-bank', icon: 'bloodtype' },
    ],
    receptionist: [
      { label: 'Queue', path: '/staff', icon: 'dashboard' },
      { label: 'Display', path: '/staff/console', icon: 'tv', badge: true },
      { label: 'Beds', path: '/staff/beds', icon: 'bed' },
      { label: 'Blood Bank', path: '/staff/blood-bank', icon: 'bloodtype' },
    ],
    admin: [
      { label: 'Admin', path: '/admin', icon: 'admin_panel_settings' },
    ],
    guest: [
      { label: 'Home', path: '/', icon: 'home' },
      { label: 'Queue Status', path: '/track', icon: 'search' },
    ]
  };

  const currentRole = user?.role || 'guest';
  const items = navItems[currentRole] || [];

  // Enable dark theme for everything to maintain the "New UI" consistency requested
  const isDarkPage = true;

  return (
    <div className={`min-h-screen flex flex-col bg-[#020617] text-white`}>
      {user && user.role !== 'patient' && !hospitalId && <HospitalSelector />}
      <header
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 border-b ${scrolled
          ? `bg-[#020617]/80 backdrop-blur-3xl border-white/10 py-4 shadow-xl`
          : 'bg-transparent border-transparent py-6 md:py-10'
          }`}
      >
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-24 flex justify-between items-center gap-4">
          <Link to="/" className="flex items-center gap-3 sm:gap-5 group flex-shrink-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[1rem] bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-600/30 group-hover:rotate-[360deg] transition-all duration-700 shrink-0">
              <span className="material-icons-round text-xl sm:text-2xl">health_and_safety</span>
            </div>
            <span className="text-impact text-xl sm:text-2xl md:text-3xl tracking-tighter truncate text-white">MedNexus</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 xl:gap-12">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-[10px] xl:text-[11px] font-black uppercase tracking-[0.3em] transition-all relative group ${location.pathname === item.path
                  ? 'text-white'
                  : 'text-slate-500 hover:text-white'
                  }`}
              >
                {item.label}
                {item.badge && <span className="absolute -top-1 -right-3 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>}
                <span className={`absolute -bottom-1.5 left-0 h-[2px] bg-blue-500 transition-all duration-500 ${location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-6 xl:gap-10 shrink-0">
            {user ? (
              <div className="flex items-center gap-4 xl:gap-8">
                <NotificationDropdown />
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{user.name}</p>
                  <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest mt-1 opacity-60">Node: {user.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-11 h-11 rounded-[1rem] flex items-center justify-center transition-all bg-white/5 border border-white/10 text-slate-500 hover:text-red-500"
                >
                  <span className="material-icons-round text-lg">logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all duration-500 bg-white text-black hover:bg-blue-600 hover:text-white"
              >
                Login / Register
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden p-2.5 rounded-xl border flex-shrink-0 text-white bg-white/5 border-white/10`}
          >
            <span className="material-icons-round text-2xl">{isMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full animate-in slide-in-from-top-4 duration-300 border-b bg-[#020617] border-white/10 shadow-2xl px-6 py-8">
            <nav className="flex flex-col gap-6">
              {items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 text-sm font-black uppercase tracking-widest ${location.pathname === item.path ? 'text-blue-600' : 'text-slate-400'
                    }`}
                >
                  <span className="material-icons-round">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <hr className="border-white/10" />
              {user ? (
                <button onClick={logout} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-red-500">
                  <span className="material-icons-round">logout</span> Sign Out
                </button>
              ) : (
                <Link to="/auth" className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-blue-600">
                  <span className="material-icons-round">login</span> Access Hub
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default GlobalLayout;
