
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import './GeographyCard.css';

interface ValuationData {
  totalValue: number;
}

interface NearbyValuation {
  address: string;
  value: number;
  lat: number;
  lng: number;
}

interface GeographyCardProps {
  lat: number;
  lng: number;
  valuation: ValuationData;
  nearbyValuations: NearbyValuation[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function GeographyCard({ lat, lng, valuation, nearbyValuations }: GeographyCardProps) {
  const API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"; // Please replace with your actual API key

  return (
    <div className="infographic-card">
      <h2>Nearby Valuations</h2>
      <div className="map-container">
        {API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY' ? (
          <div className="api-key-placeholder">
            <p>Please replace "YOUR_GOOGLE_MAPS_API_KEY" in GeographyCard.tsx with your actual Google Maps API key to see the map.</p>
          </div>
        ) : (
          <APIProvider apiKey={API_KEY}>
            <Map
              defaultCenter={{ lat, lng }}
              defaultZoom={15}
              mapId="bf51a910020fa25a"
            >
              <AdvancedMarker position={{ lat, lng }} title={'Main Property'}>
                <div className="marker marker-main">
                  <span>{formatCurrency(valuation.totalValue)}</span>
                </div>
              </AdvancedMarker>
              {nearbyValuations.map((nearby, index) => (
                <AdvancedMarker
                  key={index}
                  position={{ lat: nearby.lat, lng: nearby.lng }}
                  title={nearby.address}
                >
                  <div className="marker marker-nearby">
                    <span>{formatCurrency(nearby.value)}</span>
                  </div>
                </AdvancedMarker>
              ))}
            </Map>
          </APIProvider>
        )}
      </div>
      <table className="nearby-table">
        <thead>
          <tr>
            <th>Address</th>
            <th>Value (VND)</th>
          </tr>
        </thead>
        <tbody>
          {nearbyValuations.map((nearby, index) => (
            <tr key={index}>
              <td>{nearby.address}</td>
              <td>{formatCurrency(nearby.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
