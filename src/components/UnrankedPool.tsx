import React, { useState } from 'react';
import { TierItem } from '../types';
import { TierItemCard } from './TierItemCard';
import { UploadCloud, Plus, Sparkles, Inbox } from 'lucide-react';

interface UnrankedPoolProps {
  items: TierItem[];
  isAdmin: boolean;
  onDropItem: (targetTierId: 'unranked', item: TierItem) => void;
  onDragStart: (e: React.DragEvent, item: TierItem) => void;
  onEditItem: (item: TierItem) => void;
  onDeleteItem: (id: string) => void;
  onOpenAddModal: () => void;
  onFileUpload: (files: FileList) => void;
  onPreviewItem: (item: TierItem) => void;
}

export const UnrankedPool: React.FC<UnrankedPoolProps> = ({
  items,
  isAdmin,
  onDropItem,
  onDragStart,
  onEditItem,
  onDeleteItem,
  onOpenAddModal,
  onFileUpload,
  onPreviewItem,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isAdmin && !isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (isAdmin) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!isAdmin) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files);
      return;
    }

    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const item: TierItem = JSON.parse(data);
        onDropItem('unranked', item);
      }
    } catch (err) {
      console.error('Failed to parse item:', err);
    }
  };

  return (
    <div className="glass-panel p-5 rounded-3xl mt-8 border border-[#27272a] bg-[#141417]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-[#27272a]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-950/50 border border-purple-800/40 text-purple-400">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
              Unranked Items Pool
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1e1e22] text-zinc-300 font-sans border border-[#27272a]">
                {items.length}
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              {isAdmin
                ? 'Drag items into tiers above, or drop new images directly here.'
                : 'Items awaiting tier placement.'}
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <label className="btn-secondary text-xs cursor-pointer">
              <UploadCloud className="w-3.5 h-3.5 text-purple-400" />
              Upload Images
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && onFileUpload(e.target.files)}
              />
            </label>
            <button onClick={onOpenAddModal} className="btn-primary text-xs">
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
        )}
      </div>

      {/* Pool drop area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`tier-row-drop-target min-h-[120px] p-4 rounded-2xl bg-[#101013] border-2 border-dashed transition-all duration-200 flex flex-wrap gap-3 items-start ${
          isDragOver
            ? 'border-purple-500 bg-purple-950/20 shadow-[0_0_20px_rgba(154,92,246,0.15)]'
            : 'border-[#242429]'
        }`}
      >
        {items.length === 0 ? (
          <div className="w-full py-6 flex flex-col items-center justify-center text-center text-zinc-500 gap-1.5">
            <Sparkles className="w-6 h-6 text-purple-400/60" />
            <p className="text-xs font-semibold text-zinc-400">
              {isAdmin ? 'Drop images here from your computer' : 'Pool is currently empty'}
            </p>
          </div>
        ) : (
          items.map((item) => (
            <TierItemCard
              key={item.id}
              item={item}
              isAdmin={isAdmin}
              onDragStart={onDragStart}
              onEditItem={onEditItem}
              onDeleteItem={onDeleteItem}
              onPreviewItem={onPreviewItem}
            />
          ))
        )}
      </div>
    </div>
  );
};
