import { useState } from 'react';
import { Calendar, MapPin, Eye, Search, Flag, FileText } from 'lucide-react';
import GNSelector from '../pilot/GNSelector';
import { pilotAPI } from '../../services/api';
import { parseApiError, validateDate, validateGNCode, validateNumericField, validateCoordinates } from '../../utils/errorHandling';

const GNLocalForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    date: initialData.date || new Date().toISOString().split('T')[0],
    gn_code: initialData.gn_code || '',
    gn_name: initialData.gn_name || '',
    breeding_sites: initialData.breeding_sites || '',
    inspections_total: initialData.inspections_total || '',
    flagged_inspections: initialData.flagged_inspections || '',
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

    // Breeding sites validation
    const breedingSitesError = validateNumericField(
      formData.breeding_sites, 
      'Breeding sites count',
      { maxWarningValue: 50 }
    );
    if (breedingSitesError) newErrors.breeding_sites = breedingSitesError;

    // Total inspections validation
    const totalInspectionsError = validateNumericField(
      formData.inspections_total, 
      'Total inspections count',
      { allowZero: false, maxWarningValue: 1000 }
    );
    if (totalInspectionsError) newErrors.inspections_total = totalInspectionsError;

    // Flagged inspections validation
    const flaggedInspectionsError = validateNumericField(
      formData.flagged_inspections, 
      'Flagged inspections count',
      { maxWarningValue: 500 }
    );
    if (flaggedInspectionsError) newErrors.flagged_inspections = flaggedInspectionsError;

    // Cross-field validation for flagged vs total inspections
    if (formData.inspections_total && formData.flagged_inspections) {
      const total = parseInt(formData.inspections_total);
      const flagged = parseInt(formData.flagged_inspections);
      
      if (!isNaN(total) && !isNaN(flagged)) {
        if (flagged > total) {
          newErrors.flagged_inspections = `Flagged inspections (${flagged}) cannot exceed total inspections (${total})`;
        } else if (total > 0) {
          const flaggedRate = (flagged / total) * 100;
          if (flaggedRate > 80) {
            newErrors.flagged_inspections = `Flagged inspection rate is ${flaggedRate.toFixed(1)}%. This seems very high. Please verify your numbers.`;
          }
        }
      }
    }

    // Optional location validation
    const coordinateErrors = validateCoordinates(formData.latitude, formData.longitude);
    Object.assign(newErrors, coordinateErrors);

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
    return `GN-${dateStr}-${randomSuffix}`;
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
        source: 'gn_local',
        source_record_type: 'local_inspection_report',
        breeding_sites: parseInt(formData.breeding_sites),
        inspections_total: parseInt(formData.inspections_total),
        flagged_inspections: parseInt(formData.flagged_inspections),
        notes: formData.notes || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };

      await pilotAPI.createGNLocalReport(reportData);
      
      if (onSubmit) {
        onSubmit(reportData);
      }

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        gn_code: '',
        gn_name: '',
        breeding_sites: '',
        inspections_total: '',
        flagged_inspections: '',
        notes: '',
        latitude: '',
        longitude: ''
      });
      setSelectedGN(null);

    } catch (error) {
      console.error('Error submitting GN local report:', error);
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
        <Search className="w-6 h-6 text-purple-600 mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">GN Local Inspection Report</h2>
          <p className="text-sm text-gray-600">Record local inspection activities and breeding site findings</p>
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

        {/* Inspection Data Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Breeding Sites */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Breeding Sites *
            </label>
            <input
              type="number"
              name="breeding_sites"
              value={formData.breeding_sites}
              onChange={handleInputChange}
              min="0"
              className={`w-full p-3 border rounded-md ${
                errors.breeding_sites ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Sites found"
              required
            />
            {errors.breeding_sites && (
              <p className="mt-1 text-sm text-red-600">{errors.breeding_sites}</p>
            )}
          </div>

          {/* Total Inspections */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Eye className="w-4 h-4 inline mr-1" />
              Total Inspections *
            </label>
            <input
              type="number"
              name="inspections_total"
              value={formData.inspections_total}
              onChange={handleInputChange}
              min="0"
              className={`w-full p-3 border rounded-md ${
                errors.inspections_total ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Total conducted"
              required
            />
            {errors.inspections_total && (
              <p className="mt-1 text-sm text-red-600">{errors.inspections_total}</p>
            )}
          </div>

          {/* Flagged Inspections */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Flag className="w-4 h-4 inline mr-1" />
              Flagged Inspections *
            </label>
            <input
              type="number"
              name="flagged_inspections"
              value={formData.flagged_inspections}
              onChange={handleInputChange}
              min="0"
              max={formData.inspections_total || undefined}
              className={`w-full p-3 border rounded-md ${
                errors.flagged_inspections ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Issues found"
              required
            />
            {errors.flagged_inspections && (
              <p className="mt-1 text-sm text-red-600">{errors.flagged_inspections}</p>
            )}
          </div>
        </div>

        {/* Inspection Summary */}
        {formData.inspections_total && formData.flagged_inspections && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Inspection Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Inspections:</span>
                <span className="font-medium ml-2">{formData.inspections_total}</span>
              </div>
              <div>
                <span className="text-gray-600">Flagged Rate:</span>
                <span className="font-medium ml-2">
                  {((parseInt(formData.flagged_inspections) / parseInt(formData.inspections_total)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

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
            placeholder="Additional details about the inspections and findings..."
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
            className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? 'Submitting...' : 'Submit GN Local Report'}
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

export default GNLocalForm;