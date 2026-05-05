"""
Training script for the Resource Allocation Model.
Trains a MultiOutput regression model using population and number of houses
as features to predict resource requirements per district.

Outputs: resource_allocation_model.pkl in the ml/ folder.
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
from pathlib import Path

# 25 Sri Lankan districts with realistic population and house counts
DISTRICT_DATA = {
    "Ampara":        {"population": 649738,  "houses": 146000},
    "Anuradhapura":  {"population": 856232,  "houses": 205000},
    "Badulla":       {"population": 812379,  "houses": 195000},
    "Batticaloa":    {"population": 526567,  "houses": 115000},
    "Colombo":       {"population": 2323826, "houses": 520000},
    "Galle":         {"population": 1063407, "houses": 250000},
    "Gampaha":       {"population": 2304833, "houses": 490000},
    "Hambantota":    {"population": 599903,  "houses": 140000},
    "Jaffna":        {"population": 583882,  "houses": 130000},
    "Kalutara":      {"population": 1221948, "houses": 290000},
    "Kandy":         {"population": 1375382, "houses": 330000},
    "Kegalle":       {"population": 841764,  "houses": 202000},
    "Kilinochchi":   {"population": 116414,  "houses": 26000},
    "Kurunegala":    {"population": 1618465, "houses": 380000},
    "Mannar":        {"population": 99051,   "houses": 22000},
    "Matale":        {"population": 484531,  "houses": 115000},
    "Matara":        {"population": 814048,  "houses": 195000},
    "Monaragala":    {"population": 451058,  "houses": 105000},
    "Mullaitivu":    {"population": 92390,   "houses": 20000},
    "Nuwara Eliya":  {"population": 758561,  "houses": 160000},
    "Polonnaruwa":   {"population": 406088,  "houses": 95000},
    "Puttalam":      {"population": 762396,  "houses": 173000},
    "Ratnapura":     {"population": 1082387, "houses": 255000},
    "Trincomalee":   {"population": 379541,  "houses": 85000},
    "Vavuniya":      {"population": 172115,  "houses": 37000},
}


def generate_synthetic_dataset(n_total: int = 500, random_state: int = 42) -> pd.DataFrame:
    """
    Generate a synthetic dataset of 500 rows across 25 districts.
    Each district appears ~20 times with small population/houses variation
    to simulate different survey periods.
    """
    np.random.seed(random_state)
    districts = list(DISTRICT_DATA.keys())
    rows_per_district = n_total // len(districts)   # 20 each
    remainder = n_total % len(districts)

    records = []
    for i, district in enumerate(districts):
        base = DISTRICT_DATA[district]
        n_rows = rows_per_district + (1 if i < remainder else 0)

        for _ in range(n_rows):
            # Small variation (±5 %) to simulate different time periods
            pop   = int(base["population"] * np.random.uniform(0.95, 1.05))
            houses = int(base["houses"]    * np.random.uniform(0.95, 1.05))

            # Deterministic resource formula
            health_inspectors = max(2,  int(np.ceil(pop    / 50_000)))
            fogging_units     = max(1,  int(np.ceil(houses / 25_000)))
            inspection_teams  = max(1,  int(np.ceil(houses / 30_000)))
            inspection_days   = max(5,  int(np.ceil(houses /  5_000)))

            # Add ±10 % noise to targets
            noise = np.random.uniform(0.90, 1.10)
            records.append({
                "population":          pop,
                "houses":              houses,
                "health_inspectors":   max(1, int(round(health_inspectors * noise))),
                "fogging_units":       max(1, int(round(fogging_units     * noise))),
                "inspection_teams":    max(1, int(round(inspection_teams  * noise))),
                "inspection_days":     max(1, int(round(inspection_days   * noise))),
            })

    df = pd.DataFrame(records)
    np.random.shuffle(df.values)   # shuffle rows
    df = df.reset_index(drop=True)
    return df


def train_and_save(output_path: str = "ml/resource_allocation_model.pkl"):
    print("=" * 60)
    print("Training Resource Allocation Model")
    print("=" * 60)

    df = generate_synthetic_dataset(n_total=500)
    print(f"\nDataset shape: {df.shape}")
    print(df.describe().to_string())

    feature_cols = ["population", "houses"]
    target_cols  = ["health_inspectors", "fogging_units", "inspection_teams", "inspection_days"]

    X = df[feature_cols].values
    y = df[target_cols].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    base = RandomForestRegressor(
        n_estimators=200,
        max_depth=10,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    model = MultiOutputRegressor(base)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2  = r2_score(y_test, y_pred)
    print(f"\nTest MAE: {mae:.3f}   Test R²: {r2:.4f}")

    for i, col in enumerate(target_cols):
        col_mae = mean_absolute_error(y_test[:, i], y_pred[:, i])
        col_r2  = r2_score(y_test[:, i], y_pred[:, i])
        print(f"  {col:25s} | MAE: {col_mae:6.2f} | R²: {col_r2:.4f}")

    # Save model
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    model_bundle = {
        "model":          model,
        "feature_names":  feature_cols,
        "target_names":   target_cols,
    }
    joblib.dump(model_bundle, output_path)
    print(f"\nModel saved: {output_path}")
    print("=" * 60)


if __name__ == "__main__":
    import sys
    from pathlib import Path

    # Allow running from any working directory
    project_root = Path(__file__).resolve().parent.parent
    output = str(project_root / "ml" / "resource_allocation_model.pkl")
    train_and_save(output)
