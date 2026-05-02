import React, { useEffect, useState } from 'react';
import { LayoutDashboard, TrendingUp, Zap, Hash, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { contentApi } from '../../services/api';
import { format } from 'date-fns';

const TYPE_COLORS = {
  LINKEDIN_POST: '#0077b5', TWITTER_THREAD: '#1da1f2',
  INSTAGRAM_CAPTION: '#e1306c', EMAIL_NEWSLETTER: '#7c6dfa',
  SHORT_FORM_IDEAS: '#fbbf24', YOUTUBE_DESCRIPTION: '#ff0000',
  FACEBOOK_POST: '#1877f2', BLOG_SUMMARY: '#34d399',
};
const TYPE_LABELS = {
  LINKEDIN_POST: 'LinkedIn', TWITTER_THREAD: 'Twitter',
  INSTAGRAM_CAPTION: 'Instagram', EMAIL_NEWSLETTER: 'Email',
  SHORT_FORM_IDEAS: 'Ideas', YOUTUBE_DESCRIPTION: 'YouTube',
  FACEBOOK_POST: 'Facebook', BLOG_SUMMARY: 'Blog',
};

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: color || 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    contentApi.getDashboard()
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <div className="skeleton" style={{ height: 28, width: 200, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: 300 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[...Array(4)].map((_, i) => <div key={i} className="card skeleton" style={{ height: 100 }} />)}
      </div>
    </div>
  );

  if (!data) return null;

  const isPro = data.user?.plan === 'PRO';
  const usagePercent = isPro ? 0 : Math.min(100, ((data.dailyUsageCount || 0) / (data.dailyLimit || 3)) * 100);
  const topTypes = Object.entries(data.usageByType || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxTypeCount = topTypes[0]?.[1] || 1;

  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Welcome back, {data.user?.name?.split(' ')[0]}!
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard
          label="Today's Usage"
          value={data.dailyUsageCount || 0}
          sub={isPro ? 'Unlimited plan' : `of ${data.dailyLimit} limit`}
          color="var(--accent)"
        />
        <StatCard
          label="Total Generated"
          value={(data.totalGenerations || 0).toLocaleString()}
          sub="All time"
        />
        <StatCard
          label="Tokens Used"
          value={(data.totalTokensUsed || 0).toLocaleString()}
          sub="All time"
        />
        <StatCard
          label="Plan"
          value={isPro ? 'Pro' : 'Free'}
          sub={isPro ? 'Unlimited' : `${data.remainingToday} remaining today`}
          color={isPro ? 'var(--accent)' : 'var(--text-primary)'}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Usage bar */}
        {!isPro && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 500 }}>Daily Usage</p>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {data.dailyUsageCount}/{data.dailyLimit}
              </span>
            </div>
            <div style={{ height: 8, background: 'var(--bg-input)', borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: usagePercent + '%',
                background: usagePercent >= 100 ? 'var(--error)' : usagePercent >= 66 ? 'var(--warning)' : 'var(--accent)',
                transition: 'width 0.5s ease',
              }} />
            </div>
            {data.remainingToday === 0 ? (
              <Link to="/pricing" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '9px' }}>
                Upgrade for unlimited <ArrowRight size={13} />
              </Link>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{data.remainingToday} generations left today</p>
            )}
          </div>
        )}

        {isPro && (
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,109,250,0.12), rgba(167,139,250,0.06))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Zap size={18} color="var(--accent)" fill="var(--accent)" />
              <span style={{ fontWeight: 600 }}>Pro Plan</span>
              <span className="badge badge-pro" style={{ fontSize: 10 }}>ACTIVE</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              You have unlimited generations. Create as much content as you need every day.
            </p>
          </div>
        )}

        {/* Top formats */}
        <div className="card">
          <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>Top Formats</p>
          {topTypes.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topTypes.map(([type, count]) => (
                <div key={type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{TYPE_LABELS[type] || type}</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{count}</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--bg-input)', borderRadius: 99 }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      width: ((count / maxTypeCount) * 100) + '%',
                      background: TYPE_COLORS[type] || 'var(--accent)',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 500 }}>Recent Generations</p>
          <Link to="/app/history" style={{ fontSize: 13, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {(!data.recentGenerations || data.recentGenerations.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
            <Hash size={28} style={{ margin: '0 auto 10px', opacity: 0.3, display: 'block' }} />
            <p style={{ fontSize: 13 }}>No generations yet. Start creating!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.recentGenerations.slice(0, 5).map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ width: 4, height: 28, borderRadius: 4, background: TYPE_COLORS[item.outputType] || '#888', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: TYPE_COLORS[item.outputType] || 'var(--text-secondary)',
                    }}>
                      {TYPE_LABELS[item.outputType]}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {format(new Date(item.createdAt), 'MMM d')}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.outputTextPreview}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
