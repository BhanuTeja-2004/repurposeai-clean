import React, { useEffect, useState, useCallback } from 'react';
import { History, Copy, Trash2, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
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

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewItem, setViewItem] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const loadHistory = useCallback(async (p = 0) => {
    setIsLoading(true);
    try {
      const res = await contentApi.getHistory(p, 10);
      setItems(res.data.content);
      setTotalPages(res.data.totalPages);
      setPage(p);
    } catch { toast.error('Failed to load history'); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadHistory(0); }, [loadHistory]);

  const handleView = async (id) => {
    setViewLoading(true);
    setViewItem(null);
    try {
      const res = await contentApi.getById(id);
      setViewItem(res.data);
    } catch { toast.error('Failed to load'); }
    finally { setViewLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this generation?')) return;
    try {
      await contentApi.delete(id);
      toast.success('Deleted');
      loadHistory(page);
      if (viewItem?.id === id) setViewItem(null);
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>History</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>All your generated content</p>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card" style={{ height: 76 }}>
              <div className="skeleton" style={{ height: 13, width: '30%', marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 12, width: '65%' }} />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
          <History size={40} style={{ margin: '0 auto 16px', opacity: 0.3, display: 'block' }} />
          <p style={{ fontSize: 16, fontWeight: 500 }}>No generations yet</p>
          <p style={{ fontSize: 14, marginTop: 6 }}>Your content history will appear here</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map(item => (
              <div key={item.id} className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 4, height: 36, borderRadius: 4, flexShrink: 0, background: TYPE_COLORS[item.outputType] || '#888' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: TYPE_COLORS[item.outputType] || 'var(--text-secondary)',
                      background: (TYPE_COLORS[item.outputType] || '#888') + '18',
                      padding: '2px 8px', borderRadius: 99,
                    }}>
                      {TYPE_LABELS[item.outputType] || item.outputType}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {format(new Date(item.createdAt), 'MMM d, yyyy · h:mm a')}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.outputTextPreview}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => handleView(item.id)} className="btn btn-ghost" style={{ padding: '6px', color: 'var(--text-muted)' }} title="View">
                    <Eye size={15} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="btn btn-ghost" style={{ padding: '6px', color: 'var(--text-muted)' }} title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              <button onClick={() => loadHistory(page - 1)} disabled={page === 0} className="btn btn-secondary" style={{ padding: '7px 12px' }}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Page {page + 1} of {totalPages}</span>
              <button onClick={() => loadHistory(page + 1)} disabled={page >= totalPages - 1} className="btn btn-secondary" style={{ padding: '7px 12px' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* View modal */}
      {(viewItem || viewLoading) && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setViewItem(null); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
          }}
        >
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 620,
            maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            boxShadow: 'var(--shadow-lg)',
          }}>
            {viewLoading ? (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <span className="spinner" style={{ display: 'inline-block' }} />
              </div>
            ) : viewItem && (
              <>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: TYPE_COLORS[viewItem.outputType] || 'var(--text-secondary)',
                      background: (TYPE_COLORS[viewItem.outputType] || '#888') + '18',
                      padding: '2px 8px', borderRadius: 99,
                    }}>
                      {TYPE_LABELS[viewItem.outputType]}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { navigator.clipboard.writeText(viewItem.outputText); toast.success('Copied!'); }} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
                      <Copy size={12} /> Copy
                    </button>
                    <button onClick={() => setViewItem(null)} className="btn btn-ghost" style={{ padding: '6px' }}>
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div style={{ padding: '20px 22px', overflow: 'auto' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.8, color: 'var(--text-primary)' }}>
                    {viewItem.outputText}
                  </pre>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
