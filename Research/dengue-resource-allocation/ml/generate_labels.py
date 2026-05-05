import pandas as pd
import math

# Load dataset
df = pd.read_csv("data/district_data.csv")

# Generate resource labels
df["health_inspectors"] = df["houses"].apply(lambda x: math.ceil(x / 500))
df["fogging_units"] = df["houses"].apply(lambda x: math.ceil(x / 1000))
df["inspection_teams"] = df["houses"].apply(lambda x: math.ceil(x / 1500))

df["inspection_days"] = df.apply(
    lambda row: math.ceil(row["houses"] / (row["health_inspectors"] * 40)), axis=1
)

# Save new dataset
df.to_csv("data/resource_training_data.csv", index=False)

print("Training dataset created successfully!")