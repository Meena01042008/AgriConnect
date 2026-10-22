
import json
from pathlib import Path
from io import BytesIO

import numpy as np
import tensorflow as tf
from flask import Flask, jsonify, request
from PIL import Image

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "plant_disease_model.keras"
CLASS_PATH = BASE_DIR / "class_names.json"

print("Loading plant disease model...")

model = tf.keras.models.load_model(MODEL_PATH)

with open(CLASS_PATH, "r", encoding="utf-8") as f:
    class_names = json.load(f)

print("Model loaded successfully!")
print(f"Number of classes: {len(class_names)}")


def get_treatment(disease):
    treatments = {
        "Early_blight": (
            "Remove affected leaves, avoid wetting foliage, "
            "and use a locally approved fungicide if needed."
        ),
        "Late_blight": (
            "Isolate affected plants, remove infected parts, "
            "and seek local agricultural advice promptly."
        ),
        "Bacterial_spot": (
            "Avoid handling wet plants, remove badly affected "
            "material, and seek local agricultural advice."
        ),
        "Leaf_Mold": (
            "Improve ventilation, avoid overhead watering, "
            "and remove severely affected leaves."
        ),
        "Septoria_leaf_spot": (
            "Remove infected leaves, reduce leaf wetness, "
            "and avoid spreading plant debris."
        ),
        "healthy": (
            "No disease detected by this model. Continue "
            "regular monitoring and good plant care."
        ),
        "Background_without_leaves": (
            "The image may not show a clear leaf. Upload a "
            "clear, close-up photo of one leaf in good lighting."
        ),
    }

    for key, advice in treatments.items():
        if key.lower() in disease.lower():
            return advice

    return (
        "Follow good plant hygiene and seek advice from a "
        "local agricultural expert before applying treatment."
    )


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "AgriConnect Plant Disease ML",
        "modelLoaded": True,
        "classes": len(class_names)
    })


@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({
            "error": "Please upload an image using the image field"
        }), 400

    try:
        image_file = request.files["image"]
        image = Image.open(
            BytesIO(image_file.read())
        ).convert("RGB")
        image = image.resize((224, 224))

        image_array = np.asarray(image, dtype=np.float32)
        image_array = tf.keras.applications.mobilenet_v2.preprocess_input(
            image_array
        )
        image_array = np.expand_dims(image_array, axis=0)

        predictions = model.predict(image_array, verbose=0)[0]
        predicted_index = int(np.argmax(predictions))
        predicted_class = class_names[predicted_index]
        confidence = float(predictions[predicted_index])

        if predicted_class == "Background_without_leaves":
            disease_name = "Unable to identify a clear leaf"
        else:
            parts = predicted_class.split("___", 1)
            disease_name = (
                f"{parts[0]} - {parts[1].replace('_', ' ')}"
                if len(parts) == 2
                else predicted_class.replace("_", " ")
            )

        treatment = get_treatment(predicted_class)

        return jsonify({
            "predictedClass": predicted_class,
            "diseaseName": disease_name,
            "confidence": round(confidence * 100, 2),
            "treatment": treatment,
            "analysis": (
                f"Prediction: {disease_name}. "
                f"Model confidence: {confidence * 100:.2f}%."
            ),
            "status": "success",
            "mode": "LOCAL_ML",
            "imageSentToExternalProvider": False
        })

    except Exception as e:
        app.logger.exception("Prediction failed")
        return jsonify({
            "error": "Unable to analyze image",
            "details": str(e)
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5001)), debug=False)
