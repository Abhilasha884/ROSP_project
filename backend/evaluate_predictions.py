import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.metrics import precision_score, recall_score, accuracy_score
import warnings
warnings.filterwarnings('ignore')

def load_and_preprocess_data(file_path):
    """Load and preprocess the dataset."""
    df = pd.read_csv(file_path)
    df['Date'] = pd.to_datetime(df['Date'])
    df = df.sort_values('Date')
    return df

def evaluate_appliance_predictions(df, appliance_type):
    """Evaluate predictions for a specific appliance type."""
    # Filter data for the appliance
    app_data = df[df['Appliance Type'] == appliance_type].copy()
    
    if len(app_data) < 12:  # Need at least 12 months for meaningful evaluation
        print(f"Insufficient data for {appliance_type}. Need at least 12 months, got {len(app_data)}")
        return None
    
    # Prepare data for time series
    app_data = app_data.set_index('Date')
    app_data = app_data['Energy Consumption (kWh)'].resample('M').sum()
    
    # Split into train and test (last 6 months for testing)
    train = app_data[:-6]
    test = app_data[-6:]
    
    if len(train) < 6:  # Need at least 6 points for ARIMA
        print(f"Insufficient training data for {appliance_type}")
        return None
    
    # Train ARIMA model
    try:
        model = ARIMA(train, order=(1, 1, 1))
        model_fit = model.fit()
        
        # Make predictions
        predictions = model_fit.forecast(steps=len(test))
        
        # Calculate metrics
        mae = mean_absolute_error(test, predictions)
        rmse = np.sqrt(mean_squared_error(test, predictions))
        r2 = r2_score(test, predictions)
        
        # For classification metrics, we'll convert to binary (above/below median)
        median_consumption = np.median(app_data)
        actual_binary = (test > median_consumption).astype(int)
        pred_binary = (predictions > median_consumption).astype(int)
        
        precision = precision_score(actual_binary, pred_binary, zero_division=0)
        recall = recall_score(actual_binary, pred_binary, zero_division=0)
        accuracy = accuracy_score(actual_binary, pred_binary)
        
        return {
            'appliance': appliance_type,
            'mae': mae,
            'rmse': rmse,
            'r2': r2,
            'precision': precision,
            'recall': recall,
            'accuracy': accuracy,
            'test_points': len(test)
        }
    except Exception as e:
        print(f"Error evaluating {appliance_type}: {str(e)}")
        return None

def main():
    # Load and preprocess data
    print("Loading and preprocessing data...")
    df = load_and_preprocess_data('smart_home_energy_consumption_large.csv')
    
    # Group by month and appliance type
    monthly = df.groupby([pd.Grouper(key='Date', freq='M'), 'Appliance Type'])['Energy Consumption (kWh)'] \
               .sum().reset_index()
    
    # Get unique appliance types
    appliance_types = monthly['Appliance Type'].unique()
    
    results = []
    
    # Evaluate predictions for each appliance
    print("\nEvaluating predictions...")
    for appliance in appliance_types:
        print(f"\nEvaluating {appliance}...")
        metrics = evaluate_appliance_predictions(monthly, appliance)
        if metrics:
            results.append(metrics)
    
    # Display results
    if results:
        print("\n" + "="*80)
        print("PREDICTION EVALUATION RESULTS")
        print("="*80)
        
        # Convert to DataFrame for better display
        results_df = pd.DataFrame(results)
        results_df = results_df[['appliance', 'mae', 'rmse', 'r2', 'accuracy', 'precision', 'recall', 'test_points']]
        
        # Format output
        pd.set_option('display.max_columns', None)
        pd.set_option('display.width', 1000)
        pd.set_option('display.float_format', lambda x: f"{x:.4f}" if isinstance(x, (int, float)) else x)
        
        print("\nDetailed Metrics by Appliance:")
        print("-" * 80)
        print(results_df)
        
        # Print summary statistics
        print("\nSummary Statistics:")
        print("-" * 80)
        print(f"Number of appliances evaluated: {len(results_df)}")
        print(f"Average MAE: {results_df['mae'].mean():.4f}")
        print(f"Average RMSE: {results_df['rmse'].mean():.4f}")
        print(f"Average R²: {results_df['r2'].mean():.4f}")
        print(f"Average Accuracy: {results_df['accuracy'].mean():.4f}")
        print(f"Average Precision: {results_df['precision'].mean():.4f}")
        print(f"Average Recall: {results_df['recall'].mean():.4f}")
        
        # Save results to CSV
        results_df.to_csv('prediction_evaluation_results.csv', index=False)
        print("\nResults saved to 'prediction_evaluation_results.csv'")
    else:
        print("No valid results to display.")

if __name__ == "__main__":
    main()
