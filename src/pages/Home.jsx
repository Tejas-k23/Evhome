import React, { memo, useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiGlobeAlt, HiDevicePhoneMobile, HiArrowRight,
  HiChatBubbleLeftRight, HiCodeBracket,
  HiCursorArrowRays, HiCalendarDays, HiBanknotes
} from 'react-icons/hi2';
import {
  Activity,
  Cpu,
  History,
  Power,
  PieChart,
  Receipt,
  MapPin
} from 'lucide-react';
import { FaWhatsapp, FaFacebook, FaQuoteLeft, FaHandshake } from 'react-icons/fa';

// Optimized count-up hook with requestAnimationFrame
const useCountUp = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (typeof end !== 'number' || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();

          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * end));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return [count, ref];
};

// Memoized service card
const ServiceCard = memo(({ service, index }) => (
  <div className="col-lg-4 col-md-6">
    <div className="service-card h-100 gn-reveal" style={{ transitionDelay: `${index * 0.1}s` }}>
      <div className="service-icon"
        style={{
          background: "linear-gradient(135deg, #38bdf8, #2563eb)"
        }}
      >
        <service.icon />
      </div>
      <h4>{service.title}</h4>
      <p>{service.description}</p>
    </div>
  </div>
));

ServiceCard.displayName = 'ServiceCard';

// Memoized stat item
const StatItem = memo(({ stat, index }) => {
  const numericValue = parseInt(stat.number);
  const isNumeric = !isNaN(numericValue);
  const [count, ref] = useCountUp(isNumeric ? numericValue : 0);

  return (
    <div className="stat-item" ref={ref}>
      <div className="stat-number gn-count">
        {isNumeric ? `${count}+` : stat.number}
      </div>
      <div className="stat-label">{stat.label}</div>
    </div>
  );
});

StatItem.displayName = 'StatItem';

// Memoized project card
const ProjectCard = memo(({ project, index }) => (
  <div className="col-lg-4 col-md-6">
    <div className="project-card gn-reveal-scale" style={{ transitionDelay: `${index * 0.1}s` }}>
      <div className="project-image">
        <img src={project.image} alt={project.title} loading="lazy" />
      </div>
      <div className="project-content">
        <h4>{project.title}</h4>
        <p className="mb-0">{project.description}</p>
      </div>
    </div>
  </div>
));

ProjectCard.displayName = 'ProjectCard';

import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN, MAPBOX_CONFIG } from '../config/mapboxConfig';
import { adminStationService } from '../admin/services/adminStationService';

// Memoized station popup
const StationPopup = memo(({ station, onClose, onBook }) => (
  <Popup
    latitude={station.lat}
    longitude={station.lng}
    closeButton={true}
    closeOnClick={false}
    onClose={onClose}
    anchor="bottom"
    offset={15}
  >
    <div style={{ padding: '2px', minWidth: '200px' }}>
      <div style={{
        height: '100px',
        background: 'linear-gradient(135deg, #0EA5E9 0%, #2563eb 100%)',
        borderRadius: '12px',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <MapPin size={40} />
      </div>
      <h6 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '800', color: 'var(--secondary)' }}>{station.name}</h6>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <MapPin size={12} style={{ color: 'var(--primary)' }} />
        <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{station.location}</span>
      </div>

      <div style={{
        background: 'var(--gray-50)',
        padding: '10px',
        borderRadius: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        border: '1px solid var(--gray-100)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '11px', color: 'var(--gray-400)', textTransform: 'uppercase', fontWeight: '700' }}>Price</span>
          <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>₹{station.pricePerKwh}/kWh</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '11px', color: 'var(--gray-400)', textTransform: 'uppercase', fontWeight: '700' }}>Units</span>
          <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--secondary)' }}>{station.socketCount} Sockets</span>
        </div>
      </div>

      <button
        onClick={() => onBook(station)}
        className="btn-primary-custom"
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '14px',
          minHeight: '40px'
        }}
      >
        Book This Station
      </button>
    </div>
  </Popup>
));

StationPopup.displayName = 'StationPopup';

