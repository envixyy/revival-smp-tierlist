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
import { Sparkles, Download, Github, Upload, Crown, Users, Edit2, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'revival_tiers_data_v9';

export const App: React.FC = () => {
  const [data, setData] = useState<TierListData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.githubConfig) {
          if (!parsed.githubConfig.owner) parsed.githubConfig.owner = 'envixyy';
          if (!parsed.githubConfig.repo) parsed.githubConfig.repo = 'revival-smp-tierlist';
          if (!parsed.githubConfig.branch) parsed.githubConfig.branch = 'main';
          if (!parsed.githubConfig.filePath) parsed.githubConfig.filePath = 'revival-tiers-data.json';
        } else {
          parsed.githubConfig = {
            owner: 'envixyy',
            repo: 'revival-smp-tierlist',
            branch: 'main',
            filePath: 'revival-tiers-data.json',
            token: ''
          };
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse state:', e);
      }
    }
    return INITIAL_TIERLIST_DATA;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'credits'>('add');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Quick Add Form fields
  const [itemName, setItemName] = useState('');
  const [selectedTier, setSelectedTier] = useState<TierId | null>(null);
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemDescription, setItemDescription] = useState('');
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

  // Auto-pull latest tier list data from GitHub on page load
  useEffect(() => {
    const fetchLatestGitHubData = async () => {
      try {
        const owner = data.githubConfig?.owner || 'envixyy';
        const repo = data.githubConfig?.repo || 'revival-smp-tierlist';
        const branch = data.githubConfig?.branch || 'main';
        const path = data.githubConfig?.filePath || 'revival-tiers-data.json';
        
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}?t=${Date.now()}`;
        const res = await fetch(rawUrl);
        if (res.ok) {
          const remoteData = await res.json();
          if (remoteData && Array.isArray(remoteData.items)) {
            setData((prev) => ({
              ...remoteData,
              // Preserve admin credentials and config stored locally
              adminPin: prev.adminPin || remoteData.adminPin || 'revivaltieradmin',
              githubConfig: {
                ...(remoteData.githubConfig || {}),
                owner: prev.githubConfig?.owner || remoteData.githubConfig?.owner || 'envixyy',
                repo: prev.githubConfig?.repo || remoteData.githubConfig?.repo || 'revival-smp-tierlist',
                branch: prev.githubConfig?.branch || remoteData.githubConfig?.branch || 'main',
                filePath: prev.githubConfig?.filePath || remoteData.githubConfig?.filePath || 'revival-tiers-data.json',
                token: prev.githubConfig?.token || '',
              }
            }));
            console.log('Successfully synced tier list data with GitHub.');
          }
        }
      } catch (err) {
        console.error('Failed to auto-pull latest data from GitHub:', err);
      }
    };

    fetchLatestGitHubData();
  }, []);

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

  const handleDropItem = (targetTierId: TierId, draggedItem: TierItem, targetItemId?: string) => {
    if (!isAdmin) return;

    setData((prev) => {
      const otherItems = prev.items.filter((i) => i.id !== draggedItem.id);
      const updatedItem: TierItem = {
        ...draggedItem,
        tierId: targetTierId,
      };

      let newItemsList: TierItem[] = [];

      if (!targetItemId) {
        // Append to the end of the items list
        newItemsList = [...otherItems, updatedItem];
      } else {
        // Insert right at target item's position
        const targetIndex = otherItems.findIndex((i) => i.id === targetItemId);
        if (targetIndex === -1) {
          newItemsList = [...otherItems, updatedItem];
        } else {
          newItemsList = [
            ...otherItems.slice(0, targetIndex),
            updatedItem,
            ...otherItems.slice(targetIndex)
          ];
        }
      }

      const ordered = newItemsList.map((item, idx) => ({
        ...item,
        order: idx,
      }));

      return {
        ...prev,
        items: ordered,
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
          description: itemData.description,
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
      description: itemDescription.trim() || undefined,
    });

    setItemName('');
    setItemImageUrl('');
    setItemDescription('');
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

  const handlePublishLive = async () => {
    const config = data.githubConfig;
    if (!config || !config.owner || !config.repo || !config.token) {
      setIsGithubModalOpen(true);
      showToast('⚠️ Please configure GitHub Sync details & Access Token.');
      return;
    }

    setIsPublishing(true);
    showToast('🚀 Publishing changes to live site...');

    try {
      const path = config.filePath || 'revival-tiers-data.json';
      const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
      
      const payloadData = {
        ...data,
        updatedAt: new Date().toISOString(),
        githubConfig: {
          ...config,
          token: '' // Never commit API token to GitHub
        },
        adminPin: '' // Never commit PIN to GitHub
      };
      const jsonContent = JSON.stringify(payloadData, null, 2);

      let sha: string | undefined = undefined;
      try {
        const getRes = await fetch(url, {
          headers: {
            Authorization: `Bearer ${config.token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });
        if (getRes.ok) {
          const fileData = await getRes.json();
          sha = fileData.sha;
        }
      } catch (e) {
        console.warn('File does not exist yet or error checking SHA:', e);
      }

      const base64Content = btoa(
        encodeURIComponent(jsonContent).replace(/%([0-9A-F]{2})/g, function toSolidBytes(_match, p1) {
          return String.fromCharCode(parseInt(p1, 16));
        })
      );

      const commitRes = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Update Revival Tiers data via live publish [${new Date().toLocaleTimeString()}]`,
          content: base64Content,
          branch: config.branch || 'main',
          sha,
        }),
      });

      if (!commitRes.ok) {
        const errJson = await commitRes.json();
        throw new Error(errJson.message || 'Failed to commit file to GitHub');
      }

      showToast('✨ Published successfully! Live site is updating.');
    } catch (err: any) {
      console.error('Publish Error:', err);
      showToast(`❌ Publish failed: ${err.message || 'Error saving to GitHub'}`);
    } finally {
      setIsPublishing(false);
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
      <Header 
        isAdmin={isAdmin} 
        onToggleAdminClick={handleToggleAdminClick} 
        isPublishing={isPublishing}
        onPublishClick={handlePublishLive}
      />

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

          <div>
            <div className="field-label">Description (Optional)</div>
            <textarea
              className="text-in"
              placeholder="Write about this person..."
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              rows={2}
              style={{ resize: 'none' }}
            />
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
              data.items.map((item) => {
                const tierColors: Record<string, string> = {
                  S: '#ff4e50', A: '#ff8c42', B: '#ffd166', C: '#06d6a0',
                  D: '#4eb8f7', E: '#b78ff7', F: '#666', unranked: '#555'
                };
                return (
                  <div
                    key={item.id}
                    className="ai"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleOpenEditModal(item)}
                  >
                    <div className="ai-thumb">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} />
                      ) : (
                        <span>🎯</span>
                      )}
                    </div>
                    <div className="ai-info">
                      <div className="ai-name">{item.title}</div>
                      <div className="ai-tier" style={{ color: tierColors[item.tierId] || '#666' }}>
                        {item.tierId === 'unranked' ? 'Pool' : `${item.tierId} Tier`}
                      </div>
                      {item.description && (
                        <div style={{ fontSize: '0.62rem', color: '#555', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.description.slice(0, 50)}{item.description.length > 50 ? '...' : ''}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button
                        className="del-btn"
                        title="Edit"
                        onClick={(e) => { e.stopPropagation(); handleOpenEditModal(item); }}
                        style={{ borderColor: 'rgba(234,179,8,0.3)', color: '#eab308' }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        className="del-btn"
                        title="Delete"
                        onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
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
        currentPin={data.adminPin || 'revivaltieradmin'}
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
