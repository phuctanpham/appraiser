
import { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
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
  lat: number;
  lng: number;
}

interface MockItem {
  id: string;
  valuation: ValuationData;
  address: string;
  lat: number;
  lng: number;
  nearbyValuations: NearbyValuation[];
}

interface ValuationTabProps {
  apiValid: boolean;
}

export default function ValuationTab({ apiValid }: ValuationTabProps) {
  const [selectedItem, setSelectedItem] = useState<MockItem | null>(null);
  const API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"; // Please replace with your actual API key

  useEffect(() => {
    if (!apiValid) {
      fetch('/mock.json')
        .then((res) => res.json())
        .then((data: MockItem[]) => {
          if (data && data.length > 0) {
            setSelectedItem(data[0]);
          }
        })
        .catch(console.error);
    }
  }, [apiValid]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  if (apiValid) {
    return (
      <div className="valuation-tab">
        <div className="valuation-result">
          <p>API is valid. Live data would be displayed here.</p>
        </div>
      </div>
    );
  }

  if (!selectedItem) {
    return <div className="valuation-tab"><p>Loading guest data...</p></div>;
  }

  const { valuation, nearbyValuations, lat, lng } = selectedItem;
  const isIncrement = valuation.valueChange.percent >= 0;
  const valueChangeClass = isIncrement ? 'increment' : 'decrement';

  return (
    <div className="valuation-tab">
      <div className="infographic-card-unified">
        <div className="valuation-header">
          <h2>AI Valuation Model: {valuation.aiModel}</h2>
          <div className="confidence-score">
            <span>Confidence: </span>
            <span>{(valuation.confidenceScore * 100).toFixed(0)}%</span>
          </div>
        </div>
        <div className="main-valuation-details">
          <div className="total-value">
            <span className="detail-label">Total Value</span>
            <div className="detail-value-focus">
              <span>{formatCurrency(valuation.totalValue)}</span>
              <span className={valueChangeClass}>
                ({isIncrement ? '+' : ''}{valuation.valueChange.percent}%)
              </span>
            </div>
          </div>
          <div className="unit-value">
            <span className="detail-label">Unit Value (m²)</span>
            <span className="detail-value">{formatCurrency(valuation.unitValue)}</span>
          </div>
        </div>

        <div className="map-container">
          {API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY' ? (
            <div className="api-key-placeholder">
              <p>Please replace "YOUR_GOOGLE_MAPS_API_KEY" in ValuationTab.tsx with your actual Google Maps API key to see the map.</p>
            </div>
          ) : (
            <APIProvider apiKey={API_KEY}>
              <Map
                defaultCenter={{ lat, lng }}
                defaultZoom={15}
                mapId="bf51a910020fa25a" // Optional: for custom map styling
              >
                {/* Main Property Marker */}
                <AdvancedMarker position={{ lat, lng }} title={'Main Property'}>
                  <div className="marker marker-main">
                    <span>{formatCurrency(valuation.totalValue)}</span>
                  </div>
                </AdvancedMarker>

                {/* Nearby Properties Markers */}
                {nearbyValuations.map((item, index) => (
                  <AdvancedMarker
                    key={index}
                    position={{ lat: item.lat, lng: item.lng }}
                    title={item.address}
                  >
                    <div className="marker marker-nearby">
                      <span>{formatCurrency(item.value)}</span>
                    </div>
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
           )}
        </div>
      </div>
    </div>
  );
}
