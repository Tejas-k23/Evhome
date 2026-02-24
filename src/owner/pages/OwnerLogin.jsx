import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ownerAuthService } from '../services/ownerAuthService';
import { Phone, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const OwnerLogin = () => {
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Mobile, 2: OTP
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSendOTP = (e) => {
        e.preventDefault();
        if (mobileNumber.length < 10) {
            setError("Please enter a valid mobile number");
            return;
        }
        setLoading(true);
        setError(null);
        // Simulate OTP send
        setTimeout(() => {
            setStep(2);
            setLoading(false);
        }, 1000);
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await ownerAuthService.login(mobileNumber, otp);
            navigate('/owner/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                background: 'white',
                borderRadius: '24px',
                padding: '40px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: '#DCFCE7',
                        color: '#16A34A',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1E293B', marginBottom: '8px' }}>Owner Portal</h2>
                    <p style={{ color: '#64748B' }}>Manage your charging stations</p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px 16px',
                        background: '#FEF2F2',
                        color: '#DC2626',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        fontSize: '14px',
                        fontWeight: '500',
                        border: '1px solid #FEE2E2'
                    }}>
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOTP}>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Mobile Number</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input
                                    type="tel"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Enter mobile number"
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px 14px 48px',
                                        background: '#F8FAFC',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    required
                                />
                            </div>
                            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>Demo: 9876543210</p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: '#22C55E',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                        >
                            {loading ? "Sending..." : "Send OTP"}
                            <ArrowRight size={18} />
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP}>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Enter OTP</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Enter 6-digit OTP"
                                    maxLength={6}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px 14px 48px',
                                        background: '#F8FAFC',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    required
                                />
                            </div>
                            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>Demo OTP: 123456</p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: '#22C55E',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                        >
                            {loading ? "Verifying..." : "Verify & Login"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'transparent',
                                color: '#64748B',
                                border: 'none',
                                marginTop: '12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Change Number
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '24px' }}>
                    <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
                        Email Login? Use <br />
                        <span style={{ color: '#475569', fontWeight: 'bold' }}>owner@evhome.com / Owner@123</span>
                    </p>
                    <button
                        onClick={async () => {
                            try {
                                await ownerAuthService.loginWithEmail("owner@evhome.com", "Owner@123");
                                navigate('/owner/dashboard');
                            } catch (e) { setError(e.message); }
                        }}
                        style={{ background: 'none', border: 'none', color: '#22C55E', fontWeight: '700', fontSize: '13px', marginTop: '8px', cursor: 'pointer' }}
                    >
                        Click here for Demo Email Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OwnerLogin;
