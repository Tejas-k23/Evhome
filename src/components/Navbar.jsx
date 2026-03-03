import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { useAuth } from '../context/authContext';
import { User, LogOut } from 'lucide-react';

// Optimized Navbar with throttled scroll handling and React Icons hamburger
const Navbar = memo(() => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout } = useAuth();

  // Throttled scroll handler for better performance
  useEffect(() => {
    let ticking = false;
    let lastScrollY = 0;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setScrolled(currentScrollY > 50);

          // Hide navbar on scroll down, show on scroll up
          if (currentScrollY > lastScrollY && currentScrollY > 300) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const guestLinks = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Features' },
    { path: '/why-us', label: 'Why Us' },
    { path: '/projects', label: 'Use Cases' },
  ];

  const authLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/book-slot', label: 'Book Slot' },
    { path: '/bookings', label: 'Bookings' },
    { path: '/bills', label: 'Bills' },
  ];

  const navLinks = isAuthenticated ? authLinks : guestLinks;

  const toggleMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdminRoute = location.pathname.startsWith('/admin/login');

  if (isAdminRoute) return null;

  return (
    <>
      <nav
        className={`navbar navbar-expand-lg navbar-custom ${scrolled ? 'scrolled' : ''} ${isVisible ? '' : 'navbar-hidden'}`}
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}
      >
        <div className="container">
          <Link to="/" className="navbar-brand gn-brand">
            <img
              src="media/logo.svg"
              alt="GOT Nexus Logo"
              className="gn-logo"
              loading="eager"
            />
            <span className="gn-text">
              EV <span className="gn-text-highlight">Home</span>
            </span>
          </Link>

          {/* Hamburger Button with React Icons */}
          <button
            className="hamburger-btn"
            type="button"
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <HiX className="hamburger-icon" />
            ) : (
              <HiMenuAlt3 className="hamburger-icon" />
            )}
          </button>

          {/* Desktop Menu */}
          <div className="navbar-collapse d-none d-lg-flex">
            <ul className="navbar-nav ms-auto align-items-center">
              {navLinks.map((link) => (
                <li className="nav-item" key={link.path}>
                  <Link
                    className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                    to={link.path}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="nav-item ms-lg-3">
                {isAuthenticated ? (
                  <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2 text-primary fw-bold" style={{ fontSize: '0.9rem' }}>
                      <User size={18} />
                      {currentUser.vehicleNumber}
                    </div>
                    <button onClick={handleLogout} className="btn-secondary-custom d-flex align-items-center gap-2" style={{ padding: '8px 16px', fontSize: '0.85rem', minHeight: '38px', borderRadius: '8px' }}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                ) : (
                  <Link className="nav-link btn-cta" to="/auth">
                    Get Started
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={closeMenu}
      />

      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <Link to="/" className="gn-brand" onClick={closeMenu}>
            <img src="media/logo.svg" alt="GOT Nexus Logo" className="gn-logo" />
            <span className="gn-text">
              EV <span className="gn-text-highlight">Home</span>
            </span>
          </Link>
          <button
            className="mobile-menu-close"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <HiX />
          </button>
        </div>

        <nav className="mobile-menu-nav">
          {navLinks.map((link, index) => (
            <Link
              key={link.path}
              className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
              to={link.path}
              onClick={closeMenu}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button
              className="mobile-nav-cta d-flex align-items-center justify-content-center gap-2"
              onClick={handleLogout}
              style={{ animationDelay: `${navLinks.length * 0.05}s`, background: 'var(--gray-100)', color: 'var(--secondary)', border: 'none' }}
            >
              <LogOut size={18} /> Logout ({currentUser.vehicleNumber})
            </button>
          ) : (
            <Link
              className="mobile-nav-cta"
              to="/auth"
              onClick={closeMenu}
              style={{ animationDelay: `${navLinks.length * 0.05}s` }}
            >
              Get Started
            </Link>
          )}
        </nav>
      </div>
    </>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;

