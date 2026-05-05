import { useState } from 'react';
import { Calendar, MapPin, Droplet, Bug, AlertTriangle, FileText } from 'lucide-react';
import GNSelector from '../pilot/GNSelector';
import { pilotAPI } from '../../services/api';
import { parseApiError, validateDate, validateGNCode, validateNumericField, validateCoordinates } from '../../utils/errorHandling';

const UrbanCouncilForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    date: initialData.date || new Date().toISOString().split('T')[0],
    gn_code: initialData.gn_code || '',
    gn_name: initialData.gn_name || '',
    fogging_scheduled: initialData.fogging_scheduled || 0,
    environmental_complaints: initialData.environmental_complaints || '',
    stagnant_water_sites: initialData.stagnant_water_sites || '',
    notes: initialData.notes || '',
    latitude: initialData.latitude || '',
    longitude: initialData.longitude || ''
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

    // Fogging scheduled validation
    if (formData.fogging_scheduled !== 0 && formData.fogging_scheduled !== 1) {
      newErrors.fogging_scheduled = 'Please select whether fogging is scheduled (Yes or No)';
    }

    // Environmental complaints validation
    const complaintsError = validateNumericField(
      formData.environmental_complaints, 
      'Environmental complaints count',
      { maxWarningValue: 100 }
    );
    if (complaintsError) newErrors.environmental_complaints = complaintsError;

    // Stagnant water sites validation
    const waterSitesError = validateNumericField(
      formData.stagnant_water_sites, 
      'Stagnant water sites count',
      { maxWarningValue: 50 }
    );
    if (waterSitesError) newErrors.stagnant_water_sites = waterSitesError;

    // Optional location validation
    const coordinateErrors = validateCoordinates(formData.latitude, formData.longitude);
    Object.assign(newErrors, coordinateErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'radio' ? parseInt(value) : value
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
    return `UC-${dateStr}-${randomSuffix}`;
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
        source: 'urban_council',
        source_record_type: 'urban_environment_report',
        fogging_scheduled: parseInt(formData.fogging_scheduled),
        environmental_complaints: parseInt(formData.environmental_complaints),
        stagnant_water_sites: parseInt(formData.stagnant_water_sites),
        notes: formData.notes || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };

      await pilotAPI.createUrbanCouncilReport(reportData);
      
      if (onSubmit) {
        onSubmit(reportData);
      }

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        gn_code: '',
        gn_name: '',
        fogging_scheduled: 0,
        environmental_complaints: '',
        stagnant_water_sites: '',
        notes: '',
        latitude: '',
        longitude: ''
      });
      setSelectedGN(null);

    } catch (error) {
      console.error('Error submitting urban council report:', error);
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
        <MapPin className="w-6 h-6 text-green-600 mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Urban Council Report</h2>
          <p className="text-sm text-gray-600">Record environmental activities and complaints from urban council</p>
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

        {/* Fogging Scheduled */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Bug className="w-4 h-4 inline mr-1" />
            Fogging Scheduled *
          </label>
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="fogging_scheduled"
                value={1}
                checked={formData.fogging_scheduled === 1}
                onChange={handleInputChange}
                className="mr-2 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="fogging_scheduled"
                value={0}
                checked={formData.fogging_scheduled === 0}
                onChange={handleInputChange}
                className="mr-2 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm">No</span>
            </label>
          </div>
          {errors.fogging_scheduled && (
            <p className="mt-1 text-sm text-red-600">{errors.fogging_scheduled}</p>
          )}
        </div>

        {/* Environmental Data Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Environmental Complaints */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              Environmental Complaints *
            </label>
            <input
              type="number"
              name="environmental_complaints"
              value={formData.environmental_complaints}
              onChange={handleInputChange}
              min="0"
              className={`w-full p-3 border rounded-md ${
                errors.environmental_complaints ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Number of complaints"
              required
            />
            {errors.environmental_complaints && (
              <p className="mt-1 text-sm text-red-600">{errors.environmental_complaints}</p>
            )}
          </div>

          {/* Stagnant Water Sites */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Droplet className="w-4 h-4 inline mr-1" />
              Stagnant Water Sites *
            </label>
            <input
              type="number"
              name="stagnant_water_sites"
              value={formData.stagnant_water_sites}
              onChange={handleInputChange}
              min="0"
              className={`w-full p-3 border rounded-md ${
                errors.stagnant_water_sites ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Number of sites"
              required
            />
            {errors.stagnant_water_sites && (
              <p className="mt-1 text-sm text-red-600">{errors.stagnant_water_sites}</p>
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
            placeholder="Additional details about environmental activities..."
          />
        </div>

        {/* Optional Location Fields */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            <MapPin className="w-4 h-4 inline mr-1" />
            Location <span className="text-gray-500">(optional)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Latitude
              </label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                step="any"
                min="-90"
                max="90"
                className={`w-full p-3 border rounded-md ${
                  errors.latitude ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g., 6.9271"
              />
              {errors.latitude && (
                <p className="mt-1 text-sm text-red-600">{errors.latitude}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Longitude
              </label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                step="any"
                min="-180"
                max="180"
                className={`w-full p-3 border rounded-md ${
                  errors.longitude ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g., 79.8612"
              />
              {errors.longitude && (
                <p className="mt-1 text-sm text-red-600">{errors.longitude}</p>
              )}
            </div>
          </div>
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
            className="flex-1 bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Urban Council Report'}
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

export default UrbanCouncilForm;