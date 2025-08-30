import pandas as pd

def preprocess_data(file_path="smart_home_energy_consumption_large.csv"):
    df = pd.read_csv(file_path)

    df['Date'] = pd.to_datetime(df['Date'])

    df.fillna(0, inplace=True)

    for col in df.columns:
        if col != 'Date':
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    df.set_index('Date', inplace=True)

    daily_data = df.resample('D').sum()
    weekly_data = df.resample('W').sum()
    monthly_data = df.resample('M').sum()

    # features (hour, day, month) for further analysis
    df['hour'] = df.index.hour
    df['day'] = df.index.day
    df['month'] = df.index.month

    return {
        "raw": df,
        "daily": daily_data,
        "weekly": weekly_data,
        "monthly": monthly_data
    }

if __name__ == "__main__":
    data = preprocess_data("smart_home_energy_consumption_large.csv")
    print("Preprocessing completed")
