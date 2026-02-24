import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { HiHome, HiArrowLeft, HiExclamationTriangle } from 'react-icons/hi2';

const NotFound = memo(() => {
  return (
    <section className="section not-found-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 text-center">
            <div className="gn-reveal">
              <div className="not-found-icon">
                <HiExclamationTriangle />
              </div>
              <h1 className="not-found-title">404</h1>
              <h2 className="mb-4">Page Not Found</h2>
              <p className="mb-4 not-found-text">
                Oops! The page you're looking for doesn't exist or has been moved.
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <Link to="/" className="btn-primary-custom">
                  <HiHome />
                  Back to Home
                </Link>
                <button 
                  onClick={() => window.history.back()} 
                  className="btn-secondary-custom"
                >
                  <HiArrowLeft />
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

NotFound.displayName = 'NotFound';

export default NotFound;
