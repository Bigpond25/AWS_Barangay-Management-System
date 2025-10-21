import os
import re

controllers = [
    "app/Http/Controllers/Api/ActivityLogController.php",
    "app/Http/Controllers/Api/AppointmentController.php",
    "app/Http/Controllers/Api/DashboardController.php",
    "app/Http/Controllers/Api/DocumentController.php",
    "app/Http/Controllers/Api/FileUploadController.php",
    "app/Http/Controllers/Api/HouseholdController.php",
    "app/Http/Controllers/Api/ImportController.php",
    "app/Http/Controllers/Api/ResidentController.php",
    "app/Http/Controllers/Api/StorageController.php",
    "app/Http/Controllers/Api/UserController.php",
]

log_import = "use Illuminate\\Support\\Facades\\Log;"

for file_path in controllers:
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if import already exists
    if log_import in content:
        print(f"Already has import: {file_path}")
        continue
    
    # Find the last "use" statement and add after it
    lines = content.split('\n')
    new_lines = []
    last_use_index = -1
    
    for i, line in enumerate(lines):
        if line.strip().startswith('use ') and ';' in line:
            last_use_index = i
    
    if last_use_index != -1:
        for i, line in enumerate(lines):
            new_lines.append(line)
            if i == last_use_index:
                new_lines.append('use Illuminate\\Support\\Facades\\Log;')
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        
        print(f"✓ Fixed: {file_path}")
    else:
        print(f"⚠ Could not find use statements in: {file_path}")

print("\nDone!")
