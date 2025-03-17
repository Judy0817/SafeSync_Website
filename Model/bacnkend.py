from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
import joblib
import logging

# Initialize Flask app
app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load the trained model, scaler, and encoder
model = tf.keras.models.load_model('severity_prediction_model.h5', custom_objects={"mse": tf.keras.losses.MeanSquaredError()})
scaler = joblib.load('scaler.pkl')
encoder = joblib.load('encoder.pkl')

# Define feature lists
categorical_features = ['Wind_Direction', 'Weather_Condition']
numerical_features = ['Temperature(F)', 'Wind_Chill(F)', 'Humidity(%)', 'Pressure(in)',
                      'Visibility(mi)', 'Wind_Speed(mph)', 'Precipitation(in)']
boolean_features = ['Amenity', 'Bump', 'Crossing', 'Give_Way', 'Junction', 'No_Exit', 'Railway',
                    'Roundabout', 'Station', 'Stop', 'Traffic_Calming', 'Traffic_Signal', 'Turning_Loop']

# Get known categories from encoder
known_categories = encoder.categories_
known_wind_directions = set(known_categories[0])  # Wind_Direction is first
known_weather_conditions = set(known_categories[1])  # Weather_Condition is second

@app.route('/predict', methods=['POST'])
def predict_severity():
    try:
        # Get JSON data from request
        data = request.json
        logging.info(f"Request Data: {data}")

        # Replace unknown categories
        wind_direction = data['Wind_Direction'] if data['Wind_Direction'] in known_wind_directions else 'NW'
        weather_condition = data['Weather_Condition'] if data['Weather_Condition'] in known_weather_conditions else 'Clear'

        # Extract features
        num_data = np.array([[data[feature] for feature in numerical_features]])
        cat_data = np.array([[wind_direction, weather_condition]])
        bool_data = np.array([[int(data[feature]) for feature in boolean_features]])

        # Scale numerical features
        scaled_num_data = scaler.transform(num_data)

        # Encode categorical features
        encoded_cat_data = encoder.transform(cat_data)

        # Combine all features
        combined_features = np.hstack((scaled_num_data, encoded_cat_data, bool_data))

        # Make prediction
        prediction = model.predict(combined_features)
        severity = float(prediction[0][0])

        # Log response
        logging.info(f"Prediction: {severity}")

        # Return prediction
        return jsonify({'severity': severity})

    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
