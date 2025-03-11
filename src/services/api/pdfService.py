from flask import Flask, request, jsonify
import os
from flask_cors import CORS
from langchain.document_loaders import WebBaseLoader 
from langchain_community.document_loaders import PyMuPDFLoader
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # Limit file size to 16 MB

# Function to load web content
def load_web_content(url):
    loader = WebBaseLoader(url)
    documents = loader.load()
    return [{"content": doc.page_content, "metadata": doc.metadata} for doc in documents]

# Function to read PDF content
def read_pdf(file_path):
    loader = PyMuPDFLoader(file_path)
    data = loader.load()
    data_readpdf = [
        {"page_content": doc.page_content, "metadata": doc.metadata}
        for doc in data
    ]
    print("Read success") if data_readpdf else print("No data extracted")
    return data_readpdf

# Route to handle URL-based content loading
@app.route('/api/load_web', methods=['POST'])
def api_load_web():
    data = request.json
    if not data or "url" not in data:
        return jsonify({"error": "URL is required"}), 400

    try:
        url = data["url"]
        content = load_web_content(url)
        return jsonify({"status": "success", "data": content}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Route to handle PDF file uploads
@app.route('/api/upload_pdf', methods=['POST'])
def api_upload_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:
        # Secure the filename and save the file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)

        # Read the PDF content
        content = read_pdf(file_path)
        return jsonify({"status": "success", "data": content}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
    
@app.route('/api/insert', methods=['POST'])
def api_insert():
    try:
        data = request.json  # รับ JSON จาก request
        if not data:
            return "No data received", 400

        print(data["contentData"][0])
        # บันทึกข้อมูลลงไฟล์ response.text
        with open("./src/services/api/response.text", "w", encoding="utf-8") as file:
            file.write(str(data))  

        return "Data saved to response.text", 200

    except Exception as e:
        return str(e), 500  # ส่ง error message กลับถ้ามีปัญหา
    
# @app.route('/api/update', methods=['POST'])
# def update_log():
#     data = request.json
#     print("Received Logs:", data)
#     return jsonify({"message": "Logs saved successfully!"})
    

if __name__ == '__main__':
    app.run(port=3500)
