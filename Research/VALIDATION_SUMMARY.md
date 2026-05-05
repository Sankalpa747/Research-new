# Data Validation and Duplicate Check Implementation

## Overview

This document explains the comprehensive validation system implemented for the 4 source-specific data entry forms. The validation ensures data integrity with the **backend serving as the source of truth** while the frontend provides a user-friendly experience.

## Backend Validation (Source of Truth)

### 1. Pydantic Schema Validation (`backend/schemas.py`)

All validation rules are enforced at the API level using Pydantic models:

#### Common Fields (All Forms)
- **Date**: Required, cannot be more than 1 day in the future
- **GN Code**: Required, must be one of the 3 pilot GN codes (CMB-GN-01, CMB-GN-02, CMB-GN-03)
- **GN Name**: Required, cannot be empty
- **Source**: Required, must be one of: hospital, divisional_secretariat, urban_council, gn_local
- **Report ID**: Required, cannot be empty
- **GPS Coordinates**: Optional, latitude (-90 to 90), longitude (-180 to 180)

#### Hospital Report Validation
- **Confirmed Cases**: Required, 0-10000, integer
- **Suspected Cases**: Required, 0-10000, integer
- **Cross-validation**: At least one of confirmed/suspected must be > 0
- **Total Cases**: Warning if combined cases > 1000

#### Divisional Secretariat Report Validation
- **Population**: Required, > 0, max 1,000,000
- **Households**: Required, > 0, max 500,000
- **Cross-validation**: Average people per household must be 1.5-15

#### Urban Council Report Validation
- **Fogging Scheduled**: Required, must be 0 or 1 only
- **Environmental Complaints**: Required, 0-1000
- **Stagnant Water Sites**: Required, 0-1000

#### GN Local Report Validation
- **Breeding Sites**: Required, 0-1000
- **Total Inspections**: Required, > 0, max 10000
- **Flagged Inspections**: Required, 0-10000
- **Cross-validation**: Flagged inspections ≤ total inspections
- **Rate Check**: Warning if flagged rate > 90%

### 2. Duplicate Detection (`backend/routes/pilot.py`)

The backend implements sophisticated duplicate checking:

```python
def check_duplicate_report(store, report):
    # Checks for existing reports with:
    # - Same date
    # - Same GN code
    # - Same source
    # - Same source_record_type
```

**Duplicate Logic**:
- Searches existing master reports for matching criteria
- Returns detailed information about existing reports
- Blocks submission with HTTP 422 error if duplicates found
- Provides list of conflicting report IDs and dates

### 3. API Error Responses

The backend returns structured error responses:
- **422 Unprocessable Entity**: Validation failures or duplicates
- **400 Bad Request**: Malformed requests
- **500 Internal Server Error**: System errors

## Frontend Validation (User Experience)

### 1. Real-time Field Validation

Each form provides immediate feedback:
- **Required Field Indicators**: Visual asterisks and error highlighting
- **Input Type Validation**: Numeric fields, date pickers
- **Range Validation**: Min/max value checking
- **Format Validation**: GPS coordinate formats

### 2. Enhanced Error Messages (`utils/errorHandling.js`)

Utility functions provide user-friendly validation:

```javascript
validateDate(date)          // Date range and format checking
validateGNCode(gnCode)      // GN selection validation
validateNumericField(...)   // Comprehensive numeric validation
validateCoordinates(...)    // GPS coordinate validation
parseApiError(error)        // Backend error parsing
```

### 3. Cross-Field Validation

Forms validate relationships between fields:
- **Hospital**: Total cases reasonableness
- **Divisional**: Population/household ratios
- **GN Local**: Flagged inspections ≤ total inspections

### 4. Duplicate Error Handling

When the backend detects duplicates, the frontend:
- Displays the duplicate detection message
- Lists existing conflicting reports
- Suggests corrective actions
- Preserves user input for correction

## Validation Architecture

### Why Backend is Source of Truth

1. **Security**: Frontend validation can be bypassed by direct API calls
2. **Data Integrity**: Backend ensures no invalid data enters the master dataset
3. **Consistency**: All clients (web, mobile, API) follow the same rules
4. **Auditability**: Validation rules are centrally maintained

### Frontend Benefits

1. **User Experience**: Immediate feedback without server round-trips
2. **Reduced Server Load**: Catches obvious errors before submission
3. **Progressive Enhancement**: Works even if JavaScript fails (server validation still applies)
4. **Contextual Help**: Field-specific guidance and warnings

## Implementation Files

### Backend Files
- `backend/schemas.py` - Pydantic validation models
- `backend/routes/pilot.py` - API endpoints with duplicate checking
- `backend/json_store.py` - Data persistence with consistency checks

### Frontend Files
- `src/utils/errorHandling.js` - Validation utilities
- `src/components/forms/HospitalReportForm.jsx` - Hospital form validation
- `src/components/forms/DivisionalSecretariatForm.jsx` - Divisional form validation
- `src/components/forms/UrbanCouncilForm.jsx` - Urban Council form validation
- `src/components/forms/GNLocalForm.jsx` - GN Local form validation

## Testing Scenarios

### Manual Testing Required

1. **Missing Date Test**:
   - Submit form without selecting a date
   - Should show "Report date is required" error

2. **Missing GN Test**:
   - Submit form without selecting GN division
   - Should show "Please select a GN Division from the dropdown" error

3. **Duplicate Submission Test**:
   - Create a report successfully
   - Try to create another report with same date + GN + source + record type
   - Should show duplicate detection error with existing report details

4. **Invalid Numbers Test**:
   - Enter negative numbers in numeric fields
   - Enter extremely high numbers
   - Should show appropriate validation errors

5. **Cross-field Validation Test**:
   - GN Local: Enter flagged inspections > total inspections
   - Hospital: Enter 0 for both confirmed and suspected cases
   - Should show cross-field validation errors

The validation system ensures data quality while providing excellent user experience, with the backend serving as the authoritative validation layer and the frontend enhancing usability.