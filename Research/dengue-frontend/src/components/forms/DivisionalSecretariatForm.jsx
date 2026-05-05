import { useState } from 'react';
import { Calendar, Building, Users, FileText, Home } from 'lucide-react';
import GNSelector from '../pilot/GNSelector';
import { pilotAPI } from '../../services/api';
import { parseApiError, validateDate, validateGNCode, validateNumericField } from '../../utils/errorHandling';

const DivisionalSecretariatForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    date: initialData.date || new Date().toISOString().split('T')[0],
    gn_code: initialData.gn_code || '',
    gn_name: initialData.gn_name || '',
    population: initialData.population || '',
    households: initialData.households || '',
    notes: initialData.notes || ''
  });

  const [selectedGN, setSelectedGN] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Date validation
    const dateError = validateDate(formData.date);
    if (dateError) newErrors.date = dateError;

    // GN Division validation
    const gnError = validateGNCode(formData.gn_code);
    if (gnError) newErrors.gn_code = gnError;

    // Population validation
    const populationError = validateNumericField(
      formData.population, 
      'Population count',
      { allowZero: false, maxWarningValue: 100000 }
    );
    if (populationError) newErrors.population = populationError;

    // Households validation
    const householdsError = validateNumericField(
      formData.households, 
      'Household count',
      { allowZero: false, maxWarningValue: 50000 }
    );
    if (householdsError) newErrors.households = householdsError;

    // Cross-field validation for population and households
    if (formData.population && formData.households) {
      const population = parseInt(formData.population);
      const households = parseInt(formData.households);
      
      if (!isNaN(population) && !isNaN(households) && population > 0 && households > 0) {
        const avgPerHousehold = population / households;
        if (avgPerHousehold < 1.5) {
          newErrors.households = 'Average people per household seems too low (less than 1.5). Please verify your numbers.';
        } else if (avgPerHousehold > 15) {
          newErrors.households = 'Average people per household seems too high (more than 15). Please verify your numbers.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle GN selection
  const handleGNChange = (gnCode, gnOption) => {
    setSelectedGN(gnOption);
    setFormData(prev => ({
      ...prev,
      gn_code: gnCode,
      gn_name: gnOption.gn_name
    }));

    // Clear GN error
    if (errors.gn_code) {
      setErrors(prev => ({
        ...prev,
        gn_code: ''
      }));
    }
  };

  // Generate report ID
  const generateReportId = () => {
    const date = new Date(formData.date);
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `DS-${dateStr}-${randomSuffix}`;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const reportData = {
        report_id: generateReportId(),
        date: formData.date,
        gn_code: formData.gn_code,
        gn_name: formData.gn_name,
        source: 'divisional_secretariat',
        source_record_type: 'population_profile',
        population: parseInt(formData.population),
        households: parseInt(formData.households),
        notes: formData.notes || null,
        latitude: null,
        longitude: null
      };

      await pilotAPI.createDivisionalReport(reportData);
      
      if (onSubmit) {
        onSubmit(reportData);
      }

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        gn_code: '',
        gn_name: '',
        population: '',
        households: '',
        notes: ''
      });
      setSelectedGN(null);

    } catch (error) {
      console.error('Error submitting divisional secretariat report:', error);
      setErrors({
        submit: parseApiError(error)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Building className="w-6 h-6 text-blue-600 mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Divisional Secretariat Report</h2>
          <p className="text-sm text-gray-600">Record population and household data from divisional secretariat</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Report Date *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-md ${
              errors.date ? 'border-red-300 bg-red-50' : 'border-gray-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            required
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
        </div>

        {/* GN Division Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GN Division *
          </label>
          <GNSelector
            value={formData.gn_code}
            onChange={handleGNChange}
            placeholder="Select GN Division..."
            required={true}
            className={errors.gn_code ? 'border-red-300' : ''}
          />
          {errors.gn_code && (
            <p className="mt-1 text-sm text-red-600">{errors.gn_code}</p>
          )}
        </div>

        {/* Population and Households Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Population */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Population *
            </label>
            <input
              type="number"
              name="population"
              value={formData.population}
              onChange={handleInputChange}
              min="0"
              className={`w-full p-3 border rounded-md ${
                errors.population ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Total population count"
              required
            />
            {errors.population && (
              <p className="mt-1 text-sm text-red-600">{errors.population}</p>
            )}
          </div>

          {/* Households */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Home className="w-4 h-4 inline mr-1" />
              Households *
            </label>
            <input
              type="number"
              name="households"
              value={formData.households}
              onChange={handleInputChange}
              min="0"
              className={`w-full p-3 border rounded-md ${
                errors.households ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Total household count"
              required
            />
            {errors.households && (
              <p className="mt-1 text-sm text-red-600">{errors.households}</p>
            )}
          </div>
        </div>

        {/* Notes Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            Notes <span className="text-gray-500">(optional)</span>
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Additional details about the population data..."
          />
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-300 rounded-md">
            <div className="text-sm text-red-700 whitespace-pre-wrap">{errors.submit}</div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Divisional Report'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default DivisionalSecretariatForm;