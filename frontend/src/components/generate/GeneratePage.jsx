import React, { useState, useRef } from 'react';
import {
  Sparkles, Copy, Download, Check, ChevronDown,
  Linkedin, Twitter, Instagram, Mail,
  Zap, Youtube, Facebook, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import { contentApi } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { Link } from 'react-router-dom';

const OUTPUT_TYPES = [
  { value: 'LINKEDIN_POST', label: 'LinkedIn Post', icon: Linkedin, color: '#0077b5', desc: 'Professional post with hashtags' },
  { value: 'TWITTER_THREAD', label: 'Twitter Thread', icon: Twitter, color: '#1da1f2', desc: '5-8 tweet thread' },
  { value: 'INSTAGRAM_CAPTION', label: 'Instagram Caption', icon: Instagram, color: '#e1306c', desc: 'Caption with emojis + hashtags' },
  { value: 'EMAIL_NEWSLETTER', label: 'Email Newsletter', icon: Mail, color: '#7c6dfa', desc: 'Complete newsletter format' },
  { value: 'SHORT_FORM_IDEAS', label: 'Content Ideas', icon: Zap, color: '#fbbf24', desc: '5-7 short-form ideas' },
  { value: 'YOUTUBE_DESCRIPTION', label: 'YouTube Description', icon: Youtube, color: '#ff0000', desc: 'SEO-optimized description' },
  { value: 'FACEBOOK_POST', label: 'Facebook Post', icon: Facebook, color: '#1877f2', desc: 'Engaging FB post' },
  { value: 'BLOG_SUMMARY', label: 'Blog Summary', icon: BookOpen, color: '#34d399', desc: 'Meta + key takeaways' },
];

const TONES = [
  { value: '', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'humorous', label: 'Humorous' },
  { value: 'formal', label: 'Formal' },
];

const MAX_CHARS = 10000;

export default function GeneratePage() {
  const [inputText, setInputText] = useState('');
  const [outputType, setOutputType] = useState('LINKEDIN_POST');
  const [tone, setTone] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [typeDropOpen, setTypeDropOpen] = useState(false);
  const { user, setUser } = useAuthStore();
  const outputRef = useRef(null);

  const selectedType = OUTPUT_TYPES.find(t => t.value === outputType);
  const isPro = user?.plan === 'PRO';
  const usedToday = user?.dailyUsageCount || 0;
  const remaining = isPro ? Infinity : Math.max(0, 3 - usedToday);

  const handleGenerate = async () => {
    if (!inputText.trim() || inputText.trim().length < 50) {
      toast.error('Please enter at least 50 characters');
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const res = await contentApi.post('/content/generate', {
        inputText: inputText.trim(),
        outputType,
        tone,
      });
      setResult(res.data);
      setUser({ ...user, dailyUsageCount: usedToday + 1 });
      toast.success('Content generated!');
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate. Try again.';
      toast.error(msg, { duration: err.response?.status === 429 ? 5000 : 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.outputText) return;
    await navigator.clipboard.writeText(result.outputText);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!result?.id) return;
    try {
      const res = await contentApi.get(`/content/${result.id}/download`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = outputType.toLowerCase() + '_' + result.id + '.txt';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    }
  };

  return (
    <div style={{
      padding: 'clamp(16px, 4vw, 32px)',
      maxWidth: 900,
      margin: '0 auto',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{
        marginBottom: 28,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <h1 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 600, marginBottom: 4 }}>
            Generate Content
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Paste your content and transform it instantly.
          </p>
        </div>
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 99, padding: '6px 14px', fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Today:</span>
          <span style={{ fontWeight: 600, color: remaining === 0 ? 'var(--error)' : 'var(--text-primary)' }}>
            {isPro ? '∞ unlimited' : remaining + ' left'}
          </span>
        </div>
      </div>

      {/* Format + Tone */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
        marginBottom: 16,
      }}>
        {/* Output type dropdown */}
        <div style={{ position: 'relative' }}>
          <label className="label">Output Format</label>
          <button
            onClick={() => setTypeDropOpen(p => !p)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 14px', background: 'var(--bg-input)',
              border: '1px solid ' + (typeDropOpen ? 'var(--accent)' : 'var(--border)'),
              borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--text-primary)',
              fontSize: 14, transition: 'border-color 0.2s',
            }}
          >
            {selectedType && React.createElement(selectedType.icon, {
              size: 16, color: selectedType.color, style: { flexShrink: 0 }
            })}
            <span style={{ flex: 1, textAlign: 'left' }}>{selectedType?.label}</span>
            <ChevronDown size={14} color="var(--text-muted)" style={{
              transform: typeDropOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }} />
          </button>

          {typeDropOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 100,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden', maxHeight: 320, overflowY: 'auto',
            }}>
              {OUTPUT_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => { setOutputType(type.value); setTypeDropOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px',
                    background: outputType === type.value ? 'var(--accent-light)' : 'transparent',
                    cursor: 'pointer',
                    color: outputType === type.value ? 'var(--accent)' : 'var(--text-primary)',
                    fontSize: 14, transition: 'background 0.15s',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {React.createElement(type.icon, { size: 15, color: type.color, style: { flexShrink: 0 } })}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 500 }}>{type.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{type.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tone */}
        <div>
          <label className="label">Tone</label>
          <select
            className="input-field"
            value={tone}
            onChange={e => setTone(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            {TONES.map(t => (
              <option key={t.value} value={t.value} style={{ background: 'var(--bg-card)' }}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input textarea */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <label className="label" style={{ margin: 0 }}>Your Content</label>
          <span style={{
            fontSize: 12,
            color: inputText.length > MAX_CHARS * 0.9 ? 'var(--warning)' : 'var(--text-muted)',
          }}>
            {inputText.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>
        </div>
        <textarea
          className="input-field"
          placeholder="Paste your blog post, article, transcript, or video script here (min. 50 characters)..."
          value={inputText}
          onChange={e => setInputText(e.target.value.slice(0, MAX_CHARS))}
          style={{
            minHeight: 'clamp(140px, 25vw, 220px)',
            resize: 'vertical',
            lineHeight: 1.7,
            fontSize: 14,
            fontFamily: 'var(--font-body)',
          }}
        />
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={isLoading || inputText.trim().length < 50 || (!isPro && remaining === 0)}
        className="btn btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}
      >
        {isLoading
          ? <><span className="spinner" /> Generating...</>
          : <><Sparkles size={16} /> Generate {selectedType?.label}</>}
      </button>

      {!isPro && remaining === 0 && (
        <div style={{
          marginTop: 10, padding: '12px 16px',
          background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--error)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 8,
        }}>
          <span>Daily limit reached (3/3)</span>
          <Link to="/pricing" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}>
            Upgrade to Pro
          </Link>
        </div>
      )}

      {/* Skeleton loader */}
      {isLoading && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="skeleton" style={{ height: 18, width: '40%', marginBottom: 16 }} />
          {[100, 95, 88, 92, 70].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: 14, width: w + '%', marginBottom: 8 }} />
          ))}
        </div>
      )}

      {/* Result */}
      {result && !isLoading && (
        <div ref={outputRef} className="card animate-fadeIn" style={{ marginTop: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16, flexWrap: 'wrap', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {selectedType && React.createElement(selectedType.icon, { size: 16, color: selectedType.color })}
              <span style={{ fontWeight: 600, fontSize: 15 }}>{selectedType?.label}</span>
              {result.tokensUsed && (
                <span style={{
                  fontSize: 11, color: 'var(--text-muted)',
                  background: 'var(--bg-input)', padding: '2px 8px', borderRadius: 99,
                }}>
                  {result.tokensUsed} tokens
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={handleCopy} className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: 13 }}>
                {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
              </button>
              <button onClick={handleDownload} className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: 13 }}>
                <Download size={13} /> Download
              </button>
            </div>
          </div>

          <hr className="divider" style={{ marginBottom: 16 }} />

          <pre style={{
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            fontFamily: 'var(--font-body)', fontSize: 14,
            lineHeight: 1.8, color: 'var(--text-primary)',
          }}>
            {result.outputText}
          </pre>

          {!isPro && typeof result.remainingGenerations === 'number' && (
            <div style={{
              marginTop: 16, padding: '10px 14px',
              background: result.remainingGenerations === 0
                ? 'rgba(248,113,113,0.08)' : 'var(--accent-light)',
              border: '1px solid ' + (result.remainingGenerations === 0
                ? 'rgba(248,113,113,0.2)' : 'rgba(124,109,250,0.2)'),
              borderRadius: 'var(--radius)', fontSize: 13,
              color: result.remainingGenerations === 0 ? 'var(--error)' : 'var(--accent)',
            }}>
              {result.remainingGenerations === 0
                ? '⚠️ Daily limit reached. Upgrade to Pro for unlimited generations.'
                : `✓ ${result.remainingGenerations} generation${result.remainingGenerations !== 1 ? 's' : ''} remaining today.`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}