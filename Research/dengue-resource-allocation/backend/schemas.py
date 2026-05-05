"""
Pydantic Schemas Module
Defines request/response models for API validation
"""

from pydantic import BaseModel, Field, validator, root_validator
from typing import Dict, List, Optional
from datetime import datetime, date
import datetime as dt


# Resource Schemas

class ResourceUpdate(BaseModel):
    """Schema for updating resource quantities"""
    Fogging_Units: Optional[int] = Field(None, ge=0, description="Number of fogging units")
    Health_Inspectors: Optional[int] = Field(None, ge=0, description="Number of health inspectors")
    Inspection_Teams: Optional[int] = Field(None, ge=0, description="Number of inspection teams")
    Treatment_Units: Optional[int] = Field(None, ge=0, description="Number of treatment units")
    
    class Config:
        json_schema_extra = {
            "example": {
                "Fogging_Units": 100,
                "Health_Inspectors": 50,
                "Inspection_Teams": 30,
                "Treatment_Units": 80
            }
        }


class ResourceResponse(BaseModel):
    """Schema for resource availability response"""
    available_resources: Dict[str, int]
    total_resources: int
    timestamp: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "available_resources": {
                    "Fogging_Units": 100,
                    "Health_Inspectors": 50,
                    "Inspection_Teams": 30,
                    "Treatment_Units": 80
                },
                "total_resources": 260,
                "timestamp": "2024-01-07T10:30:00"
            }
        }


# Prediction Schemas

class DistrictPrediction(BaseModel):
    """Schema for district risk prediction"""
    District: str
    Risk_Level: str
    Risk_Score: int
    Low_Probability: float
    Medium_Probability: float
    High_Probability: float
    Is_Hotspot: bool
    Hotspot_Priority: Optional[float] = None


class ResourceRecommendation(BaseModel):
    """Schema for resource recommendations"""
    District: str
    Fogging_Units: int
    Health_Inspectors: int
    Inspection_Teams: int
    Treatment_Units: int


class PredictionResponse(BaseModel):
    """Schema for prediction endpoint response"""
    status: str
    message: str
    predictions_count: int
    hotspots_count: int
    timestamp: str


class PredictionSummary(BaseModel):
    """Schema for prediction summary"""
    total_districts: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    hotspot_count: int
    total_fogging_units: int
    total_inspectors: int
    total_teams: int
    total_treatment_units: int


# Assignment Schemas

class ResourceAssignment(BaseModel):
    """Schema for assigning resources to a district"""
    district: str = Field(..., description="District name")
    Fogging_Units: int = Field(0, ge=0, description="Number of fogging units to assign")
    Health_Inspectors: int = Field(0, ge=0, description="Number of health inspectors to assign")
    Inspection_Teams: int = Field(0, ge=0, description="Number of inspection teams to assign")
    Treatment_Units: int = Field(0, ge=0, description="Number of treatment units to assign")
    notes: Optional[str] = Field(None, description="Additional notes for this assignment")
    
    @validator('district')
    def district_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('District name cannot be empty')
        return v.strip()
    
    class Config:
        json_schema_extra = {
            "example": {
                "district": "Colombo",
                "Fogging_Units": 10,
                "Health_Inspectors": 5,
                "Inspection_Teams": 3,
                "Treatment_Units": 8,
                "notes": "High-priority hotspot allocation"
            }
        }


class AssignmentResponse(BaseModel):
    """Schema for assignment response"""
    status: str
    message: str
    district: str
    assigned_resources: Dict[str, int]
    remaining_resources: Dict[str, int]
    assigned_at: str


# Admin Dashboard Schemas

class HotspotInfo(BaseModel):
    """Schema for hotspot information"""
    District: str
    Risk_Level: str
    High_Probability: float
    Recommended_Fogging_Units: int
    Recommended_Health_Inspectors: int
    Recommended_Inspection_Teams: int
    Recommended_Treatment_Units: int


