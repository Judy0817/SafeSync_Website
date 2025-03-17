
# Model and Data Processing Flowchart

```plaintext
+-------------------+
| 1. Load Data      |
+-------------------+
        |
        v
+---------------------------+
| 2. Preprocess Data         |
|    - Select Columns        |
|    - Remove Missing Data   |
|    - Categorical Features: |
|      - One-hot encode      |
|    - Numerical Features:   |
|      - Normalize (Scaling) |
|    - Boolean Features:     |
|      - Convert to Numeric  |
+---------------------------+
        |
        v
+--------------------------+
| 3. Balance Classes       |
|   - Resample Data        |
|   - Shuffle Data         |
+--------------------------+
        |
        v
+--------------------------+
| 4. Split Data            |
|   - Train-Test Split     |
+--------------------------+
        |
        v
+---------------------------+
| 5. Define Model           |
|   - Input Layer:          |
|     - Accepts all features|
|     - Shape = (X_train.shape[1],) |
|   - Hidden Layers:        |
|     - Layer 1: 512 neurons, ReLU, L2 regularization, Dropout 30% |
|     - Layer 2: 256 neurons, ReLU, L2 regularization, Dropout 30% |
|     - Layer 3: 128 neurons, ReLU, L2 regularization, Dropout 30% |
|     - Layer 4: 64 neurons, ReLU, L2 regularization, Dropout 20% |
|   - Output Layer:         |
|     - 1 neuron, Linear activation (Regression) |
+---------------------------+
        |
        v
+--------------------------+
| 6. Compile Model         |
|   - Optimizer: Adam      |
|   - Learning Rate: 0.00001|
|   - Loss Function: MSE   |
|   - Metrics: MAE         |
+--------------------------+
        |
        v
+--------------------------+
| 7. Train Model           |
|   - Train for 50 epochs  |
|   - Use 20% validation   |
|   - Batch Size = 32      |
+--------------------------+
        |
        v
+--------------------------+
| 8. Evaluate Model        |
|   - Test Loss: MSE       |
|   - Test MAE: Mean Absolute Error |
+--------------------------+
        |
        v
+--------------------------+
| 9. Save Model            |
|   - Save model to file   |
|   - Save scaler & encoder|
+--------------------------+
        |
        v
+--------------------------+
| 10. Use Model for        |
|     Predictions          |
|   - Load Model, Scaler, and Encoder |
+--------------------------+
```

