# Master Merged Dataset Structure

## ✅ Implementation Complete

A master merged dataset structure has been created for all 4 data sources, fully integrated with the existing JSON storage system.

---

## 📊 **Data Sources & Structure**

### **4 Data Sources Combined:**

#### **1. Hospital Reports** (`hospital`)
**Purpose:** Dengue case tracking from medical facilities  
**Fields:**
- `confirmed_cases` - Number of confirmed dengue cases (integer)
- `suspected_cases` - Number of suspected dengue cases (integer)
- `notes` - Clinical observations (text)
- `latitude`, `longitude` - Hospital/clinic location (coordinates)

#### **2. Divisional Secretariat Reports** (`divisional_secretariat`)  
**Purpose:** Official population and demographic data
**Fields:**
- `population` - Total population in the GN division (integer)
- `households` - Total number of households (integer)
- `notes` - Administrative notes (text)

#### **3. Urban Council Reports** (`urban_council`)
**Purpose:** Environmental monitoring and public health actions
**Fields:**
- `fogging_scheduled` - Whether fogging is scheduled (0 or 1)
- `environmental_complaints` - Number of public complaints (integer)
- `stagnant_water_sites` - Number of water sites identified (integer)
- `notes` - Environmental observations (text)
- `latitude`, `longitude` - Inspection location (coordinates)

#### **4. GN Local Reports** (`gn_local`)
**Purpose:** Field inspection and mosquito breeding site monitoring
**Fields:**
- `breeding_sites` - Number of dengue breeding sites found (integer)
- `inspections_total` - Total premises inspected (integer)
- `flagged_inspections` - Inspections finding violations (integer)
- `notes` - Field inspection notes (text)
- `latitude`, `longitude` - Inspection location (coordinates)

---

## 🏗 **Master Dataset Schema**

### **Common Fields** (present in all reports)
- `report_id` - Unique ID from source (e.g., H-001, DS-001)
- `date` - Report date (YYYY-MM-DD format)
- `gn_code` - GN division code (CMB-GN-01, CMB-GN-02, CMB-GN-03)
- `gn_name` - GN division name (Kollupitiya, Bambalapitiya, Wellawatte)
- `source` - Source system name
- `source_record_type` - Type of record from source

### **Source-Specific Fields** (null when not applicable)
All fields from all 4 sources are included, with `null` values when the field doesn't apply to that source type.

**Example Master Record:**
```json
{
  "report_id": "H-001",
  "date": "2026-04-25",
  "gn_code": "CMB-GN-01", 
  "gn_name": "Kollupitiya",
  "source": "hospital",
  "source_record_type": "hospital_case_report",
  
  // Hospital fields (filled)
  "confirmed_cases": 4,
  "suspected_cases": 2,
  
  // Other source fields (null)
  "population": null,
  "households": null,
  "fogging_scheduled": null,
  "environmental_complaints": null,
  "stagnant_water_sites": null,
  "breeding_sites": null,
  "inspections_total": null,
  "flagged_inspections": null,
  
  // Optional fields
  "notes": "Cluster of fever cases reported from outpatient unit.",
  "latitude": 6.9142,
  "longitude": 79.8485,
  "created_at": "2026-05-05T16:30:00.000Z"
}
```

---

## 💾 **Storage Integration**

### **JSON Storage Structure** (compatible with existing system)
The storage.json file now includes new sections without breaking existing keys:

```json
{
  "metadata": { ... },
  "available_resources": { ... },          // ← Existing (unchanged)
  "district_predictions": [ ... ],         // ← Existing (unchanged)
  "hotspots": [ ... ],                    // ← Existing (unchanged)
  "resource_recommendations": [ ... ],     // ← Existing (unchanged)  
  "resource_assignments": [ ... ],         // ← Existing (unchanged)
  "prediction_history": [ ... ],           // ← Existing (unchanged)
  
  // NEW: Pilot study sections
  "master_reports": [ ... ],               // ← Master merged dataset
  "pilot_hospital_reports": [ ... ],       // ← Source-specific storage (optional)
  "pilot_divisional_reports": [ ... ],     // ← Source-specific storage (optional)
  "pilot_urban_council_reports": [ ... ],  // ← Source-specific storage (optional)
  "pilot_gn_local_reports": [ ... ]       // ← Source-specific storage (optional)
}
```

