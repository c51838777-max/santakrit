import { useState } from 'react';
import { useTrips } from '../hooks/useTrips';
import { Save, Truck, CheckCircle2, Edit, Trash2, X, Wallet } from 'lucide-react';
import { getLocalDate } from '../utils/dateUtils';

const DriverEntry = () => {
    const { addTrip, deleteTrip, updateTrip, routePresets, stats, trips } = useTrips();
    const [submitted, setSubmitted] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        driverName: localStorage.getItem('lastDriverName') || '',
        route: '',
        price: '',
        fuel: '',
        staffShare: '', // This is the 'ยอดเบิก' (Advance)
        date: getLocalDate()
    });

    const handleRouteChange = (e) => {
        const routeName = e.target.value;
        const preset = routePresets[routeName];

        if (preset) {
            setFormData({
                ...formData,
                route: routeName,
                price: preset.price || ''
            });
        } else {
            setFormData({ ...formData, route: routeName });
        }
    };


    const handleEdit = (trip) => {
        setFormData({
            ...trip,
            price: trip.price || '',
            fuel: trip.fuel || '',
            staffShare: trip.staffShare || '',
            date: trip.date.split('T')[0]
        });
        setEditingId(trip.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            driverName: localStorage.getItem('lastDriverName') || '',
            route: '', price: '', fuel: '', staffShare: '',
            date: getLocalDate()
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('คุณแน่ใจว่าต้องการลบรายการนี้?')) {
            await deleteTrip(id);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.route) {
            alert('กรุณากรอกสายงาน');
            return;
        }

        if (editingId) {
            await updateTrip(editingId, formData);
            setEditingId(null);
        } else {
            await addTrip(formData);
        }

        setSubmitted(true);
        setFormData({
            driverName: localStorage.getItem('lastDriverName') || '',
            route: '', price: '', fuel: '', staffShare: '',
            date: getLocalDate()
        });

        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="driver-container fade-in">
            <header className="driver-header">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                    <Truck size={32} color="var(--primary)" />
                    <h1>ลงสายวิ่งงาน <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>(v2.2)</span></h1>
                </div>
            </header>

            {submitted && (
                <div className="success-overlay">
                    <div className="success-content">
                        <CheckCircle2 size={48} color="var(--success)" />
                        <p>บันทึกข้อมูลเรียบร้อยแล้ว!</p>
                    </div>
                </div>
            )}

            <main className="driver-main">
                <form onSubmit={handleSubmit} className="driver-form glass-card">
                    <div className="input-group">
                        <label>วันที่วิ่งงาน</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>ชื่อคนขับ</label>
                        <input
                            type="text"
                            placeholder="ระบุชื่อของคุณ..."
                            value={formData.driverName}
                            onChange={(e) => {
                                setFormData({ ...formData, driverName: e.target.value });
                                localStorage.setItem('lastDriverName', e.target.value);
                            }}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>สายงาน / เส้นทาง</label>
                        <input
                            type="text"
                            list="route-options"
                            placeholder="ระบุเส้นทาง..."
                            value={formData.route}
                            onChange={handleRouteChange}
                            required
                        />
                        <datalist id="route-options">
                            {Object.keys(routePresets).map(route => (
                                <option key={route} value={route} />
                            ))}
                        </datalist>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group">
                            <label>ค่าน้ำมัน (บาท)</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={formData.fuel}
                                onChange={(e) => setFormData({ ...formData, fuel: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--warning-intense)' }}>ยอดเบิก (บาท)</label>
                            <input
                                type="number"
                                style={{ borderColor: 'var(--warning-intense)' }}
                                placeholder="0"
                                value={formData.staffShare}
                                onChange={(e) => setFormData({ ...formData, staffShare: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-summary" style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid var(--warning-intense)' }}>
                        <p style={{ color: 'var(--warning-intense)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>ยอดเบิกสะสมเดือนนี้</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>฿{(stats.totalStaffAdvance || 0).toLocaleString()}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn btn-primary btn-large" style={{ flex: 1 }}>
                            <Save size={24} /> {editingId ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={handleCancelEdit} className="btn" style={{ background: 'var(--text-dim)', color: 'white', marginTop: '1rem', padding: '1rem' }}>
                                <X size={24} />
                            </button>
                        )}
                    </div>
                </form>

                <div className="history-section glass-card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                        <CheckCircle2 size={18} /> ประวัติ 5 รายการล่าสุด
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {trips.slice(0, 5).map(trip => (
                            <div key={trip.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: 'var(--text)' }}>{trip.route}</div>
                                    <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                                        {trip.date} • {trip.driverName || 'ไม่ระบุชื่อ'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        {trip.staffShare > 0 && <div style={{ color: 'var(--warning-intense)', fontWeight: 'bold' }}>เบิก ฿{trip.staffShare.toLocaleString()}</div>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleEdit(trip)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.25rem' }}>
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(trip.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                .driver-container {
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 1rem;
                    min-height: 100vh;
                    background: var(--bg);
                }
                .driver-header {
                    text-align: center;
                    margin-bottom: 2rem;
                    padding-top: 1rem;
                }
                .driver-header h1 {
                    font-size: 1.5rem;
                    margin-top: 0.5rem;
                    color: var(--primary);
                }
                .driver-form {
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .btn-large {
                    padding: 1rem;
                    font-size: 1.1rem;
                    margin-top: 1rem;
                    width: 100%;
                    justify-content: center;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .form-summary {
                    padding: 1rem;
                    border-radius: 0.5rem;
                    text-align: center;
                }
                .success-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(5px);
                }
                .success-content {
                    background: var(--glass-bg);
                    padding: 2rem;
                    border-radius: 1rem;
                    text-align: center;
                    border: 1px solid var(--success);
                }
                .success-content p {
                    font-size: 1.25rem;
                    margin-top: 1rem;
                    color: white;
                }
            `}} />
        </div>
    );
};

export default DriverEntry;
