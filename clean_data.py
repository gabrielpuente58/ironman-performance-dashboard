#!/usr/bin/env python3
"""
Data cleaning script for Ironman Arizona 2024 dataset.
Removes entries with missing or invalid time data.
"""

import pandas as pd
import sys

def is_valid_time(time_str):
    """Check if a time string is valid (not empty, not 00:0:0, etc.)"""
    if pd.isna(time_str) or time_str == '':
        return False
    
    # Check for invalid time formats like "00:0:0"
    if time_str == "00:0:0" or time_str == "0:0:0":
        return False
    
    try:
        parts = str(time_str).split(':')
        if len(parts) != 3:
            return False
        
        h, m, s = map(int, parts)
        if h == 0 and m == 0 and s == 0:
            return False
        
        return True
    except (ValueError, AttributeError):
        return False

def clean_ironman_data(input_file, output_file):
    """
    Clean the Ironman dataset by removing entries with missing/invalid data.
    
    Args:
        input_file: Path to the original CSV file
        output_file: Path to save the cleaned CSV file
    """
    print(f"Reading data from {input_file}...")
    df = pd.read_csv(input_file)
    
    initial_count = len(df)
    print(f"Initial number of entries: {initial_count}")
    
    # Define the critical time columns that must have valid data
    time_columns = ['Swim Time', 'Bike Time', 'Run Time', 'Overall Time']
    
    # Check for missing values
    print("\nChecking for missing/invalid data...")
    for col in time_columns:
        if col in df.columns:
            invalid_count = df[col].apply(lambda x: not is_valid_time(x)).sum()
            print(f"  {col}: {invalid_count} invalid entries")
    
    # Remove rows with invalid time data in any critical column
    df_clean = df.copy()
    for col in time_columns:
        if col in df_clean.columns:
            df_clean = df_clean[df_clean[col].apply(is_valid_time)]
    
    # Remove rows with missing essential data
    essential_columns = ['Name', 'Division', 'gender']
    for col in essential_columns:
        if col in df_clean.columns:
            df_clean = df_clean[df_clean[col].notna()]
            df_clean = df_clean[df_clean[col] != '']
    
    final_count = len(df_clean)
    removed_count = initial_count - final_count
    
    print(f"\nCleaning complete!")
    print(f"Final number of entries: {final_count}")
    print(f"Removed entries: {removed_count} ({removed_count/initial_count*100:.1f}%)")
    
    # Save the cleaned data
    df_clean.to_csv(output_file, index=False)
    print(f"\nCleaned data saved to {output_file}")
    
    # Display some statistics
    print("\n=== Data Summary ===")
    print(f"Total athletes: {final_count}")
    if 'gender' in df_clean.columns:
        print("\nGender distribution:")
        print(df_clean['gender'].value_counts())
    if 'Division' in df_clean.columns:
        print(f"\nNumber of divisions: {df_clean['Division'].nunique()}")
    
    return df_clean

if __name__ == "__main__":
    input_file = "full-ironmans/ironmanlakeplacid2025.csv"
    output_file = "full-ironmans/ironmanlakeplacid2025_clean.csv"

    try:
        clean_ironman_data(input_file, output_file)
        print("\nData cleaning successful!")
    except FileNotFoundError:
        print(f"Error: Could not find {input_file}")
        sys.exit(1)
    except Exception as e:
        print(f"Error during cleaning: {e}")
        sys.exit(1)
