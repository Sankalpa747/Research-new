import { AlertTriangle, MapPin, Users, Activity, Building2, TrendingUp, Info, Calculator } from 'lucide-react';

const PilotHotspotDetails = ({ gn, formula }) => {
  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'High': return 'bg-red-50 border-red-200 text-red-800';
      case 'Medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'Low': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'High': return <AlertTriangle className="w-8 h-8 text-red-600" />;
      case 'Medium': return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
      case 'Low': return <AlertTriangle className="w-8 h-8 text-green-600" />;
      default: return <AlertTriangle className="w-8 h-8 text-gray-600" />;
    }
  };

  const formatPercentage = (value, total) => {
    if (!total || total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* GN Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {gn.gn_name}
            </h3>
            <p className="text-lg text-gray-600 font-mono">{gn.gn_code}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Priority Rank</div>
            <div className="text-3xl font-bold text-blue-600">#{gn.priority_rank}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg border-2 ${getRiskLevelColor(gn.risk_level)}`}>
            <div className="flex items-center justify-between">
              {getRiskIcon(gn.risk_level)}
              <div className="text-right">
                <div className="text-sm mb-1">Risk Level</div>
                <div className="text-2xl font-bold">{gn.risk_level}</div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div className="text-right">
                <div className="text-sm text-blue-600 mb-1">Risk Score</div>
                <div className="text-2xl font-bold text-blue-900">{gn.risk_score}</div>
              </div>
            </div>
          </div>

          {gn.population > 0 && (
            <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <Users className="w-8 h-8 text-gray-600" />
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">Population</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {gn.population.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Data Sources</div>
          <div className="text-lg font-semibold text-gray-900">
            {gn.report_count} master reports aggregated
          </div>
        </div>
      </div>

      {/* Risk Factors Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Risk Factor Analysis
        </h4>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-6 h-6 text-red-600" />
              <span className="text-xs font-medium text-red-600">Weight: ×5</span>
            </div>
            <div className="text-sm text-red-600 mb-1">Confirmed Cases</div>
            <div className="text-2xl font-bold text-red-900">{gn.confirmed_cases}</div>
            <div className="text-xs text-red-600 mt-1">
              Contributes: {gn.confirmed_cases * (formula?.weights?.confirmed_cases_weight || 5)} points
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-6 h-6 text-purple-600" />
              <span className="text-xs font-medium text-purple-600">Weight: ×3</span>
            </div>
            <div className="text-sm text-purple-600 mb-1">Breeding Sites</div>
            <div className="text-2xl font-bold text-purple-900">{gn.breeding_sites}</div>
            <div className="text-xs text-purple-600 mt-1">
              Contributes: {gn.breeding_sites * (formula?.weights?.breeding_sites_weight || 3)} points
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-6 h-6 text-green-600" />
              <span className="text-xs font-medium text-green-600">Weight: ×2</span>
            </div>
            <div className="text-sm text-green-600 mb-1">Environmental Issues</div>
            <div className="text-2xl font-bold text-green-900">{gn.environmental_complaints}</div>
            <div className="text-xs text-green-600 mt-1">
              Contributes: {gn.environmental_complaints * (formula?.weights?.environmental_complaints_weight || 2)} points
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">Weight: ×2</span>
            </div>
            <div className="text-sm text-blue-600 mb-1">Flagged Inspections</div>
            <div className="text-2xl font-bold text-blue-900">{gn.flagged_inspections}</div>
            <div className="text-xs text-blue-600 mt-1">
              Contributes: {gn.flagged_inspections * (formula?.weights?.flagged_inspections_weight || 2)} points
            </div>
          </div>
        </div>
      </div>

      {/* Formula Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          Risk Score Calculation
        </h4>
        
        {gn.calculation_explanation && (
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="font-mono text-sm text-gray-800">
              {gn.calculation_explanation}
            </div>
          </div>
        )}

        {formula && (
          <div className="space-y-3 text-sm text-blue-800">
            <div>
              <strong>Formula:</strong> {formula.description}
            </div>
            {formula.explanation && (
              <div>
                <strong>Why this works:</strong> {formula.explanation}
              </div>
            )}
            <div>
              <strong>Risk Level Thresholds:</strong>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>High Risk: Score ≥ {formula.weights?.risk_level_thresholds?.high || 100}</li>
                <li>Medium Risk: Score ≥ {formula.weights?.risk_level_thresholds?.medium || 40}</li>
                <li>Low Risk: Score &lt; {formula.weights?.risk_level_thresholds?.medium || 40}</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          Recommendations
        </h4>
        
        <div className="space-y-3 text-sm text-yellow-800">
          {gn.risk_level === 'High' && (
            <div>
              <strong>High Priority Actions:</strong>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>Immediate fogging operations to reduce mosquito population</li>
                <li>Intensive house-to-house inspections</li>
                <li>Community education on dengue prevention</li>
                <li>Enhanced surveillance for new cases</li>
                {gn.breeding_sites > 5 && <li>Focus on eliminating identified breeding sites</li>}
                {gn.environmental_complaints > 10 && <li>Address environmental complaints promptly</li>}
              </ul>
            </div>
          )}
          
          {gn.risk_level === 'Medium' && (
            <div>
              <strong>Preventive Actions:</strong>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>Regular monitoring and inspections</li>
                <li>Community awareness programs</li>
                <li>Preventive fogging in high-risk areas</li>
                {gn.breeding_sites > 0 && <li>Continue breeding site elimination efforts</li>}
              </ul>
            </div>
          )}
          
          {gn.risk_level === 'Low' && (
            <div>
              <strong>Maintenance Actions:</strong>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>Maintain current prevention measures</li>
                <li>Regular community education</li>
                <li>Monitor for any risk factor increases</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PilotHotspotDetails;