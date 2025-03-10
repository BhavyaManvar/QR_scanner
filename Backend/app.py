import os
import cv2
import pyzbar.pyzbar as pyzbar
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

payload_files = [
    "phishing_url_openphish.txt",
    "confirmed_malicious_urls.txt",
    "high_risk_urls.txt",
    "legit_urls.txt",
    "malicious_urls.txt"
]

def load_payload_data():
    payload_data = {}
    for file in payload_files:
        if os.path.exists(file):
            with open(file, "r") as f:
                urls = set(line.strip() for line in f if line.strip())
            payload_data[file] = urls
    return payload_data

payload_data = load_payload_data()

def classify_url(url):
    for file, url_set in payload_data.items():
        if url in url_set:
            if "legit_urls.txt" in file:
                return {"riskLevel": "low", "message": "✅ Safe"}
            else:
                return {"riskLevel": "high", "message": f"🚨 Malicious (Found in {file})"}
    return {"riskLevel": "medium", "message": "⚠️ Suspicious (Not found in known lists)"}

def decode_qr(image_path):
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    decoded_objects = pyzbar.decode(gray)

    result = []
    for obj in decoded_objects:
        extracted_url = obj.data.decode("utf-8")
        classification = classify_url(extracted_url)
        result.append({
            "decoded_text": extracted_url,
            "riskLevel": classification["riskLevel"],
            "message": classification["message"]
        })

    return result

@app.route("/scan_qr", methods=["POST"])
def scan_qr():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    allowed_extensions = {"png", "jpg", "jpeg"}
    if "." in file.filename and file.filename.rsplit(".", 1)[1].lower() not in allowed_extensions:
        return jsonify({"error": "Invalid file format. Only PNG, JPG, and JPEG allowed."}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    results = decode_qr(file_path)
    os.remove(file_path)

    if results:
        return jsonify({"status": "success", "results": results})
    else:
        return jsonify({"status": "failed", "error": "No QR code found"}), 400

@app.route("/process_qr", methods=["POST"])
def process_qr():
    data = request.json
    qr_data = data.get("qrData")

    if not qr_data:
        return jsonify({"error": "No QR code data provided"}), 400

    classification = classify_url(qr_data)

    return jsonify({
        "status": "success",
        "results": [{
            "decoded_text": qr_data,
            "riskLevel": classification["riskLevel"],
            "message": classification["message"]
        }]
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
