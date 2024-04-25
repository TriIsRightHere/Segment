# from flask import Flask, request, jsonify
# from werkzeug.utils import secure_filename
# from flask_cors import CORS
# import os
# import subprocess

# app = Flask(__name__)
# UPLOAD_FOLDER = './uploads'
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# cors = CORS(app, resources={r"*": {"origins": "http://localhost:3000"}})

# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# @app.route('/upload', methods=['POST'])
# def upload_file():
#     if 'file' not in request.files:
#         return jsonify({'message': 'No file part'}), 400
#     file = request.files['file']
#     if file.filename == '':
#         return jsonify({'message': 'No selected file'}), 400
#     if file:
#         filename = secure_filename(file.filename)
#         file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
#         file.save(file_path)
        
#         print(file_path)
#         subprocess.run(['python', '../scripts/amg.py', '--checkpoint', '../sam_vit_h_4b8939.pth', '--model-type', 'vit_h' , '--input', file_path, '--output', './output'], capture_output=True)
#         print("hello maskgen")
#         subprocess.run(['python', '../scripts/embedded_export.py', '--input', file_path])
#         print("hello embedded")
#         return jsonify({'message': f'File {filename} uploaded successfully'}), 200




#     #subprocess.call(['python', '../scripts/amg.py',  '--checkpoint ../sam_vit_h_4b8939.pth', '--model-type vit_h' , '--input ' + file_path, '--output ./output'],capture_output=True, text=True)
#     #subprocess.run(['python', '../scripts/embedded_export.py', '--input', '../sam-be/uploads'])
   

# if __name__ == '__main__':
#     app.run(debug=True, host='127.0.0.1', port=5000)
    
from flask import Flask, request, jsonify, send_from_directory, send_file
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
import subprocess
import io

app = Flask(__name__)
UPLOAD_FOLDER = './uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
cors = CORS(app, resources={r"*": {"origins": "http://localhost:3000"}})

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
image_path = ''
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        print(file_path)
        subprocess.run(['python', '../scripts/amg.py', '--checkpoint', '../sam_vit_h_4b8939.pth', '--model-type', 'vit_h' , '--input', file_path, '--output', './output'], capture_output=True)
        print("Mask are generated")
        subprocess.run(['python', '../scripts/embedded_export.py', '--input', file_path])
        print("Embedded export completed")
        file_url = request.host_url + 'uploads/' + filename
        npy_url = request.host_url + 'uploads/'
        image_path = file_url
        return jsonify({'message': 'File uploaded and processed successfully', 'fileUrl': file_url}), 200

# @app.route('/get-image')
# def get_image_in_memory():
#     with open("path/to/your/image.jpg", "rb") as image_file:
#         image_bytes = image_file.read()
#     return send_file(
#         io.BytesIO(image_bytes),
#         mimetype='image/jpeg'
#     )

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)


#subprocess.call(['python', '../scripts/amg.py',  '--checkpoint ../sam_vit_h_4b8939.pth', '--model-type vit_h' , '--input ' + file_path, '--output ./output'],capture_output=True, text=True)
#subprocess.run(['python', '../scripts/embedded_export.py', '--input', '../sam-be/uploads'])