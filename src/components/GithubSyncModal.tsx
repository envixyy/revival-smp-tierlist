import React, { useState } from 'react';
import { GitHubConfig, TierListData } from '../types';
import { X, Github, UploadCloud, DownloadCloud, CheckCircle2, AlertCircle, FileCode, RefreshCw } from 'lucide-react';

interface GithubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  tierListData: TierListData;
  githubConfig: GitHubConfig;
  onSaveGithubConfig: (config: GitHubConfig) => void;
  onImportData: (data: TierListData) => void;
}

export const GithubSyncModal: React.FC<GithubSyncModalProps> = ({
  isOpen,
  onClose,
  tierListData,
  githubConfig,
  onSaveGithubConfig,
  onImportData,
}) => {
  const [config, setConfig] = useState<GitHubConfig>(githubConfig);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [activeTab, setActiveTab] = useState<'github' | 'export'>('github');

  if (!isOpen) return null;

  const handlePushToGithub = async () => {
    if (!config.owner || !config.repo || !config.token) {
      setStatusMsg({
        type: 'error',
        text: 'Please provide GitHub Owner, Repository name, and Access Token.',
      });
      return;
    }

    setIsLoading(true);
    setStatusMsg({ type: 'info', text: 'Connecting to GitHub REST API...' });

    try {
      const path = config.filePath || 'revival-tiers-data.json';
      const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
      const payloadData = {
        ...tierListData,
        updatedAt: new Date().toISOString(),
        githubConfig: tierListData.githubConfig ? {
          ...tierListData.githubConfig,
          token: '' // Never commit API token to GitHub
        } : undefined,
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
          message: `Update Revival Tiers data via backend editor [${new Date().toLocaleTimeString()}]`,
          content: base64Content,
          branch: config.branch || 'main',
          sha,
        }),
      });

      if (!commitRes.ok) {
        const errJson = await commitRes.json();
        throw new Error(errJson.message || 'Failed to commit file to GitHub');
      }

      const updatedConfig = { ...config, lastSynced: new Date().toISOString() };
      onSaveGithubConfig(updatedConfig);
      setStatusMsg({
        type: 'success',
        text: `Successfully committed and pushed tier list changes to GitHub (${config.owner}/${config.repo})!`,
      });
    } catch (err: any) {
      console.error('GitHub Sync Error:', err);
      setStatusMsg({
        type: 'error',
        text: `GitHub Error: ${err.message || 'Failed to publish to GitHub'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePullFromGithub = async () => {
    if (!config.owner || !config.repo) {
      setStatusMsg({
        type: 'error',
        text: 'Please provide GitHub Owner and Repository name.',
      });
      return;
    }

    setIsLoading(true);
    setStatusMsg({ type: 'info', text: 'Fetching published data from GitHub...' });

    try {
      const path = config.filePath || 'revival-tiers-data.json';
      const rawUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch || 'main'}/${path}?t=${Date.now()}`;
      
      const res = await fetch(rawUrl);
      if (!res.ok) {
        throw new Error(`Failed to fetch file from GitHub (HTTP ${res.status})`);
      }

      const importedData: TierListData = await res.json();
      onImportData(importedData);
      setStatusMsg({
        type: 'success',
        text: 'Successfully pulled latest tier list data from GitHub repository!',
      });
    } catch (err: any) {
      console.error('GitHub Pull Error:', err);
      setStatusMsg({
        type: 'error',
        text: `Error loading from GitHub: ${err.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyJson = () => {
    const dataStr = JSON.stringify(tierListData, null, 2);
    navigator.clipboard.writeText(dataStr);
    setStatusMsg({ type: 'success', text: 'Copied JSON payload to clipboard!' });
  };

  const handleDownloadJson = () => {
    const dataStr = JSON.stringify(tierListData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revival-tiers-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed && Array.isArray(parsed.categories) && Array.isArray(parsed.items)) {
        onImportData(parsed);
        setStatusMsg({ type: 'success', text: 'Successfully imported JSON configuration!' });
      } else {
        throw new Error('Invalid JSON structure. Must contain categories and items array.');
      }
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: `Import failed: ${e.message}` });
    }
  };

  return (
    <div className="modal-overlay animate-pop">
      <div className="glass-panel" style={{ maxWidth: '560px' }}>
        <button onClick={onClose} className="admin-lock-close-btn" type="button">
          <X style={{ width: 16, height: 16 }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.15)', color: '#ffd700', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
            <Github style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <h3 className="modal-title" style={{ margin: 0 }}>Backend Sync & GitHub Publishing</h3>
            <p className="modal-subtitle" style={{ margin: 0 }}>Publish tier list changes straight to GitHub or export backup files.</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="tab-group" style={{ marginBottom: '14px' }}>
          <button
            onClick={() => setActiveTab('github')}
            className={`modal-tab-btn ${activeTab === 'github' ? 'active' : ''}`}
          >
            <Github style={{ width: 14, height: 14, display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} /> GitHub REST Sync
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`modal-tab-btn ${activeTab === 'export' ? 'active' : ''}`}
          >
            <FileCode style={{ width: 14, height: 14, display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} /> JSON Export / Import
          </button>
        </div>

        {statusMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              marginBottom: '14px',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid',
              background: statusMsg.type === 'success' ? 'rgba(6, 214, 160, 0.15)' : statusMsg.type === 'error' ? 'rgba(255, 78, 80, 0.15)' : 'rgba(234, 179, 8, 0.15)',
              borderColor: statusMsg.type === 'success' ? '#06d6a0' : statusMsg.type === 'error' ? '#ff4e50' : '#eab308',
              color: statusMsg.type === 'success' ? '#06d6a0' : statusMsg.type === 'error' ? '#ff4e50' : '#ffd700',
            }}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 style={{ width: 16, height: 16, flexShrink: 0 }} />
            ) : statusMsg.type === 'error' ? (
              <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
            ) : (
              <RefreshCw style={{ width: 16, height: 16, flexShrink: 0 }} />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {activeTab === 'github' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-row-2">
              <div className="form-group">
                <label>GitHub Username / Owner</label>
                <input
                  type="text"
                  placeholder="e.g. envixyy"
                  value={config.owner}
                  onChange={(e) => setConfig({ ...config, owner: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Repository Name</label>
                <input
                  type="text"
                  placeholder="e.g. revival-smp-tierlist"
                  value={config.repo}
                  onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Branch</label>
                <input
                  type="text"
                  placeholder="main"
                  value={config.branch}
                  onChange={(e) => setConfig({ ...config, branch: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>File Path</label>
                <input
                  type="text"
                  placeholder="revival-tiers-data.json"
                  value={config.filePath}
                  onChange={(e) => setConfig({ ...config, filePath: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>GitHub Personal Access Token (PAT)</label>
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={config.token}
                onChange={(e) => setConfig({ ...config, token: e.target.value })}
                style={{ fontFamily: 'monospace' }}
              />
              <span className="field-hint">Token needs <code>repo</code> scope permission to commit to GitHub.</span>
            </div>

            <div className="btn-row" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                disabled={isLoading}
                onClick={handlePullFromGithub}
                className="btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <DownloadCloud style={{ width: 14, height: 14 }} /> Pull From GitHub
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={handlePushToGithub}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <UploadCloud style={{ width: 14, height: 14 }} /> Push & Commit to GitHub
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleCopyJson} className="btn-secondary" style={{ fontSize: '0.75rem' }}>
                Copy JSON Payload
              </button>
              <button onClick={handleDownloadJson} className="btn-secondary" style={{ fontSize: '0.75rem' }}>
                Download JSON File
              </button>
            </div>

            <div className="form-group">
              <label>Paste JSON to Import</label>
              <textarea
                rows={5}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Paste tier list JSON backup data here..."
                style={{ fontFamily: 'monospace', fontSize: '0.78rem', resize: 'none' }}
              />
            </div>

            <div className="btn-row">
              <button onClick={handleImportJson} className="btn-primary">
                Import JSON Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
