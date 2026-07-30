import { useState } from 'react';

export function usePayment() {
  const [processing, setProcessing] = useState(false);
  const processPayment = async (details, method = 'card') => {
    if (method === 'cod') { setProcessing(true); await new Promise((resolve) => setTimeout(resolve, 700)); setProcessing(false); return { ok: true, payment_reference: `cod_${Date.now()}` }; }
    if (method === 'upi') { if (!/^[\w.-]+@[\w.-]+$/.test(details.upi || '')) throw new Error('Enter a valid UPI ID, e.g. maya@upi.'); setProcessing(true); await new Promise((resolve) => setTimeout(resolve, 1200)); setProcessing(false); return { ok: true, payment_reference: `upi_${Date.now()}` }; }
    if (!/^\d{16}$/.test(details.card.replace(/\s/g, ''))) throw new Error('Enter a valid 16-digit card number.');
    if (!/^\d{2}\/\d{2}$/.test(details.expiry)) throw new Error('Use MM/YY for the expiry date.');
    if (!/^\d{3,4}$/.test(details.cvv)) throw new Error('Enter a valid CVV.');
    setProcessing(true); await new Promise((resolve) => setTimeout(resolve, 2000)); setProcessing(false); return { ok: true, payment_reference: `mock_${Date.now()}` };
  };
  return { processing, processPayment };
}
