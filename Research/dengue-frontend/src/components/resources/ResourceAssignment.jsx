import { useState, useEffect } from 'react';
import { Send, Brain, FileText, X } from 'lucide-react';
import { adminAPI, predictionsAPI } from '../../services/api';

const ResourceAssignment = ({ availableResources, onAssign }) => {
  const [districts, setDistricts] = useState([]);
  const [formData, setFormData] = useState({
    district: '',
    Fogging_Units: 0,
    Health_Inspectors: 0,
    Inspection_Teams: 0,
    Treatment_Units: 0,
  });

  const [mlPrediction, setMlPrediction] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [mlError, setMlError] = useState(null);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        // Prefer the richer districts-list endpoint (population + houses)
        const response = await predictionsAPI.getDistrictsList();
        const list = response.data.districts || [];
        setDistricts(list.map((d) => d.name));
      } catch {
        // Fallback to admin overview district list
        try {
          const response = await adminAPI.getOverview();
          setDistricts(response.data.districts || []);
        } catch (error) {
          console.error('Failed to fetch districts:', error);
        }
      }
    };
    fetchDistricts();
  }, []);

  // When a district is selected, auto-fetch ML predictions
  const handleDistrictChange = async (districtName) => {
    setFormData((prev) => ({ ...prev, district: districtName }));
    setMlPrediction(null);
    setMlError(null);
    setShowReport(false);

    if (!districtName) return;

    setMlLoading(true);
    try {
      const response = await predictionsAPI.getAllocate(districtName);
      const pred = response.data;
      setMlPrediction(pred);

      // Auto-fill form with ML recommendations
      setFormData((prev) => ({
        ...prev,
        district: districtName,
        Health_Inspectors: pred.predicted_resources.health_inspectors,
        Fogging_Units:     pred.predicted_resources.fogging_units,
        Inspection_Teams:  pred.predicted_resources.inspection_teams,
        Treatment_Units:   prev.Treatment_Units, // not predicted by new model
      }));
    } catch (err) {
      setMlError('ML prediction unavailable for this district.');
      console.error('ML allocation error:', err);
    } finally {
      setMlLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: key === 'district' ? value : parseInt(value) || 0,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.district) return;
    onAssign(formData);
    setFormData({
      district: '',
      Fogging_Units: 0,
      Health_Inspectors: 0,
      Inspection_Teams: 0,
      Treatment_Units: 0,
    });
    setMlPrediction(null);
    setShowReport(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Resources</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* District selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select District
          </label>
          <select
            value={formData.district}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Choose a district...</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* ML loading indicator */}
        {mlLoading && (
          <div className="flex items-center gap-2 text-blue-600 text-sm bg-blue-50 rounded-lg px-3 py-2">
            <Brain className="w-4 h-4 animate-pulse" />
            Running ML model...
          </div>
        )}

        {/* ML error */}
        {mlError && (
          <div className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            {mlError}
          </div>
        )}

        {/* ML prediction summary badge */}
        {mlPrediction && !mlLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2 mb-2 font-medium text-blue-800">
              <Brain className="w-4 h-4" />
              ML Recommendations for {mlPrediction.district}
            </div>
            <div className="grid grid-cols-2 gap-1 text-blue-700 text-xs">
              <span>Population: {mlPrediction.population?.toLocaleString()}</span>
              <span>Houses: {mlPrediction.houses?.toLocaleString()}</span>
              <span>Health Inspectors: {mlPrediction.predicted_resources.health_inspectors}</span>
              <span>Fogging Units: {mlPrediction.predicted_resources.fogging_units}</span>
              <span>Inspection Teams: {mlPrediction.predicted_resources.inspection_teams}</span>
              <span className="text-blue-600 font-semibold">
                Inspection Days: {mlPrediction.predicted_resources.inspection_days}
              </span>
            </div>
          </div>
        )}

        {/* Resource input fields */}
        {Object.keys(availableResources || {}).map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {key.replace(/_/g, ' ')}
              <span className="text-xs text-gray-500 ml-2">
                (Available: {availableResources[key]})
              </span>
              {mlPrediction && key !== 'Treatment_Units' && (
                <span className="text-xs text-blue-600 ml-2">[ML recommended]</span>
              )}
            </label>
            <input
              type="number"
              value={formData[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
              max={availableResources[key]}
            />
          </div>
        ))}

        {/* Action buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            Assign Resources
          </button>

          {mlPrediction && (
            <button
              type="button"
              onClick={() => setShowReport((v) => !v)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              {showReport ? 'Hide Report' : 'Generate Resource Allocation Report'}
            </button>
          )}
        </div>
      </form>

      {/* Resource Allocation Report Panel */}
      {showReport && mlPrediction && (
        <div className="mt-5 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-600" />
              Resource Allocation Report
            </h4>
            <button
              onClick={() => setShowReport(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm whitespace-pre-line text-gray-800 leading-relaxed">
            {`District: ${mlPrediction.district}
Total Houses: ${mlPrediction.houses?.toLocaleString()}

Required Resources:
Health Inspectors: ${mlPrediction.predicted_resources.health_inspectors}
Fogging Units: ${mlPrediction.predicted_resources.fogging_units}
Inspection Teams: ${mlPrediction.predicted_resources.inspection_teams}
Estimated Days to Inspect All Houses: ${mlPrediction.predicted_resources.inspection_days} days`}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Generated by ML model · Population: {mlPrediction.population?.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default ResourceAssignment;
