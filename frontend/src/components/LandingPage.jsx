import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Linkedin, Twitter, Instagram, Mail, FileText, ArrowRight, Check } from 'lucide-react';

const PLATFORMS = [
  { icon: Linkedin, label: 'LinkedIn Post', color: '#0077b5' },
  { icon: Twitter, label: 'Twitter Thread', color: '#1da1f2' },
  { icon: Instagram, label: 'Instagram Caption', color: '#e1306c' },
  { icon: Mail, label: 'Email Newsletter', color: '#7c6dfa' },
  { icon: FileText, label: 'Blog Summary', color: '#34d399' },
  { icon: Zap, label: 'Short-Form Ideas', color: '#fbbf24' },
];

const FEATURES = [
  '8 content formats from one input',
  'Tone customization (casual, formal, witty)',
  'Save & organize your generations',
  'One-click copy or download',
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', overflowX: 'hidden' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 48px', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, background: 'rgba(10,10,15,0.9)',
        backdropFilter: 'blur(12px)', zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: 'var(--accent)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="white" fill="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>RepurposeAI</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/pricing" className="btn btn-ghost">Pricing</Link>
          <Link to="/login" className="btn btn-secondary">Log in</Link>
          <Link to="/register" className="btn btn-primary">Start free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        textAlign: 'center', padding: '100px 24px 80px',
        maxWidth: 800, margin: '0 auto',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 99,
          background: 'var(--accent-light)', border: '1px solid rgba(124,109,250,0.3)',
          fontSize: 13, color: 'var(--accent)', marginBottom: 32,
        }}>
          <Zap size={14} fill="currentColor" />
          Powered by GPT-4o mini
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 72px)',
          lineHeight: 1.1, marginBottom: 24, color: 'var(--text-primary)',
        }}>
          One article.<br />
          <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Infinite content.</span>
        </h1>

        <p style={{
          fontSize: 18, color: 'var(--text-secondary)', maxWidth: 540,
          margin: '0 auto 40px', lineHeight: 1.7,
        }}>
          Paste any long-form content and instantly get polished LinkedIn posts,
          Twitter threads, Instagram captions, newsletters, and more.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: 15, padding: '13px 28px' }}>
            Get started free <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ fontSize: 15, padding: '13px 28px' }}>
            Sign in
          </Link>
        </div>

        <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          3 free generations per day · No credit card required
        </p>
      </section>

      {/* Platform grid */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12,
        }}>
          {PLATFORMS.map(({ icon: Icon, label, color }) => (
            <div key={label} className="card" style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '16px 20px', transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = color + '55'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: color + '20', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={18} color={color} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{
        maxWidth: 600, margin: '0 auto', padding: '0 24px 120px', textAlign: 'center',
      }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, marginBottom: 32 }}>
          Everything you need
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
          {FEATURES.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 99, background: 'var(--accent-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Check size={13} color="var(--accent)" />
              </div>
              <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 48 }}>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: 15, padding: '13px 32px' }}>
            Start repurposing now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '24px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16, color: 'var(--text-muted)', fontSize: 13,
      }}>
        <span>© 2025 RepurposeAI. All rights reserved.</span>
        <div style={{ display: 'flex', gap: 24 }}>
          <Link to="/pricing">Pricing</Link>
          <a href="mailto:support@repurposeai.com">Support</a>
        </div>
      </footer>
    </div>
  );
}
