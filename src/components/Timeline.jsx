import React from 'react';
import './Timeline.css';

const Timeline = ({ logs }) => {
  return (
    <div className="timeline">
      <h3>Live Event Log</h3>
      <div className="timeline-list">
        {logs.map((log) => (
          <div key={log.id} className="timeline-item">
            <div className="timeline-time">{log.time}</div>
            <div className="timeline-content">
              <span className={`badge badge-${log.source.toLowerCase()}`}>{log.source}</span>
              <span className="message">{log.message}</span>
            </div>
          </div>
        ))}
        {logs.length === 0 && <div className="text-muted text-sm">Waiting for events...</div>}
      </div>
    </div>
  );
};

export default Timeline;