**✅ Existing district-level system:** Completely unchanged and functional  
**✅ New pilot system:** Added as separate sections

---

## 🚀 **API Endpoints**

### **Master Reports CRUD**

#### **Create Master Report** 
```bash
POST /pilot/reports
Content-Type: application/json

{
  "report_id": "H-001",
  "date": "2026-04-25",
  "gn_code": "CMB-GN-01",
  "gn_name": "Kollupitiya", 
  "source": "hospital",
  "source_record_type": "hospital_case_report",
  "confirmed_cases": 4,
  "suspected_cases": 2,
  "notes": "Cluster of fever cases reported"
}
```

#### **List Master Reports with Filters**
```bash
GET /pilot/reports?gn_code=CMB-GN-01&source=hospital&date_from=2026-04-01&date_to=2026-04-30&limit=50
```

#### **Get Specific Report**
```bash
GET /pilot/reports/H-001
```

#### **Update Report**
```bash
PUT /pilot/reports/H-001
```

#### **Delete Report**
```bash
DELETE /pilot/reports/H-001
```

### **Source-Specific Endpoints** (for data entry forms)

#### **Hospital Report**
```bash
POST /pilot/reports/hospital
{
  "report_id": "H-006",
  "date": "2026-05-05",
  "gn_code": "CMB-GN-02",
  "gn_name": "Bambalapitiya",
  "confirmed_cases": 3,
  "suspected_cases": 1,
  "notes": "New cluster identified",
  "latitude": 6.8948,
  "longitude": 79.8558
}
```

#### **Divisional Secretariat Report**
```bash
POST /pilot/reports/divisional
{
  "report_id": "DS-004", 
  "date": "2026-05-05",
  "gn_code": "CMB-GN-01",
  "gn_name": "Kollupitiya",
  "population": 12800,
  "households": 3100,
  "notes": "Updated baseline data"
}
```

#### **Urban Council Report**
```bash
POST /pilot/reports/urban-council
{
  "report_id": "UC-005",
  "date": "2026-05-05", 
  "gn_code": "CMB-GN-03",
  "gn_name": "Wellawatte",
  "fogging_scheduled": 1,
  "environmental_complaints": 4,
  "stagnant_water_sites": 6,
  "notes": "Increased complaints after rain"
}
```

#### **GN Local Report**
```bash
POST /pilot/reports/gn-local
{
  "report_id": "GN-005",
  "date": "2026-05-05",
  "gn_code": "CMB-GN-02", 
  "gn_name": "Bambalapitiya",
  "breeding_sites": 8,
  "inspections_total": 20,
  "flagged_inspections": 6,
  "notes": "High violation rate in apartment blocks"
}
```

---

## 💻 **Frontend Usage**

### **JavaScript/React API Calls**

```javascript
import { pilotAPI } from '../services/api';

// Create reports from different sources
const hospitalReport = await pilotAPI.createHospitalReport({
  report_id: 'H-006',
  date: '2026-05-05',
  gn_code: 'CMB-GN-01',
  gn_name: 'Kollupitiya',
  confirmed_cases: 3,
  suspected_cases: 1,
  notes: 'New case cluster'
});

// Get filtered reports
const reports = await pilotAPI.getMasterReports({
  gn_code: 'CMB-GN-01',
  source: 'hospital',
  date_from: '2026-04-01',
  limit: 50
});

// Get specific report
const report = await pilotAPI.getMasterReport('H-001');
```

---

## 🔍 **Field Explanations (Simple English)**

