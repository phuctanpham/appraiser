
import { useState, useEffect } from 'react';
import './ValuationTab.css';

interface ValuationData {
  aiModel: string;
  confidenceScore: number;
  totalValue: number;
  unitValue: number;
  valueChange: {
    percent: number;
    period: string;
  };
}

interface MockItem {
  id: string;
  valuation: ValuationData;
}

interface ValuationTabProps {
  apiValid: boolean;
}

export default function ValuationTab({ apiValid }: ValuationTabProps) {
  const [valuationData, setValuationData] = useState<ValuationData | null>(null);

  useEffect(() => {
    if (!apiValid) {
      fetch('/mock.json')
        .then((res) => res.json())
        .then((data: MockItem[]) => {
          if (data && data.length > 0) {
            setValuationData(data[0].valuation);
          }
        })
        .catch(console.error);
    }
  }, [apiValid]);

  const renderValuationCard = (data: ValuationData) => {
    const isIncrement = data.valueChange.percent >= 0;
    const valueChangeClass = isIncrement ? 'increment' : 'decrement';

    return (
      <div className="infographic-card">
        <h2>AI Valuation Model</h2>
        <div className="valuation-details">
          <div className="detail-item">
            <span className="detail-label">AI Model</span>
            <span className="detail-value">{data.aiModel}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Confidence Score</span>
            <span className="detail-value">{(data.confidenceScore * 100).toFixed(0)}%</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Total Value ($)</span>
            <div className="detail-value-focus">
              <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.totalValue)}</span>
              <span className={valueChangeClass}>
                ({isIncrement ? '+' : ''}{data.valueChange.percent}%)
              </span>
            </div>
          </div>
          <div className="detail-item">
            <span className="detail-label">Unit Value ($/m²)</span>
            <span className="detail-value">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.unitValue)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="valuation-tab">
      {apiValid ? (
        <div className="valuation-result">
          <p>API is valid. Live data would be displayed here.</p>
        </div>
      ) : (
        <div className="guest-mode-view">
           {valuationData ? renderValuationCard(valuationData) : <p>Loading guest data...</p>}
        </div>
      )}
    </div>
  );
}
