
import './LogTab.css';

interface ActivityLog {
  activity: string;
  timestamp: string;
}

interface LogTabProps {
  certificateNumber: string;
  activityLogs: ActivityLog[];
}

export default function LogTab({ certificateNumber, activityLogs }: LogTabProps) {
  return (
    <div className="changelog-view">
      <div className="changelog-header">
        <h4>Activity Log</h4>
        <p className="changelog-subtitle">{certificateNumber}</p>
      </div>
      <div className="changelog-entries">
        {activityLogs?.map((entry, index) => (
          <div key={index} className="changelog-entry">
            <div className="entry-action">{entry.activity}</div>
            <div className="entry-meta">
              <span className="entry-timestamp">{new Date(entry.timestamp).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
