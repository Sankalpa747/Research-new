#!/usr/bin/env python3
"""
Validate the hotspot scoring calculation logic against expected results.
This tests the scoring formula without needing the backend server to be running.
"""

import pandas as pd
from pathlib import Path

# Hotspot scoring configuration (matching the backend)
HOTSPOT_SCORING_CONFIG = {
    "confirmed_cases_weight": 5,
    "breeding_sites_weight": 3, 
    "environmental_complaints_weight": 2,
    "flagged_inspections_weight": 2,
    "risk_level_thresholds": {
        "high": 100,    # >= 100 = High risk
        "medium": 40,   # >= 40 = Medium risk  
        "low": 0        # < 40 = Low risk
    }
}

def calculate_risk_score(confirmed_cases, breeding_sites, environmental_complaints, flagged_inspections):
    """Calculate risk score using the same formula as the backend"""
    config = HOTSPOT_SCORING_CONFIG
    
    return (
        (confirmed_cases * config['confirmed_cases_weight']) +
        (breeding_sites * config['breeding_sites_weight']) +
        (environmental_complaints * config['environmental_complaints_weight']) +
        (flagged_inspections * config['flagged_inspections_weight'])
    )

def get_risk_level(score):
    """Determine risk level based on score"""
    config = HOTSPOT_SCORING_CONFIG
    
    if score >= config['risk_level_thresholds']['high']:
        return 'High'
    elif score >= config['risk_level_thresholds']['medium']:
        return 'Medium'
    else:
        return 'Low'

def main():
    """Validate hotspot scoring against expected results"""
    print("🧪 Validating Hotspot Scoring Logic")
    print("=" * 50)
    
    # Load expected results
    expected_file = Path("Research/dengue-resource-allocation/data/hotspot_summary.csv")
    
    if not expected_file.exists():
        print(f"❌ Expected results file not found: {expected_file}")
        print("Creating test data based on CSV content...")
        
        # Manual test data based on the CSV we saw earlier
        test_data = [
            {
                'gn_code': 'CMB-GN-02',
                'gn_name': 'Bambalapitiya',
                'confirmed_cases': 13.0,
                'breeding_sites': 10.0,
                'environmental_complaints': 15.0,
                'flagged_inspections': 8.0,
                'expected_risk_score': 141.0,
                'expected_rank': 1,
                'expected_risk_level': 'High'
            },
            {
                'gn_code': 'CMB-GN-03',
                'gn_name': 'Wellawatte',
                'confirmed_cases': 5.0,
                'breeding_sites': 5.0,
                'environmental_complaints': 6.0,
                'flagged_inspections': 4.0,
                'expected_risk_score': 60.0,
                'expected_rank': 2,
                'expected_risk_level': 'Medium'
            },
            {
                'gn_code': 'CMB-GN-01',
                'gn_name': 'Kollupitiya',
                'confirmed_cases': 7.0,
                'breeding_sites': 3.0,
                'environmental_complaints': 5.0,
                'flagged_inspections': 2.0,
                'expected_risk_score': 58.0,
                'expected_rank': 3,
                'expected_risk_level': 'Medium'
            }
        ]
    else:
        # Load from CSV
        df = pd.read_csv(expected_file)
        test_data = df.to_dict('records')
    
    print("Testing hotspot scoring calculations...")
    print()
    
    all_passed = True
    calculated_results = []
    
    for i, row in enumerate(test_data):
        gn_code = row['gn_code']
        gn_name = row['gn_name']
        
        # Extract values
        confirmed_cases = float(row['confirmed_cases'])
        breeding_sites = float(row['breeding_sites']) 
        environmental_complaints = float(row['environmental_complaints'])
        flagged_inspections = float(row['flagged_inspections'])
        
        # Calculate using our formula
        calculated_score = calculate_risk_score(
            confirmed_cases, breeding_sites, 
            environmental_complaints, flagged_inspections
        )
        
        calculated_level = get_risk_level(calculated_score)
        
        # Get expected values
        expected_score = float(row['expected_risk_score'])
        expected_level = row['expected_risk_level']
        expected_rank = int(row['expected_rank'])
        
        # Validate
        score_matches = abs(calculated_score - expected_score) < 0.1
        level_matches = calculated_level == expected_level
        
        status = "✅" if (score_matches and level_matches) else "❌"
        
        print(f"{status} {gn_name} ({gn_code})")
        print(f"   Formula: ({confirmed_cases} × 5) + ({breeding_sites} × 3) + ({environmental_complaints} × 2) + ({flagged_inspections} × 2)")
        print(f"   Calculated: {calculated_score} ({calculated_level})")
        print(f"   Expected:   {expected_score} ({expected_level})")
        
        if not score_matches:
            print(f"   ⚠️  Score mismatch: {calculated_score} vs {expected_score}")
            all_passed = False
            
        if not level_matches:
            print(f"   ⚠️  Risk level mismatch: {calculated_level} vs {expected_level}")
            all_passed = False
            
        print()
        
        # Store for ranking test
        calculated_results.append({
            'gn_code': gn_code,
            'gn_name': gn_name,
            'calculated_score': calculated_score,
            'expected_rank': expected_rank
        })
    
    # Test ranking
    print("Testing ranking logic...")
    calculated_results.sort(key=lambda x: x['calculated_score'], reverse=True)
    
    for i, result in enumerate(calculated_results):
        calculated_rank = i + 1
        expected_rank = result['expected_rank']
        rank_matches = calculated_rank == expected_rank
        
        status = "✅" if rank_matches else "❌"
        print(f"{status} {result['gn_name']}: Rank {calculated_rank} (expected {expected_rank})")
        
        if not rank_matches:
            all_passed = False
    
    print()
    print("=" * 50)
    
    if all_passed:
        print("🎉 All tests passed! The hotspot scoring logic is correct.")
        print()
        print("Formula Summary:")
        print(f"• Confirmed cases: weight × {HOTSPOT_SCORING_CONFIG['confirmed_cases_weight']}")
        print(f"• Breeding sites: weight × {HOTSPOT_SCORING_CONFIG['breeding_sites_weight']}")  
        print(f"• Environmental complaints: weight × {HOTSPOT_SCORING_CONFIG['environmental_complaints_weight']}")
        print(f"• Flagged inspections: weight × {HOTSPOT_SCORING_CONFIG['flagged_inspections_weight']}")
        print()
        print("Risk Levels:")
        print(f"• High: Score ≥ {HOTSPOT_SCORING_CONFIG['risk_level_thresholds']['high']}")
        print(f"• Medium: Score ≥ {HOTSPOT_SCORING_CONFIG['risk_level_thresholds']['medium']}")
        print(f"• Low: Score < {HOTSPOT_SCORING_CONFIG['risk_level_thresholds']['medium']}")
    else:
        print("❌ Some tests failed. Please check the scoring logic.")
        
    return all_passed

if __name__ == "__main__":
    main()