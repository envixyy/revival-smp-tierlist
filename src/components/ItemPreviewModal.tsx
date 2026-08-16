import React from 'react';
import { TierItem, TierCategory } from '../types';
import { X, Tag, Award } from 'lucide-react';

interface ItemPreviewModalProps {
  item: TierItem | null;
  onClose: () => void;
  categories: TierCategory[];
}

export const ItemPreviewModal: React.FC<ItemPreviewModalProps> = ({ item, onClose, categories }) => {
  if (!item) return null;

  const category = categories.find((c) => c.id === item.tierId);

  return (
    <div className="modal-overlay animate-pop" onClick={onClose}>
      <div
        className="glass-panel"
        style={{ padding: 0, overflow: 'hidden', maxWidth: '420px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="admin-lock-close-btn"
          type="button"
          style={{ top: 12, right: 12, zIndex: 20 }}
        >
          <X style={{ width: 16, height: 16 }} />
        </button>

        {/* Large Image Header */}
        <div style={{ width: '100%', height: '220px', background: '#0c0c0e', position: 'relative', overflow: 'hidden' }}>
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              style={{ width: '100%', height: '100%', objectFit: item.fit || 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
              🎯
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to top, #141417, transparent)' }} />
        </div>

        {/* Content Body */}
        <div style={{ padding: '0 20px 20px', marginTop: '-16px', position: 'relative', zIndex: 10 }}>
          {/* Badges Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            {category && (
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: category.gradient,
                  color: category.textColor,
                  boxShadow: `0 0 12px ${category.glowColor}`,
                }}
              >
                <Award style={{ width: 12, height: 12 }} />
                {category.label} Tier
              </span>
            )}

            {item.tag && (
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  background: 'rgba(234, 179, 8, 0.15)',
                  color: '#ffd700',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Tag style={{ width: 10, height: 10 }} />
                {item.tag}
              </span>
            )}
          </div>

          {/* Name & Subtitle */}
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.2, marginBottom: '4px' }}>
            {item.title}
          </h2>

          {item.subtitle && item.subtitle !== item.title && (
            <p style={{ fontSize: '0.85rem', color: '#a0a0a0', fontWeight: 500, marginBottom: '12px' }}>
              {item.subtitle}
            </p>
          )}

          {/* Description Section */}
          <div style={{ marginTop: '14px', padding: '14px', borderRadius: '14px', background: '#1a1a1e', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <p style={{ fontSize: '0.62rem', fontWeight: 800, color: '#eab308', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
              About
            </p>
            {item.description ? (
              <p style={{ fontSize: '0.85rem', color: '#f0f0f0', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {item.description}
              </p>
            ) : (
              <p style={{ fontSize: '0.78rem', color: '#666666', fontStyle: 'italic', textAlign: 'center' }}>
                No description provided.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
