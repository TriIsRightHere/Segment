from flask import Flask, request, jsonify, send_from_directory, make_response
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
import subprocess

app = Flask(__name__)
UPLOAD_FOLDER = './uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
cors = CORS(app, resources={r"*": {"origins": "http://localhost:8080"}})

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    print(file_path)
    subprocess.run(['python', '../scripts/amg.py', '--checkpoint', '../sam_vit_h_4b8939.pth', '--model-type', 'vit_h' , '--input', file_path, '--output', './output'], capture_output=True)
    print("mask generated")
    subprocess.run(['python', '../scripts/embedded_export.py', '--input', file_path], check=True)
    print("embed generated")
    image_url = request.host_url.rstrip('/') + '/uploads/' + filename
    npy_url = request.host_url.rstrip('/') + '/uploads/embedded.npy'  
    return jsonify({
        'message': 'File uploaded and processed successfully',
        'image_url': image_url,
        'npy_url': npy_url
    }), 200


@app.route('/uploads/<filename>')

def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
