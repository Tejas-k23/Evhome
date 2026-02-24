import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { authService } from '../services/authService';

const Auth = () => {
    const [activeTab, setActiveTab] = useState('signup');
    const [step, setStep] = useState(1); // 1: details, 2: otp
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [testOtp, setTestOtp] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    const handleVehicleChange = (e) => {
        let val = e.target.value.toUpperCase();
        // basic sanitization: MH 12 TK 0210
        setVehicleNumber(val);
    };

    const validateDetails = () => {
        if (!vehicleNumber.trim()) return "Vehicle number is required";
        if (mobileNumber.length !== 10) return "Mobile number must be 10 digits";
        return null;
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        const err = validateDetails();
        if (err) {
            setError(err);
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await authService.sendOtp(vehicleNumber, mobileNumber);
            if (res.success) {
                setStep(2);
                setTestOtp(res.testOtp);
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError("Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError("OTP must be 6 digits");
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await authService.verifyOtp(vehicleNumber, mobileNumber, otp);
            if (res.success) {
                login(res.user, res.token);
                navigate(from, { replace: true });
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError("Verification failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', paddingTop: '120px' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-5 col-md-8">
                        <div className="service-card" style={{ padding: '40px' }}>
                            <div className="text-center mb-4">
                                <h2 className="mb-2">{step === 1 ? (activeTab === 'signup' ? 'Create Account' : 'Welcome Back') : 'Verify OTP'}</h2>
                                <p className="text-muted">
                                    {step === 1
                                        ? 'Enter your vehicle details to continue'
                                        : `OTP sent to ${mobileNumber}`}
                                </p>
                            </div>

                            {error && (
                                <div className="alert alert-danger" style={{ fontSize: '0.9rem', borderRadius: '8px', padding: '10px 15px', marginBottom: '20px' }}>
                                    {error}
                                </div>
                            )}

                            {step === 1 ? (
                                <>
                                    <div className="d-flex mb-4" style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-full)', padding: '5px' }}>
                                        <button
                                            className={`btn w-50 ${activeTab === 'signup' ? 'btn-primary-custom' : 'btn-link text-decoration-none text-secondary'}`}
                                            onClick={() => setActiveTab('signup')}
                                            style={{ fontSize: '0.9rem', minHeight: '40px', padding: '8px' }}
                                        >
                                            Signup
                                        </button>
                                        <button
                                            className={`btn w-50 ${activeTab === 'login' ? 'btn-primary-custom' : 'btn-link text-decoration-none text-secondary'}`}
                                            onClick={() => setActiveTab('login')}
                                            style={{ fontSize: '0.9rem', minHeight: '40px', padding: '8px' }}
                                        >
                                            Login
                                        </button>
                                    </div>

                                    <form onSubmit={handleSendOtp}>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Vehicle Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="MH 12 TK 0210"
                                                value={vehicleNumber}
                                                onChange={handleVehicleChange}
                                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label small fw-bold">Mobile Number</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                placeholder="10-digit number"
                                                maxLength="10"
                                                value={mobileNumber}
                                                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn-primary-custom w-100"
                                            disabled={loading}
                                        >
                                            {loading ? 'Sending...' : 'Send OTP'}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <form onSubmit={handleVerifyOtp}>
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold">Enter 6-digit OTP</label>
                                        <input
                                            type="text"
                                            className="form-control text-center fw-bold"
                                            placeholder="000000"
                                            maxLength="6"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)', fontSize: '1.2rem', letterSpacing: '8px' }}
                                        />
                                        <div className="mt-3 text-center">
                                            <span className="badge bg-info text-dark" style={{ padding: '8px 12px' }}>
                                                Test OTP: {testOtp}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn-primary-custom w-100 mb-3"
                                        disabled={loading}
                                    >
                                        {loading ? 'Verifying...' : 'Verify & Login'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn w-100 text-primary small"
                                        onClick={() => setStep(1)}
                                        style={{ background: 'none', border: 'none', fontSize: '0.9rem' }}
                                    >
                                        Change Details
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
