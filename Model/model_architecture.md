# Traffic Accident Severity Prediction Model

## 1. Data Loading and Preprocessing

### Data Loading:
The data is loaded from a CSV file (`US_Accidents_March23.csv`) using `pandas.read_csv`. This dataset likely contains information on traffic accidents, such as severity, temperature, wind speed, etc.

### Column Selection:
The script removes many columns that are not relevant for predicting the target variable (Severity). Only the columns listed in the script (such as Severity, Temperature(F), Wind_Speed(mph), etc.) are kept for further analysis.

### Missing Data:
Any rows with missing values (`NaN`) are dropped using `dropna()`, ensuring the model doesn't train on incomplete data.

### Class Balancing:
The Severity column is the target variable, and it is likely imbalanced (some severity levels are underrepresented).
The script resamples the data using the `resample` function from `sklearn.utils` to balance the classes by:
- Duplicating the rows for underrepresented classes (to increase their size).
- Removing rows for overrepresented classes (to decrease their size). 
This ensures each class has the same number of instances, making the model training fairer.

## 2. Feature Engineering

### Categorical Features:
- `Wind_Direction` and `Weather_Condition` are categorical variables, meaning they represent categories or labels rather than numerical values.
- These are encoded into one-hot vectors (binary columns for each category) using `OneHotEncoder` from `sklearn`.

### Numerical Features:
- Columns like `Temperature(F)`, `Humidity(%)`, `Visibility(mi)`, etc., are numerical.
- These features are normalized (scaled) using `StandardScaler`, which adjusts the values to have a mean of 0 and a standard deviation of 1. This is important for deep learning models to ensure efficient training.

### Boolean Features:
- Some columns (like `Amenity`, `Bump`, etc.) are boolean (True/False).
- These are converted into integer values (1 for True and 0 for False) to make them usable in machine learning models.

## 3. Data Split into Training and Testing

The dataset is split into training (`X_train`, `y_train`) and testing (`X_test`, `y_test`) sets using `train_test_split` from `sklearn`. 80% of the data is used for training, and 20% is held out for testing.

## 4. Model Architecture

The model is built using TensorFlow/Keras in a Sequential architecture with multiple layers.

### Input Layer:
- The model expects input data with a shape of `(X_train.shape[1],)` (the number of features in the dataset).
- The first hidden layer has 512 neurons with the ReLU activation function, and L2 regularization is applied to prevent overfitting.
- Dropout (30%) is applied to prevent overfitting by randomly setting some of the input units to 0 during training.

### Hidden Layers:
The model has four hidden layers:
- **Second Hidden Layer**: 256 neurons, ReLU activation, L2 regularization, and dropout.
- **Third Hidden Layer**: 128 neurons, ReLU activation, L2 regularization, and dropout.
- **Fourth Hidden Layer**: 64 neurons, ReLU activation, L2 regularization, and dropout (but with a lower dropout rate of 20%).

The layers progressively decrease in size as we go deeper into the network. This structure helps the network learn more abstract features of the data in deeper layers.

### Batch Normalization:
- Each hidden layer is followed by a `BatchNormalization` layer. 
- This layer normalizes the output of the previous layer, which can help improve training speed and stability by reducing internal covariate shift.

### Output Layer:
- The output layer has 1 neuron with a linear activation function. 
- This is because the model is predicting a continuous variable (`Severity`). In a classification task, we might use softmax or sigmoid, but since the target is a continuous value, a linear activation function is used.

## 5. Model Compilation

### Optimizer:
- The model uses the Adam optimizer with a very small learning rate (0.00001). Adam is a popular optimization algorithm that adjusts learning rates during training.

### Loss Function:
- The loss function used is Mean Squared Error (MSE). This is common for regression tasks, where the model predicts continuous values and the objective is to minimize the squared difference between predicted and actual values.

### Metrics:
- The model uses Mean Absolute Error (MAE) as a metric, which gives an indication of how close the predictions are to the actual values.

## 6. Model Training

The model is trained for 50 epochs, with a batch size of 32. During training, it will use 20% of the training data as a validation set to check performance after each epoch. This helps monitor if the model starts overfitting the training data.

- `Verbose=1` means you’ll see a progress bar showing training progress.

## 7. Model Evaluation

After training, the model is evaluated on the test set (`X_test` and `y_test`). The evaluation results show the test loss and test MAE, giving an indication of the model's performance on unseen data.

## 8. Model Saving

After training, the model is saved to a file (`severity_prediction_model.h5`) so it can be loaded and used for future predictions without retraining.

## 9. Scaler and Encoder Saving

The scaler (`scaler.pkl`) and encoder (`encoder.pkl`) are also saved. These are necessary to preprocess new data before making predictions, ensuring that the model receives data in the same format as the training data.

## Key Points of the Model:

- **Regression Task**: The model is predicting the Severity of accidents, which is a continuous variable, so the output is a single value.
- **Deep Neural Network**: The model is deep, with multiple hidden layers, regularization (L2), and dropout to prevent overfitting and help generalize to new data.
- **Class Balancing**: The class imbalance in the target variable is addressed through resampling to ensure each class has equal representation.
- **Normalization and Encoding**: Features are normalized (for numerical) and one-hot encoded (for categorical), making them suitable for input into a neural network.

## Summary:

This is a deep neural network model designed to predict the severity of traffic accidents based on various features like temperature, wind speed, weather condition, and traffic signal presence. The model is trained on preprocessed data, with class balancing, feature scaling, and regularization techniques applied to improve its generalization and prevent overfitting.