function Home() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await adminStationService.getAll();
        const arr = Array.isArray(data) ? data : [];
        setStations(arr.filter(s => s.status === 'ACTIVE'));
      } catch (error) {
        console.error("Failed to fetch stations:", error);
        setStations([]);
      }
    };
    fetchStations();
  }, []);

  const [mapViewState, setMapViewState] = useState({
    longitude: MAPBOX_CONFIG.defaultCenter[0],
    latitude: MAPBOX_CONFIG.defaultCenter[1],
    zoom: 11
  });

  const services = [
    // ... existing services
    {
      icon: HiCalendarDays,
      title: 'Slot Booking',
      description: 'Book your charging slots in advance for specific time periods to ensure availability.',
    },
    {
      icon: Activity,
      title: 'Live Monitoring',
      description: 'Monitor your live charging status in real time from anywhere via the app.',
    },
    {
      icon: Cpu,
      title: 'Real-time IoT Data',
      description: 'Track voltage, current, and power usage directly from the IoT device.',
    },
    {
      icon: HiBanknotes,
      title: 'Automated Billing',
      description: 'Instantly calculate charging costs based on actual energy consumed.',
    },
    {
      icon: History,
      title: 'Charging History',
      description: 'View detailed billing summaries and your complete charging session history.',
    },
    {
      icon: Power,
      title: 'Remote Control',
      description: 'Start, stop, and manage your EV charging sessions remotely with one tap.',
    },
  ];

  const stats = [
    { number: '5000+', label: 'Charging Sessions' },
    { number: '1000+', label: 'IoT Devices Installed' },
    { number: '99.9%', label: 'System Uptime' },
    { number: '100%', label: 'Billing Accuracy' },
  ];

  const projects = [
    {
      image: 'media/realestate.jpg',
      title: 'Residential Charging',
      description: 'Smart charging solutions for individual home owners with real-time monitoring.'
    },
    {
      image: 'media/hotel-booking.png',
      title: 'Apartment Complexes',
      description: 'Shared charging infrastructure with individual billing for multi-unit dwellings.'
    },
    {
      image: 'media/mobile-app.webp',
      title: 'Office Parking',
      description: 'Efficient charging management for corporate fleets and employee vehicles.'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="hero-content gn-reveal">
                <span className="section-label">Smart IoT EV Charging</span>
                <h1 className="hero-title">
                  Next-Gen EV Charging <span className="highlight">Powered by IoT</span>
                </h1>
                <p className="hero-subtitle">
                  EV Home brings intelligence to your charging socket. Track energy, book slots, and manage sessions with our smart IoT-integrated platform.
                </p>
                <div className="hero-buttons">
                  <Link to="/contact" className="btn-primary-custom">
                    Get EV Home
                    <HiArrowRight />
                  </Link>
                  <a
                    href="https://wa.me/+919763723391?text=Hello%20EV%20Home%20Team,%20I%20am%20interested%20in%20your%20smart%20charging%20solution.%20Please%20share%20more%20details."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp"
                  >
                    <FaWhatsapp />
                    Contact Sales
                  </a>
                </div>
                <div className="stats-row">
                  {stats.map((stat, index) => (
                    <StatItem key={index} stat={stat} index={index} />
                  ))}
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-image gn-reveal-right">
                <img
                  src="media/1.jpg"
                  alt="EV Home - Smart Charging"
                  style={{ width: '90%' }}
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="section" style={{ paddingTop: '0', paddingBottom: '40px' }}>
        <div className="container">
          <div className="quote-block gn-reveal" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <FaQuoteLeft className="quote-icon" />
            <p>"Smart energy management is the future of sustainable mobility."</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section section-gray">
        <div className="container">
          <div className="section-header gn-reveal">
            <span className="section-label">Smart Charging Features</span>
            <h2>Complete Control Over Your Charging</h2>
            <p>Integrated IoT hardware and software solutions for modern EV owners</p>
          </div>

          <div className="row g-4">
            {services.map((service, index) => (
              <ServiceCard key={index} service={service} index={index} />
            ))}
          </div>

          <div className="text-center mt-5 gn-reveal">
            <Link to="/services" className="btn-secondary-custom">
              View All Features
              <HiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="gn-reveal-left">
                <span className="section-label">Why EV Home</span>
                <h2 className="mb-4">Intelligent, Safe, and Reliable Charging</h2>
                <p className="mb-4" style={{ fontSize: '1.05rem' }}>
                  Our platform isn't just a booking tool. It's a comprehensive energy management system that ensures your EV is always ready while optimizing costs and safety through real-time IoT data.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="row g-3 gn-reveal-right">
                <div className="col-sm-6">
                  <div className="d-flex align-items-start gap-3">
                    <div className="feature-icon-small">
                      <Cpu size={20} />
                    </div>
                    <div>
                      <h6 className="mb-1">IoT Integrated</h6>
                      <p className="mb-0 text-sm">Hardware-level monitoring</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex align-items-start gap-3">
                    <div className="feature-icon-small feature-icon-green">
                      <PieChart size={20} />
                    </div>
                    <div>
                      <h6 className="mb-1">Smart Analytics</h6>
                      <p className="mb-0 text-sm">Detailed energy insights</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex align-items-start gap-3">
                    <div className="feature-icon-small">
                      <HiChatBubbleLeftRight />
                    </div>
                    <div>
                      <h6 className="mb-1">Direct Communication</h6>
                      <p className="mb-0 text-sm">Talk to decision-makers</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex align-items-start gap-3">
                    <div className="feature-icon-small feature-icon-green">
                      <Receipt size={20} />
                    </div>
                    <div>
                      <h6 className="mb-1">Automatic Billing</h6>
                      <p className="mb-0 text-sm">Seamless cost calculation</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 gn-reveal">
                <Link to="/why-us" className="btn-primary-custom">
                  Learn More About Us
                  <HiArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Work Preview */}
      <section className="section section-gray">
        <div className="container">
          <div className="section-header gn-reveal">
            <span className="section-label">Real-world Application</span>
            <h2>Charging Solutions for Every Scenario</h2>
            <p>From private homes to commercial parking—EV Home scales with your needs</p>
          </div>

          <div className="row g-4">
            {projects.map((project, index) => (
              <ProjectCard key={index} project={project} index={index} />
            ))}
          </div>

          <div className="text-center mt-5 gn-reveal">
            <Link to="/projects" className="btn-secondary-custom">
              View All Use Cases
              <HiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="section" id="network">
        <div className="container">
          <div className="section-header gn-reveal">
            <span className="section-label">Our Network</span>
            <h2>Find a Station Near You</h2>
            <p>Explore our growing network of smart IoT-enabled charging stations across the country.</p>
          </div>

          <div style={{
            height: '500px',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--gray-100)',
            position: 'relative',
            zIndex: 1
          }}>
            <Map
              {...mapViewState}
              onMove={evt => setMapViewState(evt.viewState)}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              mapboxAccessToken={MAPBOX_TOKEN}
            >
              <NavigationControl position="top-right" />
              {stations.filter(station =>
                station &&
                typeof station.lat === 'number' && !isNaN(station.lat) &&
                typeof station.lng === 'number' && !isNaN(station.lng)
              ).map((station) => (
                <Marker
                  key={station.id}
                  latitude={station.lat}
                  longitude={station.lng}
                  onClick={e => {
                    e.originalEvent.stopPropagation();
                    setSelectedStation(station);
                  }}
                >
                  <div className="premium-pin">
                    <div className="pin-ring"></div>
                    <div className="pin-core">
                      <Power size={12} />
                    </div>
                  </div>
                </Marker>
              ))}

              {selectedStation && (
                <StationPopup
                  station={selectedStation}
                  onClose={() => setSelectedStation(null)}
                  onBook={(station) => {
                    navigate('/book-slot', { state: { station } });
                  }}
                />
              )}
            </Map>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content gn-reveal">
            <h2>Ready to Upgrade Your Charging Experience?</h2>
            <p>Join thousands of EV owners who manage their charging smarter with EV Home.</p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link to="/contact" className="btn-primary-custom">
                Get Started Today
                <HiArrowRight />
              </Link>
              <a
                href="https://wa.me/+919763723391?text=Hello%20EV%20Home%20Team,%20I%20am%20interested%20in%20your%20smart%20charging%20solution.%20Please%20share%20more%20details."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                <FaWhatsapp />
                Talk to Sales
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default memo(Home);
