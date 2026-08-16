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

      // Check if file already exists to get SHA for update
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

      // Convert content to Base64 (handling utf-8 safely)
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
      <div className="glass-panel w-full max-w-xl p-6 rounded-3xl border border-slate-700/80 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-heading text-slate-100">
              Backend Sync & GitHub Publishing
            </h3>
            <p className="text-xs text-slate-400">
              Publish tier list changes straight to GitHub or export backup files.
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 my-4 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('github')}
            className={`text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
              activeTab === 'github'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-4 h-4" /> GitHub REST Sync
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
              activeTab === 'export'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" /> JSON Export / Import
          </button>
        </div>

        {statusMsg && (
          <div
            className={`p-3 rounded-2xl mb-4 text-xs flex items-center gap-2 border ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : statusMsg.type === 'error'
                ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : statusMsg.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {activeTab === 'github' ? (
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  GitHub Username / Owner
                </label>
                <input
                  type="text"
                  placeholder="e.g. vix"
                  value={config.owner}
                  onChange={(e) => setConfig({ ...config, owner: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Repository Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. revival-tiers"
                  value={config.repo}
                  onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Branch
                </label>
                <input
                  type="text"
                  placeholder="main"
                  value={config.branch}
                  onChange={(e) => setConfig({ ...config, branch: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  File Path
                </label>
                <input
                  type="text"
                  placeholder="revival-tiers-data.json"
                  value={config.filePath}
                  onChange={(e) => setConfig({ ...config, filePath: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                GitHub Personal Access Token (PAT)
              </label>
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={config.token}
                onChange={(e) => setConfig({ ...config, token: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Token needs <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">repo</code> scope permission to push commits directly to GitHub.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={handlePullFromGithub}
                className="btn-secondary text-xs flex items-center gap-1.5"
              >
                <DownloadCloud className="w-4 h-4 text-indigo-400" /> Pull From GitHub
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={handlePushToGithub}
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4" /> Push & Commit to GitHub
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <button onClick={handleCopyJson} className="btn-secondary text-xs">
                Copy JSON Payload
              </button>
              <button onClick={handleDownloadJson} className="btn-secondary text-xs">
                Download JSON File
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Paste JSON to Import
              </label>
              <textarea
                rows={5}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Paste tier list JSON backup data here..."
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 font-mono focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end">
              <button onClick={handleImportJson} className="btn-primary text-xs">
                Import JSON Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
