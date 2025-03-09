from flask import Flask, request, jsonify
import os
import cv2
import pyzbar.pyzbar as pyzbar
import re
import requests

app = Flask(__name__)

# 🔴 Replace with YOUR Google Safe Browsing API Key
GOOGLE_SAFE_BROWSING_API_KEY = "AIzaSyD763rh3r_SOGCs6XRFLKcQbTk7Bxy9BLI"

# Known Malicious Patterns (for XSS, SQLi)
malicious_keywords = ["<script>", "alert(", "onerror=", "javascript:", "SELECT * FROM", "DROP TABLE", "UNION SELECT"]

def check_google_safe_browsing(url):
    """Check URL using Google Safe Browsing API"""
    safe_browsing_url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={"AIzaSyD763rh3r_SOGCs6XRFLKcQbTk7Bxy9BLI"}"
    payload = {
        "client": {
            "clientId": "yourcompany",
            "clientVersion": "1.0"
        },
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}]
        }
    }

    response = requests.post(safe_browsing_url, json=payload)
    result = response.json()
    
    if "matches" in result:
        return "⚠️ Malicious URL Detected by Google Safe Browsing!"
    
    return "✅ No threats detected"

def detect_vulnerabilities(decoded_text):
    """Check if QR content contains vulnerabilities."""
    issues = []
    
    if any(keyword.lower() in decoded_text.lower() for keyword in malicious_keywords):
        issues.append("⚠️ Possible XSS Injection Detected!")

    if re.search(r"(SELECT\s+\*\s+FROM|DROP\s+TABLE|UNION\s+SELECT)", decoded_text, re.IGNORECASE):
        issues.append("⚠️ Possible SQL Injection Detected!")

    if decoded_text.startswith("http://") or decoded_text.startswith("https://"):
        url_issue = check_google_safe_browsing(decoded_text)
        issues.append(url_issue)

    return issues

@app.route('/scan_qr', methods=['POST'])
def scan_qr():
    """Scans uploaded QR image."""
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    filename = os.path.join("uploads", file.filename)
    file.save(filename)

    image = cv2.imread(filename)
    decoded_objects = pyzbar.decode(image)

    if not decoded_objects:
        return jsonify([{"decoded_text": "No QR Code detected"}])

    results = []
    for obj in decoded_objects:
        qr_content = obj.data.decode("utf-8")
        issues = detect_vulnerabilities(qr_content)

        results.append({
            "decoded_text": qr_content,
            "vulnerabilities": issues if issues else ["✅ No threats detected"]
        })

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
