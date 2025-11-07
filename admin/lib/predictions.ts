export type ModelVersion = 'train' | 'predict';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3004";

/**
 * Gets the active model from localStorage, defaulting to 'predict'.
 * This will be used by the dashboard to remember the user's last selection.
 * @returns The active model version, either 'train' or 'predict'.
 */
export function getActiveModel(): ModelVersion {
  if (typeof window === 'undefined') return 'predict'; // Default for SSR
  return (localStorage.getItem('model_version') as ModelVersion) || 'predict';
}

/**
 * Sets the active model in localStorage.
 * @param version The model version to set.
 */
export function setActiveModel(version: ModelVersion) {
  localStorage.setItem('model_version', version);
}

/**
 * Calls both the 'train' and 'predict' services simultaneously.
 * @param data The property data to send for valuation.
 * @returns A promise that resolves to an object containing the results from both models.
 */
export async function getValuations(data: any): Promise<{ train: any; predict: any }> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    window.location.href = process.env.AUTH_GUI_URL || "https://auth.vpbank.workers.dev";
    throw new Error('Unauthorized');
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const fetchModel = async (model: ModelVersion) => {
    const endpoint = model === 'train' ? '/api/train' : '/api/predict';
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
      throw new Error(errorData.error || `Prediction failed for ${model}`);
    }
    return response.json();
  };

  // Use Promise.all to fetch both simultaneously
  const [train, predict] = await Promise.all([
    fetchModel('train'),
    fetchModel('predict')
  ]);

  return { train, predict };
}
