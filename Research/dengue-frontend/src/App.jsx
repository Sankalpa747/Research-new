import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import Hotspots from './pages/Hotspots';
import Predictions from './pages/Predictions';
import Admin from './pages/Admin';
import Map from './pages/Map';
import GNDropdownDemo from './pages/pilot/GNDropdownDemo';
import PilotDashboard from './pages/pilot/PilotDashboard';
import HospitalReport from './pages/reports/HospitalReport';
import DivisionalSecretariatReport from './pages/reports/DivisionalSecretariatReport';
import UrbanCouncilReport from './pages/reports/UrbanCouncilReport';
import GNLocalReport from './pages/reports/GNLocalReport';
import CombinedReports from './pages/reports/CombinedReports';
import ResourceAllocation from './pages/pilot/ResourceAllocation';
import RoutePlanning from './pages/pilot/RoutePlanning';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/hotspots" element={<Hotspots />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/map" element={<Map />} />
          <Route path="/pilot/dashboard" element={<PilotDashboard />} />
          <Route path="/pilot/demo" element={<GNDropdownDemo />} />
          <Route path="/pilot/resource-allocation" element={<ResourceAllocation />} />
          <Route path="/pilot/route-planning" element={<RoutePlanning />} />
          <Route path="/reports" element={<CombinedReports />} />
          <Route path="/reports/hospital" element={<HospitalReport />} />
          <Route path="/reports/divisional" element={<DivisionalSecretariatReport />} />
          <Route path="/reports/urban-council" element={<UrbanCouncilReport />} />
          <Route path="/reports/gn-local" element={<GNLocalReport />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;