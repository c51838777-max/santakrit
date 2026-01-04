import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, History as HistoryIcon, User, LogOut, Wallet, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DriverHome from './pages/DriverHome'
import HistoryPage from './pages/HistoryPage'
import SalarySlip from './components/SalarySlip'
import { useTrips } from './hooks/useTrips'

const BottomNav = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Home, label: 'หน้าหลัก' },
    { path: '/history', icon: HistoryIcon, label: 'ประวัติ' },
    { path: '/profile', icon: User, label: 'ส่วนตัว' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 p-4 z-50 flex justify-center">
      <div className="glass w-full max-w-400 h-18 flex items-center justify-around px-6 relative py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-dim'}`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute -top-1 w-8 h-1 bg-primary rounded-full shadow-[0_0_15px_var(--primary)]"
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

const ProfilePage = () => {
  const { trips } = useTrips();
  const [showSlip, setShowSlip] = useState(false);
  const [urlDriverName, setUrlDriverName] = useState('');
  const location = useLocation();
  const driverName = localStorage.getItem('mobile_driver_name') || '';

  // Auto-open slip if 'view' parameter is present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const viewName = params.get('view');
    if (viewName) {
      setUrlDriverName(viewName);
      setShowSlip(true);
    }
  }, [location]);

  const handleOpenSlip = () => {
    const pass = prompt('กรุณาใส่รหัสผ่านเพื่อดูยอดเงินเดือน:');
    if (pass === '4565') {
      setShowSlip(true);
    } else if (pass) {
      alert('รหัสผ่านไม่ถูกต้อง');
    }
  };

  const currentDisplayName = urlDriverName || driverName;

  const getFilteredTrips = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startDate = new Date(currentYear, currentMonth - 1, 20);
    const endDate = new Date(currentYear, currentMonth, 19);

    return trips.filter(t => {
      const tName = (t.driver_name || t.driverName || '').trim();
      if (tName !== currentDisplayName.trim()) return false;
      if (!t.date) return false;
      const [y, m, d] = t.date.split('-').map(Number);
      const checkDate = new Date(y, m - 1, d);
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col items-center gap-4 py-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-4xl font-bold glass shadow-xl shadow-primary/20">
          {currentDisplayName.charAt(0) || '?'}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">{currentDisplayName || 'โปรดระบุชื่อที่หน้าหลัก'}</h2>
          <p className="text-dim text-sm uppercase tracking-widest mt-1">Driver Profile</p>
        </div>
      </header>

      <div className="space-y-4">
        <button
          onClick={handleOpenSlip}
          className="glass w-full p-5 flex justify-between items-center active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-safe/20 flex items-center justify-center text-safe">
              <Wallet size={20} />
            </div>
            <span className="font-bold">เช็คยอดเงินเดือน</span>
          </div>
          <Shield size={18} className="text-dim" />
        </button>

        <div className="text-center pt-10">
          <p className="text-[10px] text-dim opacity-50 uppercase tracking-[0.2em]">GJ Fleet Management v2.2 (Mobile)</p>
        </div>
      </div>

      <AnimatePresence>
        {showSlip && (
          <SalarySlip
            driverName={currentDisplayName}
            trips={getFilteredTrips()}
            period="รอบวันที่ 20 - 19 ของเดือนปัจจุบัน"
            onClose={() => {
              setShowSlip(false);
              setUrlDriverName(''); // Clear URL view when closed
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  const [showGlobalSlip, setShowGlobalSlip] = useState(false);
  const { trips } = useTrips();
  const driverName = localStorage.getItem('mobile_driver_name') || '';

  const getFilteredTrips = (name) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startDate = new Date(currentYear, currentMonth - 1, 20);
    const endDate = new Date(currentYear, currentMonth, 19);

    return trips.filter(t => {
      const tName = (t.driver_name || t.driverName || '').trim();
      if (tName !== name.trim()) return false;
      if (!t.date) return false;
      const [y, m, d] = t.date.split('-').map(Number);
      const checkDate = new Date(y, m - 1, d);
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const handleFabClick = () => {
    if (!driverName) {
      alert('กรุณากรอกชื่อที่หน้าหลักก่อนครับ');
      return;
    }
    const pass = prompt('กรุณาใส่รหัสผ่านเพื่อดูยอดเงินเดือน:');
    if (pass === '4565') {
      setShowGlobalSlip(true);
    } else if (pass) {
      alert('รหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <Router>
      <div className="mobile-container">
        <main className="pb-28">
          <Routes>
            <Route path="/" element={<DriverHome />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>

        {/* Removed FAB as per user request */}

        <BottomNav />

      </div>
    </Router>
  )
}

export default App
