#!/usr/bin/env python3
"""
Sample Data Import Script for Dengue Resource Allocation System

This script imports the provided sample CSV files into the JSON store.
It's designed to be safe, idempotent, and beginner-friendly.

Usage:
    python import_sample_data.py

Files imported:
- data/gn_master_list.csv
- data/master_reports.csv (contains all report types)
- Individual source CSV files (as backup)
"""

import csv
import json
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any

# Add backend to path for imports
sys.path.insert(0, str(Path(__file__).parent))

try:
    from backend.json_store import get_store
    from backend.config import STORAGE_PATH, DATA_DIR
    print("✓ Backend modules loaded successfully")
except ImportError as e:
    print(f"✗ Error importing backend modules: {e}")
    print("Make sure you're running this script from the dengue-resource-allocation directory")
    sys.exit(1)


class DataImporter:
    """Handles importing sample CSV data into the JSON store"""
    
    def __init__(self, data_dir: Path = None, storage_path: Path = None):
        self.data_dir = data_dir or DATA_DIR
        self.storage_path = storage_path or STORAGE_PATH
        self.store = get_store(str(self.storage_path))
        self.import_stats = {
            'gn_master': 0,
            'master_reports': 0,
            'skipped_duplicates': 0,
            'errors': 0
        }
    
    def log(self, message: str, level: str = "INFO"):
        """Simple logging with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
    
    def safe_int(self, value: str) -> Optional[int]:
        """Safely convert string to int, return None if empty or invalid"""
        if not value or value.strip() == '':
            return None
        try:
            return int(float(value))  # Handle numbers like "1.0"
        except (ValueError, TypeError):
            return None
    
    def safe_float(self, value: str) -> Optional[float]:
        """Safely convert string to float, return None if empty or invalid"""
        if not value or value.strip() == '':
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None
    
    def import_gn_master_list(self) -> bool:
        """Import GN master list data (used by frontend dropdowns)"""
        csv_path = self.data_dir / "gn_master_list.csv"
        
        if not csv_path.exists():
            self.log(f"GN master list file not found: {csv_path}", "WARNING")
            return False
        
        self.log(f"Importing GN master list from {csv_path}")
        
        try:
            with open(csv_path, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                
                for row in reader:
                    # Validate required fields
                    if not all([row.get('gn_code'), row.get('gn_name'), row.get('city')]):
                        self.log(f"Skipping incomplete GN record: {row}", "WARNING")
                        continue
                    
                    # The GN master list is used by the API endpoints
                    # We don't need to store it separately in JSON store
                    # since it's read directly from CSV by the pilot API
                    self.import_stats['gn_master'] += 1
            
            self.log(f"GN master list import completed: {self.import_stats['gn_master']} records")
            return True
            
        except Exception as e:
            self.log(f"Error importing GN master list: {e}", "ERROR")
            self.import_stats['errors'] += 1
            return False
    
    def import_master_reports(self) -> bool:
        """Import master reports from CSV"""
        csv_path = self.data_dir / "master_reports.csv"
        
        if not csv_path.exists():
            self.log(f"Master reports file not found: {csv_path}", "WARNING")
            return False
        
        self.log(f"Importing master reports from {csv_path}")
        
        # Get existing reports to check for duplicates
        existing_reports = self.store.get_master_reports()
        existing_ids = {report.get('report_id') for report in existing_reports}
        
        try:
            with open(csv_path, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                
                for row in reader:
                    # Validate required fields
                    report_id = row.get('report_id', '').strip()
                    date = row.get('date', '').strip()
                    gn_code = row.get('gn_code', '').strip()
                    gn_name = row.get('gn_name', '').strip()
                    source = row.get('source', '').strip()
                    source_record_type = row.get('source_record_type', '').strip()
                    
                    if not all([report_id, date, gn_code, gn_name, source, source_record_type]):
                        self.log(f"Skipping incomplete report record: {report_id}", "WARNING")
                        continue
                    
                    # Check for duplicates (idempotent)
                    if report_id in existing_ids:
                        self.log(f"Skipping duplicate report: {report_id}")
                        self.import_stats['skipped_duplicates'] += 1
                        continue
                    
                    # Build the report object
                    report = {
                        'report_id': report_id,
                        'date': date,
                        'gn_code': gn_code,
                        'gn_name': gn_name,
                        'source': source,
                        'source_record_type': source_record_type,
                        'notes': row.get('notes', '').strip() or None,
                        'latitude': self.safe_float(row.get('latitude')),
                        'longitude': self.safe_float(row.get('longitude')),
                        'created_at': datetime.now().isoformat(),
                        'updated_at': datetime.now().isoformat()
                    }
                    
                    # Add source-specific fields
                    if source == 'hospital':
                        report.update({
                            'confirmed_cases': self.safe_int(row.get('confirmed_cases')),
                            'suspected_cases': self.safe_int(row.get('suspected_cases')),
                        })
                    elif source == 'divisional_secretariat':
                        report.update({
                            'population': self.safe_int(row.get('population')),
                            'households': self.safe_int(row.get('households')),
                        })
                    elif source == 'urban_council':
                        report.update({
                            'fogging_scheduled': self.safe_int(row.get('fogging_scheduled')),
                            'environmental_complaints': self.safe_int(row.get('environmental_complaints')),
                            'stagnant_water_sites': self.safe_int(row.get('stagnant_water_sites')),
                        })
                    elif source == 'gn_local':
                        report.update({
                            'breeding_sites': self.safe_int(row.get('breeding_sites')),
                            'inspections_total': self.safe_int(row.get('inspections_total')),
                            'flagged_inspections': self.safe_int(row.get('flagged_inspections')),
                        })
                    
                    # Save to store
                    try:
                        self.store.save_master_report(report)
                        self.import_stats['master_reports'] += 1
                        existing_ids.add(report_id)  # Track for duplicate checking
                        
                        if self.import_stats['master_reports'] % 5 == 0:
                            self.log(f"Imported {self.import_stats['master_reports']} reports...")
                            
                    except Exception as e:
                        self.log(f"Error saving report {report_id}: {e}", "ERROR")
                        self.import_stats['errors'] += 1
            
            self.log(f"Master reports import completed: {self.import_stats['master_reports']} new records")
            return True
            
        except Exception as e:
            self.log(f"Error importing master reports: {e}", "ERROR")
            self.import_stats['errors'] += 1
            return False
    
    def import_individual_source_files(self) -> bool:
        """Import individual source CSV files as backup/verification"""
        source_files = {
            'hospital_reports.csv': 'hospital',
            'divisional_secretariat_reports.csv': 'divisional_secretariat', 
            'urban_council_reports.csv': 'urban_council',
            'gn_local_reports.csv': 'gn_local'
        }
        
        imported_any = False
        
        for filename, source in source_files.items():
            csv_path = self.data_dir / filename
            
            if not csv_path.exists():
                self.log(f"Source file not found: {filename}", "WARNING")
                continue
            
            self.log(f"Verifying {source} data from {filename}")
            
            try:
                with open(csv_path, 'r', encoding='utf-8') as csvfile:
                    reader = csv.DictReader(csvfile)
                    count = sum(1 for row in reader)
                    self.log(f"✓ {filename}: {count} records available")
                    imported_any = True
                    
            except Exception as e:
                self.log(f"Error reading {filename}: {e}", "ERROR")
        
        return imported_any
    
    def verify_import(self) -> bool:
        """Verify the imported data"""
        self.log("Verifying imported data...")
        
        try:
            # Check master reports
            all_reports = self.store.get_master_reports()
            total_reports = len(all_reports)
            
            # Count by source
            source_counts = {}
            for report in all_reports:
                source = report.get('source', 'unknown')
                source_counts[source] = source_counts.get(source, 0) + 1
            
            self.log(f"✓ Total master reports: {total_reports}")
            for source, count in source_counts.items():
                self.log(f"  - {source}: {count} reports")
            
            # Check for each GN
            gn_counts = {}
            for report in all_reports:
                gn = report.get('gn_code', 'unknown')
                gn_counts[gn] = gn_counts.get(gn, 0) + 1
            
            self.log("✓ Reports by GN Division:")
            for gn, count in gn_counts.items():
                self.log(f"  - {gn}: {count} reports")
            
            return total_reports > 0
            
        except Exception as e:
            self.log(f"Error verifying import: {e}", "ERROR")
            return False
    
    def print_summary(self):
        """Print import summary"""
        self.log("="*50)
        self.log("IMPORT SUMMARY")
        self.log("="*50)
        self.log(f"GN Master Records: {self.import_stats['gn_master']}")
        self.log(f"Master Reports: {self.import_stats['master_reports']}")
        self.log(f"Skipped Duplicates: {self.import_stats['skipped_duplicates']}")
        self.log(f"Errors: {self.import_stats['errors']}")
        
        if self.import_stats['errors'] == 0:
            self.log("✓ Import completed successfully!", "SUCCESS")
        else:
            self.log(f"⚠ Import completed with {self.import_stats['errors']} errors", "WARNING")


def main():
    """Main import function"""
    print("="*60)
    print("Dengue Resource Allocation - Sample Data Import")
    print("="*60)
    
    # Check if we're in the right directory
    if not Path("backend").exists():
        print("✗ Error: Please run this script from the dengue-resource-allocation directory")
        print("Current directory:", Path.cwd())
        sys.exit(1)
    
    # Initialize importer
    try:
        importer = DataImporter()
        print(f"✓ Connected to JSON store: {importer.storage_path}")
        print(f"✓ Data directory: {importer.data_dir}")
    except Exception as e:
        print(f"✗ Error initializing importer: {e}")
        sys.exit(1)
    
    # Import data
    success = True
    
    # 1. Import GN master list
    importer.log("Step 1: Importing GN master list...")
    if not importer.import_gn_master_list():
        success = False
    
    # 2. Import master reports 
    importer.log("Step 2: Importing master reports...")
    if not importer.import_master_reports():
        success = False
    
    # 3. Verify individual source files exist
    importer.log("Step 3: Verifying individual source files...")
    importer.import_individual_source_files()
    
    # 4. Verify import
    importer.log("Step 4: Verifying imported data...")
    if not importer.verify_import():
        success = False
    
    # Print summary
    importer.print_summary()
    
    if success:
        print("\n🎉 Sample data import completed successfully!")
        print("\nNext steps:")
        print("1. Start the backend server: cd backend && python main.py")
        print("2. Start the frontend: cd dengue-frontend && npm start")
        print("3. Visit http://localhost:3000 to see the imported data")
    else:
        print("\n❌ Import completed with errors. Please check the logs above.")
        sys.exit(1)


if __name__ == "__main__":
    main()