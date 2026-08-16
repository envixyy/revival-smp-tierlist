import React, { useState } from 'react';
import { TierCategory, TierItem, TierId } from '../types';
import { TierItemCard } from './TierItemCard';
import { Plus } from 'lucide-react';

interface TierRowProps {
  category: TierCategory;
  items: TierItem[];
  isAdmin: boolean;
  onDropItem: (targetTierId: TierId, draggedItem: TierItem) => void;
  onDragStart: (e: React.DragEvent, item: TierItem) => void;
  onEditItem: (item: TierItem) => void;
  onDeleteItem: (id: string) => void;
  onAddItemToTier: (tierId: TierId) => void;
  onPreviewItem: (item: TierItem) => void;
  onQuickMoveItem: (item: TierItem, targetTierId: TierId) => void;
  onFileUploadToTier?: (files: FileList, targetTierId: TierId) => void;
}

export const TierRow: React.FC<TierRowProps> = ({
  category,
  items,
  isAdmin,
  onDropItem,
  onDragStart,
  onEditItem,
  onDeleteItem,
  onAddItemToTier,
  onPreviewItem,
  onQuickMoveItem,
  onFileUploadToTier,
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && onFileUploadToTier) {
      onFileUploadToTier(e.dataTransfer.files, category.id);
      return;
    }

    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const item: TierItem = JSON.parse(data);
        onDropItem(category.id, item);
      }
    } catch (err) {
      console.error('Failed to parse item:', err);
    }
  };

  return (
    <div className="tier-row" data-t={category.id}>
      <div
        className="tier-label cursor-pointer hover:opacity-80 transition-opacity relative group"
        onClick={() => isAdmin && onAddItemToTier(category.id)}
        title={isAdmin ? `Add item to ${category.id} Tier` : `${category.id} Tier`}
      >
        {category.id}
        {isAdmin && (
          <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus className="w-2.5 h-2.5" />
          </div>
        )}
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`tier-items ${isDragOver ? 'bg-purple-950/20 border-purple-500/40' : ''}`}
      >
        {items.length === 0 ? (
          <span className="tier-empty">Empty</span>
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
              onQuickMoveItem={onQuickMoveItem}
            />
          ))
        )}
      </div>
    </div>
  );
};
