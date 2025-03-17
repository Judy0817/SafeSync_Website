
# Severity Prediction App

This project is a Flask-based web application that predicts the severity of an event based on environmental and traffic-related data. It uses a machine learning model to make predictions based on the provided input parameters.

## Requirements

Before running the application, make sure you have the following installed:

- Python 3.x
- Docker (optional, for containerized deployment)

## Setup Instructions

### Local Setup (without Docker)

1. **Create a virtual environment:**
   ```bash
   python3 -m venv venv
   ```

2. **Activate the virtual environment:**

   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     .\venv\Scripts\activate
     ```

3. **Install required dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Flask app:**
   ```bash
   python backend.py
   ```

   The app will now be running locally at [http://127.0.0.1:5000](http://127.0.0.1:5000).

---

### Docker Setup

Alternatively, you can run the application using Docker:

1. **Build the Docker image:**
   ```bash
   docker build -t flask-severity-app .
   ```

2. **Run the Docker container:**
   ```bash
   docker run -p 5000:5000 flask-severity-app
   ```

   The app will be available at [http://127.0.0.1:5000](http://127.0.0.1:5000).

---

## API Endpoint

### Predict Severity

To get a severity prediction, send a POST request to the `/predict` endpoint with the following JSON payload.

**URL:**

`http://127.0.0.1:5000/predict`

**Request Body Example:**

```json
{
  "Temperature(F)": 75.0,
  "Wind_Chill(F)": 70.0,
  "Humidity(%)": 50.0,
  "Pressure(in)": 29.92,
  "Visibility(mi)": 10.0,
  "Wind_Direction": "NW",
  "Wind_Speed(mph)": 5.0,
  "Precipitation(in)": 0.0,
  "Weather_Condition": "Clear",
  "Amenity": false,
  "Bump": false,
  "Crossing": true,
  "Give_Way": false,
  "Junction": true,
  "No_Exit": false,
  "Railway": false,
  "Roundabout": false,
  "Station": false,
  "Stop": true,
  "Traffic_Calming": false,
  "Traffic_Signal": true,
  "Turning_Loop": false
}
```

---

## Response Format

The API will return a JSON response with the prediction result.

**Example Response:**

```json
{
  "severity": "3.8043834"
}
```
