
import './InfoCard.css';

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

interface InfoCardProps {
  valuation: ValuationData;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function InfoCard({ valuation }: InfoCardProps) {
  const isIncrement = valuation.valueChange.percent >= 0;
  const valueChangeClass = isIncrement ? 'increment' : 'decrement';

  return (
    <div className="infographic-card">
      <h2>AI Valuation Model</h2>
      <div className="valuation-details">
        <div className="detail-item">
          <span className="detail-label">AI Model</span>
          <span className="detail-value">{valuation.aiModel}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Confidence Score</span>
          <span className="detail-value">{(valuation.confidenceScore * 100).toFixed(0)}%</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Total Value (VND)</span>
          <div className="detail-value-focus">
            <span>{formatCurrency(valuation.totalValue)}</span>
            <span className={valueChangeClass}>
              ({isIncrement ? '+' : ''}{valuation.valueChange.percent}%)
            </span>
          </div>
        </div>
        <div className="detail-item">
          <span className="detail-label">Unit Value (VND/m²)</span>
          <span className="detail-value">{formatCurrency(valuation.unitValue)}</span>
        </div>
      </div>
    </div>
  );
}
