import { useState } from 'react';
import { useTrips } from '../hooks/useTrips';
import { Calendar, Search, MapPin, Truck, ChevronRight, Fuel, AlertCircle } from 'lucide-react';

const HistoryPage = () => {
    const { trips } = useTrips();
    const currentDriver = localStorage.getItem('mobile_driver_name') || '';

    const driverTrips = trips.filter(t => {
        const tName = (t.driver_name || t.driverName || '').trim();
        return tName === currentDriver.trim();
    });

    return (
        <div className="p-4 space-y-6">
            <header className="px-2">
                <h1 className="text-2xl font-bold">ประวัติการวิ่งงาน</h1>
                <p className="text-dim text-sm">ข้อมูลการวิ่งงานทั้งหมดของคุณ</p>
            </header>

            <div className="space-y-4">
                {driverTrips.length === 0 ? (
                    <div className="glass p-12 flex flex-col items-center gap-4 text-center">
                        <AlertCircle size={48} className="text-dim" />
                        <p className="text-dim">ไม่พบประวัติการวิ่งงาน<br />ภายใต้ชื่อ "{currentDriver}"</p>
                    </div>
                ) : (
                    driverTrips.map(trip => (
                        <div key={trip.id} className="glass p-5 animate-up">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                        <Truck size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{trip.route}</h3>
                                        <p className="text-dim text-sm flex items-center gap-1">
                                            <Calendar size={12} /> {trip.date}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-primary font-bold">{(parseFloat(trip.wage) || 0).toLocaleString()} ฿</p>
                                    <p className="text-[10px] text-dim font-bold">ค่าแรง</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <Fuel size={14} className="text-accent" />
                                    <span className="text-sm">น้ำมัน: {trip.fuel || 0} ฿</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Truck size={14} className="text-safe" />
                                    <span className="text-sm">ตะกร้า: {trip.basket_count || 0} ใบ</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HistoryPage;
