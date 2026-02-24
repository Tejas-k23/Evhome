import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight, HiChartBar } from 'react-icons/hi2';
import { FaWhatsapp } from 'react-icons/fa';

// Memoized Project Card
const ProjectCard = memo(({ project, index }) => (
  <div
    className="col-lg-6 gn-reveal"
    style={{ transitionDelay: `${index * 0.1}s` }}
  >
    <div className="project-card h-100">
      <div className="project-image">
        <img src={project.image} alt={project.title} loading="lazy" />
        <span className="project-badge">{project.category}</span>
      </div>
      <div className="project-content">
        <h4 style={{ marginBottom: '16px' }}>{project.title}</h4>

        <div style={{ marginBottom: '12px' }}>
          <strong style={{ color: 'var(--gray-700)', fontSize: '0.85rem' }}>The Challenge:</strong>
          <p style={{ fontSize: '0.9rem', marginBottom: '0', marginTop: '4px' }}>{project.problem}</p>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <strong style={{ color: 'var(--gray-700)', fontSize: '0.85rem' }}>What We Built:</strong>
          <p style={{ fontSize: '0.9rem', marginBottom: '0', marginTop: '4px' }}>{project.solution}</p>
        </div>

        <div className="project-result-box">
          <strong style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>
            <HiChartBar style={{ marginRight: '8px', display: 'inline' }} />Result:
          </strong>
          <p style={{ fontSize: '0.9rem', marginBottom: '0', marginTop: '4px', color: 'var(--gray-700)' }}>
            {project.result}
          </p>
        </div>

        <div className="project-tags">
          {project.tags.map((tag, idx) => (
            <span className="project-tag" key={idx}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  </div>
));

ProjectCard.displayName = 'ProjectCard';

function Projects() {
  const projects = [
    {
      image: 'media/realestate.jpg',
      title: 'Private Residential Charging',
      category: 'Home Setup',
      problem: 'Individual EV owners needed a way to track energy costs and ensure their home electrical load was safe.',
      solution: 'Installed EV Home IoT device with real-time parameter tracking and automated billing via our mobile app.',
      result: '100% accurate cost tracking and zero electrical safety incidents across all installations.',
      tags: ['Home Charging', 'IoT Monitoring', 'Safety First']
    },
    {
      image: 'media/hotel-booking.png',
      title: 'Multi-Unit Apartment Charging',
      category: 'Shared Infrastructure',
      problem: 'Apartment complexes struggled with fair billing and scheduling for shared charging points.',
      solution: 'Implemented slot booking and individual user billing based on actual energy usage tracked by our IoT hardware.',
      result: 'Eliminated billing disputes and increased charging point utilization by 40% through smart scheduling.',
      tags: ['Shared Charging', 'Smart Booking', 'Automated Billing']
    },
    {
      image: 'media/mobile-app.webp',
      title: 'Office & Corporate Fleet Charging',
      category: 'Commercial Use',
      problem: 'Companies needed to manage charging for employee vehicles and corporate fleets with centralized control.',
      solution: 'Developed a cloud-based dashboard for managing multiple sockets with tiered access and detailed usage reports.',
      result: 'Streamlined fleet operations and improved employee satisfaction with 24/7 charging availability.',
      tags: ['Fleet Management', 'Admin Dashboard', 'Corporate Solutions']
    },
    {
      image: 'media/admin-dashboard.webp',
      title: 'Smart Socket Retrofitting',
      category: 'Legacy Upgrade',
      problem: 'A property manager wanted to convert existing "dumb" sockets into smart charging points without full replacement.',
      solution: 'Retrofitted existing infrastructure with EV Home IoT modules, enabling remote monitoring and billing.',
      result: 'Upgraded 50+ charging points at 30% of the cost of new equipment installation.',
      tags: ['IoT Retrofit', 'Legacy Hardware', 'Cost Efficiency']
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="section section-gray" style={{ paddingTop: '120px' }}>
        <div className="container">
          <div className="section-header gn-reveal">
            <span className="section-label">Real-World Charging Solutions</span>
            <h1>Success Stories with EV Home</h1>
            <p>Our IoT platform is powering smarter charging across homes, apartments, and businesses. See how we’ve made a difference.</p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="section">
        <div className="container">
          <div className="row g-4">
            {projects.map((project, index) => (
              <ProjectCard key={index} project={project} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="section section-gray">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="gn-reveal-left">
                <img
                  src="media/responsive-layout.png"
                  alt="Our Approach"
                  loading="lazy"
                  style={{
                    width: '75%',
                    borderRadius: 'var(--radius-lg)'
                  }}
                />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="gn-reveal-right">
                <span className="section-label">Our Approach</span>
                <h2 className="mb-4">Designed for the Real World</h2>
                <p style={{ fontSize: '1.05rem' }}>
                  Whether you are a single home owner or a commercial property manager, our platform is designed to be flexible and scalable. We don't just provide hardware; we provide a complete energy management solution.
                </p>
                <p style={{ fontSize: '1.05rem' }}>
                  Safety, transparency, and ease of use are at the core of every installation. We ensure that your EV charging infrastructure is not just a utility, but a smart asset.
                </p>
                <p style={{ fontSize: '1.05rem', fontWeight: '500', color: 'var(--secondary)' }}>
                  Intelligent design. Reliable hardware. Seamless software. That's the EV Home promise.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content gn-reveal">
            <h2>Have a Charging Challenge for Us?</h2>
            <p>Let's discuss how EV Home can help you manage your charging infrastructure more effectively.</p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link to="/contact" className="btn-primary-custom">
                Discuss Your Hardware Setup
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

export default memo(Projects);
