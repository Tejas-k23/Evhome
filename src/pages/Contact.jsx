import React, { useState, memo, useCallback } from 'react';
import { HiEnvelope, HiPhone } from 'react-icons/hi2';
import { FaWhatsapp, FaQuoteLeft, FaCheck, FaPaperPlane } from 'react-icons/fa';

// Memoized Contact Info Item
const ContactInfoItem = memo(({ item }) => (
  <div className="contact-info-item">
    <div className="contact-info-icon">
      <item.icon style={{ fontSize: '1.5rem' }} />
    </div>
    <div className="contact-info-content">
      <h5>{item.title}</h5>
      <a
        href={item.link}
        target={item.title === 'WhatsApp' ? '_blank' : '_self'}
        rel="noopener noreferrer"
      >
        {item.content}
      </a>
      <p style={{ fontSize: '0.8rem', marginTop: '4px', color: 'var(--gray-500)' }}>
        {item.description}
      </p>
    </div>
  </div>
));

ContactInfoItem.displayName = 'ContactInfoItem';

// Memoized FAQ Item
const FAQItem = memo(({ faq, index }) => (
  <div
    className="faq-item gn-reveal"
    style={{ transitionDelay: `${index * 0.1}s` }}
  >
    <h5>{faq.question}</h5>
    <p className="mb-0">{faq.answer}</p>
  </div>
));

FAQItem.displayName = 'FAQItem';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, email, phone, service, message } = formData;

    const whatsappMessage = `
Hello EV Home Team,

👤 Name: ${name}
📧 Email: ${email}
📞 Phone: ${phone || 'Not provided'}
🛠 Interest: ${service || 'Not specified'}

📝 Setup Details:
${message}
`;

    const encodedMessage = encodeURIComponent(whatsappMessage.trim());

    const whatsappURL = `https://wa.me/919763723391?text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');

    setSubmitted(true);
  };


  const resetForm = useCallback(() => {
    setSubmitted(false);
    setFormData({ name: '', email: '', phone: '', service: '', message: '' });
  }, []);

  const contactInfo = [
    {
      icon: FaWhatsapp,
      title: 'WhatsApp',
      content: '9763723391',
      link: 'https://wa.me/919763723391',
      description: 'Fastest way to reach us for hardware and app support'
    }
    ,
    {
      icon: HiEnvelope,
      title: 'Email',
      content: 'ev.home@gmail.com',
      link: 'mailto:ev.home@gmail.com',
      description: 'For business inquiries and bulk commercial setups'
    },
    {
      icon: HiPhone,
      title: 'Phone',
      content: '9763723391',
      link: 'tel:+919763723391',
      description: 'Available Mon-Sun, 9am-6pm'
    }
  ];

  const faqs = [
    {
      question: 'How long does the hardware installation take?',
      answer: 'Typically, it takes 1-2 hours depending on your existing socket setup. Our team ensures a safe and clean installation with a thorough testing phase.'
    },
    {
      question: 'Is the IoT device compatible with all EVs?',
      answer: 'Yes, EV Home is designed to work with all standard home charging sockets and is compatible with any electric vehicle on the market today.'
    },
    {
      question: 'What happens if I lose internet connectivity?',
      answer: 'Our IoT device continues to track basic parameters offline and will automatically sync all data to the cloud once the connection is restored.'
    },
    {
      question: 'Can I manage multiple sockets from one account?',
      answer: 'Absolutely. Our platform is built to handle multiple charging points, whether they are in your home, second residence, or a commercial park.'
    },
    {
      question: 'Do you offer commercial solutions for apartment complexes?',
      answer: 'Yes. We provide specialized billing and scheduling tools designed specifically for shared infrastructure in multi-unit dwellings and office spaces.'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="section section-gray" style={{ paddingTop: '120px' }}>
        <div className="container">
          <div className="section-header gn-reveal">
            <span className="section-label">Get Started with EV Home</span>
            <h1>Ready to Upgrade Your Charging?</h1>
            <p>Whether you're looking for a home setup or managing a commercial facility—let's talk. Our team is ready to help you build a smarter charging future.</p>
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section style={{ paddingBottom: '20px' }}>
        <div className="container">
          <div
            className="quote-block gn-reveal"
            style={{ maxWidth: '700px', margin: '0 auto' }}
          >
            <FaQuoteLeft className="quote-icon" />
            <p>"Growth comes from clarity, not complexity. Let's simplify your path to success."</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section contact-section">
        <div className="container">
          <div className="row g-4 g-lg-5">
            {/* Contact Info */}
            <div className="col-lg-5">
              <div className="gn-reveal-left">
                <h3 className="mb-3" style={{ fontSize: '1.5rem' }}>Get In Touch</h3>
                <p className="mb-4" style={{ color: 'var(--gray-600)' }}>
                  Choose your preferred method. We're here to listen and help with your digital project.
                </p>

                {contactInfo.map((item, index) => (
                  <ContactInfoItem key={index} item={item} />
                ))}

                {/* WhatsApp CTA */}
                <div className="whatsapp-cta-box mt-4 gn-reveal">
                  <h4>
                    <FaWhatsapp style={{ marginRight: '8px', display: 'inline' }} />
                    Prefer WhatsApp?
                  </h4>
                  <p>
                    Get instant responses! Click below to start a conversation.
                  </p>
                  <a
                    href="https://wa.me/919763723391"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-chat-btn"
                  >
                    <FaWhatsapp />
                    Chat Now
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="col-lg-7">
              <div className="contact-card gn-reveal-right">
                {submitted ? (
                  <div className="text-center py-5">
                    <div className="success-icon-wrapper">
                      <FaCheck style={{ fontSize: '1.75rem', color: 'var(--accent)' }} />
                    </div>
                    <h3 style={{ marginBottom: '12px' }}>Thank You!</h3>
                    <p className="mb-4" style={{ fontSize: '1rem' }}>
                      Your message has been received. We'll get back to you within 24 hours.
                    </p>
                    <button
                      className="btn-secondary-custom"
                      onClick={resetForm}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="mb-4" style={{ fontSize: '1.35rem' }}>Send Us a Message</h3>
                    <form className="contact-form" onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="name">Full Name *</label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="Your name"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="email">Email Address *</label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="your@email.com"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="phone">Phone / WhatsApp</label>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="+1 234 567 890"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="service">What Do You Need?</label>
                            <select
                              id="service"
                              name="service"
                              value={formData.service}
                              onChange={handleChange}
                            >
                              <option value="">Select an interest</option>
                              <option value="website">Home IoT Setup</option>
                              <option value="mobile">Apartment Complex Solution</option>
                              <option value="admin">Commercial Fleet Management</option>
                              <option value="metaads">Hardware Installation</option>
                              <option value="whatsapp">Billing & App Support</option>
                              <option value="other">Other / Not Sure</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="message">Tell Us About Your Project *</label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us about your home/commercial charging setup. Any specific requirements or number of slots in mind?"
                          required
                        ></textarea>
                      </div>

                      <button type="submit" className="btn-primary-custom w-100">
                        Send Message
                        <FaPaperPlane />
                      </button>

                      <p className="form-privacy-note">
                        We respect your privacy. No spam, ever.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section section-gray">
        <div className="container">
          <div className="section-header gn-reveal">
            <span className="section-label">Common Questions</span>
            <h2>Before You Reach Out</h2>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8">
              {faqs.map((faq, index) => (
                <FAQItem key={index} faq={faq} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default memo(Contact);
