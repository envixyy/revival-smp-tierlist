import React, { useState, useEffect, useRef } from 'react';
import { TierCategory, TierItem, TierId, TierListData, GitHubConfig } from './types';
import { INITIAL_TIERLIST_DATA } from './defaultData';
import { Header } from './components/Header';
import { TierRow } from './components/TierRow';
import { UnrankedPool } from './components/UnrankedPool';
import { ItemEditorModal } from './components/ItemEditorModal';
import { GithubSyncModal } from './components/GithubSyncModal';
import { AdminLockModal } from './components/AdminLockModal';
import { ItemPreviewModal } from './components/ItemPreviewModal';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import { Sparkles, Download, Github, Upload, Crown, Users } from 'lucide-react';

const STORAGE_KEY = 'revival_tiers_data_v9';

export const App: React.FC = () => {
  const [data, setData] = useState<TierListData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse state:', e);
      }
    }
    return INITIAL_TIERLIST_DATA;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'credits'>('add');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Quick Add Form fields
  const [itemName, setItemName] = useState('');
  const [selectedTier, setSelectedTier] = useState<TierId | null>(null);
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TierItem | null>(null);
  const [targetDefaultTier, setTargetDefaultTier] = useState<TierId>('unranked');

  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [isAdminLockModalOpen, setIsAdminLockModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<TierItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tierlistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Clipboard Paste Handler (Ctrl + V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isAdmin) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const result = event.target?.result as string;
              if (result) {
                const title = `Item ${Date.now().toString().slice(-4)}`;
                handleSaveItem({
                  title,
                  subtitle: title,
                  imageUrl: result,
                  tierId: 'unranked',
                  fit: 'cover',
                });
                showToast('✨ Pasted image from clipboard!');
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isAdmin]);

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, item: TierItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropItem = (targetTierId: TierId, draggedItem: TierItem) => {
    if (!isAdmin) return;

    setData((prev) => {
      const filtered = prev.items.filter((i) => i.id !== draggedItem.id);
      const updatedItem: TierItem = {
        ...draggedItem,
        tierId: targetTierId,
      };

      return {
        ...prev,
        items: [...filtered, updatedItem],
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleQuickMoveItem = (item: TierItem, targetTierId: TierId) => {
    if (!isAdmin) return;
    handleDropItem(targetTierId, item);
    showToast(`Moved to ${targetTierId === 'unranked' ? 'Pool' : targetTierId + ' Tier'}`);
  };

  const handleOpenAddModal = (tierId: TierId = 'unranked') => {
    setEditingItem(null);
    setTargetDefaultTier(tierId);
    setIsEditorOpen(true);
  };

  const handleOpenEditModal = (item: TierItem) => {
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  const handleSaveItem = (itemData: Partial<TierItem>) => {
    setData((prev) => {
      const existsIndex = prev.items.findIndex((i) => i.id === itemData.id);
      let updatedItems = [...prev.items];

      if (existsIndex >= 0) {
        updatedItems[existsIndex] = {
          ...updatedItems[existsIndex],
          ...itemData,
        } as TierItem;
      } else {
        const newItem: TierItem = {
          id: itemData.id || `item-${Date.now()}`,
          title: itemData.title || 'New Item',
          subtitle: itemData.subtitle !== undefined ? itemData.subtitle : itemData.title || 'Item',
          imageUrl: itemData.imageUrl || '',
          tierId: itemData.tierId || 'unranked',
          fit: itemData.fit || 'cover',
          tag: itemData.tag,
          order: updatedItems.length,
        };
        updatedItems.push(newItem);
      }

      return {
        ...prev,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Delete item?')) {
      setData((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.id !== id),
      }));
    }
  };

  const handleChooseFormFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setItemImageUrl(result);
          if (!itemName) {
            const cleanName = file.name.replace(/\.[^/.]+$/, '');
            setItemName(cleanName);
          }
          showToast('📸 Image file selected!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuickAddFormSubmit = () => {
    if (!itemName.trim()) {
      setFeedback({ text: 'Enter a name.', color: '#ff4e50' });
      return;
    }
    if (!selectedTier) {
      setFeedback({ text: 'Pick a tier.', color: '#ff4e50' });
      return;
    }

    handleSaveItem({
      title: itemName.trim(),
      subtitle: itemName.trim(),
      imageUrl: itemImageUrl.trim() || undefined,
      tierId: selectedTier,
    });

    setItemName('');
    setItemImageUrl('');
    setSelectedTier(null);
    setFeedback({ text: '✓ Added!', color: '#06d6a0' });
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleFileUpload = (files: FileList, targetTierId: TierId = 'unranked') => {
    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
          handleSaveItem({
            id: `item-${Date.now()}-${idx}`,
            title: cleanTitle,
            subtitle: cleanTitle,
            imageUrl: result,
            tierId: targetTierId,
            fit: 'cover',
          });
        }
      };
      reader.readAsDataURL(file);
    });
    showToast(`Uploaded ${files.length} images!`);
  };

  const handleExportPng = async () => {
    if (!tierlistRef.current) return;

    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      const canvas = await html2canvas(tierlistRef.current, {
        backgroundColor: '#0d0d0f',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `revival-smp-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Failed to export PNG:', e);
    }
  };

  const handleToggleAdminClick = () => {
    if (isAdmin) {
      setIsAdmin(false);
      setData((prev) => ({ ...prev, isPublished: true }));
      showToast('🔒 Published View (Locked)');
    } else {
      setIsAdminLockModalOpen(true);
    }
  };

  const getTierItems = (tierId: TierId) => data.items.filter((i) => i.tierId === tierId);

  return (
    <div className="wrap">
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#141417] border border-yellow-500/50 text-yellow-200 text-xs font-semibold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <Header isAdmin={isAdmin} onToggleAdminClick={handleToggleAdminClick} />

      {/* Tier List Board */}
      <div id="board" ref={tierlistRef}>
        {data.categories.map((category) => (
          <TierRow
            key={category.id}
            category={category}
            items={getTierItems(category.id)}
            isAdmin={isAdmin}
            onDropItem={handleDropItem}
            onDragStart={handleDragStart}
            onEditItem={handleOpenEditModal}
            onDeleteItem={handleDeleteItem}
            onAddItemToTier={handleOpenAddModal}
            onPreviewItem={setPreviewItem}
            onQuickMoveItem={handleQuickMoveItem}
            onFileUploadToTier={handleFileUpload}
          />
        ))}
      </div>

      {/* Unranked Items Pool */}
      <UnrankedPool
        items={getTierItems('unranked')}
        isAdmin={isAdmin}
        onDropItem={handleDropItem}
        onDragStart={handleDragStart}
        onEditItem={handleOpenEditModal}
        onDeleteItem={handleDeleteItem}
        onOpenAddModal={() => handleOpenAddModal('unranked')}
        onFileUpload={handleFileUpload}
        onPreviewItem={setPreviewItem}
      />

      {/* Admin & Credits Tab Bar */}
      <div className="admin-bar">
        {isAdmin && (
          <>
            <div
              className={`tab ${activeTab === 'add' ? 'active' : ''}`}
              onClick={() => setActiveTab('add')}
            >
              Add Item
            </div>
            <div
              className={`tab ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              Manage List ({data.items.length})
            </div>
          </>
        )}
        <div
          className={`tab ${activeTab === 'credits' ? 'active' : ''}`}
          onClick={() => setActiveTab('credits')}
        >
          Credits
        </div>
      </div>

      {/* Add Item Tab with Choose File Button */}
      {isAdmin && activeTab === 'add' && (
        <div className="admin-panel">
          <div>
            <div className="field-label">Item Name / Caption</div>
            <input
              className="text-in"
              placeholder="e.g. Vamep, Trinqfo, Vintage Item"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          <div>
            <div className="field-label flex items-center justify-between">
              <span>Image File or Web URL</span>
              <span className="text-[10px] text-yellow-400">Click Choose File below</span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-[#1c1c21] hover:bg-[#27272a] border border-yellow-500/40 text-yellow-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
              >
                <Upload className="w-3.5 h-3.5" /> Choose File
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleChooseFormFile}
                className="hidden"
              />

              <input
                className="text-in flex-1"
                placeholder="Or paste image URL (https://...)"
                value={itemImageUrl}
                onChange={(e) => setItemImageUrl(e.target.value)}
              />
            </div>
          </div>

          {itemImageUrl && (
            <div className="flex items-center gap-3 p-2 bg-[#1c1c21] rounded-xl border border-zinc-800">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-black flex-shrink-0">
                <img src={itemImageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs text-zinc-300 truncate">Image loaded successfully</span>
            </div>
          )}

          <div>
            <div className="field-label">Select Tier</div>
            <div className="tier-pills">
              {['S', 'A', 'B', 'C', 'D', 'E', 'F'].map((t) => (
                <button
                  key={t}
                  type="button"
                  data-t={t}
                  className={`tp ${selectedTier === t ? 'sel' : ''}`}
                  onClick={() => setSelectedTier(t as TierId)}
                >
                  {t}
                </button>
              ))}
              <button
                type="button"
                className={`tp ${selectedTier === 'unranked' ? 'sel' : ''}`}
                onClick={() => setSelectedTier('unranked')}
                style={{ width: 'auto', padding: '0 10px', borderRadius: '16px' }}
              >
                Pool
              </button>
            </div>
          </div>

          <button className="add-btn" onClick={handleQuickAddFormSubmit}>
            Add to Tier List
          </button>

          {feedback && (
            <div className="text-xs text-center font-semibold" style={{ color: feedback.color }}>
              {feedback.text}
            </div>
          )}
        </div>
      )}

      {/* Manage List Tab */}
      {isAdmin && activeTab === 'list' && (
        <div className="admin-panel">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-xs text-zinc-400">Total Items: {data.items.length}</span>
            <div className="flex items-center gap-2">
              <button onClick={handleExportPng} className="btn-secondary text-xs py-1 px-2.5">
                <Download className="w-3.5 h-3.5" /> Export PNG
              </button>
              <button onClick={() => setIsGithubModalOpen(true)} className="btn-secondary text-xs py-1 px-2.5">
                <Github className="w-3.5 h-3.5" /> GitHub Sync
              </button>
            </div>
          </div>

          <div className="items-grid">
            {data.items.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">No items yet — add some above!</p>
            ) : (
              data.items.map((item) => (
                <div key={item.id} className="ai">
                  <div className="ai-thumb">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} />
                    ) : (
                      <span>🎯</span>
                    )}
                  </div>
                  <div className="ai-info">
                    <div className="ai-name">{item.title}</div>
                    <div className="ai-tier" style={{ color: item.tierId === 'unranked' ? '#666' : undefined }}>
                      {item.tierId === 'unranked' ? 'Unranked Pool' : `${item.tierId} Tier`}
                    </div>
                  </div>
                  <button className="del-btn" onClick={() => handleDeleteItem(item.id)}>
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Credits Tab */}
      {activeTab === 'credits' && (
        <div className="admin-panel">
          <div className="credits-card">
            <div>
              <div className="credit-role-badge flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-yellow-400" /> Maker
              </div>
              <div className="credit-name text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300 font-extrabold text-xl">
                envixyy
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800">
              <div className="credit-role-badge flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-yellow-400" /> Tier Assigners
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-[#141417] border border-yellow-500/40 text-yellow-300 font-extrabold text-sm tracking-wide shadow-md">
                  trinqfo
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-[#141417] border border-yellow-500/40 text-yellow-300 font-extrabold text-sm tracking-wide shadow-md">
                  vamep
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ItemEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveItem}
        categories={data.categories}
        defaultTierId={targetDefaultTier}
        editingItem={editingItem}
      />

      <GithubSyncModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
        tierListData={data}
        githubConfig={data.githubConfig || INITIAL_TIERLIST_DATA.githubConfig!}
        onSaveGithubConfig={(githubConfig) => setData((prev) => ({ ...prev, githubConfig }))}
        onImportData={(importedData) => setData(importedData)}
      />

      <AdminLockModal
        isOpen={isAdminLockModalOpen}
        onClose={() => setIsAdminLockModalOpen(false)}
        currentPin={data.adminPin || '1234'}
        onUnlockSuccess={() => {
          setIsAdmin(true);
          setData((prev) => ({ ...prev, isPublished: false }));
          showToast('🔓 Editor Mode Unlocked!');
        }}
        onChangePin={(newPin) => setData((prev) => ({ ...prev, adminPin: newPin }))}
      />

      <ItemPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        categories={data.categories}
      />
    </div>
  );
};
