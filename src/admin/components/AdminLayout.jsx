import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    MapPin,
    Users,
    CalendarCheck,
    ReceiptIndianRupee,
    LogOut,
    Menu,
    X,
    Bell,
    UserCircle
} from 'lucide-react';
import { adminAuthService } from '../services/adminAuthService';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        adminAuthService.logout();
        navigate('/admin123');
    };

    const menuItems = [
        { path: '/admin123/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/admin123/stations', icon: <MapPin size={20} />, label: 'Stations' },
        { path: '/admin123/users', icon: <Users size={20} />, label: 'Users' },
        { path: '/admin123/bookings', icon: <CalendarCheck size={20} />, label: 'Bookings' },
        { path: '/admin123/bills', icon: <ReceiptIndianRupee size={20} />, label: 'Bills & Revenue' },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
            {/* Sidebar */}
            <aside style={{
                width: isSidebarOpen ? '260px' : '80px',
                background: '#0F172A',
                color: 'white',
                transition: 'width 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1000,
                position: 'fixed',
                height: '100vh'
            }}>
                <div style={{
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isSidebarOpen ? 'space-between' : 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {isSidebarOpen && <span style={{ fontWeight: '800', fontSize: '20px', letterSpacing: '1px' }}>EV HOME <span style={{ color: '#0EA5E9' }}>ADMIN</span></span>}
                    <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav style={{ flex: 1, padding: '20px 12px' }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px',
                                    marginBottom: '8px',
                                    borderRadius: '12px',
                                    color: isActive ? 'white' : '#94A3B8',
                                    background: isActive ? '#0EA5E9' : 'transparent',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s',
                                    justifyContent: isSidebarOpen ? 'flex-start' : 'center'
                                }}
                            >
                                <span style={{ marginRight: isSidebarOpen ? '12px' : '0' }}>{item.icon}</span>
                                {isSidebarOpen && <span style={{ fontWeight: '500' }}>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ padding: '20px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px',
                            borderRadius: '12px',
                            color: '#F87171',
                            background: 'rgba(248, 113, 113, 0.1)',
                            border: 'none',
                            cursor: 'pointer',
                            justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        <span style={{ marginRight: isSidebarOpen ? '12px' : '0' }}><LogOut size={20} /></span>
                        {isSidebarOpen && <span style={{ fontWeight: '600' }}>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: isSidebarOpen ? '260px' : '80px',
                transition: 'margin-left 0.3s ease',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Topbar */}
                <header style={{
                    height: '70px',
                    background: 'white',
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 32px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 900
                }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>
                        {menuItems.find(m => m.path === location.pathname)?.label || 'Admin Panel'}
                    </h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <button style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', position: 'relative' }}>
                            <Bell size={20} />
                            <span style={{
                                position: 'absolute',
                                top: '-2px',
                                right: '-2px',
                                width: '8px',
                                height: '8px',
                                background: '#EF4444',
                                borderRadius: '50%',
                                border: '2px solid white'
                            }}></span>
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', margin: 0 }}>System Admin</p>
                                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Superuser</p>
                            </div>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                background: '#E2E8F0',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#64748B'
                            }}>
                                <UserCircle size={24} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
