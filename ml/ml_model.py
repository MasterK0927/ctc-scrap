import pandas as pd
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler

def clean_line(line, expected_fields=4):
    """
    Cleans a line from the CSV file by ensuring it has the expected number of fields.
    If there are more fields, it joins extra fields. If there are fewer, it pads with empty strings.
    """
    # Split line by commas, accounting for quoted fields
    fields = line.strip().split(',')
    if len(fields) > expected_fields:
        # Handle lines with too many fields by merging extra fields
        fields = fields[:expected_fields-1] + [','.join(fields[expected_fields-1:])]
    elif len(fields) < expected_fields:
        # Pad with empty strings if fewer fields
        fields += [''] * (expected_fields - len(fields))
    return ','.join(fields)

def load_and_clean_csv(file_path, expected_fields=4):
    """
    Loads and cleans the CSV by ensuring each line has the correct number of fields.
    Writes the cleaned lines to a temporary file and loads them into a DataFrame.
    """
    cleaned_lines = []
    with open(file_path, 'r') as file:
        header = file.readline().strip()  # Read header separately
        cleaned_lines.append(clean_line(header, expected_fields))  # Ensure header is clean
        for line in file:
            cleaned_line = clean_line(line, expected_fields)
            cleaned_lines.append(cleaned_line)

    # Save cleaned lines to a temporary file
    temp_file_path = 'temp_cleaned_data.csv'
    with open(temp_file_path, 'w') as temp_file:
        temp_file.write('\n'.join(cleaned_lines))

    # Load the cleaned data into a DataFrame
    return pd.read_csv(temp_file_path)

def deduplicate(data):
    data = data.fillna('Unknown')  # Handle missing values
    data_encoded = pd.get_dummies(data, columns=['companyName', 'college', 'jobProfile'])
    scaler = StandardScaler()
    data_normalized = scaler.fit_transform(data_encoded)
    db = DBSCAN(eps=0.5, min_samples=1).fit(data_normalized)
    data['cluster'] = db.labels_
    deduped_data = data.groupby('cluster').apply(lambda x: x.mode().iloc[0])
    return deduped_data.drop('cluster', axis=1)

def main():
    try:
        # Load and clean the CSV data
        data = load_and_clean_csv('../ml/temp_cleaned_data.csv')
        print("Preview of scraped data:")
        print(data.head())

        # Ensure required columns are present
        required_columns = ['companyName', 'jobProfile', 'compensation', 'college']
        for column in required_columns:
            if column not in data.columns:
                print(f"Warning: Missing column '{column}' in data.")
                data[column] = 'Unknown'

        # Deduplicate the data
        cleaned_data = deduplicate(data)
        cleaned_data.to_csv('cleaned_data.csv', index=False)
        print("Cleaned data saved to 'cleaned_data.csv'.")

    except pd.errors.EmptyDataError:
        print("Error: The CSV file is empty.")
    except pd.errors.ParserError as e:
        print(f"Error parsing the CSV file: {e}")
    except FileNotFoundError:
        print("Error: The CSV file was not found.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()
