import React from 'react';
import { Download, ChevronLeft, ChevronRight, Plus, Edit2, Trash2, ReceiptText } from 'lucide-react';
import SalarySlip from './SalarySlip';

const MonthlyTable = ({ currentMonth, currentYear, trips, onMonthChange, onExport, onSelectDate, onEditTrip, onDeleteTrip }) => {
    const [selectedDriverForSlip, setSelectedDriverForSlip] = React.useState(null);
    const months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    const getDatesInRange = () => {
        const dates = [];
        const startDate = new Date(currentYear, currentMonth - 1, 20);
        const endDate = new Date(currentYear, currentMonth, 19);

        let current = new Date(startDate);
        while (current <= endDate) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return dates;
    };

    const datesInRange = getDatesInRange();

    const getDayData = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;
        const dayTrips = trips.filter(t => t.date === dateStr);

        if (dayTrips.length === 0) return { route: '-', price: 0, fuel: 0, wage: 0, basket: 0, basketShare: 0, staffShare: 0, maintenance: 0, advance: 0, profit: 0, count: 0, items: [] };

        return {
            ...dayTrips.reduce((acc, trip) => ({
                route: dayTrips.map(t => t.route).join(', '),
                driverName: dayTrips.map(t => t.driverName || t.driver_name).filter(n => n).join(', ') || '-',
                price: acc.price + (parseFloat(trip.price) || 0),
                fuel: acc.fuel + (parseFloat(trip.fuel) || 0),
                wage: acc.wage + (parseFloat(trip.wage) || 0),
                basket: acc.basket + (parseFloat(trip.basket) || 0),
                staffShare: acc.staffShare + (parseFloat(trip.staffShare) || 0),
                maintenance: acc.maintenance + (parseFloat(trip.maintenance) || 0),
                advance: acc.advance + (parseFloat(trip.advance) || 0),
                basketShare: acc.basketShare + (parseFloat(trip.basketShare) || 0),
                profit: acc.profit + (parseFloat(trip.profit) || 0)
            }), { price: 0, fuel: 0, wage: 0, basket: 0, staffShare: 0, maintenance: 0, advance: 0, basketShare: 0, profit: 0 }),
            count: dayTrips.length,
            items: dayTrips
        };
    };

    return (
        <div className="glass-card fade-in" style={{ marginTop: '2rem' }}>
            <div className="header" style={{ padding: '1.5rem', marginBottom: '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem' }}>ตารางรอบสรุปยอด (20 - 19)</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            ยอดของรอบที่เลือก: {months[currentMonth]} {currentYear}
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', padding: '0.25rem' }}>
                        <button className="btn-icon" onClick={() => onMonthChange(-1)}><ChevronLeft size={18} /></button>
                        <span style={{ minWidth: '120px', textAlign: 'center', fontWeight: '500' }}>
                            {months[currentMonth]} {currentYear}
                        </span>
                        <button className="btn-icon" onClick={() => onMonthChange(1)}><ChevronRight size={18} /></button>
                    </div>
                </div>
                <button className="btn btn-outline" onClick={onExport}>
                    <Download size={18} />
                    Export รอบนี้
                </button>
            </div>

            <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <table>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--card-bg)', backdropFilter: 'blur(10px)' }}>
                        <tr>
                            <th style={{ width: '130px' }}>วันที่</th>
                            <th>คนขับ</th>
                            <th>สายงาน</th>
                            <th>ค่าเที่ยว (+)</th>
                            <th>ค่าน้ำมัน (-)</th>
                            <th>ค่าจ้าง (-)</th>
                            <th>ค่าซ่อม (-)</th>
                            <th>รายได้ตะกร้า (+)</th>
                            <th>ส่วนแบ่งตะกร้า (-)</th>
                            <th>ยอดเบิก (ลูกน้อง)</th>
                            <th>กำไรสุทธิ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datesInRange.map((date, idx) => {
                            const data = getDayData(date);
                            const isToday = new Date().toDateString() === date.toDateString();
                            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

                            return (
                                <tr key={idx} style={isToday ? { background: 'rgba(99, 102, 241, 0.1)' } : {}}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <button className="btn-icon" style={{ background: 'var(--primary)', color: 'white', padding: '2px', borderRadius: '4px' }} onClick={() => onSelectDate(dateStr)}>
                                                <Plus size={14} />
                                            </button>
                                            {data.count > 0 && (
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <button className="btn-icon" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--primary)', padding: '2px', borderRadius: '4px' }} onClick={() => onEditTrip(data.items[0])}>
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button className="btn-icon" style={{ background: 'rgba(255,,255,255,0.05)', color: 'var(--text-dim)', padding: '2px', borderRadius: '4px' }} onClick={() => {
                                                        if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
                                                            onDeleteTrip(data.items[0].id);
                                                        }
                                                    }}>
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            )}
                                            <span style={{ fontWeight: '600', color: isToday ? 'var(--primary)' : 'var(--text-dim)', fontSize: '0.85rem' }}>
                                                {date.getDate()} {months[date.getMonth()].substring(0, 3)}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ color: data.driverName === '-' ? 'var(--text-dim)' : 'var(--primary)', fontWeight: '500' }}>
                                        {data.driverName}
                                    </td>
                                    <td style={{ color: data.route === '-' ? 'var(--text-dim)' : 'var(--text-main)' }}>
                                        {data.route} {data.count > 1 && <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>({data.count} งาน)</span>}
                                    </td>
                                    <td>{data.price > 0 ? `฿${data.price.toLocaleString()}` : '-'}</td>
                                    <td style={{ color: 'var(--danger)' }}>{data.fuel > 0 ? `-฿${data.fuel.toLocaleString()}` : '-'}</td>
                                    <td style={{ color: 'var(--danger)' }}>{data.wage > 0 ? `-฿${data.wage.toLocaleString()}` : '-'}</td>
                                    <td style={{ color: 'var(--danger)' }}>
                                        {data.maintenance > 0 ? `-฿${data.maintenance.toLocaleString()}` : '-'}
                                    </td>
                                    <td style={{ color: 'var(--success)' }}>{data.basket > 0 ? `+฿${data.basket.toLocaleString()}` : '-'}</td>
                                    <td style={{ color: 'var(--danger)' }}>
                                        {data.basketShare > 0 ? `-฿${data.basketShare.toLocaleString()}` : '-'}
                                    </td>
                                    <td style={{ color: 'var(--warning)' }}>
                                        {data.staffShare > 0 ? `-฿${data.staffShare.toLocaleString()}` : '-'}
                                    </td>
                                    <td>
                                        {data.profit !== 0 ? (
                                            <span className="badge badge-profit">
                                                ฿{Math.round(data.profit).toLocaleString()}
                                            </span>
                                        ) : '-'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot style={{ position: 'sticky', bottom: 0, background: 'var(--card-bg)', backdropFilter: 'blur(10px)', borderTop: '2px solid rgba(255,255,255,0.1)' }}>
                        {(() => {
                            const totals = datesInRange.reduce((acc, date) => {
                                const data = getDayData(date);
                                return {
                                    price: acc.price + (data.price || 0),
                                    fuel: acc.fuel + (data.fuel || 0),
                                    wage: acc.wage + (data.wage || 0),
                                    maintenance: acc.maintenance + (data.maintenance || 0),
                                    advance: acc.advance + (data.advance || 0),
                                    basket: acc.basket + (data.basket || 0),
                                    basketShare: acc.basketShare + (data.basketShare || 0),
                                    staffShare: acc.staffShare + (data.staffShare || 0),
                                    profit: acc.profit + (data.profit || 0)
                                };
                            }, { price: 0, fuel: 0, wage: 0, maintenance: 0, advance: 0, basket: 0, basketShare: 0, staffShare: 0, profit: 0 });

                            return (
                                <tr style={{ fontWeight: 'bold' }}>
                                    <td style={{ color: 'var(--primary)' }}>รวม</td>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>฿{totals.price.toLocaleString()}</td>
                                    <td style={{ color: 'var(--danger)' }}>-฿{totals.fuel.toLocaleString()}</td>
                                    <td style={{ color: 'var(--danger)' }}>-฿{totals.wage.toLocaleString()}</td>
                                    <td style={{ color: 'var(--danger)' }}>-฿{totals.maintenance.toLocaleString()}</td>
                                    <td style={{ color: 'var(--success)' }}>+฿{totals.basket.toLocaleString()}</td>
                                    <td style={{ color: 'var(--danger)' }}>-฿{totals.basketShare.toLocaleString()}</td>
                                    <td style={{ color: 'var(--warning)' }}>-฿{totals.staffShare.toLocaleString()}</td>
                                    <td>
                                        <span className="badge badge-profit" style={{ fontSize: '1rem' }}>
                                            ฿{Math.round(totals.profit).toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })()}
                    </tfoot>
                </table>
            </div>

            {/* Salary Slips section */}
            <div style={{ padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ReceiptText size={20} color="var(--primary)" /> ออกสลิปเงินเดือนพนักงาน
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {(() => {
                        const tripsInPeriod = datesInRange.flatMap(date => {
                            const y = date.getFullYear();
                            const m = String(date.getMonth() + 1).padStart(2, '0');
                            const d = String(date.getDate()).padStart(2, '0');
                            const dateStr = `${y}-${m}-${d}`;
                            return trips.filter(t => t.date === dateStr).map(t => ({
                                ...t,
                                driverName: t.driverName || t.driver_name || 'ไม่ระบุชื่อ'
                            }));
                        });

                        const driversMap = {};
                        tripsInPeriod.forEach(t => {
                            if (!driversMap[t.driverName]) driversMap[t.driverName] = [];
                            driversMap[t.driverName].push(t);
                        });

                        return Object.entries(driversMap).map(([name, driverTrips]) => {
                            const totalPay = driverTrips.reduce((sum, t) => sum + (parseFloat(t.wage) || 0) + (parseFloat(t.basket_share || t.basketShare) || 0) - (parseFloat(t.staff_share || t.staffShare) || 0), 1000);

                            return (
                                <div key={name} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div>
                                        <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--success)' }}>ยอดสุทธิ: ฿{totalPay.toLocaleString()}</p>
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                        onClick={() => setSelectedDriverForSlip({ name, trips: driverTrips })}
                                    >
                                        <ReceiptText size={14} /> ดูสลิป
                                    </button>
                                </div>
                            );
                        });
                    })()}
                </div>
            </div>

            {selectedDriverForSlip && (
                <SalarySlip
                    driverName={selectedDriverForSlip.name}
                    trips={selectedDriverForSlip.trips}
                    onClose={() => setSelectedDriverForSlip(null)}
                    period={`20 ${months[(currentMonth - 1 + 12) % 12]} - 19 ${months[currentMonth]} ${currentYear}`}
                />
            )}
        </div>
    );
};

export default MonthlyTable;
