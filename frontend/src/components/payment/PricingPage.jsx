import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Zap, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentApi } from "../../services/api";
import useAuthStore from '../../store/authStore';

const FREE_FEATURES = [
  '3 generations per day',
  '8 content formats',
  'Tone customization',
  'Copy & download outputs',
  'Content history (30 days)',
];

const PRO_FEATURES = [
  'Unlimited generations',
  '8 content formats',
  'Tone customization',
  'Copy & download outputs',
  'Unlimited content history',
  'Priority AI processing',
  'Cancel anytime',
];

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function PricingPage() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }
    if (user?.plan === 'PRO') {
      toast('You are already on Pro!');
      return;
    }

    setIsLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway.');
        setIsLoading(false);
        return;
      }

      const res = await paymentApi.createOrder();

      const orderId  = res.data?.orderId;
      const amount   = res.data?.amount;
      const currency = res.data?.currency;
      const key      = res.data?.key;

      if (!key || !orderId) {
        console.error("Missing key or orderId from backend:", { key, orderId });
        toast.error('Payment setup failed. Please contact support.');
        setIsLoading(false);
        return;
      }

      const options = {
        key,
        amount,
        currency,
        name: 'RepurposeAI',
        description: 'Pro Plan – ₹99/month',
        order_id: orderId,
        prefill: {
          email: user?.email || '',
        },
        handler: async (response) => {
          try {
            await paymentApi.verifyPayment({
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('Payment Successful 🎉');
            navigate('/app/dashboard?upgraded=true');
          } catch (err) {
            console.error("VERIFY ERROR:", err);
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
        theme: { color: '#7C6DFA' },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', (response) => {
        console.error("PAYMENT FAILED:", response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setIsLoading(false);
      });

      rzp.open();

    } catch (err) {
      console.error("CREATE ORDER ERROR:", err?.response?.data || err.message);
      toast.error(err?.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '0 24px' }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 24px', borderBottom: '1px solid var(--border)',
        maxWidth: 1000, margin: '0 auto',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: 'var(--accent)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="white" fill="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>RepurposeAI</span>
        </Link>
        {isAuthenticated ? (
          <Link to="/app/generate" className="btn btn-secondary">
            <ArrowLeft size={14} /> Back to app
          </Link>
        ) : (
          <Link to="/login" className="btn btn-secondary">Sign in</Link>
        )}
      </nav>

      <div style={{ maxWidth: 800, margin: '60px auto', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, marginBottom: 12 }}>
          Simple pricing
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 17, marginBottom: 56 }}>
          Start free. Upgrade when you need more.
        </p>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 20, maxWidth: 680, margin: '0 auto',
        }}>
          {/* Free */}
          <div className="card" style={{ padding: '32px 28px', textAlign: 'left' }}>
            <div style={{ marginBottom: 24 }}>
              <p style={{
                fontSize: 13, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
              }}>Free</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 40, fontWeight: 700 }}>₹0</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>/month</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 6 }}>
                Forever free, no card needed
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {FREE_FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <Check size={14} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f}</span>
                </div>
              ))}
            </div>
            <Link
              to="/register"
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
            >
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="card" style={{
            padding: '32px 28px', textAlign: 'left',
            border: '1px solid rgba(124,109,250,0.5)',
            background: 'linear-gradient(160deg, var(--bg-card), rgba(124,109,250,0.05))',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
              background: 'var(--accent)', color: 'white', fontSize: 11, fontWeight: 700,
              padding: '3px 14px', borderRadius: 99, whiteSpace: 'nowrap',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Most Popular
            </div>
            <div style={{ marginBottom: 24 }}>
              <p style={{
                fontSize: 13, color: 'var(--accent)',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
              }}>Pro</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 40, fontWeight: 700 }}>₹99</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>/month</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 6 }}>
                Unlimited everything
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {PRO_FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <Check size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleUpgrade}
              disabled={isLoading || user?.plan === 'PRO'}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
            >
              {isLoading
                ? <><span className="spinner" style={{ width: 15, height: 15 }} /> Loading...</>
                : user?.plan === 'PRO'
                  ? '✓ Current plan'
                  : 'Upgrade to Pro'
              }
            </button>
          </div>
        </div>

        <p style={{ marginTop: 32, fontSize: 13, color: 'var(--text-muted)' }}>
          Payments processed securely by Razorpay. India only.
        </p>
      </div>
    </div>
  );
}