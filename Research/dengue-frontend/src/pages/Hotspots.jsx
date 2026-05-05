import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, TrendingUp, Map, Info } from 'lucide-react';
import { predictionsAPI, pilotAPI } from '../services/api';
import HotspotList from '../components/hotspots/HotspotList';
import HotspotDetails from '../components/hotspots/HotspotDetails';
import PilotHotspotList from '../components/hotspots/PilotHotspotList';
import PilotHotspotDetails from '../components/hotspots/PilotHotspotDetails';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

const Hotspots = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [recommendations, setRecommendations] = useState({});
  
  // Pilot hotspot data
  const [pilotHotspots, setPilotHotspots] = useState([]);
  const [selectedGN, setSelectedGN] = useState(null);
  const [pilotFormula, setPilotFormula] = useState(null);
  const [showPilotData, setShowPilotData] = useState(false);

  useEffect(() => {
    fetchHotspotData();
  }, []);

  const fetchHotspotData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch both district and pilot hotspots
      const promises = [
        predictionsAPI.getHotspots().catch(err => ({ data: { hotspots: [] } })),
        predictionsAPI.getRecommendations().catch(err => ({ data: { recommendations: [] } })),
        pilotAPI.getPilotHotspots().catch(err => ({ data: { hotspots: [], formula: null } }))
      ];
      
      const [hotspotsRes, recommendationsRes, pilotHotspotsRes] = await Promise.all(promises);
      
      const hotspotsData = hotspotsRes.data.hotspots || [];
      const recommendationsData = recommendationsRes.data.recommendations || [];
      const pilotHotspotsData = pilotHotspotsRes.data.hotspots || [];
      const pilotFormulaData = pilotHotspotsRes.data.formula || null;
      
      setHotspots(hotspotsData);
      setPilotHotspots(pilotHotspotsData);
      setPilotFormula(pilotFormulaData);
      
      // Show pilot data if available, otherwise show district data
      setShowPilotData(pilotHotspotsData.length > 0);
      
      // Convert recommendations array to object keyed by district
      const recsObject = {};
      recommendationsData.forEach(rec => {
        recsObject[rec.District] = rec;
      });
      setRecommendations(recsObject);
    } catch (err) {
      setError(err.message || 'Failed to load hotspot data');
      console.error('Hotspots error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading hotspots..." />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={fetchHotspotData} />;
  }

  const currentHotspots = showPilotData ? pilotHotspots : hotspots;
  const hasData = currentHotspots.length > 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hotspot Detection</h2>
          <p className="text-gray-600 mt-1">
            {showPilotData 
              ? "GN-level dengue risk ranking for Colombo pilot areas"
              : "High-risk districts requiring immediate intervention"
            }
          </p>
        </div>
        
        {/* Data source toggle */}
        {(pilotHotspots.length > 0 || hotspots.length > 0) && (
          <div className="flex bg-gray-100 rounded-lg p-1">
            {hotspots.length > 0 && (
              <button
                onClick={() => setShowPilotData(false)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  !showPilotData ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map className="w-4 h-4 inline mr-2" />
                District View
              </button>
            )}
            {pilotHotspots.length > 0 && (
              <button
                onClick={() => setShowPilotData(true)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  showPilotData ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MapPin className="w-4 h-4 inline mr-2" />
                GN Pilot View
              </button>
            )}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {hasData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <span className="text-3xl font-bold text-red-900">
                {showPilotData 
                  ? pilotHotspots.filter(h => h.risk_level === 'High').length
                  : hotspots.length
                }
              </span>
            </div>
            <h3 className="text-sm font-medium text-red-800">
              {showPilotData ? 'High Risk GNs' : 'Active Hotspots'}
            </h3>
            <p className="text-xs text-red-600 mt-1">
              {showPilotData 
                ? 'GN divisions with high dengue risk'
                : 'Districts with high dengue risk'
              }
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-8 h-8 text-orange-600" />
              <span className="text-3xl font-bold text-orange-900">
                {showPilotData 
                  ? pilotHotspots.filter(h => h.risk_level === 'Medium').length
                  : hotspots.filter(h => (h.High_Probability || 0) > 0.95).length
                }
              </span>
            </div>
            <h3 className="text-sm font-medium text-orange-800">
              {showPilotData ? 'Medium Risk GNs' : 'Critical Areas'}
            </h3>
            <p className="text-xs text-orange-600 mt-1">
              {showPilotData 
                ? 'GN divisions with medium risk'
                : 'High confidence hotspots'
              }
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-yellow-600" />
              <span className="text-3xl font-bold text-yellow-900">
                {showPilotData 
                  ? pilotHotspots.filter(h => h.risk_level === 'Low').length
                  : Object.keys(recommendations).length
                }
              </span>
            </div>
            <h3 className="text-sm font-medium text-yellow-800">
              {showPilotData ? 'Low Risk GNs' : 'Resource Plans'}
            </h3>
            <p className="text-xs text-yellow-600 mt-1">
              {showPilotData 
                ? 'GN divisions with low risk'
                : 'Districts with recommendations'
              }
            </p>
          </div>
        </div>
      )}

      {/* Pilot Formula Information */}
      {showPilotData && pilotFormula && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
            <Info className="w-4 h-4 mr-2" />
            Risk Scoring Formula
          </h3>
          <p className="text-sm text-blue-700 mb-2">{pilotFormula.description}</p>
          <p className="text-xs text-blue-600">{pilotFormula.explanation}</p>
        </div>
      )}

      {/* Main Content */}
      {!hasData ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Hotspot Data Available
          </h3>
          <p className="text-gray-600">
            {showPilotData 
              ? "Create some pilot reports to generate GN-level hotspot rankings."
              : "Generate predictions or create pilot reports to see hotspot data."
            }
          </p>
        </div>
      ) : showPilotData ? (
        /* Pilot GN Hotspots View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <PilotHotspotList
              hotspots={pilotHotspots}
              selectedGN={selectedGN}
              onSelect={setSelectedGN}
            />
          </div>
          <div className="lg:col-span-2">
            {selectedGN ? (
              <PilotHotspotDetails
                gn={selectedGN}
                formula={pilotFormula}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a GN Division
                </h3>
                <p className="text-gray-600">
                  Choose a GN from the ranking list to view detailed risk analysis
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* District Hotspots View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <HotspotList
              hotspots={hotspots}
              selectedDistrict={selectedDistrict}
              onSelect={setSelectedDistrict}
            />
          </div>
          <div className="lg:col-span-2">
            {selectedDistrict ? (
              <HotspotDetails
                district={selectedDistrict}
                recommendations={recommendations[selectedDistrict.District]}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a District
                </h3>
                <p className="text-gray-600">
                  Choose a hotspot from the list to view detailed information
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Hotspots;