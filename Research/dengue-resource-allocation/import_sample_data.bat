@echo off
REM Sample Data Import Script for Windows
REM This script imports the provided sample CSV files into the system

echo ===============================================
echo Dengue Resource Allocation - Import Sample Data
echo ===============================================
echo.

REM Check if we're in the right directory
if not exist "backend\" (
    echo ERROR: Please run this script from the dengue-resource-allocation directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo Importing sample data...
echo.

REM Run the Python import script
python import_sample_data.py

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS: Sample data imported!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Start the backend server:
    echo    cd backend
    echo    python main.py
    echo.
    echo 2. Start the frontend in a new terminal:
    echo    cd dengue-frontend
    echo    npm start
    echo.
    echo 3. Visit http://localhost:3000 to see the imported data
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Import failed!
    echo ========================================
    echo Please check the error messages above.
    echo.
)

pause