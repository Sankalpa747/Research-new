# Sample Data Import Guide

This guide explains how to import the provided Colombo pilot sample data into your Dengue Resource Allocation System.

## 📁 Available Sample Data Files

The following CSV files are included in the `data/` directory:

- **`gn_master_list.csv`** - Master list of GN divisions (3 pilot areas)
- **`master_reports.csv`** - Combined reports from all 4 sources (17 sample records)
- **`hospital_reports.csv`** - Hospital case reports (5 records)
- **`divisional_secretariat_reports.csv`** - Population data (3 records)
- **`urban_council_reports.csv`** - Environmental reports (4 records)
- **`gn_local_reports.csv`** - Local inspection reports (4 records)

## 🚀 Quick Start (Recommended)

### Option 1: Use the Automated Scripts

**For Windows:**
```cmd
cd dengue-resource-allocation
import_sample_data.bat
```

**For macOS/Linux:**
```bash
cd dengue-resource-allocation
./import_sample_data.sh
```

### Option 2: Run Python Script Directly

```bash
cd dengue-resource-allocation
python import_sample_data.py
```

*Note: Use `python3` on macOS/Linux if needed.*

## 🔧 Manual Import Methods

### Method 1: Python Import Script (Recommended)

The Python script provides the most control and detailed logging:

```bash
cd dengue-resource-allocation
python import_sample_data.py
```

**Features:**
- ✅ **Idempotent**: Safe to run multiple times (skips duplicates)
- ✅ **Validation**: Checks data integrity before import
- ✅ **Detailed Logging**: Shows progress and any errors
- ✅ **Rollback Safe**: Won't corrupt existing data
- ✅ **Comprehensive**: Imports all sample data types

### Method 2: Admin API Endpoint

If you prefer to use the web API:

1. **Start the backend server:**
   ```bash
   cd backend
   python main.py
   ```

2. **Call the import endpoint:**
   ```bash
   curl -X POST http://localhost:8000/admin/import-sample-data
   ```

   Or visit in your browser:
   ```
   http://localhost:8000/docs#/Admin%20Dashboard/import_sample_data_admin_import_sample_data_post
   ```

## 📊 What Gets Imported

### GN Master List (3 records)
- CMB-GN-01: Kollupitiya (12,800 population, 3,100 households)
- CMB-GN-02: Bambalapitiya (15,600 population, 3,800 households)  
- CMB-GN-03: Wellawatte (17,400 population, 4,200 households)

### Sample Reports (17 total records)
- **Hospital Reports (5)**: Confirmed and suspected dengue cases
- **Divisional Secretariat (3)**: Population baseline data
- **Urban Council (4)**: Environmental complaints and fogging activities
- **GN Local (4)**: Inspection activities and breeding site findings
- **Date Range**: April 25 - May 1, 2026

## 🔍 Verification Steps

After importing, verify the data was loaded correctly:

### 1. Check Import Results
The script will show a summary like:
```
IMPORT SUMMARY
==============
GN Master Records: 3
Master Reports: 17
Skipped Duplicates: 0
Errors: 0
✓ Import completed successfully!
```

### 2. Start the System
```bash
# Terminal 1: Start backend
cd backend
python main.py

# Terminal 2: Start frontend
cd dengue-frontend
npm start
```

### 3. Verify in UI
Visit `http://localhost:3000` and check:

- **Dashboard**: Should show summary statistics
- **Hospital Reports**: Navigate to `/reports/hospital` - you should see the form
- **View Reports**: Check if existing data appears (if you have a reports listing page)

### 4. Verify via API
Check the data via API endpoints:
```bash
# Get all master reports
curl http://localhost:8000/pilot/reports

# Get GN options
curl http://localhost:8000/pilot/gn-options

# Get pilot status
curl http://localhost:8000/pilot/status
```

## ⚠️ Important Notes

### Data Safety
- **Idempotent**: Running the import multiple times is safe
- **Duplicate Detection**: Existing reports with same ID are skipped
- **No Data Loss**: Import never deletes or overwrites existing data
- **Validation**: All data is validated before storage

### File Locations
- **Sample Data**: `data/*.csv` files
- **JSON Storage**: `storage/system_data.json` (created automatically)
- **Import Script**: `import_sample_data.py`

### Prerequisites
- Python 3.7+ installed
- All dependencies installed: `pip install -r requirements.txt`
- Backend directory structure in place

## 🔧 Troubleshooting

### Error: "Please run this script from the dengue-resource-allocation directory"
**Solution**: Make sure you're in the correct directory:
```bash
cd /path/to/dengue-resource-allocation
ls -la  # Should see: backend/, dengue-frontend/, data/, import_sample_data.py
```

### Error: "Backend modules could not be imported"
**Solution**: Install dependencies:
```bash
pip install -r requirements.txt
```

### Error: "Sample data file not found"
**Solution**: Verify CSV files exist:
```bash
ls -la data/
# Should see: master_reports.csv, gn_master_list.csv, etc.
```

### Error: "Permission denied" (Unix/Linux)
**Solution**: Make script executable:
```bash
chmod +x import_sample_data.sh
./import_sample_data.sh
```

### No Data Appears in UI
**Solutions**:
1. Check backend is running: `http://localhost:8000/docs`
2. Check frontend is running: `http://localhost:3000`
3. Verify import was successful (check console output)
4. Check API endpoint: `http://localhost:8000/pilot/reports`

## 📝 Advanced Usage

### Import Only Specific Data
Edit `import_sample_data.py` to comment out sections you don't want:

```python
# Comment out steps you don't want to run
# importer.import_gn_master_list()
importer.import_master_reports()  # Only import reports
```

### Custom Data Directory
```python
importer = DataImporter(data_dir=Path("/custom/path/to/data"))
```

### Backup Before Import
```bash
# Backup existing data
cp storage/system_data.json storage/system_data.json.backup

# Then run import
python import_sample_data.py
```

## 🎯 Next Steps After Import

1. **Explore the Data**: Use the UI forms to browse imported reports
2. **Test Form Submission**: Try creating new reports using the forms
3. **Test Validation**: Try submitting invalid data to see validation in action
4. **Test Duplicates**: Try submitting the same report twice to see duplicate detection
5. **View Map Data**: If you have map visualization, check if GN boundaries load correctly

## 📞 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review the console output for specific error messages
3. Verify all prerequisites are installed
4. Make sure you're in the correct directory
5. Try the manual Python script for more detailed error information

The import system is designed to be beginner-friendly and safe. When in doubt, run the Python script directly for the most detailed feedback about what's happening.