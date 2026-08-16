import React from 'react';

interface HeaderProps {
  isAdmin: boolean;
  onToggleAdminClick: () => void;
  isPublishing?: boolean;
  onPublishClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  isAdmin, 
  onToggleAdminClick,
  isPublishing = false,
  onPublishClick
}) => {
  return (
    <>
      <header>
        <div className="logo">
          <div className="logo-text-group">
            <span className="logo-r">R</span>
            <span className="logo-t">evival</span>
            <span className="logo-tag">TIERS</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          src="/revival-logo.png"
          alt="Revival Crystal Logo"
          style={{ width: 48, height: 48, objectFit: 'contain', margin: '0 auto 8px' }}
        />
        <h1>
          Revival SMP
          <br />
          <em>Tierlist</em>
        </h1>
      </div>
    </>
  );
};