class AdminOverview(BaseModel):
    """Schema for admin dashboard overview"""
    summary: PredictionSummary
    available_resources: Dict[str, int]
    hotspots: List[HotspotInfo]
    high_risk_districts: List[DistrictPrediction]
    recent_assignments: List[Dict]
    timestamp: str


# Error Schemas

class ErrorResponse(BaseModel):
    """Schema for error responses"""
    status: str = "error"
    message: str
    detail: Optional[str] = None
    timestamp: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "error",
                "message": "Resource not found",
                "detail": "The requested resource does not exist",
                "timestamp": "2024-01-07T10:30:00"
            }
        }


# Success Schemas

class SuccessResponse(BaseModel):
    """Generic success response"""
    status: str = "success"
    message: str
    data: Optional[Dict] = None
    timestamp: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "success",
                "message": "Operation completed successfully",
                "data": {},
                "timestamp": "2024-01-07T10:30:00"
            }
        }


# Pilot Study Master Report Schemas

class MasterReportBase(BaseModel):
    """Base schema for all master reports with common fields"""
    report_id: str = Field(..., description="Unique report ID (e.g., H-001, DS-001)")
    date: dt.date = Field(..., description="Report date (YYYY-MM-DD)")
    gn_code: str = Field(..., description="GN division code (e.g., CMB-GN-01)")
    gn_name: str = Field(..., description="GN division name (e.g., Kollupitiya)")
    source: str = Field(..., description="Data source: hospital, divisional_secretariat, urban_council, gn_local")
    source_record_type: str = Field(..., description="Type of record from the source")
    notes: Optional[str] = Field(None, description="Additional notes or observations")
    latitude: Optional[float] = Field(None, ge=-90, le=90, description="GPS latitude coordinate (-90 to 90)")
    longitude: Optional[float] = Field(None, ge=-180, le=180, description="GPS longitude coordinate (-180 to 180)")
    
    @validator('report_id')
    def validate_report_id(cls, v):
        if not v or not v.strip():
            raise ValueError('Report ID is required and cannot be empty')
        return v.strip()
    
    @validator('date')
    def validate_date(cls, v):
        if not v:
            raise ValueError('Date is required')
        # Don't allow future dates more than 1 day
        today = dt.date.today()
        if v > today + dt.timedelta(days=1):
            raise ValueError('Date cannot be more than 1 day in the future')
        return v
    
    @validator('gn_code')
    def validate_gn_code_base(cls, v):
        if not v or not v.strip():
            raise ValueError('GN Division is required')
        # For pilot, only allow the 3 pilot GN codes
        valid_gns = ['CMB-GN-01', 'CMB-GN-02', 'CMB-GN-03']
        gn_clean = v.strip()
        if gn_clean not in valid_gns:
            raise ValueError(f'GN code must be one of the pilot areas: {", ".join(valid_gns)}')
        return gn_clean
    
    @validator('gn_name')
    def validate_gn_name(cls, v):
        if not v or not v.strip():
            raise ValueError('GN Division name is required')
        return v.strip()
    
    @validator('source')
    def validate_source_base(cls, v):
        if not v or not v.strip():
            raise ValueError('Source is required')
        valid_sources = ['hospital', 'divisional_secretariat', 'urban_council', 'gn_local']
        source_clean = v.strip().lower()
        if source_clean not in valid_sources:
            raise ValueError(f'Source must be one of: {", ".join(valid_sources)}')
        return source_clean


