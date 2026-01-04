import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTrips } from '../hooks/useTrips';
import { getLocalDate } from '../utils/dateUtils';
import { Save, Truck, History, ChevronRight, Fuel, MapPin, User, Package, Banknote, Wrench, DollarSign, Camera, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DriverHome = () => {
    const { addTrip, routePresets, trips, loading } = useTrips();
    const [submitted, setSubmitted] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        driverName: localStorage.getItem('mobile_driver_name') || '',
        route: '',
        price: '',
        fuel: '',
        wage: '',
        maintenance: '',
        basketCount: '',
        basket: 0,
        basketShare: 0,
        date: getLocalDate(),
        fuelBill: null,
        maintenanceBill: null,
        basketBill: null
    });

    const fuelInputRef = useRef(null);
    const maintenanceInputRef = useRef(null);
    const basketInputRef = useRef(null);

    // Calculate Personal Stats for the Driver
    const personalStats = useMemo(() => {
        if (!formData.driverName) return { trips: 0, earnings: 0, fuel: 0 };

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const startDate = new Date(currentYear, currentMonth - 1, 20);
        const endDate = new Date(currentYear, currentMonth, 19);

        const driverTrips = trips.filter(t => {
            const tName = (t.driver_name || t.driverName || '').trim();
            if (tName !== formData.driverName.trim()) return false;
            if (!t.date) return false;
            const [y, m, d] = t.date.split('-').map(Number);
            const checkDate = new Date(y, m - 1, d);
            return checkDate >= startDate && checkDate <= endDate;
        });

        return driverTrips.reduce((acc, trip) => {
            acc.trips += 1;
            acc.earnings += (parseFloat(trip.wage) || 0) + (parseFloat(trip.staff_share || trip.basketShare) || 0);
            acc.fuel += (parseFloat(trip.fuel) || 0);
            return acc;
        }, { trips: 0, earnings: 0, fuel: 0 });
    }, [trips, formData.driverName]);

    const handleRouteChange = (e) => {
        const routeName = e.target.value;
        const preset = routePresets[routeName];
        setFormData(prev => ({
            ...prev,
            route: routeName,
            price: preset ? preset.price : prev.price,
            wage: preset ? preset.wage : prev.wage
        }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, [type]: file }));
        }
    };

    const handleBasketChange = (val) => {
        const count = parseInt(val) || 0;
        let rev = 0;
        let share = 0;
        if (count >= 101) { rev = 1000; share = 700; }
        else if (count >= 91) { rev = 600; share = 400; }
        else if (count >= 86) { rev = 300; share = 200; }

        setFormData(prev => ({
            ...prev,
            basketCount: val,
            basket: rev,
            basketShare: share
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.route || !formData.driverName) {
            alert('กรุณากรอกข้อมูลให้ครบ');
            return;
        }

        setUploading(true);
        const { error } = await addTrip(formData);
        setUploading(false);

        if (!error) {
            setSubmitted(true);
            setFormData(prev => ({
                ...prev,
                route: '',
                price: '',
                fuel: '',
                wage: '',
                maintenance: '',
                basketCount: '',
                basket: 0,
                basketShare: 0,
                date: getLocalDate(),
                fuelBill: null,
                maintenanceBill: null,
                basketBill: null
            }));
            setTimeout(() => {
                setSubmitted(false);
                window.location.reload(); // Force refresh to sync data
            }, 2000);
        } else {
            console.error('Submit error:', error);
            alert('❌ บันทึกไม่สำเร็จ: ' + (error.message || 'ปัญหาการเชื่อมต่อฐานข้อมูล'));
        }
    };

    return (
        <div className="p-4 space-y-6">
            <header className="flex justify-between items-center px-2 py-4">
                <div className="flex flex-col">
                    <h1 className="brand-logo text-2xl">SK FLEET</h1>
                    <p className="brand-subtitle">SOLUTIONS</p>
                </div>
                <div className="glass p-3">
                    <Truck className="text-primary" size={24} />
                </div>
            </header>

            <div className="grid grid-cols-2 gap-4">
                <div className="glass p-5 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="absolute -right-2 -top-2 opacity-10 group-hover:scale-110 transition-transform">
                        <DollarSign size={60} className="text-safe" />
                    </div>
                    <p className="text-[10px] text-dim font-bold uppercase tracking-wider mb-1">รายได้เดือนนี้</p>
                    <h2 className="text-2xl font-bold text-safe">฿{personalStats.earnings.toLocaleString()}</h2>
                </div>
                <div className="glass p-5 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="absolute -right-2 -top-2 opacity-10 group-hover:scale-110 transition-transform">
                        <Truck size={60} className="text-primary" />
                    </div>
                    <p className="text-[10px] text-dim font-bold uppercase tracking-wider mb-1">จำนวนงาน</p>
                    <h2 className="text-2xl font-bold">{personalStats.trips} <span className="text-xs font-normal">งาน</span></h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="glass p-4 bg-white/[0.02] border-white/5">
                    <label className="text-[10px] text-dim flex items-center gap-2 mb-1 uppercase tracking-wider font-bold">
                        <History size={12} /> วันที่วิ่งงาน
                    </label>
                    <input
                        type="date"
                        className="w-full bg-transparent border-none text-white focus:outline-none"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>

                <div className="glass p-4 bg-white/[0.02] border-white/5">
                    <label className="text-[10px] text-dim flex items-center gap-2 mb-1 uppercase tracking-wider font-bold">
                        <User size={12} /> ชื่อคนขับ
                    </label>
                    <input
                        type="text"
                        placeholder="ระบุชื่อของคุณ..."
                        className="w-full bg-transparent border-none text-white focus:outline-none font-medium"
                        value={formData.driverName}
                        onChange={e => {
                            setFormData({ ...formData, driverName: e.target.value });
                            localStorage.setItem('mobile_driver_name', e.target.value);
                        }}
                        required
                    />
                </div>

                <div className="glass p-4 bg-white/[0.02] border-white/5">
                    <label className="text-[10px] text-dim flex items-center gap-2 mb-1 uppercase tracking-wider font-bold">
                        <MapPin size={12} /> สายงาน / เส้นทาง
                    </label>
                    <input
                        type="text"
                        list="mobile-routes"
                        placeholder="เลือกหรือระบุเส้นทาง..."
                        className="w-full bg-transparent border-none text-white focus:outline-none"
                        value={formData.route}
                        onChange={handleRouteChange}
                        required
                    />
                    <datalist id="mobile-routes">
                        {Object.keys(routePresets).map(r => <option key={r} value={r} />)}
                    </datalist>
                </div>

                {/* Wage & Fuel with Photo Capture */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass p-4 bg-white/[0.02] border-white/5">
                        <label className="text-[10px] text-dim flex items-center gap-2 mb-1 uppercase tracking-wider font-bold">
                            <Banknote size={12} className="text-safe" /> ค่าแรง
                        </label>
                        <input
                            type="number"
                            placeholder="0"
                            className="w-full bg-transparent border-none text-white focus:outline-none"
                            value={formData.wage}
                            onChange={e => setFormData({ ...formData, wage: e.target.value })}
                        />
                    </div>
                    <div className="glass p-4 bg-white/[0.02] border-white/5 relative">
                        <label className="text-[10px] text-dim flex items-center gap-2 mb-1 uppercase tracking-wider font-bold">
                            <Fuel size={12} className="text-accent" /> ค่าน้ำมัน
                        </label>
                        <input
                            type="number"
                            placeholder="0"
                            className="w-full bg-transparent border-none text-white focus:outline-none"
                            value={formData.fuel}
                            onChange={e => setFormData({ ...formData, fuel: e.target.value })}
                        />
                        <button
                            type="button"
                            onClick={() => fuelInputRef.current.click()}
                            className={`absolute right-3 bottom-0.5 p-2 rounded-xl transition-all duration-300 ${formData.fuelBill ? 'bg-safe/20 text-safe' : 'bg-white/5 text-dim/50'}`}
                        >
                            {formData.fuelBill ? <CheckCircle size={16} /> : <Camera size={16} />}
                        </button>
                        <input
                            type="file"
                            ref={fuelInputRef}
                            className="hidden"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleFileChange(e, 'fuelBill')}
                        />
                    </div>
                </div>

                {/* Basket & Maintenance with Photo Capture */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass p-4 bg-white/[0.02] border-white/5 relative">
                        <label className="text-[10px] text-dim flex items-center gap-2 mb-1 uppercase tracking-wider font-bold">
                            <Package size={12} className="text-primary" /> ตะกร้า (ใบ)
                        </label>
                        <input
                            type="number"
                            placeholder="0"
                            className="w-full bg-transparent border-none text-white focus:outline-none"
                            value={formData.basketCount}
                            onChange={e => handleBasketChange(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => basketInputRef.current.click()}
                            className={`absolute right-3 bottom-0.5 p-2 rounded-xl transition-all duration-300 ${formData.basketBill ? 'bg-safe/20 text-safe' : 'bg-white/5 text-dim/50'}`}
                        >
                            {formData.basketBill ? <CheckCircle size={16} /> : <Camera size={16} />}
                        </button>
                        <input
                            type="file"
                            ref={basketInputRef}
                            className="hidden"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleFileChange(e, 'basketBill')}
                        />
                    </div>
                    <div className="glass p-4 bg-white/[0.02] border-white/5 relative">
                        <label className="text-[10px] text-dim flex items-center gap-2 mb-1 uppercase tracking-wider font-bold">
                            <Wrench size={12} className="text-danger" /> ค่าซ่อมบำรุง
                        </label>
                        <input
                            type="number"
                            placeholder="0"
                            className="w-full bg-transparent border-none text-white focus:outline-none"
                            value={formData.maintenance}
                            onChange={e => setFormData({ ...formData, maintenance: e.target.value })}
                        />
                        <button
                            type="button"
                            onClick={() => maintenanceInputRef.current.click()}
                            className={`absolute right-3 bottom-0.5 p-2 rounded-xl transition-all duration-300 ${formData.maintenanceBill ? 'bg-safe/20 text-safe' : 'bg-white/5 text-dim/50'}`}
                        >
                            {formData.maintenanceBill ? <CheckCircle size={16} /> : <Camera size={16} />}
                        </button>
                        <input
                            type="file"
                            ref={maintenanceInputRef}
                            className="hidden"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleFileChange(e, 'maintenanceBill')}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-primary p-5 rounded-3xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-95 transition-all duration-300 hover:brightness-110 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))' }}
                >
                    {uploading ? (
                        <>บันทึกและอัปโหลดรูปภาพ...</>
                    ) : (
                        <>
                            <Save size={22} /> บันทึกข้อมูลการวิ่งงาน
                        </>
                    )}
                </button>
            </form>

            <AnimatePresence>
                {submitted && (
                    <div className="fixed inset-0 flex items-center justify-center z-[101] p-6 bg-dark/80 backdrop-blur-xl">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 10 }}
                            className="glass w-full max-w-[240px] p-6 flex flex-col items-center text-center border-white/10"
                        >
                            <motion.div
                                initial={{ scale: 0.5, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="w-16 h-16 rounded-full bg-safe/10 flex items-center justify-center mb-4 shadow-2xl shadow-safe/20 border border-safe/20"
                            >
                                <CheckCircle size={32} className="text-safe" />
                            </motion.div>

                            <h3 className="text-xl font-bold text-white mb-1 tracking-tight">บันทึกสำเร็จ!</h3>
                            <p className="text-dim text-[9px] uppercase tracking-[0.2em] font-medium opacity-70">
                                🚀 SYNCED TO CLOUD
                            </p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DriverHome;
