import './ValuationTab.css';

interface ValuationTabProps {
  apiValid: boolean;
}

export default function ValuationTab({ apiValid }: ValuationTabProps) {
  return (
    <div className="valuation-tab">
      {apiValid ? (
        <div>
          <div className="infographic-card">
            <h2>AI Model Information</h2>
            <p>Confidence Score: 95%</p>
            <p>Total Value ($): 1,000,000 <span className="increment">(+5%)</span></p>
            <p>Unit Value ($/m2): 5,000</p>
          </div>
          <div className="infographic-card">
            <h2>Nearby Location Information</h2>
            <table>
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Value</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>123 Main St</td>
                  <td>$950,000</td>
                  <td>2024-07-01</td>
                </tr>
                <tr>
                  <td>456 Oak Ave</td>
                  <td>$1,050,000</td>
                  <td>2024-07-15</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="infographic-card">
            <h2>Valuation History</h2>
            <div>
              <button>Last Month</button>
              <button>Last 3 Months</button>
              <button>Last 6 Months</button>
              <button>Last 12 Months</button>
              <button>Last 36 Months</button>
            </div>
            {/* Add line chart here */}
          </div>
        </div>
      ) : (
        <div className="api-invalid-message">
          <p>This feature is currently disabled because the API endpoint is not configured.</p>
        </div>
      )}
    </div>
  );
}
