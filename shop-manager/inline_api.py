import json
import os

json_path = os.path.join('frontend', 'public', 'data.json')
api_path = os.path.join('frontend', 'netlify', 'functions', 'api.js')

if not os.path.exists(json_path):
    print(f"Error: {json_path} not found.")
    exit(1)

if not os.path.exists(api_path):
    print(f"Error: {api_path} not found.")
    exit(1)

# Load JSON data
with open(json_path, 'r', encoding='utf-8') as f:
    db_data = json.load(f)

# Read the original api.js code
with open(api_path, 'r', encoding='utf-8') as f:
    api_code = f.read()

# Replace the require statement with the inline JSON data
target = "const db = require('./data.json');"
if target not in api_code:
    print("Error: Could not find the require('./data.json') statement in api.js.")
    exit(1)

inlined_db = f"const db = {json.dumps(db_data, indent=2, ensure_ascii=False)};"
new_api_code = api_code.replace(target, inlined_db)

# Write to the standalone destination file
standalone_path = os.path.join('frontend', 'netlify', 'functions', 'api.js') # Overwrite api.js so it is standalone
with open(standalone_path, 'w', encoding='utf-8') as f:
    f.write(new_api_code)

print(f"Successfully created standalone, self-contained API function at {standalone_path}!")
print("This single file now contains all products, suppliers, customers, invoices, and API route handlers.")
