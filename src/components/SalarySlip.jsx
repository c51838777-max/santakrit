import React from 'react';
import { X, Receipt, Wallet, Calendar, AlertCircle } from 'lucide-react';

const SalarySlip = ({ driverName, trips, onClose, period, cnDeduction = 0 }) => {
    const totalWage = trips.reduce((sum, t) => sum + (parseFloat(t.wage) || 0), 0);
    const totalBasketShare = trips.reduce((sum, t) => sum + (parseFloat(t.staff_share || t.basketShare) || 0), 0);
    const totalAdvance = trips.reduce((sum, t) => sum + (parseFloat(t.advance || t.staffShare) || 0), 0);
    const housingAllowance = trips.length > 0 ? 1000 : 0;

    const grandTotal = totalWage + totalBasketShare + housingAllowance;
    const remainingToPay = grandTotal - totalAdvance - cnDeduction;

    return (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className="glass w-full max-w-400 max-h-[90vh] overflow-y-auto rounded-t-[32px] p-6 animate-up relative z-10">
                <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" onClick={onClose} />

                <header className="flex flex-col items-center mb-6 border-b border-white/10 pb-4">
                    <h2 className="brand-logo text-xl">SK FLEET</h2>
                    <p className="brand-subtitle !text-[10px]">SOLUTIONS</p>
                    <div className="mt-4 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                        <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Official Salary Slip</span>
                    </div>
                </header>

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Receipt className="text-primary" /> สลิปเงินเดือน
                        </h2>
                        <p className="text-dim text-sm">{period}</p>
                    </div>
                    <button onClick={onClose} className="glass p-2"><X size={20} /></button>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5">
                        <span className="text-dim">ชื่อคนขับ</span>
                        <span className="font-bold text-primary">{driverName}</span>
                    </div>

                    <div className="space-y-3 p-4 rounded-2xl border border-white/10">
                        <div className="flex justify-between">
                            <span className="text-sm">ค่าเที่ยว</span>
                            <span>{totalWage.toLocaleString()} ฿</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">ค่าตะกร้า</span>
                            <span>{totalBasketShare.toLocaleString()} ฿</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">ค่าที่พัก</span>
                            <span>{housingAllowance.toLocaleString()} ฿</span>
                        </div>
                        <div className="pt-2 border-t border-white/5 flex justify-between font-bold text-safe">
                            <span>รวมรายได้ทั้งหมด</span>
                            <span>{grandTotal.toLocaleString()} ฿</span>
                        </div>
                    </div>

                    <div className="space-y-3 p-4 rounded-2xl border border-white/10 bg-danger/5">
                        <div className="flex justify-between text-dim">
                            <span className="text-sm">ยอดเบิกสะสม</span>
                            <span>-{totalAdvance.toLocaleString()} ฿</span>
                        </div>
                        {cnDeduction > 0 && (
                            <div className="flex justify-between text-dim">
                                <span className="text-sm">หักลดหย่อน (CN)</span>
                                <span>-{cnDeduction.toLocaleString()} ฿</span>
                            </div>
                        )}
                    </div>

                    <div className="p-6 rounded-3xl bg-primary/20 border border-primary/30 text-center">
                        <p className="text-sm text-dim uppercase tracking-widest mb-1">ยอดคงเหลือสุทธิ</p>
                        <h3 className="text-4xl font-bold text-white">{remainingToPay.toLocaleString()} ฿</h3>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-xs text-dim flex items-center gap-1">
                        <AlertCircle size={12} /> ข้อมูลนี้อ้างอิงจากการลงงานในระบบ
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SalarySlip;
