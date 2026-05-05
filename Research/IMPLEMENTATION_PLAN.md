# Colombo Dengue Pilot Workflow Implementation Plan

## 🎯 **Overview**
Add Colombo GN-level dengue pilot workflow to the existing district-level system. The pilot covers 3 GN divisions: Kollupitiya, Bambalapitiya, and Wellawatte.

**Important**: Keep all existing district-level features intact. Add pilot as a new module/workflow.

---

## ✅ **Implementation Checklist**

### **Phase 1: Pilot Configuration (Week 1)**

#### 1.1 Backend Pilot Config
- [ ] **`backend/config.py`** - Add `PILOT_MODE = True` and pilot GN settings
- [ ] **`backend/json_store.py`** - Add methods for pilot data (GN-level storage)
- [ ] **`backend/schemas.py`** - Add GN-level data models (HospitalReport, GNReport, etc.)
- [ ] **Test**: Verify pilot config loads without breaking existing district features

#### 1.2 Pilot Data Structure
- [ ] **`data/pilot_storage.json`** - Create separate storage for pilot data
- [ ] **Pilot boundaries**: Confirm `pilot_gn_boundaries.geojson` loads correctly
- [ ] **Master list**: Verify `gn_master_list.csv` contains population data
- [ ] **Test**: Load pilot config and boundaries successfully

---

### **Phase 2: Data Entry Forms (Week 1-2)**

#### 2.1 Frontend Form Pages
- [ ] **`src/pages/pilot/HospitalReports.jsx`** - Form for hospital dengue case reports
- [ ] **`src/pages/pilot/GNLocalReports.jsx`** - Form for GN division local reports  
- [ ] **`src/pages/pilot/DivisionalReports.jsx`** - Form for divisional secretariat reports
- [ ] **`src/pages/pilot/UrbanCouncilReports.jsx`** - Form for urban council reports
- [ ] **`src/pages/pilot/PilotDashboard.jsx`** - Main pilot overview page

#### 2.2 Form Components
- [ ] **`src/components/pilot/DataEntryForm.jsx`** - Reusable form component
- [ ] **`src/components/pilot/GNSelector.jsx`** - Dropdown for selecting GN division
- [ ] **`src/components/pilot/ValidationErrors.jsx`** - Show form validation messages
- [ ] **Form fields**: Date, GN division, case counts, breeding sites, complaints, inspector notes

#### 2.3 Navigation & Routing  
- [ ] **`src/App.jsx`** - Add pilot routes (`/pilot/*`)
- [ ] **`src/components/layout/Sidebar.jsx`** - Add "Pilot Study" section with 4 form links
- [ ] **Breadcrumbs**: Add navigation helpers for pilot pages
- [ ] **Test**: Navigate between all pilot forms without errors

#### 2.4 Backend API Endpoints
- [ ] **`backend/routes/pilot.py`** - New router for pilot endpoints
- [ ] **POST** `/pilot/hospital-reports` - Submit hospital reports
- [ ] **POST** `/pilot/gn-reports` - Submit GN local reports  
- [ ] **POST** `/pilot/divisional-reports` - Submit divisional reports
- [ ] **POST** `/pilot/urban-council-reports` - Submit urban council reports
- [ ] **GET** `/pilot/reports/{report_type}` - Retrieve submitted reports
- [ ] **Test**: Submit each form type and verify data saves to JSON

---

### **Phase 3: Data Processing (Week 2)**

#### 3.1 Master Dataset Creation
- [ ] **`backend/utils/pilot_data_merger.py`** - Merge 4 data sources into master dataset
- [ ] **Merge logic**: Combine by GN + date, handle overlapping records
- [ ] **`POST /pilot/generate-master`** - API endpoint to trigger merge
- [ ] **Master storage**: Save merged data to `data/master_reports.csv` and JSON
- [ ] **Test**: Submit sample data from all 4 forms, merge into master dataset

#### 3.2 Validation & Deduplication  
- [ ] **Date validation**: Ensure reports are recent (within 30 days)
- [ ] **GN validation**: Only allow the 3 pilot GN divisions
- [ ] **Duplicate detection**: Check for same GN + date combinations
- [ ] **Data completeness**: Require key fields (cases, date, GN)
- [ ] **`GET /pilot/validation-report`** - Show data quality issues
- [ ] **Test**: Try submitting invalid/duplicate data, verify rejection

---

### **Phase 4: Hotspot Scoring (Week 2-3)**

