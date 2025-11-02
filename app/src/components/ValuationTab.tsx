import './ValuationTab.css';

interface ValuationTabProps {
  apiValid: boolean;
}

export default function ValuationTab({ apiValid }: ValuationTabProps) {
  return (
    <div className="valuation-tab-container">
      {apiValid ? (
        <div className="valuation-result">
          <p>API is valid</p>
        </div>
      ) : (
        <div className="valuation-result">
          <p>API is not valid</p>
        </div>
      )}
    </div>
  );
}