class HospitalReport(MasterReportBase):
    """Schema for hospital dengue case reports"""
    source: str = Field("hospital", description="Always 'hospital' for this report type")
    source_record_type: str = Field("hospital_case_report", description="Always 'hospital_case_report'")
    confirmed_cases: int = Field(..., ge=0, le=10000, description="Number of confirmed dengue cases (0-10000)")
    suspected_cases: int = Field(..., ge=0, le=10000, description="Number of suspected dengue cases (0-10000)")
    
    @validator('confirmed_cases')
    def validate_confirmed_cases(cls, v):
        if v is None:
            raise ValueError('Confirmed cases count is required')
        if v < 0:
            raise ValueError('Confirmed cases cannot be negative')
        return v
    
    @validator('suspected_cases')
    def validate_suspected_cases(cls, v):
        if v is None:
            raise ValueError('Suspected cases count is required')
        if v < 0:
            raise ValueError('Suspected cases cannot be negative')
        return v
    
    @root_validator(skip_on_failure=True)
    def validate_case_counts(cls, values):
        confirmed = values.get('confirmed_cases', 0)
        suspected = values.get('suspected_cases', 0)
        
        if confirmed == 0 and suspected == 0:
            raise ValueError('At least one of confirmed cases or suspected cases must be greater than 0')
        
        total_cases = confirmed + suspected
        if total_cases > 1000:
            raise ValueError('Total cases (confirmed + suspected) seems unusually high. Please verify the numbers.')
        
        return values
    
    class Config:
        json_schema_extra = {
            "example": {
                "report_id": "H-001",
                "date": "2026-04-25",
                "gn_code": "CMB-GN-01",
                "gn_name": "Kollupitiya",
                "source": "hospital",
                "source_record_type": "hospital_case_report",
                "confirmed_cases": 4,
                "suspected_cases": 2,
                "notes": "Cluster of fever cases reported from outpatient unit.",
                "latitude": 6.9142,
                "longitude": 79.8485
            }
        }


class DivisionalSecretariatReport(MasterReportBase):
    """Schema for divisional secretariat population/demographic reports"""
    source: str = Field("divisional_secretariat", description="Always 'divisional_secretariat'")
    source_record_type: str = Field("population_profile", description="Always 'population_profile'")
    population: int = Field(..., ge=0, le=1000000, description="Total population count for the GN (0-1,000,000)")
    households: int = Field(..., ge=0, le=500000, description="Total number of households in the GN (0-500,000)")
    
    @validator('population')
    def validate_population(cls, v):
        if v is None:
            raise ValueError('Population count is required')
        if v < 0:
            raise ValueError('Population cannot be negative')
        if v == 0:
            raise ValueError('Population must be greater than 0')
        return v
    
    @validator('households')
    def validate_households(cls, v):
        if v is None:
            raise ValueError('Household count is required')
        if v < 0:
            raise ValueError('Household count cannot be negative')
        if v == 0:
            raise ValueError('Household count must be greater than 0')
        return v
    
    @root_validator(skip_on_failure=True)
    def validate_population_households(cls, values):
        population = values.get('population', 0)
        households = values.get('households', 0)
        
        if population > 0 and households > 0:
            # Average people per household should be reasonable (1.5 to 15)
            avg_per_household = population / households
            if avg_per_household < 1.5:
                raise ValueError('Average people per household seems too low (less than 1.5). Please verify your numbers.')
            if avg_per_household > 15:
                raise ValueError('Average people per household seems too high (more than 15). Please verify your numbers.')
        
        return values
    
    class Config:
        json_schema_extra = {
            "example": {
                "report_id": "DS-001",
                "date": "2026-04-25",
                "gn_code": "CMB-GN-01",
                "gn_name": "Kollupitiya",
                "source": "divisional_secretariat",
                "source_record_type": "population_profile",
                "population": 12800,
                "households": 3100,
                "notes": "Official pilot GN baseline loaded for planning."
            }
        }


