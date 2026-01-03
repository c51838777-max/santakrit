import React from 'react';
import { Truck, DollarSign, Fuel, Users, CreditCard, ShoppingCart, Settings, Wallet, Banknote } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="glass-card stat-card fade-in">
        <div className={`stat-icon ${color}`}>
            <Icon size={24} />
        </div>
        <div className="stat-content">
            <p className="stat-title">{title}</p>
            <h3 className="stat-value">{value}</h3>
        </div>
    </div>
);

const FleetDashboard = ({ stats, yearlyStats, children }) => {
    const [viewType, setViewType] = React.useState('monthly'); // 'monthly' or 'yearly'

    const currentStats = viewType === 'monthly' ? stats : {
        ...yearlyStats,
        totalWages: 0,
        totalBasket: 0,
        totalStaffAdvance: 0,
        totalDriverAdvance: 0,
        totalRemainingPay: 0
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="logo-section">
                    <Truck className="logo-icon" />
                    <h1>ตารางค่าเที่ยววิ่งงาน</h1>
                </div>
                <div className="date-display" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="glass-card" style={{ padding: '0.25rem', display: 'flex', gap: '0.25rem' }}>
                        <button
                            className={`btn ${viewType === 'monthly' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setViewType('monthly')}
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                        >
                            รายเดือน
                        </button>
                        <button
                            className={`btn ${viewType === 'yearly' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setViewType('yearly')}
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                        >
                            รายปี
                        </button>
                    </div>
                    {new Date().toLocaleDateString('th-TH', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </header>

            <div className="stats-grid">
                <StatCard
                    title={viewType === 'monthly' ? "จำนวนเที่ยวเดือนนี้" : "จำนวนเที่ยวปีนี้"}
                    value={`${currentStats.totalTrips} เที่ยว`}
                    icon={Truck}
                    color="blue"
                />
                <StatCard
                    title={viewType === 'monthly' ? "รายได้เดือนนี้" : "รายได้ปีนี้"}
                    value={`฿${currentStats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    color="var(--success)"
                />
                <StatCard
                    title={viewType === 'monthly' ? "ค่าน้ำมันเดือนนี้" : "ค่าน้ำมันปีนี้"}
                    value={`฿${currentStats.totalFuel.toLocaleString()}`}
                    icon={Fuel}
                    color="red"
                />
                <StatCard
                    title={viewType === 'monthly' ? "ค่าซ่อมเดือนนี้" : "ค่าซ่อมปีนี้"}
                    value={`฿${currentStats.totalMaintenance.toLocaleString()}`}
                    icon={Settings}
                    color="red-intense"
                />
                <StatCard
                    title={viewType === 'monthly' ? "กําไรสุทธิเดือนนี้" : "กําไรสุทธิปีนี้"}
                    value={`฿${currentStats.totalProfit.toLocaleString()}`}
                    icon={CreditCard}
                    color="indigo"
                />
                {viewType === 'monthly' && (
                    <>
                        <StatCard
                            title="ยอดเบิกลูกน้อง"
                            value={`฿${currentStats.totalStaffAdvance.toLocaleString()}`}
                            icon={Users}
                            color="warning"
                        />
                        <StatCard
                            title="คงเหลือจ่ายสุทธิ (คนขับ)"
                            value={`฿${currentStats.totalRemainingPay.toLocaleString()}`}
                            icon={Banknote}
                            color="blue"
                        />
                    </>
                )}
            </div>

            <main className="dashboard-content">
                {viewType === 'monthly' ? children : (
                    <div className="glass-card fade-in" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
                        <h2 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>📊 สรุปภาพรวมรายปี {new Date().getFullYear() + 543}</h2>
                        <p style={{ color: 'var(--text-muted)' }}>เลือกโหมด "รายเดือน" หากต้องการบันทึกข้อมูลหรือดูรายละเอียดแยกตามวัน</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default FleetDashboard;
