
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

interface NearbyValuation {
  address: string;
  value: number;
}

interface MockItem {
  id: string;
  valuation: ValuationData;
  address: string;
  nearbyValuations: NearbyValuation[];
}

interface ValuationTabProps {
  apiValid: boolean;
}

export default function ValuationTab({ apiValid }: ValuationTabProps) {
  const [valuationData, setValuationData] = useState<ValuationData | null>(null);
  const [nearbyData, setNearbyData] = useState<NearbyValuation[] | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [zoom, setZoom] = useState(15);

  useEffect(() => {
    if (!apiValid) {
      fetch('/mock.json')
        .then((res) => res.json())
        .then((data: MockItem[]) => {
          if (data && data.length > 0) {
            setValuationData(data[0].valuation);
            setNearbyData(data[0].nearbyValuations);
            setAddress(data[0].address);
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
            <span className="detail-label">Total Value (VND)</span>
            <div className="detail-value-focus">
              <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.totalValue)}</span>
              <span className={valueChangeClass}>
                ({isIncrement ? '+' : ''}{data.valueChange.percent}%)
              </span>
            </div>
          </div>
          <div className="detail-item">
            <span className="detail-label">Unit Value (VND/m²)</span>
            <span className="detail-value">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.unitValue)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderNearbyValuations = (data: NearbyValuation[], currentAddress: string) => (
    <div className="infographic-card">
      <h2>Nearby Valuations</h2>
      <div className="map-placeholder">
        <p>Map of {currentAddress} will be displayed here.</p>
        <div className="map-controls">
          <button onClick={() => setZoom(z => Math.min(z + 1, 18))}>Zoom In</button>
          <button onClick={() => setZoom(z => Math.max(z - 1, 10))}>Zoom Out</button>
          <span>Zoom: {zoom}</span>
        </div>
      </div>
      <table className="nearby-table">
        <thead>
          <tr>
            <th>Address</th>
            <th>Value (VND)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.address}</td>
              <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="valuation-tab">
      {apiValid ? (
        <div className="valuation-result">
          <p>API is valid. Live data would be displayed here.</p>
        </div>
      ) : (
        <div className="guest-mode-view">
          {valuationData ? renderValuationCard(valuationData) : <p>Loading guest data...</p>}
          {nearbyData && address ? renderNearbyValuations(nearbyData, address) : <p>Loading nearby data...</p>}
        </div>
      )}
    </div>
  );
}
