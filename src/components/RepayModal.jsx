
import React, { useState } from 'react';
import { X, Lock, CheckCircle, Printer, Share2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import './RepayModal.css';

const RepayModal = ({ isOpen, onClose, order, user, isAgentProxy = false, onSuccess }) => {
    const { addToast } = useToast();
    
    // Logic to determine amount
    const getOrderAmount = () => {
        if (!order) return 0;
        return order.totalRetailerCost || order.totalRepaymentAmount || 0;
    };

    const [amount, setAmount] = useState(order ? getOrderAmount().toString() : '');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('input'); // input, verifying, success
    const [paymentReference, setPaymentReference] = useState(null);
    const [receiptData, setReceiptData] = useState(null);

    if (!isOpen) return null;

    const isOrderSpecific = !!order;

    const handleInitialize = async () => {
        const finalAmount = isOrderSpecific ? getOrderAmount() : parseFloat(amount);
        if (!finalAmount || finalAmount <= 0) {
            addToast('Please enter a valid amount', 'warning');
            return;
        }

        setLoading(true);
        try {
            const apiBase = api.defaults.baseURL || 'http://localhost:5000/api'; // Fallback
            // On web, callback url can be the current page or a specific callback route
            const callbackUrl = window.location.href; 

            let endpoint = '/payment/initialize';
            let payload = {
                amount: finalAmount,
                email: user.email,
                orderId: order?._id || null,
                callbackUrl
            };

            if (isAgentProxy) {
                endpoint = '/payment/settle-for-retailer';
                payload = {
                    amount: finalAmount,
                    retailerId: user._id, 
                    callbackUrl
                };
            }

            const { data } = await api.post(endpoint, payload);
            
            if (data.authorization_url) {
                setPaymentReference(data.reference);
                // Open Paystack in new tab
                window.open(data.authorization_url, '_blank');
                setStep('verifying');
            }
        } catch (error) {
            console.error(error);
            addToast('Payment initialization failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!paymentReference) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/payment/verify?reference=${paymentReference}`);
            if (data.status === 'success') {
                setReceiptData({
                    id: data.reference,
                    amount: data.amountPaid,
                    date: new Date(),
                    payerName: isAgentProxy ? "Agent (Proxy)" : user.name,
                    retailerName: user.name,
                    productName: order?.productName || "General Repayment",
                    reference: data.reference
                });
                setStep('success');
                if (onSuccess) onSuccess();
            } else {
                addToast('Payment not verified yet. Please complete it in the popup.', 'warning');
            }
        } catch (error) {
            addToast('Verification failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePrintReceipt = () => {
        if (!receiptData) {
            addToast('No receipt data available', 'warning');
            return;
        }
        const { amount, date, payerName, retailerName, productName, reference } = receiptData;
        
        // Use current origin for logo so it works in both dev and production
        const logoUrl = `${window.location.origin}/logo.png`;
        
        const receiptHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Amana Receipt - ${reference}</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
                <style>
                    @page { margin: 20px; }
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: 'Inter', -apple-system, sans-serif; background: #fff; color: #1f2937; padding: 40px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    
                    .container { max-width: 600px; margin: 0 auto; position: relative; }
                    
                    .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 120px; font-weight: 900; color: rgba(16, 185, 129, 0.04); z-index: 0; user-select: none; }
                    
                    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 50px; position: relative; z-index: 1; }
                    .logo { font-size: 28px; font-weight: 900; color: #10b981; letter-spacing: -1px; text-transform: lowercase; }
                    .logo::after { content: ''; display: inline-block; width: 6px; height: 6px; background: #10b981; border-radius: 50%; margin-left: 2px; vertical-align: super; }
                    .receipt-meta { text-align: right; }
                    .receipt-title { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #6b7280; font-weight: 700; margin-bottom: 4px; }
                    .receipt-id { font-size: 12px; color: #9ca3af; font-family: monospace; }
                    
                    .status-banner { text-align: center; margin-bottom: 40px; padding: 30px; background: radial-gradient(circle at center, rgba(16, 185, 129, 0.08) 0%, transparent 70%); border-radius: 16px; position: relative; z-index: 1; }
                    .status-icon { width: 56px; height: 56px; background: #10b981; border-radius: 50%; color: white; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 16px; }
                    .amount-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; font-weight: 600; margin-bottom: 8px; }
                    .amount-value { font-size: 48px; font-weight: 900; color: #111827; letter-spacing: -2px; margin-bottom: 12px; }
                    .status-badge { display: inline-block; padding: 6px 16px; background: #ecfdf5; color: #059669; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border: 1px solid #d1fae5; }
                    
                    .grid-container { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; border-top: 2px dashed #e5e7eb; border-bottom: 2px dashed #e5e7eb; padding: 32px 0; margin-bottom: 40px; position: relative; z-index: 1; }
                    .col { display: flex; flex-direction: column; gap: 20px; }
                    .item { display: flex; flex-direction: column; gap: 4px; }
                    .item-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; font-weight: 600; }
                    .item-value { font-size: 14px; font-weight: 600; color: #1f2937; border-left: 3px solid #10b981; padding-left: 10px; }
                    
                    .footer { text-align: center; color: #9ca3af; font-size: 10px; padding-top: 20px; border-top: 1px solid #f3f4f6; position: relative; z-index: 1; }
                    .footer-logo { font-weight: 700; color: #d1d5db; margin-bottom: 8px; letter-spacing: 1px; }
                    .security-note { max-width: 400px; margin: 0 auto; line-height: 1.5; }
                    
                    .no-print { margin-top: 30px; text-align: center; }
                    .no-print button { background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="watermark">AMANA</div>
                    
                    <div class="header">
                        <img src="${logoUrl}" alt="Amana" class="logo-img" style="height: 40px; width: auto;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
                        <div class="logo" style="display: none;">amana</div>
                        <div class="receipt-meta">
                            <div class="receipt-title">Transaction Receipt</div>
                            <div class="receipt-id">#${reference.toUpperCase()}</div>
                        </div>
                    </div>
                    
                    <div class="status-banner">
                        <div class="status-icon">✓</div>
                        <div class="amount-label">Total Amount Paid</div>
                        <div class="amount-value">₦${amount.toLocaleString()}</div>
                        <div class="status-badge">Payment Successful</div>
                    </div>
                    
                    <div class="grid-container">
                        <div class="col">
                            <div class="item">
                                <span class="item-label">Beneficiary (Retailer)</span>
                                <span class="item-value">${retailerName}</span>
                            </div>
                            <div class="item">
                                <span class="item-label">Payment Purpose</span>
                                <span class="item-value">${productName || 'Credit Repayment'}</span>
                            </div>
                            <div class="item">
                                <span class="item-label">Transaction Date</span>
                                <span class="item-value">${new Date(date).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                        </div>
                        <div class="col">
                            <div class="item">
                                <span class="item-label">Paid By (Agent)</span>
                                <span class="item-value">${payerName}</span>
                            </div>
                            <div class="item">
                                <span class="item-label">Payment Channel</span>
                                <span class="item-value">Amana Financial Service</span>
                            </div>
                            <div class="item">
                                <span class="item-label">Reference ID</span>
                                <span class="item-value" style="font-family: monospace;">${reference}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <div class="footer-logo">AMANA MARKET SYSTEMS</div>
                        <p class="security-note">
                            This is an electronically generated receipt and does not require a physical signature. 
                            Funds have been securely transmitted to settle the specified obligation.
                        </p>
                        <p style="margin-top: 10px;">support@joinamana.com • www.joinamana.com</p>
                    </div>
                    
                    <div class="no-print">
                        <button onclick="window.print()">Print / Save as PDF</button>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        try {
            const receiptWindow = window.open('', '_blank', 'width=700,height=900');
            if (!receiptWindow) {
                // Popup was blocked - use alternative method
                addToast('Please allow popups to view receipt, or use Ctrl+P to print this page', 'warning');
                // Create a downloadable HTML file as fallback
                const blob = new Blob([receiptHtml], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Amana-Receipt-${reference}.html`;
                a.click();
                URL.revokeObjectURL(url);
                return;
            }
            receiptWindow.document.write(receiptHtml);
            receiptWindow.document.close();
        } catch (error) {
            console.error('Receipt generation error:', error);
            addToast('Failed to generate receipt', 'error');
        }
    };

    return (
        <div className="repay-modal-overlay">
            <div className="repay-modal animate-scale-in">
                <div className="repay-header">
                    <h3>{isAgentProxy ? 'Settle via Proxy' : 'Make Repayment'}</h3>
                    <button onClick={onClose} className="close-btn"><X size={20} /></button>
                </div>

                <div className="repay-body">
                    {step === 'input' && (
                        <>
                            <div className="amount-display">
                                <label>Amount to Pay</label>
                                <div className="amount-value">₦{parseFloat(amount || 0).toLocaleString()}</div>
                                {!isOrderSpecific && (
                                    <input 
                                        type="number" 
                                        value={amount} 
                                        onChange={e => setAmount(e.target.value)}
                                        className="amount-input"
                                        placeholder="Enter amount"
                                    />
                                )}
                            </div>

                            {isAgentProxy && (
                                <div className="proxy-notice">
                                    <ShieldCheck size={16} />
                                    <p>You are paying on behalf of <strong>{user.name}</strong>. A receipt will be generated for you to share.</p>
                                </div>
                            )}

                            <button className="btn-pay" onClick={handleInitialize} disabled={loading}>
                                {loading ? 'Processing...' : `Pay ₦${parseFloat(amount || 0).toLocaleString()}`}
                            </button>
                            
                            <div className="secure-tag">
                                <Lock size={12} />
                                <span>Secured by Paystack</span>
                            </div>
                        </>
                    )}

                    {step === 'verifying' && (
                        <div className="verify-step">
                            <div className="spinner-large"></div>
                            <h4>Completing Payment...</h4>
                            <p>A new tab was opened for payment. Once you're done, verify it here.</p>
                            <button className="btn-verify" onClick={handleVerify} disabled={loading}>
                                {loading ? 'Checking...' : 'I Have Paid'}
                            </button>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="success-step">
                            <CheckCircle size={48} className="text-success" />
                            <h4>Payment Successful!</h4>
                            <p>The debt has been cleared.</p>
                            
                            <button className="btn-print" onClick={handlePrintReceipt}>
                                <Printer size={18} />
                                <span>Print / Save Receipt</span>
                            </button>
                            
                            <button className="btn-secondary mt-12" onClick={onClose}>
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RepayModal;
// Helper component for Icon
const ShieldCheck = ({size}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
);
