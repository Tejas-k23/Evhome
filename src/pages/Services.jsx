import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import {
  HiGlobeAlt, HiDevicePhoneMobile, HiArrowRight, HiCodeBracket, HiServer,
  HiCalendarDays, HiBanknotes
} from 'react-icons/hi2';
import {
  Activity,
  Bolt,
  Power,
  Bell,
  Settings,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { FaWhatsapp, FaFacebook, FaRobot, FaCheckCircle } from 'react-icons/fa';

// Memoized Service Section
const ServiceSection = memo(({ service, index, isLast }) => (
  <div
    className={`row align-items-center mb-5 pb-5 gn-reveal ${!isLast ? 'border-bottom' : ''}`}
    style={{
      flexDirection: index % 2 === 1 ? 'row-reverse' : 'row',
      transitionDelay: `${index * 0.1}s`
    }}
  >
    <div className="col-lg-6 mb-4 mb-lg-0">
      <div
        className="service-image-box"
        style={{
          background: `linear-gradient(135deg, ${service.color}15, ${service.color}05)`,
          borderRadius: 'var(--radius-lg)',
          padding: '30px',
          border: `1px solid ${service.color}20`
        }}
      >
        <img
          src={service.image}
          alt={service.title}
          className="service-image"
          loading="lazy"
          style={{
            width: '80%',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)'
          }}
        />
      </div>
    </div>
    <div className="col-lg-6">
      <div style={{
        paddingLeft: index % 2 === 0 ? '24px' : '0',
        paddingRight: index % 2 === 1 ? '24px' : '0'
      }}>
        <div
          className="service-icon mb-3"
          style={{ background: `linear-gradient(135deg, ${service.color}, ${service.color}dd)` }}
        >
          <service.icon style={{ fontSize: '1.5rem' }} />
        </div>
        <h3 className="mb-3">{service.title}</h3>
        <p style={{ fontSize: '1.05rem', marginBottom: '20px' }}>{service.description}</p>

        <h6 style={{ color: 'var(--gray-700)', marginBottom: '12px', fontWeight: '600' }}>
          What You Get:
        </h6>
        <ul className="service-features mb-4">
          {service.outcomes.map((outcome, idx) => (
            <li key={idx}>
              <FaCheckCircle />
              {outcome}
            </li>
          ))}
        </ul>

        <Link
          to="/contact"
          className="btn-primary-custom"
          style={{ background: `linear-gradient(135deg, ${service.color}, ${service.color}dd)` }}
        >
          Get Started
          <HiArrowRight />
        </Link>
      </div>
    </div>
  </div>
));

ServiceSection.displayName = 'ServiceSection';

// Memoized Process Step
const ProcessStep = memo(({ item, index }) => (
  <div
    className="col-lg-3 col-md-6 gn-reveal"
    style={{ transitionDelay: `${index * 0.1}s` }}
  >
    <div className="text-center">
      <div className="process-step-number">
        {item.step}
      </div>
      <h4 className="process-step-title">{item.title}</h4>
      <p className="process-step-desc">{item.description}</p>
    </div>
  </div>
));

ProcessStep.displayName = 'ProcessStep';

