import React, { useState } from 'react';
import { SuggestionItem, TierId, TierCategory, TierItem } from '../types';
import { MessageSquare, Upload, Link, Check, X, Trash2, Tag, Award, Sparkles, Send, User } from 'lucide-react';

interface SuggestionsForumProps {
  suggestions: SuggestionItem[];
  categories: TierCategory[];
  isAdmin: boolean;
  onAddSuggestion: (suggestion: Omit<SuggestionItem, 'id' | 'createdAt' | 'status'>) => void;
  onApproveSuggestion: (suggestion: SuggestionItem) => void;
  onDenySuggestion: (suggestionId: string) => void;
  onDeleteSuggestion: (suggestionId: string) => void;
}

export const SuggestionsForum: React.FC<SuggestionsForumProps> = ({
  suggestions,
  categories,
  isAdmin,
  onAddSuggestion,
  onApproveSuggestion,
  onDenySuggestion,
  onDeleteSuggestion,
}) => {
  // Input Form States
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [targetTierId, setTargetTierId] = useState<TierId>('unranked');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setImageUrl(result);
          if (!title) {
            const cleanName = file.name.replace(/\.[^/.]+$/, '');
            setTitle(cleanName);
            setSubtitle(cleanName);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a player or item name.');
      return;
    }

    onAddSuggestion({
      author: author.trim() || 'Anonymous Player',
      title: title.trim(),
      subtitle: subtitle.trim() || title.trim(),
      imageUrl: imageUrl.trim() || undefined,
      targetTierId,
      description: description.trim() || undefined,
    });

    // Reset Form
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setDescription('');
    setIsFormOpen(false);
  };

  const filteredSuggestions = suggestions.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  return (
    <div className="glass-panel" style={{ maxWidth: '100%', margin: '8px 0', padding: '20px' }}>
      {/* Forum Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.15)', color: '#ffd700', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
            <MessageSquare style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Suggestions Chat Forum
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '999px', background: '#1c1c21', border: '1px solid rgba(255,255,255,0.1)', color: '#ffd700' }}>
                {suggestions.length}
              </span>
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#888888', margin: 0 }}>Suggest players or items with custom images & bios!</p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          {isFormOpen ? <X style={{ width: 14, height: 14 }} /> : <Send style={{ width: 14, height: 14 }} />}
          {isFormOpen ? 'Close Form' : 'New Suggestion'}
        </button>
      </div>

      {/* Suggestion Submission Form (Chat input box) */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} style={{ background: '#18181c', padding: '16px', borderRadius: '16px', border: '1px solid rgba(234, 179, 8, 0.3)', marginTop: '16px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffd700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles style={{ width: 14, height: 14 }} /> Create Suggestion Message
          </h4>

          <div className="form-row-2">
            <div className="form-group">
              <label><User style={{ width: 12, height: 12 }} /> Your Name / IGN (Optional)</label>
              <input
                type="text"
                placeholder="e.g. envixyy, trinqfo, Anonymous"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Player / Item Name *</label>
              <input
                type="text"
                placeholder="e.g. Vamep, Netherite Sword"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!subtitle) setSubtitle(e.target.value);
                }}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Suggested Tier Placement</label>
              <select
                value={targetTierId}
                onChange={(e) => setTargetTierId(e.target.value as TierId)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} Tier
                  </option>
                ))}
                <option value="unranked">Unranked Pool</option>
              </select>
            </div>

            <div className="form-group">
              <label>Caption / Card Subtitle</label>
              <input
                type="text"
                placeholder="Text shown under card image"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>
          </div>

          {/* Image source input */}
          <div className="form-group">
            <div className="tab-group" style={{ marginBottom: '6px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`modal-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              >
                <Upload style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} /> Upload File
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`modal-tab-btn ${activeTab === 'url' ? 'active' : ''}`}
              >
                <Link style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} /> Image URL
              </button>
            </div>

            {activeTab === 'upload' ? (
              <div className="file-drop-box" style={{ padding: '12px' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                />
                <Upload style={{ width: 22, height: 22, color: '#eab308', margin: '0 auto 4px', display: 'block' }} />
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f0f0f0', margin: 0 }}>
                  Select or drop image for suggestion
                </p>
              </div>
            ) : (
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            )}
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="preview-box" style={{ marginTop: '8px' }}>
              <div className="preview-thumb">
                <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="preview-info">
                <span className="preview-tag">Uploaded Attachment</span>
                <div className="preview-title">{title || 'Suggested Item'}</div>
              </div>
            </div>
          )}

          {/* Message / Description */}
          <div className="form-group" style={{ marginTop: '8px' }}>
            <label>💬 Comment / Why should this be added? (Optional)</label>
            <textarea
              rows={2}
              placeholder="Explain why this player belongs in this tier..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Send style={{ width: 14, height: 14 }} /> Submit Suggestion
            </button>
          </div>
        </form>
      )}

      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', marginBottom: '14px' }}>
        {(['all', 'pending', 'approved', 'denied'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`modal-tab-btn ${filter === f ? 'active' : ''}`}
            style={{ textTransform: 'capitalize' }}
          >
            {f === 'pending' ? '⏳ Pending' : f === 'approved' ? '✅ Approved' : f === 'denied' ? '❌ Denied' : 'All Messages'}
          </button>
        ))}
      </div>

      {/* Chat Forum Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredSuggestions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#666666', background: '#18181c', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <MessageSquare style={{ width: 32, height: 32, margin: '0 auto 8px', color: '#444444', display: 'block' }} />
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>No suggestions in this view.</p>
            <p style={{ fontSize: '0.72rem', color: '#555555', marginTop: '4px' }}>Be the first to click "New Suggestion" above!</p>
          </div>
        ) : (
          filteredSuggestions.map((item) => {
            const cat = categories.find((c) => c.id === item.targetTierId);
            return (
              <div
                key={item.id}
                style={{
                  background: '#18181c',
                  borderRadius: '16px',
                  border: item.status === 'approved' ? '1px solid rgba(6, 214, 160, 0.4)' : item.status === 'denied' ? '1px solid rgba(255, 78, 80, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {/* Top Row: Author, Date, Tier badge, Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#24242a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#ffd700', fontWeight: 800 }}>
                      {item.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>{item.author}</span>
                      <span style={{ fontSize: '0.68rem', color: '#666666', marginLeft: '8px' }}>
                        {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {cat && (
                      <span
                        style={{
                          padding: '2px 10px',
                          borderRadius: '999px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          background: cat.badgeBg,
                          color: cat.textColor,
                          border: `1px solid ${cat.glowColor}`,
                        }}
                      >
                        Target: {cat.label} Tier
                      </span>
                    )}

                    {/* Status Badge */}
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        background: item.status === 'approved' ? 'rgba(6, 214, 160, 0.15)' : item.status === 'denied' ? 'rgba(255, 78, 80, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                        color: item.status === 'approved' ? '#06d6a0' : item.status === 'denied' ? '#ff4e50' : '#ffd700',
                        border: `1px solid ${item.status === 'approved' ? '#06d6a0' : item.status === 'denied' ? '#ff4e50' : '#eab308'}`,
                      }}
                    >
                      {item.status === 'approved' ? '✅ Approved' : item.status === 'denied' ? '❌ Denied' : '⏳ Pending'}
                    </span>
                  </div>
                </div>

                {/* Body Content Card */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: '#121215', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {item.imageUrl && (
                    <div style={{ width: 56, height: 56, borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#000000', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>{item.title}</div>
                    {item.subtitle && item.subtitle !== item.title && (
                      <div style={{ fontSize: '0.75rem', color: '#ffd700', fontWeight: 600 }}>Caption: {item.subtitle}</div>
                    )}
                    {item.description && (
                      <p style={{ fontSize: '0.8rem', color: '#cccccc', marginTop: '4px', lineHeight: 1.4 }}>
                        "{item.description}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Admin Actions Row */}
                {isAdmin && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onApproveSuggestion(item)}
                          className="btn-primary"
                          style={{ padding: '4px 12px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'linear-gradient(135deg, #06d6a0, #00b884)' }}
                        >
                          <Check style={{ width: 12, height: 12 }} /> Approve & Add to Tier
                        </button>
                        <button
                          onClick={() => onDenySuggestion(item.id)}
                          className="btn-secondary"
                          style={{ padding: '4px 12px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ff4e50', borderColor: 'rgba(255,78,80,0.3)' }}
                        >
                          <X style={{ width: 12, height: 12 }} /> Deny
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => onDeleteSuggestion(item.id)}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.72rem', color: '#888888' }}
                      title="Delete Suggestion Message"
                    >
                      <Trash2 style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
