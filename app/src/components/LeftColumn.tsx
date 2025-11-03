
import { useState } from 'react';
import BotTab from './BotTab';
import LogTab from './LogTab';
import './LeftColumn.css';

interface ChatMessage {
  sender: 'user' | 'bot';
  message: string;
  timestamp: string;
}

interface ActivityLog {
  activity: string;
  timestamp: string;
}

interface CellItem {
  id: string;
  avatar: string;
  address: string;
  certificateNumber: string;
  owner: string;
  chatHistory?: ChatMessage[];
  activityLogs?: ActivityLog[];
}

interface LeftColumnProps {
  selectedItem: CellItem | undefined;
  expanded?: boolean;
  onToggleExpand?: () => void;
  onNavigate?: () => void;
}

export default function LeftColumn({
  selectedItem,
  expanded = true,
  onToggleExpand,
  onNavigate,
}: LeftColumnProps) {
  if (!selectedItem) {
    return (
      <div className={`left-column ${expanded ? 'expanded' : 'collapsed'}`}>
        {onToggleExpand && (
          <button className="toggle-button" onClick={onToggleExpand} aria-label="Toggle column">
            {expanded ? '←' : '→'}
          </button>
        )}
        {expanded && (
          <div className="empty-state">
            <h3>No Item Selected</h3>
            <p>Select an item to view details</p>
            {onNavigate && (
              <button className="btn btn-primary" onClick={onNavigate}>
                Go to Items
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`left-column ${expanded ? 'expanded' : 'collapsed'}`}>
      {onToggleExpand && (
        <button className="toggle-button" onClick={onToggleExpand} aria-label="Toggle column">
          {expanded ? '←' : '→'}
        </button>
      )}
      {expanded && (
        <>
          <div className="column-header">
            <div className="tabs">
              <button className="tab active" aria-label="Item tab">
                Item
              </button>
            </div>
          </div>
          <div className="tab-content">
            <BotTab
              certificateNumber={selectedItem.certificateNumber}
              chatHistory={selectedItem.chatHistory || []}
            />
            <LogTab
              certificateNumber={selectedItem.certificateNumber}
              activityLogs={selectedItem.activityLogs || []}
            />
          </div>
        </>
      )}
    </div>
  );
}