function Services() {
  const services = [
    {
      icon: HiCalendarDays,
      title: 'Slot Booking System',
      description: 'Never wait for a charging spot again. Our smart booking system allows you to reserve specific time periods for your home or shared charging socket.',
      outcomes: [
        'Real-time availability calendar',
        'Instant booking confirmation',
        'Conflict-free scheduling',
        'Booking reminders and notifications',
        'Manage multiple sockets easily'
      ],
      image: 'media/responsive-layout.png',
      color: '#0EA5E9'
    },
    {
      icon: Activity,
      title: 'Live Session Monitoring',
      description: 'Stay informed about your charging status from anywhere. Get real-time updates on charging speed, battery level, and estimated completion time.',
      outcomes: [
        'Live charging status dashboard',
        'Push notifications on completion',
        'Real-time power draw tracking',
        'Remote start/stop functionality',
        'Multi-user access for families'
      ],
      image: 'media/mobile-app.webp',
      color: '#10B981'
    },
    {
      icon: Bolt,
      title: 'IoT Energy Analytics',
      description: 'Get deep insights into your electricity usage. Our IoT device tracks precise electrical parameters to ensure safe and efficient charging.',
      outcomes: [
        'Real-time voltage and current data',
        'Energy consumption (kWh) tracking',
        'Peak load management insights',
        'Safety alerts for electrical anomalies',
        'Historical usage trends'
      ],
      image: 'media/admin-dashboard.webp',
      color: '#8B5CF6'
    },
    {
      icon: HiBanknotes,
      title: 'Automated Cost Calculation',
      description: 'No more manual math. Our platform automatically calculates the cost of every charging session based on your local electricity tariffs.',
      outcomes: [
        'Instant billing after every session',
        'Support for tiered pricing',
        'Automated monthly reports',
        'Integrated payment gateways',
        'Tax-ready invoicing'
      ],
      image: 'media/ecommerce.jpg',
      color: '#F59E0B'
    },
    {
      icon: Power,
      title: 'Smart Remote Control',
      description: 'Take full command of your charging infrastructure. Manage sessions, update schedules, and control access permissions right from the palm of your hand.',
      outcomes: [
        'Instant remote start and stop',
        'Dynamic charging schedules',
        'User access management control',
        'Firmware updates for IoT devices',
        'System health diagnostics'
      ],
      image: 'media/meta-ads.jpg',
      color: '#3B82F6'
    },
    {
      icon: Bell,
      title: 'Notifications & Alerts',
      description: 'Stay connected with your charging system. Receive critical updates via the app, SMS, or WhatsApp to ensure your EV is always ready to go.',
      outcomes: [
        'Session start/stop notifications',
        'Power failure and surge alerts',
        'Booking confirmation messages',
        'Low energy balance reminders',
        'Maintenance and security alerts'
      ],
      image: 'media/meta-ads.jpg',
      color: '#25D366'
    }
  ];

  const processSteps = [
    { step: '01', title: 'IoT Setup', description: 'Our team installs the smart IoT device at your home charging socket.' },
    { step: '02', title: 'App Sync', description: 'Connect your device to the EV Home app for real-time monitoring.' },
    { step: '03', title: 'Smart Booking', description: 'Start booking slots and managing your sessions with ease.' },
    { step: '04', title: 'Live Control', description: 'Monitor energy usage and get automated billing reports.' }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="section section-gray" style={{ paddingTop: '120px' }}>
        <div className="container">
          <div className="section-header gn-reveal">
            <span className="section-label">Smart Charging Features</span>
            <h1>Everything You Need for Intelligent EV Charging</h1>
            <p>From real-time energy monitoring to automated billing—our IoT-integrated platform handles it all.</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section">
        <div className="container">
          {services.map((service, index) => (
            <ServiceSection
              key={index}
              service={service}
              index={index}
              isLast={index === services.length - 1}
            />
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-header gn-reveal">
            <span className="section-label" style={{ color: 'var(--primary-light)' }}>How We Work</span>
            <h2>A Simple Process, Clear Results</h2>
            <p>No unnecessary complexity—just a straightforward approach to getting things done</p>
          </div>

          <div className="row g-4">
            {processSteps.map((item, index) => (
              <ProcessStep key={index} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <div className="text-center gn-reveal">
            <h2 className="mb-3">Ready to Upgrade Your Home Charger?</h2>
            <p className="mb-4" style={{ maxWidth: '600px', margin: '0 auto 24px' }}>
              Let's talk about how EV Home can make your charging experience smarter, safer, and more efficient.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link to="/contact" className="btn-primary-custom">
                Schedule a Call
                <HiArrowRight />
              </Link>
              <a
                href="https://wa.me/+919763723391?text=Hello%20GOT%20Nexus%20Team,%20I%20am%20interested%20in%20website%20development%20services.%20Please%20share%20more%20details."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                <FaWhatsapp />
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default memo(Services);
