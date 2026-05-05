import { useState } from 'react';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import UrbanCouncilForm from '../../components/forms/UrbanCouncilForm';

const UrbanCouncilReport = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSubmittedReport, setLastSubmittedReport] = useState(null);
  const navigate = useNavigate();

  const handleSubmitSuccess = (reportData) => {
    setLastSubmittedReport(reportData);
    setShowSuccess(true);
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const handleCreateAnother = () => {
    setShowSuccess(false);
    setLastSubmittedReport(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Urban Council Reports</h1>
              <p className="mt-1 text-sm text-gray-600">
                Record environmental activities and complaints from urban council
              </p>
            </div>
            
            <Link
              to="/reports"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              All Reports
            </Link>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && lastSubmittedReport && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-green-800">
                  Urban Council Report Submitted Successfully!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Report ID: <span className="font-mono">{lastSubmittedReport.report_id}</span>
                  </p>
                  <p>
                    GN Division: {lastSubmittedReport.gn_name} ({lastSubmittedReport.gn_code})
                  </p>
                  <p>
                    Fogging: {lastSubmittedReport.fogging_scheduled ? 'Scheduled' : 'Not Scheduled'}, 
                    Complaints: {lastSubmittedReport.environmental_complaints}, 
                    Water Sites: {lastSubmittedReport.stagnant_water_sites}
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleCreateAnother}
                    className="text-sm bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                  >
                    Create Another Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <UrbanCouncilForm 
          onSubmit={handleSubmitSuccess}
          onCancel={() => navigate('/')}
        />

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Instructions</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Select the date for the environmental report</li>
            <li>• Choose the GN Division from the dropdown (required)</li>
            <li>• Indicate if fogging activities were scheduled</li>
            <li>• Enter the number of environmental complaints received</li>
            <li>• Enter the number of stagnant water sites identified</li>
            <li>• Add notes about environmental activities and issues</li>
            <li>• Optionally provide GPS coordinates for specific locations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UrbanCouncilReport;