import React from 'react';
import { X, Printer, Truck, Wallet, TrendingDown, Info } from 'lucide-react';

const SalarySlip = ({ driverName, trips, onClose, period, cnDeduction }) => {
    // Safety Parser
    const p = (val) => parseFloat(val) || 0;
    const cn = p(cnDeduction);

    const totalWage = trips.reduce((sum, t) => sum + p(t.wage), 0);
    const totalBasketShare = trips.reduce((sum, t) => sum + (p(t.basketShare) || p(t.basket_share) || p(t.staff_share)), 0);
    const totalAdvance = trips.reduce((sum, t) => sum + (p(t.staffShare) || p(t.advance) || p(t.staff_advance)), 0);
    const housingAllowance = 1000; // Fixed housing allowance as requested

    const totalIncome = totalWage + totalBasketShare + housingAllowance;
    const netPay = totalIncome - totalAdvance - cn;

    return (
        <div className="modal-overlay fade-in">
            <div className="slip-window">
                <div className="glass-card slip-card-v3 fade-in-up">
                    {/* Header */}
                    <div className="slip-header-v3">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="brand-icon"><Truck color="white" size={20} /></div>
                            <div>
                                <h1 style={{ margin: 0, fontSize: '1.15rem', color: 'white' }}>ภัทธา ทรานสปอร์ต</h1>
                                <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.7 }}>ใบสรุปยอดรายได้ค่าเที่ยวเเละเงินเดือน</p>
                            </div>
                        </div>
                        <button className="btn-close-minimal no-print" onClick={onClose}><X size={22} /></button>
                    </div>

                    <div className="slip-body-v3">
                        {/* Summary Header */}
                        <div className="info-badge">
                            <div className="badge-item">
                                <span className="label">พนักงาน</span>
                                <span className="value">{driverName}</span>
                            </div>
                            <div className="badge-item">
                                <span className="label">รอบสรุปยอด</span>
                                <span className="value">{period}</span>
                            </div>
                        </div>

                        {/* INCOME SECTION */}
                        <div className="slip-section-group">
                            <div className="group-title green"><Wallet size={16} /> รายรับพนักงาน (+)</div>
                            <div className="summary-list">
                                <div className="summary-item-v3">
                                    <span>ค่าเที่ยวรวม ({trips.length} เที่ยว)</span>
                                    <span className="val">฿{totalWage.toLocaleString()}</span>
                                </div>
                                <div className="summary-item-v3">
                                    <span>ส่วนแบ่งค่ายอดตะกร้าสะสม</span>
                                    <span className="val">฿{totalBasketShare.toLocaleString()}</span>
                                </div>
                                <div className="summary-item-v3 accent">
                                    <span>ค่าที่พักพนักงาน</span>
                                    <span className="val">฿{housingAllowance.toLocaleString()}</span>
                                </div>
                                <div className="summary-divider"></div>
                                <div className="summary-total-v3">
                                    <span>รวมรายรับสะสม</span>
                                    <span className="val-green">฿{totalIncome.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* DEDUCTION SECTION */}
                        <div className="slip-section-group" style={{ marginTop: '1.25rem' }}>
                            <div className="group-title red"><TrendingDown size={16} /> รายหักพนักงาน (-)</div>
                            <div className="summary-list">
                                <div className="summary-item-v3">
                                    <span>ยอดเงินเบิกสะสม</span>
                                    <span className="val-red">-฿{totalAdvance.toLocaleString()}</span>
                                </div>
                                {cn > 0 && (
                                    <div className="summary-item-v3">
                                        <span>หักค่า CN</span>
                                        <span className="val-red">-฿{cn.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="summary-divider"></div>
                                <div className="summary-total-v3">
                                    <span>รวมรายการหัก</span>
                                    <span className="val-red">-฿{(totalAdvance + cn).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* FINAL PAYOUT */}
                        <div className="net-pay-display-v3">
                            <div className="net-pay-circle">
                                <span className="net-pay-label">คงเหลือจ่ายสุทธิ</span>
                                <span className="net-pay-amount">฿{netPay.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Footnote */}
                        <div className="slip-footnote no-print">
                            <Info size={14} /> <span>แคปหน้าจอนี้เพื่อแจ้งยอดคนขับทางไลน์</span>
                        </div>

                        {/* Signature area for formal PDF */}
                        <div className="print-only signature-area-v3">
                            <div className="sig-block">
                                <div className="sig-line"></div>
                                <p>พนักงาน / ผู้รับเงิน</p>
                            </div>
                            <div className="sig-block">
                                <div className="sig-line"></div>
                                <p>บริษัท / ผู้อนุมัติจ่าย</p>
                            </div>
                        </div>
                    </div>

                    <div className="slip-actions-v3 no-print">
                        <button className="btn btn-primary btn-block-v3" onClick={onClose}>
                            ปิดหน้าจอ
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.95);
                    backdrop-filter: blur(15px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }
                .slip-window { width: 100%; max-width: 450px; }
                .slip-card-v3 { 
                    background: #0d0d0d; 
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 1.5rem;
                    overflow: hidden;
                    box-shadow: 0 40px 80px rgba(0,0,0,0.6);
                }
                .slip-header-v3 { 
                    background: linear-gradient(135deg, #10b981, #059669);
                    padding: 1.25rem 1.75rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .brand-icon { background: rgba(255,255,255,0.2); padding: 0.5rem; border-radius: 0.75rem; }
                .btn-close-minimal { background: none; border: none; color: white; opacity: 0.7; cursor: pointer; transition: 0.2s; }
                .btn-close-minimal:hover { opacity: 1; transform: rotate(90deg); }

                .slip-body-v3 { padding: 1.5rem 1.75rem; }
                
                .info-badge { 
                    display: flex; 
                    justify-content: space-between; 
                    background: rgba(255,255,255,0.03);
                    padding: 1rem;
                    border-radius: 1rem;
                    margin-bottom: 1.5rem;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .badge-item .label { display: block; font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; margin-bottom: 0.25rem; }
                .badge-item .value { font-weight: 700; font-size: 0.95rem; color: white; }

                .group-title { font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
                .group-title.green { color: #10b981; }
                .group-title.red { color: #f87171; }

                .summary-list { padding: 0 0.5rem; }
                .summary-item-v3 { display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-dim); margin-bottom: 0.6rem; }
                .summary-item-v3.accent { color: #10b981; font-weight: 600; }
                .summary-item-v3 .val { color: white; font-weight: 600; }
                
                .summary-divider { height: 1px; background: rgba(255,255,255,0.05); margin: 0.6rem 0; }
                .summary-total-v3 { display: flex; justify-content: space-between; font-weight: 700; font-size: 1rem; }
                .val-green { color: #10b981; }
                .val-red { color: #f87171; }

                .net-pay-display-v3 { 
                    margin-top: 2rem; 
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(0,0,0,0));
                    padding: 0.5rem;
                    border-radius: 2rem;
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }
                .net-pay-circle { 
                    background: white; 
                    padding: 1.25rem 2rem; 
                    border-radius: 1.5rem; 
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                .net-pay-label { display: block; font-size: 0.8rem; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 1px; }
                .net-pay-amount { display: block; font-size: 3rem; font-weight: 950; color: #000; letter-spacing: -2px; line-height: 1; margin-top: 0.25rem; }

                .slip-footnote { 
                    display: flex; 
                    align-items: center; 
                    gap: 0.5rem; 
                    justify-content: center;
                    margin-top: 1.5rem;
                    color: #666;
                    font-size: 0.75rem;
                }

                .slip-actions-v3 { padding: 0 1.75rem 1.75rem 1.75rem; display: flex; gap: 0.75rem; }
                .btn-block-v3 { flex: 1; padding: 0.9rem; font-weight: 700; border-radius: 1rem; }

                .print-only { display: none; }
                .signature-area-v3 { display: none; justify-content: space-between; margin-top: 4rem; padding-bottom: 2rem; }
                .sig-block { text-align: center; width: 45%; color: black; }
                .sig-line { border-bottom: 1.5px solid #000; margin-bottom: 0.5rem; padding-top: 2rem; }
                .sig-block p { font-size: 0.9rem; margin: 0; }

                @media print {
                    @page { size: auto; margin: 1cm; }
                    .modal-overlay { background: white !important; overflow: visible; padding: 0; display: block; position: absolute; }
                    .slip-window { max-width: 100% !important; margin: 0 !important; }
                    .slip-card-v3 { border: 2px solid #000 !important; background: white !important; color: black !important; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    .slip-header-v3 { background: #000 !important; border-bottom: 2px solid black !important; -webkit-print-color-adjust: exact; }
                    .info-badge, .summary-divider, .net-pay-display-v3 { background: #f3f4f6 !important; border: 1px solid #ddd !important; }
                    .summary-item-v3, .summary-item-v3 .val, .badge-item .value { color: black !important; }
                    .net-pay-circle { box-shadow: none !important; border: 3px solid #000 !important; }
                    .net-pay-amount { color: black !important; }
                    .sig-block { display: block !important; }
                }
                `}} />
        </div>
    );
};

export default SalarySlip;
