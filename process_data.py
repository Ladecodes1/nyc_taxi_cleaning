import pandas as pd
import numpy as np
import os

# File paths
RAW_DATA_PATH = "data/train.csv"
CLEANED_DATA_PATH = "data/cleaned_taxi_data.csv"
LOG_FILE_PATH = "logs/removed_records.csv"


def load_data():
    """Load the raw NYC taxi dataset"""
    print("🔹 Loading dataset...")
    df = pd.read_csv(RAW_DATA_PATH)
    print(f"✅ Loaded {len(df):,} rows.")
    return df


def clean_data(df):
    """Clean dataset: handle missing values, duplicates, and invalid data"""
    print("🔹 Cleaning dataset...")

    # Drop rows with missing essential values
    essential_cols = ["pickup_datetime", "dropoff_datetime", "pickup_longitude", "pickup_latitude", "dropoff_longitude", "dropoff_latitude"]
    missing_rows = df[df[essential_cols].isnull().any(axis=1)]
    valid_df = df.dropna(subset=essential_cols)

    # Convert datetime columns
    valid_df["pickup_datetime"] = pd.to_datetime(valid_df["pickup_datetime"], errors="coerce")
    valid_df["dropoff_datetime"] = pd.to_datetime(valid_df["dropoff_datetime"], errors="coerce")

    # Remove rows with invalid datetime parsing
    invalid_time_rows = valid_df[valid_df["pickup_datetime"].isnull() | valid_df["dropoff_datetime"].isnull()]
    valid_df = valid_df.dropna(subset=["pickup_datetime", "dropoff_datetime"])

    # Remove invalid coordinates
    coord_filter = (
        (valid_df["pickup_longitude"].between(-180, 180)) &
        (valid_df["dropoff_longitude"].between(-180, 180)) &
        (valid_df["pickup_latitude"].between(-90, 90)) &
        (valid_df["dropoff_latitude"].between(-90, 90))
    )
    invalid_coords = valid_df[~coord_filter]
    valid_df = valid_df[coord_filter]

    # Remove duplicates
    duplicate_rows = valid_df[valid_df.duplicated()]
    valid_df = valid_df.drop_duplicates()

    # Remove unrealistic trip durations (< 1 min or > 2 hours)
    valid_df["trip_duration"] = (valid_df["dropoff_datetime"] - valid_df["pickup_datetime"]).dt.total_seconds()
    outlier_rows = valid_df[(valid_df["trip_duration"] < 60) | (valid_df["trip_duration"] > 7200)]
    valid_df = valid_df[(valid_df["trip_duration"] >= 60) & (valid_df["trip_duration"] <= 7200)]

    # Log all removed records for transparency
    removed_records = pd.concat([missing_rows, invalid_time_rows, invalid_coords, duplicate_rows, outlier_rows]).drop_duplicates()
    if not removed_records.empty:
        os.makedirs(os.path.dirname(LOG_FILE_PATH), exist_ok=True)
        removed_records.to_csv(LOG_FILE_PATH, index=False)
        print(f"🗂️ Logged {len(removed_records):,} removed or suspicious records to {LOG_FILE_PATH}")

    print(f"✅ Cleaned data has {len(valid_df):,} rows remaining.")
    return valid_df


def create_derived_features(df):
    """Create new derived features"""
    print("🔹 Creating derived features...")

    # Trip duration in minutes
    df["trip_duration_min"] = df["trip_duration"] / 60

    # Approximate distance in km (using haversine formula for lat/lon)
    R = 6371  # Earth radius in km
    lat1, lon1 = np.radians(df["pickup_latitude"]), np.radians(df["pickup_longitude"])
    lat2, lon2 = np.radians(df["dropoff_latitude"]), np.radians(df["dropoff_longitude"])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = np.sin(dlat / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2) ** 2
    df["trip_distance_km"] = 2 * R * np.arcsin(np.sqrt(a))

    # Average speed in km/h
    df["trip_speed_kmh"] = df["trip_distance_km"] / (df["trip_duration"] / 3600)

    # Distance per passenger
    df["distance_per_passenger"] = df["trip_distance_km"] / df["passenger_count"].replace(0, np.nan)

    # Time-based derived features
    df["pickup_hour"] = df["pickup_datetime"].dt.hour
    df["pickup_day"] = df["pickup_datetime"].dt.day_name()
    df["pickup_month"] = df["pickup_datetime"].dt.month_name()

    print("✅ Derived features created successfully.")
    return df


def save_cleaned_data(df):
    """Save cleaned and processed dataset"""
    os.makedirs(os.path.dirname(CLEANED_DATA_PATH), exist_ok=True)
    df.to_csv(CLEANED_DATA_PATH, index=False)
    print(f"💾 Cleaned data saved to {CLEANED_DATA_PATH}")


def main():
    df = load_data()
    df = clean_data(df)
    df = create_derived_features(df)
    save_cleaned_data(df)
    print("\n🎉 Data processing complete! Your cleaned dataset is ready.")


if __name__ == "__main__":
    main()
