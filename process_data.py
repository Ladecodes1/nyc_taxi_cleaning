import pandas as pd
import os

# --- Load dataset ---
def load_data(file_path):
    print("Loading dataset...")
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    df = pd.read_csv(file_path)
    print(f"Dataset loaded successfully with {len(df)} rows and {len(df.columns)} columns.")
    return df


# --- Clean dataset ---
def clean_data(df):
    print("Cleaning dataset...")

    # Step 1: Drop rows with missing values in key columns (if they exist)
    important_columns = [col for col in ["pickup_datetime", "dropoff_datetime", "trip_distance", "fare_amount"] if col in df.columns]
    if important_columns:
        df.dropna(subset=important_columns, inplace=True)

    # Step 2: Remove duplicates
    before = len(df)
    df.drop_duplicates(inplace=True)
    after = len(df)
    print(f"Removed {before - after} duplicate rows.")

    # Step 3: Remove impossible or extreme values if columns exist
    if "trip_distance" in df.columns:
        df = df[df["trip_distance"].between(0, 100)]
    if "fare_amount" in df.columns:
        df = df[df["fare_amount"].between(0, 500)]

    print("Cleaning completed successfully.")
    return df


# --- Create derived features ---
def create_features(df):
    print("Creating new features (if applicable)...")

    if "pickup_datetime" in df.columns:
        df["pickup_datetime"] = pd.to_datetime(df["pickup_datetime"], errors="coerce")
        df["pickup_hour"] = df["pickup_datetime"].dt.hour
        df["pickup_day"] = df["pickup_datetime"].dt.day_name()

    if "trip_distance" in df.columns:
        df["distance_category"] = pd.cut(
            df["trip_distance"],
            bins=[0, 1, 5, 10, 20, 100],
            labels=["very short", "short", "medium", "long", "very long"]
        )

    print("Feature creation complete.")
    return df


# --- Save cleaned dataset ---
def save_data(df, output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Cleaned data saved to: {output_path}")


# --- Main function ---
def main():
    input_path = "data/train.csv"
    output_path = "data/cleaned_taxi_data.csv"

    df = load_data(input_path)
    df = clean_data(df)
    df = create_features(df)
    save_data(df, output_path)

    print("\nSample of cleaned records:")
    print(df.head(10))
    print("\nData cleaning and processing completed successfully.")


if __name__ == "__main__":
    main()
