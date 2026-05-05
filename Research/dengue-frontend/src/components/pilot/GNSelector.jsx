import { useState, useEffect } from 'react';
import { ChevronDown, MapPin, AlertCircle } from 'lucide-react';
import { pilotAPI } from '../../services/api';

const GNSelector = ({
  value = '',
  onChange,
  placeholder = 'Select GN Division...',
  required = false,
  disabled = false,
  className = '',
  showPopulation = false
}) => {
  const [gnOptions, setGnOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchGNOptions();
  }, []);

  const fetchGNOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await pilotAPI.getGNOptions();
      setGnOptions(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load GN divisions');
      console.error('Error fetching GN options:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (option) => {
    onChange && onChange(option.value, option);
    setIsOpen(false);
  };

  const selectedOption = gnOptions.find(option => option.value === value);

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-gray-500">Loading GN divisions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full p-3 border border-red-300 rounded-md bg-red-50 flex items-center text-red-700">
          <AlertCircle className="w-4 h-4 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full text-left p-3 border rounded-md bg-white flex items-center justify-between
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-blue-400'}
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : ''}
        `}
      >
        <div className="flex items-center flex-1">
          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Required indicator */}
      {required && (
        <span className="absolute -top-1 -right-1 text-red-500 text-sm">*</span>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="max-h-60 overflow-auto">
            {gnOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={`
                  w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center
                  ${selectedOption?.value === option.value ? 'bg-blue-100 text-blue-700' : 'text-gray-900'}
                `}
              >
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <div className="flex-1">
                  <div className="font-medium">{option.label}</div>
                  {showPopulation && (
                    <div className="text-xs text-gray-500">
                      {option.gn_name}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default GNSelector;