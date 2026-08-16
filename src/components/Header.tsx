import React from 'react';

interface HeaderProps {
  isAdmin: boolean;
  onToggleAdminClick: () => void;
  isPublishing?: boolean;
  onPublishClick?: () => void;
  currentView: 'tierlist' | 'suggestions';
  onNavigate: (view: 'tierlist' | 'suggestions') => void;
  suggestionsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  isAdmin, 
  onToggleAdminClick,
  isPublishing = false,
  onPublishClick,
  currentView,
  onNavigate,
  suggestionsCount = 0,
}) => {
  return (
    <>
      <header>
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => onNavigate('tierlist')}>
          <div className="logo-text-group">
            <span className="logo-r">R</span>
            <span className="logo-t">evival</span>
            <span className="logo-tag">TIERS</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {currentView === 'tierlist' ? (
            <button 
              className="admin-btn" 
              onClick={() => onNavigate('suggestions')}
              style={{ color: '#ffd700', borderColor: 'rgba(234, 179, 8, 0.4)', background: 'rgba(234, 179, 8, 0.12)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
            >
              💬 Suggestions ({suggestionsCount})
            </button>
          ) : (
            <button 
              className="admin-btn" 
              onClick={() => onNavigate('tierlist')}
              style={{ color: '#06d6a0', borderColor: 'rgba(6, 214, 160, 0.4)', background: 'rgba(6, 214, 160, 0.12)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
            >
              🏆 Back to Tier List
            </button>
          )}

          {isAdmin && onPublishClick && (
            <button 
              className="publish-btn" 
              onClick={onPublishClick} 
              disabled={isPublishing}
            >
              {isPublishing ? '⏳ Syncing...' : '🚀 Publish Live'}
            </button>
          )}
          <button className="admin-btn" onClick={onToggleAdminClick}>
            {isAdmin ? '🔒 Reader View' : '⚙ Admin'}
          </button>
        </div>
      </header>

      <div className="hero">
        <img
          src="revival-logo.png"
          alt="Revival Crystal Logo"
          style={{ width: 48, height: 48, objectFit: 'contain', margin: '0 auto 8px', cursor: 'pointer' }}
          onClick={() => onNavigate('tierlist')}
        />
        <h1>
          Revival SMP
          <br />
          <em>{currentView === 'suggestions' ? 'Suggestions Forum' : 'Tierlist'}</em>
        </h1>
      </div>
    </>
  );
};
