import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Truck, Calculator, AlertTriangle, CheckCircle, Info, RefreshCw, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { pilotAPI } from '../../services/api';

const ResourceAllocation = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [config, setConfig] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchResourceAllocation();
  }, []);

  const fetchResourceAllocation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await pilotAPI.getPilotResourceAllocation();
      
      setAllocations(response.data.allocations || []);
      setSummary(response.data.summary || null);
      setConfig(response.data.config || null);
      setLastUpdated(new Date());
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load resource allocation');
      console.error('Error fetching resource allocation:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelBadge = (level) => {
    const colors = {
      'High': 'bg-red-100 text-red-800 border-red-200',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      'Low': 'bg-green-100 text-green-800 border-green-200'
    };
    
    return colors[level] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getEfficiencyColor = (rating) => {
    switch (rating) {
      case 'High': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Over capacity': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading resource allocation...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resource Allocation</h1>
              <p className="mt-1 text-sm text-gray-600">
                Rule-based team allocation for dengue control operations in pilot GN areas
              </p>
              
              {lastUpdated && (
                <p className="mt-2 text-xs text-gray-500">
                  Last updated: {lastUpdated.toLocaleString()}
                </p>
              )}
            </div>
            
            <button
              onClick={fetchResourceAllocation}
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Allocation</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center">
                <Truck className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Fogging Teams</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {summary.fogging_utilization}
                  </p>
                  <p className="text-xs text-blue-600">Teams allocated/available</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">Inspection Teams</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {summary.inspection_utilization}
                  </p>
                  <p className="text-xs text-purple-600">Teams allocated/available</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                {summary.allocation_feasible ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                )}
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Capacity Status</p>
                  <p className="text-sm font-bold text-green-900">
                    {summary.capacity_status}
                  </p>
                  <p className="text-xs text-green-600">
                    {summary.allocation_feasible ? 'All constraints met' : 'Review needed'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <Calculator className="w-8 h-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total GN Areas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.count || allocations.length}
                  </p>
                  <p className="text-xs text-gray-600">Areas with allocations</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Allocation Rules Guide */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            How Resource Allocation Works
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-3">Allocation Rules (Simple & Adjustable)</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Rank #1
                  </span>
                  <span>2 fogging teams + 1 inspection team (highest risk)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Rank #2
                  </span>
                  <span>1 fogging team + 1 inspection team (medium risk)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Rank #3
                  </span>
                  <span>0 fogging teams + 1 inspection team (monitoring only)</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-800 mb-3">Daily Constraints</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div>• <strong>Fogging Teams:</strong> 2 teams available per day</div>
                <div>• <strong>Inspection Teams:</strong> 3 teams available per day</div>
                <div>• <strong>Work Hours:</strong> Maximum 8 hours per team</div>
                <div>• <strong>Updates:</strong> Allocation recalculates when hotspot data changes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Allocation Table */}
        {allocations.length > 0 ? (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Resource Allocation Plan</h3>
              <p className="text-sm text-gray-600">Teams assigned to each GN area based on dengue risk ranking</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GN Area & Risk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fogging Teams
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inspection Teams
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estimated Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Efficiency
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allocations.map((allocation) => (
                    <tr key={allocation.gn_code} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {allocation.gn_name}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            {allocation.gn_code}
                          </div>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskLevelBadge(allocation.risk_level)}`}>
                              {allocation.risk_level} Risk (Score: {allocation.risk_score})
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                            #{allocation.priority_rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Truck className="w-4 h-4 text-blue-500 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {allocation.fogging_teams_allocated}
                            </div>
                            <div className="text-xs text-gray-500">
                              {allocation.fogging_allocation_text}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-purple-500 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {allocation.inspection_teams_allocated}
                            </div>
                            <div className="text-xs text-gray-500">
                              {allocation.inspection_allocation_text}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Total: <strong>{allocation.estimated_hours.total}h</strong></div>
                          <div className="text-xs text-gray-500">
                            Fogging: {allocation.estimated_hours.fogging}h, 
                            Inspection: {allocation.estimated_hours.inspection}h
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getEfficiencyColor(allocation.resource_utilization.efficiency_rating)}`}>
                          {allocation.resource_utilization.efficiency_rating}
                        </span>
                        {!allocation.resource_utilization.within_capacity && (
                          <div className="text-xs text-red-500 mt-1">
                            ⚠ Over 8h limit
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-12 text-center">
            <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Allocation Data Available
            </h3>
            <p className="text-gray-600">
              Resource allocation requires hotspot ranking data. Please ensure reports have been submitted and hotspots calculated.
            </p>
          </div>
        )}

        {/* Configuration Information */}
        {config && (
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configuration & Modification Guide
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Current Configuration</h4>
                <div className="space-y-1">
                  <div>Daily fogging teams: <strong>{config.daily_constraints.fogging_teams_available}</strong></div>
                  <div>Daily inspection teams: <strong>{config.daily_constraints.inspection_teams_available}</strong></div>
                  <div>Max hours per team: <strong>{config.daily_constraints.max_hours_per_team}</strong></div>
                  <div>Fogging operation time: <strong>{config.resource_types.fogging_teams.hours_per_operation}h</strong></div>
                  <div>Inspection operation time: <strong>{config.resource_types.inspection_teams.hours_per_operation}h</strong></div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">How to Modify Rules</h4>
                <div className="space-y-1">
                  <div>• <strong>Rules Location:</strong> <code className="text-xs bg-gray-200 px-1 rounded">backend/routes/pilot.py</code></div>
                  <div>• <strong>Configuration Object:</strong> <code className="text-xs bg-gray-200 px-1 rounded">PILOT_RESOURCE_CONFIG</code></div>
                  <div>• <strong>Change Allocation:</strong> Edit <code className="text-xs bg-gray-200 px-1 rounded">allocation_rules</code> dictionary</div>
                  <div>• <strong>Change Capacity:</strong> Edit <code className="text-xs bg-gray-200 px-1 rounded">daily_constraints</code></div>
                  <div>• Changes take effect immediately after server restart</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Easy Customization:</strong> All allocation rules are stored in a simple configuration object 
                that can be modified without changing the core logic. This makes it easy to adjust team assignments 
                based on operational requirements or resource availability changes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceAllocation;