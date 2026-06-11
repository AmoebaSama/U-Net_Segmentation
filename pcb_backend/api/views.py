import numpy as np
import tensorflow as tf
import cv2
import base64
from rest_framework.decorators import api_view
from rest_framework.response import Response

model = tf.keras.models.load_model("pcb_segmentation_model.h5")

CLASS_NAMES = {
    0: "background",
    1: "exc_solder",
    2: "good",
    3: "no_good",
    4: "poor_solder",
    5: "spike",
}

LABEL_MAP = {
    "exc_solder": "Excess Solder",
    "no_good": "No Good Joint",
    "poor_solder": "Poor Solder",
    "spike": "Solder Spike",
}

@api_view(["POST"])
def predict(request):
    image_data = request.data.get("image")
    image_data = image_data.split(",")[1]

    img_bytes = base64.b64decode(image_data)
    img_array = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (256, 256)).astype(np.float32) / 255.0

    pred = model.predict(np.expand_dims(img, axis=0))
    pred_mask = np.argmax(pred[0], axis=-1)

    classes_found = np.unique(pred_mask).tolist()
    defect_classes = [CLASS_NAMES[c] for c in classes_found if c not in (0, 2)]

    primary = defect_classes[0] if defect_classes else "good"
    label = LABEL_MAP.get(primary, "No Defect")
    confidence = round(float(pred[0].max()) * 100)

    defects = []
    for i, cls in enumerate(defect_classes):
        region = np.where(pred_mask == list(CLASS_NAMES.keys())[list(CLASS_NAMES.values()).index(cls)])
        if len(region[0]) > 0:
            y_center = round(float(np.mean(region[0])) / 256 * 100)
            x_center = round(float(np.mean(region[1])) / 256 * 100)
            defects.append({
                "id": i + 1,
                "type": LABEL_MAP.get(cls, cls),
                "x": x_center,
                "y": y_center,
                "size": 80
            })

    return Response({
        "prediction": "Good" if not defect_classes else "Defective",
        "defect": label,
        "confidence": confidence,
        "recommendation": "Solder joint passed inspection." if not defect_classes else f"Detected {label}. Please reinspect this joint.",
        "defects": defects,
    })