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
        className="glass-panel w-full max-w-md p-0 rounded-3xl border border-[#27272a] shadow-2xl relative overflow-hidden bg-[#141417]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-zinc-400 hover:text-white rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Large Image */}
        <div className="w-full h-56 bg-[#0c0c0e] overflow-hidden relative">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🎯</div>
          )}

          {/* Gradient overlay at bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#141417] to-transparent" />
        </div>

        {/* Content */}
        <div className="px-5 pb-5 -mt-4 relative z-10">
          {/* Tier badge + tag row */}
          <div className="flex items-center gap-2 mb-3">
            {category && (
              <span
                className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5"
                style={{
                  background: category.gradient,
                  color: category.textColor,
                  boxShadow: `0 0 12px ${category.glowColor}`,
                }}
              >
                <Award className="w-3 h-3" />
                {category.label} Tier
              </span>
            )}

            {item.tag && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" />
                {item.tag}
              </span>
            )}
          </div>

          {/* Name */}
          <h2 className="text-2xl font-black text-white mb-1 leading-tight">
            {item.title}
          </h2>

          {item.subtitle && item.subtitle !== item.title && (
            <p className="text-sm text-zinc-400 font-medium mb-3">{item.subtitle}</p>
          )}

          {/* Description */}
          {item.description ? (
            <div className="mt-3 p-4 rounded-2xl bg-[#1a1a1e] border border-[#27272a]">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">About</p>
              <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            </div>
          ) : (
            <div className="mt-3 p-4 rounded-2xl bg-[#1a1a1e] border border-[#27272a]">
              <p className="text-xs text-zinc-500 italic text-center">No description yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
