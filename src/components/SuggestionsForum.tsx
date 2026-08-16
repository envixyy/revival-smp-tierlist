import React, { useState, useRef } from 'react';
import { SuggestionItem, TierId, TierCategory } from '../types';
import { MessageSquare, Upload, Link, Check, X, Trash2, Send, User, Image, Sparkles } from 'lucide-react';

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
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [targetTierId, setTargetTierId] = useState<TierId>('S');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Reset fields cleanly
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setDescription('');
    setShowUrlInput(false);
  };

  const filteredSuggestions = suggestions.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  return (
    <div id="suggestions-panel" className="glass-panel" style={{ maxWidth: '100%', margin: '8px 0', padding: '20px' }}>
      {/* Forum Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.15)', color: '#ffd700', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
            <MessageSquare style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Suggestions Forum
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '999px', background: '#1c1c21', border: '1px solid rgba(255,255,255,0.1)', color: '#ffd700' }}>
                {suggestions.length} Total
              </span>
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#888888', margin: 0 }}>Suggest players or items — submit images, bios, and pick a tier!</p>
          </div>
        </div>
      </div>

      {/* Modern Frictionless Chat Bar Form */}
      <form onSubmit={handleSubmit} style={{ background: '#18181c', padding: '16px', borderRadius: '16px', border: '1px solid rgba(234, 179, 8, 0.35)', marginTop: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffd700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles style={{ width: 14, height: 14 }} /> Post a Suggestion Message
        </div>

        {/* Main Input Bar */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Your Name (Optional)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            style={{ width: '160px', flexShrink: 0 }}
          />
          <input
            type="text"
            placeholder="Player / Item Name *"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!subtitle) setSubtitle(e.target.value);
            }}
            required
            style={{ flex: 1, minWidth: '180px' }}
          />

          {/* Quick File Attach Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: imageUrl ? '#06d6a0' : '#ffd700', borderColor: imageUrl ? '#06d6a0' : 'rgba(234,179,8,0.4)' }}
            title="Attach Image File"
          >
            <Image style={{ width: 14, height: 14 }} />
            {imageUrl ? '✓ Image Attached' : 'Attach Photo'}
          </button>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '8px 10px' }}
            title="Paste Image Web URL"
          >
            <Link style={{ width: 14, height: 14 }} />
          </button>

          <button
            type="submit"
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px' }}
          >
            <Send style={{ width: 14, height: 14 }} /> Post
          </button>
        </div>

        {/* Web URL input dropdown */}
        {showUrlInput && (
          <div style={{ marginBottom: '10px' }}>
            <input
              type="url"
              placeholder="Or paste image web URL (https://...)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
        )}

        {/* Tier Selector Pills Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#eab308', textTransform: 'uppercase' }}>Target Tier:</span>
          {categories.map((c) => {
            const isSel = targetTierId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setTargetTierId(c.id)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: `1px solid ${isSel ? c.glowColor : 'rgba(255,255,255,0.1)'}`,
                  background: isSel ? c.gradient : '#1c1c21',
                  color: isSel ? c.textColor : '#888888',
                  transition: 'all 0.15s ease',
                }}
              >
                {c.id}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setTargetTierId('unranked')}
            style={{
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              border: `1px solid ${targetTierId === 'unranked' ? '#eab308' : 'rgba(255,255,255,0.1)'}`,
              background: targetTierId === 'unranked' ? '#eab308' : '#1c1c21',
              color: targetTierId === 'unranked' ? '#000000' : '#888888',
              transition: 'all 0.15s ease',
            }}
          >
            Pool
          </button>
        </div>

        {/* Attached Image Thumbnail Preview */}
        {imageUrl && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', padding: '8px 12px', background: '#121215', borderRadius: '10px', border: '1px solid rgba(6, 214, 160, 0.3)' }}>
            <div style={{ width: 42, height: 42, borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#000' }}>
              <img src={imageUrl} alt="Attached" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#06d6a0', fontWeight: 600, flex: 1 }}>Photo Attached</span>
            <button
              type="button"
              onClick={() => setImageUrl('')}
              style={{ background: 'none', border: 'none', color: '#ff4e50', cursor: 'pointer', fontSize: '0.8rem', padding: '4px' }}
            >
              <X style={{ width: 14, height: 14 }} /> Remove
            </button>
          </div>
        )}

        {/* Description / Comment Textarea */}
        <div style={{ marginTop: '10px' }}>
          <textarea
            rows={2}
            placeholder="Add a comment or why this player belongs in this tier... (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ resize: 'none' }}
          />
        </div>
      </form>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px', marginBottom: '14px' }}>
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

      {/* Forum Message Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredSuggestions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 10px', color: '#666666', background: '#18181c', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <MessageSquare style={{ width: 36, height: 36, margin: '0 auto 8px', color: '#444444', display: 'block' }} />
            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#888888' }}>No suggestions in this view.</p>
            <p style={{ fontSize: '0.75rem', color: '#555555', marginTop: '4px' }}>Type a player name in the box above to post the first suggestion!</p>
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
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                {/* Header: Author, Date, Target Badge, Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #ffd700, #ffaa00)', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 900 }}>
                      {item.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>{item.author}</span>
                      <span style={{ fontSize: '0.68rem', color: '#666666', marginLeft: '8px' }}>
                        {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {cat && (
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          background: cat.badgeBg,
                          color: cat.textColor,
                          border: `1px solid ${cat.glowColor}`,
                        }}
                      >
                        Target: {cat.label} Tier
                      </span>
                    )}

                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '0.7rem',
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

                {/* Content Card Body */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: '#121215', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {item.imageUrl && (
                    <div style={{ width: 64, height: 64, borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#000000', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff' }}>{item.title}</div>
                    {item.subtitle && item.subtitle !== item.title && (
                      <div style={{ fontSize: '0.78rem', color: '#ffd700', fontWeight: 700, marginTop: '2px' }}>Caption: {item.subtitle}</div>
                    )}
                    {item.description && (
                      <p style={{ fontSize: '0.82rem', color: '#dddddd', marginTop: '6px', lineHeight: 1.45, fontStyle: 'italic' }}>
                        "{item.description}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Admin Control Actions */}
                {isAdmin && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onApproveSuggestion(item)}
                          className="btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'linear-gradient(135deg, #06d6a0, #00b884)' }}
                        >
                          <Check style={{ width: 14, height: 14 }} /> Approve & Add to Tier
                        </button>
                        <button
                          onClick={() => onDenySuggestion(item.id)}
                          className="btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ff4e50', borderColor: 'rgba(255,78,80,0.3)' }}
                        >
                          <X style={{ width: 14, height: 14 }} /> Deny
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => onDeleteSuggestion(item.id)}
                      className="btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#888888' }}
                      title="Delete Suggestion Message"
                    >
                      <Trash2 style={{ width: 14, height: 14 }} />
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
