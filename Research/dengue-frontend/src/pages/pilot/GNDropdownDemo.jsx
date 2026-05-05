import { useState } from 'react';
import { Save, MapPin, Users } from 'lucide-react';
import GNSelector from '../../components/pilot/GNSelector';
import { usePilotData } from '../../hooks/usePilotData';

const GNDropdownDemo = () => {
  const [selectedGN, setSelectedGN] = useState('');
  const [formData, setFormData] = useState({
    date: '',
    cases: '',
    notes: ''
  });
  
  const { gnList, loading, error } = usePilotData();

  const handleGNChange = (gnCode, gnOption) => {
    setSelectedGN(gnCode);
    console.log('Selected GN:', gnCode, gnOption);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedGN) {
      alert('Please select a GN division');
      return;
    }

    const submissionData = {
      gn_code: selectedGN,
      ...formData,
      timestamp: new Date().toISOString()
    };

    console.log('Form submission:', submissionData);
    alert(`Form submitted for ${selectedGN}!\nCheck console for details.`);
  };

  const selectedGNData = gnList.find(gn => gn.gn_code === selectedGN);

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          GN Dropdown Demo
        </h2>
        <p className="text-gray-600">
          Test the GN master list and dropdown functionality
        </p>
      </div>

      {/* Demo Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* GN Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GN Division *
            </label>
            <GNSelector
              value={selectedGN}
              onChange={handleGNChange}
              placeholder="Choose your GN division..."
              required
              className="w-full"
              showPopulation
            />
            <p className="mt-1 text-xs text-gray-500">
              Select from the 3 Colombo pilot GN divisions
            </p>
          </div>

          {/* Selected GN Info */}
          {selectedGNData && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Selected GN Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600 font-medium">Code:</span>{' '}
                  {selectedGNData.gn_code}
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Name:</span>{' '}
                  {selectedGNData.gn_name}
                </div>
                <div className="flex items-center">
                  <Users className="w-3 h-3 mr-1 text-blue-600" />
                  <span className="text-blue-600 font-medium">Population:</span>{' '}
                  {selectedGNData.population.toLocaleString()}
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Households:</span>{' '}
                  {selectedGNData.households.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Date Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Cases Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Cases
            </label>
            <input
              type="number"
              value={formData.cases}
              onChange={(e) => setFormData(prev => ({ ...prev, cases: e.target.value }))}
              min="0"
              placeholder="Enter number of dengue cases"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Notes Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Additional notes or observations..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Save className="w-4 h-4 mr-2" />
              Submit Demo Form
            </button>
          </div>
        </form>
      </div>

      {/* Debug Info */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Information</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Loading: {loading ? 'Yes' : 'No'}</div>
          <div>Error: {error || 'None'}</div>
          <div>Available GNs: {gnList.length}</div>
          <div>Selected: {selectedGN || 'None'}</div>
        </div>
      </div>
    </div>
  );
};

export default GNDropdownDemo;