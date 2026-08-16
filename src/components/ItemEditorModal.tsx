import React, { useState, useEffect } from 'react';
import { TierItem, TierId, TierCategory } from '../types';
import { X, Upload, Link, Tag, Type, AlignCenter } from 'lucide-react';

interface ItemEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Partial<TierItem>) => void;
  editingItem: TierItem | null;
  categories: TierCategory[];
  defaultTierId?: TierId;
}

export const ItemEditorModal: React.FC<ItemEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  categories,
  defaultTierId = 'unranked',
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tierId, setTierId] = useState<TierId>(defaultTierId);
  const [fit, setFit] = useState<'cover' | 'contain'>('cover');
  const [tag, setTag] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || '');
      setSubtitle(editingItem.subtitle !== undefined ? editingItem.subtitle : editingItem.title || '');
      setImageUrl(editingItem.imageUrl || '');
      setTierId(editingItem.tierId || 'unranked');
      setFit(editingItem.fit || 'cover');
      setTag(editingItem.tag || '');
    } else {
      setTitle('');
      setSubtitle('');
      setImageUrl('');
      setTierId(defaultTierId);
      setFit('cover');
      setTag('');
    }
  }, [editingItem, defaultTierId, isOpen]);

  if (!isOpen) return null;

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
    if (!imageUrl) {
      alert('Please select an image file or paste an image URL');
      return;
    }

    const finalTitle = title.trim() || 'Untitled Item';
    const finalSubtitle = subtitle.trim() !== '' ? subtitle.trim() : finalTitle;

    onSave({
      id: editingItem ? editingItem.id : `item-${Date.now()}`,
      title: finalTitle,
      subtitle: finalSubtitle,
      imageUrl,
      tierId,
      fit,
      tag: tag.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay animate-pop">
      <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-[#27272a] shadow-2xl relative bg-[#141417]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-full bg-[#1e1e22] hover:bg-[#27272a] transition-colors border border-[#27272a]"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-xl font-bold font-heading text-white mb-1 flex items-center gap-2">
          {editingItem ? 'Edit Tier Item & Caption' : 'Add New Tier Item'}
        </h3>
        <p className="text-xs text-zinc-400 mb-5">
          Upload an image, set custom caption text under the card, and assign to a tier.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Source Tabs */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-purple-600 text-white'
                    : 'bg-[#1e1e22] text-zinc-400 hover:text-zinc-200 border border-[#27272a]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Upload File
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                  activeTab === 'url'
                    ? 'bg-purple-600 text-white'
                    : 'bg-[#1e1e22] text-zinc-400 hover:text-zinc-200 border border-[#27272a]'
                }`}
              >
                <Link className="w-3.5 h-3.5" /> Image Web URL
              </button>
            </div>

            {activeTab === 'upload' ? (
              <div className="border-2 border-dashed border-[#27272a] hover:border-purple-500 rounded-2xl p-4 text-center bg-[#18181c] transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                <p className="text-xs font-semibold text-zinc-200">
                  Click to browse or drop an image file here
                </p>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Supports PNG, JPG, GIF, WEBP, SVG
                </p>
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:border-purple-500"
                />
              </div>
            )}
          </div>

          {/* Preview */}
          {imageUrl && (
            <div className="bg-[#18181c] p-3 rounded-2xl border border-[#27272a] flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#0c0c0e] border border-[#27272a] flex-shrink-0 flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className={`w-full h-full ${fit === 'contain' ? 'object-contain p-1' : 'object-cover'}`}
                />
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Preview</p>
                <p className="text-sm font-bold text-white truncate">{title || 'Item Title'}</p>
                <p className="text-xs text-purple-300 font-bold truncate">
                  Caption under card: {subtitle || title || 'Subtitle'}
                </p>
              </div>
            </div>
          )}

          {/* Caption Input - Prominent */}
          <div>
            <label className="text-xs font-semibold text-purple-300 mb-1 flex items-center gap-1.5">
              <AlignCenter className="w-3.5 h-3.5 text-purple-400" /> Caption Text (Text Shown Under Card)
            </label>
            <input
              type="text"
              placeholder="e.g., Vamep, S-Tier God, Must Buy"
              value={subtitle}
              onChange={(e) => {
                setSubtitle(e.target.value);
                if (!title) setTitle(e.target.value);
              }}
              className="w-full bg-[#18181c] border border-purple-500/50 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold placeholder-zinc-500 focus:border-purple-500"
            />
            <p className="text-[10px] text-zinc-400 mt-1">
              This caption is displayed directly at the bottom of the card under the image.
            </p>
          </div>

          {/* Title Input */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-purple-400" /> Item Title / Name
            </label>
            <input
              type="text"
              placeholder="e.g., Vamep, Cyberpunk 2077"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:border-purple-500"
            />
          </div>

          {/* Row: Tier & Crop Fit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                Assign to Tier
              </label>
              <select
                value={tierId}
                onChange={(e) => setTierId(e.target.value as TierId)}
                className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} Tier
                  </option>
                ))}
                <option value="unranked">Unranked Pool</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                Image Crop / Fit
              </label>
              <select
                value={fit}
                onChange={(e) => setFit(e.target.value as 'cover' | 'contain')}
                className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500"
              >
                <option value="cover">Cover (Fill Card)</option>
                <option value="contain">Contain (Fit Whole Image)</option>
              </select>
            </div>
          </div>

          {/* Tag input */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-purple-400" /> Badge / Tag (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., GOAT, NEW, OP"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:border-purple-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#27272a]">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs">
              {editingItem ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
