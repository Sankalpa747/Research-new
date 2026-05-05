"""
Allocation Predictor
Loads resource_allocation_model.pkl and exposes predict_resources().
Inputs : population (int), houses (int)
Outputs: health_inspectors, fogging_units, inspection_teams, inspection_days
"""

import joblib
import numpy as np
from pathlib import Path
from typing import Dict

_model_bundle = None


def _load_model(model_path: str):
    global _model_bundle
    if _model_bundle is None:
        _model_bundle = joblib.load(model_path)
    return _model_bundle


def predict_resources(population: int, houses: int, model_path: str) -> Dict[str, int]:
    """
    Predict resource requirements for a district.

    Args:
        population: District population
        houses:     Number of houses in the district
        model_path: Absolute path to resource_allocation_model.pkl

    Returns:
        Dict with keys: health_inspectors, fogging_units,
                        inspection_teams, inspection_days
    """
    bundle = _load_model(model_path)
    model = bundle["model"]

    # Use numpy array to match the format used during training
    X = np.array([[population, houses]])
    preds = model.predict(X)[0]

    return {
        "health_inspectors": int(np.ceil(preds[0])),
        "fogging_units":     int(np.ceil(preds[1])),
        "inspection_teams":  int(np.ceil(preds[2])),
        "inspection_days":   int(np.ceil(preds[3])),
    }
