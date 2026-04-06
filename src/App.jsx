import './index.css'
import './animations.css'
import AnimationEffects from './AnimationEffects'
import { Routes, Route, useLocation } from "react-router-dom"
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Services from './pages/Services'
import WhyUs from './pages/WhyUs'
import Projects from './pages/Projects'
import Contact from './pages/Contact'
import NotFound from './components/NotFound'

// New Imports
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import BookSlot from './pages/BookSlot'
import { Bookings, Bills } from './pages/History'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/authContext'

// Admin Imports
import AdminLogin from './admin/pages/AdminLogin'
import AdminProtectedRoute from './admin/components/AdminProtectedRoute'
import AdminLayout from './admin/components/AdminLayout'
import AdminDashboard from './admin/pages/AdminDashboard'
import Stations from './admin/pages/Stations'
import UsersManagement from './admin/pages/Users'
import AdminBookings from './admin/pages/Bookings'
import BillsManagement from './admin/pages/Bills'

// Owner Imports
import OwnerLogin from './owner/pages/OwnerLogin'
import OwnerProtectedRoute from './owner/components/OwnerProtectedRoute'
import OwnerLayout from './owner/components/OwnerLayout'
import OwnerDashboard from './owner/pages/OwnerDashboard'
import MyStations from './owner/pages/MyStations'
import StationDetails from './owner/pages/StationDetails'
import OwnerBookings from './owner/pages/BookingsManagement'
import SessionsMonitoring from './owner/pages/SessionsMonitoring'
import RevenueBills from './owner/pages/RevenueBills'

function App() {
  const location = useLocation()
  const isOwnerRoute = location.pathname.startsWith('/owner')

  return (
    <AuthProvider>
      <AnimationEffects>
        <ScrollToTop />
        {!isOwnerRoute ? <Navbar /> : null}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/why-us" element={<WhyUs />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth Routes */}
          <Route path="/auth" element={<Auth />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/book-slot" element={
            <ProtectedRoute>
              <BookSlot />
            </ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          } />
          <Route path="/bills" element={
            <ProtectedRoute>
              <Bills />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin123/login" element={<AdminLogin />} />
          <Route path="/admin123" element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="stations" element={<Stations />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="bills" element={<BillsManagement />} />
          </Route>

          {/* Owner Routes */}
          <Route path="/owner/login" element={<OwnerLogin />} />
          <Route path="/owner" element={
            <OwnerProtectedRoute>
              <OwnerLayout />
            </OwnerProtectedRoute>
          }>
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="stations" element={<MyStations />} />
            <Route path="stations/:stationId" element={<StationDetails />} />
            <Route path="bookings" element={<OwnerBookings />} />
            <Route path="sessions" element={<SessionsMonitoring />} />
            <Route path="revenue" element={<RevenueBills />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </AnimationEffects>
    </AuthProvider>
  )
}


export default App