#### 4.1 GN-Level Scoring Algorithm
- [ ] **`ml/pilot_hotspot_scorer.py`** - Adapt district scoring for GN level
- [ ] **Scoring weights**: Cases (5), breeding sites (3), complaints (2), inspections (2)  
- [ ] **Population adjustment**: Normalize by population from `gn_master_list.csv`
- [ ] **Risk thresholds**: Low (<20), Medium (20-40), High (>40) 
- [ ] **`POST /pilot/calculate-hotspots`** - Generate GN hotspot scores
- [ ] **Test**: Calculate scores for sample data, verify reasonable results

#### 4.2 Hotspot Ranking
- [ ] **Ranking logic**: Sort GNs by hotspot score (highest first)
- [ ] **Priority levels**: Critical (>80), High (60-80), Medium (40-60), Low (<40)
- [ ] **`GET /pilot/hotspots`** - Return ranked list of GN hotspots
- [ ] **Historical tracking**: Store daily hotspot calculations  
- [ ] **Test**: Generate hotspot rankings, verify sorting and priority assignment

---

### **Phase 5: Map Integration (Week 3)**

#### 5.1 Map Library Setup
- [ ] **Install Leaflet**: `npm install leaflet react-leaflet` in frontend
- [ ] **Map styles**: Add Leaflet CSS to `index.html` 
- [ ] **Base component**: **`src/components/maps/BaseMap.jsx`** - Reusable map
- [ ] **GeoJSON loader**: Load and display `pilot_gn_boundaries.geojson`
- [ ] **Test**: Display basic map with 3 GN boundaries

#### 5.2 Hotspot Map Visualization
- [ ] **`src/components/pilot/PilotHotspotMap.jsx`** - GN boundary map with colors
- [ ] **Color coding**: Red (Critical), Orange (High), Yellow (Medium), Green (Low)
- [ ] **Popup details**: Click GN boundary → show hotspot score, case count, priority  
- [ ] **Legend**: Color legend explaining risk levels
- [ ] **`src/pages/pilot/PilotHotspots.jsx`** - Page combining map + list view
- [ ] **Test**: View map with colored GN boundaries reflecting hotspot scores

#### 5.3 Map Integration Points
- [ ] **Dashboard integration**: Mini-map on `PilotDashboard.jsx`
- [ ] **Form integration**: Show selected GN on forms
- [ ] **Responsive design**: Map works on mobile/tablet
- [ ] **Test**: Map displays correctly across different screen sizes

---

### **Phase 6: Resource Allocation (Week 3-4)**

#### 6.1 GN-Level Resource Logic
- [ ] **`backend/utils/pilot_resource_allocator.py`** - Calculate resources per GN
- [ ] **Resource types**: Fogging teams (2/day), inspection teams (3/day), max 8 hrs/team
- [ ] **Allocation formula**: Based on hotspot score + population + area coverage
- [ ] **Depot integration**: Factor in distance from central depot (6.8916, 79.8574)
- [ ] **`POST /pilot/allocate-resources`** - Generate resource allocation plan
- [ ] **Test**: Generate allocation plan for sample hotspots

#### 6.2 Resource Management UI
- [ ] **`src/pages/pilot/ResourceAllocation.jsx`** - View/edit resource assignments
- [ ] **Resource table**: Show GN, priority, allocated teams, work hours
- [ ] **Manual override**: Allow admin to adjust automatic allocations
- [ ] **Capacity tracking**: Show total teams used vs available (constraints)
- [ ] **`GET /pilot/resource-plan`** - Retrieve current allocation plan
- [ ] **Test**: View and modify resource allocation through UI

---

### **Phase 7: Route Planning (Week 4)**

#### 7.1 Basic Route Planning
- [ ] **`backend/utils/pilot_route_planner.py`** - Calculate optimal team routes  
- [ ] **Route logic**: Start from depot → visit assigned GNs → return to depot
- [ ] **Distance calculation**: Use GN centroids from `gn_master_list.csv`
- [ ] **Time estimation**: Factor in travel time + work time per GN
- [ ] **`POST /pilot/plan-routes`** - Generate daily route plans
- [ ] **Test**: Generate routes for allocated teams

#### 7.2 Route Visualization
- [ ] **`src/components/pilot/RouteMap.jsx`** - Display team routes on map
- [ ] **Route lines**: Draw paths between depot → GNs → depot  
- [ ] **Time labels**: Show estimated arrival times at each GN
- [ ] **Team assignment**: Color-code routes by team (Team 1, Team 2, etc.)
- [ ] **`src/pages/pilot/RoutePlanning.jsx`** - Route planning interface
- [ ] **Test**: View team routes visually on map

