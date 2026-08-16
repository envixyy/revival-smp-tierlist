import React from 'react';
import { TierItem, TierCategory } from '../types';
import { X, Tag, Award, Sparkles } from 'lucide-react';

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
        className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-slate-700/80 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Badge */}
        {category && (
          <div className="flex items-center gap-2 mb-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold font-heading shadow-md uppercase tracking-wider flex items-center gap-1.5"
              style={{
                background: category.gradient,
                color: category.textColor,
                boxShadow: `0 0 15px ${category.glowColor}`,
              }}
            >
              <Award className="w-3.5 h-3.5" />
              {category.label}
            </span>

            {item.tag && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600/90 text-white flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {item.tag}
              </span>
            )}
          </div>
        )}

        {/* Large Image View */}
        <div className="w-full h-64 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 mb-4 flex items-center justify-center relative group">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-contain p-2"
          />
        </div>

        {/* Details & Subtext */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black font-heading text-slate-100 flex items-center gap-2">
            {item.title}
          </h2>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Card Label / Sub-Text
              </p>
              <p className="text-sm font-semibold text-indigo-300">
                {item.subtitle || item.title}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
