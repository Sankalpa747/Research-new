import { AlertTriangle, MapPin, BarChart3, Info } from 'lucide-react';

const PilotHotspotList = ({ hotspots, selectedGN, onSelect }) => {
  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'High': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'Medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'Low': return <AlertTriangle className="w-4 h-4 text-green-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          GN Hotspot Ranking
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Ranked by risk score (highest to lowest)
        </p>
      </div>
      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {hotspots.map((gn) => (
          <button
            key={gn.gn_code}
            onClick={() => onSelect(gn)}
            className={`w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors ${
              selectedGN?.gn_code === gn.gn_code ? 'bg-blue-50 border-r-4 border-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900">{gn.gn_name}</h4>
                <p className="text-sm text-gray-600 font-mono">{gn.gn_code}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(gn.risk_level)}`}>
                  {gn.risk_level}
                </span>
                <div className="text-sm text-gray-500 mt-1">
                  Rank #{gn.priority_rank}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  {getRiskIcon(gn.risk_level)}
                  <span>Score: {gn.risk_score}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  <span>{gn.report_count} reports</span>
                </div>
              </div>
              
              {gn.population > 0 && (
                <div className="text-xs text-gray-500">
                  Pop: {gn.population.toLocaleString()}
                </div>
              )}
            </div>

            {/* Key metrics preview */}
            <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
              <div className="text-center">
                <div className="text-red-600 font-medium">{gn.confirmed_cases}</div>
                <div className="text-gray-500">Cases</div>
              </div>
              <div className="text-center">
                <div className="text-purple-600 font-medium">{gn.breeding_sites}</div>
                <div className="text-gray-500">Sites</div>
              </div>
              <div className="text-center">
                <div className="text-green-600 font-medium">{gn.environmental_complaints}</div>
                <div className="text-gray-500">Complaints</div>
              </div>
              <div className="text-center">
                <div className="text-blue-600 font-medium">{gn.flagged_inspections}</div>
                <div className="text-gray-500">Flagged</div>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {hotspots.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <Info className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No hotspot data available</p>
          <p className="text-sm mt-1">Create some reports to generate hotspot rankings</p>
        </div>
      )}
    </div>
  );
};

export default PilotHotspotList;