import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getLocalDate } from '../utils/dateUtils';

const TripForm = ({ onAdd, onUpdate, routePresets, externalDate, onDateChange, editingTrip, onCancelEdit }) => {
    const [formData, setFormData] = useState({
        driverName: localStorage.getItem('lastAdminDriverName') || '',
        price: '',
        fuel: '',
        wage: '',
        basket: '',
        staffShare: '',
        basketCount: '',
        basketShare: '',
        maintenance: '',
        advance: '',
        date: getLocalDate()
    });

    useEffect(() => {
        if (editingTrip) {
            setFormData({
                ...editingTrip,
                driverName: editingTrip.driverName || editingTrip.driver_name || '',
                staffShare: editingTrip.staffShare || editingTrip.staff_share || '',
                basketCount: editingTrip.basketCount || editingTrip.basket_count || '',
                basketShare: editingTrip.basketShare || editingTrip.basket_share || ''
            });
        } else if (externalDate) {
            const nextDate = externalDate.value;
            if (nextDate !== formData.date) {
                setFormData(prev => ({ ...prev, date: nextDate }));
            }
        }
    }, [editingTrip, externalDate, formData.date]);

    const handleRouteChange = (e) => {
        const routeName = e.target.value;
        const preset = routePresets[routeName];

        if (preset) {
            setFormData({
                ...formData,
                route: routeName,
                price: preset.price || '',
                wage: preset.wage || ''
            });
        } else {
            setFormData({
                ...formData,
                route: routeName
            });
        }
    };

    const handleDateShift = (days) => {
        // Use a safe way to adjust date in local time
        const [y, m, d] = formData.date.split('-').map(Number);
        const current = new Date(y, m - 1, d);
        current.setDate(current.getDate() + days);

        const newY = current.getFullYear();
        const newM = String(current.getMonth() + 1).padStart(2, '0');
        const newD = String(current.getDate()).padStart(2, '0');
        const newDate = `${newY}-${newM}-${newD}`;

        setFormData({ ...formData, date: newDate });
        if (onDateChange) onDateChange(newDate);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.route) {
            alert('กรุณากรอก "สายงาน" เป็นอย่างน้อยเพื่อบันทึก');
            return;
        }

        if (editingTrip) {
            onUpdate(editingTrip.id, formData);
        } else {
            onAdd(formData);
        }

        // Keep the date after submission for easier backfilling
        setFormData({
            ...formData,
            route: '', price: '', fuel: '', wage: '', basket: '', basketCount: '', basketShare: '', maintenance: '', advance: '', staffShare: ''
        });
    };

    return (
        <div className={`glass-card trip-form fade-in ${editingTrip ? 'edit-mode' : ''}`}
            style={editingTrip ? { border: '1px solid var(--primary)', background: 'rgba(99, 102, 241, 0.05)' } : {}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>
                    {editingTrip ? 'แก้ไขข้อมูลรายงาน' : 'เพิ่มรายการงานใหม่'}
                </h3>
                {editingTrip && (
                    <button className="btn btn-outline" onClick={onCancelEdit} style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                        <X size={14} /> ยกเลิกการแก้ไข
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {/* 1. วันที่ */}
                    <div className="input-group">
                        <label>วันที่</label>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button type="button" className="btn btn-outline" style={{ padding: '0 0.5rem' }} onClick={() => handleDateShift(-1)}>
                                <ChevronLeft size={16} />
                            </button>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => {
                                    setFormData({ ...formData, date: e.target.value });
                                    if (onDateChange) onDateChange(e.target.value);
                                }}
                                style={{ flex: 1 }}
                            />
                            <button type="button" className="btn btn-outline" style={{ padding: '0 0.5rem' }} onClick={() => handleDateShift(1)}>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* 2. สายงาน */}
                    <div className="input-group">
                        <label>สายงาน (เส้นทาง)</label>
                        <input
                            type="text"
                            list="route-options"
                            placeholder="สายงาน..."
                            value={formData.route}
                            onChange={handleRouteChange}
                        />
                        <datalist id="route-options">
                            {Object.keys(routePresets).map(route => (
                                <option key={route} value={route} />
                            ))}
                        </datalist>
                    </div>

                    {/* 2.5 ชื่อคนขับ */}
                    <div className="input-group">
                        <label>ชื่อคนขับ</label>
                        <input
                            type="text"
                            placeholder="ชื่อคนขับ..."
                            value={formData.driverName}
                            onChange={(e) => {
                                setFormData({ ...formData, driverName: e.target.value });
                                localStorage.setItem('lastAdminDriverName', e.target.value);
                            }}
                        />
                    </div>

                    {/* 3. ค่าเที่ยว */}
                    <div className="input-group">
                        <label>ค่าเที่ยว (บาท)</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                    </div>

                    {/* 4. ค่าน้ำมัน */}
                    <div className="input-group">
                        <label>ค่าน้ำมัน (บาท)</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={formData.fuel}
                            onChange={(e) => setFormData({ ...formData, fuel: e.target.value })}
                        />
                    </div>

                    {/* 5. ยอดตะกร้า (จำนวน & รายได้ & ส่วนแบ่ง) */}
                    <div className="input-group">
                        <label>จำนวนตะกร้า (ใบ)</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={formData.basketCount}
                            onChange={(e) => {
                                const count = parseInt(e.target.value) || 0;
                                let rev = 0;
                                let share = 0;

                                if (count >= 101) {
                                    rev = 1000;
                                    share = 700;
                                } else if (count >= 91) {
                                    rev = 600;
                                    share = 400;
                                } else if (count >= 86) {
                                    rev = 300;
                                    share = 200;
                                }

                                setFormData({
                                    ...formData,
                                    basketCount: e.target.value,
                                    basket: rev || formData.basket, // Auto-fill if tier matches, otherwise keep current
                                    basketShare: share || formData.basketShare
                                });
                            }}
                        />
                    </div>
                    <div className="input-group">
                        <label>รายได้ตะกร้า (บาท)</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={formData.basket}
                            onChange={(e) => setFormData({ ...formData, basket: e.target.value })}
                        />
                    </div>
                    <div className="input-group">
                        <label style={{ color: 'var(--indigo)' }}>ส่วนแบ่งตะกร้า (บาท)</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={formData.basketShare}
                            onChange={(e) => setFormData({ ...formData, basketShare: e.target.value })}
                            style={{ borderColor: 'var(--indigo)' }}
                        />
                    </div>

                    {/* ค่าจ้าง & การเบิก (ลูกน้อง) - วางไว้ก่อนซ่อมบำรุง */}
                    <div className="input-group">
                        <label>ค่าจ้างคนขับ</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={formData.wage}
                            onChange={(e) => setFormData({ ...formData, wage: e.target.value })}
                        />
                    </div>
                    <div className="input-group">
                        <label className="warning-label">ยอดเบิก</label>
                        <input
                            type="number"
                            className="warning-input"
                            placeholder="0"
                            value={formData.staffShare}
                            onChange={(e) => setFormData({ ...formData, staffShare: e.target.value })}
                        />
                    </div>

                    {/* 6. ซ่อมบำรุง */}
                    <div className="input-group">
                        <label style={{ color: 'var(--danger)' }}>ค่าซ่อมบำรุง (บาท)</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={formData.maintenance}
                            onChange={(e) => setFormData({ ...formData, maintenance: e.target.value })}
                            style={{ borderColor: 'var(--danger)' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="submit" className={`btn ${editingTrip ? 'btn-success' : 'btn-primary'}`} style={{ minWidth: '150px' }}>
                        {editingTrip ? <Save size={18} /> : <PlusCircle size={18} />}
                        {editingTrip ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TripForm;
