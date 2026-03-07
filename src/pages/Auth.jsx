import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { authService } from '../services/authService';

const MSG91_WIDGET_ID = import.meta.env.VITE_MSG91_WIDGET_ID || '3663626a3276323630323933';
const MSG91_AUTH_KEY = import.meta.env.VITE_MSG91_AUTH_KEY || '';

const Auth = () => {
    const [activeTab, setActiveTab] = useState('signup');
    const [intent, setIntent] = useState('signup');
    const [step, setStep] = useState(1); // 1: details, 2: otp
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [authFailHelp, setAuthFailHelp] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    const msg91ScriptLoaded = useRef(false);
    const timerRef = useRef(null);
    const reqIdRef = useRef(null);

    useEffect(() => {
        if (MSG91_AUTH_KEY) loadMsg91Script();
    }, []);

    useEffect(() => {
        if (resendTimer > 0) {
            timerRef.current = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        }
        return () => clearTimeout(timerRef.current);
    }, [resendTimer]);

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

    const loadMsg91Script = () => {
        return new Promise((resolve) => {
            if (msg91ScriptLoaded.current && typeof window.initSendOTP === 'function') {
                resolve();
                return;
            }
            const urls = [
                'https://verify.msg91.com/otp-provider.js',
                'https://verify.phone91.com/otp-provider.js'
            ];
            let i = 0;
            const attempt = () => {
                const s = document.createElement('script');
                s.src = urls[i];
                s.async = true;
                s.onload = () => {
                    msg91ScriptLoaded.current = true;
                    resolve();
                };
                s.onerror = () => {
                    i++;
                    if (i < urls.length) attempt();
                    else resolve();
                };
                document.head.appendChild(s);
            };
            attempt();
        });
    };

    const msg91ConfigRef = useRef(null);

    useEffect(() => {
        if (step !== 2 || !MSG91_AUTH_KEY || !msg91ConfigRef.current || !mobileNumber) return;
        const identifier = `91${mobileNumber}`;
        const cfg = msg91ConfigRef.current;
        loadMsg91Script().then(() => {
            if (typeof window.initSendOTP !== 'function') return;
            window.initSendOTP(cfg);
            if (typeof window.sendOtp === 'function') {
                window.sendOtp(
                    identifier,
                    (data) => {
                        reqIdRef.current = data?.reqId || data?.request_id || data?.message;
                        setLoading(false);
                    },
                    (err) => {
                        const msg = typeof err === 'string' ? err : (err?.message || err?.reason || err?.toString?.() || JSON.stringify(err));
                        const isAuthFail = msg && /AuthenticationFailure|auth|token/i.test(msg);
                        setError(isAuthFail ? 'AuthenticationFailure — Use OTP Widget token from MSG91 Token section.' : (msg || 'Failed to send OTP'));
                        setAuthFailHelp(isAuthFail);
                        setLoading(false);
                    }
                );
            }
        });
    }, [step, mobileNumber]);

    const handleSendOtp = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const err = validateDetails();
        if (err) {
            setError(err);
            return;
        }

        if (!MSG91_AUTH_KEY) {
            setError('OTP service is not configured. Please set VITE_MSG91_AUTH_KEY.');
            return;
        }

        setLoading(true);
        setError('');
        setAuthFailHelp(false);
        try {
            await authService.validateForMsg91(vehicleNumber, mobileNumber, activeTab);
            setIntent(activeTab);
            setStep(2);
            setOtp('');
            setResendTimer(30);
            const identifier = `91${mobileNumber}`;
            const intentVal = activeTab;
            msg91ConfigRef.current = {
                widgetId: MSG91_WIDGET_ID,
                tokenAuth: MSG91_AUTH_KEY,
                authToken: MSG91_AUTH_KEY,
                identifier,
                exposeMethods: true,
                success: async (data) => {
                    const token = data?.token || data?.accessToken || data;
                    if (token) {
                        setLoading(true);
                        setError('');
                        try {
                            const res = await authService.verifyMsg91Token(
                                vehicleNumber, mobileNumber, token, intentVal
                            );
                            if (res.success) {
                                login(res.user, res.token);
                                navigate(from, { replace: true });
                            } else {
                                setError(res.message || 'Verification failed');
                            }
                        } catch (err) {
                            setError(err.message || 'Verification failed');
                        } finally {
                            setLoading(false);
                        }
                    }
                },
                    failure: (err) => {
                        const msg = typeof err === 'string' ? err : (err?.message || err?.reason || err?.toString?.() || JSON.stringify(err));
                        const isAuthFail = msg && /AuthenticationFailure|auth|token/i.test(msg);
                        const displayMsg = isAuthFail
                            ? 'AuthenticationFailure — VITE_MSG91_AUTH_KEY must be the OTP Widget token from MSG91, not the main authkey. See steps below.'
                            : (msg || 'OTP verification failed');
                        setError(displayMsg);
                        setAuthFailHelp(isAuthFail);
                        setLoading(false);
                    },
            };
        } catch (err) {
            setError(err.message || "Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length !== 4) {
            setError('OTP must be 4 digits');
            return;
        }
        setLoading(true);
        setError('');
        if (typeof window.verifyOtp === 'function') {
            window.verifyOtp(
                otp,
                async (data) => {
                    const token = data?.token || data?.accessToken || data?.message || (typeof data === 'string' ? data : null);
                    if (token) {
                        try {
                            const res = await authService.verifyMsg91Token(
                                vehicleNumber, mobileNumber, token, intent
                            );
                            if (res.success) {
                                login(res.user, res.token);
                                navigate(from, { replace: true });
                            } else {
                                setError(res.message || 'Verification failed');
                            }
                        } catch (err) {
                            setError(err.message || 'Verification failed');
                        }
                    }
                    setLoading(false);
                },
                (err) => {
                    const msg = typeof err === 'string' ? err : (err?.message || err?.reason || err?.toString?.() || '');
                    setError(msg || 'Invalid or expired OTP');
                    setLoading(false);
                },
                reqIdRef.current
            );
        } else {
            setError('OTP verification not available');
            setLoading(false);
        }
    };

    const handleResendOtp = () => {
        if (resendTimer > 0) return;
        setOtp('');
        setError('');
        setLoading(true);
        const identifier = `91${mobileNumber}`;
        if (typeof window.sendOtp === 'function') {
            window.sendOtp(
                identifier,
                (data) => {
                    reqIdRef.current = data?.reqId || data?.request_id || data?.message;
                    setResendTimer(30);
                    setLoading(false);
                },
                (err) => {
                    const msg = typeof err === 'string' ? err : (err?.message || err?.reason || '');
                    const isAuthFail = msg && /AuthenticationFailure|auth|token/i.test(msg);
                    setError(msg || 'Failed to resend OTP');
                    setAuthFailHelp(isAuthFail);
                    setLoading(false);
                }
            );
        } else {
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
                                <>
                                    <div className="alert alert-danger" style={{ fontSize: '0.9rem', borderRadius: '8px', padding: '10px 15px', marginBottom: authFailHelp ? '10px' : '20px' }}>
                                        {error}
                                    </div>
                                    {authFailHelp && (
                                        <div className="alert alert-info small" style={{ borderRadius: '8px', padding: '12px 15px', marginBottom: '20px', textAlign: 'left' }}>
                                            <strong>How to fix AuthenticationFailure:</strong>
                                            <ol className="mb-0 mt-2 ps-3" style={{ lineHeight: 1.6 }}>
                                                <li>Log in to <a href="https://control.msg91.com" target="_blank" rel="noopener noreferrer">MSG91 Dashboard</a></li>
                                                <li>Go to <strong>Token</strong> (left sidebar) → <strong>Generate New Token</strong></li>
                                                <li>Copy the token value and set <code>VITE_MSG91_AUTH_KEY</code> in your <code>.env</code></li>
                                                <li>In <strong>OTP</strong> → your widget → <strong>Select token</strong>, choose this token</li>
                                                <li>Ensure the token is <strong>Enabled</strong> (vertical dots → Enable)</li>
                                                <li>Restart your dev server after updating <code>.env</code></li>
                                            </ol>
                                            <p className="mb-0 mt-2 small text-muted">Use the Widget Token, not the main authkey.</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {step === 1 ? (
                                <>
                                    <div className="d-flex mb-4" style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-full)', padding: '5px' }}>
                                        <button
                                            type="button"
                                            className={`btn w-50 ${activeTab === 'signup' ? 'btn-primary-custom' : 'btn-link text-decoration-none text-secondary'}`}
                                            onClick={() => { setActiveTab('signup'); setError(''); setAuthFailHelp(false); if (step === 2) setStep(1); }}
                                            style={{ fontSize: '0.9rem', minHeight: '40px', padding: '8px' }}
                                        >
                                            Signup
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn w-50 ${activeTab === 'login' ? 'btn-primary-custom' : 'btn-link text-decoration-none text-secondary'}`}
                                            onClick={() => { setActiveTab('login'); setError(''); setAuthFailHelp(false); if (step === 2) setStep(1); }}
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
                                        <label className="form-label small fw-bold">Enter 4-digit OTP</label>
                                        <input
                                            type="text"
                                            className="form-control text-center fw-bold"
                                            placeholder="0000"
                                            maxLength="4"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)', fontSize: '1.2rem', letterSpacing: '8px' }}
                                        />
                                        <div className="mt-3 text-center">
                                            {resendTimer > 0 ? (
                                                <span className="text-muted small">Resend OTP in {resendTimer}s</span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn btn-link p-0 small text-primary"
                                                    disabled={loading}
                                                    onClick={handleResendOtp}
                                                >
                                                    Resend OTP
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn-primary-custom w-100 mb-3"
                                        disabled={loading}
                                    >
                                        {loading ? 'Verifying...' : intent === 'login' ? 'Verify & Login' : 'Verify & Create Account'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn w-100 text-primary small"
                                        onClick={() => { setStep(1); setError(''); setAuthFailHelp(false); setOtp(''); msg91ConfigRef.current = null; }}
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
