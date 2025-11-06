import { useState } from 'react';
import './TopBar.css';

interface TopBarProps {
  onMenuClick: () => void;
  onSearch: (query: string) => void;
}

export default function TopBar({ onMenuClick, onSearch }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <img src="/logo.svg" alt="Logo" className="topbar-logo" />
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            aria-label="Search"
          />
        </form>
      </div>
      <div className="topbar-right">
        <button
          className="menu-button"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 12h18M3 6h18M3 18h18" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}
