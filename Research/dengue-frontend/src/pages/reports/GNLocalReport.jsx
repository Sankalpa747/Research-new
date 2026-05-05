import { useState } from 'react';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import GNLocalForm from '../../components/forms/GNLocalForm';

const GNLocalReport = () => {
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
              <h1 className="text-3xl font-bold text-gray-900">GN Local Inspection Reports</h1>
              <p className="mt-1 text-sm text-gray-600">
                Record local inspection activities and breeding site findings
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
                  GN Local Inspection Report Submitted Successfully!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Report ID: <span className="font-mono">{lastSubmittedReport.report_id}</span>
                  </p>
                  <p>
                    GN Division: {lastSubmittedReport.gn_name} ({lastSubmittedReport.gn_code})
                  </p>
                  <p>
                    Breeding Sites: {lastSubmittedReport.breeding_sites}, 
                    Total Inspections: {lastSubmittedReport.inspections_total}, 
                    Flagged: {lastSubmittedReport.flagged_inspections}
                  </p>
                  <p>
                    Success Rate: {(((lastSubmittedReport.inspections_total - lastSubmittedReport.flagged_inspections) / lastSubmittedReport.inspections_total) * 100).toFixed(1)}%
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
        <GNLocalForm 
          onSubmit={handleSubmitSuccess}
          onCancel={() => navigate('/')}
        />

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Instructions</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Select the date for the inspection report</li>
            <li>• Choose the GN Division from the dropdown (required)</li>
            <li>• Enter the number of breeding sites found</li>
            <li>• Enter the total number of inspections conducted</li>
            <li>• Enter the number of inspections that were flagged for issues</li>
            <li>• Flagged inspections cannot exceed total inspections</li>
            <li>• Add notes about inspection findings and activities</li>
            <li>• Optionally provide GPS coordinates for specific locations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GNLocalReport;