class UrbanCouncilReport(MasterReportBase):
    """Schema for urban council environmental reports"""
    source: str = Field("urban_council", description="Always 'urban_council'")
    source_record_type: str = Field("urban_environment_report", description="Always 'urban_environment_report'")
    fogging_scheduled: int = Field(..., ge=0, le=1, description="Fogging scheduled flag (0 = No, 1 = Yes)")
    environmental_complaints: int = Field(..., ge=0, le=1000, description="Number of environmental complaints received (0-1000)")
    stagnant_water_sites: int = Field(..., ge=0, le=1000, description="Number of stagnant water sites identified (0-1000)")
    
    @validator('fogging_scheduled')
    def validate_fogging_scheduled(cls, v):
        if v is None:
            raise ValueError('Fogging scheduled status is required')
        if v not in [0, 1]:
            raise ValueError('Fogging scheduled must be 0 (No) or 1 (Yes)')
        return v
    
    @validator('environmental_complaints')
    def validate_environmental_complaints(cls, v):
        if v is None:
            raise ValueError('Environmental complaints count is required')
        if v < 0:
            raise ValueError('Environmental complaints cannot be negative')
        return v
    
    @validator('stagnant_water_sites')
    def validate_stagnant_water_sites(cls, v):
        if v is None:
            raise ValueError('Stagnant water sites count is required')
        if v < 0:
            raise ValueError('Stagnant water sites cannot be negative')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "report_id": "UC-001",
                "date": "2026-04-26",
                "gn_code": "CMB-GN-01",
                "gn_name": "Kollupitiya",
                "source": "urban_council",
                "source_record_type": "urban_environment_report",
                "fogging_scheduled": 1,
                "environmental_complaints": 5,
                "stagnant_water_sites": 2,
                "notes": "Complaints near lane drains and construction area.",
                "latitude": 6.9135,
                "longitude": 79.8489
            }
        }


class GNLocalReport(MasterReportBase):
    """Schema for GN local inspection reports"""
    source: str = Field("gn_local", description="Always 'gn_local'")
    source_record_type: str = Field("local_inspection_report", description="Always 'local_inspection_report'")
    breeding_sites: int = Field(..., ge=0, le=1000, description="Number of dengue breeding sites found (0-1000)")
    inspections_total: int = Field(..., ge=0, le=10000, description="Total number of premises inspected (0-10000)")
    flagged_inspections: int = Field(..., ge=0, le=10000, description="Number of inspections that found violations (0-10000)")
    
    @validator('breeding_sites')
    def validate_breeding_sites(cls, v):
        if v is None:
            raise ValueError('Breeding sites count is required')
        if v < 0:
            raise ValueError('Breeding sites cannot be negative')
        return v
    
    @validator('inspections_total')
    def validate_inspections_total(cls, v):
        if v is None:
            raise ValueError('Total inspections count is required')
        if v < 0:
            raise ValueError('Total inspections cannot be negative')
        if v == 0:
            raise ValueError('Total inspections must be greater than 0')
        return v
    
    @validator('flagged_inspections')
    def validate_flagged_inspections(cls, v):
        if v is None:
            raise ValueError('Flagged inspections count is required')
        if v < 0:
            raise ValueError('Flagged inspections cannot be negative')
        return v
    
    @root_validator(skip_on_failure=True)
    def validate_inspection_counts(cls, values):
        total = values.get('inspections_total', 0)
        flagged = values.get('flagged_inspections', 0)
        
        if flagged > total:
            raise ValueError(f'Flagged inspections ({flagged}) cannot exceed total inspections ({total})')
        
        # Warn if flagged rate is unusually high
        if total > 0:
            flagged_rate = (flagged / total) * 100
            if flagged_rate > 90:
                raise ValueError(f'Flagged inspection rate is {flagged_rate:.1f}%. This seems unusually high. Please verify your numbers.')
        
        return values
    
    class Config:
        json_schema_extra = {
            "example": {
                "report_id": "GN-001",
                "date": "2026-04-26",
                "gn_code": "CMB-GN-01",
                "gn_name": "Kollupitiya",
                "source": "gn_local",
                "source_record_type": "local_inspection_report",
                "breeding_sites": 3,
                "inspections_total": 12,
                "flagged_inspections": 2,
                "notes": "Containers and rooftop water collections identified.",
                "latitude": 6.9146,
                "longitude": 79.8477
            }
        }


