import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight, HiCodeBracket, HiCursorArrowRays } from 'react-icons/hi2';
import {
  ShieldCheck,
  Cpu,
  Leaf,
  Settings,
  Zap
} from 'lucide-react';
import { FaHandshake, FaWhatsapp, FaQuoteLeft, FaPaintBrush, FaRupeeSign, FaUserTie } from 'react-icons/fa';

// Memoized Reason Card
const ReasonCard = memo(({ reason, index }) => (
  <div
    className="col-lg-4 col-md-6 gn-reveal"
    style={{ transitionDelay: `${index * 0.1}s` }}
  >
    <div className="feature-card h-100">
      <div className="feature-icon">
        <reason.icon />
      </div>
      <h4>{reason.title}</h4>
      <p className="mb-0">{reason.description}</p>
    </div>
  </div>
));

ReasonCard.displayName = 'ReasonCard';

// Memoized Value Card
const ValueCard = memo(({ value, index }) => (
  <div
    className="col-sm-6 gn-reveal"
    style={{ transitionDelay: `${index * 0.1}s` }}
  >
    <div className="value-card">
      <h4 className="value-card-title">{value.title}</h4>
      <p className="mb-0 value-card-desc">{value.description}</p>
    </div>
  </div>
));

ValueCard.displayName = 'ValueCard';

function WhyUs() {
  const reasons = [
    {
      icon: ShieldCheck,
      title: 'Safety-First Monitoring',
      description: 'Real-time tracking of voltage and current parameters ensuring your vehicle and home electrical system are always protected.'
    },
    {
      icon: Cpu,
      title: 'Reliable IoT Hardware',
      description: 'Our custom-designed IoT devices provide stable connectivity and high-precision energy tracking you can depend on.'
    },
    {
      icon: Leaf,
      title: 'Energy Efficiency',
      description: 'Optimize your charging schedules to take advantage of off-peak hours and reduce your overall electricity costs.'
    },
    {
      icon: FaRupeeSign,
      title: 'Transparent Billing',
      description: 'Zero manual calculation. Our system automatically generates accurate bills based on exact energy consumed in every session.'
    },
    {
      icon: FaUserTie,
      title: 'Dedicated Support',
      description: 'From hardware installation to app troubleshooting, our team is always available to ensure your charging system runs smoothly.'
    },
    {
      icon: FaHandshake,
      title: 'Future-Proof Solution',
      description: 'As EV technology evolves, our cloud-integrated platform receives regular updates to bring you the latest in smart charging.'
    }
  ];

  const values = [
    {
      title: 'Reliability',
      description: 'Our IoT devices and cloud platform are built for 24/7 uptime, ensuring your EV is always ready for the road.'
    },
    {
      title: 'Safety',
      description: 'We prioritize electrical safety with real-time parameter monitoring and automated emergency shut-offs.'
    },
    {
      title: 'Transparency',
      description: 'Clear, honest data tracking and automated billing summaries mean you always know exactly what you are paying for.'
    },
    {
      title: 'Innovation',
      description: 'We are constantly refining our smart charging algorithms to make energy management even more effortless.'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="section section-gray" style={{ paddingTop: '120px' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="gn-reveal-left">
                <span className="section-label">Why Choose EV Home</span>
                <h1>Charging Smarter, Safer, and More Efficiently</h1>
                <p style={{ fontSize: '1.05rem' }}>
                  Managing home EV charging shouldn't be a chore. Here is why thousands of users trust EV Home for their daily charging needs.
                </p>
                <Link to="/contact" className="btn-primary-custom mt-3">
                  Let's Talk
                  <HiArrowRight />
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="gn-reveal-right">
                <img
                  src="media/laptop-quote.jpg"
                  alt="Why Choose Got Nexuses"
                  loading="eager"
                  style={{
                    width: '60%',
                    padding: '5px',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="section" style={{ paddingTop: '0', paddingBottom: '40px' }}>
        <div className="container">
          <div
            className="quote-block gn-reveal"
            style={{ maxWidth: '800px', margin: '0 auto' }}
          >
            <FaQuoteLeft className="quote-icon" />
            <p>"Smart charging is not just about power—it's about confidence and control."</p>
          </div>
        </div>
      </section>

      {/* Reasons Section */}
      <section className="section section-gray">
        <div className="container">
          <div className="section-header gn-reveal">
            <span className="section-label">The EV Home Advantage</span>
            <h2>What Makes Us Different</h2>
            <p>We combine high-end IoT hardware with seamless software to create the perfect charging ecosystem.</p>
          </div>

          <div className="row g-4">
            {reasons.map((reason, index) => (
              <ReasonCard key={index} reason={reason} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section section-dark">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 mb-4 mb-lg-0">
              <div className="gn-reveal-left">
                <span className="section-label" style={{ color: 'var(--primary-light)' }}>Our Values</span>
                <h2>Built on Principles That Matter</h2>
                <p style={{ color: 'var(--gray-300)', marginBottom: '24px' }}>
                  These aren't just words on a website. They're the principles that guide every project, every conversation, and every decision we make.
                </p>
                <img
                  src="media/devices.png"
                  alt="Our Values"
                  loading="lazy"
                  style={{ maxWidth: '70%', borderRadius: 'var(--radius-lg)' }}
                />
              </div>
            </div>
            <div className="col-lg-7">
              <div className="row g-4">
                {values.map((value, index) => (
                  <ValueCard key={index} value={value} index={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-4 mb-4 mb-lg-0 text-center text-lg-start">
              <div className="gn-reveal-scale">
                <img
                  src="media/best logo.png"
                  alt="Founder"
                  loading="lazy"
                  style={{
                    width: '100%',
                    maxWidth: '280px',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)'
                  }}
                />
              </div>
            </div>
            <div className="col-lg-8">
              <div className="gn-reveal-right">
                <span className="section-label">Our Vision</span>
                <h2 className="mb-4">Building a Smarter Electric Future</h2>
                <p style={{ fontSize: '1.05rem' }}>
                  When I started EV Home, the goal was simple: make home EV charging as easy as plugging in a phone. I realized that for EVs to truly go mainstream, we needed more than just a plug—we needed intelligence.
                </p>
                <p style={{ fontSize: '1.05rem' }}>
                  Our platform is designed to give you complete peace of mind. By integrating real-time IoT monitoring with automated billing and smart slot booking, we've removed the guesswork from home charging.
                </p>
                <p style={{ fontSize: '1.05rem', fontWeight: '500', color: 'var(--secondary)' }}>
                  When we work together, you get ownership, accountability, and a genuine partner invested in your success.
                </p>
                <div className="d-flex flex-wrap gap-3 mt-4">
                  <Link to="/contact" className="btn-primary-custom">
                    Let's Connect
                    <HiArrowRight />
                  </Link>
                  <a
                    href="https://wa.me/+919763723391?text=Hello%20GOT%20Nexus%20Team,%20I%20am%20interested%20in%20website%20development%20services.%20Please%20share%20more%20details."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp"
                  >
                    <FaWhatsapp />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content gn-reveal">
            <h2>Ready to Experience Smarter Charging?</h2>
            <p>Join the EV Home community today and take full control of your home charging station.</p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link to="/contact" className="btn-primary-custom">
                Start a Conversation
                <HiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default memo(WhyUs);
