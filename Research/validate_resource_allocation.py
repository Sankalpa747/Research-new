#!/usr/bin/env python3
"""
Validate the pilot resource allocation logic against expected results.
Tests the allocation rules without needing the backend server to be running.
"""

import pandas as pd
from pathlib import Path

# Pilot Resource Allocation Configuration (matching the backend)
PILOT_RESOURCE_CONFIG = {
    "daily_constraints": {
        "fogging_teams_available": 2,      # Total fogging teams per day
        "inspection_teams_available": 3,   # Total inspection teams per day  
        "max_hours_per_team": 8            # Max working hours per team
    },
    "allocation_rules": {
        # Rules based on GN hotspot priority ranking
        1: {  # Rank 1 (Highest risk)
            "fogging_teams": 2,
            "inspection_teams": 1,
            "priority_notes": "Highest risk - maximum resources allocated"
        },
        2: {  # Rank 2 (Medium-high risk)  
            "fogging_teams": 1,
            "inspection_teams": 1,
            "priority_notes": "Second priority - balanced allocation"
        },
        3: {  # Rank 3 (Lower risk)
            "fogging_teams": 0,
            "inspection_teams": 1, 
            "priority_notes": "Monitoring and inspection only"
        }
    }
}

def calculate_allocation(rank):
    """Calculate allocation for a given rank using the same logic as backend"""
    config = PILOT_RESOURCE_CONFIG
    allocation_rule = config['allocation_rules'].get(rank, {
        "fogging_teams": 0,
        "inspection_teams": 0
    })
    
    fogging_teams = allocation_rule.get('fogging_teams', 0)
    inspection_teams = allocation_rule.get('inspection_teams', 0)
    
    return {
        'fogging_teams': fogging_teams,
        'inspection_teams': inspection_teams,
        'fogging_text': f"{fogging_teams} fogging team{'s' if fogging_teams != 1 else ''}",
        'inspection_text': f"{inspection_teams} inspection team{'s' if inspection_teams != 1 else ''}"
    }

def main():
    """Validate resource allocation against expected results"""
    print("🧪 Validating Resource Allocation Logic")
    print("=" * 50)
    
    # Load expected results
    expected_file = Path("Research/dengue-resource-allocation/data/resource_allocation_plan.csv")
    
    if not expected_file.exists():
        print(f"❌ Expected results file not found: {expected_file}")
        print("Creating test data based on CSV content...")
        
        # Manual test data based on the CSV we saw earlier
        test_data = [
            {
                'priority_rank': 1,
                'gn_code': 'CMB-GN-02',
                'gn_name': 'Bambalapitiya',
                'expected_fogging': '2 fogging teams',
                'expected_inspection': '1 inspection team',
                'notes': 'Highest hotspot in pilot run'
            },
            {
                'priority_rank': 2,
                'gn_code': 'CMB-GN-03',
                'gn_name': 'Wellawatte',
                'expected_fogging': '1 fogging team',
                'expected_inspection': '1 inspection team',
                'notes': 'Second highest hotspot'
            },
            {
                'priority_rank': 3,
                'gn_code': 'CMB-GN-01',
                'gn_name': 'Kollupitiya',
                'expected_fogging': '0 fogging teams',
                'expected_inspection': '1 inspection team',
                'notes': 'Monitoring and inspection priority only'
            }
        ]
    else:
        # Load from CSV
        df = pd.read_csv(expected_file)
        test_data = []
        
        for _, row in df.iterrows():
            test_data.append({
                'priority_rank': int(row['priority_rank']),
                'gn_code': row['gn_code'],
                'gn_name': row['gn_name'],
                'expected_fogging': row['fogging_allocation'],
                'expected_inspection': row['inspection_allocation'],
                'notes': row['notes']
            })
    
    print("Testing resource allocation calculations...")
    print()
    
    all_passed = True
    total_fogging = 0
    total_inspection = 0
    
    for entry in test_data:
        rank = entry['priority_rank']
        gn_name = entry['gn_name']
        gn_code = entry['gn_code']
        
        # Calculate using our allocation rules
        calculated = calculate_allocation(rank)
        
        # Get expected values
        expected_fogging = entry['expected_fogging']
        expected_inspection = entry['expected_inspection']
        
        # Compare results
        fogging_matches = calculated['fogging_text'] == expected_fogging
        inspection_matches = calculated['inspection_text'] == expected_inspection
        
        status = "✅" if (fogging_matches and inspection_matches) else "❌"
        
        print(f"{status} Rank #{rank}: {gn_name} ({gn_code})")
        print(f"   Calculated Fogging: {calculated['fogging_text']}")
        print(f"   Expected Fogging:   {expected_fogging}")
        print(f"   Calculated Inspection: {calculated['inspection_text']}")
        print(f"   Expected Inspection:   {expected_inspection}")
        
        if not fogging_matches:
            print(f"   ⚠️  Fogging mismatch")
            all_passed = False
            
        if not inspection_matches:
            print(f"   ⚠️  Inspection mismatch")
            all_passed = False
            
        print(f"   Notes: {entry['notes']}")
        print()
        
        # Track totals
        total_fogging += calculated['fogging_teams']
        total_inspection += calculated['inspection_teams']
    
    # Test capacity constraints
    print("Testing capacity constraints...")
    fogging_within_capacity = total_fogging <= PILOT_RESOURCE_CONFIG['daily_constraints']['fogging_teams_available']
    inspection_within_capacity = total_inspection <= PILOT_RESOURCE_CONFIG['daily_constraints']['inspection_teams_available']
    
    print(f"Total fogging teams allocated: {total_fogging}/{PILOT_RESOURCE_CONFIG['daily_constraints']['fogging_teams_available']} - {'✅' if fogging_within_capacity else '❌'}")
    print(f"Total inspection teams allocated: {total_inspection}/{PILOT_RESOURCE_CONFIG['daily_constraints']['inspection_teams_available']} - {'✅' if inspection_within_capacity else '❌'}")
    
    if not fogging_within_capacity:
        print("⚠️  Fogging team allocation exceeds daily capacity")
        all_passed = False
        
    if not inspection_within_capacity:
        print("⚠️  Inspection team allocation exceeds daily capacity")
        all_passed = False
    
    print()
    print("=" * 50)
    
    if all_passed:
        print("🎉 All tests passed! The resource allocation logic is correct.")
        print()
        print("Allocation Rules Summary:")
        for rank, rules in PILOT_RESOURCE_CONFIG['allocation_rules'].items():
            print(f"• Rank {rank}: {rules['fogging_teams']} fogging + {rules['inspection_teams']} inspection teams")
        
        print()
        print("Daily Constraints:")
        print(f"• Fogging teams available: {PILOT_RESOURCE_CONFIG['daily_constraints']['fogging_teams_available']}")
        print(f"• Inspection teams available: {PILOT_RESOURCE_CONFIG['daily_constraints']['inspection_teams_available']}")
        print(f"• Max hours per team: {PILOT_RESOURCE_CONFIG['daily_constraints']['max_hours_per_team']}")
        
        print()
        print("Configuration Location:")
        print("• File: backend/routes/pilot.py")
        print("• Object: PILOT_RESOURCE_CONFIG")
        print("• Easy to modify allocation rules and constraints")
        
    else:
        print("❌ Some tests failed. Please check the allocation logic.")
        
    return all_passed

if __name__ == "__main__":
    main()