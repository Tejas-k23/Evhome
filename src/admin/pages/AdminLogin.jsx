import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAuthService } from '../services/adminAuthService';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
    const [adminKey, setAdminKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await adminAuthService.login(adminKey);
        setLoading(false);

        if (result.success) {
            navigate('/admin/login/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="admin-login-container" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            padding: '20px'
        }}>
            <div className="login-card" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '40px',
                width: '100%',
                maxWidth: '450px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, #0EA5E9, #10B981)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        color: 'white'
                    }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h2 style={{ color: 'white', marginBottom: '8px', fontSize: '24px' }}>Admin Portal</h2>
                    <p style={{ color: '#94A3B8', fontSize: '14px' }}>Please enter your secret access key</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '24px', position: 'relative' }}>
                        <label style={{ display: 'block', color: '#E2E8F0', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>
                            Admin Secret Key
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showKey ? "text" : "password"}
                                value={adminKey}
                                onChange={(e) => setAdminKey(e.target.value)}
                                placeholder="Enter key..."
                                style={{
                                    width: '100%',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    padding: '12px 44px 12px 16px',
                                    color: 'white',
                                    fontSize: '16px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                required
                            />
                            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#94A3B8' }}
                                onClick={() => setShowKey(!showKey)}>
                                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                            </div>
                        </div>
                        {error && <p style={{ color: '#EF4444', fontSize: '13px', marginTop: '8px' }}>{error}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #0EA5E9, #0284C7)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '14px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        onMouseOver={(e) => {
                            if (!loading) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(14, 165, 233, 0.3)';
                            }
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        {loading ? 'Authenticating...' : (
                            <>
                                <Lock size={18} />
                                Access Dashboard
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <p style={{ color: '#64748B', fontSize: '12px' }}>
                        &copy; {new Date().getFullYear()} EV Home. Authorized Access Only.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
