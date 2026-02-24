import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiEnvelope, HiPhone, HiHeart } from 'react-icons/hi2';
import { FaWhatsapp, FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer = memo(() => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  const isAdminRoute = location.pathname.startsWith('/admin123');

  if (isAdminRoute) return null;

  const quickLinks = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Features' },
    { path: '/why-us', label: 'Why Us' },
    { path: '/projects', label: 'Use Cases' },
    { path: '/contact', label: 'Contact' },
  ];

  const services = [
    'Real-time Monitoring',
    'Smart Scheduling',
    'Energy Analytics',
    'Automated Billing',
    'Remote Control',
    'IoT Device Sync',
  ];

  const socialLinks = [
    { icon: FaFacebook, href: '#', label: 'Facebook' },
    { icon: FaInstagram, href: '#', label: 'Instagram' },
    { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
    { icon: FaTwitter, href: '#', label: 'Twitter' },
    { icon: FaWhatsapp, href: 'https://wa.me/919763723391', label: 'WhatsApp', external: true },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          {/* Brand Column */}
          <div className="col-lg-4 col-md-6 mb-4 mb-lg-0">
            <div className="gn-reveal">
              <div className="footer-logo">
                EV <span>Home</span>
              </div>
              <p className="footer-description">
                Smart EV charging platform integrated with IoT. Track energy, book slots, and manage your home charging with ease.
              </p>
              <div className="footer-social">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    target={social.external ? '_blank' : '_self'}
                    rel={social.external ? 'noopener noreferrer' : undefined}
                  >
                    <social.icon />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 col-6 mb-4 mb-lg-0">
            <div className="gn-reveal" style={{ transitionDelay: '0.1s' }}>
              <h5 className="footer-title">Quick Links</h5>
              <ul className="footer-links">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Services */}
          <div className="col-lg-3 col-md-6 col-6 mb-4 mb-lg-0">
            <div className="gn-reveal" style={{ transitionDelay: '0.2s' }}>
              <h5 className="footer-title">What We Do</h5>
              <ul className="footer-links">
                {services.map((service, index) => (
                  <li key={index}>
                    <Link to="/services">{service}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="col-lg-3 col-md-6">
            <div className="gn-reveal" style={{ transitionDelay: '0.3s' }}>
              <h5 className="footer-title">Contact Us</h5>
              <ul className="footer-links footer-contact">
                <li>
                  <a href="mailto:ev.home@gmail.com">
                    <HiEnvelope />
                    <span>ev.home@gmail.com</span>
                  </a>
                </li>
                <li>
                  <a href="tel:+919763723391">
                    <HiPhone />
                    <span>9763723391</span>
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/919763723391" target="_blank" rel="noopener noreferrer">
                    <FaWhatsapp />
                    <span>WhatsApp Us</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} EV Home. All rights reserved.</p>
            <div className="footer-portal-links">
              <Link to="/admin123" className="portal-link">Admin Portal</Link>
              <span className="divider">|</span>
              <Link to="/owner" className="portal-link">Station Owner</Link>
            </div>
            <p className="footer-made-with">
              Made with <HiHeart className="heart-icon" /> for a greener future
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
