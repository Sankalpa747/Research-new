import { AlertTriangle, Info, TrendingUp } from 'lucide-react';

const HotspotLegend = ({ stats, lastUpdated, loading }) => {
  const legendItems = [
    {
      level: 'High',
      color: '#EF4444',
      description: 'Immediate attention required',
      icon: <AlertTriangle className="w-4 h-4" />,
      count: stats?.highRisk || 0
    },
    {
      level: 'Medium',
      color: '#F59E0B',
      description: 'Preventive measures needed',
      icon: <TrendingUp className="w-4 h-4" />,
      count: stats?.mediumRisk || 0
    },
    {
      level: 'Low',
      color: '#10B981',
      description: 'Maintain current prevention',
      icon: <Info className="w-4 h-4" />,
      count: stats?.lowRisk || 0
    }
  ];

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000] min-w-[280px]">
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">Dengue Risk Levels</h3>
        {lastUpdated && (
          <p className="text-xs text-gray-500">
            Updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading hotspot data...</span>
        </div>
      ) : (
        <div className="space-y-2">
          {legendItems.map((item) => (
            <div key={item.level} className="flex items-center space-x-3">
              {/* Color indicator */}
              <div 
                className="w-4 h-4 rounded border-2 flex-shrink-0"
                style={{ 
                  backgroundColor: item.color, 
                  borderColor: item.color,
                  opacity: 0.7
                }}
              ></div>
              
              {/* Level info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-sm text-gray-900">
                    {item.level} Risk
                  </span>
                  <span className="text-xs text-gray-500">
                    ({item.count})
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  {item.description}
                </p>
              </div>
              
              {/* Icon */}
              <div className="text-gray-400 flex-shrink-0">
                {item.icon}
              </div>
            </div>
          ))}
          
          {/* Summary stats */}
          {stats && (
            <div className="pt-3 mt-3 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Total Areas:</span> {stats.total}
                </div>
                <div>
                  <span className="font-medium">Top Score:</span> {stats.topScore}
                </div>
                <div>
                  <span className="font-medium">Avg Score:</span> {stats.avgScore}
                </div>
                <div>
                  <span className="font-medium">High Risk:</span> {((stats.highRisk / Math.max(stats.total, 1)) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Formula hint */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 italic">
          Risk = (Cases×5) + (Sites×3) + (Complaints×2) + (Flagged×2)
        </p>
      </div>
    </div>
  );
};

export default HotspotLegend;