### **Common Fields**
- `report_id` - **Unique code** for this report (like H-001 for hospital report #1)
- `date` - **When** this data was collected or reported
- `gn_code` - **Which area** this is about (CMB-GN-01 = Kollupitiya area)
- `gn_name` - **Name of the area** in plain English
- `source` - **Who** provided this data (hospital, government office, etc.)
- `source_record_type` - **What type** of report this is

### **Hospital Fields**
- `confirmed_cases` - **Number of people** definitely diagnosed with dengue
- `suspected_cases` - **Number of people** who might have dengue (being tested)

### **Government Office Fields** (Divisional Secretariat)
- `population` - **How many people** live in this area
- `households` - **How many families/houses** are in this area

### **City Council Fields** (Urban Council)
- `fogging_scheduled` - **Will they spray** for mosquitoes? (1=yes, 0=no)
- `environmental_complaints` - **How many people complained** about dirty water, garbage, etc.
- `stagnant_water_sites` - **How many places** with still water (where mosquitoes breed)

### **Local Inspector Fields** (GN Local)
- `breeding_sites` - **Places where mosquitoes** can lay eggs and multiply
- `inspections_total` - **How many houses/buildings** the inspector checked
- `flagged_inspections` - **How many places** had problems that need fixing

### **Optional Fields**
- `notes` - **Extra information** or observations in plain words
- `latitude`, `longitude` - **GPS coordinates** showing exactly where this happened

---

## 🧪 **Testing the Implementation**

### **1. Start Backend**
```bash
cd Research/dengue-resource-allocation
python -m uvicorn backend.main:app --reload
```

### **2. Test API Endpoints**
- **API Documentation:** `http://localhost:8000/docs`
- **Master Reports:** `http://localhost:8000/pilot/reports`
- **Hospital Reports:** `http://localhost:8000/pilot/reports/hospital`

### **3. Verify Storage**
Check that reports appear in `data/storage.json` under the `master_reports` section.

### **4. Test Filtering**
```bash
# Get all reports from Kollupitiya
curl "http://localhost:8000/pilot/reports?gn_code=CMB-GN-01"

# Get only hospital reports
curl "http://localhost:8000/pilot/reports?source=hospital"

# Get reports from specific date range
curl "http://localhost:8000/pilot/reports?date_from=2026-04-01&date_to=2026-04-30"
```

---

## 📋 **Data Validation Rules**

### **Required Fields** (must be provided)
- `report_id`, `date`, `gn_code`, `gn_name`, `source`, `source_record_type`

### **GN Code Validation** (pilot areas only)
- Must be one of: `CMB-GN-01`, `CMB-GN-02`, `CMB-GN-03`
- Other GN codes will be rejected

### **Source Validation**
- Must be one of: `hospital`, `divisional_secretariat`, `urban_council`, `gn_local`

### **Date Format**
- Must be valid date in YYYY-MM-DD format

### **Numeric Fields**
- All count fields must be non-negative integers (≥ 0)

---

## 🔄 **Integration Points**

### **Ready for Next Implementation Steps:**

#### **1. Data Entry Forms** (Phase 2)
- Use source-specific endpoints for each form type
- Forms validate against appropriate schema
- Automatic merge into master dataset

#### **2. Hotspot Scoring** (Phase 4)  
- Pull data from master_reports for calculations
- Combine confirmed_cases + breeding_sites + complaints
- Generate GN-level risk scores

#### **3. Map Visualization** (Phase 5)
- Color GN boundaries based on master dataset metrics
- Show popup data from multiple sources
- Filter map by source type or date range

#### **4. Route Planning** (Phase 7)
- Use inspection locations (lat/lng) for field team routes
- Priority based on flagged_inspections + breeding_sites
- Integrate with resource allocation

---

## 🛡 **Data Safety**

### **Existing Data Protected**
✅ All existing district-level data remains unchanged  
✅ Existing API endpoints continue to work  
✅ No breaking changes to current functionality

### **Pilot Data Isolated** 
✅ Pilot data stored in separate JSON sections  
✅ Can be easily removed/reset without affecting district system
✅ Independent validation and processing

### **Thread Safety**
✅ JSON store uses locks for concurrent access
✅ Atomic read/write operations  
✅ Data consistency maintained

---

**The master merged dataset is now ready for your 4 data entry forms and hotspot calculations!** 🎯

**Sample data from `data/master_reports.csv` can be imported using the API endpoints.**