#### 7.3 Google Maps Integration Point
- [ ] **`src/services/googleMapsService.js`** - Service for future Google Maps integration
- [ ] **Route optimization**: Placeholder for Google Maps Directions API
- [ ] **Real-time traffic**: Structure for traffic-aware routing (future)
- [ ] **Mobile export**: Export routes for mobile field teams (future)
- [ ] **Documentation**: Clear guide for enabling Google Maps later

---

### **Phase 8: Sample Data Import (Week 4)**

#### 8.1 Import Existing Data
- [ ] **Data validation**: Verify all provided CSV files load correctly
- [ ] **`backend/utils/pilot_data_importer.py`** - Import sample data to system
- [ ] **Import endpoint**: `POST /pilot/import-sample-data` - Load all sample CSVs
- [ ] **Data verification**: Check imported data appears in forms and maps
- [ ] **Test**: Import sample data, verify it flows through entire workflow

#### 8.2 Demo Data Generation
- [ ] **`backend/utils/pilot_demo_generator.py`** - Generate realistic demo data  
- [ ] **Demo scenarios**: Create sample outbreak scenarios for testing
- [ ] **Varied data**: Different GNs with different risk levels
- [ ] **Time series**: Generate data over multiple days/weeks for trends
- [ ] **Test**: Generate demo data, verify realistic hotspot patterns

---

### **Phase 9: Testing & Quality (Week 4)**

#### 9.1 End-to-End Testing
- [ ] **Data entry flow**: Submit reports from all 4 forms → verify master dataset
- [ ] **Hotspot calculation**: Ensure scores calculated correctly from merged data
- [ ] **Map visualization**: Verify GN boundaries colored by hotspot scores  
- [ ] **Resource allocation**: Check resources allocated based on hotspot priorities
- [ ] **Route planning**: Verify routes generated for allocated teams
- [ ] **Test**: Complete workflow from data entry → routes

#### 9.2 Integration Testing
- [ ] **Existing features**: Verify district-level dashboard/hotspots still work
- [ ] **Data separation**: Ensure pilot data doesn't interfere with district data
- [ ] **API stability**: All existing endpoints still function correctly
- [ ] **Performance**: System handles both district and pilot data efficiently
- [ ] **Test**: Run both district and pilot workflows simultaneously

#### 9.3 User Acceptance Testing
- [ ] **Form usability**: Non-technical users can submit reports easily
- [ ] **Map clarity**: Hotspot visualization clearly shows risk areas
- [ ] **Resource planning**: Resource allocation makes sense to field managers  
- [ ] **Route practicality**: Generated routes are realistic for field teams
- [ ] **Documentation**: Create user guide for pilot workflow
- [ ] **Test**: Have non-developers test the complete workflow

---

## 📊 **Success Criteria**

### **Functional Requirements** ✅
- [ ] 4 data entry forms working and saving data  
- [ ] Master dataset merges all 4 data sources correctly
- [ ] Hotspot scoring identifies high-risk GNs appropriately
- [ ] Map shows GN boundaries colored by risk level
- [ ] Resource allocation assigns teams based on priorities  
- [ ] Route planning generates practical team routes
- [ ] All existing district-level features still work

### **Technical Requirements** ✅  
- [ ] Pilot data stored separately from district data
- [ ] APIs handle both district and GN-level requests
- [ ] Map loads GeoJSON boundaries without performance issues
- [ ] System validates data quality and prevents duplicates
- [ ] Google Maps integration point clearly documented
- [ ] Code follows existing project structure and patterns

### **User Experience** ✅
- [ ] Forms are intuitive and provide clear validation feedback
- [ ] Navigation between pilot features is smooth
- [ ] Maps are responsive and work on different devices  
- [ ] Resource allocation results are easy to understand
- [ ] Route plans are clear and actionable for field teams

---

## 🚀 **Getting Started**

1. **Review existing code** structure in `backend/` and `src/`
2. **Start with Phase 1.1** - Backend pilot configuration  
3. **Test incrementally** - verify each phase before moving to next
4. **Keep existing features working** - test district dashboard after each change
5. **Use provided sample data** in `data/` folder for realistic testing

---

## 📝 **Notes**

- **Existing system**: District-level predictions and resource management
- **New system**: GN-level pilot for Colombo (3 divisions only)
- **Data storage**: JSON-based, separate pilot storage from district storage  
- **Map library**: Will add Leaflet for GN boundary visualization
- **Google Maps**: Future integration point for advanced routing

---

**Last Updated**: May 5, 2026  
**Status**: Ready to implement  
**Estimated Timeline**: 4 weeks for complete implementation