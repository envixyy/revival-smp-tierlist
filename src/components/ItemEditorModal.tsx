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
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || '');
      setSubtitle(editingItem.subtitle !== undefined ? editingItem.subtitle : editingItem.title || '');
      setImageUrl(editingItem.imageUrl || '');
      setTierId(editingItem.tierId || 'unranked');
      setFit(editingItem.fit || 'cover');
      setTag(editingItem.tag || '');
      setDescription(editingItem.description || '');
    } else {
      setTitle('');
      setSubtitle('');
      setImageUrl('');
      setTierId(defaultTierId);
      setFit('cover');
      setTag('');
      setDescription('');
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
      description: description.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay animate-pop">
      <div className="glass-panel">
        <button onClick={onClose} className="admin-lock-close-btn" type="button">
          <X style={{ width: 16, height: 16 }} />
        </button>

        <h3 className="modal-title">
          {editingItem ? '✏️ Edit Tier Item & Caption' : '✨ Add New Tier Item'}
        </h3>
        <p className="modal-subtitle">
          Upload an image, set custom caption text under the card, and assign to a tier.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Image Source Tabs */}
          <div className="form-group">
            <div className="tab-group">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`modal-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              >
                <Upload style={{ width: 14, height: 14, display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} /> Upload File
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`modal-tab-btn ${activeTab === 'url' ? 'active' : ''}`}
              >
                <Link style={{ width: 14, height: 14, display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} /> Image Web URL
              </button>
            </div>

            {activeTab === 'upload' ? (
              <div className="file-drop-box">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                />
                <Upload style={{ width: 28, height: 28, color: '#eab308', margin: '0 auto 6px', display: 'block' }} />
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f0f0f0' }}>
                  Click to browse or drop an image file here
                </p>
                <p style={{ fontSize: '0.68rem', color: '#888', marginTop: 2 }}>
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
                />
              </div>
            )}
          </div>

          {/* Image Preview Box */}
          {imageUrl && (
            <div className="preview-box">
              <div className="preview-thumb">
                <img
                  src={imageUrl}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: fit }}
                />
              </div>
              <div className="preview-info">
                <span className="preview-tag">Preview</span>
                <div className="preview-title">{title || 'Item Title'}</div>
                <div className="preview-subtitle">Caption: {subtitle || title || 'Subtitle'}</div>
              </div>
            </div>
          )}

          {/* Caption Input */}
          <div className="form-group">
            <label>
              <AlignCenter style={{ width: 14, height: 14 }} /> Caption Text (Text Shown Under Card)
            </label>
            <input
              type="text"
              placeholder="e.g., Vamep, S-Tier God, Must Buy"
              value={subtitle}
              onChange={(e) => {
                setSubtitle(e.target.value);
                if (!title) setTitle(e.target.value);
              }}
            />
            <span className="field-hint">This caption is displayed directly at the bottom of the card under the image.</span>
          </div>

          {/* Title Input */}
          <div className="form-group">
            <label>
              <Type style={{ width: 14, height: 14 }} /> Item Title / Name
            </label>
            <input
              type="text"
              placeholder="e.g., Vamep, Cyberpunk 2077"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Tier & Fit row */}
          <div className="form-row-2">
            <div>
              <label>Assign to Tier</label>
              <select
                value={tierId}
                onChange={(e) => setTierId(e.target.value as TierId)}
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
              <label>Image Crop / Fit</label>
              <select
                value={fit}
                onChange={(e) => setFit(e.target.value as 'cover' | 'contain')}
              >
                <option value="cover">Cover (Fill Card)</option>
                <option value="contain">Contain (Fit Whole Image)</option>
              </select>
            </div>
          </div>

          {/* Tag Input */}
          <div className="form-group">
            <label>
              <Tag style={{ width: 14, height: 14 }} /> Badge / Tag (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., GOAT, NEW, OP"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </div>

          {/* Description Input */}
          <div className="form-group">
            <label>📝 Description (Optional)</label>
            <textarea
              rows={3}
              placeholder="Write a description about this person/item..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'none' }}
            />
            <span className="field-hint">Shown when visitors click on this item.</span>
          </div>

          {/* Form Actions */}
          <div className="btn-row">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingItem ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
