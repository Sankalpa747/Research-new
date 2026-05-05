import { useState, useEffect } from 'react';
import { ArrowLeft, Filter, Download, Info, Calendar, MapPin, Building2, Users, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { pilotAPI } from '../../services/api';
import GNSelector from '../../components/pilot/GNSelector';

const CombinedReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  
  // Filter states
  const [filters, setFilters] = useState({
    gn_code: '',
    source: '',
    date_from: '',
    date_to: '',
    limit: 100
  });
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build params, only include non-empty filters
      const params = {};
      if (filters.gn_code) params.gn_code = filters.gn_code;
      if (filters.source) params.source = filters.source;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;
      params.limit = filters.limit;
      
      const response = await pilotAPI.getMasterReports(params);
      
      setReports(response.data.reports || []);
      setTotalCount(response.data.total_count || 0);
      setFilteredCount(response.data.filtered_count || 0);
      setFiltersApplied(response.data.filters_applied || []);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load reports');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    fetchReports();
  };

  const clearFilters = () => {
    setFilters({
      gn_code: '',
      source: '',
      date_from: '',
      date_to: '',
      limit: 100
    });
    // Fetch reports with cleared filters after state update
    setTimeout(() => {
      fetchReports();
    }, 0);
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'hospital': return <Activity className="w-4 h-4 text-red-500" />;
      case 'divisional_secretariat': return <Users className="w-4 h-4 text-blue-500" />;
      case 'urban_council': return <Building2 className="w-4 h-4 text-green-500" />;
      case 'gn_local': return <MapPin className="w-4 h-4 text-purple-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSourceName = (source) => {
    switch (source) {
      case 'hospital': return 'Hospital Reports';
      case 'divisional_secretariat': return 'Divisional Secretariat';
      case 'urban_council': return 'Urban Council';
      case 'gn_local': return 'GN Local Inspection';
      default: return source;
    }
  };

  const getSourceDescription = (source) => {
    switch (source) {
      case 'hospital': return 'Dengue case reports with confirmed and suspected cases';
      case 'divisional_secretariat': return 'Population and household demographic data';
      case 'urban_council': return 'Environmental reports including fogging schedules and water sites';
      case 'gn_local': return 'Local inspections with breeding sites and flagged locations';
      default: return 'Data from various sources';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderReportData = (report) => {
    const data = [];
    
    if (report.confirmed_cases !== undefined || report.suspected_cases !== undefined) {
      data.push(`${report.confirmed_cases || 0} confirmed, ${report.suspected_cases || 0} suspected cases`);
    }
    
    if (report.population !== undefined || report.households !== undefined) {
      data.push(`Population: ${report.population || 'N/A'}, Households: ${report.households || 'N/A'}`);
    }
    
    if (report.fogging_scheduled !== undefined || report.environmental_complaints !== undefined || report.stagnant_water_sites !== undefined) {
      const fogging = report.fogging_scheduled ? 'Fogging scheduled' : 'No fogging';
      data.push(`${fogging}, ${report.environmental_complaints || 0} complaints, ${report.stagnant_water_sites || 0} water sites`);
    }
    
    if (report.breeding_sites !== undefined || report.inspections_total !== undefined || report.flagged_inspections !== undefined) {
      data.push(`${report.breeding_sites || 0} breeding sites, ${report.inspections_total || 0} total inspections, ${report.flagged_inspections || 0} flagged`);
    }
    
    return data.length > 0 ? data : ['No specific data available'];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">All Reports - Combined View</h1>
              <p className="mt-1 text-sm text-gray-600">
                View and filter reports from all data sources: Hospital, Divisional Secretariat, Urban Council, and GN Local Inspections
              </p>
              
              {/* Stats */}
              <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                <span>Total Reports: {totalCount}</span>
                {filtersApplied.length > 0 && (
                  <span>Filtered Results: {filteredCount}</span>
                )}
                {filtersApplied.length > 0 && (
                  <span className="text-blue-600">
                    Filters: {filtersApplied.join(', ')}
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {/* Data Source Guide */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
            <Info className="w-4 h-4 mr-2" />
            Understanding the Data Sources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-blue-700">
            <div className="flex items-start space-x-2">
              <Activity className="w-4 h-4 text-red-500 mt-0.5" />
              <div>
                <div className="font-medium">Hospital Reports</div>
                <div>Confirmed & suspected dengue cases from healthcare facilities</div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Users className="w-4 h-4 text-blue-500 mt-0.5" />
              <div>
                <div className="font-medium">Divisional Secretariat</div>
                <div>Population and household demographic information</div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Building2 className="w-4 h-4 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium">Urban Council</div>
                <div>Environmental data including fogging schedules</div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-purple-500 mt-0.5" />
              <div>
                <div className="font-medium">GN Local Inspection</div>
                <div>Field inspections and breeding site monitoring</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Reports</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* GN Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GN Division
                </label>
                <GNSelector
                  value={filters.gn_code}
                  onChange={(value) => handleFilterChange('gn_code', value)}
                  placeholder="All GN Divisions"
                />
              </div>

              {/* Source Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Source
                </label>
                <select
                  value={filters.source}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white"
                >
                  <option value="">All Sources</option>
                  <option value="hospital">Hospital Reports</option>
                  <option value="divisional_secretariat">Divisional Secretariat</option>
                  <option value="urban_council">Urban Council</option>
                  <option value="gn_local">GN Local Inspection</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear All
              </button>
              <span className="text-sm text-gray-500">
                Use filters to narrow down reports by location, source type, or date range
              </span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading reports...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Reports</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reports List */}
        {!loading && !error && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <Info className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No Reports Found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {filtersApplied.length > 0 
                    ? 'Try adjusting your filters or clearing them to see more results.'
                    : 'No reports have been submitted yet. Start by creating reports from the individual data entry pages.'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Report Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source & Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data Summary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr key={report.report_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 font-mono">
                              {report.report_id}
                            </div>
                            {report.notes && (
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {report.notes}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {report.gn_name}
                            </div>
                            <div className="text-sm text-gray-500 font-mono">
                              {report.gn_code}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getSourceIcon(report.source)}
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">
                                {getSourceName(report.source)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {report.source_record_type?.replace(/_/g, ' ')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {renderReportData(report).map((item, index) => (
                              <div key={index} className="mb-1 last:mb-0">
                                {item}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            {formatDate(report.date)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pagination Info */}
        {!loading && !error && reports.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing {reports.length} of {filteredCount} reports
              {filtersApplied.length > 0 && ` (${totalCount} total)`}
            </span>
            {filteredCount > filters.limit && (
              <span className="text-blue-600">
                Increase limit in filters to see more results
              </span>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-gray-800 mb-2">How to Use This Page</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>View All Data:</strong> See reports from all four data sources in one place</li>
            <li>• <strong>Filter by Location:</strong> Use the GN Division filter to see reports from specific areas (try Kollupitiya, Bambalapitiya, or Wellawatte)</li>
            <li>• <strong>Filter by Source:</strong> Choose a specific data source to see only hospital, divisional, urban council, or local inspection reports</li>
            <li>• <strong>Filter by Date:</strong> Set date ranges to see reports from specific time periods</li>
            <li>• <strong>Understanding Icons:</strong> Each data source has a colored icon - red for hospitals, blue for divisional, green for urban council, purple for local inspections</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CombinedReports;