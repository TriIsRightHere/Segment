import subprocess
file_path = 'uploads/multiobjects.jpg'
subprocess.run(['python', '../scripts/amg.py', '--checkpoint', '../sam_vit_h_4b8939.pth', '--model-type', 'vit_h' , '--input', file_path, '--output', './output'], capture_output=True)
print('hello 1')
#python scripts/export_onnx_model.py --checkpoint <path/to/checkpoint> --model-type <model_type> --output <path/to/output>
#python scripts/export_onnx_model.py --checkpoint ../sam_vit_h_4b8939.pth --model-type vit_h --output ../output1

subprocess.run(['python', '../scripts/export_onnx_model.py', '--checkpoint', '../sam_vit_h_4b8939.pth', '--model-type', 'vit_h' , '--input', file_path, '--output', './output_2'], capture_output=True)
print('hello 2')