import React, { useState } from 'react';
import { TierItem, TierId } from '../types';
import { Edit2, Trash2, ArrowRightLeft } from 'lucide-react';

interface TierItemCardProps {
  item: TierItem;
  isAdmin: boolean;
  onDragStart: (e: React.DragEvent, item: TierItem) => void;
  onEditItem: (item: TierItem) => void;
  onDeleteItem: (id: string) => void;
  onPreviewItem: (item: TierItem) => void;
  onQuickMoveItem?: (item: TierItem, targetTierId: TierId) => void;
}

export const TierItemCard: React.FC<TierItemCardProps> = ({
  item,
  isAdmin,
  onDragStart,
  onEditItem,
  onDeleteItem,
  onPreviewItem,
  onQuickMoveItem,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const tiersList: TierId[] = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'unranked'];
  const captionText = item.subtitle !== undefined ? item.subtitle : item.title;

  return (
    <div
      draggable={isAdmin}
      onDragStart={(e) => isAdmin && onDragStart(e, item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMoveMenu(false);
      }}
      className="item-card group relative"
      onClick={() => !isAdmin && onPreviewItem(item)}
    >
      {/* Image Container */}
      <div className="item-img relative overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&auto=format&fit=crop&q=80';
            }}
          />
        ) : (
          <span className="text-xl">🎯</span>
        )}

        {/* Hover Quick Edit Controls */}
        {isAdmin && isHovered && !showMoveMenu && (
          <div className="absolute inset-0 bg-[#0d0d0f]/90 z-20 flex items-center justify-center gap-1 p-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMoveMenu(true);
              }}
              title="Quick Move"
              className="p-1 bg-[#27272a] hover:bg-purple-600 text-white rounded transition-colors"
            >
              <ArrowRightLeft className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditItem(item);
              }}
              title="Edit Item"
              className="p-1 bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteItem(item.id);
              }}
              title="Delete Item"
              className="p-1 bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Item Name / Subtitle */}
      <div className="item-name" title={captionText}>
        {captionText}
      </div>

      {/* Quick Move Popover */}
      {isAdmin && showMoveMenu && (
        <div
          className="absolute inset-0 bg-[#141417] border border-[#27272a] rounded-xl z-30 p-1 flex flex-col items-center justify-center gap-1 text-[9px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-4 gap-1 w-full">
            {tiersList.map((t) => (
              <button
                key={t}
                onClick={() => {
                  if (onQuickMoveItem) onQuickMoveItem(item, t);
                  setShowMoveMenu(false);
                }}
                className={`py-0.5 text-center font-extrabold rounded ${
                  item.tierId === t
                    ? 'bg-purple-600 text-white'
                    : 'bg-[#1c1c21] text-zinc-300 hover:bg-[#3f3f46]'
                }`}
              >
                {t === 'unranked' ? 'Pool' : t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
