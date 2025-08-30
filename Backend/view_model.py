import tensorflow as tf
from tensorflow import keras

# Path to your model file
model_path = 'second_cnn_final_model.keras'  # <-- Replace this with your actual model filename

# Load the model
model = keras.models.load_model(model_path)

# Print model summary
print("\n=== Model Summary ===")
model.summary()

# Print model input and output shapes
print("\n=== Input and Output Shapes ===")
print("Input shape:", model.input_shape)
print("Output shape:", model.output_shape)

# List all layers and their configurations
print("\n=== Layer Details ===")
for layer in model.layers:
    print(f"Layer name: {layer.name}")
    print(f"Layer type: {type(layer).__name__}")
    print(f"Layer config: {layer.get_config()}")
    print()

# List all weights and their shapes
print("\n=== Weights and Shapes ===")
for weight in model.weights:
    print(f"{weight.name}: {weight.shape}")
