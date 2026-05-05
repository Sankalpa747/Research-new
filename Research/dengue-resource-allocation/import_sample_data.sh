#!/bin/bash

# Sample Data Import Script for Unix/Linux/macOS
# This script imports the provided sample CSV files into the system

echo "==============================================="
echo "Dengue Resource Allocation - Import Sample Data"
echo "==============================================="
echo

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "ERROR: Please run this script from the dengue-resource-allocation directory"
    echo "Current directory: $(pwd)"
    exit 1
fi

echo "Importing sample data..."
echo

# Run the Python import script
python3 import_sample_data.py

if [ $? -eq 0 ]; then
    echo
    echo "========================================"
    echo "SUCCESS: Sample data imported!"
    echo "========================================"
    echo
    echo "Next steps:"
    echo "1. Start the backend server:"
    echo "   cd backend"
    echo "   python3 main.py"
    echo
    echo "2. Start the frontend in a new terminal:"
    echo "   cd dengue-frontend"
    echo "   npm start"
    echo
    echo "3. Visit http://localhost:3000 to see the imported data"
    echo
else
    echo
    echo "========================================"
    echo "ERROR: Import failed!"
    echo "========================================"
    echo "Please check the error messages above."
    echo
    exit 1
fi