class MasterReport(BaseModel):
    """
    Schema for merged master dataset containing all possible fields from all sources.
    Fields are nullable when not applicable to the source type.
    """
    # Common fields (always present)
    report_id: str = Field(..., description="Unique report ID from original source")
    date: dt.date = Field(..., description="Report date")
    gn_code: str = Field(..., description="GN division code")
    gn_name: str = Field(..., description="GN division name")
    source: str = Field(..., description="Source system: hospital, divisional_secretariat, urban_council, gn_local")
    source_record_type: str = Field(..., description="Type of record from the source")
    
    # Hospital fields (null for other sources)
    confirmed_cases: Optional[int] = Field(None, description="Confirmed dengue cases (hospital only)")
    suspected_cases: Optional[int] = Field(None, description="Suspected dengue cases (hospital only)")
    
    # Divisional Secretariat fields (null for other sources)
    population: Optional[int] = Field(None, description="Population count (divisional_secretariat only)")
    households: Optional[int] = Field(None, description="Household count (divisional_secretariat only)")
    
    # Urban Council fields (null for other sources)
    fogging_scheduled: Optional[int] = Field(None, description="Fogging scheduled flag (urban_council only)")
    environmental_complaints: Optional[int] = Field(None, description="Environmental complaints (urban_council only)")
    stagnant_water_sites: Optional[int] = Field(None, description="Stagnant water sites (urban_council only)")
    
    # GN Local fields (null for other sources)
    breeding_sites: Optional[int] = Field(None, description="Breeding sites found (gn_local only)")
    inspections_total: Optional[int] = Field(None, description="Total inspections (gn_local only)")
    flagged_inspections: Optional[int] = Field(None, description="Flagged inspections (gn_local only)")
    
    # Optional fields (may be null for any source)
    notes: Optional[str] = Field(None, description="Notes and observations")
    latitude: Optional[float] = Field(None, description="GPS latitude")
    longitude: Optional[float] = Field(None, description="GPS longitude")
    
    # System fields
    created_at: Optional[str] = Field(None, description="System timestamp when record was created")
    updated_at: Optional[str] = Field(None, description="System timestamp when record was last updated")
    
    @validator('source')
    def validate_source(cls, v):
        valid_sources = ['hospital', 'divisional_secretariat', 'urban_council', 'gn_local']
        if v not in valid_sources:
            raise ValueError(f'Source must be one of: {valid_sources}')
        return v
    
    @validator('gn_code')
    def validate_gn_code(cls, v):
        # For pilot, only allow the 3 pilot GN codes
        valid_gns = ['CMB-GN-01', 'CMB-GN-02', 'CMB-GN-03']
        if v not in valid_gns:
            raise ValueError(f'GN code must be one of pilot areas: {valid_gns}')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "report_id": "H-001",
                "date": "2026-04-25",
                "gn_code": "CMB-GN-01",
                "gn_name": "Kollupitiya",
                "source": "hospital",
                "source_record_type": "hospital_case_report",
                "confirmed_cases": 4,
                "suspected_cases": 2,
                "population": None,
                "households": None,
                "fogging_scheduled": None,
                "environmental_complaints": None,
                "stagnant_water_sites": None,
                "breeding_sites": None,
                "inspections_total": None,
                "flagged_inspections": None,
                "notes": "Cluster of fever cases reported from outpatient unit.",
                "latitude": 6.9142,
                "longitude": 79.8485
            }
        }


# Response schemas for master reports

class MasterReportsResponse(BaseModel):
    """Response schema for listing master reports"""
    reports: List[MasterReport]
    total_count: int
    filtered_count: int
    filters_applied: Dict[str, Optional[str]]
    timestamp: str


class MasterReportCreateResponse(BaseModel):
    """Response schema for creating a master report"""
    status: str = "success"
    message: str
    report: MasterReport
    timestamp: str